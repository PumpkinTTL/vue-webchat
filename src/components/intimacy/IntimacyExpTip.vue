<template>
  <div class="exp-tips-container">
    <TransitionGroup name="exp-tip">
      <div
        v-for="tip in tips"
        :key="tip.id"
        class="exp-tip"
        :class="{ 'dark-mode': isDarkMode }"
        :style="{ 
          '--random-x': `${getRandomOffset(tip)}px`,
          transform: `translateX(${getRandomOffset(tip)}px)`
        }"
      >
        <div class="exp-tip-inner">
          <!-- 图标 -->
          <div class="exp-icon">
            <font-awesome-icon :icon="['fas', getIcon(tip.messageType)]" />
          </div>
          
          <!-- 内容 -->
          <div class="exp-content">
            <span class="exp-value">+{{ tip.expGain }}</span>
            <span class="exp-label">{{ getTypeText(tip.messageType) }}</span>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ExpTip } from '@/types/intimacy'

interface Props {
  tips: ExpTip[]
}

defineProps<Props>()

// 检测深色模式
const isDarkMode = computed(() => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('darkMode') === 'true'
})

// 为每个tip生成随机的水平偏移
const offsetCache = new Map<string, number>()

function getRandomOffset(tip: ExpTip): number {
  if (!offsetCache.has(tip.id)) {
    offsetCache.set(tip.id, Math.random() * 120 - 60) // -60px 到 60px
  }
  return offsetCache.get(tip.id)!
}

function getIcon(type: string): string {
  const iconMap: Record<string, string> = {
    'message': 'comment-dots',
    'interaction': 'heart',
    'text': 'comment-dots',
    'image': 'image',
    'video': 'video',
    'file': 'file-alt'
  }
  return iconMap[type] || 'star'
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
  return typeMap[type] || 'EXP'
}
</script>

<style lang="scss" scoped>
.exp-tips-container {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.exp-tip {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.exp-tip-inner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.9) 100%
  );
  backdrop-filter: blur(10px) saturate(150%);
  border-radius: 18px;
  border: 1px solid rgba(139, 92, 246, 0.15);
  white-space: nowrap;
  position: relative;
}

.exp-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 11px;
  flex-shrink: 0;
}

.exp-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.exp-value {
  font-size: 13px;
  font-weight: 700;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0;
  line-height: 1.2;
}

.exp-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748B;
  line-height: 1.2;
}

// 进入动画
.exp-tip-enter-active {
  animation: slideInDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

// 离开动画
.exp-tip-leave-active {
  animation: slideOutUp 0.3s ease-in;
}

// 移动动画
.exp-tip-move {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateX(var(--random-x)) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(var(--random-x)) translateY(0);
  }
}

@keyframes slideOutUp {
  from {
    opacity: 1;
    transform: translateX(var(--random-x)) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(var(--random-x)) translateY(-20px);
  }
}

// 深色模式
.exp-tip.dark-mode {
  .exp-tip-inner {
    background: linear-gradient(135deg, 
      rgba(15, 23, 42, 0.95) 0%, 
      rgba(30, 41, 59, 0.9) 100%
    );
    border: 1px solid rgba(139, 92, 246, 0.3);
    backdrop-filter: blur(12px) saturate(180%);
    box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.05);
  }

  .exp-icon {
    background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
  }

  .exp-value {
    background: linear-gradient(135deg, #A855F7 0%, #F472B6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: brightness(1.1);
  }

  .exp-label {
    color: #CBD5E1;
  }

  /* 增强动画效果 */
  .exp-tip-inner::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, 
      rgba(139, 92, 246, 0.1) 0%, 
      rgba(236, 72, 153, 0.1) 100%
    );
    border-radius: 18px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .exp-tip:hover .exp-tip-inner::before {
    opacity: 1;
  }
}

// 响应式
@media (max-width: 768px) {
  .exp-tips-container {
    top: 70px;
  }

  .exp-tip-inner {
    padding: 5px 10px;
    gap: 5px;
  }

  .exp-icon {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }

  .exp-value {
    font-size: 12px;
  }

  .exp-label {
    font-size: 9px;
  }
}
</style>
