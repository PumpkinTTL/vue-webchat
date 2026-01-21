/**
 * 亲密度系统状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { IntimacyLevel, IntimacyInfo, ExpTip, LevelUpData, InteractionState } from '@/types/intimacy'
import { getIntimacyInfo, getLevels, collectInteractionExp } from '@/apis/intimacy'

export const useIntimacyStore = defineStore('intimacy', () => {
  // ==================== 状态 ====================
  
  // 等级配置列表
  const levels = ref<IntimacyLevel[]>([])
  
  // 当前房间的亲密度信息
  const currentIntimacy = ref<IntimacyInfo | null>(null)
  
  // 伴侣用户信息
  const partnerUser = ref<{
    id: number
    nick_name: string
    avatar?: string
  } | null>(null)
  
  // 60秒互动状态
  const interaction = ref<InteractionState>({
    active: false,
    startTime: null,
    timeLeft: 60,
    canCollect: false,
    collecting: false
  })
  
  // 升级弹窗
  const showLevelUpModal = ref(false)
  const levelUpData = ref<LevelUpData | null>(null)
  
  // 经验提示队列
  const expTips = ref<ExpTip[]>([])
  
  // 倒计时定时器
  let countdownTimer: ReturnType<typeof setInterval> | null = null
  


  // ==================== 计算属性 ====================
  
  const hasIntimacy = computed(() => currentIntimacy.value !== null)
  
  const currentLevelInfo = computed(() => {
    if (!currentIntimacy.value) return null
    return levels.value.find(l => l.level === currentIntimacy.value!.current_level)
  })
  
  const nextLevelInfo = computed(() => {
    if (!currentIntimacy.value) return null
    return levels.value.find(l => l.level === currentIntimacy.value!.current_level + 1)
  })

  // ==================== 方法 ====================

  /**
   * 加载等级配置
   */
  async function loadLevels() {
    try {
      const result = await getLevels()
      if (result.code === 0) {
        levels.value = result.data
      }
    } catch (error) {
      console.error('[亲密度] 加载等级配置失败:', error)
    }
  }

  /**
   * 加载亲密度信息
   */
  async function loadIntimacyInfo(roomId: number) {
    try {
      const result = await getIntimacyInfo(roomId)
      if (result.code === 0) {
        currentIntimacy.value = result.data
        
        // 不在这里初始化 shownLevelsByRoom
        // 让 watch 自然检测，只有真正升级时才记录
        
        // 保存伴侣信息并处理头像URL
        if (result.data.partner) {
          partnerUser.value = {
            id: result.data.partner.id,
            nick_name: result.data.partner.nick_name,
            avatar: result.data.partner.avatar ? processAvatarUrl(result.data.partner.avatar) : undefined
          }
        }
        
        return result.data
      }
    } catch (error) {
      console.error('[亲密度] 加载亲密度信息失败:', error)
      return null
    }
  }
  
  /**
   * 处理头像URL（内网穿透）
   */
  function processAvatarUrl(avatar: string): string {
    if (!avatar) return ''
    
    // 如果已经是完整URL，直接返回
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar
    }
    
    // 如果是相对路径，拼接服务器URL
    const serverUrl = import.meta.env.VITE_SERVER_URL || ''
    return serverUrl + (avatar.startsWith('/') ? avatar : '/' + avatar)
  }

  /**
   * 更新亲密度信息（从消息返回的数据）
   */
  function updateIntimacyFromMessage(data: {
    exp_gain?: number
    current_exp: number
    current_level: number
    level_up?: boolean
    level_name?: string
    total_messages?: number
  }) {
    if (!currentIntimacy.value) return
    
    // 保存旧等级用于检测升级
    const oldLevel = currentIntimacy.value.current_level
    
    // 直接使用后端返回的current_exp（后端已经计算好了）
    currentIntimacy.value.current_exp = data.current_exp
    
    // 显示经验提示（如果有exp_gain）
    if (data.exp_gain) {
      addExpTip(data.exp_gain, 'message')
    }
    
    // 更新等级
    currentIntimacy.value.current_level = data.current_level
    
    if (data.level_name) {
      currentIntimacy.value.level_name = data.level_name
    }
    
    // 消息数+1（实时统计）
    if (data.total_messages !== undefined) {
      currentIntimacy.value.total_messages = data.total_messages
    } else {
      currentIntimacy.value.total_messages = (currentIntimacy.value.total_messages || 0) + 1
    }

    // 重新计算进度
    const currentLevelConfig = levels.value.find(l => l.level === data.current_level)
    const nextLevelConfig = levels.value.find(l => l.level === data.current_level + 1)
    
    if (currentLevelConfig && nextLevelConfig) {
      const expInCurrentLevel = currentIntimacy.value.current_exp - currentLevelConfig.required_exp
      const expNeededForNext = nextLevelConfig.required_exp - currentLevelConfig.required_exp
      currentIntimacy.value.progress_percent = Math.min(100, Math.max(0, parseFloat(((expInCurrentLevel / expNeededForNext) * 100).toFixed(2))))
      currentIntimacy.value.next_level_exp = nextLevelConfig.required_exp
      
      // 如果没有 level_name，使用配置中的名称
      if (!data.level_name) {
        currentIntimacy.value.level_name = currentLevelConfig.name
      }
      
      // 更新等级颜色
      currentIntimacy.value.level_color = currentLevelConfig.color
    } else if (currentLevelConfig && !nextLevelConfig) {
      // 已达到最高级
      currentIntimacy.value.progress_percent = 100
      currentIntimacy.value.next_level_exp = currentLevelConfig.required_exp
      
      // 如果没有 level_name，使用配置中的名称
      if (!data.level_name) {
        currentIntimacy.value.level_name = currentLevelConfig.name
      }
      
      // 更新等级颜色
      currentIntimacy.value.level_color = currentLevelConfig.color
    }

    // 检测升级：只有等级真正变化时才弹窗
    if (data.current_level > oldLevel) {
      const levelConfig = levels.value.find(l => l.level === data.current_level)
      if (levelConfig) {
        console.log('[亲密度] 检测到升级:', { oldLevel, newLevel: data.current_level })
        showLevelUp({
          newLevel: data.current_level,
          levelName: currentIntimacy.value.level_name || levelConfig.name,
          levelColor: levelConfig.color
        })
      }
    }
  }

  /**
   * 添加经验提示
   */
  function addExpTip(expGain: number, messageType: string = 'message') {
    // 检查用户是否开启了经验提示
    const showExpToast = localStorage.getItem('intimacy_show_exp_toast')
    if (showExpToast === '0') {
      console.log('[亲密度] 经验提示已关闭，跳过显示')
      return
    }
    
    const tip: ExpTip = {
      id: `exp-${Date.now()}-${Math.random()}`,
      expGain,
      messageType,
      timestamp: Date.now()
    }
    
    expTips.value.push(tip)
    
    // 3秒后自动移除
    setTimeout(() => {
      removeExpTip(tip.id)
    }, 3000)
  }

  /**
   * 移除经验提示
   */
  function removeExpTip(id: string) {
    const index = expTips.value.findIndex(t => t.id === id)
    if (index !== -1) {
      expTips.value.splice(index, 1)
    }
  }

  /**
   * 显示升级弹窗
   */
  function showLevelUp(data: LevelUpData) {
    levelUpData.value = data
    showLevelUpModal.value = true
  }

  /**
   * 关闭升级弹窗
   */
  function closeLevelUp() {
    showLevelUpModal.value = false
    levelUpData.value = null
  }

  /**
   * 启动60秒互动
   */
  function startInteraction() {
    interaction.value.active = true
    interaction.value.startTime = Date.now()
    interaction.value.timeLeft = 60
    interaction.value.canCollect = false

    // 启动倒计时
    if (countdownTimer) {
      clearInterval(countdownTimer)
    }

    countdownTimer = setInterval(() => {
      if (!interaction.value.active || !interaction.value.startTime) {
        stopCountdown()
        return
      }

      const elapsed = Math.floor((Date.now() - interaction.value.startTime) / 1000)
      interaction.value.timeLeft = Math.max(0, 60 - elapsed)

      // 前端倒计时仅用于显示，不触发任何操作
      // 服务器端会在60秒后自动处理
    }, 100) // 100ms 更新一次，更流畅
  }

  /**
   * 停止倒计时
   */
  function stopCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }

  /**
   * 互动完成
   */
  function completeInteraction() {
    stopCountdown()
    interaction.value.timeLeft = 0
    interaction.value.canCollect = true
  }

  /**
   * 重置互动（不改变active状态，只重置倒计时）
   */
  function resetInteraction() {
    stopCountdown()
    // 不设置 active = false，保持组件显示
    interaction.value.startTime = null
    interaction.value.timeLeft = 60
    interaction.value.canCollect = false
    interaction.value.collecting = false
  }
  
  /**
   * 完全停止互动（用于离开房间等场景）
   */
  function stopInteraction() {
    stopCountdown()
    interaction.value.active = false
    interaction.value.startTime = null
    interaction.value.timeLeft = 60
    interaction.value.canCollect = false
    interaction.value.collecting = false
  }

  /**
   * 从服务器更新亲密度信息（WebSocket广播）
   */
  function updateIntimacyFromServer(intimacyData: any, expGain: number) {
    if (!currentIntimacy.value) return
    
    // 保存旧等级用于检测升级
    const oldLevel = currentIntimacy.value.current_level
    
    // 直接使用服务器返回的数据
    currentIntimacy.value.current_exp = intimacyData.current_exp
    currentIntimacy.value.current_level = intimacyData.current_level
    currentIntimacy.value.level_name = intimacyData.level_name
    currentIntimacy.value.level_color = intimacyData.level_color
    currentIntimacy.value.level_icon = intimacyData.level_icon
    currentIntimacy.value.total_messages = intimacyData.total_messages
    currentIntimacy.value.next_level_exp = intimacyData.next_level_exp
    currentIntimacy.value.progress_percent = intimacyData.progress_percent
    
    // 显示经验提示
    addExpTip(expGain, 'interaction')
    
    // 检测升级：只有等级真正变化时才弹窗
    if (intimacyData.current_level > oldLevel) {
      const levelConfig = levels.value.find(l => l.level === intimacyData.current_level)
      if (levelConfig) {
        console.log('[亲密度] 检测到升级（互动）:', { oldLevel, newLevel: intimacyData.current_level })
        showLevelUp({
          newLevel: intimacyData.current_level,
          levelName: intimacyData.level_name || levelConfig.name,
          levelColor: levelConfig.color
        })
      }
    }
  }

  /**
   * 清空当前亲密度信息
   */
  function clearIntimacy() {
    currentIntimacy.value = null
    partnerUser.value = null
    stopInteraction()
  }

  return {
    // 状态
    levels,
    currentIntimacy,
    partnerUser,
    interaction,
    showLevelUpModal,
    levelUpData,
    expTips,
    
    // 计算属性
    hasIntimacy,
    currentLevelInfo,
    nextLevelInfo,
    
    // 方法
    loadLevels,
    loadIntimacyInfo,
    updateIntimacyFromMessage,
    updateIntimacyFromServer,
    addExpTip,
    removeExpTip,
    showLevelUp,
    closeLevelUp,
    startInteraction,
    completeInteraction,
    resetInteraction,
    stopInteraction,
    clearIntimacy
  }
})
