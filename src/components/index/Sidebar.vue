<template>
  <div class="sidebar">
    <!-- 用户卡片 -->
    <UserCard />

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button class="action-btn action-btn-secondary animate__animated animate__fadeInDown" style="--animate-duration: 0.4s; --animate-delay: 0.05s" @click="handleCreateRoom">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 8v8M8 12h8" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>创建房间</span>
      </button>
      
      <button class="action-btn action-btn-primary animate__animated animate__fadeInDown" style="--animate-duration: 0.4s; --animate-delay: 0.1s" @click="handleJoinRoom">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>加入房间</span>
      </button>
    </div>

    <!-- 标签切换 -->
    <div class="tab-switcher">
      <button 
        class="tab-btn animate__animated animate__fadeInUp" style="--animate-duration: 0.35s; --animate-delay: 0.1s"
        :class="{ 'tab-active': activeTab === 'contacts' }"
        @click="switchTab('contacts')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>联系人</span>
      </button>
      
      <button 
        class="tab-btn animate__animated animate__fadeInUp" style="--animate-duration: 0.35s; --animate-delay: 0.15s"
        :class="{ 'tab-active': activeTab === 'rooms' }"
        @click="switchTab('rooms')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>群聊</span>
      </button>
    </div>

    <!-- 列表区域 -->
    <div class="list-container">
      <Transition name="tab-fade" mode="out-in">
        <ContactList 
          v-if="activeTab === 'contacts'"
          :contacts="props.contacts"
          @select-contact="handleSelectContact"
          @add-contact="handleAddContact"
        />
        
        <RoomList 
          v-else
          :rooms="props.rooms"
          :active-room-id="props.activeRoomId"
          @select-room="handleSelectRoom"
        />
      </Transition>
    </div>

    <!-- 底部工具栏 -->
    <div class="sidebar-footer">
      <div class="footer-tools">
        <button 
          class="tool-btn animate__animated animate__fadeInUp" style="--animate-duration: 0.3s; --animate-delay: 0.15s"
          :class="{ 'tool-active': autoRefresh }"
          @click="toggleAutoRefresh"
          :title="autoRefresh ? '关闭自动刷新' : '开启自动刷新'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" :class="{ 'spin-slow': autoRefresh }">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <button 
          class="tool-btn animate__animated animate__fadeInUp" style="--animate-duration: 0.3s; --animate-delay: 0.18s"
          @click="handleManualRefresh"
          title="手动刷新"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M1 4v6h6M23 20v-6h-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <button 
          class="tool-btn animate__animated animate__fadeInUp" style="--animate-duration: 0.3s; --animate-delay: 0.21s"
          @click="toggleTheme"
          title="切换主题"
        >
          <svg v-if="!isDarkMode" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="5" stroke-width="2"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      
      <div class="footer-status animate__animated animate__fadeIn" style="--animate-duration: 0.4s; --animate-delay: 0.2s">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-width="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>加密连接</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserCard from './UserCard.vue'
import ContactList from './ContactList.vue'
import RoomList from './RoomList.vue'

interface Props {
  contacts?: any[]
  rooms?: any[]
  activeRoomId?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  contacts: () => [],
  rooms: () => [],
  activeRoomId: undefined
})

// 响应式状态
const activeTab = ref<'contacts' | 'rooms'>('rooms')
const autoRefresh = ref(true)
const isDarkMode = ref(false)

const emit = defineEmits<{
  createRoom: []
  joinRoom: []
  selectContact: [contact: any]
  selectRoom: [room: any]
  addContact: []
  toggleTheme: []
  refresh: []
}>()

// 方法
const switchTab = (tab: 'contacts' | 'rooms') => {
  activeTab.value = tab
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  emit('toggleTheme')
}

const handleCreateRoom = () => {
  emit('createRoom')
}

const handleJoinRoom = () => {
  emit('joinRoom')
}

const handleSelectContact = (contact: any) => {
  emit('selectContact', contact)
}

const handleSelectRoom = (room: any) => {
  emit('selectRoom', room)
}

const handleAddContact = () => {
  emit('addContact')
}

const handleManualRefresh = () => {
  emit('refresh')
}
</script>

<style lang="scss" scoped>
// 变量已通过 vite.config.ts 全局导入

.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: $bg-color-elevated;
  transition: background-color $transition-base;
}

.dark-mode .sidebar {
  background: $bg-color-elevated-dark;
}

// ==================== 操作按钮 ====================
.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-sm;
  padding: $spacing-md;
  border-bottom: 1px solid $border-light;
  transition: border-color $transition-base;
}

.dark-mode .action-buttons {
  border-color: $border-light-dark;
}

.action-btn {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  border: none;
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

  &:active {
    transform: scale(0.98);
  }
}

.action-btn-secondary {
  background: rgba($secondary-color, 0.1);
  color: $secondary-color;
  border: 1px solid rgba($secondary-color, 0.2);

  &:hover {
    background: rgba($secondary-color, 0.15);
    border-color: $secondary-color;
  }
}

.action-btn-primary {
  background: $primary-color;
  color: white;
  border: 1px solid $primary-color;

  &:hover {
    background: $primary-hover;
    border-color: $primary-hover;
  }
}

// ==================== 标签切换 ====================
.tab-switcher {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-xs;
  padding: $spacing-md;
  border-bottom: 1px solid $border-light;
  transition: border-color $transition-base;
}

.dark-mode .tab-switcher {
  border-color: $border-light-dark;
}

.tab-btn {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  background: transparent;
  color: $text-secondary;
  border: 1px solid transparent;
  border-radius: $border-radius-base;
  font-family: $font-family-heading;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-fast;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: rgba($primary-color, 0.05);
    color: $text-primary;
  }

  &.tab-active {
    background: rgba($primary-color, 0.1);
    color: $primary-color;
    border-color: rgba($primary-color, 0.2);
  }
}

.dark-mode .tab-btn {
  color: $text-secondary-dark;

  &:hover {
    color: $text-primary-dark;
  }
}

// ==================== 列表容器 ====================
.list-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

// 标签切换过渡动画
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: all 0.2s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// 自动刷新旋转动画
.spin-slow {
  animation: spin-slow 3s linear infinite;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// ==================== 底部工具栏 ====================
.sidebar-footer {
  border-top: 1px solid $border-light;
  padding: $spacing-md;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  transition: border-color $transition-base;
}

.dark-mode .sidebar-footer {
  border-color: $border-light-dark;
}

.footer-tools {
  display: flex;
  gap: $spacing-sm;
  justify-content: center;
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
  transition: all $transition-fast;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: rgba($primary-color, 0.1);
    color: $primary-color;
    border-color: rgba($primary-color, 0.2);
  }

  &.tool-active {
    background: rgba($primary-color, 0.1);
    color: $primary-color;
  }
}

.dark-mode .tool-btn {
  color: $text-tertiary-dark;
}

.footer-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-sm;
  background: rgba($success-color, 0.1);
  color: $success-color;
  border-radius: $border-radius-base;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;

  svg {
    width: 14px;
    height: 14px;
  }
}
// ==================== 移动端适配 ====================
@media (max-width: 768px) {
  .sidebar {
    width: 280px;
  }

  .action-buttons {
    padding: $spacing-sm;
    gap: $spacing-xs;
  }

  .action-btn {
    height: 36px;
    font-size: 12px;
    gap: 6px;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .tab-switcher {
    padding: $spacing-sm;
    gap: $spacing-xs;
  }

  .tab-btn {
    height: 32px;
    font-size: 12px;
    gap: 6px;

    svg {
      width: 14px;
      height: 14px;
    }
  }

  .sidebar-footer {
    padding: $spacing-sm;
    gap: $spacing-sm;
  }

  .tool-btn {
    width: 32px;
    height: 32px;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .footer-status {
    padding: 6px $spacing-sm;
    font-size: 11px;

    svg {
      width: 12px;
      height: 12px;
    }
  }
}
</style>
