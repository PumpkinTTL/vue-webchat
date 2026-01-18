<template>
  <Transition name="intimacy-slide">
    <div v-if="visible" class="intimacy-card-expanded" @click.stop :style="{ '--intimacy-color': intimacyInfo?.level_color || '#ec4899' }">
      <!-- 背景装饰 -->
      <div class="bg-decoration">
        <div class="sparkle-particle p1"></div>
        <div class="sparkle-particle p2"></div>
        <div class="sparkle-particle p3"></div>
        <div class="sparkle-particle p4"></div>
        <div class="wave-line w1"></div>
        <div class="wave-line w2"></div>
      </div>
      
      <button class="intimacy-close" @click="emit('close')">
        <font-awesome-icon icon="times" />
      </button>

      <div v-if="intimacyInfo">
        <!-- 顶部区域：等级和经验 -->
        <div class="intimacy-top-section">
          <div class="intimacy-level-display">
            <div class="intimacy-heart-wrapper">
              <font-awesome-icon icon="heart" class="intimacy-heart-icon" :style="{ color: intimacyInfo.level_color }" />
              <div class="heart-glow" :style="{ background: intimacyInfo.level_color }"></div>
              <div class="heart-ring"></div>
            </div>
            <div class="intimacy-level-text">
              <div class="level-name-row">
                <span class="intimacy-level-name" :style="{ color: intimacyInfo.level_color }">
                  {{ intimacyInfo.level_name }}
                </span>
                <span class="intimacy-level-badge" :style="{ 
                  background: intimacyInfo.level_color + '15',
                  borderColor: intimacyInfo.level_color + '30',
                  color: intimacyInfo.level_color
                }">Lv.{{ intimacyInfo.current_level }}</span>
              </div>
              <div class="level-subtitle">亲密关系</div>
            </div>
          </div>
          
          <div class="intimacy-exp-display">
            <div class="exp-label">经验值</div>
            <div class="exp-numbers">
              <span class="exp-current">{{ intimacyInfo.current_exp }}</span>
              <span class="exp-separator">/</span>
              <span class="exp-max">{{ intimacyInfo.next_level_exp }}</span>
            </div>
          </div>
        </div>
        
        <!-- 进度条 -->
        <div class="intimacy-progress-section">
          <div class="progress-header">
            <span class="progress-label">
              <font-awesome-icon icon="chart-line" />
              升级进度
            </span>
            <span class="progress-percent" :style="{ color: intimacyInfo.level_color }">
              {{ intimacyInfo.progress_percent }}%
            </span>
          </div>
          <div class="intimacy-progress-bar">
            <div class="intimacy-progress-fill" 
                 :style="{ 
                   width: intimacyInfo.progress_percent + '%',
                   '--level-color': intimacyInfo.level_color,
                   '--level-color-light': intimacyInfo.level_color + '99'
                 }">
              <div class="progress-shine"></div>
              <div class="progress-particles">
                <span class="particle"></span>
                <span class="particle"></span>
                <span class="particle"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 互动条 -->
        <IntimacyInteraction
          v-show="interaction.active"
          key="intimacy-interaction-stable"
          :intimacy-color="intimacyInfo.level_color"
          :time-left="interaction.timeLeft"
          :can-collect="interaction.canCollect"
          :current-user="currentUser"
          :partner="partner"
        />

        <!-- 底部：统计和开关 -->
        <div class="intimacy-bottom-section">
          <div class="intimacy-message-count">
            <div class="message-icon-wrapper">
              <font-awesome-icon icon="comments" />
              <div class="icon-pulse"></div>
            </div>
            <div class="message-text">
              <span class="message-label">我们已经聊了</span>
              <span class="message-value">{{ intimacyInfo.total_messages }} 条消息</span>
            </div>
          </div>

          <div class="intimacy-divider"></div>

          <div class="intimacy-settings">
            <div class="settings-label">
              <font-awesome-icon icon="bell" />
              <span>经验提示</span>
            </div>
            <label class="intimacy-switch">
              <input type="checkbox" v-model="showExpToast" @change="emit('toggle-exp-toast', showExpToast)">
              <span class="intimacy-slider"></span>
            </label>
          </div>

          <div class="intimacy-settings">
            <div class="settings-label">
              <font-awesome-icon icon="heart" />
              <span>羁绊上线提醒</span>
            </div>
            <label class="intimacy-switch">
              <input type="checkbox" v-model="showBondEffect" @change="emit('toggle-bond-effect', showBondEffect)">
              <span class="intimacy-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div v-else class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import IntimacyInteraction from './IntimacyInteraction.vue'
import type { IntimacyInfo, IntimacyLevel, InteractionState } from '@/types/intimacy'

interface User {
  nick_name: string
  avatar?: string
}

interface Props {
  visible: boolean
  intimacyInfo: IntimacyInfo | null
  levels: IntimacyLevel[]
  interaction: InteractionState
  currentUser?: User
  partner?: {
    name: string
    avatar?: string
  }
}

defineProps<Props>()
const emit = defineEmits<{ 
  close: []
  'toggle-exp-toast': [value: boolean]
  'toggle-bond-effect': [value: boolean]
}>()

// 从localStorage读取初始值
const showExpToast = ref(localStorage.getItem('intimacy_show_exp_toast') !== '0')
const showBondEffect = ref(localStorage.getItem('intimacy_show_bond_effect') !== '0')
</script>

<style lang="scss" scoped>
/* ==================== 展开式好感度卡片 - ThinkPHP原版样式 ==================== */
.intimacy-card-expanded {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--header-bg, #ffffff);
  border-bottom: 1px solid var(--header-border, #e5e7eb);
  padding: 22px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

/* 闪烁粒子 */
.sparkle-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--intimacy-color, #ec4899);
  border-radius: 50%;
  opacity: 0;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    background: var(--intimacy-color, #ec4899);
    border-radius: 50%;
  }
  
  &::before {
    width: 1px;
    height: 8px;
    top: -2px;
    left: 1.5px;
  }
  
  &::after {
    width: 8px;
    height: 1px;
    top: 1.5px;
    left: -2px;
  }
  
  &.p1 {
    top: 15%;
    left: 10%;
    animation: sparkle-float 3s ease-in-out infinite;
  }
  
  &.p2 {
    top: 25%;
    right: 15%;
    animation: sparkle-float 3s ease-in-out 1s infinite;
  }
  
  &.p3 {
    bottom: 20%;
    left: 20%;
    animation: sparkle-float 3s ease-in-out 2s infinite;
  }
  
  &.p4 {
    bottom: 30%;
    right: 10%;
    animation: sparkle-float 3s ease-in-out 1.5s infinite;
  }
}

@keyframes sparkle-float {
  0%, 100% {
    opacity: 0;
    transform: translateY(0) scale(0) rotate(0deg);
  }
  50% {
    opacity: 0.6;
    transform: translateY(-10px) scale(1) rotate(180deg);
  }
}

/* 波浪线装饰 */
.wave-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent,
    var(--intimacy-color, #ec4899),
    transparent
  );
  opacity: 0.1;
  
  &.w1 {
    top: 30%;
    animation: wave-move 4s ease-in-out infinite;
  }
  
  &.w2 {
    bottom: 30%;
    animation: wave-move 4s ease-in-out 2s infinite;
  }
}

@keyframes wave-move {
  0%, 100% {
    transform: translateX(-100%) scaleX(0.5);
    opacity: 0;
  }
  50% {
    transform: translateX(0) scaleX(1);
    opacity: 0.15;
  }
}

/* 关闭按钮 */
.intimacy-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: color-mix(in srgb, var(--intimacy-color, #ec4899) 10%, transparent);
  border: none;
  color: var(--intimacy-color, #ec4899);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.2s ease;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.intimacy-close svg {
  color: var(--intimacy-color, #ec4899);
}

.intimacy-close:hover {
  background: color-mix(in srgb, var(--intimacy-color, #ec4899) 20%, transparent);
  transform: rotate(90deg) scale(1.1);
}

/* ==================== 顶部区域：等级和经验 ==================== */
.intimacy-top-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  padding-right: 40px;
  position: relative;
  z-index: 1;
}

.intimacy-level-display {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* 爱心图标包装器 - 添加发光效果和脉冲环 */
.intimacy-heart-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.intimacy-heart-icon {
  font-size: 40px;
  position: relative;
  z-index: 2;
  animation: heart-pulse 2s ease-in-out infinite;
  filter: drop-shadow(0 0 8px var(--intimacy-color, #ec4899));
}

.heart-glow {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  opacity: 0.15;
  animation: glow-pulse 2s ease-in-out infinite;
  z-index: 0;
}

.heart-ring {
  position: absolute;
  width: 60px;
  height: 60px;
  border: 2px solid var(--intimacy-color, #ec4899);
  border-radius: 50%;
  opacity: 0;
  animation: ring-pulse 2s ease-in-out infinite;
  z-index: 0;
}

@keyframes heart-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

@keyframes glow-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.15;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.25;
  }
}

@keyframes ring-pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

.intimacy-level-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.level-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.intimacy-level-name {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 0 20px color-mix(in srgb, var(--intimacy-color, #ec4899) 30%, transparent);
}

.intimacy-level-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 600;
  border: 1px solid;
  line-height: 1;
  animation: badge-float 3s ease-in-out infinite;
}

@keyframes badge-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

.level-subtitle {
  font-size: 11px;
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
  opacity: 0.8;
}

/* 经验显示区域 */
.intimacy-exp-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.exp-label {
  font-size: 10px;
  color: var(--text-secondary, #6b7280);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.exp-numbers {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-weight: 600;
}

.exp-current {
  font-size: 20px;
  color: var(--intimacy-color, #ec4899);
  line-height: 1;
  animation: number-glow 2s ease-in-out infinite;
}

@keyframes number-glow {
  0%, 100% {
    text-shadow: 0 0 10px color-mix(in srgb, var(--intimacy-color, #ec4899) 40%, transparent);
  }
  50% {
    text-shadow: 0 0 20px color-mix(in srgb, var(--intimacy-color, #ec4899) 60%, transparent);
  }
}

.exp-separator {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
  opacity: 0.5;
}

.exp-max {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
}

/* ==================== 进度条区域 ==================== */
.intimacy-progress-section {
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
}

.progress-label i,
.progress-label svg {
  font-size: 11px;
  opacity: 0.7;
}

.progress-percent {
  font-size: 13px;
  font-weight: 700;
}

.intimacy-progress-bar {
  height: 10px;
  background: color-mix(in srgb, var(--intimacy-color, #ec4899) 10%, transparent);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.intimacy-progress-fill {
  height: 100%;
  border-radius: 20px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(90deg, var(--level-color, #ec4899), var(--level-color-light, #f472b6));
  box-shadow: 0 0 12px var(--level-color, #ec4899);
  position: relative;
  overflow: hidden;
}

.progress-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: progress-shine 2s ease-in-out infinite;
}

@keyframes progress-shine {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

/* 进度条粒子 */
.progress-particles {
  position: absolute;
  inset: 0;
  
  .particle {
    position: absolute;
    width: 3px;
    height: 3px;
    background: white;
    border-radius: 50%;
    opacity: 0;
    top: 50%;
    transform: translateY(-50%);
    
    &:nth-child(1) {
      left: 20%;
      animation: particle-float 2s ease-in-out infinite;
    }
    
    &:nth-child(2) {
      left: 50%;
      animation: particle-float 2s ease-in-out 0.7s infinite;
    }
    
    &:nth-child(3) {
      left: 80%;
      animation: particle-float 2s ease-in-out 1.4s infinite;
    }
  }
}

@keyframes particle-float {
  0%, 100% {
    opacity: 0;
    transform: translateY(-50%) scale(0);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-50%) scale(1.5);
  }
}

/* ==================== 底部区域：统计和设置 ==================== */
.intimacy-bottom-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
  z-index: 1;
}

.intimacy-message-count {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: color-mix(in srgb, var(--intimacy-color, #ec4899) 8%, transparent);
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, transparent 30%, color-mix(in srgb, var(--intimacy-color, #ec4899) 10%, transparent) 50%, transparent 70%);
    background-size: 200% 200%;
    animation: shimmer 3s ease-in-out infinite;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:hover::before {
    opacity: 1;
  }
}

@keyframes shimmer {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.intimacy-message-count:hover {
  background: color-mix(in srgb, var(--intimacy-color, #ec4899) 12%, transparent);
  transform: translateY(-1px);
}

.message-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--intimacy-color, #ec4899) 15%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.message-icon-wrapper i,
.message-icon-wrapper svg {
  font-size: 18px;
  color: var(--intimacy-color, #ec4899);
  position: relative;
  z-index: 2;
}

/* 图标脉冲效果 */
.icon-pulse {
  position: absolute;
  inset: -2px;
  border-radius: 10px;
  border: 2px solid var(--intimacy-color, #ec4899);
  opacity: 0;
  animation: icon-pulse 2s ease-in-out infinite;
}

@keyframes icon-pulse {
  0% {
    transform: scale(0.9);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.message-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.message-label {
  font-size: 11px;
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
}

.message-value {
  font-size: 15px;
  color: var(--intimacy-color, #ec4899);
  font-weight: 700;
}

.intimacy-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--intimacy-color, #ec4899) 15%, transparent), transparent);
  margin: 2px 0;
}

.intimacy-settings {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.settings-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-primary, #1f2937);
  font-weight: 500;
}

.settings-label i,
.settings-label svg {
  font-size: 14px;
  color: var(--intimacy-color, #ec4899);
}

/* ==================== 开关样式 ==================== */
.intimacy-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.intimacy-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.intimacy-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
  transition: 0.3s;
  border-radius: 24px;
}

.intimacy-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.intimacy-switch input:checked + .intimacy-slider {
  background: linear-gradient(135deg, var(--intimacy-color, #ec4899), color-mix(in srgb, var(--intimacy-color, #ec4899) 80%, white));
  box-shadow: 0 0 10px color-mix(in srgb, var(--intimacy-color, #ec4899) 50%, transparent);
}

.intimacy-switch input:checked + .intimacy-slider:before {
  transform: translateX(20px);
}

/* ==================== 加载状态 ==================== */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  gap: 14px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: var(--intimacy-color, #ec4899);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

/* ==================== 展开/收缩动画 ==================== */
.intimacy-slide-enter-active {
  animation: intimacy-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.intimacy-slide-leave-active {
  animation: intimacy-slide-out 0.3s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes intimacy-slide-in {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes intimacy-slide-out {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
}

/* ==================== 暗色模式 ==================== */
:global(.dark-mode) {
  .intimacy-card-expanded {
    background: #0f172a;
    border-color: #1e293b;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .intimacy-close {
    background: color-mix(in srgb, var(--intimacy-color, #ec4899) 15%, transparent);
  }

  .intimacy-close:hover {
    background: color-mix(in srgb, var(--intimacy-color, #ec4899) 25%, transparent);
  }

  .intimacy-progress-bar {
    background: color-mix(in srgb, var(--intimacy-color, #ec4899) 12%, transparent);
  }

  .intimacy-message-count {
    background: color-mix(in srgb, var(--intimacy-color, #ec4899) 10%, transparent);
  }

  .intimacy-message-count:hover {
    background: color-mix(in srgb, var(--intimacy-color, #ec4899) 15%, transparent);
  }

  .message-icon-wrapper {
    background: color-mix(in srgb, var(--intimacy-color, #ec4899) 20%, transparent);
  }

  .intimacy-divider {
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--intimacy-color, #ec4899) 20%, transparent), transparent);
  }

  .intimacy-slider {
    background: rgba(255, 255, 255, 0.1);
  }

  .intimacy-slider:before {
    background-color: rgba(255, 255, 255, 0.95);
  }

  .settings-label {
    color: #f1f5f9;
  }

  .level-subtitle {
    color: #94a3b8;
  }

  .exp-label {
    color: #94a3b8;
  }

  .exp-separator,
  .exp-max {
    color: #94a3b8;
  }

  .progress-label {
    color: #94a3b8;
  }

  .message-label {
    color: #94a3b8;
  }

  .spinner {
    border-color: #334155;
  }

  .loading-state p {
    color: #94a3b8;
  }
}

/* ==================== 移动端适配 ==================== */
@media (max-width: 768px) {
  .intimacy-card-expanded {
    padding: 18px 16px;
  }
  
  .intimacy-close {
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
  
  .intimacy-top-section {
    margin-bottom: 16px;
    padding-right: 36px;
  }
  
  .intimacy-level-display {
    gap: 12px;
  }
  
  .intimacy-heart-icon {
    font-size: 32px;
  }
  
  .heart-glow {
    width: 40px;
    height: 40px;
  }
  
  .intimacy-level-name {
    font-size: 18px;
  }
  
  .intimacy-level-badge {
    font-size: 10px;
    padding: 2px 8px;
  }
  
  .level-subtitle {
    font-size: 10px;
  }
  
  .exp-label {
    font-size: 9px;
  }
  
  .exp-current {
    font-size: 18px;
  }
  
  .exp-max {
    font-size: 13px;
  }
  
  .intimacy-progress-section {
    margin-bottom: 16px;
  }
  
  .progress-header {
    margin-bottom: 7px;
  }
  
  .progress-label {
    font-size: 11px;
    gap: 5px;
  }
  
  .progress-label i {
    font-size: 10px;
  }
  
  .progress-percent {
    font-size: 12px;
  }
  
  .intimacy-progress-bar {
    height: 8px;
  }
  
  .intimacy-bottom-section {
    gap: 12px;
  }
  
  .intimacy-message-count {
    padding: 10px 14px;
    gap: 10px;
  }
  
  .message-icon-wrapper {
    width: 36px;
    height: 36px;
    border-radius: 9px;
  }
  
  .message-icon-wrapper i {
    font-size: 16px;
  }
  
  .message-label {
    font-size: 10px;
  }
  
  .message-value {
    font-size: 14px;
  }
  
  .settings-label {
    font-size: 12px;
    gap: 7px;
  }
  
  .settings-label i {
    font-size: 13px;
  }
  
  .intimacy-switch {
    width: 40px;
    height: 22px;
  }
  
  .intimacy-slider:before {
    height: 16px;
    width: 16px;
  }
  
  .intimacy-switch input:checked + .intimacy-slider:before {
    transform: translateX(18px);
  }
}
</style>
