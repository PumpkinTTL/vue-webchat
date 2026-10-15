<template>
  <!-- 一起听：收起态迷你条（常驻，点它展开面板）。会话进行中且面板收起时显示 -->
  <Transition name="listen-pop">
    <button v-if="show" class="listen-mini" type="button" @click="expand">
      <span class="lm-dot"></span>
      <span class="lm-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </span>
      <span class="lm-text">
        <span class="lm-title">一起听</span>
        <span class="lm-name">{{ name }}</span>
      </span>
      <span class="lm-partner">{{ partnerName }}</span>
      <span class="lm-expand">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      </span>
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useListenStore } from '@/store/listen'

const listenStore = useListenStore()

// 仅在「会话进行中」且「面板已收起」时显示，作为重新展开的入口
const show = computed(() => listenStore.active && !listenStore.panelOpen)
const name = computed(() => listenStore.info?.audioName || '音频')
const partnerName = computed(() => listenStore.partnerName)

const expand = () => { listenStore.panelOpen = true }
</script>

<style lang="scss" scoped>
.listen-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: $bg-color-elevated;
  border: 1px solid $border-base;
  border-radius: $border-radius-base;
  box-shadow: $box-shadow-sm;
  cursor: pointer;
  text-align: left;
  transition: border-color $transition-fast, box-shadow $transition-fast;

  &:hover {
    border-color: rgba($primary-color, 0.4);
    box-shadow: $box-shadow-base;
  }
}

.lm-dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: $success-color;
  box-shadow: 0 0 0 3px rgba($success-color, 0.18);
  animation: lm-pulse 1.6s ease-in-out infinite;
}

@keyframes lm-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

.lm-icon {
  flex-shrink: 0;
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

.lm-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.lm-title {
  font-size: 11px;
  color: $text-tertiary;
  line-height: 1.2;
}

.lm-name {
  font-size: 13px;
  font-weight: $font-weight-medium;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lm-partner {
  flex-shrink: 0;
  font-size: 12px;
  color: $text-tertiary;
  padding-left: 8px;
  border-left: 1px solid $border-base;
}

.lm-expand {
  flex-shrink: 0;
  display: inline-flex;
  color: $primary-color;

  svg { width: 15px; height: 15px; }
}

.listen-pop-enter-active,
.listen-pop-leave-active { transition: all 0.22s ease; }
.listen-pop-enter-from,
.listen-pop-leave-to { opacity: 0; transform: translateY(8px); }

:global(.dark-mode) .listen-mini {
  background: $bg-color-elevated-dark;
  border-color: $border-base-dark;

  &:hover { border-color: rgba($primary-color, 0.5); }
}
:global(.dark-mode) .lm-name { color: $text-primary-dark; }
:global(.dark-mode) .lm-partner { border-color: $border-base-dark; }
</style>
