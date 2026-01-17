/**
 * 亲密度系统 API
 */
import request from '@/utils/request'
import type { IntimacyLevel, IntimacyInfo } from '@/types/intimacy'

/**
 * 获取用户在指定房间的亲密度信息
 */
export const getIntimacyInfo = (roomId: number) => {
  return request<{
    code: number
    msg: string
    data: IntimacyInfo
  }>({
    url: `/intimacy/info/${roomId}`,
    method: 'get'
  })
}

/**
 * 获取所有等级配置
 */
export const getLevels = () => {
  return request<{
    code: number
    msg: string
    data: IntimacyLevel[]
  }>({
    url: '/intimacy/levels',
    method: 'get'
  })
}

/**
 * 领取亲密互动好感度（60秒在线奖励）
 */
export const collectInteractionExp = (roomId: number) => {
  return request<{
    code: number
    msg: string
    data: {
      exp_gain: number
      current_exp: number
      current_level: number
      level_up: boolean
      level_name: string
      intimacy: {
        code: number
        data: IntimacyInfo
      }
    }
  }>({
    url: '/intimacy/collect',
    method: 'post',
    data: { room_id: roomId }
  })
}
