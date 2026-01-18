<template>
  <TransitionGroup name="tip-list" tag="div" class="tip-container">
    <div
      v-for="tip in tips"
      :key="tip.id"
      class="tip-item"
    >
      <!-- 背景光晕效果 -->
      <div class="tip-glow"></div>
      
      <!-- 主内容 -->
      <div class="tip-main">
        <!-- 左侧图标 - 使用FontAwesome -->
        <div class="tip-icon-wrapper">
          <div class="tip-icon">
            <font-awesome-icon :icon="getIcon(tip.messageType)" />
          </div>
          <!-- 闪光效果 -->
          <div class="tip-sparkle"></div>
        </div>
        
        <!-- 中间内容 -->
        <div class="tip-content">
          <div class="tip-exp">
            <span class="tip-plus">+</span>
            <span class="tip-number">{{ tip.expGain }}</span>
            <span class="tip-label">EXP</span>
          </div>
          <div class="tip-type">{{ getTypeText(tip.messageType) }}</div>
        </div>
        
        <!-- 右侧装饰 -->
        <div class="tip-decoration">
          <div class="tip-particle tip-particle-1"></div>
          <div class="tip-particle tip-particle-2"></div>
          <div class="tip-particle tip-particle-3"></div>
        </div>
      </div>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import type { ExpTip } from '@/types/intimacy'

interface Props {
  tips: ExpTip[]
}

defineProps<Props>()

function getIcon(type: string): string {
  const iconMap: Record<string, string> = {
    'message': 'comment',
    'interaction': 'heart',
    'text': 'comment',
    'image': 'image',
    'video': 'video',
    'file': 'file'
  }
  return iconMap[type] || 'star'
}

function getTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    'message': '消息',
    'interaction': '互动奖励',
    'text': '消息',
    'image': '图片',
    'video': '视频',
    'file': '文件'
  }
  return typeMap[type] || '经验'
}
</script>

<style lang="scss" scoped>
// 变量已通过 vite.config.ts 全局导入

.tip-container {
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.tip-item {
  position: relative;
  width: 240px;
  animation: tip-entrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

// 背景光晕
.tip-glow {
  position: absolute;
  inset: -4px;
  background: linear-gradient(135deg, 
    rgba(139, 92, 246, 0.3), 
    rgba(236, 72, 153, 0.3)
  );
  border-radius: 16px;
  filter: blur(12px);
  opacity: 0;
  animation: glow-pulse 2s ease-in-out infinite;
}

// 主内容容器
.tip-main {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.9) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  border: 1.5px solid rgba(139, 92, 246, 0.2);
  border-radius: 14px;
  box-shadow: 
    0 8px 32px rgba(139, 92, 246, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  overflow: hidden;
}

// 图标包装器
.tip-icon-wrapper {
  position: relative;
  flex-shrink: 0;
}

// 图标容器
.tip-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #8B5CF6, #EC4899);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  box-shadow: 
    0 4px 12px rgba(139, 92, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: icon-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

// 闪光效果
.tip-sparkle {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: radial-gradient(circle at 30% 30%, 
    rgba(255, 255, 255, 0.8) 0%, 
    transparent 60%
  );
  opacity: 0;
  animation: sparkle 1.5s ease-out;
}

// 内容区域
.tip-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

// 经验值显示
.tip-exp {
  display: flex;
  align-items: baseline;
  gap: 4px;
  line-height: 1;
}

.tip-plus {
  font-size: 14px;
  font-weight: 700;
  color: #8B5CF6;
  opacity: 0;
  animation: fade-in 0.3s ease-out 0.2s forwards;
}

.tip-number {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, #8B5CF6, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  opacity: 0;
  animation: number-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
}

.tip-label {
  font-size: 11px;
  font-weight: 700;
  color: #8B5CF6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0;
  animation: fade-in 0.3s ease-out 0.3s forwards;
}

// 类型文本
.tip-type {
  font-size: 12px;
  font-weight: 500;
  color: #64748B;
  opacity: 0;
  animation: fade-in 0.3s ease-out 0.4s forwards;
}

// 装饰粒子
.tip-decoration {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
}

.tip-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B5CF6, #EC4899);
  opacity: 0;
}

.tip-particle-1 {
  animation: particle-float 1.5s ease-out;
}

.tip-particle-2 {
  animation: particle-float 1.5s ease-out 0.2s;
}

.tip-particle-3 {
  animation: particle-float 1.5s ease-out 0.4s;
}

// ==================== 动画 ====================

@keyframes tip-entrance {
  0% {
    opacity: 0;
    transform: translateX(100px) scale(0.8);
  }
  60% {
    transform: translateX(-8px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.95);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

@keyframes icon-bounce {
  0% {
    transform: scale(0);
    rotate: -180deg;
  }
  60% {
    transform: scale(1.15);
    rotate: 10deg;
  }
  100% {
    transform: scale(1);
    rotate: 0deg;
  }
}

@keyframes sparkle {
  0% {
    opacity: 0;
    transform: scale(0.5) rotate(0deg);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale(1.5) rotate(180deg);
  }
}

@keyframes number-pop {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(10px);
  }
  60% {
    transform: scale(1.1) translateY(-2px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes particle-float {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0);
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx, 20px), var(--ty, -30px)) scale(1.5);
  }
}

.tip-particle-1 {
  --tx: 15px;
  --ty: -25px;
}

.tip-particle-2 {
  --tx: 20px;
  --ty: -35px;
}

.tip-particle-3 {
  --tx: 10px;
  --ty: -30px;
}

// TransitionGroup 动画
.tip-list-move {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tip-list-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tip-list-leave-active {
  transition: all 0.4s ease-out;
  position: absolute;
}

.tip-list-enter-from {
  opacity: 0;
  transform: translateX(100px) scale(0.8);
}

.tip-list-leave-to {
  opacity: 0;
  transform: translateX(60px) scale(0.9);
}

// ==================== 深色模式 ====================

:global(.dark-mode) {
  .tip-main {
    background: linear-gradient(135deg, 
      rgba(30, 41, 59, 0.95) 0%, 
      rgba(30, 41, 59, 0.9) 100%
    );
    border-color: rgba(139, 92, 246, 0.3);
    box-shadow: 
      0 8px 32px rgba(139, 92, 246, 0.2),
      0 2px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .tip-type {
    color: #94A3B8;
  }

  .tip-glow {
    background: linear-gradient(135deg, 
      rgba(139, 92, 246, 0.4), 
      rgba(236, 72, 153, 0.4)
    );
  }
}

// ==================== 响应式 ====================

@media (max-width: 768px) {
  .tip-container {
    top: 64px;
    right: 16px;
    gap: 10px;
  }

  .tip-item {
    width: 200px;
  }

  .tip-main {
    padding: 10px 12px;
    gap: 10px;
  }

  .tip-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .tip-number {
    font-size: 18px;
  }

  .tip-label {
    font-size: 10px;
  }

  .tip-type {
    font-size: 11px;
  }
}
</style>
