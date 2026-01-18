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
          <h4>🚀 架构升级</h4>
          <ul>
            <li><strong>全栈重构</strong> - 采用 Vite + Vue 3 + TypeScript 技术栈，构建速度提升 10 倍</li>
            <li><strong>组合式 API</strong> - 使用 Composition API 重写所有组件，代码更优雅、逻辑更清晰</li>
            <li><strong>设计系统</strong> - 引入 Swiss Modernism 2.0 设计语言，追求极致的简洁与优雅</li>
            <li><strong>类型安全</strong> - 完整的 TypeScript 类型定义，编译时发现问题而非运行时</li>
          </ul>
          
          <h4>✨ 核心功能</h4>
          <ul>
            <li><strong>亲密度系统</strong> - 为私密房间量身打造，记录每一次互动，见证关系的成长</li>
            <li><strong>羁绊连接</strong> - 当 TA 上线时，爱心会为你点亮，这是属于你们的专属仪式</li>
            <li><strong>消息编辑</strong> - 发错了？没关系，支持编辑已发送的消息</li>
            <li><strong>智能引用</strong> - 点击引用消息可跳转到原文，再也不会找不到上下文</li>
            <li><strong>房间管理</strong> - 管理员拥有完整的房间控制权，包括锁定、清理和恢复</li>
          </ul>
          
          <h4>🎨 视觉体验</h4>
          <ul>
            <li><strong>深色模式</strong> - 基于 Ant Design 主题系统，完美适配深色环境</li>
            <li><strong>动效设计</strong> - 私密房间标题的镜面扫光、爱心的点亮与爆发，每个细节都值得品味</li>
            <li><strong>玻璃拟态</strong> - 引用消息采用 Glassmorphism 设计，现代而不失温度</li>
            <li><strong>微交互</strong> - 从按钮悬停到消息滚动，300+ 处精心打磨的交互细节</li>
          </ul>
          
          <h4>⚡ 性能优化</h4>
          <ul>
            <li><strong>虚拟滚动</strong> - 支持渲染数万条消息而不卡顿，告别性能焦虑</li>
            <li><strong>智能加载</strong> - 图片懒加载、消息分页加载，流量和性能双重优化</li>
            <li><strong>断线重连</strong> - WebSocket 自动重连机制，网络波动也能保持连接</li>
            <li><strong>体验优先</strong> - 查看历史消息时发送新消息不会打断你，尊重每一次操作</li>
          </ul>
          
          <h4>🔧 技术细节</h4>
          <ul>
            <li>使用 Pinia 进行状态管理，告别 Vuex 的繁琐</li>
            <li>采用 SCSS 模块化样式，变量统一管理</li>
            <li>集成 Animate.css，让每个元素都有生命力</li>
            <li>Font Awesome 图标库，1000+ 图标随心使用</li>
            <li>响应式设计，完美适配桌面端和移动端</li>
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
