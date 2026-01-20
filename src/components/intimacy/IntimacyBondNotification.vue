<template>
  <Teleport to="body">
    <Transition name="bond-notification">
      <div v-if="visible" class="bond-notification-overlay" @click="handleClose">
        <div class="bond-notification-container" @click.stop>
          <!-- 发光容器 -->
          <div class="orb-glow-wrapper">
            <!-- 飘浮的小爱心 -->
            <div class="floating-hearts">
              <div v-for="i in 6" :key="i" class="heart" :style="getHeartStyle(i)">♥</div>
            </div>
            
            <!-- 星星闪烁 -->
            <div class="twinkling-stars">
              <div v-for="i in 12" :key="i" class="star" :style="getStarStyle(i)">✦</div>
            </div>
            
            <!-- 3D玻璃球容器 -->
            <div class="glass-orb" :style="{ '--orb-color': intimacyColor }">
            <!-- 内发光层 -->
            <div class="inner-glow" :style="{ background: intimacyColor }"></div>
            
            <!-- 玻璃球装饰圆环 -->
            <div class="orb-ring ring-1"></div>
            <div class="orb-ring ring-2"></div>
            <div class="orb-ring ring-3"></div>
            
            <!-- 玻璃球光泽层 -->
            <div class="orb-shine"></div>
            <div class="orb-highlight"></div>
            
            <!-- 玻璃球内部内容 -->
            <div class="orb-content">
              <!-- 左侧用户头像 -->
              <div class="user-avatar left-user">
                <img v-if="currentUserAvatar" :src="currentUserAvatar" :alt="currentUser?.nick_name">
                <div v-else class="avatar-placeholder">{{ currentUser?.nick_name?.charAt(0) || 'U' }}</div>
              </div>

              <!-- 中间连接线 -->
              <div class="connection-area">
                <!-- 主闪电连接线 -->
                <svg class="lightning-bolt" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    id="bolt-path"
                    class="bolt-path"
                    d="M 20 50 L 35 30 L 30 50 L 50 50 L 65 70 L 70 50 L 80 50"
                    :stroke="intimacyColor"
                    stroke-width="3"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <!-- 能量流动光点 -->
                  <circle class="energy-particle p1" r="4" :fill="intimacyColor">
                    <animateMotion dur="2s" repeatCount="indefinite">
                      <mpath href="#bolt-path"/>
                    </animateMotion>
                  </circle>
                  <circle class="energy-particle p2" r="3" :fill="intimacyColor" opacity="0.7">
                    <animateMotion dur="2s" begin="0.4s" repeatCount="indefinite">
                      <mpath href="#bolt-path"/>
                    </animateMotion>
                  </circle>
                  <circle class="energy-particle p3" r="2.5" :fill="intimacyColor" opacity="0.5">
                    <animateMotion dur="2s" begin="0.8s" repeatCount="indefinite">
                      <mpath href="#bolt-path"/>
                    </animateMotion>
                  </circle>
                </svg>
              </div>

              <!-- 右侧伴侣头像 -->
              <div class="user-avatar right-user">
                <img v-if="partnerAvatar" :src="partnerAvatar" :alt="partner?.name">
                <div v-else class="avatar-placeholder">{{ partner?.name?.charAt(0) || '?' }}</div>
              </div>
            </div>
          </div>
          </div>
          <!-- /发光容器 -->

          <!-- 标题文字 -->
          <div class="notification-title">
            <div class="title-glow" :style="{ color: intimacyColor }">
              <span class="title-line"></span>
              羁绊连接成功
              <span class="title-line"></span>
            </div>
            <div class="title-main" :style="{ color: intimacyColor }">
              <font-awesome-icon icon="star" />
              <span>{{ currentUser?.nick_name }} ♥ {{ partner?.name }}</span>
            </div>
          </div>

          <!-- 等级信息 -->
          <div class="level-info" :style="{ '--level-color': intimacyColor }">
            <div class="level-badge">
              <font-awesome-icon icon="heart" />
              <span>Lv.{{ intimacyLevel }}</span>
            </div>
            <div class="level-name-wrapper">
              <div class="level-name">{{ levelName }}</div>
              <div class="level-underline" :style="{ background: intimacyColor }"></div>
            </div>
          </div>

          <!-- 关闭按钮 -->
          <button class="close-btn" @click="handleClose">
            <font-awesome-icon icon="times" />
          </button>
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

// 生成飘浮爱心样式
const getHeartStyle = (index: number) => {
  const delay = index * 0.8
  const left = 20 + (index * 10) % 60
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    color: props.intimacyColor
  }
}

// 生成星星样式
const getStarStyle = (index: number) => {
  const positions = [
    { left: '10%', top: '15%' },
    { left: '20%', top: '80%' },
    { left: '85%', top: '20%' },
    { left: '90%', top: '75%' },
    { left: '50%', top: '5%' },
    { left: '50%', top: '95%' },
    { left: '5%', top: '50%' },
    { left: '95%', top: '50%' },
    { left: '25%', top: '25%' },
    { left: '75%', top: '25%' },
    { left: '25%', top: '75%' },
    { left: '75%', top: '75%' }
  ]
  
  const pos = positions[index - 1]
  return {
    left: pos.left,
    top: pos.top,
    animationDelay: `${index * 0.3}s`,
    color: props.intimacyColor
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
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

/* 暗色模式：稍微深一点 */
.chat-app.dark-mode .bond-notification-overlay {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
}

/* 过渡期间移除backdrop-filter，避免影响页面 */
.bond-notification-leave-active {
  backdrop-filter: none !important;
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

/* ==================== 发光容器 ==================== */
.orb-glow-wrapper {
  position: relative;
}

/* ==================== 飘浮爱心 ==================== */
.floating-hearts {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}

.heart {
  position: absolute;
  bottom: -20px;
  font-size: 20px;
  opacity: 0;
  animation: floatUp 4s ease-in infinite;
}

@keyframes floatUp {
  0% {
    bottom: -20px;
    opacity: 0;
    transform: translateX(0) scale(0.5);
  }
  20% {
    opacity: 0.8;
  }
  80% {
    opacity: 0.8;
  }
  100% {
    bottom: 120%;
    opacity: 0;
    transform: translateX(20px) scale(1);
  }
}

/* ==================== 星星闪烁 ==================== */
.twinkling-stars {
  position: absolute;
  inset: -60px;
  pointer-events: none;
  z-index: 1;
}

.star {
  position: absolute;
  font-size: 16px;
  opacity: 0;
  animation: twinkle 3s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0.5) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(180deg);
  }
}

/* ==================== 3D玻璃球 ==================== */
.glass-orb {
  position: relative;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  /* 亮色模式：清爽的玻璃效果 */
  background: 
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5) 0%, transparent 50%),
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.4) 0%,
      rgba(255, 255, 255, 0.25) 50%,
      rgba(255, 255, 255, 0.15) 100%
    );
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.6);
  box-shadow: 
    0 15px 40px rgba(255, 255, 255, 0.1),
    inset 0 0 60px rgba(255, 255, 255, 0.2),
    inset 10px 10px 30px rgba(255, 255, 255, 0.3);
  animation: orbFloat 6s ease-in-out infinite, orbRotate 30s linear infinite;
  overflow: hidden;
  z-index: 1;
}

/* ==================== 内发光层 ==================== */
.inner-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  opacity: 0.6;
  filter: blur(40px);
  animation: innerGlowPulse 3s ease-in-out infinite;
  z-index: 0;
}

@keyframes innerGlowPulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(0.9);
  }
  50% {
    opacity: 0.7;
    transform: scale(1);
  }
}

@keyframes orbRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 暗色模式 */
:global(.chat-app.dark-mode) .glass-orb {
  background: 
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.15) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 100%
    );
  border: 2px solid rgba(255, 255, 255, 0.2);
}

@keyframes orbFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

/* ==================== 玻璃球装饰圆环 ==================== */
.orb-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.4);
  pointer-events: none;
  z-index: 1;
}

.ring-1 {
  width: 70%;
  height: 70%;
  transform: translate(-50%, -50%);
  animation: ringPulse 4s ease-in-out infinite;
}

.ring-2 {
  width: 85%;
  height: 85%;
  transform: translate(-50%, -50%);
  animation: ringPulse 4s ease-in-out 1.3s infinite;
  border-color: rgba(255, 255, 255, 0.3);
}

.ring-3 {
  width: 55%;
  height: 55%;
  transform: translate(-50%, -50%);
  animation: ringPulse 4s ease-in-out 2.6s infinite;
  border-color: rgba(255, 255, 255, 0.5);
}

@keyframes ringPulse {
  0%, 100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(1.05);
  }
}

/* ==================== 玻璃球光泽 ==================== */
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
  /* 反向旋转抵消玻璃球的旋转，保持内容固定 */
  animation: orbContentCounterRotate 30s linear infinite;
}

@keyframes orbContentCounterRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
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

.user-avatar img,
.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.3);
  position: relative;
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
    opacity: 0.9;
  }
  50% {
    opacity: 1;
  }
}

.energy-particle {
  &.p1 {
    animation: particlePulse 1s ease-in-out infinite;
  }
  
  &.p2 {
    animation: particlePulse 1s ease-in-out 0.3s infinite;
  }
  
  &.p3 {
    animation: particlePulse 1s ease-in-out 0.6s infinite;
  }
}

@keyframes particlePulse {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* ==================== 随机闪电（已移除） ==================== */

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
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

.title-line {
  width: 40px;
  height: 2px;
  background: currentColor;
  opacity: 0.5;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
    top: 50%;
    transform: translateY(-50%);
  }
  
  &:first-child::before {
    right: -3px;
  }
  
  &:last-child::before {
    left: -3px;
  }
}

.title-main {
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  position: relative;
  
  /* 添加微妙的背景装饰 */
  &::before {
    content: '';
    position: absolute;
    inset: -10px -20px;
    background: linear-gradient(90deg, transparent, currentColor, transparent);
    opacity: 0.03;
    border-radius: 12px;
    z-index: -1;
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
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
  
  /* 镜面扫过效果 */
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
  
  /* 边角装饰 */
  &::after {
    content: '';
    position: absolute;
    inset: 4px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    pointer-events: none;
  }
  
  i, svg {
    animation: heartPulse 2s ease-in-out infinite;
  }
}

@keyframes heartPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
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

.level-name-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.level-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--level-color);
  letter-spacing: 1px;
}

.level-underline {
  width: 0;
  height: 2px;
  border-radius: 1px;
  animation: underlineExpand 0.8s 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  position: relative;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 4px;
    background: inherit;
    border-radius: 50%;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    animation: dotAppear 0.3s 2.2s ease-out forwards;
  }
  
  &::before {
    left: -6px;
  }
  
  &::after {
    right: -6px;
  }
}

@keyframes underlineExpand {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes dotAppear {
  to {
    opacity: 1;
  }
}

/* ==================== 关闭按钮 ==================== */
.close-btn {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #666;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    color: #333;
    transform: rotate(90deg) scale(1.1);
  }
  
  &:active {
    transform: rotate(90deg) scale(0.95);
  }
}

:global(.chat-app.dark-mode) .close-btn {
  background: rgba(50, 50, 50, 0.9);
  color: #ccc;
  
  &:hover {
    background: rgba(60, 60, 60, 1);
    color: #fff;
  }
}

/* ==================== 完整深色模式适配 ==================== */
.chat-app.dark-mode .bond-notification-overlay {
  /* 装饰元素 */
  .floating-hearts .heart {
    filter: brightness(1.2) drop-shadow(0 0 8px currentColor);
  }

  .twinkling-stars .star {
    filter: brightness(1.2) drop-shadow(0 0 6px currentColor);
  }

  /* 玻璃球内容 */
  .user-avatar img,
  .avatar-placeholder {
    border: 3px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 20px rgba(236, 72, 153, 0.4);
  }

  .avatar-placeholder {
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.9), rgba(219, 39, 119, 0.9));
    border: 3px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 25px rgba(236, 72, 153, 0.5);
  }

  /* 圆环装饰 */
  .orb-ring {
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
  }

  .ring-2 {
    border-color: rgba(255, 255, 255, 0.15);
  }

  .ring-3 {
    border-color: rgba(255, 255, 255, 0.25);
  }

  /* 玻璃球光泽效果在深色模式下更柔和 */
  .orb-shine {
    background: radial-gradient(circle at 30% 30%, 
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.1) 40%,
      transparent 70%
    );
    opacity: 0.6;
  }

  .orb-highlight {
    background: radial-gradient(circle, 
      rgba(255, 255, 255, 0.2) 0%,
      transparent 60%
    );
    opacity: 0.5;
  }

  /* 内发光层 */
  .inner-glow {
    filter: blur(50px);
    opacity: 0.4;
    box-shadow: 0 0 60px currentColor;
  }

  /* 标题文字 */
  .title-glow {
    color: rgba(255, 255, 255, 0.9) !important;
    text-shadow: 0 0 15px currentColor;
  }

  .title-main {
    filter: brightness(1.1);
    text-shadow: 0 0 20px currentColor;
    
    &::before {
      opacity: 0.08;
    }

    svg {
      filter: drop-shadow(0 0 8px currentColor);
    }
  }

  /* 等级徽章 */
  .level-badge {
    border: 2px solid rgba(255, 255, 255, 0.2);
    box-shadow: 
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      0 4px 20px rgba(0, 0, 0, 0.3),
      0 0 25px var(--level-color);
    
    &::after {
      border-color: rgba(255, 255, 255, 0.1);
    }

    i, svg {
      filter: drop-shadow(0 0 6px white);
    }
  }

  .level-name {
    filter: brightness(1.1);
    text-shadow: 0 0 15px currentColor;
  }

  .level-underline {
    box-shadow: 0 0 10px currentColor;
  }

  /* 闪电连接线 */
  .lightning-bolt .bolt-path {
    filter: brightness(1.2) drop-shadow(0 0 8px currentColor);
  }

  .energy-particle {
    filter: brightness(1.2) drop-shadow(0 0 6px currentColor);
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

  .title-main {
    font-size: 18px;
    flex-direction: column;
    gap: 8px;
  }
}
</style>
