<template>
  <div class="room-list">
    <!-- 空状态 -->
    <div v-if="rooms.length === 0" class="empty-state animate__animated animate__fadeIn" style="--animate-duration: 0.5s">
      <div class="empty-icon animate__animated animate__bounceIn" style="--animate-duration: 0.6s; --animate-delay: 0.1s">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <p class="empty-text animate__animated animate__fadeInUp" style="--animate-duration: 0.4s; --animate-delay: 0.2s">暂无房间</p>
      <p class="empty-hint animate__animated animate__fadeInUp" style="--animate-duration: 0.4s; --animate-delay: 0.25s">创建或加入房间开始聊天</p>
    </div>

    <!-- 房间列表 -->
    <div v-else class="room-items">
      <TransitionGroup name="room-list" tag="div" class="room-items-inner">
        <div
          v-for="(room, index) in rooms"
          :key="room.id"
          class="room-item animate__animated animate__fadeInLeft"
          :class="{ 'room-active': room.id === activeRoomId }"
          :style="{ '--animate-duration': '0.35s', '--animate-delay': `${index * 0.04}s` }"
          @click="selectRoom(room)"
        >
          <div class="room-icon">
            {{ room.name?.charAt(0) || 'R' }}
          </div>
          
          <div class="room-content">
            <div class="room-header">
              <span class="room-name">{{ room.name }}</span>
              <span class="room-badge">
                <span class="badge-label">ID</span>
                <span class="badge-value">{{ room.id }}</span>
              </span>
            </div>
            <p class="room-desc">{{ room.description || '暂无简介' }}</p>
          </div>

          <!-- 未读消息数 -->
          <div v-if="room.unreadCount" class="unread-badge animate__animated animate__pulse" style="--animate-duration: 0.5s">
            {{ room.unreadCount > 99 ? '99+' : room.unreadCount }}
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Room {
  id: string | number
  name: string
  description?: string
  unreadCount?: number
}

defineProps<{
  rooms: Room[]
  activeRoomId?: string | number
}>()

const emit = defineEmits<{
  selectRoom: [room: Room]
}>()

const selectRoom = (room: Room) => {
  emit('selectRoom', room)
}
</script>

<style lang="scss" scoped>
// 变量已通过 vite.config.ts 全局导入

.room-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  padding: $spacing-md;
}

// ==================== 空状态 ====================
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-3xl $spacing-lg;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: rgba($primary-color, 0.1);
  border-radius: $border-radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-lg;

  svg {
    width: 32px;
    height: 32px;
    color: $primary-color;
  }
}

.empty-text {
  font-family: $font-family-heading;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin: 0 0 $spacing-xs 0;
  transition: color $transition-base;
}

.dark-mode .empty-text {
  color: $text-primary-dark;
}

.empty-hint {
  font-size: $font-size-sm;
  color: $text-tertiary;
  margin: 0;
  transition: color $transition-base;
}

.dark-mode .empty-hint {
  color: $text-tertiary-dark;
}

// ==================== 房间列表 ====================
.room-items {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.room-items-inner {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

// 列表过渡动画
.room-list-enter-active,
.room-list-leave-active {
  transition: all 0.3s ease;
}

.room-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.room-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.room-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: transparent;
  border: 1px solid transparent;
  border-radius: $border-radius-base;
  cursor: pointer;
  transition: all $transition-fast;
  position: relative;

  &:hover {
    background: rgba($primary-color, 0.05);
    border-color: rgba($primary-color, 0.1);
  }

  &.room-active {
    background: rgba($primary-color, 0.1);
    border-color: $primary-color;

    .room-icon {
      background: $primary-color;
      color: white;
    }

    .room-name {
      color: $primary-color;
    }
  }
}

// ==================== 房间图标 ====================
.room-icon {
  width: 40px;
  height: 40px;
  background: rgba($primary-color, 0.1);
  color: $primary-color;
  border-radius: $border-radius-base;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: $font-family-heading;
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  text-transform: uppercase;
  flex-shrink: 0;
  transition: all $transition-fast;
}

// ==================== 房间内容 ====================
.room-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.room-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.room-name {
  font-family: $font-family-heading;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color $transition-base;
}

.dark-mode .room-name {
  color: $text-primary-dark;
}

.room-badge {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  background: rgba($text-tertiary, 0.1);
  border-radius: $border-radius-sm;
  font-size: $font-size-xs;
  flex-shrink: 0;
}

.badge-label {
  color: $text-tertiary;
  font-weight: $font-weight-medium;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color $transition-base;
}

.dark-mode .badge-label {
  color: $text-tertiary-dark;
}

.badge-value {
  color: $text-secondary;
  font-weight: $font-weight-semibold;
  transition: color $transition-base;
}

.dark-mode .badge-value {
  color: $text-secondary-dark;
}

.room-desc {
  font-size: $font-size-sm;
  color: $text-tertiary;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color $transition-base;
}

.dark-mode .room-desc {
  color: $text-tertiary-dark;
}

// ==================== 未读消息徽章 ====================
.unread-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: $danger-color;
  color: white;
  border-radius: $border-radius-round;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  flex-shrink: 0;
}

// ==================== 移动端适配 ====================
@media (max-width: 768px) {
  .room-list {
    padding: $spacing-sm;
    gap: $spacing-xs;
  }

  .empty-icon {
    width: 56px;
    height: 56px;

    svg {
      width: 28px;
      height: 28px;
    }
  }

  .empty-text {
    font-size: $font-size-sm;
  }

  .empty-hint {
    font-size: 12px;
  }

  .room-item {
    padding: $spacing-sm;
    gap: $spacing-sm;
  }

  .room-icon {
    width: 36px;
    height: 36px;
    font-size: $font-size-base;
  }

  .room-name {
    font-size: $font-size-sm;
  }

  .room-badge {
    padding: 1px 4px;
    font-size: 10px;
  }

  .room-desc {
    font-size: 12px;
  }

  .unread-badge {
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    font-size: 10px;
  }
}
</style>
