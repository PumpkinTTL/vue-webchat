<template>
  <div class="user-card animate__animated animate__fadeIn" style="--animate-duration: 0.4s">
    <div class="user-avatar-wrapper">
      <div class="user-avatar animate__animated animate__bounceIn" style="--animate-duration: 0.5s">
        <img 
          v-if="userInfo.avatar" 
          :src="avatarUrl" 
          :alt="userInfo.nick_name"
        >
        <span v-else class="avatar-placeholder">
          {{ userInfo.nick_name?.charAt(0) || 'U' }}
        </span>
      </div>
      <div class="status-indicator animate__animated animate__bounceIn" style="--animate-duration: 0.4s; --animate-delay: 0.15s"></div>
    </div>

    <div class="user-info">
      <div class="user-name animate__animated animate__fadeInLeft" style="--animate-duration: 0.35s; --animate-delay: 0.05s">{{ userInfo.nick_name || '用户' }}</div>
      <div class="user-meta animate__animated animate__fadeInLeft" style="--animate-duration: 0.35s; --animate-delay: 0.1s">
        <div class="user-id">
          <span class="id-label">ID</span>
          <span class="id-value">{{ userInfo.id || '---' }}</span>
        </div>
        <div class="version-tag" @click="showVersionLog = true" title="查看更新日志">
          v2.0
        </div>
      </div>
    </div>

    <button 
      class="logout-btn animate__animated animate__fadeIn" style="--animate-duration: 0.3s; --animate-delay: 0.15s"
      @click="handleLogout"
      title="退出登录"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
  
  <!-- 版本日志弹窗 -->
  <VersionLog v-model:open="showVersionLog" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'ant-design-vue'
import { getUserInfo, clearUserInfo } from '@/utils/storage'
import { Message } from '@/utils/message'
import VersionLog from '@/components/common/VersionLog.vue'

// 服务器地址
const serverUrl = import.meta.env.VITE_SERVER_URL || ''

interface UserInfo {
  id?: string | number
  nick_name?: string
  avatar?: string
}

const router = useRouter()

// 获取用户信息
const userInfo = computed<UserInfo>(() => getUserInfo() || {})

// 版本日志弹窗
const showVersionLog = ref(false)

// 拼接头像URL
const avatarUrl = computed(() => {
  if (!userInfo.value.avatar) return ''
  // 如果已经是完整URL则直接返回
  if (userInfo.value.avatar.startsWith('http')) return userInfo.value.avatar
  return `${serverUrl}/${userInfo.value.avatar}`
})

// 退出登录
const handleLogout = () => {
  Modal.confirm({
    title: '确认退出',
    content: '确定要退出登录吗？',
    okText: '退出',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk: () => {
      clearUserInfo()
      Message.success('已退出登录')
      router.push('/login')
    }
  })
}
</script>

<style lang="scss" scoped>
// 变量已通过 vite.config.ts 全局导入

.user-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg;
  background: transparent;
  border-bottom: 1px solid $border-light;
  transition: border-color $transition-base;
  cursor: pointer;

  &:hover {
    .user-avatar-wrapper {
      transform: scale(1.05);
    }
  }
}

.dark-mode .user-card {
  border-color: $border-light-dark;
}

// ==================== 头像区域 ====================
.user-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
  transition: transform $transition-base;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: $border-radius-base;
  overflow: hidden;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-placeholder {
  font-family: $font-family-heading;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: white;
  text-transform: uppercase;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: $success-color;
  border: 2px solid $bg-color-elevated;
  border-radius: $border-radius-round;
  transition: border-color $transition-base;
}

.dark-mode .status-indicator {
  border-color: $bg-color-elevated-dark;
}

// ==================== 用户信息 ====================
.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.user-name {
  font-family: $font-family-heading;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color $transition-base;
}

.dark-mode .user-name {
  color: $text-primary-dark;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.user-id {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-xs;
}

.id-label {
  padding: 2px 6px;
  background: rgba($primary-color, 0.1);
  color: $primary-color;
  border-radius: $border-radius-sm;
  font-weight: $font-weight-medium;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.id-value {
  color: $text-secondary;
  font-weight: $font-weight-medium;
  transition: color $transition-base;
}

.dark-mode .id-value {
  color: $text-secondary-dark;
}

.version-tag {
  padding: 2px 8px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: $border-radius-sm;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  font-family: 'Consolas', 'Monaco', monospace;
  cursor: pointer;
  transition: all $transition-fast;
  user-select: none;
  
  &:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
    border-color: rgba(102, 126, 234, 0.5);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.dark-mode .version-tag {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-color: rgba(102, 126, 234, 0.4);
  
  &:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
    border-color: rgba(102, 126, 234, 0.6);
  }
}

// ==================== 退出按钮 ====================
.logout-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: $text-tertiary;
  cursor: pointer;
  border-radius: $border-radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all $transition-fast;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: rgba($danger-color, 0.1);
    color: $danger-color;
  }

  &:active {
    transform: scale(0.95);
  }
}

.dark-mode .logout-btn {
  color: $text-tertiary-dark;
}

// ==================== 移动端适配 ====================
@media (max-width: 768px) {
  .user-card {
    padding: $spacing-md;
    gap: $spacing-sm;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
  }

  .avatar-placeholder {
    font-size: $font-size-lg;
  }

  .status-indicator {
    width: 10px;
    height: 10px;
  }

  .user-name {
    font-size: $font-size-sm;
  }

  .user-meta {
    gap: $spacing-xs;
  }

  .user-id {
    font-size: 10px;
  }

  .id-label {
    padding: 1px 4px;
  }
  
  .version-tag {
    font-size: 10px;
    padding: 1px 6px;
  }

  .logout-btn {
    width: 32px;
    height: 32px;

    svg {
      width: 18px;
      height: 18px;
    }
  }
}
</style>
