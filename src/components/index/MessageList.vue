<template>
  <div class="message-list" ref="messageContainer">
    <!-- 加载中状态 -->
    <div v-if="loading" class="loading-state animate__animated animate__fadeIn" style="--animate-duration: 0.4s">
      <div class="loading-spinner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
            stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
      <p>加载消息中...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="messages.length === 0" class="empty-state animate__animated animate__fadeIn" style="--animate-duration: 0.5s">
      <div class="empty-icon animate__animated animate__bounceIn" style="--animate-duration: 0.6s; --animate-delay: 0.1s">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </div>
      <p class="empty-text animate__animated animate__fadeInUp" style="--animate-duration: 0.4s; --animate-delay: 0.2s">{{ emptyText }}</p>
      <p class="empty-hint animate__animated animate__fadeInUp" style="--animate-duration: 0.4s; --animate-delay: 0.25s">{{ emptyHint }}</p>
    </div>

    <!-- 消息列表 -->
    <div v-else class="messages">
      <!-- 加载更多按钮 -->
      <div v-if="hasMore" class="load-more">
        <button class="load-more-btn animate__animated animate__fadeIn" style="--animate-duration: 0.3s" :disabled="loadingMore" @click="handleLoadMore">
          <svg v-if="loadingMore" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
              stroke-width="2" stroke-linecap="round" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M1 4v6h6M23 20v-6h-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>{{ loadingMore ? '加载中...' : '加载更多历史消息' }}</span>
        </button>
      </div>

      <!-- 消息项 - 使用 animationKey 或 id 作为 key -->
      <MessageItem 
        v-for="message in messages" 
        :key="message.animationKey || message.id" 
        :ref="(el) => setMessageRef(message.id, el)"
        :message="message"
        :upload-progress="uploadProgress?.[message.id]"
        @reply="handleReply"
        @burn="handleBurn"
        @edit="handleEdit"
        @scroll-to-message="handleScrollToMessage"
      />
    </div>

    <!-- 回到底部按钮 -->
    <Transition enter-active-class="animate__animated animate__zoomIn animate__faster"
      leave-active-class="animate__animated animate__zoomOut animate__faster">
      <button v-if="showScrollToBottom" class="scroll-to-bottom" :class="{ 'has-reply': hasReply }" @click="handleScrollToBottom">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 5v14M19 12l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>回到底部</span>
      </button>
    </Transition>

    <!-- 回到历史位置按钮 -->
    <Transition enter-active-class="animate__animated animate__zoomIn animate__faster"
      leave-active-class="animate__animated animate__zoomOut animate__faster">
      <button v-if="showBackToHistory" class="back-to-history" :class="{ 'has-reply': hasReply }" @click="handleBackToHistory">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 19V5M5 12l7-7 7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>回到历史位置</span>
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { message as antMessage } from 'ant-design-vue'
import MessageItem from './MessageItem.vue'
import { useReadStatus } from '@/composables/useReadStatus'

interface Message {
  id: string | number
  type: 'text' | 'image' | 'voice' | 'video' | 'file' | 'system'
  text?: string
  content?: string
  time: Date | string
  isOwn: boolean
  sender?: {
    id?: number
    nickname: string
    avatar?: string
  }
  animationKey?: string
  replyTo?: any
}

interface Props {
  messages: Message[]
  loading?: boolean
  hasMore?: boolean
  loadingMore?: boolean
  emptyText?: string
  emptyHint?: string
  uploadProgress?: Record<string, number>
  hasReply?: boolean // 是否有引用消息（用于调整按钮位置）
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  hasMore: false,
  loadingMore: false,
  emptyText: '还没有消息',
  emptyHint: '发送第一条消息开始对话',
  hasReply: false
})

const emit = defineEmits<{
  loadMore: []
  reply: [message: Message]
  burn: [messageId: string | number]
  edit: [messageId: string | number, content: string]
  scrollChange: [isAtBottom: boolean]
}>()

const messageContainer = ref<HTMLElement>()
const showScrollToBottom = ref(false)

// 历史位置相关
const historyMessageId = ref<string | number | null>(null)
const historyOffset = ref<number>(0) // 消息顶部相对于容器顶部的偏移
const showBackToHistory = ref(false)
const isAutoScrolling = ref(false)

// 消息元素引用映射
const messageRefs = ref<Map<string | number, InstanceType<typeof MessageItem>>>(new Map())

// 已读状态管理
const { initObserver, observeMessageElement, observeAllUnreadMessages, cleanup } = useReadStatus()

// 设置消息引用
const setMessageRef = (id: string | number, el: any) => {
  if (el) {
    messageRefs.value.set(id, el)
  } else {
    messageRefs.value.delete(id)
  }
}

const scrollToBottom = (smooth = true) => {
  if (!messageContainer.value) return
  messageContainer.value.scrollTo({
    top: messageContainer.value.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto'
  })
}

// 记录当前可视区域的第一条消息ID和偏移量（用于历史位置）
const recordHistoryPosition = () => {
  if (!messageContainer.value || props.messages.length === 0) return
  
  const container = messageContainer.value
  const containerRect = container.getBoundingClientRect()
  
  // 找到当前可视区域顶部的第一条消息
  for (let i = 0; i < props.messages.length; i++) {
    const msg = props.messages[i]
    if (msg.type === 'system') continue // 跳过系统消息
    
    const el = container.querySelector(`[data-msg-id="${msg.id}"]`) as HTMLElement
    if (el) {
      const rect = el.getBoundingClientRect()
      // 如果消息在可视区域内（顶部或中间）
      if (rect.bottom > containerRect.top && rect.top < containerRect.bottom) {
        historyMessageId.value = msg.id
        // 记录消息顶部相对于容器顶部的偏移量
        historyOffset.value = rect.top - containerRect.top
        return
      }
    }
  }
}

// 滚动到底部并显示回到历史位置按钮
const scrollToBottomWithHistory = (smooth = true) => {
  // 先记录当前位置
  recordHistoryPosition()
  
  // 标记正在自动滚动，防止滚动事件误清除
  isAutoScrolling.value = true
  
  // 滚动到底部
  scrollToBottom(smooth)
  
  // 显示回到历史位置按钮
  if (historyMessageId.value) {
    showBackToHistory.value = true
  }
  
  // 延迟重置自动滚动标记
  setTimeout(() => {
    isAutoScrolling.value = false
  }, 500)
}

// 回到历史位置
const handleBackToHistory = () => {
  if (!historyMessageId.value || !messageContainer.value) return
  
  const targetEl = messageContainer.value.querySelector(`[data-msg-id="${historyMessageId.value}"]`) as HTMLElement
  if (!targetEl) {
    // 消息不在DOM中了，清除历史位置
    clearHistoryPosition()
    return
  }
  
  // 计算滚动位置，还原之前的偏移量
  const containerRect = messageContainer.value.getBoundingClientRect()
  const targetRect = targetEl.getBoundingClientRect()
  const scrollTop = messageContainer.value.scrollTop
  const targetOffsetTop = targetRect.top - containerRect.top + scrollTop
  // 让消息回到之前的相对位置
  const scrollTo = Math.max(0, targetOffsetTop - historyOffset.value)
  
  messageContainer.value.scrollTo({
    top: scrollTo,
    behavior: 'smooth'
  })
  
  // 高亮目标消息
  const messageRef = messageRefs.value.get(historyMessageId.value)
  if (messageRef?.highlight) {
    messageRef.highlight()
  }
  
  // 清除历史位置
  clearHistoryPosition()
}

// 清除历史位置
const clearHistoryPosition = () => {
  historyMessageId.value = null
  historyOffset.value = 0
  showBackToHistory.value = false
}

const handleScrollToBottom = () => {
  // 如果不在底部，记录历史位置后再滚动
  if (showScrollToBottom.value) {
    scrollToBottomWithHistory(true)
  } else {
    scrollToBottom(true)
  }
}

const handleScroll = () => {
  if (!messageContainer.value) return
  const { scrollTop, scrollHeight, clientHeight } = messageContainer.value
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight
  showScrollToBottom.value = distanceFromBottom > 200
  
  // 通知父组件滚动位置变化
  const isAtBottom = distanceFromBottom < 100
  emit('scrollChange', isAtBottom)
  
  // 检查是否滚动回到历史位置附近，自动隐藏按钮
  // 只在非自动滚动时检测（用户手动滚动）
  if (showBackToHistory.value && historyMessageId.value && !isAutoScrolling.value) {
    const targetEl = messageContainer.value.querySelector(`[data-msg-id="${historyMessageId.value}"]`) as HTMLElement
    if (targetEl) {
      const containerRect = messageContainer.value.getBoundingClientRect()
      const targetRect = targetEl.getBoundingClientRect()
      // 如果历史消息在可视区域内，清除历史位置
      if (targetRect.top >= containerRect.top && targetRect.bottom <= containerRect.bottom) {
        clearHistoryPosition()
      }
    }
  }
}

const handleLoadMore = () => {
  emit('loadMore')
}

// 回复消息
const handleReply = (message: Message) => {
  emit('reply', message)
}

// 焚毁消息
const handleBurn = (messageId: string | number) => {
  emit('burn', messageId)
}

// 编辑消息
const handleEdit = (messageId: string | number, content: string) => {
  emit('edit', messageId, content)
}

// 滚动到指定消息
const handleScrollToMessage = (messageId: number) => {
  if (!messageContainer.value) return
  
  // 查找目标消息元素
  const targetEl = messageContainer.value.querySelector(`[data-msg-id="${messageId}"]`) as HTMLElement
  if (!targetEl) {
    antMessage.info('原消息不在当前视图中')
    return
  }
  
  // 计算滚动位置，让目标消息居中
  const containerRect = messageContainer.value.getBoundingClientRect()
  const targetRect = targetEl.getBoundingClientRect()
  const scrollTop = messageContainer.value.scrollTop
  const targetOffsetTop = targetRect.top - containerRect.top + scrollTop
  const centerOffset = (containerRect.height - targetRect.height) / 2
  const scrollTo = Math.max(0, targetOffsetTop - centerOffset)
  
  messageContainer.value.scrollTo({
    top: scrollTo,
    behavior: 'smooth'
  })
  
  // 高亮目标消息
  const messageRef = messageRefs.value.get(messageId)
  if (messageRef?.highlight) {
    messageRef.highlight()
  }
}

// 滚动到指定消息（供外部调用）
const scrollToMessage = (messageId: number) => {
  handleScrollToMessage(messageId)
}

// 观察新消息（供外部调用）
const observeNewMessage = (messageId: number) => {
  if (messageContainer.value) {
    observeMessageElement(messageId, messageContainer.value)
  }
}

onMounted(() => {
  if (messageContainer.value) {
    messageContainer.value.addEventListener('scroll', handleScroll, { passive: true })
    nextTick(() => {
      scrollToBottom(false)
      // 初始化已读检测
      initObserver(messageContainer.value!)
      observeAllUnreadMessages(messageContainer.value!)
    })
  }
})

onUnmounted(() => {
  if (messageContainer.value) {
    messageContainer.value.removeEventListener('scroll', handleScroll)
  }
  // 清理已读检测
  cleanup()
})

defineExpose({ scrollToBottom, scrollToBottomWithHistory, scrollToMessage, observeNewMessage, clearHistoryPosition })
</script>

<style lang="scss" scoped>
// 变量已通过 vite.config.ts 全局导入

// 消息列表容器 - 填满父容器并滚动
.message-list {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 16px;
  background-color: $bg-color;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.3);
    border-radius: 3px;
  }
}

// 深色模式适配
:global(.dark-mode) .message-list {
  background-color: $bg-color-dark;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");

  &::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.4);
  }
}

:global(.dark-mode) .loading-state {
  color: $text-tertiary-dark;
}

:global(.dark-mode) .loading-spinner svg {
  color: $primary-color;
}

:global(.dark-mode) .empty-state {
  .empty-text {
    color: $text-primary-dark;
  }

  .empty-hint {
    color: $text-tertiary-dark;
  }
}

:global(.dark-mode) .load-more-btn {
  background: rgba($primary-color, 0.15);
  border-color: rgba($primary-color, 0.3);
}

// 加载状态
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: $text-tertiary;

  p {
    margin: 0;
    font-size: 14px;
  }
}

.loading-spinner {
  width: 48px;
  height: 48px;

  svg {
    width: 100%;
    height: 100%;
    color: $primary-color;
    animation: spin 1s linear infinite;
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 48px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: rgba($primary-color, 0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;

  svg {
    width: 40px;
    height: 40px;
    color: $primary-color;
  }
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: $text-tertiary;
  margin: 0;
}

// 消息列表
.messages {
  display: flex;
  flex-direction: column;
}

// 加载更多
.load-more {
  display: flex;
  justify-content: center;
  padding: 16px 0;
  margin-bottom: 16px;
}

.load-more-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba($primary-color, 0.1);
  color: $primary-color;
  border: 1px solid rgba($primary-color, 0.2);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// 回到底部按钮 - 遵循UI/UX PRO MAX指导，使用主题变量
.scroll-to-bottom {
  position: fixed;
  bottom: 90px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  box-shadow: $box-shadow-base, 0 4px 16px rgba($primary-color, 0.25);
  z-index: 100;
  transition: all $transition-base;
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 255, 255, 0.15);
  font-size: 13px;
  font-weight: 500;

  svg {
    width: 18px;
    height: 18px;
    transition: transform $transition-fast;
  }

  // 悬停效果 - 使用主题变量
  &:hover {
    transform: translateY(-2px) scale(1.02);
    background: linear-gradient(135deg, $primary-hover 0%, $primary-color 100%);
    box-shadow: $box-shadow-lg, 0 8px 24px rgba($primary-color, 0.35);

    svg {
      transform: translateY(1px);
    }
  }

  // 按下效果
  &:active {
    transform: translateY(0) scale(0.98);
    box-shadow: $box-shadow-sm, 0 2px 8px rgba($primary-color, 0.3);
  }

  // 有引用消息时上移
  &.has-reply {
    bottom: 130px;
  }
}

// 回到历史位置按钮
.back-to-history {
  position: fixed;
  bottom: 140px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  box-shadow: $box-shadow-base, 0 4px 16px rgba(99, 102, 241, 0.3);
  z-index: 100;
  transition: all $transition-base;
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 255, 255, 0.15);
  font-size: 13px;
  font-weight: 500;

  svg {
    width: 18px;
    height: 18px;
    transition: transform $transition-fast;
  }

  &:hover {
    transform: translateY(-2px) scale(1.02);
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    box-shadow: $box-shadow-lg, 0 8px 24px rgba(99, 102, 241, 0.4);

    svg {
      transform: translateY(-1px);
    }
  }

  &:active {
    transform: translateY(0) scale(0.98);
    box-shadow: $box-shadow-sm, 0 2px 8px rgba(99, 102, 241, 0.3);
  }

  // 有引用消息时上移
  &.has-reply {
    bottom: 180px;
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.2;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.08;
  }

  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

// 动画
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

// 移动端
@media (max-width: 768px) {
  .message-list {
    padding: 12px;
  }

  .scroll-to-bottom {
    bottom: 80px;
    right: 16px;
    padding: 8px 12px;
    font-size: 12px;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      transform: none;
      background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
    }

    &:active {
      transform: scale(0.95);
    }

    &.has-reply {
      bottom: 120px;
    }
  }

  .back-to-history {
    bottom: 125px;
    right: 16px;
    padding: 8px 12px;
    font-size: 12px;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      transform: none;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    }

    &:active {
      transform: scale(0.95);
    }

    &.has-reply {
      bottom: 165px;
    }
  }
}
</style>
