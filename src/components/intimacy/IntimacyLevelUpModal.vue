<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="level-up-overlay" @click="handleClose">
        <div class="level-up-modal" @click.stop :style="{ '--intimacy-color': levelUpData?.levelColor || '#ec4899' }">
          
          <!-- 背景装饰 - 和亲密度面板一样 -->
          <div class="bg-decoration">
            <div class="sparkle-particle p1"></div>
            <div class="sparkle-particle p2"></div>
            <div class="sparkle-particle p3"></div>
            <div class="sparkle-particle p4"></div>
            <div class="wave-line w1"></div>
            <div class="wave-line w2"></div>
          </div>
          
          <!-- 内容 -->
          <div class="level-up-content">
            <!-- 爱心图标 - 和亲密度面板一样的风格 -->
            <div class="intimacy-heart-wrapper">
              <font-awesome-icon icon="heart" class="intimacy-heart-icon neon-glow" />
              <div class="heart-glow"></div>
              <div class="heart-ring"></div>
            </div>
            
            <!-- 标题 -->
            <h2 class="level-up-title neon-text">
              恭喜升级！
            </h2>
            
            <!-- 等级信息 -->
            <div class="level-info">
              <div class="level-name-row">
                <span class="intimacy-level-name neon-text">
                  {{ levelUpData?.levelName }}
                </span>
                <span class="intimacy-level-badge neon-badge">
                  Lv.{{ levelUpData?.newLevel }}
                </span>
              </div>
              <div class="level-subtitle">亲密关系升级</div>
            </div>
            
            <!-- 装饰爱心 -->
            <div class="floating-hearts">
              <span class="mini-heart h1">♥</span>
              <span class="mini-heart h2">♥</span>
              <span class="mini-heart h3">♥</span>
            </div>
            
            <!-- 闪光装饰 -->
            <div class="love-sparkles">
              <span class="sparkle s1"></span>
              <span class="sparkle s2"></span>
              <span class="sparkle s3"></span>
              <span class="sparkle s4"></span>
            </div>
            
            <!-- 按钮 -->
            <button class="level-up-btn" @click="handleClose">
              <span class="btn-text">太棒了</span>
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 13l4 4L19 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { LevelUpData } from '@/types/intimacy'

interface Props {
  visible: boolean
  levelUpData: LevelUpData | null
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

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
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.level-up-modal {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 56px 40px 48px;
  background: var(--header-bg, #ffffff);
  border-radius: 24px;
  text-align: center;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

// 背景装饰 - 复制亲密度面板的样式
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.4;
}

.sparkle-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--intimacy-color, #ec4899);
  border-radius: 50%;
  animation: sparkle-float 3s ease-in-out infinite;
  box-shadow: 0 0 10px var(--intimacy-color, #ec4899);
}

.p1 { top: 15%; left: 10%; animation-delay: 0s; }
.p2 { top: 25%; right: 15%; animation-delay: 0.8s; }
.p3 { bottom: 30%; left: 20%; animation-delay: 1.6s; }
.p4 { bottom: 20%; right: 12%; animation-delay: 2.4s; }

@keyframes sparkle-float {
  0%, 100% {
    opacity: 0;
    transform: translateY(0) scale(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-20px) scale(1);
  }
}

.wave-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent, 
    color-mix(in srgb, var(--intimacy-color, #ec4899) 30%, transparent), 
    transparent
  );
  animation: wave-move 4s ease-in-out infinite;
}

.w1 {
  top: 30%;
  animation-delay: 0s;
}

.w2 {
  bottom: 35%;
  animation-delay: 2s;
}

@keyframes wave-move {
  0%, 100% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    transform: translateX(100%);
    opacity: 0.5;
  }
}

// 内容
.level-up-content {
  position: relative;
  z-index: 1;
}

// 爱心图标 - 复制亲密度面板的样式
.intimacy-heart-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: heart-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.intimacy-heart-icon {
  font-size: 64px;
  color: var(--intimacy-color, #ec4899);
  position: relative;
  z-index: 2;
  animation: heart-beat 1.5s ease-in-out infinite;
}

.heart-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  background: var(--intimacy-color, #ec4899);
  border-radius: 50%;
  filter: blur(30px);
  opacity: 0.4;
  animation: glow-pulse 2s ease-in-out infinite;
}

.heart-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border: 3px solid var(--intimacy-color, #ec4899);
  border-radius: 50%;
  opacity: 0.3;
  animation: ring-expand 2s ease-out infinite;
}

@keyframes heart-pop {
  0% {
    transform: scale(0) rotate(-30deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes heart-beat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes ring-expand {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0;
  }
}

// 霓虹文字效果 - 复制亲密度面板的样式
.neon-text {
  color: var(--intimacy-color, #ec4899);
  text-shadow: 
    0 0 10px color-mix(in srgb, var(--intimacy-color, #ec4899) 80%, transparent),
    0 0 20px color-mix(in srgb, var(--intimacy-color, #ec4899) 60%, transparent),
    0 0 30px color-mix(in srgb, var(--intimacy-color, #ec4899) 40%, transparent);
}

.neon-glow {
  filter: drop-shadow(0 0 15px var(--intimacy-color, #ec4899))
          drop-shadow(0 0 25px color-mix(in srgb, var(--intimacy-color, #ec4899) 60%, transparent));
}

.neon-badge {
  box-shadow: 
    0 0 15px color-mix(in srgb, var(--intimacy-color, #ec4899) 50%, transparent),
    inset 0 0 15px color-mix(in srgb, var(--intimacy-color, #ec4899) 20%, transparent);
}

// 标题
.level-up-title {
  font-size: 42px;
  font-weight: 900;
  margin: 0 0 28px;
  animation: title-glow 0.6s ease-out 0.3s both;
}

@keyframes title-glow {
  0% {
    opacity: 0;
    transform: translateY(20px);
    filter: blur(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

// 等级信息 - 复制亲密度面板的样式
.level-info {
  margin-bottom: 36px;
  animation: info-fade 0.6s ease-out 0.5s both;
}

.level-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.intimacy-level-name {
  font-size: 32px;
  font-weight: 800;
}

.intimacy-level-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  background: color-mix(in srgb, var(--intimacy-color, #ec4899) 15%, transparent);
  border: 2px solid color-mix(in srgb, var(--intimacy-color, #ec4899) 30%, transparent);
  border-radius: 12px;
  font-weight: 800;
  font-size: 20px;
  color: var(--intimacy-color, #ec4899);
  animation: badge-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s both;
}

.level-subtitle {
  font-size: 14px;
  color: var(--text-secondary, #64748b);
  font-weight: 500;
}

@keyframes info-fade {
  0% {
    opacity: 0;
    transform: translateY(15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes badge-bounce {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

// 浮动爱心 - 复制亲密度面板的样式
.floating-hearts {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.mini-heart {
  position: absolute;
  font-size: 20px;
  color: var(--intimacy-color, #ec4899);
  opacity: 0;
  animation: heart-float 4s ease-in-out infinite;
  filter: drop-shadow(0 0 8px var(--intimacy-color, #ec4899));
}

.h1 { left: 15%; animation-delay: 0s; }
.h2 { left: 75%; animation-delay: 1.3s; }
.h3 { left: 45%; animation-delay: 2.6s; }

@keyframes heart-float {
  0% {
    bottom: -5%;
    opacity: 0;
    transform: translateY(0) scale(0.8);
  }
  20% {
    opacity: 0.7;
  }
  80% {
    opacity: 0.7;
  }
  100% {
    bottom: 105%;
    opacity: 0;
    transform: translateY(-10px) scale(1);
  }
}

// 闪光装饰 - 复制亲密度面板的样式
.love-sparkles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--intimacy-color, #ec4899);
  border-radius: 50%;
  opacity: 0;
  animation: sparkle-twinkle 3s ease-in-out infinite;
  box-shadow: 0 0 12px var(--intimacy-color, #ec4899);
}

.s1 { top: 20%; left: 12%; animation-delay: 0s; }
.s2 { top: 35%; right: 18%; animation-delay: 0.75s; }
.s3 { bottom: 25%; left: 22%; animation-delay: 1.5s; }
.s4 { bottom: 40%; right: 15%; animation-delay: 2.25s; }

@keyframes sparkle-twinkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

// 按钮
.level-up-btn {
  position: relative;
  padding: 16px 44px;
  background: linear-gradient(135deg, 
    var(--intimacy-color, #ec4899), 
    color-mix(in srgb, var(--intimacy-color, #ec4899) 85%, white)
  );
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  animation: btn-rise 0.5s ease-out 0.9s both;
  box-shadow: 
    0 8px 24px color-mix(in srgb, var(--intimacy-color, #ec4899) 40%, transparent),
    0 0 30px color-mix(in srgb, var(--intimacy-color, #ec4899) 20%, transparent);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }
  
  .btn-text,
  .btn-icon {
    position: relative;
    z-index: 1;
  }
  
  .btn-icon {
    width: 22px;
    height: 22px;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: 
      0 12px 32px color-mix(in srgb, var(--intimacy-color, #ec4899) 50%, transparent),
      0 0 40px color-mix(in srgb, var(--intimacy-color, #ec4899) 30%, transparent);
    
    &::before {
      left: 100%;
    }
    
    .btn-icon {
      transform: translateX(3px);
    }
  }
  
  &:active {
    transform: translateY(-1px) scale(1);
  }
}

@keyframes btn-rise {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// 过渡动画
.modal-fade-enter-active {
  transition: all 0.4s ease;
  
  .level-up-modal {
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.modal-fade-leave-active {
  transition: all 0.3s ease;
  
  .level-up-modal {
    transition: all 0.3s ease;
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  
  .level-up-modal {
    transform: scale(0.85) translateY(30px);
    opacity: 0;
  }
}

// 深色模式
html.dark-mode .level-up-overlay {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);

  .level-up-modal {
    background: var(--bg-color-elevated-dark, #1e293b);
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  }
  
  .level-subtitle {
    color: var(--text-secondary-dark, #cbd5e1);
  }

  .level-up-btn {
    box-shadow: 
      0 8px 24px color-mix(in srgb, var(--intimacy-color, #ec4899) 50%, transparent),
      0 0 35px color-mix(in srgb, var(--intimacy-color, #ec4899) 28%, transparent);
    
    &:hover {
      box-shadow: 
        0 12px 32px color-mix(in srgb, var(--intimacy-color, #ec4899) 60%, transparent),
        0 0 45px color-mix(in srgb, var(--intimacy-color, #ec4899) 38%, transparent);
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .level-up-modal {
    padding: 48px 32px 44px;
    max-width: 90%;
    border-radius: 20px;
  }
  
  .intimacy-heart-wrapper {
    width: 100px;
    height: 100px;
    margin-bottom: 28px;
  }
  
  .intimacy-heart-icon {
    font-size: 56px;
  }
  
  .heart-glow {
    width: 120px;
    height: 120px;
  }
  
  .heart-ring {
    width: 85px;
    height: 85px;
  }
  
  .level-up-title {
    font-size: 36px;
    margin-bottom: 24px;
  }
  
  .level-info {
    margin-bottom: 32px;
  }
  
  .intimacy-level-name {
    font-size: 28px;
  }
  
  .intimacy-level-badge {
    font-size: 18px;
    padding: 5px 14px;
  }
  
  .level-subtitle {
    font-size: 13px;
  }
  
  .level-up-btn {
    padding: 14px 36px;
    font-size: 16px;
    
    .btn-icon {
      width: 20px;
      height: 20px;
    }
  }
  
  .mini-heart {
    font-size: 18px;
  }
}
</style>
