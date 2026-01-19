<template>
  <a-modal
    v-model:open="visible"
    title="版本日志"
    :footer="null"
    :width="720"
    @cancel="handleClose"
  >
    <div class="version-log-content">
      <div
        v-for="version in versionLogs"
        :key="version.version"
        class="version-block"
      >
        <div class="version-header">
          <span class="version-number">v{{ version.version }}</span>
          <span class="version-date">{{ version.date }}</span>
          <span v-if="version.isCurrent" class="current-badge">
            <font-awesome-icon :icon="['fas', 'check-circle']" />
            当前版本
          </span>
        </div>

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
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import versionLogsData from '@/data/version-logs.json'

interface Props {
  open?: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  open: false
})

const emit = defineEmits<Emits>()

const visible = ref(props.open)
const versionLogs = ref(versionLogsData.versions)

watch(() => props.open, (newVal) => {
  visible.value = newVal
})

watch(visible, (newVal) => {
  emit('update:open', newVal)
})

const handleClose = () => {
  visible.value = false
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
.version-log-content {
  max-height: 600px;
  overflow-y: auto;
  padding: 4px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: $border-base;
    border-radius: 3px;
    transition: background $transition-base;
    
    &:hover {
      background: $text-tertiary;
    }
  }
}

.version-block {
  padding: $spacing-lg 0;
  border-bottom: 1px solid $border-base;
  transition: border-color $transition-base;
  
  &:first-child {
    padding-top: 0;
  }
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
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
  transition: color $transition-base;
}

.version-date {
  font-size: $font-size-sm;
  color: $text-tertiary;
  transition: color $transition-base;
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
  transition: all $transition-base;
  
  svg {
    font-size: 11px;
  }
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
  transition: color $transition-base;
  
  .icon {
    font-size: 14px;
    color: $primary-color;
    transition: color $transition-base;
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
    transition: color $transition-base;
    
    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: $text-tertiary;
      transition: color $transition-base;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  :deep(strong) {
    font-weight: $font-weight-semibold;
    color: $text-primary;
    transition: color $transition-base;
  }
}

// 深色模式 - 参考MessageItem的写法
:global(.dark-mode) {
  .version-log-content::-webkit-scrollbar-thumb {
    background: $border-base-dark;
    
    &:hover {
      background: $text-tertiary-dark;
    }
  }
  
  .version-block {
    border-color: $border-base-dark;
  }
  
  .version-number {
    color: $text-primary-dark;
  }
  
  .version-date {
    color: $text-tertiary-dark;
  }
  
  .current-badge {
    color: $primary-lighter;
    background: rgba($primary-color, 0.15);
  }
  
  .group-title {
    color: $text-primary-dark;
    
    .icon {
      color: $primary-lighter;
    }
  }
  
  .items li {
    color: $text-regular-dark;
    
    &::before {
      color: $text-tertiary-dark;
    }
  }
  
  .items :deep(strong) {
    color: $text-primary-dark;
  }
}
</style>

<style lang="scss">
// Ant Design Modal 深色模式适配
:global(.dark-mode) {
  .ant-modal-wrap {
    .ant-modal-content {
      background: $bg-color-elevated-dark;
    }
    
    .ant-modal-header {
      background: $bg-color-elevated-dark;
      border-bottom-color: $border-base-dark;
      
      .ant-modal-title {
        color: $text-primary-dark;
      }
    }
    
    .ant-modal-body {
      background: $bg-color-elevated-dark;
    }
    
    .ant-modal-close {
      color: $text-tertiary-dark;
      
      &:hover {
        color: $text-primary-dark;
      }
    }
  }
}
</style>
