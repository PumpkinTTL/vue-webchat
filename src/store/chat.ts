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
  // 编辑信息
  edited?: boolean
  editedAt?: string
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
  
  // 已读状态管理
  const readMessageIds = ref<Set<number>>(new Set())

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
    const serverUrl = import.meta.env.VITE_SERVER_URL || ''
    
    console.log('[Chat Store] 转换WebSocket消息:', data)
    
    // 为WebSocket消息生成唯一的animationKey，确保动画正常播放
    const animKey = `ws-${data.message_id}-${Date.now()}`
    
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
      isNew: true,
      animationKey: animKey  // 添加动画key，确保Vue正确识别和渲染
    }

    // 图片消息 - 处理URL
    if (data.message_type === 'image') {
      const url = data.content
      console.log('[Chat Store] 图片消息, 原始URL:', url)
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        message.imageUrl = serverUrl + url
      } else {
        message.imageUrl = url
      }
      console.log('[Chat Store] 图片消息, 完整URL:', message.imageUrl)
    }

    // 视频消息 - 处理URL
    if (data.message_type === 'video') {
      // 视频URL
      if (data.video_url) {
        if (!data.video_url.startsWith('http://') && !data.video_url.startsWith('https://')) {
          message.videoUrl = serverUrl + data.video_url
        } else {
          message.videoUrl = data.video_url
        }
      }
      // 缩略图URL
      if (data.video_thumbnail) {
        if (!data.video_thumbnail.startsWith('http://') && !data.video_thumbnail.startsWith('https://')) {
          message.videoThumbnail = serverUrl + data.video_thumbnail
        } else {
          message.videoThumbnail = data.video_thumbnail
        }
      }
      message.videoDuration = data.video_duration
    }

    // 视频消息 - 处理URL
    if (data.message_type === 'video') {
      // 视频URL
      if (data.video_url) {
        if (!data.video_url.startsWith('http://') && !data.video_url.startsWith('https://')) {
          message.videoUrl = serverUrl + data.video_url
        } else {
          message.videoUrl = data.video_url
        }
      }
      // 缩略图URL
      if (data.video_thumbnail) {
        if (!data.video_thumbnail.startsWith('http://') && !data.video_thumbnail.startsWith('https://')) {
          message.videoThumbnail = serverUrl + data.video_thumbnail
        } else {
          message.videoThumbnail = data.video_thumbnail
        }
      }
      message.videoDuration = data.video_duration
    }

    // 文件消息 - 处理URL
    if (data.message_type === 'file') {
      message.fileName = data.file_name
      message.fileSize = data.file_size
      message.fileExtension = data.file_extension
      // 文件URL
      if (data.file_url) {
        if (!data.file_url.startsWith('http://') && !data.file_url.startsWith('https://')) {
          message.fileUrl = serverUrl + data.file_url
        } else {
          message.fileUrl = data.file_url
        }
      }
    }

    // 引用回复 - 确保数据结构完整
    if (data.reply_to) {
      console.log('[Chat Store] 处理引用消息:', data.reply_to)
      message.replyTo = {
        message_id: data.reply_to.message_id,
        content: data.reply_to.content || '',
        user_id: data.reply_to.user_id,
        nickname: data.reply_to.nickname || '用户',
        message_type: data.reply_to.message_type,
        deleted: data.reply_to.deleted || false
      }
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
    console.log('[Chat Store] handleWsMessage 被调用:', {
      message_id: data.message_id,
      message_type: data.message_type,
      from_user_id: data.from_user_id,
      currentUserId,
      isOwn: data.from_user_id === currentUserId
    })
    
    const isOwn = data.from_user_id === currentUserId
    
    // 如果是自己发送的消息，检查是否已经存在临时消息（通过realId匹配）
    if (isOwn) {
      const existingMsg = messages.value.find(m => {
        // 检查临时消息是否保存了真实ID
        const realId = (m as any).realId
        return realId && realId === data.message_id
      })
      
      if (existingMsg) {
        console.log('[Chat Store] 自己的消息已存在（临时消息），跳过添加')
        return // 已存在临时消息，不重复添加
      }
    }
    
    console.log('[Chat Store] 准备添加消息到列表')
    const message = convertWsMessage(data, currentUserId)
    addMessage(message)
    console.log('[Chat Store] 消息已添加，当前消息数:', messages.value.length)
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
    const messageIds = data.message_ids || []
    const readerIdStr = String(data.reader_id)
    
    console.log('[Chat Store] 收到已读回执:', {
      messageIds,
      readerId: readerIdStr,
      totalMessages: messages.value.length
    })
    
    // 直接查找对应的消息，不需要遍历所有消息
    messageIds.forEach(messageId => {
      // 尝试通过 ID 或 realId 查找消息
      const message = messages.value.find(m => 
        m.id == messageId || (m as any).realId == messageId
      )
      
      console.log('[Chat Store] 处理消息已读:', {
        messageId,
        found: !!message,
        isOwn: message?.isOwn,
        type: message?.type,
        actualId: message?.id,
        realId: (message as any)?.realId
      })
      
      // 只处理自己发送的消息
      if (!message || !message.isOwn) return
      
      // 初始化已读用户ID Set（用于去重）
      if (!(message as any)._readUserIds) {
        (message as any)._readUserIds = new Set<string>()
      }
      
      // 检查是否已经记录过这个用户的已读
      if ((message as any)._readUserIds.has(readerIdStr)) {
        console.log('[Chat Store] 用户已读过此消息，跳过')
        return // 已存在，跳过
      }
      
      // 新的已读用户
      (message as any)._readUserIds.add(readerIdStr)
      message.status = 'read'
      message.readCount = (message.readCount || 0) + 1
      
      console.log('[Chat Store] 已更新消息已读状态:', {
        messageId,
        type: message.type,
        readCount: message.readCount,
        status: message.status
      })
    })
  }

  /**
   * 删除消息（焚毁）
   */
  function removeMessage(messageId: number | string) {
    const index = messages.value.findIndex(m => m.id == messageId)
    if (index !== -1) {
      messages.value.splice(index, 1)
    }
  }

  /**
   * 编辑消息
   */
  function editMessage(messageId: number | string, content: string, editedAt: string) {
    const message = messages.value.find(m => m.id == messageId)
    if (message) {
      message.text = content
      message.edited = true
      message.editedAt = editedAt
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

  /**
   * 标记消息为已读
   */
  function markMessageAsRead(messageId: number) {
    readMessageIds.value.add(messageId)
    const message = messages.value.find(m => m.id === messageId)
    if (message) {
      message.status = 'read'
    }
  }

  /**
   * 批量标记消息为已读
   */
  function markMessagesAsRead(messageIds: number[]) {
    messageIds.forEach(id => {
      readMessageIds.value.add(id)
      const message = messages.value.find(m => m.id === id)
      if (message) {
        message.status = 'read'
      }
    })
  }

  /**
   * 检查消息是否已读
   */
  function isMessageRead(messageId: number): boolean {
    return readMessageIds.value.has(messageId)
  }

  /**
   * 清除已读状态（切换房间时调用）
   */
  function clearReadStatus() {
    readMessageIds.value.clear()
  }

  return {
    // 状态
    messages,
    currentRoom,
    loading,
    hasMore,
    loadingMore,
    readMessageIds,
    
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
    editMessage,
    clearMessages,
    prependMessages,
    clearNewFlag,
    markMessageAsRead,
    markMessagesAsRead,
    isMessageRead,
    clearReadStatus
  }
})
