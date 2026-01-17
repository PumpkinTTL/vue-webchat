<template>
  <div class="intimacy-progress">
    <div v-if="showLabel" class="progress-header">
      <span class="progress-label">{{ label }}</span>
      <span class="progress-value">{{ currentExp }} / {{ maxExp }}</span>
    </div>
    <div class="progress-track">
      <div 
        class="progress-fill" 
        :style="{ 
          width: `${percent}%`,
          background: gradient 
        }"
      >
        <div class="progress-shine"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentExp: number
  maxExp: number
  percent: number
  color?: string
  label?: string
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: '#ec4899',
  label: '',
  showLabel: false
})

// 生成渐变
const gradient = computed(() => {
  return `linear-gradient(90deg, ${props.color}, ${lightenColor(props.color, 30)})`
})

function lightenColor(color: string, percent: number): string {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  const newR = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)))
  const newG = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)))
  const newB = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)))
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.intimacy-progress {
  width: 100%;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.progress-label {
  font-size: 13px;
  font-weight: 600;
  color: $text-secondary;
}

.progress-value {
  font-size: 12px;
  font-weight: 700;
  color: $primary-color;
}

.progress-track {
  width: 100%;
  height: 8px;
  background: rgba(226, 232, 240, 0.8);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.progress-shine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: progress-shine 2s ease-in-out infinite;
}

@keyframes progress-shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

// 深色模式
.dark-mode {
  .progress-label {
    color: $text-secondary-dark;
  }
  
  .progress-track {
    background: rgba(71, 85, 105, 0.3);
  }
}
</style>
