<template>
  <Transition name="interaction-slide">
    <div v-if="visible" class="interaction-container">
      <div class="interaction-bar">
        <div class="interaction-content">
          <!-- 左侧用户 -->
          <div class="avatar-side left">
            <div class="interaction-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
              </svg>
            </div>
          </div>
          
          <!-- 中间心形和倒计时 -->
          <div class="interaction-center">
            <div class="connection-line"></div>
            <div class="heart-container">
              <svg class="heart-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
            </div>
            <div class="timer-display">{{ formattedTime }}</div>
          </div>
          
          <!-- 右侧用户 -->
          <div class="avatar-side right">
            <div class="interaction-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <!-- 领取按钮 -->
        <Transition name="collect-fade">
          <button 
            v-if="canCollect" 
            class="collect-btn"
            @click="handleCollect"
            :disabled="collecting"
          >
            <svg v-if="!collecting" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <svg v-else class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span>{{ collecting ? '领取中...' : '领取奖励' }}</span>
          </button>
        </Transition>
        
        <!-- 提示文本 -->
        <div class="interaction-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
          <span>{{ hintText }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  visible: boolean
  timeLeft: number
  canCollect: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  collect: []
}>()

const collecting = ref(false)

const formattedTime = computed(() => {
  const seconds = Math.max(0, Math.floor(props.timeLeft))
  return `${seconds}s`
})

const hintText = computed(() => {
  if (props.canCollect) {
    return '互动完成！点击领取奖励'
  }
  return '双方同时在线60秒即可领取奖励'
})

async function handleCollect() {
  if (collecting.value || !props.canCollect) return
  
  collecting.value = true
  emit('collect')
  
  // 2秒后重置状态（防止重复点击）
  setTimeout(() => {
    collecting.value = false
  }, 2000)
}
</script>

<style lang="scss" scoped>
.interaction-container {
  padding: 12px 16px;
  margin-bottom: 12px;
}

.interaction-bar {
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(236, 72, 153, 0.15);
}

.interaction-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.avatar-side {
  display: flex;
  align-items: center;
  flex: 1;
  
  &.left {
    justify-content: flex-end;
  }
  
  &.right {
    justify-content: flex-start;
  }
}

.interaction-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
  
  svg {
    width: 24px;
    height: 24px;
    color: white;
  }
  
  .left & {
    animation: avatar-move-left 3s ease-in-out infinite;
  }
  
  .right & {
    animation: avatar-move-right 3s ease-in-out infinite;
  }
}

@keyframes avatar-move-left {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(10px); }
}

@keyframes avatar-move-right {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-10px); }
}

.interaction-center {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.connection-line {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200%;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    #ec4899 20%,
    #f97316 50%,
    #ec4899 80%,
    transparent 100%
  );
  z-index: 0;
  animation: connection-flow 2s ease-in-out infinite;
}

@keyframes connection-flow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

.heart-container {
  position: relative;
  z-index: 1;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
}

.heart-icon {
  width: 28px;
  height: 28px;
  color: #ec4899;
  animation: heart-beat 1s ease-in-out infinite;
  filter: drop-shadow(0 0 8px rgba(236, 72, 153, 0.5));
}

@keyframes heart-beat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.timer-display {
  font-size: 13px;
  font-weight: 700;
  color: #ec4899;
  background: rgba(255, 255, 255, 0.95);
  padding: 4px 10px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 40px;
  text-align: center;
}

.collect-btn {
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, #ec4899, #f97316);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
  margin-bottom: 12px;
  
  svg {
    width: 18px;
    height: 18px;
    
    &.spin {
      animation: spin 1s linear infinite;
    }
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(236, 72, 153, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.interaction-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: $text-tertiary;
  
  svg {
    width: 14px;
    height: 14px;
  }
}

// 过渡动画
.interaction-slide-enter-active,
.interaction-slide-leave-active {
  transition: all 0.3s ease;
}

.interaction-slide-enter-from,
.interaction-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.collect-fade-enter-active,
.collect-fade-leave-active {
  transition: all 0.3s ease;
}

.collect-fade-enter-from,
.collect-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

// 深色模式
.dark-mode {
  .interaction-bar {
    background: rgba(30, 41, 59, 0.9);
    border-color: rgba(236, 72, 153, 0.25);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }
  
  .interaction-avatar {
    border-color: rgba(30, 41, 59, 0.8);
  }
  
  .heart-container {
    background: rgba(30, 41, 59, 0.8);
  }
  
  .timer-display {
    background: rgba(30, 41, 59, 0.95);
  }
  
  .interaction-hint {
    color: $text-tertiary-dark;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .interaction-container {
    padding: 8px 12px;
  }
  
  .interaction-bar {
    padding: 12px 16px;
  }
  
  .interaction-avatar {
    width: 40px;
    height: 40px;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
  
  .heart-container {
    width: 40px;
    height: 40px;
  }
  
  .heart-icon {
    width: 24px;
    height: 24px;
  }
  
  .timer-display {
    font-size: 12px;
    padding: 3px 8px;
  }
  
  .collect-btn {
    padding: 10px 16px;
    font-size: 13px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
  
  .interaction-hint {
    font-size: 11px;
    
    svg {
      width: 12px;
      height: 12px;
    }
  }
}
</style>
