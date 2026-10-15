<template>
  <!-- 一起听：输入框上方的小气泡（非 toast），邀请/等待中 -->
  <Transition name="listen-pop">
    <div v-if="show" class="listen-bubble">
      <!-- 收到邀请 -->
      <template v-if="invitation">
        <div class="lb-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div class="lb-body">
          <div class="lb-title">
            <strong>{{ invitation.fromNickname }}</strong> 邀请你一起听
          </div>
          <div class="lb-name">{{ invitation.audioName }}</div>
        </div>
        <div class="lb-actions">
          <button class="lb-btn lb-btn--ghost" type="button" @click="decline">拒绝</button>
          <button class="lb-btn lb-btn--primary" type="button" @click="accept">同意</button>
        </div>
      </template>

      <!-- 等待对方接受 -->
      <template v-else-if="pending">
        <div class="lb-icon lb-icon--spin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <circle cx="12" cy="12" r="9" opacity="0.25" />
            <path d="M21 12a9 9 0 00-9-9" />
          </svg>
        </div>
        <div class="lb-body">
          <div class="lb-title">正在等待对方接受一起听…</div>
          <div class="lb-name">{{ pendingName }}</div>
        </div>
        <div class="lb-actions">
          <button class="lb-btn lb-btn--ghost" type="button" @click="cancel">取消</button>
        </div>
      </template>
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
  padding: 10px 12px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, rgba($primary-color, 0.08), rgba(#8b5cf6, 0.08));
  border: 1px solid rgba($primary-color, 0.2);
  border-radius: $border-radius-base;
}

.lb-icon {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: $border-radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);

  svg { width: 18px; height: 18px; }

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

  strong { font-weight: $font-weight-semibold; }
}

.lb-name {
  margin-top: 2px;
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

.lb-btn {
  height: 30px;
  padding: 0 14px;
  border-radius: $border-radius-sm;
  font-size: 13px;
  font-weight: $font-weight-medium;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all $transition-fast;

  &--primary {
    background: $primary-color;
    color: #fff;
    &:hover { background: $primary-hover; }
  }

  &--ghost {
    background: transparent;
    color: $text-secondary;
    border-color: $border-base;
    &:hover { background: rgba($text-tertiary, 0.08); }
  }
}

.listen-pop-enter-active,
.listen-pop-leave-active { transition: all 0.22s ease; }
.listen-pop-enter-from,
.listen-pop-leave-to { opacity: 0; transform: translateY(8px); }

:global(.dark-mode) .listen-bubble {
  background: linear-gradient(135deg, rgba($primary-color, 0.12), rgba(#8b5cf6, 0.12));
  border-color: rgba($primary-color, 0.3);
}
:global(.dark-mode) .lb-title { color: $text-primary-dark; }
:global(.dark-mode) .lb-btn--ghost { color: $text-secondary-dark; border-color: $border-base-dark; }
</style>
