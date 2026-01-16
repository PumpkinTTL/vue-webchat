import { onMounted, onUnmounted } from 'vue'
import { useWebSocketStore } from '@/store/websocket'
import { useChatStore } from '@/store/chat'
import type { IntimacyInfo } from '@/types/websocket'

/**
 * 聊天功能组合式函数
 * 整合 WebSocket 和 Chat Store，提供简洁的 API
 */
export function useChat() {
  const wsStore = useWebSocketStore()
  const chatStore = useChatStore()

  // ==================== 初始化 ====================

  /**
   * 初始化聊天功能
   * 连接 WebSocket 并注册事件处理
   */
  function initChat() {
    // 注册消息处理回调
    wsStore.setOnMessage((data) => {
      if (wsStore.currentUserId) {
        chatStore.handleWsMessage(data, wsStore.currentUserId)
      }
    })

    wsStore.setOnUserJoined((data) => {
      chatStore.addSystemMessage(`${data.nickname} 加入了房间`)
      chatStore.updateRoomOnlineCount(data.online_count)
    })

    wsStore.setOnUserLeft((data) => {
      chatStore.addSystemMessage(`${data.nickname} 离开了房间`)
      chatStore.updateRoomOnlineCount(data.online_count)
    })

    wsStore.setOnMessageRead((data) => {
      chatStore.handleMessageRead(data)
    })

    wsStore.setOnMessageBurned((data) => {
      chatStore.removeMessage(data.message_id)
      chatStore.addSystemMessage(`${data.burned_by_nickname} 焚毁了一条消息`)
    })

    wsStore.setOnRoomCleared((data) => {
      chatStore.clearMessages()
      chatStore.addSystemMessage(`${data.cleared_by_nickname} 清空了聊天记录`)
    })

    wsStore.setOnRoomLockChanged((data) => {
      const isLocked = data.lock === 1
      chatStore.updateRoomLockStatus(isLocked)
      chatStore.addSystemMessage(isLocked ? '房间已锁定' : '房间已解锁')
    })

    wsStore.setOnIntimacyStart(() => {
      chatStore.addSystemMessage('亲密互动开始，请保持在线60秒')
    })

    wsStore.setOnIntimacyComplete(() => {
      chatStore.addSystemMessage('亲密互动完成！')
    })

    wsStore.setOnIntimacyReset(() => {
      chatStore.addSystemMessage('亲密互动已重置')
    })

    wsStore.setOnError((data) => {
      console.error('[Chat] WebSocket 错误:', data.msg)
    })

    wsStore.setOnRoomJoined((_roomId, users) => {
      chatStore.updateRoomOnlineCount(users.length)
    })

    // 连接 WebSocket
    wsStore.connect()
  }

  /**
   * 销毁聊天功能
   */
  function destroyChat() {
    wsStore.disconnect()
  }

  // ==================== 房间操作 ====================

  /**
   * 进入房间
   */
  function enterRoom(roomId: number) {
    // 只加入 WebSocket 房间，不清空消息（消息由 Index.vue 的 loadRoomMessages 管理）
    wsStore.joinRoom(roomId)
  }

  /**
   * 离开当前房间
   */
  function leaveRoom() {
    chatStore.setCurrentRoom(null)
    chatStore.clearMessages()
  }

  // ==================== 消息操作 ====================

  /**
   * 发送文本消息
   * 注意：需要先通过 HTTP API 保存消息，获取 message_id 后再调用此方法广播
   */
  function broadcastMessage(params: {
    message_id: number
    message_type: 'text' | 'image' | 'voice' | 'video' | 'file'
    content: string
    video_url?: string
    video_thumbnail?: string
    video_duration?: number
    file_name?: string
    file_size?: number
    file_extension?: string
    file_url?: string
    reply_to?: number | {
      message_id: number
      content: string
      user_id: number
      nickname: string
      message_type: string
      deleted?: boolean
    }
    intimacy?: IntimacyInfo
  }) {
    return wsStore.sendChatMessage(params)
  }

  /**
   * 发送正在输入状态
   */
  function sendTyping(typing: boolean) {
    return wsStore.sendTyping(typing)
  }

  /**
   * 标记消息已读
   */
  function markMessagesRead(messageIds: number[]) {
    return wsStore.markRead(messageIds)
  }

  /**
   * 焚毁消息
   */
  function burnMessage(messageId: number) {
    // 先从本地删除
    chatStore.removeMessage(messageId)
    // 广播给其他用户
    return wsStore.broadcastMessageBurned(messageId)
  }

  /**
   * 清空房间消息
   */
  function clearRoomMessages(hardDelete: boolean = false) {
    chatStore.clearMessages()
    return wsStore.broadcastRoomCleared(hardDelete)
  }

  /**
   * 切换房间锁定状态
   */
  function toggleRoomLock(lock: boolean) {
    chatStore.updateRoomLockStatus(lock)
    return wsStore.broadcastRoomLockChanged(lock ? 1 : 0)
  }

  /**
   * 重新开始亲密互动
   */
  function restartIntimacy() {
    if (wsStore.currentRoomId) {
      return wsStore.restartIntimacy(wsStore.currentRoomId)
    }
    return false
  }

  // ==================== 生命周期钩子 ====================

  /**
   * 在组件中使用时自动初始化和清理
   */
  function useChatLifecycle() {
    onMounted(() => {
      initChat()
    })

    onUnmounted(() => {
      destroyChat()
    })
  }

  return {
    // Stores
    wsStore,
    chatStore,
    
    // 初始化
    initChat,
    destroyChat,
    useChatLifecycle,
    
    // 房间操作
    enterRoom,
    leaveRoom,
    
    // 消息操作
    broadcastMessage,
    sendTyping,
    markMessagesRead,
    burnMessage,
    clearRoomMessages,
    toggleRoomLock,
    restartIntimacy
  }
}
