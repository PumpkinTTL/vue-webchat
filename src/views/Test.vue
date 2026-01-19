<template>
  <div class="test-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="test-header">
      <h1>版本日志组件测试</h1>
      <button @click="toggleDarkMode" class="toggle-btn">
        切换深色模式 (当前: {{ isDarkMode ? '深色' : '浅色' }})
      </button>
    </div>
    
    <div class="test-content">
      <h2>直接渲染（不在Modal中）</h2>
      <div class="version-log-wrapper">
        <div class="version-log-content">
          <div
            v-for="version in versionLogs"
            :key="version.version"
            class="version-block"
          >
            <!-- 版本头 -->
            <div class="version-header">
              <span class="version-number">v{{ version.version }}</span>
              <span class="version-date">{{ version.date }}</span>
              <span v-if="version.isCurrent" class="current-badge">
                <font-awesome-icon :icon="['fas', 'check-circle']" />
                当前版本
              </span>
            </div>

            <!-- 更新列表 -->
            <div class="changes-list">
              <div
                v-for="(items, category) in version.features"
                :key="category"
                class="change-group"
              >
                <div class="group-title">
                  <font-awesome-icon :icon="['fas', getCategoryIcon(category)]" class="icon" />
                  <span>{{ category }}</span>
                </div>
                <ul class="items">
                  <li v-for="(item, idx) in items" :key="idx">
                    <span v-html="item"></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <h2 style="margin-top: 40px;">在Modal中渲染</h2>
      <button @click="showModal = true" class="open-modal-btn">打开Modal</button>
      
      <VersionLog v-model:open="showModal" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VersionLog from '@/components/common/VersionLog.vue'
import versionLogsData from '@/data/version-logs.json'

const isDarkMode = ref(false)
const showModal = ref(false)
const versionLogs = ref(versionLogsData.versions)

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
}

const getCategoryIcon = (category: string): string => {
  if (category.includes('重构')) return 'sync-alt'
  if (category.includes('新增')) return 'plus-circle'
  if (category.includes('优化')) return 'magic'
  if (category.includes('修复')) return 'wrench'
  if (category.includes('发布')) return 'rocket'
  return 'star'
}
</script>

<style lang="scss" scoped>
.test-page {
  min-height: 100vh;
  background: #27d01e;
  padding: 40px;
  transition: background 0.3s;
  
  &.dark-mode {
    background: #ebb111;
  }
}

.test-header {
  max-width: 800px;
  margin: 0 auto 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h1 {
    font-size: 28px;
    font-weight: 600;
    color: #0F172A;
  }
}

.dark-mode .test-header h1 {
  color: #F8FAFC;
}

.toggle-btn {
  padding: 10px 20px;
  background: #25eb43;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background: #1E40AF;
  }
}

.test-content {
  max-width: 800px;
  margin: 0 auto;
  
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #0F172A;
    margin-bottom: 20px;
  }
}

.dark-mode .test-content h2 {
  color: #F8FAFC;
}

.version-log-wrapper {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dark-mode .version-log-wrapper {
  background: #1E293B;
}

.open-modal-btn {
  padding: 12px 24px;
  background: #2563EB;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  
  &:hover {
    background: #1E40AF;
  }
}

// 复制版本日志组件的样式
.version-log-content {
  max-height: 600px;
  overflow-y: auto;
  padding: 4px;
}

.version-block {
  padding: $spacing-lg 0;
  border-bottom: 1px solid $border-base;
  
  &:first-child {
    padding-top: 0;
  }
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.test-page.dark-mode .version-block {
  border-bottom-color: #475569;
}

.version-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.version-number {
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.test-page.dark-mode .version-number {
  color: #FFFFFF;
}

.version-date {
  font-size: $font-size-sm;
  color: $text-tertiary;
}

.test-page.dark-mode .version-date {
  color: #CBD5E1;
}

.current-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 4px 10px;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  color: $primary-color;
  background: rgba($primary-color, 0.1);
  border-radius: $border-radius-sm;
  
  svg {
    font-size: 11px;
  }
}

.test-page.dark-mode .current-badge {
  color: #93C5FD;
  background: rgba(147, 197, 253, 0.2);
}

.changes-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.group-title {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  
  .icon {
    font-size: 14px;
    color: $primary-color;
  }
}

.test-page.dark-mode .group-title {
  color: #FFFFFF;
  
  .icon {
    color: #93C5FD;
  }
}

.items {
  margin: 0;
  padding: 0;
  list-style: none;
  
  li {
    position: relative;
    padding-left: 16px;
    margin-bottom: 6px;
    font-size: $font-size-sm;
    line-height: 1.6;
    color: $text-secondary;
    
    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: $text-tertiary;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  :deep(strong) {
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }
}

.test-page.datems {
  li {
    color: #F1F5F9;
    
    &::before {
      color: #94A3B8;
    }
  }
  
  :deep(strong) {
    color: #FFFFFF;
  }
}
</style>
