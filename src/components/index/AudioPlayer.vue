<template>
  <div
    class="audio-bubble"
    :class="{ 'is-playing': playing, 'is-error': error }"
    @click.stop
  >
    <!-- 播放 / 暂停 / 缓冲 -->
    <button
      class="ab-play"
      :class="{ playing }"
      type="button"
      :aria-label="error ? '点击重试' : playing ? '暂停' : '播放'"
      @click="toggle"
    >
      <!-- 缓冲中 -->
      <svg v-if="buffering && playing" class="ab-spin" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" opacity="0.25" />
        <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
      </svg>
      <!-- 播放 -->
      <svg v-else-if="!playing" class="ab-glyph" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
      <!-- 暂停 -->
      <svg v-else class="ab-glyph" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6.6" y="5" width="3.5" height="14" rx="1.4" />
        <rect x="13.9" y="5" width="3.5" height="14" rx="1.4" />
      </svg>
    </button>

    <!-- 信息 + 进度 -->
    <div class="ab-body">
      <div class="ab-head">
        <span class="ab-name" :title="name || '音频'">{{ name || '音频' }}</span>
        <span class="ab-time">
          <span class="ab-cur">{{ fmt(currentTime) }}</span>
          <span class="ab-sep">/</span>
          <span class="ab-total">{{ fmt(duration) }}</span>
        </span>
      </div>

      <div
        class="ab-track"
        :class="{ 'show-thumb': showThumb }"
        ref="trackEl"
        role="slider"
        :aria-valuenow="Math.round(percent)"
        aria-valuemin="0"
        aria-valuemax="100"
        @click="seek"
        @mousedown="startDrag"
        @touchstart.passive="startDrag"
      >
        <div class="ab-bar" :style="{ width: percent + '%' }"></div>
        <div class="ab-thumb" :style="{ left: `clamp(7px, ${percent}%, calc(100% - 7px))` }"></div>
      </div>
    </div>

    <!-- 真正播放的 audio（无 controls，不会弹出系统播放器/跳转） -->
    <audio
      ref="audioEl"
      :src="src"
      preload="metadata"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoaded"
      @durationchange="onLoaded"
      @waiting="buffering = true"
      @loadstart="buffering = true"
      @canplay="buffering = false"
      @playing="buffering = false"
      @ended="onEnded"
      @play="onPlay"
      @pause="onPause"
      @error="onError"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { formatDuration } from '@/utils/video'
import { claimPlayback, releasePlayback } from '@/utils/mediaPlayback'

const props = withDefaults(defineProps<{ src?: string; name?: string }>(), {
  src: '',
  name: ''
})

const audioEl = ref<HTMLAudioElement>()
const trackEl = ref<HTMLElement>()

const playing = ref(false)
const buffering = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const error = ref(false)
const isDragging = ref(false)
let retryCount = 0
let retryTimer: ReturnType<typeof setTimeout> | null = null

const percent = computed(() => {
  if (!duration.value) return 0
  return Math.min(100, (currentTime.value / duration.value) * 100)
})

// 进度大于 0、播放中或拖动时才显示滑块（静止在 0% 时不显示，避免漂浮的小圆点）
const showThumb = computed(() => percent.value > 0.5 || playing.value || isDragging.value)

const fmt = (s: number) => (isFinite(s) && s > 0 ? formatDuration(s) : '0:00')

const toggle = () => {
  const el = audioEl.value
  if (!el) return
  if (el.paused) {
    // 全局互斥：暂停当前正在播放的任意媒体（音频或视频），确保同一时间只播一个
    claimPlayback(el)
    // 可恢复：这次点击即视为一次重试，清掉上次的错误态
    if (error.value) {
      error.value = false
      try { el.load() } catch { /* ignore */ }
    }
    buffering.value = true
    el.play().catch(() => { onError() })
  } else {
    el.pause()
  }
}

const onPlay = () => { playing.value = true; error.value = false }
const onPause = () => { playing.value = false; buffering.value = false }
const onEnded = () => { playing.value = false; buffering.value = false; currentTime.value = 0; releasePlayback(audioEl.value!) }
const onError = () => {
  playing.value = false
  buffering.value = false
  // 刚上传完时（尤其发送方）图床/CDN 可能还没就绪，播放器会瞬时 error。
  // 这里既保留「可点击重试」，也做有限次自动重试，避免要刷新页面才能播放。
  if (retryCount < 3) {
    retryCount++
    error.value = false
    if (retryTimer) clearTimeout(retryTimer)
    retryTimer = setTimeout(() => {
      const el = audioEl.value
      if (!el) return
      try { el.load() } catch { /* ignore */ }
    }, 1500 * retryCount)
  } else {
    error.value = true // 多次仍失败：标记错误，但按钮仍可点击重试
  }
}
const onLoaded = () => {
  if (audioEl.value && isFinite(audioEl.value.duration)) {
    duration.value = audioEl.value.duration
  }
  // 元数据加载成功说明资源可用，清掉错误与重试计数
  error.value = false
  retryCount = 0
  if (retryTimer) { clearTimeout(retryTimer); retryTimer = null }
}
const onTimeUpdate = () => {
  if (audioEl.value) currentTime.value = audioEl.value.currentTime
}

// src 变化（如发送方从本地 blob 切到图床正式地址）时重置错误/进度，避免残留错误态锁死播放
watch(
  () => props.src,
  () => {
    error.value = false
    buffering.value = false
    currentTime.value = 0
    duration.value = 0
    playing.value = false
    retryCount = 0
    if (retryTimer) { clearTimeout(retryTimer); retryTimer = null }
  }
)

// 点击/拖动进度条定位
const seekByClientX = (clientX: number) => {
  const el = audioEl.value
  const track = trackEl.value
  if (!el || !track || !duration.value) return
  const rect = track.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  el.currentTime = ratio * duration.value
  currentTime.value = el.currentTime
}

const seek = (e: MouseEvent) => seekByClientX(e.clientX)

const onDragMove = (e: MouseEvent) => { if (isDragging.value) seekByClientX(e.clientX) }
const onDragEnd = () => {
  isDragging.value = false
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
}
const startDrag = () => {
  isDragging.value = true
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', onDragEnd)
}

onBeforeUnmount(() => {
  releasePlayback(audioEl.value!)
  isDragging.value = false
  if (retryTimer) { clearTimeout(retryTimer); retryTimer = null }
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
})
</script>

<style lang="scss" scoped>
// 音频强调色（与上传预览 / 进度环保持一致）
$audio-accent: #7c3aed;
$audio-accent-2: #8b5cf6;

.audio-bubble {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 13px 11px 11px;
  background: $bg-color-elevated;
  border: 1px solid $border-base;
  border-radius: $border-radius-base;
  min-width: 210px;
  max-width: 320px;
  box-shadow: $box-shadow-sm;
  transition: border-color $transition-base, box-shadow $transition-base;

  &:hover {
    border-color: rgba($audio-accent, 0.35);
  }

  &.is-error {
    border-color: rgba($danger-color, 0.4);
  }
}

// ==================== 播放按钮 ====================
.ab-play {
  position: relative;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: linear-gradient(140deg, $audio-accent-2, $audio-accent);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba($audio-accent, 0.35);
  transition: transform $transition-fast, box-shadow $transition-fast, filter $transition-fast;

  .ab-glyph { width: 15px; height: 15px; }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba($audio-accent, 0.45);
  }
  &:active:not(:disabled) {
    transform: translateY(0) scale(0.94);
  }
  &:focus-visible {
    outline: 2px solid rgba($audio-accent, 0.55);
    outline-offset: 2px;
  }

  // 播放中：柔和光晕
  &.playing::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 1px solid rgba($audio-accent, 0.35);
    animation: ab-pulse 1.8s ease-out infinite;
  }

  &:disabled {
    background: $text-placeholder;
    box-shadow: none;
    cursor: not-allowed;
  }
}

.ab-spin {
  width: 17px;
  height: 17px;
  animation: ab-rotate 0.8s linear infinite;
}

// ==================== 右侧信息 ====================
.ab-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.ab-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.ab-name {
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.ab-time {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 500;
  color: $text-tertiary;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;

  .ab-cur { color: $audio-accent; }
  .ab-sep { margin: 0 3px; opacity: 0.5; }
}

// ==================== 进度条 ====================
.ab-track {
  position: relative;
  height: 6px;
  border-radius: 999px;
  background: rgba($audio-accent, 0.14);
  cursor: pointer;

  // 扩大移动端点击热区
  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: -6px;
    bottom: -6px;
  }
}

.ab-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, $audio-accent-2, $audio-accent);
  transition: width 0.12s linear;
}

.ab-thumb {
  position: absolute;
  top: 50%;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid $audio-accent;
  box-shadow: 0 1px 4px rgba($audio-accent, 0.45);
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  pointer-events: none;
  transition: transform $transition-fast, opacity $transition-fast;
}

// 仅在需要时显示滑块（有进度 / 播放中 / 拖动中 / 悬停）
.ab-track.show-thumb .ab-thumb,
.ab-track:hover .ab-thumb {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}

.ab-track:hover .ab-thumb {
  transform: translate(-50%, -50%) scale(1.15);
}

// ==================== 动效 ====================
@keyframes ab-rotate {
  to { transform: rotate(360deg); }
}

@keyframes ab-pulse {
  0% { transform: scale(0.9); opacity: 0.9; }
  100% { transform: scale(1.25); opacity: 0; }
}

// ==================== 深色模式 ====================
:global(.dark-mode) .audio-bubble {
  background: $bg-color-elevated-dark;
  border-color: $border-base-dark;

  &:hover { border-color: rgba($audio-accent, 0.45); }
}

:global(.dark-mode) .ab-name {
  color: $text-primary-dark;
}

:global(.dark-mode) .ab-time {
  color: $text-tertiary-dark;
}

:global(.dark-mode) .ab-track {
  background: rgba($audio-accent, 0.22);
}
</style>
