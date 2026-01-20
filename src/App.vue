<template>
  <a-config-provider :theme="themeConfig">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { theme } from 'ant-design-vue'
import { useDarkMode } from '@/composables/useDarkMode'

// 使用深色模式 composable
const { isDarkMode, init, handleStorageChange } = useDarkMode()

// 主题配置
const themeConfig = computed(() => ({
  algorithm: isDarkMode.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
}))

onMounted(() => {
  // 初始化深色模式（会自动挂载到 html 元素）
  init()
  // 监听 storage 事件（跨标签页同步）
  window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
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
