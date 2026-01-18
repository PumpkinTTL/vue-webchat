/**
 * WebSocket 消息类型定义
 * 与 server.php 完全对应
 */

// ==================== 基础类型 ====================

export interface OnlineUser {
  user_id: number
  nick_name: string
  avatar?: string
}

export interface IntimacyInfo {
  current_exp: number
  current_level: number
}

// ==================== 客户端发送的消息 ====================

export interface AuthMessage {
  type: 'auth'
  token: string
}

export interface JoinRoomMessage {
  type: 'join_room'
  room_id: number
}

export interface ChatMessage {
  type: 'message'
  message_id: number
  message_type: 'text' | 'image' | 'voice' | 'video' | 'file'
  content: string
  // 视频消息
  video_url?: string
  video_thumbnail?: string
  video_duration?: number
  // 文件消息
  file_name?: string
  file_size?: number
  file_extension?: string
  file_url?: string
  // 引用回复（支持数字ID或完整对象）
  reply_to?: number | {
    message_id: number
    content: string
    user_id: number
    nickname: string
    message_type: number | string
    deleted?: boolean
  }
  // 好感度信息
  intimacy?: IntimacyInfo
}

export interface TypingMessage {
  type: 'typing'
  typing: boolean
}

export interface MarkReadMessage {
  type: 'mark_read'
  message_ids: number[]
}

export interface MessageBurnedMessage {
  type: 'message_burned'
  message_id: number
}

export interface MessageEditedMessage {
  type: 'message_edited'
  message_id: number
  content: string
  edited_at: string
}

export interface RoomClearedMessage {
  type: 'room_cleared'
  hard_delete?: boolean
  is_restore?: boolean // 是否是恢复操作
}

export interface RoomLockChangedMessage {
  type: 'room_lock_changed'
  lock: number
}

export interface IntimacyRestartMessage {
  type: 'intimacy_restart'
  room_id: number
}

export interface PingMessage {
  type: 'ping'
}

export type ClientMessage =
  | AuthMessage
  | JoinRoomMessage
  | ChatMessage
  | TypingMessage
  | MarkReadMessage
  | MessageBurnedMessage
  | MessageEditedMessage
  | RoomClearedMessage
  | RoomLockChangedMessage
  | IntimacyRestartMessage
  | PingMessage

// ==================== 服务端推送的消息 ====================

export interface ConnectedResponse {
  type: 'connected'
  conn_id: number
  msg: string
}

export interface AuthSuccessResponse {
  type: 'auth_success'
  user_id: number
  nickname: string
  avatar: string
}

export interface RoomJoinedResponse {
  type: 'room_joined'
  room_id: number
  users: OnlineUser[]
  online_count: number
}

export interface MessageResponse {
  type: 'message'
  room_id: number
  message_id: number
  message_type: 'text' | 'image' | 'voice' | 'video' | 'file'
  from_user_id: number
  from_nickname: string
  from_avatar: string
  content: string
  time: string
  // 视频消息
  video_url?: string
  video_thumbnail?: string
  video_duration?: number
  // 文件消息
  file_name?: string
  file_size?: number
  file_extension?: string
  file_url?: string
  // 引用回复
  reply_to?: {
    message_id: number
    content: string
    user_id: number
    nickname: string
    message_type: number | string
    deleted?: boolean
  }
  // 好感度信息
  intimacy?: IntimacyInfo
}

export interface UserJoinedResponse {
  type: 'user_joined'
  room_id: number
  user_id: number
  nickname: string
  avatar: string
  online_count: number
}

export interface UserLeftResponse {
  type: 'user_left'
  room_id: number
  user_id: number
  nickname: string
  online_count: number
}

export interface TypingResponse {
  type: 'typing'
  user_id: number
  nickname: string
  typing: boolean
}

export interface MessageReadResponse {
  type: 'message_read'
  message_ids: number[]
  reader_id: number
  reader_nickname: string
  read_at: string
}

export interface MarkReadSuccessResponse {
  type: 'mark_read_success'
  count: number
}

export interface MessageBurnedResponse {
  type: 'message_burned'
  message_id: number
  burned_by: number
  burned_by_nickname: string
}

export interface MessageEditedResponse {
  type: 'message_edited'
  message_id: number
  content: string
  edited_at: string
  edited_by: number
  edited_by_nickname: string
}

export interface RoomClearedResponse {
  type: 'room_cleared'
  cleared_by: number
  cleared_by_nickname: string
  hard_delete: boolean
  is_restore?: boolean // 是否是恢复操作
}

export interface RoomLockChangedResponse {
  type: 'room_lock_changed'
  lock: number
}

export interface IntimacyStartResponse {
  type: 'intimacy_start'
  room_id: number
}

export interface IntimacyCompleteResponse {
  type: 'intimacy_complete'
  room_id: number
  exp_gain?: number
  intimacy?: {
    current_exp: number
    current_level: number
    level_name: string
    level_color: string
    level_icon: string
    total_messages: number
    next_level_exp: number
    progress_percent: number
  }
}

export interface IntimacyResetResponse {
  type: 'intimacy_reset'
  room_id: number
}

export interface PongResponse {
  type: 'pong'
}

export interface ErrorResponse {
  type: 'error'
  msg: string
}

export type ServerMessage =
  | ConnectedResponse
  | AuthSuccessResponse
  | RoomJoinedResponse
  | MessageResponse
  | UserJoinedResponse
  | UserLeftResponse
  | TypingResponse
  | MessageReadResponse
  | MarkReadSuccessResponse
  | MessageBurnedResponse
  | MessageEditedResponse
  | RoomClearedResponse
  | RoomLockChangedResponse
  | IntimacyStartResponse
  | IntimacyCompleteResponse
  | IntimacyResetResponse
  | PongResponse
  | ErrorResponse

// ==================== WebSocket 状态 ====================

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'authed'

export interface WebSocketState {
  status: ConnectionStatus
  currentRoomId: number | null
  onlineUsers: OnlineUser[]
  typingUsers: Map<number, { nickname: string; timeout: ReturnType<typeof setTimeout> }>
  // 亲密互动
  intimacyActive: boolean
  intimacyStartTime: number | null
}
