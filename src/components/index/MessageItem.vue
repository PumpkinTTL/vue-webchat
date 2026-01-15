<template>
  <div 
    class="msg-row"
    :class="{ 
      'msg-own': message.isOwn,
      'msg-system-row': message.type === 'system',
      'msg-new': message.isNew
    }"
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
          <div class="msg-bubble" :class="bubbleClass">
            <!-- 图片 -->
            <div v-if="message.type === 'image'" class="image-wrapper">
              <img :src="message.imageUrl || message.content" alt="Image" loading="lazy">
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
            <div v-else class="text-content">{{ message.text || message.content }}</div>
          </div>
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
          <div class="msg-bubble msg-bubble-own" :class="bubbleClass">
            <!-- 图片 -->
            <div v-if="message.type === 'image'" class="image-wrapper">
              <img :src="message.imageUrl || message.content" alt="Image" loading="lazy">
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
            <div v-else class="text-content">{{ message.text || message.content }}</div>
          </div>
        </div>
        <!-- 已读回执、时间、状态 -->
        <div class="msg-meta-own">
          <span v-if="message.readCount && message.readCount > 0" class="msg-read-count">
            {{ message.readCount }}人已读
          </span>
          <span class="msg-time">{{ formatTime(message.time) }}</span>
          <span v-if="message.status" class="msg-status">
            <svg v-if="message.status === 'sending'" class="status-sending" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12"/>
            </svg>
            <svg v-else-if="message.status === 'sent' || message.status === 'delivered' || message.status === 'read'" class="status-success" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <svg v-else-if="message.status === 'failed'" class="status-failed" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Message {
  id: string | number
  type: 'text' | 'image' | 'file' | 'system'
  text?: string
  content?: string
  imageUrl?: string
  fileName?: string
  fileSize?: number
  time: Date | string
  isOwn: boolean
  sender?: {
    nickname: string
    avatar?: string
  }
  username?: string
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  readCount?: number
  isNew?: boolean
}

const props = defineProps<{
  message: Message
}>()

const senderName = computed(() => {
  return props.message.sender?.nickname || props.message.username || '用户'
})

const avatarUrl = computed(() => {
  return props.message.sender?.avatar || null
})

const avatarChar = computed(() => {
  return senderName.value.charAt(0).toUpperCase()
})

const bubbleClass = computed(() => ({
  'msg-image': props.message.type === 'image',
  'msg-file': props.message.type === 'file'
}))

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

  // 新消息发送动画
  &.msg-new {
    animation: msgSendIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    transform-origin: bottom right;
  }
}

// 发送消息动画 - 纯缩放
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
  &.msg-file {
    background: transparent !important;
    padding: 0 !important;
    box-shadow: none !important;
  }
}

.text-content {
  white-space: pre-wrap;
}

// 图片
.image-wrapper {
  max-width: 280px;
  border-radius: 8px;
  overflow: hidden;
  line-height: 0;

  img {
    width: 100%;
    height: auto;
    display: block;
  }
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

.msg-read-count {
  color: $primary-color;
  font-size: 10px;
}

// 状态图标
.msg-status {
  display: inline-flex;
  align-items: center;

  svg {
    width: 14px;
    height: 14px;
  }
}

.status-sending {
  color: $primary-color;
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
