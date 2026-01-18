import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserInfo, saveUserInfo, clearUserInfo } from '@/utils/storage'

export interface UserInfo {
  id: number
  nick_name: string
  avatar: string
  token: string
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref<UserInfo | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => !!userInfo.value)
  const userId = computed(() => userInfo.value?.id || 0)
  const nickname = computed(() => userInfo.value?.nick_name || '')
  const avatar = computed(() => userInfo.value?.avatar || '')
  const token = computed(() => userInfo.value?.token || '')
  const isAdmin = computed(() => userInfo.value?.id === 3306) // 管理员ID

  // 初始化用户信息（从本地存储加载）
  const initUserInfo = () => {
    const savedUserInfo = getUserInfo()
    if (savedUserInfo) {
      userInfo.value = savedUserInfo
      console.log('✅ 从本地存储加载用户信息:', savedUserInfo)
    }
  }

  // 设置用户信息
  const setUserInfo = (info: UserInfo) => {
    // 处理头像URL
    if (info.avatar) {
      info.avatar = processAvatarUrl(info.avatar)
    }
    
    userInfo.value = info
    saveUserInfo(info)
    console.log('✅ 用户信息已保存到 Pinia 和本地存储:', info)
  }
  
  // 处理头像URL（内网穿透）
  const processAvatarUrl = (avatar: string): string => {
    if (!avatar) return ''
    
    // 如果已经是完整URL，直接返回
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar
    }
    
    // 如果是相对路径，拼接服务器URL
    const serverUrl = import.meta.env.VITE_SERVER_URL || ''
    return serverUrl + (avatar.startsWith('/') ? avatar : '/' + avatar)
  }

  // 清除用户信息
  const clearUser = () => {
    userInfo.value = null
    clearUserInfo()
    console.log('✅ 用户信息已清除')
  }

  // 更新用户信息（部分更新）
  const updateUserInfo = (updates: Partial<UserInfo>) => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...updates }
      saveUserInfo(userInfo.value)
    }
  }

  return {
    // 状态
    userInfo,
    // 计算属性
    isLoggedIn,
    userId,
    nickname,
    avatar,
    token,
    isAdmin,
    // 方法
    initUserInfo,
    setUserInfo,
    clearUser,
    updateUserInfo
  }
})
