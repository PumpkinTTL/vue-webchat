<template>
  <div class="test-container">
    <div class="content-area">
      <div class="header">
        <h1>灵动胶囊 Tabbar</h1>
        <p>Dynamic Capsule Navigation</p>
      </div>

      <div class="controls">
        <el-switch
          v-model="isDark"
          active-text="深色模式"
          inactive-text="浅色模式"
          @change="handleThemeChange"
          style="--el-switch-on-color: #2563EB;"
        />
      </div>
      
      <div class="preview-card">
        <transition name="fade" mode="out-in">
          <div :key="activeTab" class="active-content">
            <font-awesome-icon :icon="tabs[activeTab].icon" class="big-icon" />
            <h2>{{ tabs[activeTab].label }}</h2>
            <div class="status-badge">Index: {{ activeTab }}</div>
          </div>
        </transition>
      </div>

      <div class="instruction">
        <p>Try clicking the tabs below to see the animation</p>
      </div>
    </div>

    <!-- Mount the Tabbar here -->
    <Tabbar v-model="activeTab" :tabs="tabs" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Tabbar from '@/components/common/Tabbar.vue'
import { useDarkMode } from '@/composables/useDarkMode'

const { isDarkMode, toggle } = useDarkMode()
const isDark = ref(isDarkMode.value)

const activeTab = ref(0)
const tabs = [
  { label: '首页', icon: 'home' },
  { label: '发现', icon: 'rocket' },
  { label: '消息', icon: 'comments', badge: 5 },
  { label: '我的', icon: 'user' }
]

const handleThemeChange = () => {
  toggle()
  isDark.value = isDarkMode.value
}

onMounted(() => {
  isDark.value = isDarkMode.value
})
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;

.test-container {
  min-height: 100vh;
  width: 100%;
  background-color: $bg-color-page;
  transition: background-color 0.3s ease;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  // Use global class for dark mode styles
  :global(.dark-mode) & {
    background-color: $bg-color-dark;
  }
}

.content-area {
  width: 100%;
  max-width: 500px;
  text-align: center;
  margin-top: 60px;
}

.header {
  margin-bottom: 40px;
  
  h1 {
    font-size: 28px;
    font-weight: 800;
    margin-bottom: 8px;
    background: linear-gradient(135deg, $primary-color, $primary-lighter);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: $text-tertiary;
    font-size: 14px;
    
    :global(.dark-mode) & {
      color: $text-tertiary-dark;
    }
  }
}

.controls {
  margin-bottom: 40px;
}

.preview-card {
  background: $bg-color-elevated;
  border-radius: 32px;
  padding: 60px 20px;
  box-shadow: $box-shadow-xl;
  border: 1px solid $border-light;
  margin-bottom: 40px;
  transition: all 0.3s ease;
  
  :global(.dark-mode) & {
    background: $bg-color-elevated-dark;
    border-color: $border-base-dark;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  }
}

.active-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  
  h2 {
    font-size: 24px;
    margin: 0;
    color: $text-primary;
    
    :global(.dark-mode) & {
      color: $text-primary-dark;
    }
  }
}

.status-badge {
  padding: 4px 12px;
  background: rgba($primary-color, 0.1);
  color: $primary-color;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  
  :global(.dark-mode) & {
    background: rgba($primary-color, 0.2);
    color: $primary-lighter;
  }
}

.big-icon {
  width: 80px;
  height: 80px;
  color: $primary-color;
  filter: drop-shadow(0 10px 20px rgba($primary-color, 0.3));
  animation: float 4s ease-in-out infinite;
}

.instruction {
  color: $text-placeholder;
  font-size: 12px;
  margin-top: 20px;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
