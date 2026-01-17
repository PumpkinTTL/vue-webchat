<template>
  <Transition name="exp-tip-fade">
    <div v-if="visible" class="exp-tip-container">
      <div 
        v-for="tip in tips" 
        :key="tip.id" 
        class="exp-tip"
        :style="{ animationDelay: `${getDelay(tip)}ms` }"
      >
        <div class="exp-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
        <div class="exp-content">
          <span class="exp-text">+{{ tip.expGain }} 好感度</span>
          <span class="exp-type">{{ getTypeText(tip.messageType) }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ExpTip } from '@/types/intimacy'

interface Props {
  tips: ExpTip[]
}

const props = defineProps<Props>()

const visible = computed(() => props.tips.length > 0)

function getDelay(tip: ExpTip): number {
  const index = props.tips.findIndex(t => t.id === tip.id)
  return index * 100
}

function getTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    'message': '发送消息',
    'interaction': '互动奖励',
    'text': '文本消息',
    'image': '图片消息',
    'video': '视频消息',
    'file': '文件消息'
  }
  return typeMap[type] || '获得经验'
}
</script>

<style lang="scss" scoped>
.exp-tip-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.exp-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(236, 72, 153, 0.2);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  animation: exp-tip-slide-in 0.3s ease-out forwards;
  min-width: 200px;
}

.exp-icon {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec4899, #f97316);
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 18px;
    height: 18px;
    color: white;
  }
}

.exp-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exp-text {
  font-size: 14px;
  font-weight: 700;
  color: #ec4899;
}

.exp-type {
  font-size: 11px;
  color: $text-tertiary;
}

@keyframes exp-tip-slide-in {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.exp-tip-fade-enter-active,
.exp-tip-fade-leave-active {
  transition: all 0.3s ease;
}

.exp-tip-fade-enter-from,
.exp-tip-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// 深色模式
.dark-mode {
  .exp-tip {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(236, 72, 153, 0.3);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }
  
  .exp-type {
    color: $text-tertiary-dark;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .exp-tip-container {
    top: 60px;
    right: 10px;
  }
  
  .exp-tip {
    min-width: 160px;
    padding: 10px 12px;
  }
  
  .exp-icon {
    width: 28px;
    height: 28px;
    min-width: 28px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
  
  .exp-text {
    font-size: 13px;
  }
  
  .exp-type {
    font-size: 10px;
  }
}
</style>
