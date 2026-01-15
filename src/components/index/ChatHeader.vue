<template>
  <div class="chat-header">
    <div class="header-left">
      <h2 class="room-title">{{ roomName || '选择房间开始聊天' }}</h2>
      
      <!-- 房间信息徽章 -->
      <div v-if="roomName" class="header-badges">
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
        
        <!-- 私密房间标识 -->
        <div v-if="isPrivateRoom" class="badge badge-private">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          <span>私密</span>
        </div>
      </div>
    </div>

    <div class="header-right">
      <!-- 正在输入提示 -->
      <div v-if="typingUsers.length > 0" class="typing-indicator">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span class="typing-text">{{ typingText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  roomName?: string
  totalUsers?: number
  onlineUsers?: number
  wsConnected?: boolean
  isPrivateRoom?: boolean
  typingUsers?: Array<{ id: string | number; nickname: string }>
}

const props = withDefaults(defineProps<Props>(), {
  totalUsers: 0,
  onlineUsers: 0,
  wsConnected: false,
  isPrivateRoom: false,
  typingUsers: () => []
})

// 计算正在输入的文本
const typingText = computed(() => {
  const users = props.typingUsers
  if (users.length === 0) return ''
  if (users.length === 1) return `${users[0].nickname} 正在输入...`
  return `${users[0].nickname} 等${users.length}人正在输入...`
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

.header-badges {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  flex-wrap: nowrap;
  flex-shrink: 0;
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
  background: linear-gradient(135deg, rgba($pink-color, 0.1), rgba($pink-color, 0.15));
  color: $pink-color;
  border: 1px solid rgba($pink-color, 0.2);

  svg {
    animation: heartbeat 1.5s ease-in-out infinite;
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

// ==================== 右侧区域 ====================
.header-right {
  display: flex;
  align-items: center;
  gap: $spacing-md;
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

  .typing-text {
    display: none;
  }

  .typing-indicator {
    padding: $spacing-xs $spacing-sm;
  }
}
</style>
