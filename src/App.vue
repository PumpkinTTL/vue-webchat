<template>
  <a-config-provider :theme="themeConfig">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { theme } from 'ant-design-vue'

// 深色模式状态
const isDarkMode = ref(false)

// 主题配置
const themeConfig = computed(() => ({
  algorithm: isDarkMode.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
}))

// 从 localStorage 读取初始值
const loadDarkMode = () => {
  isDarkMode.value = localStorage.getItem('darkMode') === 'true'
}

// 监听深色模式变化
const handleDarkModeChange = () => {
  loadDarkMode()
}

onMounted(() => {
  loadDarkMode()
  // 监听自定义事件（同一页面内的切换）
  window.addEventListener('darkModeChange', handleDarkModeChange)
  // 监听 storage 事件（跨标签页同步）
  window.addEventListener('storage', (e) => {
    if (e.key === 'darkMode') {
      loadDarkMode()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('darkModeChange', handleDarkModeChange)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
