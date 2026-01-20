<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="level-up-overlay" @click="handleClose">
        <div class="level-up-modal" @click.stop>
          <!-- 装饰元素 -->
          <div class="deco-circle deco-circle-1"></div>
          <div class="deco-circle deco-circle-2"></div>
          
          <!-- 星星装饰 -->
          <svg class="deco-star deco-star-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <svg class="deco-star deco-star-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <svg class="deco-star deco-star-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <svg class="deco-star deco-star-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          
          <!-- 爱心粒子 -->
          <svg class="heart-particle heart-particle-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          <svg class="heart-particle heart-particle-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          <svg class="heart-particle heart-particle-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          <svg class="heart-particle heart-particle-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          
          <!-- 内容 -->
          <div class="level-up-content">
            <div class="level-up-icon" :style="{ background: levelGradient }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <h2 class="level-up-title" :style="{ background: levelGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }">
              升级啦！
            </h2>
            <p class="level-up-subtitle">
              恭喜亲密度升至 
              <span class="level-highlight" :style="{ color: levelUpData?.levelColor }">
                Lv.{{ levelUpData?.newLevel }} {{ levelUpData?.levelName }}
              </span>
            </p>
            <button class="level-up-btn" :style="{ background: levelGradient }" @click="handleClose">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 13l4 4L19 7"/>
              </svg>
              <span>太棒了！</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LevelUpData } from '@/types/intimacy'

interface Props {
  visible: boolean
  levelUpData: LevelUpData | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const levelGradient = computed(() => {
  if (!props.levelUpData?.levelColor) {
    return 'linear-gradient(135deg, #ec4899, #9333ea)'
  }
  const color = props.levelUpData.levelColor
  return `linear-gradient(135deg, ${color}, ${lightenColor(color, 30)})`
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

function handleClose() {
  emit('close')
}
</script>

<style lang="scss" scoped>
.level-up-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

/* 过渡期间移除backdrop-filter，避免影响页面 */
.modal-fade-leave-active .level-up-overlay {
  backdrop-filter: none !important;
}

.level-up-modal {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 48px 36px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  text-align: center;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

// 装饰圆圈
.deco-circle {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(236, 72, 153, 0.2);
  animation: rotate 20s linear infinite;
}

.deco-circle-1 {
  width: 200px;
  height: 200px;
  top: -80px;
  right: -80px;
}

.deco-circle-2 {
  width: 150px;
  height: 150px;
  bottom: -60px;
  left: -60px;
  animation-direction: reverse;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 星星装饰
.deco-star {
  position: absolute;
  width: 20px;
  height: 20px;
  color: #f9a916;
  animation: star-twinkle 1.5s ease-in-out infinite;
}

.deco-star-1 { top: 20px; left: 30px; animation-delay: 0s; }
.deco-star-2 { top: 40px; right: 40px; animation-delay: 0.3s; }
.deco-star-3 { bottom: 30px; left: 50px; animation-delay: 0.6s; }
.deco-star-4 { bottom: 50px; right: 30px; animation-delay: 0.9s; }

@keyframes star-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

// 爱心粒子
.heart-particle {
  position: absolute;
  width: 24px;
  height: 24px;
  color: #ec4899;
  animation: heart-float 3s ease-in-out infinite;
}

.heart-particle-1 { top: 60%; left: 10%; animation-delay: 0s; }
.heart-particle-2 { top: 30%; right: 15%; animation-delay: 0.5s; }
.heart-particle-3 { bottom: 20%; right: 20%; animation-delay: 1s; }
.heart-particle-4 { top: 20%; left: 20%; animation-delay: 1.5s; }

@keyframes heart-float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
    opacity: 1;
  }
}

// 内容
.level-up-content {
  position: relative;
  z-index: 1;
}

.level-up-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 40px rgba(236, 72, 153, 0.4);
  animation: level-up-bounce 0.6s ease-out;
  
  svg {
    width: 48px;
    height: 48px;
    color: white;
  }
}

@keyframes level-up-bounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.level-up-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 12px;
  background-clip: text;
}

.level-up-subtitle {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 28px;
}

.level-highlight {
  font-weight: 700;
  font-size: 18px;
}

.level-up-btn {
  padding: 14px 36px;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(236, 72, 153, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
}

// 过渡动画
.modal-fade-enter-active {
  transition: all 0.3s ease;
  
  .level-up-modal {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.modal-fade-leave-active {
  transition: all 0.2s ease;
  
  .level-up-modal {
    transition: all 0.2s ease;
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  
  .level-up-modal {
    transform: scale(0.8);
  }
}

// 深色模式
.chat-app.dark-mode .level-up-overlay {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);

  .level-up-modal {
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.05),
      0 0 40px rgba(236, 72, 153, 0.2);
  }
  
  .level-up-title {
    background-clip: text;
    filter: brightness(1.1) drop-shadow(0 0 20px currentColor);
  }
  
  .level-up-subtitle {
    color: #cbd5e1;
    text-shadow: 0 0 10px rgba(203, 213, 225, 0.3);
  }

  .level-highlight {
    filter: brightness(1.1);
    text-shadow: 0 0 15px currentColor;
  }

  /* 装饰元素 */
  .deco-circle {
    border-color: rgba(236, 72, 153, 0.3);
    box-shadow: 0 0 20px rgba(236, 72, 153, 0.2);
  }

  .deco-star {
    color: #fbbf24;
    filter: brightness(1.1) drop-shadow(0 0 8px currentColor);
  }

  .heart-particle {
    color: #f472b6;
    filter: brightness(1.1) drop-shadow(0 0 8px currentColor);
  }

  /* 图标 */
  .level-up-icon {
    box-shadow: 
      0 10px 40px rgba(236, 72, 153, 0.6),
      0 0 60px rgba(236, 72, 153, 0.4);
    filter: brightness(1.1);

    svg {
      filter: drop-shadow(0 0 8px white);
    }
  }

  /* 按钮 */
  .level-up-btn {
    box-shadow: 
      0 4px 15px rgba(236, 72, 153, 0.5),
      0 0 30px rgba(236, 72, 153, 0.3);
    
    svg {
      filter: drop-shadow(0 0 4px white);
    }
    
    &:hover {
      box-shadow: 
        0 8px 25px rgba(236, 72, 153, 0.6),
        0 0 40px rgba(236, 72, 153, 0.4);
      transform: translateY(-2px);
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .level-up-modal {
    padding: 36px 24px;
    max-width: 90%;
  }
  
  .level-up-icon {
    width: 80px;
    height: 80px;
    margin-bottom: 20px;
    
    svg {
      width: 40px;
      height: 40px;
    }
  }
  
  .level-up-title {
    font-size: 28px;
  }
  
  .level-up-subtitle {
    font-size: 14px;
    margin-bottom: 24px;
  }
  
  .level-highlight {
    font-size: 16px;
  }
  
  .level-up-btn {
    padding: 12px 28px;
    font-size: 14px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
  
  .deco-star,
  .heart-particle {
    width: 18px;
    height: 18px;
  }
}
</style>
