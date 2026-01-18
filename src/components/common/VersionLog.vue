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
          <h4>🚀 重构</h4>
          <ul>
            <li><strong>客户端全面重构</strong> - Vite+Vue3全新的前端技术架构，页面加载速度大幅提升，界面响应更加迅速，整体使用体验更加流畅</li>
            <li><strong>Pinia 状态管理</strong> - 采用新一代状态管理方案，数据流转更清晰，多标签页数据同步更可靠</li>
            <li><strong>Vue Router 路由</strong> - 页面切换更加平滑，支持浏览器前进后退，提供更接近原生应用的体验</li>
            <li><strong>Axios 网络请求</strong> - 统一的接口请求管理，自动处理错误和超时，网络交互更加稳定</li>
          </ul>
          
          <h4>✨ 新增</h4>
          <ul>
            <li><strong>亲密度系统</strong> - 私密房间专属功能，记录互动经验、等级成长、实时计时</li>
            <li><strong>羁绊连接提醒</strong> - 对方上线时触发浪漫通知，爱心点亮动画</li>
            <li><strong>消息编辑功能</strong> - 支持编辑已发送的文本消息，显示编辑标记</li>
            <li><strong>消息焚毁功能</strong> - 支持永久删除消息，所有人不可见</li>
            <li><strong>房间管理功能</strong> - 管理员可锁定房间、清理消息、恢复消息</li>
            <li><strong>私密房间密码</strong> - 创建房间时可设置密码，保护隐私</li>
            <li><strong>版本日志</strong> - 在用户卡片下方查看完整的更新历史</li>
            <li><strong>深色模式</strong> - 完整的深色主题支持，自动适配系统设置</li>
          </ul>
          
          <h4>🎨 优化</h4>
          <ul>
            <li><strong>界面设计</strong> - 采用 Swiss Modernism 2.0 设计语言，追求极致简洁</li>
            <li><strong>私密房间装饰</strong> - 标题添加镜面扫光和皇冠装饰，爱心标签动态点亮</li>
            <li><strong>消息引用</strong> - 采用玻璃拟态设计，支持点击跳转并高亮原消息</li>
            <li><strong>历史消息浏览</strong> - 查看历史时发送消息不再强制滚动，尊重浏览状态</li>
            <li><strong>上传体验</strong> - 图片/视频上传显示实时进度，支持预览</li>
            <li><strong>性能提升</strong> - 消息列表虚拟滚动，支持数万条消息流畅渲染</li>
            <li><strong>连接稳定性</strong> - WebSocket 自动重连，网络波动不掉线</li>
          </ul>
          
          <h4>🐛 修复</h4>
          <ul>
            <li>修复刷新页面后在线人数显示为 0 的问题</li>
            <li>修复图片点击和链接点击的事件冒泡问题</li>
            <li>修复亲密度互动计时器的启动和重置逻辑</li>
            <li>修复羁绊通知的显示时机和记录清理</li>
            <li>修复消息已读状态的实时更新</li>
            <li>修复切换房间时状态未正确重置的问题</li>
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
            <li><strong>WebSocket 实时通信</strong> - 基于 WebSocket 协议的实时聊天系统，消息即时送达</li>
            <li><strong>多媒体消息</strong> - 支持文本、图片、视频、文件等多种消息类型</li>
            <li><strong>房间系统</strong> - 创建和加入聊天房间，支持多人在线</li>
            <li><strong>消息引用</strong> - 引用回复功能，保持对话上下文</li>
            <li><strong>已读状态</strong> - 实时显示消息已读人数和状态</li>
            <li><strong>输入提示</strong> - 显示正在输入的用户，增强互动感</li>
            <li><strong>用户系统</strong> - 完整的注册、登录、个人资料管理</li>
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
