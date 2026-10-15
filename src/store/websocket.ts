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
  IntimacyInfo,
  ListenInvitedResponse,
  ListenStartedResponse,
  ListenDeclinedResponse,
  ListenSyncResponse,
  ListenEndedResponse,
  ListenStateResponse
} from '@/types/websocket'
import { getToken } from '@/utils/storage'

/**
 * 连接恢复的原因（供上层做 HTTP 兜底补拉，区分场景）
 * - reconnect：断线后重连并重新认证成功
 * - visible：页面回到前台（可能连接已断或曾长时间挂起）
 * - online：网络恢复
 */
export type ResyncReason = 'reconnect' | 'visible' | 'online'

export const useWebSocketStore = defineStore('websocket', () => {
  // ==================== 状态 ====================
  
  const ws = ref<WebSocket | null>(null)
  const status = ref<ConnectionStatus>('disconnected')
  const currentRoomId = ref<number | null>(null)
  const desiredRoomId = ref<number | null>(null)  // 期望所在房间（重连后自动重新加入）
  let joinedThisSession = false                  // 当前连接会话内是否已成功 join（断线时重置）
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
  const reconnectAttempts = ref(0)
  const pingInterval = 25000          // 心跳间隔
  const maxReconnectDelay = 30000     // 退避上限
  const connectingUrl = ref<string>('') // 当前连接地址（重连时复用）
  let awaitingPong = false            // 上一次 ping 是否还在等待 pong（用于判定连接是否已死）
  let authedBefore = false            // 本 store 生命周期内是否曾经认证过（用于区分首连与重连）
  let lifecycleBound = false          // 是否已绑定页面生命周期监听（只绑一次）

  // 连接恢复回调（HTTP 兜底补拉）：resync 去抖 + 最近一次触发时间
  const RESYNC_DEBOUNCE_MS = 1500
  let onResync: ((reason: ResyncReason) => void) | null = null
  let pendingResync: ResyncReason | null = null  // 回调尚未注册时暂存的 resync，注册后补触发
  const lastResyncAt: Record<ResyncReason, number> = { reconnect: 0, visible: 0, online: 0 }

  // ==================== 断线发送队列（outbox） ====================
  // socket 非 OPEN 时，把“必须送达”的业务消息入队，待连接恢复（认证 + 重新 join）后按序补发，
  // 避免「消息发出去了但 socket 没连上 / 重连期间」直接丢弃。
  // 只保留状态类消息；ping/typing 这类易失消息不入队（丢弃）。
  const OUTBOX_MAX = 100
  const OUTBOX_TYPES = new Set<ClientMessage['type']>([
    'message',
    'mark_read',
    'message_edited',
    'message_burned',
    'room_cleared',
    'room_lock_changed',
    'profile_updated',
    'intimacy_restart'
  ])
  const outbox = ref<ClientMessage[]>([])
  let flushing = false                // 单飞：保证同时只有一个 flush 在跑

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
  let onProfileUpdated: ((data: ProfileUpdatedResponse) => void) | null = null

  // 一起听（同步播放）回调
  let onListenInvited: ((data: ListenInvitedResponse) => void) | null = null
  let onListenStarted: ((data: ListenStartedResponse) => void) | null = null
  let onListenDeclined: ((data: ListenDeclinedResponse) => void) | null = null
  let onListenSync: ((data: ListenSyncResponse) => void) | null = null
  let onListenEnded: ((data: ListenEndedResponse) => void) | null = null
  let onListenState: ((data: ListenStateResponse) => void) | null = null

  // ==================== 核心方法 ====================

  /**
   * 连接 WebSocket
   */
  function connect(wsUrl?: string) {
    // 单飞：已有连接在途/已建立则不再新建
    if (ws.value && (ws.value.readyState === WebSocket.CONNECTING || ws.value.readyState === WebSocket.OPEN)) {
      // 清理可能残留的重连定时器，避免旧排程后又触发一次（虽会早退，但避免空转）
      stopReconnect()
      return
    }
    // 主动发起连接：取消待执行的重连排程，确保同一时刻只有一个连接尝试
    stopReconnect()

    // 解析连接地址（优先显式传入 > 环境变量 > 当前页面地址），并缓存以便重连复用
    let url = wsUrl
    if (!url) {
      const envWsUrl = import.meta.env.VITE_WS_URL
      if (envWsUrl) {
        url = envWsUrl
      } else {
        const serverUrl = import.meta.env.VITE_SERVER_URL
        if (serverUrl) {
          // 从 http(s)://host 推导 ws(s)://host/ws
          const urlObj = new URL(serverUrl)
          const protocol = urlObj.protocol === 'https:' ? 'wss:' : 'ws:'
          url = `${protocol}//${urlObj.host}/ws`
        } else {
          // 降级：使用当前页面地址，自动适配域名/IP 与 https
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
          url = `${protocol}//${window.location.host}/ws`
        }
      }
    }
    connectingUrl.value = url

    status.value = 'connecting'

    // 绑定页面/网络生命周期恢复（只绑一次）
    bindLifecycle()

    try {
      // 关键：用局部变量持有本次创建的 socket 实例，所有回调只认自己这一个。
      // 否则旧 socket 迟到的 onclose 会误杀新连接的心跳定时器（stopPing 操作的是共享的 pingTimer），
      // 导致新连接没心跳 → 被服务端空闲清理 → 反复重连（就是“socket 总是断线”的根因）。
      const sock = new WebSocket(url)
      ws.value = sock

      sock.onopen = () => {
        // 已被更新的连接取代 → 直接丢弃这个过期 socket
        if (ws.value !== sock) { try { sock.close() } catch { /* ignore */ } return }

        status.value = 'connected'
        manualClose.value = false
        reconnectAttempts.value = 0
        joinedThisSession = false   // 新连接会话，尚未加入房间
        awaitingPong = false

        // 自动认证
        const token = getToken()
        if (token) {
          auth(token)
        }

        // 启动心跳 watchdog
        startPing()
      }

      sock.onmessage = (event) => {
        if (ws.value !== sock) return
        try {
          const data: ServerMessage = JSON.parse(event.data)
          if (data.type === 'pong') awaitingPong = false
          handleMessage(data)
        } catch (e) {
          console.error('[WebSocket] 解析消息失败:', e, event.data)
        }
      }

      sock.onerror = (error) => {
        console.error('[WebSocket] 连接错误:', error)
      }

      sock.onclose = () => {
        // 过期 socket 的关闭事件：忽略，绝不能影响当前连接
        if (ws.value !== sock) return

        status.value = 'disconnected'
        ws.value = null
        stopPing()

        // 自动重连（非手动关闭时）
        if (!manualClose.value) {
          scheduleReconnect()
        }
      }
    } catch (error) {
      console.error('[WebSocket] 连接失败:', error)
      status.value = 'disconnected'

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
    clearOutbox()

    if (ws.value) {
      ws.value.close()
      ws.value = null
    }

    status.value = 'disconnected'
    currentRoomId.value = null
    desiredRoomId.value = null
    onlineUsers.value = []
    typingUsers.value.clear()
    intimacyActive.value = false
    intimacyStartTime.value = null
    // 重置重连判定标记：下次 connect + auth 视为首次认证，不再触发 reconnect resync
    authedBefore = false
    pendingResync = null
    lastResyncAt.reconnect = 0
    lastResyncAt.visible = 0
    lastResyncAt.online = 0
  }

  /**
   * 发送消息
   * - socket OPEN：直接发送
   * - 非 OPEN：若是“必须送达”的业务消息则入队（连接恢复后补发），否则丢弃并返回 false
   */
  function send(data: ClientMessage) {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      try {
        ws.value.send(JSON.stringify(data))
        return true
      } catch (error) {
        console.error('[WebSocket] 发送消息失败:', error)
        // 发送抛错（socket 处于异常态）：按未连接处理，尝试入队
        enqueue(data)
        return false
      }
    }
    return enqueue(data)
  }

  /**
   * 未连接时的入队策略：
   * 仅保留状态类消息（见 OUTBOX_TYPES），ping/typing 直接丢弃
   */
  function enqueue(data: ClientMessage): boolean {
    if (!OUTBOX_TYPES.has(data.type)) {
      // ping / typing 等易失消息：不入队（typing 已过期无意义，ping 由心跳机制自发）
      return false
    }
    if (outbox.value.length >= OUTBOX_MAX) {
      // 超限：丢最旧，避免无限增长
      const dropped = outbox.value.shift()
      console.warn('[WebSocket] 发送队列已满，丢弃最旧消息:', dropped?.type)
    }
    outbox.value.push(data)
    return false
  }

  /**
   * 连接恢复后按序补发队列；仍非 OPEN 则保留队列。
   * 单飞：避免 auth_success 与 room_joined 相继触发导致重复 flush。
   */
  function flushOutbox() {
    if (flushing) return
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return
    if (outbox.value.length === 0) return

    flushing = true
    const pending = outbox.value
    outbox.value = []
    let idx = 0
    for (; idx < pending.length; idx++) {
      // flush 途中连接再次断开：剩余消息回填到队首，保留待下次恢复
      if (!ws.value || ws.value.readyState !== WebSocket.OPEN) break
      try {
        ws.value.send(JSON.stringify(pending[idx]))
      } catch (error) {
        console.error('[WebSocket] 补发队列消息失败，回填队列:', error)
        break
      }
    }
    if (idx < pending.length) {
      // 未发送完的部分回填到队首（保持原有顺序），已发送的不再重复
      outbox.value = pending.slice(idx).concat(outbox.value)
    }
    flushing = false
  }

  function clearOutbox() {
    if (outbox.value.length > 0) {
      outbox.value = []
    }
    flushing = false
  }

  /**
   * 触发连接恢复回调（HTTP 兜底补拉）
   * - 同一 reason 1.5s 内去抖，避免风暴
   * - 回调尚未注册时暂存，待 setOnResync 注册后补触发（回调可能晚于连接建立）
   * - 回调异常 try/catch，绝不影响连接流程
   */
  function fireResync(reason: ResyncReason) {
    if (!onResync) {
      // 回调还没注册（上层可能晚于连接建立才接线）→ 暂存待补触发
      pendingResync = reason
      return
    }
    const now = Date.now()
    if (now - lastResyncAt[reason] < RESYNC_DEBOUNCE_MS) return
    lastResyncAt[reason] = now
    try {
      onResync(reason)
    } catch (error) {
      console.error('[WebSocket] resync 回调异常:', error)
    }
  }

  /**
   * 注册连接恢复回调（上层据此做 HTTP 兜底补拉，补上断线期间丢失的广播消息）
   * 触发时机：重连认证成功（reconnect）/ 回到前台（visible）/ 网络恢复（online）
   * 若在注册之前已经发生过 resync（如连接先建立、回调后接线），注册后立即补触发一次。
   */
  function setOnResync(callback: typeof onResync) {
    onResync = callback
    if (callback && pendingResync) {
      const reason = pendingResync
      pendingResync = null
      // 注册即补触发，绕过本次去抖（尚未触发过），并记录时间
      lastResyncAt[reason] = Date.now()
      try {
        callback(reason)
      } catch (error) {
        console.error('[WebSocket] resync 回调异常:', error)
      }
    }
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
    // 无论当前是否已认证，都记住目标房间：
    // 若尚未认证，会在 auth_success 后自动补发 join_room（见 handleMessage）。
    desiredRoomId.value = roomId
    if (status.value !== 'authed') {
      console.warn('[WebSocket] 未认证，待认证后自动加入房间', roomId)
      return false
    }
    return send({ type: 'join_room', room_id: roomId })
  }

  /**
   * 发送聊天消息（广播）
   */
  function sendChatMessage(params: {
    message_id: number
    message_type: 'text' | 'image' | 'voice' | 'video' | 'file' | 'audio'
    content: string
    video_url?: string
    video_thumbnail?: string
    video_duration?: number
    audio_url?: string
    audio_duration?: number
    audio_name?: string
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
  function broadcastRoomCleared(hardDelete: boolean = false, isRestore: boolean = false) {
    return send({ type: 'room_cleared', hard_delete: hardDelete, is_restore: isRestore })
  }

  /**
   * 广播房间锁定状态变化
   */
  function broadcastRoomLockChanged(lock: number) {
    return send({ type: 'room_lock_changed', lock })
  }

  /**
   * 广播房间消息恢复（复用 room_cleared 事件）
   */
  function broadcastRoomRestored() {
    return send({ type: 'room_cleared', hard_delete: false, is_restore: true })
  }

  /**
   * 请求重新开始亲密互动
   */
  function restartIntimacy(roomId: number) {
    return send({ type: 'intimacy_restart', room_id: roomId })
  }

  // ==================== 一起听（同步播放）====================

  function listenInvite(payload: { audio_url: string; audio_name?: string; audio_duration?: number | null; position?: number; playing?: boolean }) {
    return send({ type: 'listen_invite', ...payload })
  }
  function listenAccept() {
    return send({ type: 'listen_accept' })
  }
  function listenDecline() {
    return send({ type: 'listen_decline' })
  }
  function listenSync(position: number, playing: boolean) {
    return send({ type: 'listen_sync', position, playing })
  }
  function listenEnd() {
    return send({ type: 'listen_end' })
  }

  // ==================== 消息处理 ====================

  function handleMessage(data: ServerMessage) {
    switch (data.type) {
      case 'connected':
        // 连接成功确认
        break

      case 'auth_success': {
        status.value = 'authed'
        currentUserId.value = data.user_id
        currentNickname.value = data.nickname
        currentAvatar.value = data.avatar
        // 本次认证是否为「重连后的会话」：此前已经认证过 → 说明是断线重连
        // （disconnect 会重置 authedBefore，因此首次连接首次认证不触发 resync）
        const isReconnect = authedBefore
        authedBefore = true
        // 认证成功后自动（重新）加入目标房间：
        // 重连场景下如果不重新 join_room，服务端在线名单不会包含自己，
        // 对方将永远看不到“上线”，私密房间也不会进入 2 人状态，导致爱心不点亮、互动不启动。
        let sentJoin = false
        if (desiredRoomId.value && !joinedThisSession) {
          sentJoin = send({ type: 'join_room', room_id: desiredRoomId.value })
        }
        // 无房间可 join 时，此处即可补发队列；有 join 则等 room_joined 后再补发（保证服务端已就位）
        if (!sentJoin) {
          flushOutbox()
        }
        if (isReconnect) {
          fireResync('reconnect')
        }
        break
      }

      case 'room_joined':
        currentRoomId.value = data.room_id
        joinedThisSession = true
        onlineUsers.value = data.users
        typingUsers.value.clear()
        intimacyActive.value = false
        intimacyStartTime.value = null
        if (onRoomJoined) {
          onRoomJoined(data.room_id, data.users)
        }
        // 已重新加入房间 → 补发断线期间排队的消息
        flushOutbox()
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

      case 'profile_updated':
        if (onProfileUpdated) {
          onProfileUpdated(data)
        }
        break

      case 'listen_invited':
        if (onListenInvited) {
          onListenInvited(data)
        }
        break

      case 'listen_started':
        if (onListenStarted) {
          onListenStarted(data)
        }
        break

      case 'listen_declined':
        if (onListenDeclined) {
          onListenDeclined(data)
        }
        break

      case 'listen_sync':
        if (onListenSync) {
          onListenSync(data)
        }
        break

      case 'listen_ended':
        if (onListenEnded) {
          onListenEnded(data)
        }
        break

      case 'listen_state':
        if (onListenState) {
          onListenState(data)
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

  /**
   * 调度重连：指数退避 + 随机抖动，避免同时重连把服务器打满
   */
  function scheduleReconnect() {
    if (reconnectTimer.value) {
      return
    }
    // 1s,2s,4s,8s,16s,30s(封顶) + 0~30% 抖动
    const base = Math.min(maxReconnectDelay, 1000 * Math.pow(2, reconnectAttempts.value))
    const delay = Math.round(base * (1 + Math.random() * 0.3))
    reconnectAttempts.value++

    reconnectTimer.value = setTimeout(() => {
      reconnectTimer.value = null
      // 若页面已隐藏，暂缓重连（等 visibilitychange 再拉起），减少后台无效连接
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return
      }
      connect()
    }, delay)
  }

  function stopReconnect() {
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value)
      reconnectTimer.value = null
    }
  }

  function startPing() {
    stopPing()
    awaitingPong = false
    pingTimer.value = setInterval(() => {
      if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
        return
      }
      // 上一轮 ping 到现在整整一个间隔都没收到 pong → 连接已死，主动断开触发重连
      if (awaitingPong) {
        console.warn('[WebSocket] 心跳超时（上一轮 ping 未收到 pong），主动重连')
        try { ws.value.close() } catch (e) { /* ignore */ }
        return
      }
      awaitingPong = true
      send({ type: 'ping' })
    }, pingInterval)
  }

  function stopPing() {
    if (pingTimer.value) {
      clearInterval(pingTimer.value)
      pingTimer.value = null
    }
    awaitingPong = false
  }

  /**
   * 绑定页面生命周期：从后台/锁屏/关闭返回时，检查并恢复连接。
   * 移动端浏览器在后台会挂起 JS 与 WebSocket，回到前台时连接可能已经失效，
   * 必须在 visible 时立即探活并重连，否则会出现“对方上线特效不触发/私密爱心不点亮/收不到消息”。
   */
  function bindLifecycle() {
    if (lifecycleBound || typeof document === 'undefined') return
    lifecycleBound = true

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return
      if (manualClose.value) return
      // 回到前台：连接已死或重连挂起时立即恢复
      const dead = !ws.value || ws.value.readyState === WebSocket.CLOSED || ws.value.readyState === WebSocket.CLOSING
      if (dead) {
        stopReconnect()
        reconnectAttempts.value = 0
        connect()
      }
      // 无论连接是否仍 OPEN，都触发一次补拉：隐藏期间可能错过广播消息
      fireResync('visible')
    })

    // 网络恢复时立即重连 + 补拉
    window.addEventListener('online', () => {
      if (manualClose.value) return
      const dead = !ws.value || ws.value.readyState !== WebSocket.OPEN
      if (dead) {
        stopReconnect()
        reconnectAttempts.value = 0
        connect()
      }
      fireResync('online')
    })
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

  function setOnProfileUpdated(callback: typeof onProfileUpdated) {
    onProfileUpdated = callback
  }

  // 一起听：事件注册
  function setOnListenInvited(callback: typeof onListenInvited) {
    onListenInvited = callback
  }
  function setOnListenStarted(callback: typeof onListenStarted) {
    onListenStarted = callback
  }
  function setOnListenDeclined(callback: typeof onListenDeclined) {
    onListenDeclined = callback
  }
  function setOnListenSync(callback: typeof onListenSync) {
    onListenSync = callback
  }
  function setOnListenEnded(callback: typeof onListenEnded) {
    onListenEnded = callback
  }
  function setOnListenState(callback: typeof onListenState) {
    onListenState = callback
  }

  /**
   * 广播自己的资料变更（昵称/头像），让同房间其他人也刷新
   */
  function broadcastProfileUpdated(payload: { user_id: number; nickname?: string; avatar?: string }) {
    return send({ type: 'profile_updated', ...payload })
  }

  return {
    // 状态
    status,
    currentRoomId,
    desiredRoomId,
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
    broadcastRoomRestored,
    restartIntimacy,
    broadcastProfileUpdated,
    listenInvite,
    listenAccept,
    listenDecline,
    listenSync,
    listenEnd,
    
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
    setOnRoomJoined,
    setOnProfileUpdated,
    setOnResync,
    setOnListenInvited,
    setOnListenStarted,
    setOnListenDeclined,
    setOnListenSync,
    setOnListenEnded,
    setOnListenState
  }
})
