<template>
  <a-modal
    :open="open"
    title="编辑资料"
    :confirm-loading="saving"
    ok-text="保存"
    cancel-text="取消"
    @ok="handleSave"
    @cancel="handleClose"
  >
    <div class="profile-edit">
      <!-- 头像 -->
      <div class="pe-avatar-row">
        <div class="pe-avatar" @click="triggerAvatar">
          <img v-if="form.avatar" :src="displayAvatar" :alt="form.nickname" />
          <span v-else class="pe-avatar-placeholder">{{ (form.nickname || 'U').charAt(0) }}</span>
          <div v-if="uploading" class="pe-avatar-loading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="9" stroke-width="3" opacity="0.25" />
              <path d="M21 12a9 9 0 00-9-9" stroke-width="3" stroke-linecap="round" />
            </svg>
          </div>
          <div v-else class="pe-avatar-hint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
        </div>
        <div class="pe-avatar-tip">点击头像更换</div>
        <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="onAvatarChange" />
      </div>

      <!-- 昵称 -->
      <a-form layout="vertical" class="pe-form">
        <a-form-item label="昵称">
          <a-input v-model:value="form.nickname" :maxlength="20" show-count placeholder="请输入昵称" />
        </a-form-item>
        <a-form-item label="个性签名">
          <a-textarea v-model:value="form.sign" :maxlength="200" show-count :rows="3" placeholder="介绍一下自己（可选）" />
        </a-form-item>
        <a-form-item label="用户 ID">
          <a-input :value="String(userId)" disabled />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { message as antMessage } from 'ant-design-vue'
import { uploadAvatar, updateProfile } from '@/apis/auth'
import { useUserStore } from '@/store/user'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [v: boolean]; saved: [{ nickname: string; avatar: string; sign?: string }] }>()

const userStore = useUserStore()
const serverUrl = import.meta.env.VITE_SERVER_URL || ''

const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const saving = ref(false)

const form = reactive({
  nickname: '',
  sign: '',
  avatar: ''
})

const userId = computed(() => userStore.userInfo?.id || 0)

const displayAvatar = computed(() => {
  const a = form.avatar
  if (!a) return ''
  if (a.startsWith('http://') || a.startsWith('https://')) return a
  return serverUrl + (a.startsWith('/') ? a : '/' + a)
})

// 打开时用当前用户信息填充
watch(() => props.open, (v) => {
  if (v && userStore.userInfo) {
    form.nickname = userStore.userInfo.nick_name || ''
    form.sign = (userStore.userInfo as any).sign || ''
    form.avatar = userStore.userInfo.avatar || ''
  }
})

const triggerAvatar = () => {
  if (uploading.value) return
  fileInput.value?.click()
}

const onAvatarChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''
  if (!file) return

  uploading.value = true
  try {
    const res = await uploadAvatar(file)
    if (res.code === 0 && res.data) {
      form.avatar = res.data.url || res.data.avatar
      antMessage.success('头像已上传')
    } else {
      antMessage.error(res.msg || '头像上传失败')
    }
  } catch (err: any) {
    antMessage.error(err?.message || '头像上传失败')
  } finally {
    uploading.value = false
  }
}

const handleSave = async () => {
  if (!form.nickname.trim()) {
    antMessage.warning('昵称不能为空')
    return
  }
  saving.value = true
  try {
    const res = await updateProfile({ nickname: form.nickname.trim(), sign: form.sign } as any)
    if (res.code === 0) {
      const nickname = res.data?.nickname || form.nickname.trim()
      const avatar = res.data?.avatar ?? form.avatar
      const sign = res.data?.sign
      // 本地即时生效
      userStore.updateUserInfo({ nick_name: nickname, avatar } as any)
      antMessage.success('资料已更新')
      emit('saved', { nickname, avatar, sign })
      emit('update:open', false)
    } else {
      antMessage.error(res.msg || '保存失败')
    }
  } catch (err: any) {
    antMessage.error(err?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  emit('update:open', false)
}
</script>

<style lang="scss" scoped>
.profile-edit {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pe-avatar-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.pe-avatar {
  position: relative;
  width: 84px;
  height: 84px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover .pe-avatar-hint {
    opacity: 1;
  }
}

.pe-avatar-placeholder {
  color: #fff;
  font-size: 32px;
  font-weight: 600;
}

.pe-avatar-hint,
.pe-avatar-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;

  svg { width: 24px; height: 24px; }
}

.pe-avatar-hint {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.pe-avatar-loading svg {
  animation: pe-spin 0.9s linear infinite;
}

@keyframes pe-spin {
  to { transform: rotate(360deg); }
}

.pe-avatar-tip {
  font-size: 12px;
  color: $text-tertiary;
}

.pe-form {
  :deep(.ant-form-item) {
    margin-bottom: 14px;
  }
}
</style>
