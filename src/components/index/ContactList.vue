<template>
  <div class="contact-list">
    <!-- 添加联系人按钮 -->
    <div v-if="contacts.length > 0" class="list-header">
      <button class="add-contact-btn" @click="handleAddContact">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12.5 7.5a4 4 0 11-8 0 4 4 0 018 0zM20 8v6M23 11h-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>添加联系人</span>
      </button>
    </div>

    <!-- 空状态 -->
    <div v-if="contacts.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <p class="empty-text">暂无联系人</p>
      <p class="empty-hint">添加好友开始私聊</p>
    </div>

    <!-- 联系人列表 -->
    <div v-else class="contact-items">
      <div
        v-for="contact in contacts"
        :key="contact.id"
        class="contact-item"
        @click="selectContact(contact)"
      >
        <div class="contact-avatar">
          <img 
            v-if="contact.avatar" 
            :src="contact.avatar" 
            :alt="contact.nickname"
          >
          <span v-else class="avatar-placeholder">
            {{ contact.nickname?.charAt(0) || 'U' }}
          </span>
        </div>

        <div class="contact-info">
          <div class="contact-name">{{ contact.nickname }}</div>
          <div class="contact-sign">{{ contact.sign || '这个人很懒，什么都没留下' }}</div>
        </div>

        <!-- 在线状态 -->
        <div v-if="contact.online" class="online-dot"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface Contact {
  id: string | number
  nickname: string
  avatar?: string
  sign?: string
  online?: boolean
}

defineProps<{
  contacts: Contact[]
}>()

const emit = defineEmits<{
  selectContact: [contact: Contact]
  addContact: []
}>()

const selectContact = (contact: Contact) => {
  emit('selectContact', contact)
}

const handleAddContact = () => {
  emit('addContact')
}
</script>

<style lang="scss" scoped>
// 变量已通过 vite.config.ts 全局导入

.contact-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

// ==================== 列表头部 ====================
.list-header {
  padding: $spacing-md;
  padding-bottom: 0;
}

.add-contact-btn {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  background: rgba($primary-color, 0.1);
  color: $primary-color;
  border: 1px solid rgba($primary-color, 0.2);
  border-radius: $border-radius-base;
  font-family: $font-family-heading;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  cursor: pointer;
  transition: all $transition-fast;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: rgba($primary-color, 0.15);
    border-color: $primary-color;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

// ==================== 空状态 ====================
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-3xl $spacing-lg;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: rgba($primary-color, 0.1);
  border-radius: $border-radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-lg;

  svg {
    width: 32px;
    height: 32px;
    color: $primary-color;
  }
}

.empty-text {
  font-family: $font-family-heading;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin: 0 0 $spacing-xs 0;
  transition: color $transition-base;
}

.dark-mode .empty-text {
  color: $text-primary-dark;
}

.empty-hint {
  font-size: $font-size-sm;
  color: $text-tertiary;
  margin: 0;
  transition: color $transition-base;
}

.dark-mode .empty-hint {
  color: $text-tertiary-dark;
}

// ==================== 联系人列表 ====================
.contact-items {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  padding: $spacing-md;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: transparent;
  border: 1px solid transparent;
  border-radius: $border-radius-base;
  cursor: pointer;
  transition: all $transition-fast;
  position: relative;

  &:hover {
    background: rgba($primary-color, 0.05);
    border-color: rgba($primary-color, 0.1);
  }
}

// ==================== 联系人头像 ====================
.contact-avatar {
  width: 44px;
  height: 44px;
  border-radius: $border-radius-base;
  overflow: hidden;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-placeholder {
  font-family: $font-family-heading;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: white;
  text-transform: uppercase;
}

// ==================== 联系人信息 ====================
.contact-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.contact-name {
  font-family: $font-family-heading;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color $transition-base;
}

.dark-mode .contact-name {
  color: $text-primary-dark;
}

.contact-sign {
  font-size: $font-size-sm;
  color: $text-tertiary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color $transition-base;
}

.dark-mode .contact-sign {
  color: $text-tertiary-dark;
}

// ==================== 在线状态 ====================
.online-dot {
  width: 8px;
  height: 8px;
  background: $success-color;
  border-radius: $border-radius-round;
  flex-shrink: 0;
}

// ==================== 移动端适配 ====================
@media (max-width: 768px) {
  .list-header {
    padding: $spacing-sm;
    padding-bottom: 0;
  }

  .add-contact-btn {
    height: 36px;
    font-size: 12px;
    gap: 6px;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .empty-icon {
    width: 56px;
    height: 56px;

    svg {
      width: 28px;
      height: 28px;
    }
  }

  .empty-text {
    font-size: $font-size-sm;
  }

  .empty-hint {
    font-size: 12px;
  }

  .contact-items {
    padding: $spacing-sm;
    gap: $spacing-xs;
  }

  .contact-item {
    padding: $spacing-sm;
    gap: $spacing-sm;
  }

  .contact-avatar {
    width: 36px;
    height: 36px;
  }

  .avatar-placeholder {
    font-size: $font-size-base;
  }

  .contact-name {
    font-size: $font-size-sm;
  }

  .contact-sign {
    font-size: 12px;
  }

  .online-dot {
    width: 6px;
    height: 6px;
  }
}
</style>
