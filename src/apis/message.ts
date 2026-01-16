/**
 * 消息相关 API
 */
import request from '@/utils/request'

export interface Message {
  id: number | string
  room_id: number
  type: 'normal' | 'text' | 'image' | 'voice' | 'video' | 'file' | 'system' | 'reply'
  text: string
  time: string
  isOwn: boolean
  sender?: {
    id: number
    nickname: string
    avatar?: string
  }
  // 图片消息
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
  reply_to?: {
    message_id: number
    content: string
    user_id: number
    nickname: string
    message_type: string
    deleted?: boolean
  }
  // 已读信息
  is_read?: boolean
  read_count?: number
}

export interface MessageListResponse {
  code: number
  msg: string
  data: {
    messages: Message[]
    has_more: boolean
  }
}

export interface SendMessageResponse {
  code: number
  msg: string
  data: {
    id: number | string  // 后端返回的是 id，可能是数字或字符串
    type?: string
    text?: string
    time?: string
    reply_to?: any
    imageUrl?: string   // 图片URL（后端返回的字段名）
    image_url?: string  // 备用字段
    videoUrl?: string   // 视频URL
    video_url?: string  // 备用字段
    videoThumbnail?: string  // 视频缩略图
    video_thumbnail?: string // 备用字段
    videoDuration?: number   // 视频时长
    video_duration?: number  // 备用字段
    content?: string    // 内容（可能包含图片/视频路径）
    intimacy?: {
      current_exp: number
      current_level: number
    }
  }
}

/**
 * 获取房间消息列表
 */
export function getMessageList(roomId: number, page: number = 1, limit: number = 20, lastTime?: string) {
  return request<MessageListResponse>({
    url: '/message/list',
    method: 'get',
    params: {
      room_id: roomId,
      page,
      limit,
      last_time: lastTime
    }
  })
}

/**
 * 发送文本消息
 */
export function sendTextMessage(roomId: number, content: string, replyTo?: number) {
  return request<SendMessageResponse>({
    url: '/message/sendText',
    method: 'post',
    data: {
      room_id: roomId,
      content,
      reply_to: replyTo
    }
  })
}

/**
 * 发送图片消息
 */
export function sendImageMessage(roomId: number, image: File) {
  const formData = new FormData()
  formData.append('room_id', String(roomId))
  formData.append('image', image)
  
  return request<SendMessageResponse>({
    url: '/message/sendImage',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000 // 60秒超时，适配3M带宽上传大图片
  })
}

/**
 * 发送视频消息
 */
export function sendVideoMessage(roomId: number, video: File) {
  const formData = new FormData()
  formData.append('room_id', String(roomId))
  formData.append('video', video)
  
  return request<SendMessageResponse>({
    url: '/message/sendVideo',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 120000 // 120秒超时，视频文件通常更大
  })
}

/**
 * 发送文件消息
 */
export function sendFileMessage(roomId: number, file: File) {
  const formData = new FormData()
  formData.append('room_id', String(roomId))
  formData.append('file', file)
  
  return request<SendMessageResponse>({
    url: '/message/sendFile',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 120000 // 120秒超时
  })
}

/**
 * 撤回消息
 */
export function recallMessage(messageId: number) {
  return request<{ code: number; msg: string }>({
    url: '/message/recall',
    method: 'post',
    data: { message_id: messageId }
  })
}

/**
 * 焚毁消息
 */
export function burnMessage(messageId: number) {
  return request<{ code: number; msg: string }>({
    url: '/message/burn',
    method: 'post',
    data: { message_id: messageId }
  })
}

/**
 * 标记消息已读
 */
export function markMessagesRead(messageIds: number[]) {
  return request<{ code: number; msg: string; data: { count: number } }>({
    url: '/message/markRead',
    method: 'post',
    data: { message_ids: messageIds }
  })
}

/**
 * 清理房间消息
 */
export function clearRoomMessages(roomId: number, hardDelete: boolean = false) {
  return request<{ code: number; msg: string }>({
    url: '/message/clearRoom',
    method: 'post',
    data: { room_id: roomId, hard_delete: hardDelete }
  })
}
