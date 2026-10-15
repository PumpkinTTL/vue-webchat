/**
 * 认证相关 API
 */
import request from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
  client_ip?: string
}

export interface LoginResponse {
  id: number
  nick_name: string
  avatar: string
}

export interface LoginResult {
  code: number
  msg: string
  data: LoginResponse
  token: string
}

/**
 * 用户登录
 */
export function login(data: LoginParams) {
  return request<LoginResult>({
    url: '/user/login',
    method: 'post',
    data
  })
}

/**
 * 记录页面访问
 */
export function logAccess(data: { client_ip: string; page: string }) {
  return request({
    url: '/logAccess',
    method: 'post',
    data
  })
}

/**
 * 上传头像
 * @param file 头像图片文件（后端字段名固定为 avatar）
 */
export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('avatar', file)
  return request<{ code: number; msg: string; data: { url: string; avatar: string } }>({
    url: '/user/uploadAvatar',
    method: 'post',
    data: formData,
    // 不手动设置 Content-Type，交给 axios 自动带 boundary
    timeout: 60000
  })
}

/**
 * 更新用户资料（昵称、签名）
 */
export function updateProfile(data: { nickname?: string; sign?: string }) {
  return request<{ code: number; msg: string; data?: any }>({
    url: '/user/update',
    method: 'post',
    data
  })
}
