<template>
  <a-modal
    v-model:open="visible"
    title="更新日志"
    :footer="null"
    :width="680"
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
          <h4>🎉 重大更新</h4>
          <ul>
            <li><strong>亲密度系统</strong> - 私密房间专属互动功能，记录你们的点点滴滴</li>
            <li><strong>羁绊连接</strong> - 对方上线时的浪漫提醒，爱心点亮动画</li>
            <li><strong>消息编辑</strong> - 支持编辑已发送的文本消息</li>
            <li><strong>房间管理</strong> - 管理员可锁定/清理/恢复房间消息</li>
          </ul>
          
          <h4>✨ 体验优化</h4>
          <ul>
            <li>优化查看历史消息时的发送体验，不再强制滚动</li>
            <li>私密房间标题添加镜面扫光和皇冠装饰</li>
            <li>爱心标签根据在线人数动态点亮，发送消息时爆发特效</li>
            <li>引用消息采用玻璃拟态设计，支持跳转和高亮</li>
            <li>链接消息美化，支持复制链接</li>
          </ul>
          
          <h4>🎨 界面改进</h4>
          <ul>
            <li>深色模式全面适配，使用 Ant Design 主题系统</li>
            <li>经验提示组件重新设计，更加简洁美观</li>
            <li>亲密度面板采用 ThinkPHP 原版设计风格</li>
            <li>回到底部/历史位置按钮优化</li>
          </ul>
          
          <h4>🐛 问题修复</h4>
          <ul>
            <li>修复刷新页面后在线人数显示为0的问题</li>
            <li>修复图片点击和链接点击的事件冒泡问题</li>
            <li>修复亲密度互动计时器的启动和重置逻辑</li>
            <li>修复羁绊通知的显示时机和记录清理</li>
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
          <h4>🚀 首次发布</h4>
          <ul>
            <li>实时聊天功能（WebSocket）</li>
            <li>支持文本、图片、视频、文件消息</li>
            <li>房间创建和加入</li>
            <li>消息引用和焚毁</li>
            <li>已读状态显示</li>
            <li>正在输入提示</li>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
    }
  }
}

.version-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

:global(.dark-mode) .version-header {
  border-color: #303030;
}

.version-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #f5f5f5;
  color: #666;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Consolas', 'Monaco', monospace;
}

:global(.dark-mode) .version-tag {
  background: #2a2a2a;
  color: #aaa;
}

.version-date {
  color: #999;
  font-size: 13px;
}

.current-badge {
  padding: 2px 8px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.version-features {
  h4 {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin: 16px 0 8px 0;
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      color: #666;
      font-size: 14px;
      line-height: 1.8;
      margin-bottom: 6px;
      
      strong {
        color: #333;
        font-weight: 600;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

:global(.dark-mode) .version-features {
  h4 {
    color: #e0e0e0;
  }
  
  ul li {
    color: #aaa;
    
    strong {
      color: #e0e0e0;
    }
  }
}

// 滚动条样式
.version-log-content {
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d0d0d0;
    border-radius: 3px;
    
    &:hover {
      background: #b0b0b0;
    }
  }
}

:global(.dark-mode) .version-log-content {
  &::-webkit-scrollbar-track {
    background: #2a2a2a;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #4a4a4a;
    
    &:hover {
      background: #5a5a5a;
    }
  }
}
</style>
