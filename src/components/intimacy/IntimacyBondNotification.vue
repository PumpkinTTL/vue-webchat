<template>
  <Teleport to="body">
    <Transition name="bond-notification">
      <div v-if="visible" class="bond-notification-overlay" @click="handleClose">
        <div class="bond-notification-container" @click.stop>
          <!-- 3D玻璃球容器 -->
          <div class="glass-orb">
            <!-- 玻璃球光泽层 -->
            <div class="orb-shine"></div>
            <div class="orb-highlight"></div>
            
            <!-- 凹凸感：顶部凸起 -->
            <div class="orb-bump top-bump"></div>
            <div class="orb-bump bottom-bump"></div>
            <div class="orb-bump left-bump"></div>
            <div class="orb-bump right-bump"></div>
            
            <!-- 玻璃球内部内容 -->
            <div class="orb-content">
              <!-- 左侧用户头像 -->
              <div class="user-avatar left-user">
                <div class="avatar-glow" :style="{ '--glow-color': intimacyColor }"></div>
                <img v-if="currentUserAvatar" :src="currentUserAvatar" :alt="currentUser?.nick_name">
                <div v-else class="avatar-placeholder">{{ currentUser?.nick_name?.charAt(0) || 'U' }}</div>
                <div class="avatar-ring" :style="{ borderColor: intimacyColor }"></div>
              </div>

              <!-- 中间连接线和爱心 -->
              <div class="connection-area">
                <!-- SVG渐变定义 -->
                <svg width="0" height="0" style="position: absolute;">
                  <defs>
                    <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#93c5fd;stop-opacity:1" />
                      <stop offset="50%" style="stop-color:#60a5fa;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
                    </linearGradient>
                  </defs>
                </svg>
                
                <!-- 主闪电连接线 -->
                <svg class="lightning-bolt" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    class="bolt-path"
                    d="M 20 50 L 35 30 L 30 50 L 50 50 L 65 70 L 70 50 L 80 50"
                    :stroke="intimacyColor"
                    stroke-width="3"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <!-- 能量粒子 -->
                  <circle class="energy-particle p1" r="3" :fill="intimacyColor">
                    <animateMotion dur="2s" repeatCount="indefinite">
                      <mpath href="#bolt-path"/>
                    </animateMotion>
                  </circle>
                  <circle class="energy-particle p2" r="2" :fill="intimacyColor" opacity="0.6">
                    <animateMotion dur="2s" begin="0.5s" repeatCount="indefinite">
                      <mpath href="#bolt-path"/>
                    </animateMotion>
                  </circle>
                </svg>

                <!-- 中心爱心 -->
                <div class="center-heart" :style="{ color: intimacyColor }">
                  <font-awesome-icon icon="heart" />
                  <div class="heart-pulse" :style="{ borderColor: intimacyColor }"></div>
                </div>

                <!-- 连接线光效 -->
                <div class="connection-glow" :style="{ background: `linear-gradient(90deg, transparent, ${intimacyColor}, transparent)` }"></div>
              </div>

              <!-- 右侧伴侣头像 -->
              <div class="user-avatar right-user">
                <div class="avatar-glow" :style="{ '--glow-color': intimacyColor }"></div>
                <img v-if="partnerAvatar" :src="partnerAvatar" :alt="partner?.name">
                <div v-else class="avatar-placeholder">{{ partner?.name?.charAt(0) || '?' }}</div>
                <div class="avatar-ring" :style="{ borderColor: intimacyColor }"></div>
              </div>
            </div>
          </div>

          <!-- 标题文字 -->
          <div class="notification-title">
            <div class="title-glow" :style="{ color: intimacyColor }">羁绊连接成功</div>
            <div class="title-main" :style="{ color: intimacyColor }">
              <font-awesome-icon icon="link" class="title-icon" />
              <span>{{ currentUser?.nick_name }} ♥ {{ partner?.name }}</span>
            </div>
          </div>

          <!-- 等级信息 -->
          <div class="level-info" :style="{ '--level-color': intimacyColor }">
            <div class="level-badge">
              <font-awesome-icon icon="heart" />
              <span>Lv.{{ intimacyLevel }}</span>
            </div>
            <div class="level-name">{{ levelName }}</div>
          </div>

          <!-- 关闭按钮 -->
          <button class="close-btn" @click="handleClose" :style="{ color: intimacyColor }">
            <font-awesome-icon icon="times" />
          </button>

          <!-- 背景粒子效果 -->
          <div class="particles">
            <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface User {
  nick_name: string
  avatar?: string
}

interface Partner {
  name: string
  avatar?: string
}

interface Props {
  visible: boolean
  currentUser?: User
  partner?: Partner
  intimacyColor: string
  intimacyLevel: number
  levelName: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

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

const currentUserAvatar = computed(() => processAvatarUrl(props.currentUser?.avatar))
const partnerAvatar = computed(() => processAvatarUrl(props.partner?.avatar))

// 生成粒子样式
const getParticleStyle = (index: number) => {
  const angle = (index / 20) * 360
  const distance = 150 + Math.random() * 100
  const size = 2 + Math.random() * 4
  const duration = 2 + Math.random() * 3
  const delay = Math.random() * 2
  
  return {
    left: '50%',
    top: '50%',
    width: `${size}px`,
    height: `${size}px`,
    background: props.intimacyColor,
    animation: `particleFloat ${duration}s ${delay}s infinite`,
    '--angle': `${angle}deg`,
    '--distance': `${distance}px`
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<style lang="scss" scoped>
.bond-notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(1px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

/* 暗色模式：稍微深一点 */
:global(.dark-mode) .bond-notification-overlay {
  background: rgba(0, 0, 0, 0.06);
}

.bond-notification-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  animation: containerAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes containerAppear {
  from {
    opacity: 0;
    transform: scale(0.5) translateY(50px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ==================== 3D玻璃球 ==================== */
.glass-orb {
  position: relative;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  /* 亮色模式：更明亮的玻璃效果 */
  background: 
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(0, 0, 0, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.5) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0.2) 100%
    );
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    inset 0 0 80px rgba(255, 255, 255, 0.3),
    inset -15px -15px 40px rgba(0, 0, 0, 0.08),
    inset 15px 15px 40px rgba(255, 255, 255, 0.4),
    0 0 100px rgba(236, 72, 153, 0.3);
  animation: orbFloat 6s ease-in-out infinite;
  overflow: hidden;
}

/* 暗色模式：更深邃的玻璃效果 */
:global(.dark-mode) .glass-orb {
  background: 
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(0, 0, 0, 0.3) 0%, transparent 50%),
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0.12) 50%,
      rgba(255, 255, 255, 0.08) 100%
    );
  border: 2px solid rgba(255, 255, 255, 0.25);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.6),
    inset 0 0 80px rgba(255, 255, 255, 0.15),
    inset -15px -15px 40px rgba(0, 0, 0, 0.4),
    inset 15px 15px 40px rgba(255, 255, 255, 0.15),
    0 0 100px rgba(236, 72, 153, 0.4);
}

@keyframes orbFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

/* ==================== 凹凸感效果 ==================== */
.orb-bump {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

.top-bump {
  top: 12%;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 80px;
  background: radial-gradient(circle at 50% 30%, 
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.4) 30%,
    rgba(255, 255, 255, 0.1) 60%,
    transparent 80%
  );
  filter: blur(6px);
  animation: bumpShine 3s ease-in-out infinite;
}

@keyframes bumpShine {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

.bottom-bump {
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 70px;
  background: radial-gradient(circle at 50% 70%, 
    rgba(0, 0, 0, 0.25) 0%,
    rgba(0, 0, 0, 0.12) 40%,
    rgba(0, 0, 0, 0.05) 60%,
    transparent 80%
  );
  filter: blur(8px);
}

.left-bump {
  top: 50%;
  left: 12%;
  transform: translateY(-50%);
  width: 70px;
  height: 70px;
  background: radial-gradient(circle at 25% 50%, 
    rgba(255, 255, 255, 0.6) 0%,
    rgba(255, 255, 255, 0.3) 40%,
    rgba(255, 255, 255, 0.1) 60%,
    transparent 80%
  );
  filter: blur(6px);
}

.right-bump {
  top: 50%;
  right: 12%;
  transform: translateY(-50%);
  width: 70px;
  height: 70px;
  background: radial-gradient(circle at 75% 50%, 
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.1) 40%,
    rgba(0, 0, 0, 0.05) 60%,
    transparent 80%
  );
  filter: blur(8px);
}

:global(.dark-mode) .top-bump {
  background: radial-gradient(circle at 50% 30%, 
    rgba(255, 255, 255, 0.4) 0%,
    rgba(255, 255, 255, 0.2) 30%,
    rgba(255, 255, 255, 0.05) 60%,
    transparent 80%
  );
}

:global(.dark-mode) .bottom-bump {
  background: radial-gradient(circle at 50% 70%, 
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.2) 40%,
    rgba(0, 0, 0, 0.1) 60%,
    transparent 80%
  );
}

:global(.dark-mode) .left-bump {
  background: radial-gradient(circle at 25% 50%, 
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.15) 40%,
    rgba(255, 255, 255, 0.05) 60%,
    transparent 80%
  );
}

:global(.dark-mode) .right-bump {
  background: radial-gradient(circle at 75% 50%, 
    rgba(0, 0, 0, 0.35) 0%,
    rgba(0, 0, 0, 0.18) 40%,
    rgba(0, 0, 0, 0.08) 60%,
    transparent 80%
  );
}

/* 玻璃球光泽 */
.orb-shine {
  position: absolute;
  top: 10%;
  left: 15%;
  width: 40%;
  height: 40%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, 
    rgba(255, 255, 255, 0.6) 0%,
    rgba(255, 255, 255, 0.2) 40%,
    transparent 70%
  );
  filter: blur(10px);
  animation: shineMove 4s ease-in-out infinite;
}

@keyframes shineMove {
  0%, 100% {
    transform: translate(0, 0);
    opacity: 0.8;
  }
  50% {
    transform: translate(10px, 10px);
    opacity: 1;
  }
}

.orb-highlight {
  position: absolute;
  top: 5%;
  right: 20%;
  width: 30%;
  height: 30%;
  border-radius: 50%;
  background: radial-gradient(circle, 
    rgba(255, 255, 255, 0.4) 0%,
    transparent 60%
  );
  filter: blur(15px);
}

/* ==================== 玻璃球内容 ==================== */
.orb-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px;
  z-index: 2;
}

/* ==================== 用户头像 ==================== */
.user-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  animation: avatarAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.left-user {
  animation-delay: 0.2s;
}

.right-user {
  animation-delay: 0.4s;
}

@keyframes avatarAppear {
  from {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.avatar-glow {
  position: absolute;
  inset: -15px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--glow-color) 0%, transparent 70%);
  opacity: 0.6;
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2);
  }
}

.user-avatar img,
.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.8), rgba(219, 39, 119, 0.8));
  color: white;
  font-size: 32px;
  font-weight: 700;
}

.avatar-ring {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid;
  animation: ringRotate 3s linear infinite;
}

@keyframes ringRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ==================== 连接区域 ==================== */
.connection-area {
  position: relative;
  flex: 1;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightning-bolt {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  animation: lightningAppear 0.8s 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes lightningAppear {
  to {
    opacity: 1;
  }
}

.bolt-path {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: boltDraw 1.5s 0.8s ease-out forwards, boltGlow 2s 2.3s ease-in-out infinite;
}

@keyframes boltDraw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes boltGlow {
  0%, 100% {
    filter: drop-shadow(0 0 2px currentColor);
  }
  50% {
    filter: drop-shadow(0 0 8px currentColor) drop-shadow(0 0 12px currentColor);
  }
}

/* ==================== 随机闪电（已移除） ==================== */

/* ==================== 连接线光效 ==================== */
.connection-glow {
  position: absolute;
  width: 100%;
  height: 4px;
  opacity: 0.6;
  animation: glowMove 2s ease-in-out infinite;
}

@keyframes glowMove {
  0%, 100% {
    transform: scaleX(0.8);
    opacity: 0.4;
  }
  50% {
    transform: scaleX(1.2);
    opacity: 0.8;
  }
}

/* ==================== 中心爱心 ==================== */
.center-heart {
  position: relative;
  font-size: 32px;
  z-index: 2;
  animation: heartBeat 1.5s ease-in-out infinite;
  filter: drop-shadow(0 0 10px currentColor);
}

@keyframes heartBeat {
  0%, 100% {
    transform: scale(1);
  }
  10% {
    transform: scale(1.2);
  }
  20% {
    transform: scale(1.1);
  }
  30% {
    transform: scale(1.3);
  }
  40% {
    transform: scale(1.1);
  }
  50% {
    transform: scale(1);
  }
}

.heart-pulse {
  position: absolute;
  inset: -20px;
  border: 2px solid;
  border-radius: 50%;
  animation: pulsate 2s ease-out infinite;
}

@keyframes pulsate {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* ==================== 标题文字 ==================== */
.notification-title {
  text-align: center;
  animation: titleAppear 0.8s 1s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

@keyframes titleAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.title-glow {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 3px;
  opacity: 0.8;
  margin-bottom: 8px;
  filter: drop-shadow(0 0 10px currentColor);
}

.title-main {
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  filter: drop-shadow(0 0 20px currentColor);
}

.title-icon {
  animation: iconSpin 2s linear infinite;
}

@keyframes iconSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ==================== 等级信息 ==================== */
.level-info {
  display: flex;
  align-items: center;
  gap: 16px;
  animation: levelAppear 0.8s 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

@keyframes levelAppear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.level-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--level-color);
  border-radius: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  font-size: 18px;
  font-weight: 700;
  color: white;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.2),
    0 0 30px var(--level-color),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  
  /* 光泽效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: badgeShine 3s ease-in-out infinite;
  }
  
  i, svg {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
}

@keyframes badgeShine {
  0% {
    left: -100%;
  }
  50% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}

.level-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--level-color);
  filter: drop-shadow(0 0 10px currentColor);
  letter-spacing: 1px;
}

/* ==================== 关闭按钮 ==================== */
.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
}

/* ==================== 背景粒子 ==================== */
.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
}

@keyframes particleFloat {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(var(--distance)) scale(0);
    opacity: 0;
  }
}

/* ==================== 过渡动画 ==================== */
.bond-notification-enter-active {
  animation: overlayFadeIn 0.5s ease-out;
}

.bond-notification-leave-active {
  animation: overlayFadeOut 0.3s ease-in;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes overlayFadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* ==================== 移动端适配 ==================== */
@media (max-width: 768px) {
  .glass-orb {
    width: 280px;
    height: 280px;
  }

  .orb-content {
    padding: 30px;
  }

  .user-avatar {
    width: 60px;
    height: 60px;
  }

  .center-heart {
    font-size: 24px;
  }

  .title-main {
    font-size: 22px;
  }

  .level-info {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .glass-orb {
    width: 240px;
    height: 240px;
  }

  .orb-content {
    padding: 20px;
  }

  .user-avatar {
    width: 50px;
    height: 50px;
  }

  .center-heart {
    font-size: 20px;
  }

  .title-main {
    font-size: 18px;
    flex-direction: column;
    gap: 8px;
  }
}
</style>
