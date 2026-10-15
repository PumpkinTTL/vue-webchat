import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MessageResponse, MessageReadResponse } from '@/types/websocket'

// 消息状态
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

// 消息类型
export interface ChatMessageItem {
  id: number | string
  type: 'text' | 'image' | 'voice' | 'video' | 'file' | 'audio' | 'system'
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
  // 音频消息
  audioUrl?: string
  audioDuration?: number
  audioName?: string
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
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        message.imageUrl = serverUrl + url
      } else {
        message.imageUrl = url
      }
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

    // 音频消息 - 处理URL
    if (data.message_type === 'audio') {
      if (data.audio_url) {
        if (!data.audio_url.startsWith('http://') && !data.audio_url.startsWith('https://')) {
          message.audioUrl = serverUrl + data.audio_url
        } else {
          message.audioUrl = data.audio_url
        }
      }
      message.audioDuration = data.audio_duration
      message.audioName = data.audio_name
    }

    // 引用回复 - 确保数据结构完整
    if (data.reply_to) {
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
    
    const isOwn = data.from_user_id === currentUserId
    
    // 如果是自己发送的消息，且本地已存在对应消息（临时消息换真实id后 m.id 即真实id，或带 realId），则跳过，避免重复插入
    if (isOwn) {
      const exists = messages.value.some(m =>
        m.id == data.message_id || (m as any).realId == data.message_id
      )
      if (exists) {
        return
      }
    }
    
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
    const messageIds = data.message_ids || []
    const readerIdStr = String(data.reader_id)
    
    
    // 直接查找对应的消息，不需要遍历所有消息
    messageIds.forEach(messageId => {
      // 尝试通过 ID 或 realId 查找消息
      const message = messages.value.find(m => 
        m.id == messageId || (m as any).realId == messageId
      )
      
      
      // 只处理自己发送的消息
      if (!message || !message.isOwn) return
      
      // 初始化已读用户ID Set（用于去重）
      if (!(message as any)._readUserIds) {
        (message as any)._readUserIds = new Set<string>()
      }
      
      // 检查是否已经记录过这个用户的已读
      if ((message as any)._readUserIds.has(readerIdStr)) {
        return // 已存在，跳过
      }
      
      // 新的已读用户
      (message as any)._readUserIds.add(readerIdStr)
      message.status = 'read'
      message.readCount = (message.readCount || 0) + 1
      
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

  /**
   * 更新某个用户的资料（昵称/头像）——用于自己修改资料后本地即时生效、
   * 以及收到他人 profile_updated 广播时同步刷新历史消息里的发送者信息。
   */
  function updateUserProfile(userId: number, nickname?: string, avatar?: string) {
    if (!userId) return
    messages.value.forEach(m => {
      if (m.sender && m.sender.id === userId) {
        if (nickname) m.sender.nickname = nickname
        if (avatar !== undefined) m.sender.avatar = avatar
        // 同步 username 字段（部分渲染分支用它）
        if (nickname) m.username = nickname
      }
    })
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
    clearReadStatus,
    updateUserProfile
  }
})
