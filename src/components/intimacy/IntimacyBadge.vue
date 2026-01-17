<template>
  <div 
    class="intimacy-badge" 
    :class="sizeClass"
    :style="{ background: gradient }"
  >
    <span class="badge-level">{{ level }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  level: number
  color?: string
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  color: '#ec4899',
  size: 'medium'
})

// 根据颜色生成渐变
const gradient = computed(() => {
  // 如果已经是渐变，直接使用
  if (props.color.startsWith('linear-gradient')) {
    return props.color
  }
  
  // 否则生成渐变
  const baseColor = props.color
  return `linear-gradient(135deg, ${baseColor}, ${lightenColor(baseColor, 20)})`
})

// 颜色加亮函数
function lightenColor(color: string, percent: number): string {
  // 简单的颜色加亮（实际项目中可以使用更完善的颜色库）
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  const newR = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)))
  const newG = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)))
  const newB = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)))
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

const sizeClass = computed(() => {
  return `badge-${props.size}`
})
</script>

<style lang="scss" scoped>
.intimacy-badge {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
  position: relative;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    padding: 2px;
    background: linear-gradient(135deg, currentColor, transparent);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.5;
  }
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(236, 72, 153, 0.4);
  }
}

.badge-small {
  width: 32px;
  height: 32px;
  min-width: 32px;
  font-size: 14px;
}

.badge-medium {
  width: 40px;
  height: 40px;
  min-width: 40px;
  font-size: 18px;
}

.badge-large {
  width: 56px;
  height: 56px;
  min-width: 56px;
  font-size: 24px;
}

.badge-level {
  position: relative;
  z-index: 1;
}

// 深色模式
.dark-mode .intimacy-badge {
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.5);
  
  &:hover {
    box-shadow: 0 6px 16px rgba(236, 72, 153, 0.6);
  }
}
</style>
