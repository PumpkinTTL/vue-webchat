<template>
  <div class="header-content">
    <div class="header-left">
      <h2 
        class="room-title animate__animated animate__fadeInLeft" 
        :class="{ 'private-room-title': isPrivateRoom && intimacyInfo && isPrivateBadgeLit }"
        :style="isPrivateRoom && intimacyInfo && isPrivateBadgeLit ? { 
          '--intimacy-color': intimacyInfo.level_color,
          color: intimacyInfo.level_color 
        } : {}"
        style="--animate-duration: 0.4s"
      >
        {{ roomName || '选择房间开始聊天' }}
      </h2>
      
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
              <div class="connection-glow"></div>
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
              :class="{ 
                'has-intimacy': intimacyInfo, 
                'lit': isPrivateBadgeLit,
                'burst': showFloatingHearts
              }"
              :style="isPrivateBadgeLit && intimacyInfo ? { '--badge-color': intimacyInfo.level_color } : {}"
              @click.stop="$emit('toggle-intimacy-panel')"
              :title="intimacyInfo ? `Lv.${intimacyInfo.current_level} ${intimacyInfo.level_name}` : '私密房间'"
            >
              <!-- 脉冲波纹 -->
              <div v-if="isPrivateBadgeLit" class="pulse-ring"></div>
              
              <!-- 闪烁星光 -->
              <div v-if="isPrivateBadgeLit" class="sparkle s1"></div>
              <div v-if="isPrivateBadgeLit" class="sparkle s2"></div>
              <div v-if="isPrivateBadgeLit" class="sparkle s3"></div>
              
              <!-- 发送消息时的超强爆发效果 -->
              <template v-if="showFloatingHearts">
                <!-- 多层波纹 -->
                <div class="burst-ring ring-1" :key="`ring1-${heartsAnimationKey}`"></div>
                <div class="burst-ring ring-2" :key="`ring2-${heartsAnimationKey}`"></div>
                <div class="burst-ring ring-3" :key="`ring3-${heartsAnimationKey}`"></div>
                
                <!-- 8方向爆发星光 -->
                <div class="burst-sparkle bs1" :key="`bs1-${heartsAnimationKey}`"></div>
                <div class="burst-sparkle bs2" :key="`bs2-${heartsAnimationKey}`"></div>
                <div class="burst-sparkle bs3" :key="`bs3-${heartsAnimationKey}`"></div>
                <div class="burst-sparkle bs4" :key="`bs4-${heartsAnimationKey}`"></div>
                <div class="burst-sparkle bs5" :key="`bs5-${heartsAnimationKey}`"></div>
                <div class="burst-sparkle bs6" :key="`bs6-${heartsAnimationKey}`"></div>
                <div class="burst-sparkle bs7" :key="`bs7-${heartsAnimationKey}`"></div>
                <div class="burst-sparkle bs8" :key="`bs8-${heartsAnimationKey}`"></div>
                
                <!-- 闪光效果 -->
                <div class="burst-flash" :key="`flash-${heartsAnimationKey}`"></div>
              </template>
              
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              <span v-if="intimacyInfo">Lv.{{ intimacyInfo.current_level }}</span>
              <span v-else>私密</span>
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

.header-content {
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
  overflow: visible;
  text-overflow: ellipsis;
  flex-shrink: 0;
  transition: all 0.3s ease;
  position: relative;
}

// 私密房间标题特效
.private-room-title {
  font-weight: $font-weight-bold !important;
  position: relative;
  
  // 左侧装饰条
  &::before {
    content: '';
    position: absolute;
    left: -12px;
    top: 50%;
    transform: translateY(-50%);
    width: 2px;
    height: 0;
    background: var(--intimacy-color, #ec4899);
    border-radius: 2px;
    animation: bar-grow 2s ease-in-out infinite;
    pointer-events: none;
  }
  
  // 底部装饰线
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--intimacy-color, #ec4899),
      transparent
    );
    animation: underline-flow 3s ease-in-out infinite;
    pointer-events: none;
  }
}

@keyframes bar-grow {
  0%, 100% {
    height: 0;
    opacity: 0.5;
  }
  50% {
    height: 100%;
    opacity: 1;
  }
}

@keyframes underline-flow {
  0%, 100% {
    width: 0;
    left: 0;
  }
  50% {
    width: 100%;
    left: 0;
  }
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
  position: relative;
  overflow: visible;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba($success-color, 0.15);
    border-color: rgba($success-color, 0.3);
    transform: translateY(-1px);
  }
}

.online-dot {
  width: 6px;
  height: 6px;
  background: $success-color;
  border-radius: $border-radius-round;
  animation: pulse 2s ease-in-out infinite;
  position: relative;
  z-index: 2;
  box-shadow: 0 0 8px $success-color;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.9);
  }
}

// 连接状态徽章
.badge-connection {
  background: rgba($text-tertiary, 0.1);
  color: $text-tertiary;
  border: 1px solid rgba($text-tertiary, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &.ws-connected {
    background: rgba($primary-color, 0.1);
    color: $primary-color;
    border-color: rgba($primary-color, 0.2);
    
    svg {
      animation: lightning-pulse 2s ease-in-out infinite;
      filter: drop-shadow(0 0 4px $primary-color);
    }
    
    .connection-glow {
      opacity: 1;
    }
    
    &:hover {
      background: rgba($primary-color, 0.15);
      border-color: rgba($primary-color, 0.3);
      transform: translateY(-1px);
    }
  }
  
  &:not(.ws-connected) {
    svg {
      animation: rotate-slow 3s linear infinite;
    }
  }
}

.connection-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent 30%, rgba($primary-color, 0.1) 50%, transparent 70%);
  background-size: 200% 200%;
  animation: shimmer-connection 3s ease-in-out infinite;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

@keyframes lightning-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes rotate-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes shimmer-connection {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
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
    
    &:hover {
      background: rgba($primary-color, 0.2);
      border-color: rgba($primary-color, 0.4);
    }
  }
}

// 深色模式 - 在线徽章
:global(.dark-mode) .badge-online {
  background: rgba($success-color, 0.15);
  border-color: rgba($success-color, 0.3);
  
  &:hover {
    background: rgba($success-color, 0.2);
    border-color: rgba($success-color, 0.4);
  }
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
  overflow: hidden;

  svg {
    transition: all 0.3s;
    position: relative;
    z-index: 2;
  }
  
  span {
    position: relative;
    z-index: 2;
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
    
    // 1. 边框运动动画
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
      mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
      mask-composite: exclude;
      animation: border-snake 2s linear infinite;
      pointer-events: none;
      z-index: 1;
    }
    
    // 2. 渐变背景流动
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: $border-radius-base;
      background: linear-gradient(
        45deg,
        transparent 30%,
        color-mix(in srgb, var(--badge-color, #ec4899) 20%, transparent) 50%,
        transparent 70%
      );
      background-size: 200% 200%;
      animation: gradient-flow 3s ease-in-out infinite;
      pointer-events: none;
      z-index: 0;
    }
  }
}

// 脉冲波纹容器
.badge-private.lit {
  // 3. 脉冲波纹效果
  .pulse-ring {
    position: absolute;
    inset: -4px;
    border-radius: $border-radius-base;
    border: 2px solid var(--badge-color, #ec4899);
    opacity: 0;
    animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    pointer-events: none;
    z-index: 0;
  }
  
  // 4. 闪烁星光
  .sparkle {
    position: absolute;
    width: 3px;
    height: 3px;
    background: var(--badge-color, #ec4899);
    border-radius: 50%;
    opacity: 0;
    pointer-events: none;
    z-index: 3;
    
    &::before,
    &::after {
      content: '';
      position: absolute;
      background: var(--badge-color, #ec4899);
      border-radius: 50%;
    }
    
    &::before {
      width: 1px;
      height: 6px;
      top: -1.5px;
      left: 1px;
    }
    
    &::after {
      width: 6px;
      height: 1px;
      top: 1px;
      left: -1.5px;
    }
    
    &.s1 {
      top: 20%;
      left: 15%;
      animation: sparkle 2s ease-in-out infinite;
    }
    
    &.s2 {
      top: 60%;
      right: 20%;
      animation: sparkle 2s ease-in-out 0.7s infinite;
    }
    
    &.s3 {
      top: 40%;
      right: 10%;
      animation: sparkle 2s ease-in-out 1.4s infinite;
    }
  }
  
  // 5. 发送消息时的爆发效果
  &.burst {
    animation: burst-shake 0.5s ease-out;
    
    svg {
      animation: heartbeat 1.5s ease-in-out infinite, burst-scale 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
    }
    
    // 强化背景流动
    &::after {
      animation: gradient-flow 3s ease-in-out infinite, burst-glow 0.6s ease-out;
    }
    
    // 边框加速
    &::before {
      animation: border-snake 0.5s linear !important;
    }
  }
  
  // 多层爆发波纹
  .burst-ring {
    position: absolute;
    border-radius: $border-radius-base;
    border: 3px solid var(--badge-color, #ec4899);
    opacity: 0;
    pointer-events: none;
    z-index: 0;
    
    &.ring-1 {
      inset: -6px;
      animation: burst-ring 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    &.ring-2 {
      inset: -4px;
      border-width: 2px;
      animation: burst-ring 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s;
    }
    
    &.ring-3 {
      inset: -8px;
      border-width: 4px;
      animation: burst-ring 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.05s;
    }
  }
  
  // 爆发星光（8个方向）
  .burst-sparkle {
    position: absolute;
    width: 5px;
    height: 5px;
    background: var(--badge-color, #ec4899);
    border-radius: 50%;
    box-shadow: 0 0 8px var(--badge-color, #ec4899);
    opacity: 0;
    pointer-events: none;
    z-index: 3;
    
    &::before,
    &::after {
      content: '';
      position: absolute;
      background: var(--badge-color, #ec4899);
      border-radius: 50%;
      box-shadow: 0 0 6px var(--badge-color, #ec4899);
    }
    
    &::before {
      width: 2px;
      height: 12px;
      top: -3.5px;
      left: 1.5px;
    }
    
    &::after {
      width: 12px;
      height: 2px;
      top: 1.5px;
      left: -3.5px;
    }
    
    // 8个方向
    &.bs1 {
      top: 50%;
      left: -15px;
      animation: burst-sparkle-left 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    &.bs2 {
      top: -15px;
      left: 50%;
      animation: burst-sparkle-top 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.05s;
    }
    
    &.bs3 {
      top: 50%;
      right: -15px;
      animation: burst-sparkle-right 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.1s;
    }
    
    &.bs4 {
      bottom: -15px;
      left: 50%;
      animation: burst-sparkle-bottom 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.08s;
    }
    
    &.bs5 {
      top: 10%;
      left: 10%;
      animation: burst-sparkle-tl 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.03s;
    }
    
    &.bs6 {
      top: 10%;
      right: 10%;
      animation: burst-sparkle-tr 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.06s;
    }
    
    &.bs7 {
      bottom: 10%;
      right: 10%;
      animation: burst-sparkle-br 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.09s;
    }
    
    &.bs8 {
      bottom: 10%;
      left: 10%;
      animation: burst-sparkle-bl 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.04s;
    }
  }
  
  // 闪光效果
  .burst-flash {
    position: absolute;
    inset: -20px;
    border-radius: $border-radius-base;
    background: radial-gradient(
      circle,
      var(--badge-color, #ec4899) 0%,
      transparent 70%
    );
    opacity: 0;
    animation: burst-flash 0.4s ease-out;
    pointer-events: none;
    z-index: 1;
  }
}

// 动画定义
@keyframes border-snake {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes gradient-flow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
}

// 爆发动画
@keyframes burst-ring {
  0% {
    transform: scale(0.8);
    opacity: 0.9;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

// 8方向星光爆发
@keyframes burst-sparkle-left {
  0% {
    opacity: 0;
    transform: translate(20px, 0) scale(0) rotate(0deg);
  }
  30% {
    opacity: 1;
    transform: translate(10px, 0) scale(1.5) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: translate(-30px, 0) scale(0.3) rotate(360deg);
  }
}

@keyframes burst-sparkle-top {
  0% {
    opacity: 0;
    transform: translate(0, 20px) scale(0) rotate(0deg);
  }
  30% {
    opacity: 1;
    transform: translate(0, 10px) scale(1.5) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: translate(0, -30px) scale(0.3) rotate(360deg);
  }
}

@keyframes burst-sparkle-right {
  0% {
    opacity: 0;
    transform: translate(-20px, 0) scale(0) rotate(0deg);
  }
  30% {
    opacity: 1;
    transform: translate(-10px, 0) scale(1.5) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: translate(30px, 0) scale(0.3) rotate(360deg);
  }
}

@keyframes burst-sparkle-bottom {
  0% {
    opacity: 0;
    transform: translate(0, -20px) scale(0) rotate(0deg);
  }
  30% {
    opacity: 1;
    transform: translate(0, -10px) scale(1.5) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: translate(0, 30px) scale(0.3) rotate(360deg);
  }
}

@keyframes burst-sparkle-tl {
  0% {
    opacity: 0;
    transform: translate(15px, 15px) scale(0) rotate(0deg);
  }
  30% {
    opacity: 1;
    transform: translate(8px, 8px) scale(1.5) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: translate(-25px, -25px) scale(0.3) rotate(360deg);
  }
}

@keyframes burst-sparkle-tr {
  0% {
    opacity: 0;
    transform: translate(-15px, 15px) scale(0) rotate(0deg);
  }
  30% {
    opacity: 1;
    transform: translate(-8px, 8px) scale(1.5) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: translate(25px, -25px) scale(0.3) rotate(360deg);
  }
}

@keyframes burst-sparkle-br {
  0% {
    opacity: 0;
    transform: translate(-15px, -15px) scale(0) rotate(0deg);
  }
  30% {
    opacity: 1;
    transform: translate(-8px, -8px) scale(1.5) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: translate(25px, 25px) scale(0.3) rotate(360deg);
  }
}

@keyframes burst-sparkle-bl {
  0% {
    opacity: 0;
    transform: translate(15px, -15px) scale(0) rotate(0deg);
  }
  30% {
    opacity: 1;
    transform: translate(8px, -8px) scale(1.5) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: translate(-25px, 25px) scale(0.3) rotate(360deg);
  }
}

@keyframes burst-scale {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes burst-glow {
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.3;
  }
}

@keyframes burst-flash {
  0% {
    opacity: 0;
  }
  30% {
    opacity: 0.6;
  }
  100% {
    opacity: 0;
  }
}

@keyframes burst-shake {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  10% {
    transform: translateY(-2px) rotate(-2deg);
  }
  20% {
    transform: translateY(2px) rotate(2deg);
  }
  30% {
    transform: translateY(-2px) rotate(-1deg);
  }
  40% {
    transform: translateY(2px) rotate(1deg);
  }
  50% {
    transform: translateY(-1px) rotate(-0.5deg);
  }
  60% {
    transform: translateY(1px) rotate(0.5deg);
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

// 深色模式 - 私密徽章未点亮
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
  .header-content {
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
