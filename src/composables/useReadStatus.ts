/**
 * 已读状态管理组合式函数
 * 使用 IntersectionObserver API 自动检测消息可见性并标记已读
 */
import { ref, nextTick } from 'vue'
import { useChatStore } from '@/store/chat'
import { useWebSocketStore } from '@/store/websocket'

export function useReadStatus() {
  const chatStore = useChatStore()
  const wsStore = useWebSocketStore()

  // IntersectionObserver 实例
  let messageObserver: IntersectionObserver | null = null

  // 批量已读请求聚合
  const pendingReadBatch = ref<number[]>([])
  let batchReadTimer: ReturnType<typeof setTimeout> | null = null
  const BATCH_READ_DELAY = 300 // 300ms 聚合窗口

  /**
   * 实际发送已读标记请求
   */
  const flushReadBatch = () => {
    if (pendingReadBatch.value.length === 0) return

    const idsToSend = [...pendingReadBatch.value]
    pendingReadBatch.value = []

    // 通过 WebSocket 发送已读标记
    if (wsStore.isConnected) {
      wsStore.markMessagesAsRead(idsToSend)
      
      // WebSocket 发送成功后立即标记为已读
      idsToSend.forEach(id => {
        chatStore.markMessageAsRead(id)
      })
    }
  }

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

        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          const el = entry.target as HTMLElement
          const msgId = el.getAttribute('data-msg-id')
          if (!msgId) return

          const numericMsgId = Number(msgId)
          if (isNaN(numericMsgId)) return
          if (chatStore.isMessageRead(numericMsgId)) return

          // 查找消息数据，只处理别人的消息
          const msg = chatStore.messages.find(m => m.id == numericMsgId)
          if (!msg || msg.isOwn) return

          visibleUnreadIds.push(numericMsgId)

          // 已读后停止观察该元素
          messageObserver?.unobserve(el)
        })

        if (visibleUnreadIds.length > 0) {
          markMessagesAsRead(visibleUnreadIds)
        }
      },
      {
        root: container,
        rootMargin: '0px',
        threshold: 0.5 // 50% 可见时触发
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
  }

  return {
    initObserver,
    observeMessageElement,
    observeAllUnreadMessages,
    markMessagesAsRead,
    cleanup
  }
}
