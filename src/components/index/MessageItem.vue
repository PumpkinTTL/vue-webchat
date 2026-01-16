<template>
  <div 
    class="msg-row"
    :class="{ 
      'msg-own': message.isOwn,
      'msg-system-row': message.type === 'system',
      'msg-new': message.isNew,
      'highlight-message': isHighlighted
    }"
    :data-msg-id="message.id"
  >
    <!-- 系统消息 -->
    <div v-if="message.type === 'system'" class="msg-system">
      <span class="system-badge">{{ message.text }}</span>
    </div>

    <!-- 普通消息 -->
    <template v-else>
      <!-- 头像 -->
      <div class="msg-avatar">
        <img 
          v-if="avatarUrl" 
          :src="avatarUrl" 
          :alt="senderName"
        >
        <span v-else class="avatar-char">{{ avatarChar }}</span>
      </div>

      <!-- 他人消息 -->
      <div v-if="!message.isOwn" class="msg-content-left">
        <div class="msg-bubble-wrapper">
          <a-popover 
            v-model:open="popoverVisible"
            trigger="contextmenu,click"
            placement="top"
            :arrow="false"
            overlay-class-name="msg-action-popover"
          >
            <template #content>
              <div class="msg-actions">
                <button class="action-item" @click="handleReply">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-5l-5 5v-5z"/>
                  </svg>
                  <span>回复</span>
                </button>
                <button v-if="canCopy" class="action-item" @click="handleCopy">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  <span>复制</span>
                </button>
              </div>
            </template>
            <div 
              class="msg-bubble" 
              :class="bubbleClass"
            >
              <!-- 图片 -->
              <div v-if="message.type === 'image'" class="image-wrapper">
                <a-image :src="imageUrl" alt="Image" :preview="{ src: imageUrl }" />
              </div>
              <!-- 视频消息 -->
              <div v-else-if="message.type === 'video'" class="video-wrapper">
                <div v-if="videoThumbnailUrl" class="video-thumbnail" @click="handleVideoClick">
                  <img :src="videoThumbnailUrl" alt="Video thumbnail">
                  <div class="video-play-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <div v-if="message.videoDuration" class="video-duration-badge">
                    {{ formatDuration(message.videoDuration) }}
                  </div>
                </div>
                <video v-else :src="videoUrl" controls preload="metadata" class="video-player"></video>
              </div>
              <!-- 文件 -->
              <div v-else-if="message.type === 'file'" class="file-message">
                <div class="file-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                    <path d="M13 2v7h7"/>
                  </svg>
                </div>
                <div class="file-info">
                  <div class="file-name">{{ message.fileName || '未知文件' }}</div>
                  <div class="file-size">{{ formatFileSize(message.fileSize) }}</div>
                </div>
              </div>
              <!-- 文本 -->
              <div v-else class="text-wrapper">
                <div class="text-content">{{ message.text || message.content }}</div>
                <!-- 编辑标记 -->
                <div v-if="message.edited" class="edited-badge">
                  编辑于 {{ formatTime(message.editedAt) }}
                </div>
                <!-- 引用显示 -->
                <div 
                  v-if="message.replyTo" 
                  class="reply-quote reply-quote-other"
                  @click.stop="handleScrollToReply"
                >
                  <div class="reply-quote-line"></div>
                  <div class="reply-quote-content">
                    <span class="reply-quote-nickname">{{ replyNickname }}:</span>
                    <span class="reply-quote-text">{{ replyQuoteText }}</span>
                  </div>
                </div>
              </div>
            </div>
          </a-popover>
        </div>
        <!-- 昵称和时间 -->
        <div class="msg-sender">
          <span>{{ senderName }}</span>
          <span class="msg-time">{{ formatTime(message.time) }}</span>
        </div>
      </div>

      <!-- 自己的消息 -->
      <div v-else class="msg-content-right">
        <div class="msg-bubble-wrapper">
          <a-popover 
            v-model:open="popoverVisible"
            trigger="contextmenu,click"
            placement="top"
            :arrow="false"
            overlay-class-name="msg-action-popover"
          >
            <template #content>
              <div class="msg-actions">
                <button class="action-item" @click="handleReply">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-5l-5 5v-5z"/>
                  </svg>
                  <span>回复</span>
                </button>
                <button v-if="canCopy" class="action-item" @click="handleCopy">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  <span>复制</span>
                </button>
                <button v-if="canEdit" class="action-item" @click="handleEdit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span>编辑</span>
                </button>
                <button v-if="message.isOwn" class="action-item action-danger" @click="handleBurn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2c.5 2.5 2 4.5 2 7a4 4 0 11-8 0c0-2.5 1.5-4.5 2-7 1 1.5 2.5 2 4 0z"/>
                    <path d="M12 22v-4"/>
                  </svg>
                  <span>焚毁</span>
                </button>
              </div>
            </template>
            <div 
              class="msg-bubble msg-bubble-own" 
              :class="bubbleClass"
            >
              <!-- 图片 -->
              <div v-if="message.type === 'image'" class="image-wrapper">
                <a-image :src="imageUrl" alt="Image" :preview="{ src: imageUrl }" />
                <!-- 上传进度遮罩 -->
                <div v-if="message.status === 'sending' && uploadProgress !== undefined" class="upload-progress-overlay">
                  <div class="progress-ring">
                    <svg viewBox="0 0 100 100">
                      <!-- 背景圆环 -->
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.15)"
                        stroke-width="6"
                      />
                      <!-- 进度圆环 - 使用主题色 -->
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#3B82F6"
                        stroke-width="6"
                        stroke-linecap="round"
                        :stroke-dasharray="circumference"
                        :stroke-dashoffset="progressOffset"
                      />
                    </svg>
                    <div class="progress-text">{{ Math.round(uploadProgress) }}%</div>
                  </div>
                </div>
              </div>
              <!-- 视频消息 -->
              <div v-else-if="message.type === 'video'" class="video-wrapper">
                <!-- 上传中：显示占位容器 -->
                <div v-if="message.status === 'sending' && uploadProgress !== undefined" class="video-upload-placeholder">
                  <div class="video-upload-content">
                    <div class="video-upload-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z"/>
                      </svg>
                    </div>
                    <div class="video-upload-text">视频上传中...</div>
                    <!-- 圆形进度环 -->
                    <div class="progress-ring">
                      <svg viewBox="0 0 100 100">
                        <!-- 背景圆环 -->
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.15)"
                          stroke-width="6"
                        />
                        <!-- 进度圆环 -->
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="#3B82F6"
                          stroke-width="6"
                          stroke-linecap="round"
                          :stroke-dasharray="circumference"
                          :stroke-dashoffset="progressOffset"
                        />
                      </svg>
                      <div class="progress-text">{{ Math.round(uploadProgress) }}%</div>
                    </div>
                  </div>
                </div>
                <!-- 上传完成：显示视频 -->
                <template v-else>
                  <div v-if="videoThumbnailUrl" class="video-thumbnail" @click="handleVideoClick">
                    <img :src="videoThumbnailUrl" alt="Video thumbnail">
                    <div class="video-play-btn">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <div v-if="message.videoDuration" class="video-duration-badge">
                      {{ formatDuration(message.videoDuration) }}
                    </div>
                  </div>
                  <video v-else :src="videoUrl" controls preload="metadata" class="video-player"></video>
                </template>
              </div>
              <!-- 文件 -->
              <div v-else-if="message.type === 'file'" class="file-message">
                <div class="file-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                    <path d="M13 2v7h7"/>
                  </svg>
                </div>
                <div class="file-info">
                  <div class="file-name">{{ message.fileName || '未知文件' }}</div>
                  <div class="file-size">{{ formatFileSize(message.fileSize) }}</div>
                </div>
              </div>
              <!-- 文本 -->
              <div v-else class="text-wrapper">
                <div class="text-content">{{ message.text || message.content }}</div>
                <!-- 编辑标记 -->
                <div v-if="message.edited" class="edited-badge">
                  编辑于 {{ formatTime(message.editedAt) }}
                </div>
                <!-- 引用显示 -->
                <div 
                  v-if="message.replyTo" 
                  class="reply-quote reply-quote-own"
                  @click.stop="handleScrollToReply"
                >
                  <div class="reply-quote-line"></div>
                  <div class="reply-quote-content">
                    <span class="reply-quote-nickname">{{ replyNickname }}:</span>
                    <span class="reply-quote-text">{{ replyQuoteText }}</span>
                  </div>
                </div>
              </div>
            </div>
          </a-popover>
        </div>
        <!-- 已读回执、时间、状态 -->
        <div class="msg-meta-own">
          <!-- 已读状态文字 -->
          <span class="msg-read-status" :class="{ 'read': message.readCount && message.readCount > 0 }">
            <span v-if="message.readCount && message.readCount > 0">{{ message.readCount }}人已读</span>
            <span v-else>未读</span>
          </span>
          <span class="msg-time">{{ formatTime(message.time) }}</span>
          <!-- 发送状态图标 -->
          <span v-if="message.status" class="msg-status">
            <!-- 发送中 -->
            <svg v-if="message.status === 'sending'" class="status-sending" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            <!-- 发送成功 -->
            <svg v-else-if="message.status === 'sent' || message.status === 'delivered' || message.status === 'read'" class="status-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <!-- 发送失败 -->
            <svg v-else-if="message.status === 'failed'" class="status-failed" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 7v6M12 15h.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message as antMessage } from 'ant-design-vue'
import { formatDuration } from '@/utils/video'

interface ReplyTo {
  message_id: number
  content: string
  user_id: number
  nickname: string
  message_type: number | string
  deleted?: boolean
}

interface Message {
  id: string | number
  type: 'text' | 'image' | 'voice' | 'video' | 'file' | 'system'
  text?: string
  content?: string
  imageUrl?: string
  fileName?: string
  fileSize?: number
  fileUrl?: string
  videoUrl?: string
  videoThumbnail?: string
  videoDuration?: number
  time: Date | string
  isOwn: boolean
  sender?: {
    id?: number
    nickname: string
    avatar?: string
  }
  username?: string
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  readCount?: number
  isNew?: boolean
  replyTo?: ReplyTo
  edited?: boolean
  editedAt?: string
}

const props = defineProps<{
  message: Message
  uploadProgress?: number
}>()

const emit = defineEmits<{
  reply: [message: Message]
  burn: [messageId: string | number]
  scrollToMessage: [messageId: number]
}>()

// Popover 显示状态
const popoverVisible = ref(false)

// 高亮状态
const isHighlighted = ref(false)

// 进度圆环计算
const circumference = 2 * Math.PI * 42 // 半径42
const progressOffset = computed(() => {
  if (props.uploadProgress === undefined) return circumference
  const progress = props.uploadProgress / 100
  return circumference * (1 - progress)
})

const senderName = computed(() => {
  return props.message.sender?.nickname || props.message.username || '用户'
})

const avatarUrl = computed(() => {
  const avatar = props.message.sender?.avatar
  if (!avatar) return null
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }
  const serverUrl = import.meta.env.VITE_SERVER_URL || ''
  return serverUrl + avatar
})

const avatarChar = computed(() => {
  return senderName.value.charAt(0).toUpperCase()
})

// 处理图片URL
const imageUrl = computed(() => {
  const url = props.message.imageUrl || props.message.content
  if (!url) return ''
  // blob URL、http、https 都直接返回
  if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  const serverUrl = import.meta.env.VITE_SERVER_URL || ''
  return serverUrl + url
})

// 处理视频URL
const videoUrl = computed(() => {
  const url = props.message.videoUrl
  if (!url) return ''
  if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  const serverUrl = import.meta.env.VITE_SERVER_URL || ''
  return serverUrl + url
})

// 处理视频缩略图URL
const videoThumbnailUrl = computed(() => {
  const url = props.message.videoThumbnail
  if (!url) return ''
  if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  const serverUrl = import.meta.env.VITE_SERVER_URL || ''
  return serverUrl + url
})

// 处理文件URL
const fileUrl = computed(() => {
  const url = props.message.fileUrl
  if (!url) return ''
  if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  const serverUrl = import.meta.env.VITE_SERVER_URL || ''
  return serverUrl + url
})

const bubbleClass = computed(() => ({
  'msg-image': props.message.type === 'image',
  'msg-file': props.message.type === 'file',
  'msg-video': props.message.type === 'video'
}))

// 是否可以复制
const canCopy = computed(() => {
  return props.message.type === 'text' || !!props.message.text || !!props.message.content
})

// 是否可以编辑
const canEdit = computed(() => {
  return props.message.isOwn && props.message.type === 'text'
})

// 引用昵称
const replyNickname = computed(() => {
  return props.message.replyTo?.nickname || '用户'
})

// 引用文本
const replyQuoteText = computed(() => {
  const replyTo = props.message.replyTo
  if (!replyTo) return ''
  
  if (replyTo.deleted) {
    return '原消息已撤回'
  }
  
  // 消息类型映射
  const typeMap: Record<number | string, string> = {
    2: '[图片]',
    5: '[视频]',
    3: '[文件]',
    'image': '[图片]',
    'video': '[视频]',
    'file': '[文件]'
  }
  
  if (replyTo.message_type && typeMap[replyTo.message_type]) {
    return typeMap[replyTo.message_type]
  }
  
  const text = replyTo.content || ''
  return text.length > 50 ? text.substring(0, 50) + '...' : text
})

const formatTime = (time: Date | string) => {
  const date = time instanceof Date ? time : new Date(time)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 回复消息
const handleReply = () => {
  popoverVisible.value = false
  emit('reply', props.message)
}

// 复制消息
const handleCopy = async () => {
  popoverVisible.value = false
  const text = props.message.text || props.message.content || ''
  try {
    await navigator.clipboard.writeText(text)
    antMessage.success('已复制')
  } catch {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    antMessage.success('已复制')
  }
}

// 焚毁消息
const handleBurn = () => {
  popoverVisible.value = false
  emit('burn', props.message.id)
}

// 编辑消息
const handleEdit = () => {
  popoverVisible.value = false
  emit('edit', props.message.id, props.message.text || props.message.content || '')
}

// 跳转到引用消息
const handleScrollToReply = () => {
  if (props.message.replyTo?.message_id) {
    emit('scrollToMessage', props.message.replyTo.message_id)
  }
}

// 处理视频点击
const handleVideoClick = () => {
  if (videoUrl.value) {
    // 可以使用Ant Design的Modal或者原生video播放
    // 这里简单处理，让video标签自己播放
    console.log('[视频] 点击播放:', videoUrl.value)
  }
}

// 高亮消息
const highlight = () => {
  isHighlighted.value = true
  setTimeout(() => {
    isHighlighted.value = false
  }, 2000)
}

// 暴露方法给父组件
defineExpose({
  highlight
})
</script>

<style lang="scss" scoped>
// 变量已通过 vite.config.ts 全局导入

.msg-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 6px 0;
  width: 100%;

  &.msg-own {
    flex-direction: row-reverse;
  }

  &.msg-system-row {
    justify-content: center;
  }

  // 新消息动画 - 接收消息（左边）从左往右
  &.msg-new {
    animation: msgReceiveIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    transform-origin: left center;
  }

  // 新消息动画 - 发送消息（右边）从右往左
  &.msg-new.msg-own {
    animation: msgSendIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    transform-origin: right center;
  }
}

// 接收消息动画 - 从左往右
@keyframes msgReceiveIn {
  0% {
    opacity: 0;
    transform: scale(0.4);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

// 发送消息动画 - 从右往左
@keyframes msgSendIn {
  0% {
    opacity: 0;
    transform: scale(0.4);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

// 系统消息
.msg-system {
  display: flex;
  justify-content: center;
  width: 100%;
}

.system-badge {
  padding: 4px 12px;
  background: rgba($text-tertiary, 0.08);
  color: $text-tertiary;
  border-radius: $border-radius-round;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
}

// 头像
.msg-avatar {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-char {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

// 他人消息内容区
.msg-content-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
  max-width: 70%;
}

// 自己消息内容区
.msg-content-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  min-width: 0;
  max-width: 70%;
}

// 气泡包装
.msg-bubble-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 100%;
}

// 气泡
.msg-bubble {
  padding: 10px 14px;
  border-radius: 4px 12px 12px 12px;
  font-size: 14px;
  line-height: 1.5;
  background: $bg-color-elevated;
  color: $text-primary;
  box-shadow: $box-shadow-sm;
  word-wrap: break-word;
  word-break: break-word;
  max-width: 100%;

  &.msg-bubble-own {
    background: $primary-color;
    color: #fff;
    border-radius: 12px 4px 12px 12px;
    box-shadow: 0 1px 3px rgba($primary-color, 0.25);
  }

  &.msg-image,
  &.msg-file,
  &.msg-video {
    background: transparent !important;
    padding: 0 !important;
    box-shadow: none !important;
  }
}

.text-content {
  white-space: pre-wrap;
}

.edited-badge {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 4px;
  font-style: italic;
}

// 深色模式
.dark-mode .edited-badge {
  color: rgba(255, 255, 255, 0.45);
}

// 图片
.image-wrapper {
  max-width: 280px;
  border-radius: 8px;
  overflow: hidden;
  line-height: 0;
  position: relative;

  :deep(.ant-image) {
    display: block;
    width: 100%;
    
    img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 8px;
    }
  }
}

// 上传进度遮罩
.upload-progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.85); // slate-900 with opacity
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  z-index: 1;
}

.progress-ring {
  position: relative;
  width: 72px;
  height: 72px;
  
  svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
    filter: drop-shadow(0 2px 8px rgba(37, 99, 235, 0.3));
  }
  
  circle {
    transition: stroke-dashoffset 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

// ==================== 视频消息 ====================
.video-wrapper {
  max-width: 280px;
  border-radius: 12px;
  overflow: hidden;
  line-height: 0;
  position: relative;
}

// 视频上传占位容器 - Swiss Modernism 2.0
.video-upload-placeholder {
  width: 280px;
  height: 200px;
  background: rgba($primary-color, 0.06);
  border: 1px solid rgba($primary-color, 0.12);
  border-radius: $border-radius-base;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all $transition-base;
}

.video-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-lg; // 24px - 数学化间距
}

.video-upload-icon {
  width: 56px;
  height: 56px;
  background: rgba($primary-color, 0.1);
  border-radius: $border-radius-round;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-base;

  svg {
    width: 28px;
    height: 28px;
    color: $primary-color;
  }
}

.video-upload-text {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-secondary;
  font-family: $font-family-body;
}

// 视频缩略图
.video-thumbnail {
  position: relative;
  cursor: pointer;
  max-width: 280px;
  border-radius: 12px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: auto;
    display: block;
  }
  
  &:hover .video-play-btn {
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.video-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 56px;
  height: 56px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  
  svg {
    width: 24px;
    height: 24px;
    color: white;
    margin-left: 3px;
  }
}

.video-duration-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
}

.video-player {
  max-width: 280px;
  max-height: 400px;
  border-radius: 12px;
  display: block;
}

// 文件
.file-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: $bg-color-elevated;
  border: 1px solid $border-base;
  border-radius: 8px;
  min-width: 200px;
}

.file-icon {
  width: 40px;
  height: 40px;
  background: rgba($primary-color, 0.1);
  color: $primary-color;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 11px;
  color: $text-tertiary;
  margin-top: 2px;
}

// 昵称和时间（他人消息）
.msg-sender {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: $text-tertiary;
  padding-left: 2px;
}

.msg-time {
  font-size: 11px;
  color: $text-tertiary;
}

// 自己消息的元数据
.msg-meta-own {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: $text-tertiary;
  padding-right: 2px;
}

.msg-read-status {
  font-size: 11px;
  color: $text-tertiary;
  
  &.read {
    color: $primary-color;
    font-weight: 500;
  }
}

.msg-read-count {
  color: $primary-color;
  font-size: 10px;
}

// 状态图标
.msg-status {
  display: inline-flex;
  align-items: center;

  svg {
    width: 16px;
    height: 16px;
  }
}

.status-sending {
  color: $text-tertiary;
  animation: spin 1s linear infinite;
}

.status-success {
  color: $success-color;
}

.status-failed {
  color: $danger-color;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// ==================== 消息操作菜单 ====================
.msg-actions {
  display: flex;
  gap: 4px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: $border-radius-sm;
  cursor: pointer;
  color: $text-secondary;
  font-size: 11px;
  min-width: 52px;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: rgba($primary-color, 0.08);
    color: $primary-color;
  }

  &.action-danger {
    &:hover {
      background: rgba($danger-color, 0.08);
      color: $danger-color;
    }
  }
}

// ==================== 引用显示 ====================
.text-wrapper {
  display: flex;
  flex-direction: column;
}

.reply-quote {
  display: flex;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  margin-top: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.reply-quote-other {
  background: rgba(0, 0, 0, 0.04);

  &:hover {
    background: rgba(0, 0, 0, 0.08);
  }
}

.reply-quote-own {
  background: rgba(255, 255, 255, 0.18);

  &:hover {
    background: rgba(255, 255, 255, 0.28);
  }

  .reply-quote-line {
    background: rgba(255, 255, 255, 0.75);
  }

  .reply-quote-nickname {
    color: rgba(255, 255, 255, 1);
  }

  .reply-quote-text {
    color: rgba(255, 255, 255, 0.88);
  }
}

.reply-quote-line {
  width: 3px;
  min-height: 24px;
  border-radius: 2px;
  background: $primary-color;
  flex-shrink: 0;
}

.reply-quote-content {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.reply-quote-nickname {
  font-size: 12px;
  font-weight: 600;
  color: $primary-color;
  flex-shrink: 0;
}

.reply-quote-text {
  font-size: 12px;
  color: $text-secondary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// ==================== 高亮动画 ====================
.highlight-message {
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
    background: rgba($primary-color, 0.15);
    border-radius: 12px;
    z-index: -1;
    animation: highlightFade 0.6s ease-out;
  }
  
  animation: shake 0.6s ease-out;
}

@keyframes highlightFade {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10% {
    transform: translateX(-4px);
  }
  20% {
    transform: translateX(4px);
  }
  30% {
    transform: translateX(-4px);
  }
  40% {
    transform: translateX(4px);
  }
  50% {
    transform: translateX(-2px);
  }
  60% {
    transform: translateX(2px);
  }
  70% {
    transform: translateX(0);
  }
}

// 深色模式
:global(.dark-mode) {
  .system-badge {
    background: rgba($text-tertiary-dark, 0.15);
    color: $text-tertiary-dark;
  }

  .msg-bubble {
    background: $bg-color-elevated-dark;
    color: $text-primary-dark;

    &.msg-bubble-own {
      background: $primary-color;
      color: white;
    }
  }

  .msg-sender,
  .msg-time,
  .msg-meta-own {
    color: $text-tertiary-dark;
  }
  
  .msg-read-status {
    color: $text-tertiary-dark;
    
    &.read {
      color: $primary-color;
    }
  }

  .file-message {
    background: $bg-color-elevated-dark;
    border-color: $border-base-dark;
  }

  .file-name {
    color: $text-primary-dark;
  }

  .file-size {
    color: $text-tertiary-dark;
  }

  // 深色模式 - 操作菜单
  .action-item {
    color: $text-secondary-dark;

    &:hover {
      background: rgba($primary-color, 0.12);
    }

    &.action-danger:hover {
      background: rgba($danger-color, 0.12);
    }
  }

  // 深色模式 - 视频上传占位
  .video-upload-placeholder {
    background: rgba($primary-color, 0.1);
    border-color: rgba($primary-color, 0.2);
  }

  .video-upload-icon {
    background: rgba($primary-color, 0.18);
  }

  .video-upload-text {
    color: $text-secondary-dark;
  }
}

// 深色模式 - 引用（独立写在外面，确保生效）
.dark-mode .reply-quote-other {
  background: #394659;

  &:hover {
    background: #445163;
  }
}

.dark-mode .reply-quote-other .reply-quote-nickname {
  color: #3B82F6;
  font-weight: 700;
}

.dark-mode .reply-quote-other .reply-quote-text {
  color: #CBD5E1;
}

.dark-mode .reply-quote-line {
  background: #3B82F6;
}

// 移动端
@media (max-width: 768px) {
  .msg-content-left,
  .msg-content-right {
    max-width: 80%;
  }

  .msg-avatar {
    width: 32px;
    height: 32px;
    min-width: 32px;
  }

  .avatar-char {
    font-size: 12px;
  }

  .msg-bubble {
    padding: 8px 12px;
    font-size: 13px;
  }

  .image-wrapper {
    max-width: 200px;
  }

  .file-message {
    min-width: 180px;
    padding: 10px;
    gap: 10px;
  }

  .file-icon {
    width: 36px;
    height: 36px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  .file-name {
    font-size: 12px;
  }

  .msg-sender {
    font-size: 11px;
  }

  .msg-time {
    font-size: 10px;
  }

  .msg-meta-own {
    font-size: 10px;
  }
}
</style>
