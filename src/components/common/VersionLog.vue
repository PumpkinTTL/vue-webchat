<template>
  <a-modal
    v-model:open="visible"
    title="版本日志"
    :footer="null"
    :width="720"
    class="version-log-modal"
    @cancel="handleClose"
  >
    <div class="version-log-content">
      <div
        v-for="(version, index) in versionLogs"
        :key="version.version"
        :class="['version-section', { 'current-version': version.isCurrent }]"
      >
        <div class="version-header">
          <span class="version-tag">v{{ version.version }}</span>
          <span class="version-date">{{ version.date }}</span>
          <span v-if="version.isCurrent" class="current-badge">当前版本</span>
        </div>
        <div class="version-features">
          <div v-for="(items, type) in version.features" :key="type">
            <h4>{{ type }}</h4>
            <ul>
              <li v-for="(item, idx) in items" :key="idx" v-html="item"></li>
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
</script>

<style lang="scss" scoped>
// 变量已通过 vite.config.ts 全局导入

.version-log-content {
  max-height: 600px;
  overflow-y: auto;
  padding: 4px;
}

.version-section {
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 2px solid $border-base;
  transition: border-color $transition-base;
  
  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  
  &.current-version {
    .version-tag {
      background: $primary-color;
      color: white;
      font-weight: $font-weight-semibold;
    }
  }
}

:global(.dark-mode) .version-section {
  border-color: $border-base-dark;
}

.version-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

:global(.dark-mode) .version-header {
  /* 移除了border-color，因为border已经移到version-section */
}

.version-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: $bg-color;
  color: $text-secondary;
  border-radius: $border-radius-base;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  font-family: 'Consolas', 'Monaco', monospace;
  transition: all $transition-base;
}

:global(.dark-mode) .version-tag {
  background: $bg-color-dark;
  color: $text-secondary-dark;
}

.version-date {
  color: $text-tertiary;
  font-size: $font-size-sm;
  transition: color $transition-base;
}

:global(.dark-mode) .version-date {
  color: $text-tertiary-dark;
}

.current-badge {
  padding: 3px 10px;
  background: rgba($primary-color, 0.1);
  color: $primary-color;
  border: 1px solid rgba($primary-color, 0.2);
  border-radius: $border-radius-base;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  transition: all $transition-base;
}

:global(.dark-mode) .current-badge {
  background: rgba($primary-color, 0.15);
  border-color: rgba($primary-color, 0.3);
}

.version-features {
  h4 {
    font-family: $font-family-heading;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 20px 0 10px 0;
    transition: color $transition-base;
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      color: $text-secondary;
      font-size: $font-size-sm;
      line-height: 1.8;
      margin-bottom: 8px;
      transition: color $transition-base;
      
      strong {
        color: $text-primary;
        font-weight: $font-weight-semibold;
        transition: color $transition-base;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

:global(.dark-mode) .version-features {
  h4 {
    color: $text-primary-dark;
  }
  
  ul li {
    color: $text-secondary-dark;
    
    strong {
      color: $text-primary-dark;
    }
  }
}

// 滚动条样式
.version-log-content {
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: $bg-color;
    border-radius: 3px;
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

:global(.dark-mode) .version-log-content {
  &::-webkit-scrollbar-track {
    background: $bg-color-dark;
  }
  
  &::-webkit-scrollbar-thumb {
    background: $border-base-dark;
    
    &:hover {
      background: $text-tertiary-dark;
    }
  }
}
</style>
