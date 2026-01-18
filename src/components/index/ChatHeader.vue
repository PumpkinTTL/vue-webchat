<template>
  <div class="chat-header">
    <div class="header-left">
      <h2 class="room-title animate__animated animate__fadeInLeft" style="--animate-duration: 0.4s">{{ roomName || '选择房间开始聊天' }}</h2>
      
      <!-- 房间信息徽章 / 正在输入 二选一 -->
      <div v-if="roomName" class="header-status">
        <!-- 正在输入提示 -->
        <Transition
          enter-active-class="animate__animated animate__fadeIn animate__faster"
          leave-active-class="animate__animated animate__fadeOut animate__faster"
          mode="out-in"
        >
          <div v-if="typingUsers.length > 0" key="typing" class="typing-indicator">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="typing-text">{{ typingText }}</span>
          </div>
          
          <!-- 房间信息徽章 -->
          <div v-else key="badges" class="header-badges">
            <!-- 在线人数 -->
            <div class="badge badge-online">
              <div class="online-dot"></div>
              <span>{{ totalUsers }}人 / {{ onlineUsers }}在线</span>
            </div>
            
            <!-- 连接状态 -->
            <div class="badge badge-connection" :class="{ 'ws-connected': wsConnected }">
              <svg v-if="wsConnected" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <path d="M2 12h20" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>{{ wsConnected ? 'Socket' : 'HTTP' }}</span>
            </div>
            
            <!-- 私密房间标识 - 可点击打开亲密度面板 -->
            <div 
              v-if="isPrivateRoom" 
              class="badge badge-private" 
              :class="{ 'has-intimacy': intimacyInfo, 'lit': isPrivateBadgeLit }"
              :style="isPrivateBadgeLit && intimacyInfo ? { '--badge-color': intimacyInfo.level_color } : {}"
              @click.stop="$emit('toggle-intimacy-panel')"
              :title="intimacyInfo ? `Lv.${intimacyInfo.current_level} ${intimacyInfo.level_name}` : '私密房间'"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              <span v-if="intimacyInfo">Lv.{{ intimacyInfo.current_level }}</span>
              <span v-else>私密</span>
              
              <!-- 爱心飘动动画 -->
              <div v-if="showFloatingHearts" class="floating-hearts" :key="heartsAnimationKey">
                <font-awesome-icon 
                  icon="heart" 
                  class="fh fh-1" 
                  :style="{ color: intimacyInfo?.level_color || '#ec4899' }" 
                />
                <font-awesome-icon 
                  icon="heart" 
                  class="fh fh-2" 
                  :style="{ color: intimacyInfo?.level_color || '#ec4899' }" 
                />
                <font-awesome-icon 
                  icon="heart" 
                  class="fh fh-3" 
                  :style="{ color: intimacyInfo?.level_color || '#ec4899' }" 
                />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <div class="header-right">
      <!-- 右侧预留区域，可以添加其他功能按钮 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IntimacyInfo } from '@/types/intimacy'

interface Props {
  roomName?: string
  totalUsers?: number
  onlineUsers?: number
  wsConnected?: boolean
  isPrivateRoom?: boolean
  typingUsers?: Array<{ id: string | number; nickname: string }>
  isLocked?: boolean
  intimacyInfo?: IntimacyInfo | null
  showFloatingHearts?: boolean
  heartsAnimationKey?: number
}

const props = withDefaults(defineProps<Props>(), {
  totalUsers: 0,
  onlineUsers: 0,
  wsConnected: false,
  isPrivateRoom: false,
  typingUsers: () => [],
  isLocked: false,
  intimacyInfo: null,
  showFloatingHearts: false,
  heartsAnimationKey: 0
})

defineEmits<{
  'toggle-intimacy-panel': []
}>()

// 计算正在输入的文本
const typingText = computed(() => {
  const users = props.typingUsers
  if (users.length === 0) return ''
  if (users.length === 1) return `${users[0].nickname} 正在输入...`
  return `${users[0].nickname} 等${users.length}人正在输入...`
})

// 计算私密标签是否应该点亮（两人都在线）
const isPrivateBadgeLit = computed(() => {
  // 必须是私密房间且有亲密度信息
  if (!props.isPrivateRoom || !props.intimacyInfo) return false
  
  // 私密房间总人数应该是2，在线人数也是2时才点亮
  return props.totalUsers === 2 && props.onlineUsers === 2
})
</script>

<style lang="scss" scoped>
// 变量已通过 vite.config.ts 全局导入

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-lg;
  padding: 0 $spacing-lg;
  height: 100%;
}

// ==================== 左侧区域 ====================
.header-left {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.room-title {
  font-family: $font-family-heading;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.dark-mode .room-title {
  color: $text-primary-dark;
}

.header-status {
  display: flex;
  align-items: center;
  min-height: 28px;
}

.header-badges {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  flex-wrap: nowrap;
  flex-shrink: 0;
}

// 正在输入提示
.typing-indicator {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: rgba($primary-color, 0.1);
  border-radius: $border-radius-base;
  color: $primary-color;
  font-size: $font-size-sm;
}

.typing-dots {
  display: flex;
  gap: 4px;

  span {
    width: 4px;
    height: 4px;
    background: $primary-color;
    border-radius: $border-radius-round;
    animation: typingDot 1.4s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes typingDot {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

.typing-text {
  font-weight: $font-weight-medium;
  white-space: nowrap;
}

.badge {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: 4px 10px;
  border-radius: $border-radius-base;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;

  svg {
    width: 14px;
    height: 14px;
  }
}

// 在线人数徽章
.badge-online {
  background: rgba($success-color, 0.1);
  color: $success-color;
  border: 1px solid rgba($success-color, 0.2);
}

.online-dot {
  width: 6px;
  height: 6px;
  background: $success-color;
  border-radius: $border-radius-round;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 连接状态徽章
.badge-connection {
  background: rgba($text-tertiary, 0.1);
  color: $text-tertiary;
  border: 1px solid rgba($text-tertiary, 0.2);

  &.ws-connected {
    background: rgba($primary-color, 0.1);
    color: $primary-color;
    border-color: rgba($primary-color, 0.2);
  }
}

// 深色模式 - 连接状态徽章
:global(.dark-mode) .badge-connection {
  background: rgba($text-tertiary-dark, 0.15);
  color: $text-tertiary-dark;
  border-color: rgba($text-tertiary-dark, 0.3);

  &.ws-connected {
    background: rgba($primary-color, 0.15);
    color: $primary-color;
    border-color: rgba($primary-color, 0.3);
  }
}

// 深色模式 - 在线徽章
:global(.dark-mode) .badge-online {
  background: rgba($success-color, 0.15);
  border-color: rgba($success-color, 0.3);
}

// 深色模式 - 正在输入提示
:global(.dark-mode) .typing-indicator {
  background: rgba($primary-color, 0.15);
}

// 私密房间徽章
.badge-private {
  background: rgba($text-tertiary, 0.1);
  color: $text-tertiary;
  border: 1px solid rgba($text-tertiary, 0.2);
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  overflow: visible;

  svg {
    transition: all 0.3s;
  }
  
  &:hover {
    background: rgba($text-tertiary, 0.15);
    border-color: rgba($text-tertiary, 0.3);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &.has-intimacy {
    // 有亲密度信息时的额外样式
    font-weight: 600;
  }
  
  // 点亮状态（使用后端返回的颜色）
  &.lit {
    background: color-mix(in srgb, var(--badge-color, #ec4899) 10%, transparent);
    color: var(--badge-color, #ec4899);
    border: 1px solid color-mix(in srgb, var(--badge-color, #ec4899) 30%, transparent);
    
    svg {
      animation: heartbeat 1.5s ease-in-out infinite;
    }
    
    &:hover {
      background: color-mix(in srgb, var(--badge-color, #ec4899) 15%, transparent);
      border-color: color-mix(in srgb, var(--badge-color, #ec4899) 40%, transparent);
    }
    
    // 边框运动动画
    &::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: $border-radius-base;
      padding: 2px;
      background: linear-gradient(
        90deg,
        transparent,
        transparent,
        var(--badge-color, #ec4899),
        transparent,
        transparent
      );
      background-size: 200% 100%;
      -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      animation: border-snake 2s linear infinite;
      pointer-events: none;
    }
  }
}

@keyframes border-snake {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// 深色模式 - 私密徽章未点亮
:global(.dark-mode) .badge-private {
  background: rgba($text-tertiary-dark, 0.15);
  color: $text-tertiary-dark;
  border-color: rgba($text-tertiary-dark, 0.3);
  
  &:hover {
    background: rgba($text-tertiary-dark, 0.2);
    border-color: rgba($text-tertiary-dark, 0.4);
  }
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  10%, 30% {
    transform: scale(1.1);
  }
  20%, 40% {
    transform: scale(1);
  }
}

// 爱心飘动动画
.floating-hearts {
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 100;
}

.floating-hearts .fh {
  position: absolute;
  opacity: 0;
}

.floating-hearts .fh-1 {
  font-size: 10px;
  left: -8px;
  animation: heart-float 1.2s ease-out forwards;
}

.floating-hearts .fh-2 {
  font-size: 12px;
  left: 2px;
  animation: heart-float 1.2s ease-out 0.15s forwards;
}

.floating-hearts .fh-3 {
  font-size: 9px;
  left: 12px;
  animation: heart-float 1.2s ease-out 0.3s forwards;
}

@keyframes heart-float {
  0% {
    opacity: 1;
    transform: translateY(0) scale(0.6) rotate(0deg);
  }
  30% {
    opacity: 1;
    transform: translateY(-15px) scale(1) rotate(-10deg);
  }
  60% {
    opacity: 0.8;
    transform: translateY(-30px) scale(0.9) rotate(10deg);
  }
  100% {
    opacity: 0;
    transform: translateY(-50px) scale(0.6) rotate(-5deg);
  }
}

// ==================== 右侧区域 ====================
.header-right {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

// 徽章过渡动画
.badges-fade-enter-active,
.badges-fade-leave-active {
  transition: all 0.3s ease;
}

.badges-fade-enter-from,
.badges-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

// 正在输入过渡动画
.typing-fade-enter-active,
.typing-fade-leave-active {
  transition: all 0.2s ease;
}

.typing-fade-enter-from,
.typing-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

// ==================== 移动端适配 ====================
@media (max-width: 768px) {
  .chat-header {
    padding: 0 $spacing-sm;
    gap: $spacing-xs;
  }

  .header-left {
    gap: $spacing-sm;
  }

  .room-title {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    max-width: none;
    flex-shrink: 1;
    letter-spacing: -0.01em;
  }

  .header-badges {
    gap: 4px;
    flex-shrink: 0;
  }

  .badge {
    padding: 4px 6px;
    font-size: 10px;
    gap: 3px;
    min-width: auto;

    svg {
      width: 12px;
      height: 12px;
      flex-shrink: 0;
    }

    span {
      white-space: nowrap;
    }
  }

  .online-dot {
    width: 6px;
    height: 6px;
    flex-shrink: 0;
  }

  .badge-online span {
    font-size: 10px;
  }

  .typing-indicator {
    padding: $spacing-xs $spacing-sm;
  }
  
  .typing-text {
    font-size: 12px;
  }
}
</style>
