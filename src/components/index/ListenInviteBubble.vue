<template>
  <!-- 一起听：输入框上方的小气泡（非 toast）。授权操作使用组件库按钮（a-button） -->
  <Transition name="listen-pop">
    <div v-if="show" class="listen-bubble">
      <span class="lb-icon" :class="{ 'lb-icon--spin': !invitation }">
        <svg v-if="invitation" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <circle cx="12" cy="12" r="9" opacity="0.25" />
          <path d="M21 12a9 9 0 00-9-9" />
        </svg>
      </span>

      <div class="lb-body">
        <div class="lb-title">
          <template v-if="invitation"><strong>{{ invitation.fromNickname }}</strong> 邀请你一起听</template>
          <template v-else>正在等待对方接受…</template>
        </div>
        <div class="lb-name">{{ invitation ? invitation.audioName : pendingName }}</div>
      </div>

      <div class="lb-actions">
        <template v-if="invitation">
          <a-button size="small" @click="decline">拒绝</a-button>
          <a-button size="small" type="primary" @click="accept">同意</a-button>
        </template>
        <template v-else>
          <a-button size="small" @click="cancel">取消</a-button>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useListenStore } from '@/store/listen'

const listenStore = useListenStore()

const invitation = computed(() => listenStore.invitation)
const pending = computed(() => listenStore.pending)
const show = computed(() => !!invitation.value || pending.value)
const pendingName = computed(() => listenStore.info?.audioName || '')

const accept = () => listenStore.accept()
const decline = () => listenStore.decline()
const cancel = () => listenStore.cancelPending()
</script>

<style lang="scss" scoped>
.listen-bubble {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  margin-bottom: 8px;
  background: $bg-color-elevated;
  border: 1px solid $border-base;
  border-radius: $border-radius-base;
  box-shadow: $box-shadow-sm;
}

.lb-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: $border-radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);

  svg { width: 17px; height: 17px; }

  &--spin svg { animation: lb-spin 0.9s linear infinite; }
}

@keyframes lb-spin { to { transform: rotate(360deg); } }

.lb-body {
  flex: 1;
  min-width: 0;
}

.lb-title {
  font-size: 13px;
  color: $text-primary;
  line-height: 1.3;

  strong { font-weight: $font-weight-semibold; }
}

.lb-name {
  margin-top: 1px;
  font-size: 12px;
  color: $text-tertiary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lb-actions {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
}

.listen-pop-enter-active,
.listen-pop-leave-active { transition: all 0.22s ease; }
.listen-pop-enter-from,
.listen-pop-leave-to { opacity: 0; transform: translateY(8px); }

:global(.dark-mode) .listen-bubble {
  background: $bg-color-elevated-dark;
  border-color: $border-base-dark;
}
:global(.dark-mode) .lb-title { color: $text-primary-dark; }
</style>
