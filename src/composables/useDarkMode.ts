import { ref, watch } from 'vue'

const isDarkMode = ref(false)

/**
 * 深色模式管理 Composable
 * 统一管理深色模式状态，挂载到 html 元素
 */
export function useDarkMode() {
  // 初始化：从 localStorage 读取
  const init = () => {
    const saved = localStorage.getItem('darkMode')
    isDarkMode.value = saved === 'true'
    updateHtmlClass()
  }

  // 更新 html 元素的 class
  const updateHtmlClass = () => {
    const html = document.documentElement
    if (isDarkMode.value) {
      html.classList.add('dark-mode')
    } else {
      html.classList.remove('dark-mode')
    }
  }

  // 切换深色模式
  const toggle = () => {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('darkMode', String(isDarkMode.value))
    updateHtmlClass()
  }

  // 设置深色模式
  const setDarkMode = (value: boolean) => {
    isDarkMode.value = value
    localStorage.setItem('darkMode', String(value))
    updateHtmlClass()
  }

  // 监听 storage 事件（跨标签页同步）
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'darkMode') {
      isDarkMode.value = e.newValue === 'true'
      updateHtmlClass()
    }
  }

  return {
    isDarkMode,
    init,
    toggle,
    setDarkMode,
    handleStorageChange
  }
}
