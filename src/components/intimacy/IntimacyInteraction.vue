<template>
  <Transition name="intimacy-slide">
    <div class="intimacy-interaction-wrapper" :style="{ '--intimacy-color': intimacyColor }">
      <div class="intimacy-interaction-bar">
        <!-- 第一行：两个头像 -->
        <div class="intimacy-avatars-row">
          <!-- 左侧用户（自己） -->
          <div class="intimacy-user-section left is-local">
            <div class="intimacy-user-avatar-wrapper">
              <img v-if="currentUserAvatar" :src="currentUserAvatar" class="intimacy-user-avatar" :alt="currentUser?.nick_name">
              <div v-else class="intimacy-user-avatar-placeholder">{{ currentUser?.nick_name?.charAt(0) || 'U' }}</div>
            </div>
            <span class="intimacy-user-name">{{ currentUser?.nick_name || '你' }}</span>
          </div>

          <!-- 右侧用户（伴侣） -->
          <div class="intimacy-user-section right">
            <span class="intimacy-user-name">{{ partner?.name || '伴侣' }}</span>
            <div class="intimacy-user-avatar-wrapper">
              <img v-if="partnerAvatar" :src="partnerAvatar" class="intimacy-user-avatar" :alt="partner?.name">
              <div v-else class="intimacy-user-avatar-placeholder">{{ partner?.name?.charAt(0) || '?' }}</div>
            </div>
          </div>
        </div>

        <!-- 第二行：进度条 -->
        <div class="intimacy-progress-section" :class="{ 'active': progress > 0 && progress < 100, 'completed': canCollect }">
          <div class="intimacy-progress-container">
            <div class="intimacy-progress-track">
              <!-- 双向进度条：两边各占一半宽度，100%时相遇 -->
              <div class="intimacy-progress-fill-left" :style="{ width: (progress / 2) + '%' }"></div>
              <div class="intimacy-progress-fill-right" :style="{ width: (progress / 2) + '%' }"></div>
            </div>
            <div class="intimacy-center-heart">
              <font-awesome-icon icon="heart" />
            </div>
          </div>
        </div>

        <!-- 第三行：倒计时 -->
        <div class="intimacy-countdown-row" :class="{ 'urgent': timeLeft <= 10 }">
          <font-awesome-icon icon="clock" />
          <span class="intimacy-countdown-value">{{ Math.floor(timeLeft) }}</span>
          <span class="intimacy-countdown-text">{{ canCollect ? '可领取' : '秒后可领取' }}</span>
        </div>

        <!-- 领取按钮 -->
        <button
          v-if="canCollect"
          class="intimacy-collect-btn"
          :class="{ 'collected': collecting }"
          @click="handleCollect"
          :disabled="collecting"
        >
          <font-awesome-icon v-if="!collecting" icon="gift" />
          <font-awesome-icon v-else icon="spinner" spin />
          <span>{{ collecting ? '领取中...' : '领取奖励' }}</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface User {
  nick_name: string
  avatar?: string
}

interface Props {
  intimacyColor: string
  timeLeft: number
  canCollect: boolean
  currentUser?: User
  partner?: {
    name: string
    avatar?: string
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{ collect: [] }>()

const collecting = ref(false)

// 服务器URL
const serverUrl = import.meta.env.VITE_SERVER_URL || ''

// 处理头像URL
const processAvatarUrl = (avatar: string | undefined): string | undefined => {
  if (!avatar) return undefined
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }
  return serverUrl + (avatar.startsWith('/') ? avatar : '/' + avatar)
}

// 处理后的当前用户头像
const currentUserAvatar = computed(() => processAvatarUrl(props.currentUser?.avatar))

// 处理后的伴侣头像
const partnerAvatar = computed(() => processAvatarUrl(props.partner?.avatar))

// 计算进度百分比（0-100）
const progress = computed(() => {
  const elapsed = 60 - props.timeLeft
  return Math.min((elapsed / 60) * 100, 100)
})

async function handleCollect() {
  if (collecting.value || !props.canCollect) return
  
  collecting.value = true
  emit('collect')
  
  setTimeout(() => {
    collecting.value = false
  }, 2000)
}
</script>

<style lang="scss" scoped>
/**
 * ==================== 亲密互动条样式 - ThinkPHP原版 ====================
 */

/* ==================== 主容器 ==================== */
.intimacy-interaction-wrapper {
  width: 100%;
  margin: 16px 0 12px;
  padding: 0;
  animation: intimacyBarSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes intimacyBarSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== 互动条卡片 ==================== */
.intimacy-interaction-bar {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: color-mix(in srgb, var(--intimacy-color, #ec4899) 8%, transparent);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 第一行：头像行 */
.intimacy-avatars-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* ==================== 用户头像区域 ==================== */
.intimacy-user-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  position: relative;
  z-index: 2;
}

.intimacy-user-section.left {
  justify-content: flex-start;
}

.intimacy-user-section.right {
  justify-content: flex-end;
}

.intimacy-user-avatar-wrapper {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.intimacy-user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid var(--intimacy-color, #ec4899);
  box-shadow:
    0 4px 12px rgba(236, 72, 153, 0.3),
    0 0 0 3px rgba(236, 72, 153, 0.1);
  object-fit: cover;
  transition: all 0.3s ease;
}

.intimacy-user-avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--intimacy-color, #ec4899), color-mix(in srgb, var(--intimacy-color, #ec4899) 80%, white));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: 2px solid var(--intimacy-color, #ec4899);
  box-shadow:
    0 4px 12px rgba(236, 72, 153, 0.3),
    0 0 0 3px rgba(236, 72, 153, 0.1);
}

.intimacy-user-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--intimacy-text, #1e293b);
  white-space: nowrap;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.intimacy-user-section.is-local .intimacy-user-name {
  color: var(--intimacy-color, #ec4899);
}

/* ==================== 中间进度区域 ==================== */
.intimacy-progress-section {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

/* 进度条容器 */
.intimacy-progress-container {
  position: relative;
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 进度条背景轨道 */
.intimacy-progress-track {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 8px;
  background: var(--intimacy-track-bg, rgba(236, 72, 153, 0.15));
  border-radius: 10px;
  overflow: hidden;
  display: flex;
}

/* 左侧进度条填充 */
.intimacy-progress-fill-left {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 0%;
  background: linear-gradient(
    90deg,
    var(--intimacy-color, #ec4899) 0%,
    color-mix(in srgb, var(--intimacy-color, #ec4899) 85%, white) 100%
  );
  border-radius: 10px 0 0 10px;
  transition: width 0.3s ease-out;
  box-shadow: 0 0 12px var(--intimacy-color, #ec4899);
}

/* 右侧进度条填充 */
.intimacy-progress-fill-right {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 0%;
  background: linear-gradient(
    -90deg,
    var(--intimacy-color, #ec4899) 0%,
    color-mix(in srgb, var(--intimacy-color, #ec4899) 85%, white) 100%
  );
  border-radius: 0 10px 10px 0;
  transition: width 0.3s ease-out;
  box-shadow: 0 0 12px var(--intimacy-color, #ec4899);
}

/* ==================== 中心爱心图标 ==================== */
.intimacy-center-heart {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 2px 12px rgba(236, 72, 153, 0.25),
    0 0 0 4px var(--intimacy-bar-bg, rgba(255, 255, 255, 0.9));
  z-index: 3;
  transition: all 0.3s ease;
}

.intimacy-center-heart i,
.intimacy-center-heart svg {
  font-size: 14px;
  color: var(--intimacy-color, #ec4899);
  transition: all 0.3s ease;
}

.intimacy-progress-section.active .intimacy-center-heart {
  animation: intimacyHeartBeat 1s ease-in-out infinite;
}

@keyframes intimacyHeartBeat {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  10% {
    transform: translate(-50%, -50%) scale(1.15);
  }
  20% {
    transform: translate(-50%, -50%) scale(1.05);
  }
  30% {
    transform: translate(-50%, -50%) scale(1.15);
  }
  40% {
    transform: translate(-50%, -50%) scale(1.05);
  }
  50% {
    transform: translate(-50%, -50%) scale(1);
  }
}

/* 完成状态 */
.intimacy-progress-section.completed .intimacy-center-heart {
  background: linear-gradient(135deg, var(--intimacy-color, #ec4899), color-mix(in srgb, var(--intimacy-color, #ec4899) 80%, white));
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow:
    0 4px 20px rgba(236, 72, 153, 0.5),
    0 0 0 6px var(--intimacy-bar-bg, rgba(255, 255, 255, 0.9));
}

.intimacy-progress-section.completed .intimacy-center-heart i,
.intimacy-progress-section.completed .intimacy-center-heart svg {
  color: white;
  animation: intimacyHeartComplete 0.6s ease-out;
}

@keyframes intimacyHeartComplete {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 第三行：倒计时 */
.intimacy-countdown-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--intimacy-countdown-text, #64748b);
  width: 100%;
}

.intimacy-countdown-row i,
.intimacy-countdown-row svg {
  font-size: 10px;
  color: var(--intimacy-color, #ec4899);
}

.intimacy-countdown-value {
  color: var(--intimacy-color, #ec4899);
  font-variant-numeric: tabular-nums;
  font-size: 13px;
}

.intimacy-countdown-row.urgent .intimacy-countdown-value {
  color: #ef4444;
  animation: countdownPulse 0.5s ease-in-out infinite;
}

@keyframes countdownPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* ==================== 领取按钮 ==================== */
.intimacy-collect-btn {
  width: 100%;
  padding: 10px 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--intimacy-color, #ec4899), color-mix(in srgb, var(--intimacy-color, #ec4899) 85%, white));
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
}

.intimacy-collect-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(236, 72, 153, 0.4);
}

.intimacy-collect-btn:active:not(:disabled) {
  transform: translateY(0);
}

.intimacy-collect-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.intimacy-collect-btn i,
.intimacy-collect-btn svg {
  font-size: 14px;
}

/* ==================== 过渡动画 ==================== */
.intimacy-slide-enter-active {
  animation: intimacySlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.intimacy-slide-leave-active {
  animation: intimacySlideOut 0.25s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes intimacySlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes intimacySlideOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

/* ==================== 暗色模式 ==================== */
:global(.dark-mode) {
  .intimacy-interaction-bar {
    --intimacy-bar-bg: rgba(15, 23, 42, 0.85);
    --intimacy-track-bg: rgba(236, 72, 153, 0.2);
    --intimacy-text: #f1f5f9;
    --intimacy-countdown-text: #94a3b8;
  }

  .intimacy-center-heart {
    background: rgba(15, 23, 42, 0.95);
  }
}

/* ==================== 移动端适配 ==================== */
@media (max-width: 768px) {
  .intimacy-interaction-wrapper {
    margin-top: 10px;
  }

  .intimacy-interaction-bar {
    padding: 10px;
    gap: 8px;
    border-radius: 14px;
  }

  .intimacy-avatars-row {
    gap: 8px;
  }

  .intimacy-user-section {
    flex-shrink: 0;
    gap: 6px;
  }

  .intimacy-user-avatar-wrapper {
    width: 38px;
    height: 38px;
  }

  .intimacy-user-name {
    font-size: 11px;
    max-width: 60px;
  }

  .intimacy-progress-section {
    width: 100%;
  }

  .intimacy-progress-container {
    height: 36px;
  }

  .intimacy-progress-track {
    height: 6px;
  }

  .intimacy-center-heart {
    width: 24px;
    height: 24px;
  }

  .intimacy-center-heart i {
    font-size: 12px;
  }

  .intimacy-countdown-row {
    font-size: 10px;
  }

  .intimacy-collect-btn {
    padding: 9px 14px;
    font-size: 12px;
  }

  .intimacy-collect-btn i {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .intimacy-interaction-bar {
    padding: 8px 10px;
  }

  .intimacy-user-avatar-wrapper {
    width: 34px;
    height: 34px;
  }

  .intimacy-user-name {
    font-size: 10px;
    max-width: 50px;
  }
}

/* ==================== 减少动画（可访问性） ==================== */
@media (prefers-reduced-motion: reduce) {
  .intimacy-interaction-bar,
  .intimacy-user-avatar,
  .intimacy-center-heart,
  .intimacy-collect-btn {
    animation: none !important;
    transition: none !important;
  }
}
</style>
