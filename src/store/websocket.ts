import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  ConnectionStatus,
  OnlineUser,
  ServerMessage,
  ClientMessage,
  MessageResponse,
  UserJoinedResponse,
  UserLeftResponse,
  TypingResponse,
  MessageReadResponse,
  MessageBurnedResponse,
  MessageEditedResponse,
  RoomClearedResponse,
  RoomLockChangedResponse,
  IntimacyStartResponse,
  IntimacyCompleteResponse,
  IntimacyResetResponse,
  ErrorResponse,
  IntimacyInfo
} from '@/types/websocket'
import { getToken } from '@/utils/storage'

export const useWebSocketStore = defineStore('websocket', () => {
  // ==================== 状态 ====================
  
  const ws = ref<WebSocket | null>(null)
  const status = ref<ConnectionStatus>('disconnected')
  const currentRoomId = ref<number | null>(null)
  const currentUserId = ref<number | null>(null)
  const currentNickname = ref<string>('')
  const currentAvatar = ref<string>('')
  const onlineUsers = ref<OnlineUser[]>([])
  const typingUsers = ref<Map<number, { nickname: string; timeout: ReturnType<typeof setTimeout> }>>(new Map())
  
  // 亲密互动状态
  const intimacyActive = ref(false)
  const intimacyStartTime = ref<number | null>(null)
  
  // 重连相关
  const reconnectTimer = ref<ReturnType<typeof setTimeout> | null>(null)
  const pingTimer = ref<ReturnType<typeof setInterval> | null>(null)
  const manualClose = ref(false)
  const reconnectDelay = 3000
  const pingInterval = 30000

  // ==================== 计算属性 ====================
  
  const isConnected = computed(() => status.value === 'connected' || status.value === 'authed')
  const isAuthed = computed(() => status.value === 'authed')
  const onlineCount = computed(() => onlineUsers.value.length)
  const typingUserList = computed(() => {
    const list: { id: number; nickname: string }[] = []
    typingUsers.value.forEach((value, key) => {
      list.push({ id: key, nickname: value.nickname })
    })
    return list
  })

  // ==================== 事件回调 ====================
  
  let onMessage: ((data: MessageResponse) => void) | null = null
  let onUserJoined: ((data: UserJoinedResponse) => void) | null = null
  let onUserLeft: ((data: UserLeftResponse) => void) | null = null
  let onMessageRead: ((data: MessageReadResponse) => void) | null = null
  let onMessageBurned: ((data: MessageBurnedResponse) => void) | null = null
  let onMessageEdited: ((data: MessageEditedResponse) => void) | null = null
  let onRoomCleared: ((data: RoomClearedResponse) => void) | null = null
  let onRoomLockChanged: ((data: RoomLockChangedResponse) => void) | null = null
  let onIntimacyStart: ((data: IntimacyStartResponse) => void) | null = null
  let onIntimacyComplete: ((data: IntimacyCompleteResponse) => void) | null = null
  let onIntimacyReset: ((data: IntimacyResetResponse) => void) | null = null
  let onError: ((data: ErrorResponse) => void) | null = null
  let onRoomJoined: ((roomId: number, users: OnlineUser[]) => void) | null = null

  // ==================== 核心方法 ====================

  /**
   * 连接 WebSocket
   */
  function connect(wsUrl?: string) {
    if (ws.value && (ws.value.readyState === WebSocket.CONNECTING || ws.value.readyState === WebSocket.OPEN)) {
      console.log('[WebSocket] 已在连接或已连接')
      return
    }

    // 如果没有提供wsUrl，则根据VITE_SERVER_URL构建
    let url = wsUrl
    if (!url) {
      const serverUrl = import.meta.env.VITE_SERVER_URL
      if (serverUrl) {
        // 从 http://8.138.90.156:5000 转换为 ws://8.138.90.156:5000/ws
        // 或从 https://... 转换为 wss://...
        const urlObj = new URL(serverUrl)
        const protocol = urlObj.protocol === 'https:' ? 'wss:' : 'ws:'
        url = `${protocol}//${urlObj.host}/ws`
      } else {
        // 降级方案：使用当前页面地址
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const host = window.location.host
        url = `${protocol}//${host}/ws`
      }
    }
    
    console.log('[WebSocket] 正在连接:', url)
    status.value = 'connecting'

    try {
      ws.value = new WebSocket(url)

      ws.value.onopen = () => {
        console.log('[WebSocket] 连接成功')
        status.value = 'connected'
        manualClose.value = false

        // 自动认证
        const token = getToken()
        if (token) {
          auth(token)
        }

        // 启动心跳
        startPing()
      }

      ws.value.onmessage = (event) => {
        try {
          const data: ServerMessage = JSON.parse(event.data)
          console.log('[WebSocket] 收到消息:', data)
          handleMessage(data)
        } catch (e) {
          console.error('[WebSocket] 解析消息失败:', e, event.data)
        }
      }

      ws.value.onerror = (error) => {
        console.error('[WebSocket] 连接错误:', error)
      }

      ws.value.onclose = (event) => {
        console.log('[WebSocket] 连接关闭: code=' + event.code + ', reason=' + event.reason)
        status.value = 'disconnected'
        stopPing()

        // 自动重连
        if (!manualClose.value) {
          scheduleReconnect()
        }
      }
    } catch (error) {
      console.error('[WebSocket] 连接失败:', error)
      status.value = 'disconnected'
      
      // 连接失败也触发重连
      if (!manualClose.value) {
        scheduleReconnect()
      }
    }
  }

  /**
   * 断开连接
   */
  function disconnect() {
    manualClose.value = true
    stopReconnect()
    stopPing()

    if (ws.value) {
      ws.value.close()
      ws.value = null
    }

    status.value = 'disconnected'
    currentRoomId.value = null
    onlineUsers.value = []
    typingUsers.value.clear()
    intimacyActive.value = false
    intimacyStartTime.value = null
  }

  /**
   * 发送消息
   */
  function send(data: ClientMessage) {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      console.error('[WebSocket] 未连接，无法发送消息')
      return false
    }
    ws.value.send(JSON.stringify(data))
    return true
  }

  /**
   * 认证
   */
  function auth(token: string) {
    return send({ type: 'auth', token })
  }

  /**
   * 加入房间
   */
  function joinRoom(roomId: number) {
    if (status.value !== 'authed') {
      console.warn('[WebSocket] 未认证，无法加入房间')
      return false
    }
    return send({ type: 'join_room', room_id: roomId })
  }

  /**
   * 发送聊天消息（广播）
   */
  function sendChatMessage(params: {
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
    return send({
      type: 'message',
      ...params
    })
  }

  /**
   * 发送正在输入状态
   */
  function sendTyping(typing: boolean) {
    return send({ type: 'typing', typing })
  }

  /**
   * 标记消息已读
   */
  function markRead(messageIds: number[]) {
    return send({ type: 'mark_read', message_ids: messageIds })
  }

  /**
   * 批量标记消息为已读（用于已读回执）
   */
  function markMessagesAsRead(messageIds: number[]) {
    if (!messageIds || messageIds.length === 0) return false
    return markRead(messageIds)
  }

  /**
   * 广播消息焚毁
   */
  function broadcastMessageBurned(messageId: number) {
    return send({ type: 'message_burned', message_id: messageId })
  }

  /**
   * 广播消息编辑
   */
  function broadcastMessageEdited(messageId: number, content: string, editedAt: string) {
    return send({ 
      type: 'message_edited', 
      message_id: messageId,
      content,
      edited_at: editedAt
    })
  }

  /**
   * 广播房间清理
   */
  function broadcastRoomCleared(hardDelete: boolean = false) {
    return send({ type: 'room_cleared', hard_delete: hardDelete })
  }

  /**
   * 广播房间锁定状态变化
   */
  function broadcastRoomLockChanged(lock: number) {
    return send({ type: 'room_lock_changed', lock })
  }

  /**
   * 请求重新开始亲密互动
   */
  function restartIntimacy(roomId: number) {
    return send({ type: 'intimacy_restart', room_id: roomId })
  }

  // ==================== 消息处理 ====================

  function handleMessage(data: ServerMessage) {
    switch (data.type) {
      case 'connected':
        // 连接成功确认
        break

      case 'auth_success':
        status.value = 'authed'
        currentUserId.value = data.user_id
        currentNickname.value = data.nickname
        currentAvatar.value = data.avatar
        console.log('[WebSocket] 认证成功:', data.nickname)
        break

      case 'room_joined':
        currentRoomId.value = data.room_id
        onlineUsers.value = data.users
        typingUsers.value.clear()
        intimacyActive.value = false
        intimacyStartTime.value = null
        console.log('[WebSocket] 加入房间:', data.room_id, '在线人数:', data.online_count)
        if (onRoomJoined) {
          onRoomJoined(data.room_id, data.users)
        }
        break

      case 'message':
        if (onMessage) {
          onMessage(data)
        }
        break

      case 'user_joined':
        // 添加到在线用户列表（如果不存在）
        if (!onlineUsers.value.find(u => u.user_id === data.user_id)) {
          onlineUsers.value.push({
            user_id: data.user_id,
            nick_name: data.nickname,
            avatar: data.avatar
          })
        }
        if (onUserJoined) {
          onUserJoined(data)
        }
        break

      case 'user_left':
        // 从在线用户列表移除
        onlineUsers.value = onlineUsers.value.filter(u => u.user_id !== data.user_id)
        // 清除该用户的输入状态
        clearTypingUser(data.user_id)
        if (onUserLeft) {
          onUserLeft(data)
        }
        break

      case 'typing':
        handleTyping(data)
        break

      case 'message_read':
        if (onMessageRead) {
          onMessageRead(data)
        }
        break

      case 'mark_read_success':
        // 标记已读成功确认，忽略
        break

      case 'message_burned':
        if (onMessageBurned) {
          onMessageBurned(data)
        }
        break

      case 'message_edited':
        if (onMessageEdited) {
          onMessageEdited(data)
        }
        break

      case 'room_cleared':
        if (onRoomCleared) {
          onRoomCleared(data)
        }
        break

      case 'room_lock_changed':
        if (onRoomLockChanged) {
          onRoomLockChanged(data)
        }
        break

      case 'intimacy_start':
        intimacyActive.value = true
        intimacyStartTime.value = Date.now()
        if (onIntimacyStart) {
          onIntimacyStart(data)
        }
        break

      case 'intimacy_complete':
        intimacyActive.value = false
        if (onIntimacyComplete) {
          onIntimacyComplete(data)
        }
        break

      case 'intimacy_reset':
        intimacyActive.value = false
        intimacyStartTime.value = null
        if (onIntimacyReset) {
          onIntimacyReset(data)
        }
        break

      case 'pong':
        // 心跳响应，忽略
        break

      case 'error':
        console.error('[WebSocket] 服务器错误:', data.msg)
        if (onError) {
          onError(data)
        }
        break

      default:
        console.log('[WebSocket] 未知消息类型:', data)
    }
  }

  function handleTyping(data: TypingResponse) {
    // 不处理自己的输入状态
    if (data.user_id === currentUserId.value) {
      return
    }

    if (data.typing) {
      // 清除之前的超时
      const existing = typingUsers.value.get(data.user_id)
      if (existing) {
        clearTimeout(existing.timeout)
      }
      // 设置新的超时（5秒后自动清除）
      const timeout = setTimeout(() => {
        clearTypingUser(data.user_id)
      }, 5000)
      typingUsers.value.set(data.user_id, {
        nickname: data.nickname,
        timeout
      })
    } else {
      clearTypingUser(data.user_id)
    }
  }

  function clearTypingUser(userId: number) {
    const existing = typingUsers.value.get(userId)
    if (existing) {
      clearTimeout(existing.timeout)
      typingUsers.value.delete(userId)
    }
  }

  // ==================== 重连和心跳 ====================

  function scheduleReconnect() {
    if (reconnectTimer.value) {
      return
    }
    console.log('[WebSocket] ' + reconnectDelay / 1000 + '秒后重连...')
    reconnectTimer.value = setTimeout(() => {
      reconnectTimer.value = null
      connect()
    }, reconnectDelay)
  }

  function stopReconnect() {
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value)
      reconnectTimer.value = null
    }
  }

  function startPing() {
    stopPing()
    pingTimer.value = setInterval(() => {
      if (ws.value && ws.value.readyState === WebSocket.OPEN) {
        send({ type: 'ping' })
      }
    }, pingInterval)
  }

  function stopPing() {
    if (pingTimer.value) {
      clearInterval(pingTimer.value)
      pingTimer.value = null
    }
  }

  // ==================== 事件注册 ====================

  function setOnMessage(callback: typeof onMessage) {
    onMessage = callback
  }

  function setOnUserJoined(callback: typeof onUserJoined) {
    onUserJoined = callback
  }

  function setOnUserLeft(callback: typeof onUserLeft) {
    onUserLeft = callback
  }

  function setOnMessageRead(callback: typeof onMessageRead) {
    onMessageRead = callback
  }

  function setOnMessageBurned(callback: typeof onMessageBurned) {
    onMessageBurned = callback
  }

  function setOnMessageEdited(callback: typeof onMessageEdited) {
    onMessageEdited = callback
  }

  function setOnRoomCleared(callback: typeof onRoomCleared) {
    onRoomCleared = callback
  }

  function setOnRoomLockChanged(callback: typeof onRoomLockChanged) {
    onRoomLockChanged = callback
  }

  function setOnIntimacyStart(callback: typeof onIntimacyStart) {
    onIntimacyStart = callback
  }

  function setOnIntimacyComplete(callback: typeof onIntimacyComplete) {
    onIntimacyComplete = callback
  }

  function setOnIntimacyReset(callback: typeof onIntimacyReset) {
    onIntimacyReset = callback
  }

  function setOnError(callback: typeof onError) {
    onError = callback
  }

  function setOnRoomJoined(callback: typeof onRoomJoined) {
    onRoomJoined = callback
  }

  return {
    // 状态
    status,
    currentRoomId,
    currentUserId,
    currentNickname,
    currentAvatar,
    onlineUsers,
    intimacyActive,
    intimacyStartTime,
    
    // 计算属性
    isConnected,
    isAuthed,
    onlineCount,
    typingUserList,
    
    // 方法
    connect,
    disconnect,
    auth,
    joinRoom,
    sendChatMessage,
    sendTyping,
    markRead,
    markMessagesAsRead,
    broadcastMessageBurned,
    broadcastMessageEdited,
    broadcastRoomCleared,
    broadcastRoomLockChanged,
    restartIntimacy,
    
    // 事件注册
    setOnMessage,
    setOnUserJoined,
    setOnUserLeft,
    setOnMessageRead,
    setOnMessageBurned,
    setOnMessageEdited,
    setOnRoomCleared,
    setOnRoomLockChanged,
    setOnIntimacyStart,
    setOnIntimacyComplete,
    setOnIntimacyReset,
    setOnError,
    setOnRoomJoined
  }
})
