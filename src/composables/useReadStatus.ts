/**
 * 已读状态管理组合式函数
 * 使用 IntersectionObserver API 自动检测消息可见性并标记已读
 */
import { ref, nextTick, watch } from 'vue'
import { useChatStore } from '@/store/chat'
import { useWebSocketStore } from '@/store/websocket'

export function useReadStatus() {
  const chatStore = useChatStore()
  const wsStore = useWebSocketStore()

  // IntersectionObserver 实例
  let messageObserver: IntersectionObserver | null = null

  // 批量已读请求聚合
  const pendingReadBatch = ref<number[]>([])
  
  // 离线待同步队列
  const offlineReadQueue = ref<Set<number>>(new Set())

  let batchReadTimer: ReturnType<typeof setTimeout> | null = null
  const BATCH_READ_DELAY = 300 // 300ms 聚合窗口

  /**
   * 实际发送已读标记请求
   */
  const flushReadBatch = () => {
    if (pendingReadBatch.value.length === 0 && offlineReadQueue.value.size === 0) return

    // 合并当前批次和离线队列
    const idsToSend = new Set([...pendingReadBatch.value, ...offlineReadQueue.value])
    pendingReadBatch.value = [] // 清空当前批次

    console.log('[已读] 准备发送已读标记:', Array.from(idsToSend))

    // 通过 WebSocket 发送已读标记
    if (wsStore.isConnected) {
      const idsArray = Array.from(idsToSend)
      wsStore.markMessagesAsRead(idsArray)
      
      // WebSocket 发送成功后立即标记为已读
      idsArray.forEach(id => {
        chatStore.markMessageAsRead(id)
      })
      
      // 清空离线队列
      offlineReadQueue.value.clear()
      
      console.log('[已读] 已发送并标记为已读:', idsArray)
    } else {
      // 如果未连接，加入离线队列
      idsToSend.forEach(id => offlineReadQueue.value.add(id))
      console.warn('[已读] WebSocket 未连接，已加入离线队列等待重连:', offlineReadQueue.value.size)
      
      // 乐观更新：即使未发送成功，也在本地标记为已读，避免重复触发
      // 注意：这里只在 Store 中标记，但不清除 offlineQueue，等待重连后发送
      // 如需启用乐观更新，取消注释以下代码：
      // idsToSend.forEach(id => chatStore.markMessageAsRead(id))
    }
  }

  // 监听 WebSocket 连接状态，重连后自动发送离线队列
  watch(() => wsStore.isConnected, (connected) => {
    if (connected && offlineReadQueue.value.size > 0) {
      console.log('[已读] WebSocket 重连成功，正在同步离线已读状态:', offlineReadQueue.value.size)
      flushReadBatch()
    }
  })

  /**
   * 标记指定消息为已读（批量聚合版）
   */
  const markMessagesAsRead = (messageIds: number[]) => {
    if (!messageIds || messageIds.length === 0) return

    // 过滤掉已经标记过的消息
    const validIds = messageIds.filter(id => {
      if (!id || isNaN(id)) return false
      if (chatStore.isMessageRead(id)) return false
      if (pendingReadBatch.value.includes(id)) return false
      return true
    })

    if (validIds.length === 0) return

    // 加入批量队列
    pendingReadBatch.value.push(...validIds)

    // 重置批量发送定时器
    if (batchReadTimer) {
      clearTimeout(batchReadTimer)
    }
    batchReadTimer = setTimeout(() => {
      flushReadBatch()
    }, BATCH_READ_DELAY)
  }

  /**
   * 初始化 IntersectionObserver
   */
  const initObserver = (container: HTMLElement) => {
    // 清理旧的 observer
    if (messageObserver) {
      messageObserver.disconnect()
    }

    // 检查浏览器支持
    if (!('IntersectionObserver' in window)) {
      console.warn('[已读] 浏览器不支持 IntersectionObserver')
      return
    }

    if (!container) return

    messageObserver = new IntersectionObserver(
      (entries) => {
        // 只在页面可见时处理
        if (document.visibilityState !== 'visible') return

        const visibleUnreadIds: number[] = []
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight

        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          const el = entry.target as HTMLElement
          const msgId = el.getAttribute('data-msg-id')
          if (!msgId) return

          const numericMsgId = Number(msgId)
          if (isNaN(numericMsgId)) return
          if (chatStore.isMessageRead(numericMsgId)) {
            // 已读后停止观察该元素
            messageObserver?.unobserve(el)
            return
          }

          // 查找消息数据，只处理别人的消息
          const msg = chatStore.messages.find(m => m.id == numericMsgId)
          if (!msg || msg.isOwn) {
            messageObserver?.unobserve(el)
            return
          }

          // 智能可见性判断：
          // 1. 元素可见比例超过 50%
          // 2. 或者元素高度超过视口高度的一半，且可见区域高度也超过视口高度的一半（针对超长消息）
          const isVisible = 
            entry.intersectionRatio >= 0.5 || 
            (entry.boundingClientRect.height > viewportHeight * 0.5 && entry.intersectionRect.height > viewportHeight * 0.5)

          if (isVisible) {
            console.log('[已读] 检测到可见的未读消息:', {
              id: numericMsgId,
              type: msg.type,
              ratio: entry.intersectionRatio,
              visibleHeight: entry.intersectionRect.height
            })

            visibleUnreadIds.push(numericMsgId)
            
            // 已读后停止观察该元素
            messageObserver?.unobserve(el)
          }
        })

        if (visibleUnreadIds.length > 0) {
          markMessagesAsRead(visibleUnreadIds)
        }
      },
      {
        root: container,
        rootMargin: '0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] // 细粒度阈值，确保长消息在滚动过程中能触发可见性检查
      }
    )
  }

  /**
   * 观察新消息元素
   */
  const observeMessageElement = (msgId: number, container: HTMLElement) => {
    if (!messageObserver) return

    nextTick(() => {
      const el = container.querySelector(`.msg-row[data-msg-id="${msgId}"]`)
      if (el) {
        messageObserver?.observe(el)
      }
    })
  }

  /**
   * 批量观察消息元素（高效版）
   */
  const observeMessages = (msgIds: number[], container: HTMLElement) => {
    if (!messageObserver || !container) return
    if (!msgIds || msgIds.length === 0) return

    nextTick(() => {
      msgIds.forEach(id => {
        // 二次检查是否已读
        if (chatStore.isMessageRead(id)) return
        
        // 只观察别人的消息 (Store lookup is cheap if we trust the store)
        const msg = chatStore.messages.find(m => m.id == id)
        if (!msg || msg.isOwn) return

        const el = container.querySelector(`.msg-row[data-msg-id="${id}"]`)
        if (el) {
          messageObserver?.observe(el)
        }
      })
    })
  }

  /**
   * 观察所有未读消息（加载消息后调用）
   */
  const observeAllUnreadMessages = (container: HTMLElement) => {
    if (!messageObserver) return

    nextTick(() => {
      const msgElements = container.querySelectorAll('.msg-row[data-msg-id]')
      msgElements.forEach((el) => {
        const msgId = el.getAttribute('data-msg-id')
        if (!msgId) return

        const numericMsgId = Number(msgId)
        if (chatStore.isMessageRead(numericMsgId)) return

        // 只观察别人的消息
        const msg = chatStore.messages.find(m => m.id == numericMsgId)
        if (!msg || msg.isOwn) return

        messageObserver?.observe(el)
      })
    })
  }

  /**
   * 清理 observer
   */
  const cleanup = () => {
    if (messageObserver) {
      messageObserver.disconnect()
      messageObserver = null
    }
    if (batchReadTimer) {
      clearTimeout(batchReadTimer)
      batchReadTimer = null
    }
    pendingReadBatch.value = []
    offlineReadQueue.value.clear()
  }

  return {
    initObserver,
    observeMessageElement,
    observeMessages,
    observeAllUnreadMessages,
    markMessagesAsRead,
    cleanup
  }
}
