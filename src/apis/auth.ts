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
