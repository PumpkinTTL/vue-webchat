<template>
  <div class="input-section">
    <!-- 图片预览 -->
    <Transition name="preview-slide">
      <div v-if="imagePreview" class="upload-preview">
        <div class="preview-card">
          <img :src="imagePreview" alt="Preview">
          <div class="file-info">
            <span class="fname">{{ selectedImageFile?.name }}</span>
            <span class="fsize">{{ formatFileSize(selectedImageFile?.size || 0) }}</span>
          </div>
          <button class="remove-btn" @click="clearImagePreview">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- 视频预览 -->
    <Transition name="preview-slide">
      <div v-if="videoPreview" class="upload-preview">
        <div class="preview-card">
          <div class="video-preview-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z"/>
            </svg>
          </div>
          <div class="file-info">
            <span class="fname">{{ selectedVideoFile?.name }}</span>
            <div class="video-meta">
              <span class="fsize">{{ formatFileSize(selectedVideoFile?.size || 0) }}</span>
              <span v-if="videoDuration > 0" class="video-duration">{{ formatDuration(videoDuration) }}</span>
            </div>
          </div>
          <button class="remove-btn" @click="clearVideoPreview">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- 引用预览条 -->
    <Transition name="reply-slide">
      <div v-if="replyTo" class="reply-preview-bar">
        <div class="reply-preview-content">
          <svg class="reply-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-5l-5 5v-5z"/>
          </svg>
          <div class="reply-preview-info">
            <span class="reply-preview-nickname">{{ replyTo.sender?.nickname || '用户' }}</span>
            <span class="reply-preview-text">{{ replyPreviewText }}</span>
          </div>
        </div>
        <button class="reply-cancel-btn" @click="cancelReply" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </Transition>

    <div class="input-bar">
      <!-- 工具栏 -->
      <div class="input-toolbar">
        <!-- 附件按钮 -->
        <button 
          class="tool-btn"
          @click="toggleAttachMenu"
          :disabled="disabled"
          title="附件"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- 语音按钮 -->
        <button 
          class="tool-btn"
          :class="{ 'recording': isRecording }"
          @mousedown="startRecording"
          @mouseup="stopRecording"
          @mouseleave="cancelRecording"
          @touchstart.prevent="startRecording"
          @touchend.prevent="stopRecording"
          :disabled="disabled"
          :title="isRecording ? '松开发送' : '按住说话'"
        >
          <svg v-if="!isRecording" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2"/>
          </svg>
        </button>
      </div>

      <!-- 输入区域 -->
      <div class="input-wrapper">
        <input
          ref="inputRef"
          v-model="inputText"
          type="text"
          class="text-input"
          :placeholder="placeholder"
          :disabled="disabled"
          @keyup.enter="handleSend"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
        >
        
        <!-- 表情按钮（在输入框内） -->
        <button 
          class="emoji-btn"
          @click="toggleEmojiPicker"
          :disabled="disabled"
          title="表情"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- 发送按钮 -->
      <button 
        class="send-btn"
        :disabled="!canSend || disabled"
        @click="handleSend"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- 附件菜单遮罩 -->
      <div v-if="showAttachMenu" class="attach-overlay" @click="closeAttachMenu"></div>

      <!-- 附件菜单 -->
      <Transition
        enter-active-class="animate__animated animate__fadeInUp"
        leave-active-class="animate__animated animate__fadeOutDown"
        :duration="200"
      >
        <div v-if="showAttachMenu" class="attach-menu">
          <button class="attach-item" @click="selectImage">
            <div class="attach-icon attach-icon-image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="2"/>
                <circle cx="8.5" cy="8.5" r="1.5" stroke-width="2"/>
                <path d="M21 15l-5-5L5 21" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span>图片</span>
          </button>

          <button class="attach-item" @click="selectVideo">
            <div class="attach-icon attach-icon-video">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span>视频</span>
          </button>

          <button class="attach-item" @click="selectFile">
            <div class="attach-icon attach-icon-file">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13 2v7h7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span>文件</span>
          </button>
        </div>
      </Transition>

      <!-- 隐藏的文件输入 -->
      <input ref="imageInput" type="file" accept="image/*" hidden @change="handleImageSelect">
      <input ref="videoInput" type="file" accept="video/*" hidden @change="handleVideoSelect">
      <input ref="fileInput" type="file" accept="*/*" hidden @change="handleFileSelect">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { getVideoDuration, formatDuration, validateVideoFile } from '@/utils/video'
import { message } from 'ant-design-vue'

interface ReplyMessage {
  id: string | number
  type: 'text' | 'image' | 'voice' | 'video' | 'file' | 'system'
  text?: string
  content?: string
  sender?: {
    id?: number
    nickname: string
    avatar?: string
  }
}

interface Props {
  disabled?: boolean
  placeholder?: string
  replyTo?: ReplyMessage | null
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: '说点什么...',
  replyTo: null
})

const emit = defineEmits<{
  send: [text: string]
  sendImage: [file: File]
  sendVideo: [file: File]
  sendFile: [file: File]
  startRecording: []
  stopRecording: []
  typing: []
  cancelReply: []
}>()

const inputText = ref('')
const showAttachMenu = ref(false)
const showEmojiPicker = ref(false)
const isRecording = ref(false)

// 图片预览相关
const imagePreview = ref('')
const selectedImageFile = ref<File | null>(null)

// 视频预览相关
const videoPreview = ref('')
const selectedVideoFile = ref<File | null>(null)
const videoDuration = ref(0)

const inputRef = ref<HTMLInputElement>()
const imageInput = ref<HTMLInputElement>()
const videoInput = ref<HTMLInputElement>()
const fileInput = ref<HTMLInputElement>()

// 是否可以发送
const canSend = computed(() => inputText.value.trim().length > 0 || selectedImageFile.value !== null || selectedVideoFile.value !== null)

// 引用预览文本
const replyPreviewText = computed(() => {
  if (!props.replyTo) return ''
  
  if (props.replyTo.type === 'image') return '[图片]'
  if (props.replyTo.type === 'video') return '[视频]'
  if (props.replyTo.type === 'file') return '[文件]'
  
  const text = props.replyTo.text || props.replyTo.content || ''
  return text.length > 30 ? text.substring(0, 30) + '...' : text
})

// 切换附件菜单
const toggleAttachMenu = () => {
  showAttachMenu.value = !showAttachMenu.value
  showEmojiPicker.value = false
}

// 关闭附件菜单
const closeAttachMenu = () => {
  showAttachMenu.value = false
}

// 切换表情选择器
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
  showAttachMenu.value = false
}

// 发送消息
const handleSend = () => {
  if (!canSend.value || props.disabled) return
  
  // 如果有图片预览，发送图片
  if (selectedImageFile.value) {
    emit('sendImage', selectedImageFile.value)
    clearImagePreview()
    return
  }
  
  // 如果有视频预览，发送视频
  if (selectedVideoFile.value) {
    emit('sendVideo', selectedVideoFile.value)
    clearVideoPreview()
    return
  }
  
  // 否则发送文本
  if (inputText.value.trim()) {
    emit('send', inputText.value.trim())
    inputText.value = ''
  }
  
  showAttachMenu.value = false
  showEmojiPicker.value = false
}

// 输入事件
const handleInput = () => {
  emit('typing')
}

const handleFocus = () => {
  // 聚焦时可以做一些处理
}

const handleBlur = () => {
  // 失焦时可以做一些处理
}

// 选择图片
const selectImage = () => {
  imageInput.value?.click()
  showAttachMenu.value = false
}

// 选择视频
const selectVideo = () => {
  videoInput.value?.click()
  showAttachMenu.value = false
}

// 选择文件
const selectFile = () => {
  fileInput.value?.click()
  showAttachMenu.value = false
}

// 处理文件选择
const handleImageSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      // TODO: 显示错误提示
      target.value = ''
      return
    }
    
    // 保存文件并生成预览
    selectedImageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
    
    target.value = ''
  }
}

// 清除图片预览
const clearImagePreview = () => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }
  imagePreview.value = ''
  selectedImageFile.value = null
}

// 清除视频预览
const clearVideoPreview = () => {
  if (videoPreview.value) {
    URL.revokeObjectURL(videoPreview.value)
  }
  videoPreview.value = ''
  selectedVideoFile.value = null
  videoDuration.value = 0
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleVideoSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  // 验证视频文件
  const validation = validateVideoFile(file)
  if (!validation.valid) {
    message.error(validation.error || '视频文件无效')
    target.value = ''
    return
  }
  
  // 保存文件并生成预览
  selectedVideoFile.value = file
  videoPreview.value = URL.createObjectURL(file)
  
  // 提取视频时长
  getVideoDuration(file)
    .then(duration => {
      videoDuration.value = duration
    })
    .catch(error => {
      console.error('[视频] 获取时长失败:', error)
      videoDuration.value = 0
    })
  
  target.value = ''
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('sendFile', file)
    target.value = ''
  }
}

// 录音相关
const startRecording = () => {
  if (props.disabled) return
  isRecording.value = true
  emit('startRecording')
}

const stopRecording = () => {
  if (!isRecording.value) return
  isRecording.value = false
  emit('stopRecording')
}

const cancelRecording = () => {
  if (!isRecording.value) return
  isRecording.value = false
  // TODO: 取消录音
}

// 取消引用
const cancelReply = () => {
  emit('cancelReply')
}

// 聚焦输入框
const focusInput = () => {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 暴露方法给父组件
defineExpose({
  focusInput
})
</script>

<style lang="scss" scoped>
// 变量已通过 vite.config.ts 全局导入

.input-section {
  display: flex;
  flex-direction: column;
  gap: 0;
}

// ==================== 图片预览 ====================
.upload-preview {
  padding: 12px;
  margin-bottom: 8px;
  background: $bg-color-elevated;
  border-radius: $border-radius-base;
  border: 1px solid $border-base;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;

  img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: $border-radius-sm;
    flex-shrink: 0;
  }

  .video-preview-icon {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, $info-color, darken($info-color, 10%));
    border-radius: $border-radius-sm;
    flex-shrink: 0;

    svg {
      width: 28px;
      height: 28px;
      color: white;
    }
  }

  .file-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .fname {
      font-size: 13px;
      font-weight: 500;
      color: $text-primary;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .fsize {
      font-size: 11px;
      color: $text-tertiary;
    }

    .video-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;

      .fsize {
        color: $text-tertiary;
      }

      .video-duration {
        color: $info-color;
        font-weight: 600;
      }
    }
  }

  .remove-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba($danger-color, 0.1);
    color: $danger-color;
    border: none;
    border-radius: $border-radius-sm;
    cursor: pointer;
    flex-shrink: 0;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: rgba($danger-color, 0.2);
    }
  }
}

.dark-mode .upload-preview {
  background: $bg-color-elevated-dark;
  border-color: $border-base-dark;
}

.dark-mode .preview-card {
  .file-info {
    .fname {
      color: $text-primary-dark;
    }

    .fsize {
      color: $text-tertiary-dark;
    }
  }
}

// 预览动画
.preview-slide-enter-active,
.preview-slide-leave-active {
  transition: all 0.2s ease;
}

.preview-slide-enter-from,
.preview-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

// ==================== 引用预览条 ====================
.reply-preview-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  margin-bottom: 8px;
  background: rgba($primary-color, 0.06);
  border-radius: $border-radius-base;
  border-left: 3px solid $primary-color;
}

.reply-preview-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.reply-icon {
  width: 18px;
  height: 18px;
  color: $primary-color;
  flex-shrink: 0;
}

.reply-preview-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.reply-preview-nickname {
  font-size: 12px;
  font-weight: 600;
  color: $primary-color;
}

.reply-preview-text {
  font-size: 13px;
  color: $text-secondary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reply-cancel-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: $border-radius-sm;
  color: $text-tertiary;
  cursor: pointer;
  flex-shrink: 0;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.06);
    color: $text-secondary;
  }
}

// 引用预览动画
.reply-slide-enter-active,
.reply-slide-leave-active {
  transition: all 0.2s ease;
}

.reply-slide-enter-from,
.reply-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.input-bar {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  position: relative;
}

// ==================== 工具栏 ====================
.input-toolbar {
  display: flex;
  gap: $spacing-xs;
}

.tool-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: $text-tertiary;
  border: 1px solid transparent;
  border-radius: $border-radius-base;
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover:not(:disabled) {
    background: rgba($primary-color, 0.1);
    color: $primary-color;
    border-color: rgba($primary-color, 0.2);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.recording {
    background: $danger-color;
    color: white;
    animation: recordingPulse 1s ease-in-out infinite;
  }
}

// 深色模式 - 引用预览
.dark-mode .reply-preview-bar {
  background: rgba($primary-color, 0.1);
}

.dark-mode .reply-preview-nickname {
  color: #60a5fa;
}

.dark-mode .reply-preview-text {
  color: $text-secondary-dark;
}

.dark-mode .reply-cancel-btn {
  color: $text-tertiary-dark;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: $text-secondary-dark;
  }
}

.dark-mode .tool-btn {
  color: $text-tertiary-dark;
  
  &:hover:not(:disabled) {
    background: rgba($primary-color, 0.15);
    color: $primary-color;
    border-color: rgba($primary-color, 0.3);
  }
}

@keyframes recordingPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

// ==================== 输入区域 ====================
.input-wrapper {
  flex: 1;
  min-width: 0;
  position: relative;
}

.text-input {
  width: 100%;
  height: 40px;
  padding: 0 48px 0 $spacing-md;
  background: $bg-color;
  color: $text-primary;
  border: 1px solid $border-base;
  border-radius: $border-radius-base;
  font-family: $font-family-body;
  font-size: $font-size-base;
  outline: none;

  &::placeholder {
    color: $text-placeholder;
  }

  &:focus {
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.dark-mode .text-input {
  background: $bg-color-dark;
  color: $text-primary-dark;
  border-color: $border-base-dark;

  &::placeholder {
    color: $text-placeholder-dark;
  }
  
  &:focus {
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.15);
  }
}

.emoji-btn {
  position: absolute;
  right: $spacing-xs;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: $text-tertiary;
  border: none;
  border-radius: $border-radius-sm;
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover:not(:disabled) {
    background: rgba($primary-color, 0.1);
    color: $primary-color;
  }

  &:active:not(:disabled) {
    transform: translateY(-50%) scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.dark-mode .emoji-btn {
  color: $text-tertiary-dark;
  
  &:hover:not(:disabled) {
    background: rgba($primary-color, 0.15);
    color: $primary-color;
  }
}

// ==================== 发送按钮 ====================
.send-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $primary-color;
  color: white;
  border: none;
  border-radius: $border-radius-base;
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover:not(:disabled) {
    background: $primary-hover;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// ==================== 附件菜单 ====================
.attach-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: $z-index-dropdown - 1;
}

.attach-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 16px;
  display: flex;
  gap: $spacing-md;
  padding: $spacing-md $spacing-lg;
  background: $bg-color-elevated;
  border: 1px solid $border-base;
  border-radius: $border-radius-lg;
  box-shadow: $box-shadow-lg;
  z-index: $z-index-dropdown;
  --animate-duration: 0.2s;
}

.dark-mode .attach-menu {
  background: $bg-color-elevated-dark;
  border-color: $border-base-dark;
  box-shadow: $box-shadow-lg-dark;
}

.attach-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm;
  background: transparent;
  border: none;
  border-radius: $border-radius-base;
  cursor: pointer;

  span {
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: $text-secondary;
  }

  &:hover {
    background: rgba($primary-color, 0.05);

    span {
      color: $text-primary;
    }

    .attach-icon {
      transform: translateY(-2px);
    }
  }
}

.dark-mode .attach-item {
  span {
    color: $text-secondary-dark;
  }

  &:hover {
    background: rgba($primary-color, 0.08);

    span {
      color: $text-primary-dark;
    }
  }
}

.attach-icon {
  width: 48px;
  height: 48px;
  border-radius: $border-radius-base;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;

  svg {
    width: 24px;
    height: 24px;
    color: white;
  }

  // 使用主题变量的渐变背景
  &.attach-icon-image {
    background: linear-gradient(135deg, $success-color, darken($success-color, 10%));
  }

  &.attach-icon-video {
    background: linear-gradient(135deg, $info-color, darken($info-color, 10%));
  }

  &.attach-icon-file {
    background: linear-gradient(135deg, $warning-color, darken($warning-color, 10%));
  }
}

// ==================== 移动端适配 ====================
@media (max-width: 768px) {
  .input-bar {
    gap: $spacing-sm;
  }

  .input-toolbar {
    gap: 4px;
  }

  .tool-btn {
    width: 32px;
    height: 32px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  .text-input {
    height: 36px;
    padding: 0 44px 0 $spacing-sm;
    font-size: $font-size-sm;
  }

  .emoji-btn {
    width: 28px;
    height: 28px;
    right: 6px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  .send-btn {
    width: 36px;
    height: 36px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  .attach-menu {
    left: 0;
    right: 0;
    transform: none;
    gap: $spacing-sm;
    padding: $spacing-sm;
    justify-content: space-around;
  }

  .attach-item {
    padding: $spacing-xs;
    gap: 4px;

    span {
      font-size: 10px;
    }
  }

  .attach-icon {
    width: 40px;
    height: 40px;

    svg {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
