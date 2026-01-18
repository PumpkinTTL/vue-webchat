<template>
  <div class="emoji-picker" :class="{ 'dark-mode': isDarkMode }" ref="pickerRef">
    <!-- 分类标签栏 -->
    <div class="category-tabs">
      <button
        v-for="category in categories"
        :key="category.id"
        :class="['category-tab', { 'active': activeCategory === category.id }]"
        @click="activeCategory = category.id"
      >
        {{ category.name }}
      </button>
    </div>

    <!-- 表情网格 -->
    <div class="emoji-grid" ref="emojiGridRef">
      <button
        v-for="emoji in currentEmojis"
        :key="emoji"
        class="emoji-item"
        @click="handleSelectEmoji(emoji)"
      >
        {{ emoji }}
      </button>
    </div>

    <!-- 关闭按钮 -->
    <button class="close-btn" @click="$emit('close')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, onUnmounted } from 'vue'
import { EMOJI_CATEGORIES } from '@/utils/emojiData'

const emit = defineEmits<{
  select: [emoji: string]
  close: []
}>()

// 表情面板引用
const pickerRef = ref<HTMLElement>()

// 深色模式状态
const isDarkMode = ref(false)

const loadDarkMode = () => {
  isDarkMode.value = localStorage.getItem('darkMode') === 'true'
}

const handleDarkModeChange = () => {
  loadDarkMode()
}

// 初始化深色模式
loadDarkMode()
window.addEventListener('darkModeChange', handleDarkModeChange)
window.addEventListener('storage', (e) => {
  if (e.key === 'darkMode') {
    loadDarkMode()
  }
})

// 点击外部关闭面板
const handleClickOutside = (event: MouseEvent) => {
  if (!pickerRef.value) return

  const target = event.target as Node
  // 检查点击是否在面板外部
  if (!pickerRef.value.contains(target)) {
    emit('close')
  }
}

onMounted(() => {
  // 监听全局点击事件
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // 移除监听
  window.removeEventListener('darkModeChange', handleDarkModeChange)
  document.removeEventListener('click', handleClickOutside)
})

// 分类数据
const categories = computed(() => EMOJI_CATEGORIES)
const activeCategory = ref(EMOJI_CATEGORIES[0].id)

// 当前分类的表情
const currentEmojis = computed(() => {
  const category = EMOJI_CATEGORIES.find(cat => cat.id === activeCategory.value)
  return category?.emojis || []
})

// 选中表情
const handleSelectEmoji = (emoji: string) => {
  emit('select', emoji)
  // 不自动关闭面板，允许连续选择
}
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.emoji-picker {
  position: relative;
  width: 100%;
  max-height: 320px;
  background: $bg-color-elevated;
  border: 1px solid $border-base;
  border-radius: $border-radius-lg;
  box-shadow: $box-shadow-lg;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.dark-mode {
    background: $bg-color-elevated-dark;
    border-color: $border-base-dark;
    box-shadow: $box-shadow-lg-dark;
  }
}

// ==================== 分类标签栏 ====================
.category-tabs {
  display: flex;
  gap: 4px;
  padding: 12px;
  border-bottom: 1px solid $border-base;
  flex-wrap: wrap; // 自动换行，不出现横向滚动条

  .dark-mode & {
    border-bottom-color: $border-base-dark;
  }
}

.category-tab {
  padding: 8px 16px;
  background: transparent;
  color: $text-secondary;
  border: none;
  border-radius: $border-radius-sm;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  white-space: nowrap;
  cursor: pointer;
  transition: all $transition-base ease;

  &:hover {
    color: $text-primary;
    background: rgba($primary-color, 0.08);
  }

  &.active {
    color: $primary-color;
    background: rgba($primary-color, 0.12);
    font-weight: $font-weight-semibold;
  }

  &:active {
    transform: scale(0.95);
  }
}

.dark-mode .category-tab {
  color: $text-secondary-dark;

  &:hover {
    color: $text-primary-dark;
    background: rgba($primary-color, 0.15);
  }

  &.active {
    color: $primary-color;
    background: rgba($primary-color, 0.2);
  }
}

// ==================== 表情网格 ====================
.emoji-grid {
  flex: 1;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: $border-base transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: $border-base;
    border-radius: 3px;

    &:hover {
      background: $text-tertiary;
    }
  }
}

.dark-mode .emoji-grid {
  scrollbar-color: $border-base-dark transparent;

  &::-webkit-scrollbar-thumb {
    background: $border-base-dark;

    &:hover {
      background: $text-tertiary-dark;
    }
  }
}

.emoji-item {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: $border-radius-sm;
  cursor: pointer;
  transition: all $transition-base ease;

  &:hover {
    background: rgba($primary-color, 0.08);
    border-color: rgba($primary-color, 0.15);
    transform: scale(1.15);
  }

  &:active {
    transform: scale(1.05);
  }
}

.dark-mode .emoji-item {
  &:hover {
    background: rgba($primary-color, 0.15);
    border-color: rgba($primary-color, 0.25);
  }
}

// ==================== 关闭按钮 ====================
.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
  color: $text-tertiary;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all $transition-base ease;
  z-index: 1;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: $text-secondary;
    transform: rotate(90deg);
  }

  &:active {
    transform: rotate(90deg) scale(0.9);
  }
}

.dark-mode .close-btn {
  background: rgba(255, 255, 255, 0.05);
  color: $text-tertiary-dark;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: $text-secondary-dark;
  }
}

// ==================== 移动端适配 ====================
@media (max-width: 768px) {
  .emoji-picker {
    max-height: 280px;
  }

  .category-tabs {
    padding: 10px;
    gap: 4px;
  }

  .category-tab {
    padding: 6px 12px;
    font-size: $font-size-xs;
  }

  .emoji-grid {
    padding: 10px;
    gap: 6px;
    grid-template-columns: repeat(8, 1fr);
  }

  .emoji-item {
    width: 32px;
    height: 32px;
    font-size: 20px;

    &:hover {
      transform: scale(1.1);
    }
  }
}
</style>
