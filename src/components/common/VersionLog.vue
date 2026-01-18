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
      <!-- 当前版本 -->
      <div class="version-section current-version">
        <div class="version-header">
          <span class="version-tag">v2.0.0</span>
          <span class="version-date">2026-01-19</span>
          <span class="current-badge">当前版本</span>
        </div>
        <div class="version-features">
          <h4>🚀 重大更新</h4>
          <ul>
            <li><strong>基于 Vite + Vue 3 重构客户端</strong> - 全新的技术栈，更快的构建速度和更好的开发体验</li>
            <li><strong>TypeScript 全面支持</strong> - 提供完整的类型定义，提升代码质量和可维护性</li>
            <li><strong>Swiss Modernism 2.0 设计语言</strong> - 采用现代化的设计风格，简洁优雅</li>
          </ul>
          
          <h4>✨ 核心功能</h4>
          <ul>
            <li><strong>亲密度系统</strong> - 私密房间专属功能，支持经验值、等级、互动计时</li>
            <li><strong>羁绊连接提醒</strong> - 对方上线时的浪漫通知，爱心点亮动画效果</li>
            <li><strong>消息编辑</strong> - 支持编辑已发送的文本消息，显示编辑标记</li>
            <li><strong>房间管理</strong> - 管理员可锁定房间、清理消息、恢复消息</li>
            <li><strong>消息引用</strong> - 支持引用回复，点击跳转到原消息并高亮</li>
            <li><strong>消息焚毁</strong> - 支持永久删除消息，所有人不可见</li>
          </ul>
          
          <h4>🎨 界面优化</h4>
          <ul>
            <li>深色模式全面适配，使用 Ant Design 主题系统</li>
            <li>私密房间标题添加镜面扫光和皇冠装饰效果</li>
            <li>爱心标签根据在线人数动态点亮，发送消息时触发爆发特效</li>
            <li>引用消息采用玻璃拟态设计，支持复制链接功能</li>
            <li>经验提示组件重新设计，更加简洁美观</li>
            <li>亲密度面板采用原版设计风格</li>
            <li>优化回到底部/历史位置按钮交互</li>
          </ul>
          
          <h4>⚡ 性能提升</h4>
          <ul>
            <li>WebSocket 连接优化，支持断线重连</li>
            <li>消息列表虚拟滚动，支持大量消息流畅渲染</li>
            <li>图片/视频上传进度显示，优化上传体验</li>
            <li>优化查看历史消息时的发送体验，不强制滚动</li>
          </ul>
          
          <h4>🐛 问题修复</h4>
          <ul>
            <li>修复刷新页面后在线人数显示为0的问题</li>
            <li>修复图片点击和链接点击的事件冒泡问题</li>
            <li>修复亲密度互动计时器的启动和重置逻辑</li>
            <li>修复羁绊通知的显示时机和记录清理</li>
            <li>修复消息已读状态的实时更新</li>
          </ul>
        </div>
      </div>

      <!-- 历史版本 -->
      <div class="version-section">
        <div class="version-header">
          <span class="version-tag">v1.0.0</span>
          <span class="version-date">2025-12-20</span>
        </div>
        <div class="version-features">
          <h4>🎉 首次发布</h4>
          <ul>
            <li>基于 ThinkPHP 6 的实时聊天系统</li>
            <li>支持文本、图片、视频、文件消息</li>
            <li>房间创建、加入和管理功能</li>
            <li>消息引用和已读状态显示</li>
            <li>正在输入提示功能</li>
            <li>WebSocket 实时通信</li>
          </ul>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

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
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &.current-version {
    .version-tag {
      background: $primary-color;
      color: white;
      font-weight: $font-weight-semibold;
    }
  }
}

.version-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid $border-base;
  transition: border-color $transition-base;
}

:global(.dark-mode) .version-header {
  border-color: $border-base-dark;
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
