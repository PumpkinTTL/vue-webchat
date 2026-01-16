import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MessageResponse, MessageReadResponse } from '@/types/websocket'

// 消息状态
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

// 消息类型
export interface ChatMessageItem {
  id: number | string
  type: 'text' | 'image' | 'voice' | 'video' | 'file' | 'system'
  text: string
  time: Date
  isOwn: boolean
  sender?: {
    id: number
    nickname: string
    avatar: string
  }
  username?: string
  status?: MessageStatus
  readCount?: number
  // 图片
  imageUrl?: string
  // 视频消息
  videoUrl?: string
  videoThumbnail?: string
  videoDuration?: number
  // 文件消息
  fileName?: string
  fileSize?: number
  fileExtension?: string
  fileUrl?: string
  // 引用回复
  replyTo?: any
  // 好感度信息
  intimacy?: {
    currentExp: number
    currentLevel: number
  }
  // 动画标记
  isNew?: boolean
  // 动画唯一标识（用于 v-for key，避免 id 变化导致重新渲染）
  animationKey?: string
}

// 房间信息
export interface RoomInfo {
  id: number
  name: string
  description?: string
  totalUsers: number
  onlineUsers: number
  isPrivate: boolean
  isLocked?: boolean
}

export const useChatStore = defineStore('chat', () => {
  // ==================== 状态 ====================
  
  const messages = ref<ChatMessageItem[]>([])
  const currentRoom = ref<RoomInfo | null>(null)
  const loading = ref(false)
  const hasMore = ref(false)
  const loadingMore = ref(false)

  // ==================== 计算属性 ====================
  
  const messageCount = computed(() => messages.value.length)

  // ==================== 方法 ====================

  /**
   * 设置当前房间
   */
  function setCurrentRoom(room: RoomInfo | null) {
    currentRoom.value = room
    if (!room) {
      messages.value = []
    }
  }

  /**
   * 更新房间在线人数
   */
  function updateRoomOnlineCount(count: number) {
    if (currentRoom.value) {
      currentRoom.value.onlineUsers = count
    }
  }

  /**
   * 更新房间锁定状态
   */
  function updateRoomLockStatus(isLocked: boolean) {
    if (currentRoom.value) {
      currentRoom.value.isLocked = isLocked
    }
  }

  /**
   * 设置消息列表
   */
  function setMessages(newMessages: ChatMessageItem[]) {
    messages.value = newMessages
  }

  /**
   * 添加消息
   */
  function addMessage(message: ChatMessageItem) {
    messages.value.push(message)
  }

  /**
   * 添加系统消息
   */
  function addSystemMessage(text: string) {
    messages.value.push({
      id: Date.now(),
      type: 'system',
      text,
      time: new Date(),
      isOwn: false
    })
  }

  /**
   * 从 WebSocket 消息转换为本地消息格式
   */
  function convertWsMessage(data: MessageResponse, currentUserId: number): ChatMessageItem {
    const isOwn = data.from_user_id === currentUserId
    
    const message: ChatMessageItem = {
      id: data.message_id,
      type: data.message_type,
      text: data.content,
      time: new Date(),
      isOwn,
      sender: {
        id: data.from_user_id,
        nickname: data.from_nickname,
        avatar: data.from_avatar
      },
      username: data.from_nickname,
      status: isOwn ? 'sent' : undefined,
      isNew: true
    }

    // 视频消息
    if (data.message_type === 'video') {
      message.videoUrl = data.video_url
      message.videoThumbnail = data.video_thumbnail
      message.videoDuration = data.video_duration
    }

    // 文件消息
    if (data.message_type === 'file') {
      message.fileName = data.file_name
      message.fileSize = data.file_size
      message.fileExtension = data.file_extension
      message.fileUrl = data.file_url
    }

    // 引用回复
    if (data.reply_to) {
      message.replyTo = data.reply_to
    }

    // 好感度信息
    if (data.intimacy) {
      message.intimacy = {
        currentExp: data.intimacy.current_exp,
        currentLevel: data.intimacy.current_level
      }
    }

    return message
  }

  /**
   * 处理收到的 WebSocket 消息
   */
  function handleWsMessage(data: MessageResponse, currentUserId: number) {
    const message = convertWsMessage(data, currentUserId)
    addMessage(message)
  }

  /**
   * 更新消息状态
   */
  function updateMessageStatus(messageId: number, status: MessageStatus) {
    const message = messages.value.find(m => m.id === messageId)
    if (message) {
      message.status = status
    }
  }

  /**
   * 处理已读回执
   */
  function handleMessageRead(data: MessageReadResponse) {
    // 只处理自己发送的消息被别人读取的情况
    data.message_ids.forEach(messageId => {
      const message = messages.value.find(m => m.id === messageId)
      if (message && message.isOwn) {
        message.status = 'read'
        message.readCount = (message.readCount || 0) + 1
      }
    })
  }

  /**
   * 删除消息（焚毁）
   */
  function removeMessage(messageId: number) {
    const index = messages.value.findIndex(m => m.id === messageId)
    if (index !== -1) {
      messages.value.splice(index, 1)
    }
  }

  /**
   * 清空消息
   */
  function clearMessages() {
    messages.value = []
  }

  /**
   * 在列表前面插入历史消息
   */
  function prependMessages(historyMessages: ChatMessageItem[]) {
    messages.value = [...historyMessages, ...messages.value]
  }

  /**
   * 清除消息的新消息标记
   */
  function clearNewFlag(messageId: number) {
    const message = messages.value.find(m => m.id === messageId)
    if (message) {
      message.isNew = false
    }
  }

  return {
    // 状态
    messages,
    currentRoom,
    loading,
    hasMore,
    loadingMore,
    
    // 计算属性
    messageCount,
    
    // 方法
    setCurrentRoom,
    updateRoomOnlineCount,
    updateRoomLockStatus,
    setMessages,
    addMessage,
    addSystemMessage,
    convertWsMessage,
    handleWsMessage,
    updateMessageStatus,
    handleMessageRead,
    removeMessage,
    clearMessages,
    prependMessages,
    clearNewFlag
  }
})
