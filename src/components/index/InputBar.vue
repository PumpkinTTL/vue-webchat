<template>
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

    <!-- 附件菜单 -->
    <transition name="menu-slide">
      <div v-if="showAttachMenu" class="attach-menu animate__animated animate__fadeInUp" style="--animate-duration: 0.25s">
        <button class="attach-item animate__animated animate__bounceIn" style="--animate-duration: 0.4s; --animate-delay: 0.03s" @click="selectImage">
          <div class="attach-icon attach-icon-image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" stroke-width="2"/>
              <path d="M21 15l-5-5L5 21" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span>图片</span>
        </button>

        <button class="attach-item animate__animated animate__bounceIn" style="--animate-duration: 0.4s; --animate-delay: 0.06s" @click="selectVideo">
          <div class="attach-icon attach-icon-video">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span>视频</span>
        </button>

        <button class="attach-item animate__animated animate__bounceIn" style="--animate-duration: 0.4s; --animate-delay: 0.09s" @click="selectFile">
          <div class="attach-icon attach-icon-file">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13 2v7h7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span>文件</span>
        </button>
      </div>
    </transition>

    <!-- 隐藏的文件输入 -->
    <input ref="imageInput" type="file" accept="image/*" hidden @change="handleImageSelect">
    <input ref="videoInput" type="file" accept="video/*" hidden @change="handleVideoSelect">
    <input ref="fileInput" type="file" accept="*/*" hidden @change="handleFileSelect">
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  disabled?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: '说点什么...'
})

const emit = defineEmits<{
  send: [text: string]
  sendImage: [file: File]
  sendVideo: [file: File]
  sendFile: [file: File]
  startRecording: []
  stopRecording: []
  typing: []
}>()

const inputText = ref('')
const showAttachMenu = ref(false)
const showEmojiPicker = ref(false)
const isRecording = ref(false)

const imageInput = ref<HTMLInputElement>()
const videoInput = ref<HTMLInputElement>()
const fileInput = ref<HTMLInputElement>()

// 是否可以发送
const canSend = computed(() => inputText.value.trim().length > 0)

// 切换附件菜单
const toggleAttachMenu = () => {
  showAttachMenu.value = !showAttachMenu.value
  showEmojiPicker.value = false
}

// 切换表情选择器
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
  showAttachMenu.value = false
}

// 发送消息
const handleSend = () => {
  if (!canSend.value || props.disabled) return
  
  emit('send', inputText.value.trim())
  inputText.value = ''
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
    emit('sendImage', file)
    target.value = ''
  }
}

const handleVideoSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('sendVideo', file)
    target.value = ''
  }
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
</script>

<style lang="scss" scoped>
// 变量已通过 vite.config.ts 全局导入

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

// ==================== 动画 ====================
.menu-slide-enter-active,
.menu-slide-leave-active {
  transition: all $transition-base;
}

.menu-slide-enter-from,
.menu-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
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
    left: 50%;
    transform: translateX(-50%);
    gap: $spacing-sm;
    padding: $spacing-sm;
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
