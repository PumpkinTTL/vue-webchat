<template>
  <div class="test-container">
    <div class="test-header">
      <h1>深色模式测试</h1>
      <button @click="toggleDark" class="toggle-btn">
        切换深色模式 (当前: {{ isDark ? '深色' : '浅色' }})
      </button>
    </div>

    <div class="test-content">
      <div class="test-card">
        <h2>测试卡片 1</h2>
        <p>这是一个测试卡片，用于验证深色模式是否正常工作。</p>
      </div>

      <div class="test-card">
        <h2>测试卡片 2</h2>
        <p>如果深色模式正常，这个卡片的背景和文字颜色应该会改变。</p>
      </div>

      <div class="test-info">
        <p>HTML 类名: {{ htmlClass }}</p>
        <p>深色模式状态: {{ isDark }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const isDark = ref(false)

const htmlClass = computed(() => {
  return document.documentElement.className || '(无)'
})

const toggleDark = () => {
  isDark.value = !isDark.value
  localStorage.setItem('darkMode', String(isDark.value))
  
  if (isDark.value) {
    document.documentElement.classList.add('dark-mode')
  } else {
    document.documentElement.classList.remove('dark-mode')
  }
}

onMounted(() => {
  isDark.value = localStorage.getItem('darkMode') === 'true'
  if (isDark.value) {
    document.documentElement.classList.add('dark-mode')
  }
})
</script>

<style lang="scss" scoped>
.test-container {
  min-height: 100vh;
  padding: 40px;
  background: #ffffff;
  color: #000000;
  transition: all 0.3s ease;
}

.test-header {
  margin-bottom: 40px;
  text-align: center;
}

.test-header h1 {
  font-size: 32px;
  margin-bottom: 20px;
}

.toggle-btn {
  padding: 12px 24px;
  font-size: 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
}

.test-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.test-card {
  padding: 24px;
  background: #f3f4f6;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.test-card h2 {
  font-size: 24px;
  margin-bottom: 12px;
  color: #1f2937;
}

.test-card p {
  font-size: 16px;
  line-height: 1.6;
  color: #4b5563;
}

.test-info {
  padding: 20px;
  background: #fef3c7;
  border-radius: 8px;
  border: 2px solid #fbbf24;
}

.test-info p {
  margin: 8px 0;
  font-family: monospace;
  font-size: 14px;
}

/* ==================== 深色模式适配 ==================== */
/* 方法1: 使用 :global() 包裹整个选择器 */
:global(.dark-mode .test-container) {
  background: #0f172a;
  color: #f1f5f9;
}

:global(.dark-mode .test-card) {
  background: #1e293b;
  border-color: #334155;
}

:global(.dark-mode .test-card h2) {
  color: #f1f5f9;
}

:global(.dark-mode .test-card p) {
  color: #cbd5e1;
}

:global(.dark-mode .test-info) {
  background: #1e293b;
  border-color: #3b82f6;
  color: #93c5fd;
}
</style>
