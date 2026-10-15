<template>
  <!-- 一起听：紧凑面板（抽屉，非全屏、无遮罩，聊天可见） -->
  <a-drawer
    :open="open"
    placement="right"
    :width="panelWidth"
    :mask="false"
    :closable="true"
    root-class-name="listen-drawer"
    :body-style="{ padding: '14px' }"
    @close="closePanel"
  >
    <template #title>
      <div class="lp-header">
        <span class="lp-header__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </span>
        <span class="lp-header__text">一起听 · {{ partnerName }}</span>
      </div>
    </template>

    <div v-if="info" class="lp-body">
      <!-- 同步播放器（复用 AudioPlayer，隐藏其内置同步入口） -->
      <AudioPlayer
        ref="playerRef"
        :src="info.audioUrl"
        :name="info.audioName"
        :show-sync="false"
        class="lp-player"
      />

      <!-- 本地音量（不同步，各自独立） -->
      <div class="lp-volume">
        <span class="lp-volume__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M15.5 8.5a5 5 0 010 7" />
          </svg>
        </span>
        <input
          class="lp-volume__range"
          type="range"
          min="0"
          max="1"
          step="0.01"
          :value="volume"
          @input="onVolume"
        />
      </div>

      <div class="lp-tip">
        <span class="lp-dot"></span>
        同步中 · 播放 / 暂停 / 拖动进度都会同步给对方
      </div>
    </div>

    <template #footer>
      <button class="lp-exit" type="button" @click="exit">退出一起听</button>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import AudioPlayer from '@/components/index/AudioPlayer.vue'
import { useListenStore } from '@/store/listen'

const listenStore = useListenStore()

// 紧凑宽度：绝不全屏覆盖
const panelWidth = 'min(340px, 92vw)'

const info = computed(() => listenStore.info)
const partnerName = computed(() => listenStore.partnerName)
const volume = computed(() => listenStore.volume)

const open = computed({
  get: () => listenStore.panelOpen && listenStore.active,
  set: (v: boolean) => { listenStore.panelOpen = v }
})

const playerRef = ref<InstanceType<typeof AudioPlayer>>()

// 播放器挂载后，把底层 audio 元素交给同步引擎
const bindAudio = () => {
  const el = (playerRef.value as any)?.getAudioEl?.()
  if (el) listenStore.registerAudio(el)
}

watch(
  () => listenStore.active,
  (v) => {
    if (v) nextTick(bindAudio)
  },
  { immediate: true }
)
watch(playerRef, () => { if (listenStore.active) nextTick(bindAudio) })

const closePanel = () => { listenStore.panelOpen = false }
const onVolume = (e: Event) => {
  const v = Number((e.target as HTMLInputElement).value)
  listenStore.setVolume(v)
}
const exit = () => listenStore.end()
</script>

<style lang="scss" scoped>
.lp-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lp-header__icon {
  display: inline-flex;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  border-radius: $border-radius-sm;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: #fff;

  svg { width: 15px; height: 15px; }
}

.lp-header__text {
  font-size: 14px;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.lp-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.lp-player {
  width: 100%;

  :deep(.audio-bubble) {
    max-width: 100%;
    min-width: 0;
  }
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

.lp-volume__range {
  flex: 1;
  accent-color: $primary-color;
}

.lp-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: $text-tertiary;
  line-height: 1.5;
}

.lp-dot {
  flex-shrink: 0;
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

.lp-exit {
  width: 100%;
  height: 34px;
  border-radius: $border-radius-sm;
  border: 1px solid rgba($danger-color, 0.3);
  background: rgba($danger-color, 0.08);
  color: $danger-color;
  font-size: 13px;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover { background: rgba($danger-color, 0.16); }
}

:global(.dark-mode) .lp-header__text { color: $text-primary-dark; }
:global(.dark-mode) .lp-tip { color: $text-tertiary-dark; }
</style>
