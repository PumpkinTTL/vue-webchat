<template>
  <!-- 一起听：右下角悬浮胶囊（小播放器卡片）。会话进行中常驻。 -->
  <Transition name="lp-pop">
    <div v-if="active" class="lp-pill" :class="{ 'lp-pill--expanded': expanded }">
      <!-- 尾部隐藏的音频宿主（真正播放的元素） -->
      <audio
        ref="audioRef"
        :src="audioUrl"
        preload="metadata"
        @timeupdate="onTime"
        @loadedmetadata="syncMeta"
        @durationchange="syncMeta"
        @play="onPlay"
        @pause="onPause"
      ></audio>

      <!-- 头行：图标 + 歌名 + 时间 + 播放 + 展开 -->
      <div class="lp-row">
        <span class="lp-eq" :class="{ 'is-playing': playing }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </span>

        <span class="lp-name" :title="audioName">{{ audioName }}</span>
        <span class="lp-time">{{ fmt(cur) }} / {{ fmt(dur) }}</span>

        <button class="lp-btn" type="button" :title="playing ? '暂停' : '播放'" @click.stop="toggle">
          <svg v-if="!playing" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor"><rect x="6.6" y="5" width="3.5" height="14" rx="1.4"/><rect x="13.9" y="5" width="3.5" height="14" rx="1.4"/></svg>
        </button>

        <button class="lp-btn lp-btn--chev" type="button" :title="expanded ? '收起' : '展开'" @click.stop="expanded = !expanded">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path :d="expanded ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'" />
          </svg>
        </button>
      </div>

      <!-- 进度条 -->
      <div class="lp-track" ref="trackEl" @click.stop="seekByEvent" @mousedown.stop="startDrag">
        <div class="lp-bar" :style="{ width: percent + '%' }"></div>
        <div class="lp-thumb" :style="{ left: `clamp(6px, ${percent}%, calc(100% - 6px))` }"></div>
      </div>

      <!-- 展开区：音量 + 退出 -->
      <Transition name="lp-expand">
        <div v-if="expanded" class="lp-more">
          <div class="lp-volume">
            <span class="lp-volume__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M15.5 8.5a5 5 0 010 7" />
              </svg>
            </span>
            <a-slider class="lp-volume__slider" :value="volume" :min="0" :max="1" :step="0.01" :tooltip-open="false" @change="onVolume" />
          </div>
          <div class="lp-status">
            <span class="lp-dot"></span>
            <span>{{ partnerName }} 同步中</span>
          </div>
          <a-button block danger size="small" @click="exit">退出一起听</a-button>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useListenStore } from '@/store/listen'

const listenStore = useListenStore()

const active = computed(() => listenStore.active)
const expanded = computed({
  get: () => listenStore.panelOpen,
  set: (v: boolean) => { listenStore.panelOpen = v }
})
const audioUrl = computed(() => listenStore.info?.audioUrl || '')
const audioName = computed(() => listenStore.info?.audioName || '音频')
const partnerName = computed(() => listenStore.partnerName)
const volume = computed(() => listenStore.volume)

const audioRef = ref<HTMLAudioElement>()
const trackEl = ref<HTMLElement>()
const cur = ref(0)
const dur = ref(0)
const playing = ref(false)
let dragging = false

const percent = computed(() => (dur.value > 0 ? Math.min(100, (cur.value / dur.value) * 100) : 0))

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
const fmt = (s: number) => (isFinite(s) && s > 0 ? `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}` : '0:00')

const onTime = () => { if (audioRef.value) cur.value = audioRef.value.currentTime }
const syncMeta = () => { if (audioRef.value && isFinite(audioRef.value.duration)) dur.value = audioRef.value.duration }
const onPlay = () => { playing.value = true }
const onPause = () => { playing.value = false }

const toggle = () => { listenStore.togglePlayback() }

// 点击/拖动进度条定位
const seekTo = (clientX: number) => {
  const el = audioRef.value
  const track = trackEl.value
  if (!el || !track || !dur.value) return
  const rect = track.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  el.currentTime = ratio * dur.value
  cur.value = el.currentTime
}
const seekByEvent = (e: MouseEvent) => seekTo(e.clientX)
const onMove = (e: MouseEvent) => { if (dragging) seekTo(e.clientX) }
const onUp = () => {
  dragging = false
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', onUp)
}
const startDrag = (e: MouseEvent) => {
  dragging = true
  seekTo(e.clientX)
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

const onVolume = (v: number) => listenStore.setVolume(v)
const exit = () => listenStore.end()

const bind = () => {
  const el = audioRef.value
  if (!el) return
  listenStore.registerAudio(el)
  syncMeta()
}
onMounted(() => nextTick(bind))
watch(audioRef, () => { if (active.value) nextTick(bind) })

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', onUp)
})
</script>

<style lang="scss" scoped>
.lp-pill {
  position: fixed;
  right: 16px;
  bottom: 84px;
  z-index: 1200;
  width: 296px;
  max-width: calc(100vw - 24px);
  padding: 10px 12px 11px;
  background: $bg-color-elevated;
  border: 1px solid $border-base;
  border-radius: 20px;
  box-shadow: $box-shadow-lg;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lp-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lp-eq {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);

  svg { width: 14px; height: 14px; }

  // 播放时轻微呼吸
  &.is-playing { animation: lp-breathe 1.4s ease-in-out infinite; }
}

@keyframes lp-breathe {
  0%, 100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4); }
  50% { box-shadow: 0 0 0 5px rgba(124, 58, 237, 0); }
}

.lp-name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: $font-weight-medium;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lp-time {
  flex-shrink: 0;
  font-size: 11px;
  color: $text-tertiary;
  font-variant-numeric: tabular-nums;
}

.lp-btn {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: $primary-color;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background $transition-fast, transform $transition-fast;

  svg { width: 16px; height: 16px; }
  &:hover { background: rgba($primary-color, 0.1); }
  &:active { transform: scale(0.92); }

  &--chev { color: $text-tertiary; svg { width: 17px; height: 17px; } }
}

// 进度条
.lp-track {
  position: relative;
  height: 5px;
  border-radius: 999px;
  background: rgba($primary-color, 0.14);
  cursor: pointer;
  margin: 1px 2px 0;

  &::before {
    content: '';
    position: absolute;
    left: 0; right: 0; top: -6px; bottom: -6px;
  }
}

.lp-bar {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
  transition: width 0.12s linear;
}

.lp-thumb {
  position: absolute;
  top: 50%;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #7c3aed;
  box-shadow: 0 1px 4px rgba(124, 58, 237, 0.45);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

// 展开区
.lp-more {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid $border-light;
}

.lp-volume {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lp-volume__icon {
  flex-shrink: 0;
  color: $text-tertiary;
  svg { width: 16px; height: 16px; display: block; }
}

.lp-volume__slider { flex: 1; }

.lp-status {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: $text-tertiary;
}

.lp-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: $success-color;
  box-shadow: 0 0 0 3px rgba($success-color, 0.18);
  animation: lp-pulse 1.6s ease-in-out infinite;
}

@keyframes lp-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

// 动效
.lp-pop-enter-active, .lp-pop-leave-active { transition: all 0.22s ease; }
.lp-pop-enter-from, .lp-pop-leave-to { opacity: 0; transform: translateY(12px) scale(0.96); }

.lp-expand-enter-active, .lp-expand-leave-active { transition: all 0.2s ease; }
.lp-expand-enter-from, .lp-expand-leave-to { opacity: 0; transform: translateY(-4px); }

// 移动端：贴底全宽
@media (max-width: 768px) {
  .lp-pill {
    right: 8px; left: 8px; bottom: 76px;
    width: auto; max-width: none;
  }
}

// 深色模式
:global(.dark-mode) .lp-pill {
  background: $bg-color-elevated-dark;
  border-color: $border-base-dark;
  box-shadow: $box-shadow-lg-dark;
}
:global(.dark-mode) .lp-name { color: $text-primary-dark; }
:global(.dark-mode) .lp-time { color: $text-tertiary-dark; }
:global(.dark-mode) .lp-track { background: rgba(#8b5cf6, 0.25); }
:global(.dark-mode) .lp-more { border-color: $border-light-dark; }
:global(.dark-mode) .lp-status { color: $text-tertiary-dark; }
:global(.dark-mode) .lp-btn--chev { color: $text-tertiary-dark; }
:global(.dark-mode) .lp-btn:hover { background: rgba($primary-lighter, 0.14); }
</style>
