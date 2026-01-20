<template>
  <a-modal
    v-model:open="visible"
    :footer="null"
    :width="800"
    :centered="true"
    @cancel="handleClose"
    class="version-log-modal"
  >
    <template #title>
      <div class="modal-header">
        <div class="header-icon">
          <font-awesome-icon :icon="['fas', 'rocket']" />
        </div>
        <div class="header-content">
          <h2 class="header-title">版本日志</h2>
          <p class="header-subtitle">产品更新历史</p>
        </div>
      </div>
    </template>

    <div class="version-timeline">
      <div
        v-for="(version, index) in versionLogs"
        :key="version.version"
        class="timeline-item"
        :class="{ 'is-current': version.isCurrent }"
      >
        <!-- 时间线节点 -->
        <div class="timeline-node">
          <div class="node-dot" :class="{ 'is-current': version.isCurrent }">
            <font-awesome-icon 
              :icon="['fas', version.isCurrent ? 'star' : 'circle']" 
              class="node-icon"
            />
          </div>
          <div v-if="index < versionLogs.length - 1" class="node-line"></div>
        </div>

        <!-- 版本内容卡片 -->
        <div class="timeline-content">
          <div class="version-card">
            <!-- 版本头部 -->
            <div class="card-header">
              <div class="version-info">
                <span class="version-tag">v{{ version.version }}</span>
                <span class="version-date">
                  <font-awesome-icon :icon="['fas', 'calendar-alt']" />
                  {{ version.date }}
                </span>
              </div>
              <span v-if="version.isCurrent" class="current-badge">
                <font-awesome-icon :icon="['fas', 'check-circle']" />
                当前版本
              </span>
            </div>

            <!-- 更新内容 -->
            <div class="card-body">
              <div
                v-for="(items, category) in version.features"
                :key="category"
                class="feature-group"
              >
                <div class="feature-header">
                  <div class="feature-icon" :class="`icon-${getCategoryType(category)}`">
                    <font-awesome-icon :icon="['fas', getCategoryIcon(category)]" />
                  </div>
                  <h3 class="feature-title">{{ category }}</h3>
                </div>
                <ul class="feature-list">
                  <li v-for="(item, idx) in items" :key="idx" class="feature-item">
                    <span class="item-bullet"></span>
                    <span class="item-text" v-html="item"></span>
                  </li>
                </ul>
              </div>
            </div>
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

const getCategoryType = (category: string): string => {
  if (category.includes('重构')) return 'refactor'
  if (category.includes('新增')) return 'feature'
  if (category.includes('优化')) return 'improve'
  if (category.includes('修复')) return 'fix'
  if (category.includes('发布')) return 'release'
  return 'default'
}
</script>

<style lang="scss" scoped>
// ==================== Modal Header ====================
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
  border-radius: 10px;
  color: white;
  font-size: 16px;
  flex-shrink: 0;
}

.header-content {
  flex: 1;
  min-width: 0;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: $font-weight-bold;
  color: $text-primary;
  line-height: 1.3;
  transition: color 0.2s ease;
}

.header-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: $text-tertiary;
  transition: color 0.2s ease;
}

// ==================== Timeline ====================
.version-timeline {
  padding: 16px 0 20px 0; // 移除左侧内边距，顶部减小到16px
  max-height: 600px;
  overflow-y: auto;
  margin-right: 8px; // 右侧留出滚动条空间
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: $border-base;
    border-radius: 2px;
    transition: background 0.2s ease;
    
    &:hover {
      background: $text-tertiary;
    }
  }
}

.timeline-item {
  display: flex;
  gap: 14px;
  position: relative;
  
  &:not(:last-child) {
    margin-bottom: 20px;
  }
}

// ==================== Timeline Node ====================
.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 24px;
  margin-left: 6px; // 向右移动6px，与header图标左边缘对齐（36px图标 + 12px gap - 24px节点 - 18px差值 = 6px）
}

.node-dot {
  position: relative;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
  transition: all 0.2s ease;
  
  .node-icon {
    color: white;
    font-size: 11px;
  }
  
  // 当前版本样式
  &.is-current {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    box-shadow: 0 0 0 3px rgba(#FFD700, 0.2), 0 2px 8px rgba(#FFD700, 0.3);
    
    .node-icon {
      animation: starPulse 2s ease-in-out infinite;
    }
  }
  
  // 非当前版本样式 - 更小的圆点
  &:not(.is-current) {
    background: linear-gradient(135deg, 
      rgba($primary-color, 0.8) 0%, 
      rgba($primary-light, 0.7) 100%
    );
    box-shadow: 0 0 0 2px rgba($primary-color, 0.15);
    
    .node-icon {
      font-size: 6px; // 更小的圆点
      opacity: 0.9;
    }
  }
}

@keyframes starPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.node-line {
  flex: 1;
  width: 2px;
  background: linear-gradient(180deg, 
    rgba($primary-color, 0.25) 0%, 
    rgba($primary-color, 0.12) 50%,
    rgba($border-light, 0.8) 100%
  );
  margin-top: 6px;
  min-height: 30px;
  transition: background 0.2s ease;
  border-radius: 1px;
  position: relative;
  
  // 添加微妙的光晕效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 20%;
    background: linear-gradient(180deg, 
      rgba($primary-color, 0.15) 0%, 
      transparent 100%
    );
    border-radius: 2px;
  }
}

// ==================== Version Card ====================
.timeline-content {
  flex: 1;
  min-width: 0;
}

.version-card {
  background: $bg-color-elevated;
  border: 1px solid $border-light;
  border-radius: 10px; // 稍微减小圆角
  overflow: hidden;
  transition: border-color 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); // 添加微妙阴影
  
  &:hover {
    border-color: rgba($primary-color, 0.25);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); // 悬停时阴影加深
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px; // 稍微减小内边距
  background: linear-gradient(135deg, 
    rgba($primary-color, 0.02) 0%, 
    rgba($primary-light, 0.01) 100%
  ); // 更淡的渐变
  border-bottom: 1px solid $border-light;
  transition: all 0.2s ease;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.version-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px; // 更紧凑
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 12px;
  font-weight: $font-weight-bold;
  color: white;
  background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
  border-radius: 5px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba($primary-color, 0.25); // 添加阴影
}

.version-date {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: $text-secondary;
  transition: color 0.2s ease;
  white-space: nowrap;
  
  svg {
    font-size: 10px;
    color: $text-tertiary;
    flex-shrink: 0;
  }
}

.current-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 7px;
  font-size: 10px;
  font-weight: $font-weight-semibold;
  color: $primary-color;
  background: rgba($primary-color, 0.08);
  border: 1px solid rgba($primary-color, 0.15);
  border-radius: 4px;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  
  svg {
    font-size: 9px;
  }
}

// ==================== Card Body ====================
.card-body {
  padding: 14px; // 稍微减小内边距
}

.feature-group {
  &:not(:last-child) {
    margin-bottom: 14px;
    padding-bottom: 14px;
    border-bottom: 1px solid rgba($border-light, 0.6); // 更淡的分隔线
  }
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 9px;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 5px;
  font-size: 11px;
  flex-shrink: 0;
  
  // 不同类型的图标颜色
  &.icon-feature {
    background: linear-gradient(135deg, rgba(#10B981, 0.12) 0%, rgba(#10B981, 0.08) 100%);
    color: #10B981;
  }
  
  &.icon-fix {
    background: linear-gradient(135deg, rgba(#F59E0B, 0.12) 0%, rgba(#F59E0B, 0.08) 100%);
    color: #F59E0B;
  }
  
  &.icon-improve {
    background: linear-gradient(135deg, rgba(#8B5CF6, 0.12) 0%, rgba(#8B5CF6, 0.08) 100%);
    color: #8B5CF6;
  }
  
  &.icon-refactor {
    background: linear-gradient(135deg, rgba(#3B82F6, 0.12) 0%, rgba(#3B82F6, 0.08) 100%);
    color: #3B82F6;
  }
  
  &.icon-release {
    background: linear-gradient(135deg, rgba($primary-color, 0.12) 0%, rgba($primary-color, 0.08) 100%);
    color: $primary-color;
  }
  
  &.icon-default {
    background: linear-gradient(135deg, rgba($text-tertiary, 0.12) 0%, rgba($text-tertiary, 0.08) 100%);
    color: $text-tertiary;
  }
}

.feature-title {
  margin: 0;
  font-size: 13px;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  transition: color 0.2s ease;
  letter-spacing: 0.2px; // 增加字间距
}

.feature-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 3px 0;
}

.item-bullet {
  flex-shrink: 0;
  width: 4px;
  height: 4px;
  margin-top: 7px;
  background: $text-tertiary;
  border-radius: 50%;
  transition: background 0.2s ease;
  opacity: 0.6; // 降低透明度
}

.item-text {
  flex: 1;
  font-size: 12px;
  line-height: 1.65; // 增加行高
  color: $text-secondary;
  transition: color 0.2s ease;
  word-break: break-word;
  
  :deep(strong) {
    font-weight: $font-weight-semibold;
    color: $text-primary;
    transition: color 0.2s ease;
  }
  
  :deep(code) {
    padding: 1px 4px;
    font-family: 'SF Mono', 'Consolas', monospace;
    font-size: 0.92em;
    background: rgba($primary-color, 0.06);
    color: $primary-color;
    border-radius: 2px;
    border: 1px solid rgba($primary-color, 0.1); // 添加边框
  }
}

// ==================== 移动端适配 ====================
@media (max-width: 768px) {
  .modal-header {
    gap: 10px;
  }
  
  .header-icon {
    width: 32px;
    height: 32px;
    font-size: 14px;
    border-radius: 8px;
  }
  
  .header-title {
    font-size: 16px;
  }
  
  .header-subtitle {
    font-size: 11px;
  }
  
  .version-timeline {
    padding: 12px 0 16px 0;
    max-height: 500px;
    margin-right: 4px;
  }
  
  .timeline-item {
    gap: 12px;
    
    &:not(:last-child) {
      margin-bottom: 20px;
    }
  }
  
  .timeline-node {
    width: 20px;
    margin-left: 6px; // 移动端也保持对齐
  }
  
  .node-dot {
    width: 20px;
    height: 20px;
    box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
    
    .node-icon {
      font-size: 10px;
    }
  }
  
  .node-line {
    width: 2px;
    margin-top: 4px;
    min-height: 24px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 12px;
    gap: 8px;
  }
  
  .version-info {
    width: 100%;
    gap: 8px;
  }
  
  .version-tag {
    padding: 3px 8px;
    font-size: 12px;
  }
  
  .version-date {
    font-size: 11px;
    
    svg {
      font-size: 10px;
    }
  }
  
  .current-badge {
    padding: 3px 6px;
    font-size: 10px;
    
    svg {
      font-size: 9px;
    }
  }
  
  .card-body {
    padding: 12px;
  }
  
  .feature-group {
    &:not(:last-child) {
      margin-bottom: 12px;
      padding-bottom: 12px;
    }
  }
  
  .feature-header {
    gap: 6px;
    margin-bottom: 8px;
  }
  
  .feature-icon {
    width: 20px;
    height: 20px;
    font-size: 11px;
    border-radius: 5px;
  }
  
  .feature-title {
    font-size: 13px;
  }
  
  .feature-item {
    gap: 6px;
    padding: 3px 0;
  }
  
  .item-bullet {
    width: 3px;
    height: 3px;
    margin-top: 6px;
  }
  
  .item-text {
    font-size: 12px;
    line-height: 1.5;
  }
}

// ==================== 深色模式适配 ====================
.dark-mode {
  .header-title {
    color: $text-primary-dark;
  }
  
  .header-subtitle {
    color: $text-tertiary-dark;
  }
  
  .version-timeline::-webkit-scrollbar-thumb {
    background: $border-base-dark;
    
    &:hover {
      background: $text-tertiary-dark;
    }
  }
  
  .node-dot {
    box-shadow: 0 0 0 3px rgba($primary-lighter, 0.15);
    
    &.is-current {
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      box-shadow: 0 0 0 3px rgba(#FFD700, 0.25), 0 2px 8px rgba(#FFD700, 0.4);
    }
    
    &:not(.is-current) {
      background: linear-gradient(135deg, 
        rgba($primary-lighter, 0.7) 0%, 
        rgba($primary-lighter, 0.6) 100%
      );
      box-shadow: 0 0 0 2px rgba($primary-lighter, 0.2);
    }
  }
  
  .node-line {
    background: linear-gradient(180deg, 
      rgba($primary-lighter, 0.2) 0%, 
      rgba($primary-lighter, 0.1) 50%,
      rgba($border-base-dark, 0.8) 100%
    );
    
    &::before {
      background: linear-gradient(180deg, 
        rgba($primary-lighter, 0.12) 0%, 
        transparent 100%
      );
    }
  }
  
  .version-card {
    background: $bg-color-elevated-dark;
    border-color: $border-base-dark;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    
    &:hover {
      border-color: rgba($primary-lighter, 0.25);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
  }
  
  .card-header {
    background: linear-gradient(135deg, 
      rgba($primary-lighter, 0.04) 0%, 
      rgba($primary-lighter, 0.02) 100%
    );
    border-bottom-color: $border-base-dark;
  }
  
  .version-tag {
    box-shadow: 0 1px 3px rgba($primary-lighter, 0.3);
  }
  
  .version-date {
    color: $text-regular-dark;
    
    svg {
      color: $text-tertiary-dark;
    }
  }
  
  .current-badge {
    color: $primary-lighter;
    background: rgba($primary-lighter, 0.12);
    border-color: rgba($primary-lighter, 0.2);
  }
  
  .feature-group {
    border-bottom-color: rgba($border-base-dark, 0.6);
  }
  
  .feature-title {
    color: $text-primary-dark;
  }
  
  .item-text {
    color: $text-regular-dark;
    
    :deep(strong) {
      color: $text-primary-dark;
    }
    
    :deep(code) {
      background: rgba($primary-lighter, 0.1);
      color: $primary-lighter;
      border-color: rgba($primary-lighter, 0.15);
    }
  }
  
  .item-bullet {
    background: $text-tertiary-dark;
    opacity: 0.5;
  }
}
</style>

<style lang="scss">
// Ant Design Modal 深色模式适配（全局样式）
.dark-mode {
  .version-log-modal {
    .ant-modal-content {
      background: $bg-color-elevated-dark;
    }
    
    .ant-modal-header {
      background: $bg-color-elevated-dark;
      border-bottom-color: $border-base-dark;
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

// Modal body padding 调整，让时间线与 header 对齐
.version-log-modal {
  .ant-modal-body {
    padding: 0 24px 24px 24px; // 顶部 padding 为 0，让时间线从顶部开始
  }
  
  .ant-modal-header {
    padding: 16px 24px; // 确保 header 的 padding 一致
  }
}

// 移动端 Modal 适配
@media (max-width: 768px) {
  .version-log-modal {
    .ant-modal {
      max-width: calc(100vw - 32px) !important;
      margin: 16px auto;
    }
    
    .ant-modal-body {
      padding: 0 16px 16px 16px;
    }
    
    .ant-modal-header {
      padding: 12px 16px;
    }
  }
}
</style>

