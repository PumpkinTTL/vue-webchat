<template>
  <div v-if="intimacyInfo" class="intimacy-header">
    <IntimacyBadge 
      :level="intimacyInfo.current_level" 
      :color="intimacyInfo.level_color"
      size="small"
    />
    <div class="intimacy-info">
      <div class="intimacy-title">
        <svg class="heart-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
        <span>Lv.{{ intimacyInfo.current_level }} {{ intimacyInfo.level_name }}</span>
      </div>
      <IntimacyProgress 
        :current-exp="intimacyInfo.current_exp"
        :max-exp="intimacyInfo.next_level_exp"
        :percent="intimacyInfo.progress_percent"
        :color="intimacyInfo.level_color"
      />
    </div>
    <div class="intimacy-stats">
      <div class="stat-item">
        <span class="stat-value">{{ intimacyInfo.current_exp }}</span>
        <span class="stat-label">经验</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IntimacyBadge from './IntimacyBadge.vue'
import IntimacyProgress from './IntimacyProgress.vue'
import type { IntimacyInfo } from '@/types/intimacy'

interface Props {
  intimacyInfo: IntimacyInfo | null
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.intimacy-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  border: 1px solid rgba(236, 72, 153, 0.15);
  margin-top: 8px;
}

.intimacy-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.intimacy-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #ec4899;
}

.heart-icon {
  width: 14px;
  height: 14px;
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  10%, 30% { transform: scale(1.1); }
  20%, 40% { transform: scale(1); }
}

.intimacy-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.stat-value {
  font-size: 14px;
  font-weight: 700;
  color: #ec4899;
}

.stat-label {
  font-size: 10px;
  color: $text-tertiary;
}

// 深色模式
.dark-mode {
  .intimacy-header {
    background: rgba(30, 41, 59, 0.6);
    border-color: rgba(236, 72, 153, 0.25);
  }
  
  .stat-label {
    color: $text-tertiary-dark;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .intimacy-header {
    padding: 8px 12px;
    gap: 10px;
  }
  
  .intimacy-title {
    font-size: 12px;
  }
  
  .heart-icon {
    width: 12px;
    height: 12px;
  }
  
  .stat-value {
    font-size: 13px;
  }
  
  .stat-label {
    font-size: 9px;
  }
}
</style>
