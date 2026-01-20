/**
 * 房间相关 API
 */
import request from '@/utils/request'

export interface Room {
  id: number
  name: string
  description?: string
  private?: number
  password?: string
  owner_id?: number
  lock?: number
  status?: number
  create_time?: string
}

export interface CreateRoomParams {
  name: string
  description?: string
  password?: string
}

export interface JoinRoomParams {
  room_id: number
  password?: string
}

export interface RoomListResponse {
  total: number
  list: Room[]
}

/**
 * 获取房间列表
 */
export function getRoomList(params?: { page?: number; limit?: number; name?: string }) {
  return request<RoomListResponse>({
    url: '/room/index',
    method: 'get',
    params
  })
}

/**
 * 获取用户加入的房间列表
 */
export function getUserRooms() {
  return request<{ code: number; msg: string; data: Room[] }>({
    url: '/roomUser/userRooms',
    method: 'get'
  })
}

/**
 * 创建房间
 */
export function createRoom(data: CreateRoomParams) {
  return request<{ code: number; msg: string; data: any }>({
    url: '/room/create',
    method: 'post',
    data
  })
}

/**
 * 加入房间
 */
export function joinRoom(data: JoinRoomParams) {
  return request<{ code: number; msg: string; data?: any }>({
    url: '/roomUser/join',
    method: 'post',
    data
  })
}

/**
 * 退出房间
 */
export function leaveRoom(roomId: number) {
  return request<{ code: number; msg: string }>({
    url: '/roomUser/leave',
    method: 'post',
    data: { room_id: roomId }
  })
}

/**
 * 获取房间详情
 */
export function getRoomInfo(roomId: number) {
  return request<Room>({
    url: `/room/read/${roomId}`,
    method: 'get'
  })
}

/**
 * 获取房间在线人数
 */
export function getRoomUserCount(roomId: number) {
  return request<{ code: number; msg: string; data: { room_id: number; total_count: number; online_count: number } }>({
    url: `/roomUser/count/${roomId}`,
    method: 'get'
  })
}

/**
 * 获取房间成员列表
 */
export function getRoomUserList(roomId: number) {
  return request<{ code: number; msg: string; data: { room_id: number; users: any[] } }>({
    url: `/roomUser/list/${roomId}`,
    method: 'get'
  })
}

/**
 * 检查用户是否在房间内
 */
export function checkUserInRoom(roomId: number) {
  return request<{ code: number; msg: string; data: { room_id: number; user_id: number; is_in_room: boolean } }>({
    url: '/roomUser/check',
    method: 'get',
    params: { room_id: roomId }
  })
}

/**
 * 更新房间信息
 */
export function updateRoom(roomId: number, data: Partial<CreateRoomParams>) {
  return request<{ code: number; msg: string; data?: any }>({
    url: `/room/${roomId}`,
    method: 'put',
    data
  })
}

/**
 * 删除房间
 */
export function deleteRoom(roomId: number) {
  return request<{ code: number; msg: string }>({
    url: `/room/${roomId}`,
    method: 'delete'
  })
}

/**
 * 锁定/解锁房间
 */
export function toggleRoomLock(roomId: number, lock: 0 | 1) {
  return request<{ code: number; msg: string; data: { lock: number } }>({
    url: '/room/toggleLock',
    method: 'post',
    data: { room_id: roomId, lock }
  })
}

/**
 * 清理房间消息
 */
export function clearRoomMessages(roomId: number, hardDelete: boolean = false) {
  return request<{ code: number; msg: string; data: { deleted_messages: number; deleted_files: number; hard_delete: boolean } }>({
    url: '/message/clearRoom',
    method: 'post',
    data: { room_id: roomId, hard_delete: hardDelete }
  })
}

/**
 * 恢复房间消息
 */
export function restoreRoomMessages(roomId: number) {
  return request<{ code: number; msg: string; data: { restored_messages: number } }>({
    url: '/message/restoreRoom',
    method: 'post',
    data: { room_id: roomId }
  })
}

/**
 * 获取房间软删除消息数量
 */
export function getDeletedMessagesCount(roomId: number) {
  return request<{ code: number; data: { count: number } }>({
    url: '/message/deletedCount',
    method: 'get',
    params: { room_id: roomId }
  })
}
