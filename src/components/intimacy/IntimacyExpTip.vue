<template>
  <Transition name="tip-fade">
    <div v-if="visible" class="tip-container">
      <div
        v-for="tip in tips"
        :key="tip.id"
        class="tip-item"
        :style="{ animationDelay: `${getDelay(tip)}ms` }"
      >
        <div class="tip-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
        </div>
        <div class="tip-content">
          <span class="tip-text">+{{ tip.expGain }}</span>
          <span class="tip-type">{{ getTypeText(tip.messageType) }}</span>
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
  return index * 80
}

function getTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    'message': '消息',
    'interaction': '互动',
    'text': '消息',
    'image': '图片',
    'video': '视频',
    'file': '文件'
  }
  return typeMap[type] || '经验'
}
</script>

<style lang="scss" scoped>
.tip-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  animation: tip-slide-in 0.3s ease-out forwards;
  min-width: 160px;
}

.tip-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 16px;
    height: 16px;
    color: white;
  }
}

.tip-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tip-text {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}

.tip-type {
  font-size: 12px;
  color: #9CA3AF;
}

@keyframes tip-slide-in {
  from {
    opacity: 0;
    transform: translateX(60px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.tip-fade-enter-active,
.tip-fade-leave-active {
  transition: all 0.25s ease;
}

.tip-fade-enter-from,
.tip-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

// 深色模式
:global(.dark-mode) .tip-item {
  background: rgba(31, 41, 59, 0.95);
  border-color: rgba(139, 92, 246, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

  .tip-text {
    color: #A78BFA;
  }

  .tip-type {
    color: #9CA3AF;
  }
}

// 响应式
@media (max-width: 768px) {
  .tip-container {
    top: 60px;
    right: 16px;
  }

  .tip-item {
    min-width: 140px;
    padding: 8px 12px;
  }

  .tip-icon {
    width: 24px;
    height: 24px;

    svg {
      width: 14px;
      height: 14px;
    }
  }

  .tip-text {
    font-size: 13px;
  }

  .tip-type {
    font-size: 11px;
  }
}
</style>
