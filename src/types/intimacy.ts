/**
 * 亲密度系统类型定义
 */

// 等级配置
export interface IntimacyLevel {
  id: number
  level: number
  name: string
  required_exp: number
  color: string
  icon: string
  description: string
  create_time: string
}

// 亲密度信息
export interface IntimacyInfo {
  current_exp: number
  current_level: number
  level_name: string
  level_color: string
  level_icon: string
  total_messages: number
  next_level_exp: number
  progress_percent: number
  partner?: {
    id: number
    nick_name: string
    avatar?: string
  }
}

// 经验获得提示
export interface ExpTip {
  id: string
  expGain: number
  messageType: string
  timestamp: number
}

// 升级数据
export interface LevelUpData {
  newLevel: number
  levelName: string
  levelColor: string
}

// 互动状态
export interface InteractionState {
  active: boolean
  startTime: number | null
  timeLeft: number
  canCollect: boolean
  collecting: boolean
}
