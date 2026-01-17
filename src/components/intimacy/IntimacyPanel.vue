<template>
  <Transition name="slide-down">
    <div v-if="visible" class="intimacy-panel">
      <button class="close-btn" @click="emit('close')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <div v-if="intimacyInfo" class="panel-inner">
        <div class="top-section">
          <div class="level-display">
            <div class="level-badge" :style="{ background: levelGradient }">
              <span>{{ intimacyInfo.current_level }}</span>
            </div>
            <div class="level-info">
              <div class="level-name-row">
                <h3 :style="{ color: intimacyInfo.level_color }">{{ intimacyInfo.level_name }}</h3>
                <span class="level-tag"
                  :style="{ background: intimacyInfo.level_color + '15', borderColor: intimacyInfo.level_color + '30', color: intimacyInfo.level_color }">
                  Lv.{{ intimacyInfo.current_level }}
                </span>
              </div>
              <p>{{ getLevelDesc(intimacyInfo.current_level) }}</p>
            </div>
          </div>
          <div class="exp-display">
            <div class="exp-label">经验值</div>
            <div class="exp-nums">
              <span class="current">{{ intimacyInfo.current_exp }}</span>
              <span class="sep">/</span>
              <span class="max">{{ intimacyInfo.next_level_exp }}</span>
            </div>
          </div>
        </div>

        <div class="progress-section">
          <div class="progress-header">
            <span>升级进度</span>
            <span class="percent" :style="{ color: intimacyInfo.level_color }">{{
              Math.round(intimacyInfo.progress_percent) }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill"
              :style="{ width: intimacyInfo.progress_percent + '%', background: levelGradient }"></div>
          </div>
        </div>

        <div class="stats-section">
          <div class="stat">
            <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <div class="stat-val">{{ intimacyInfo.total_messages }}</div>
            <div class="stat-label">消息总数</div>
          </div>
          <div class="stat">
            <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <div class="stat-val">Lv.{{ intimacyInfo.current_level }}</div>
            <div class="stat-label">当前等级</div>
          </div>
        </div>

        <div v-if="interaction.active" class="interact-section">
          <div class="interact-header">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            <span>亲密互动</span>
            <span class="timer-text">{{ interaction.timeLeft }}s</span>
          </div>
          <p v-if="!interaction.canCollect" class="hint">双方同时在线60秒即可领取奖励</p>
          <button v-else class="collect-btn" @click="emit('collect-reward')" :disabled="interaction.collecting">
            <svg v-if="!interaction.collecting" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <svg v-else class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span>{{ interaction.collecting ? '领取中' : '领取奖励' }}</span>
          </button>
        </div>
      </div>

      <div v-else class="loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IntimacyInfo, IntimacyLevel, InteractionState } from '@/types/intimacy'

interface Props {
  visible: boolean
  intimacyInfo: IntimacyInfo | null
  levels: IntimacyLevel[]
  interaction: InteractionState
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [], 'collect-reward': [] }>()

const levelGradient = computed(() => {
  if (!props.intimacyInfo) return 'linear-gradient(135deg, #FF1493, #F97316)'
  return getLevelGradient(props.intimacyInfo.level_color)
})

function getLevelGradient(color: string): string {
  if (color.startsWith('linear-gradient')) return color
  return `linear-gradient(135deg, ${color}, ${lighten(color, 20)})`
}

function lighten(color: string, percent: number): string {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const nr = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)))
  const ng = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)))
  const nb = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)))
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
}

function getLevelDesc(level: number): string {
  const descs: Record<number, string> = {
    1: '相爱的恋人，刚刚开始的美好', 2: '热恋中的情侣，甜蜜升温',
    3: '甜蜜的恋人，感情稳定', 4: '深深相爱，心意相通',
    5: '挚爱的伴侣，不离不弃', 6: '相守一生，白头偕老',
    7: '生命中的伴侣，相濡以沫', 8: '灵魂深处的契合，天作之合'
  }
  return descs[level] || '未知等级'
}
</script>

<style lang="scss" scoped>
// ==================== 面板容器（下拉展开式） ====================
.intimacy-panel {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 22px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  position: relative;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;

  svg {
    width: 16px;
    height: 16px;
    color: #64748B;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    transform: rotate(90deg);
  }
}

.panel-inner {
  padding-right: 40px;
}

// ==================== 顶部区域：等级和经验 ====================
.top-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.level-display {
  display: flex;
  align-items: center;
  gap: 14px;
}

.level-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.level-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.level-name-row {
  display: flex;
  align-items: center;
  gap: 8px;

  h3 {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
    line-height: 1;
  }
}

.level-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 600;
  border: 1px solid;
  line-height: 1;
}

.level-info p {
  font-size: 12px;
  color: #64748B;
  margin: 0;
}

.exp-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.exp-label {
  font-size: 11px;
  color: #64748B;
  font-weight: 600;
}

.exp-nums {
  display: flex;
  align-items: baseline;
  gap: 4px;

  .current {
    font-size: 20px;
    font-weight: 700;
    color: #1E293B;
  }

  .sep {
    font-size: 14px;
    color: #CBD5E1;
  }

  .max {
    font-size: 14px;
    font-weight: 600;
    color: #94A3B8;
  }
}

// ==================== 进度条区域 ====================
.progress-section {
  margin-bottom: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #64748B;

  .percent {
    font-weight: 700;
  }
}

.progress-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

// ==================== 统计区域 ====================
.stats-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 18px;
    height: 18px;
    color: white;
  }
}

.stat-val {
  font-size: 18px;
  font-weight: 700;
  color: #1E293B;
}

.stat-label {
  font-size: 11px;
  color: #64748B;
}

// ==================== 互动区域 ====================
.interact-section {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.15));
  border-radius: 12px;
  padding: 14px;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.interact-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #92400E;
  margin-bottom: 10px;

  svg {
    width: 16px;
    height: 16px;
    color: #F59E0B;
  }

  .timer-text {
    margin-left: auto;
    font-size: 16px;
    font-weight: 700;
  }
}

.hint {
  font-size: 12px;
  color: #92400E;
  margin: 0;
  line-height: 1.4;
}

.collect-btn {
  width: 100%;
  padding: 10px 16px;
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);

  svg {
    width: 16px;
    height: 16px;

    &.spin {
      animation: spin 1s linear infinite;
    }
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// ==================== 加载状态 ====================
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #64748B;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #FF1493;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// ==================== 过渡动画 ====================
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// ==================== 深色模式 ====================
:global(.dark-mode) {
  .intimacy-panel {
    background: rgba(15, 23, 42, 0.98);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.1);

    svg {
      color: #94A3B8;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }

  .level-info p,
  .exp-label,
  .progress-header,
  .stat-label {
    color: #94A3B8;
  }

  .exp-nums .current,
  .stat-val {
    color: #F1F5F9;
  }

  .progress-bar {
    background: rgba(255, 255, 255, 0.1);
  }

  .stat {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .interact-section {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.2));
    border-color: rgba(245, 158, 11, 0.3);
  }

  .interact-header,
  .hint {
    color: #FBBF24;
  }
}

// ==================== 移动端适配 ====================
@media (max-width: 768px) {
  .intimacy-panel {
    padding: 18px 16px;
  }

  .panel-inner {
    padding-right: 36px;
  }

  .top-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .exp-display {
    align-items: flex-start;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }
}
</style>
