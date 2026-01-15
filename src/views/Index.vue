<template>
  <div class="chat-app" :class="{ 'dark-mode': isDarkMode }">
    <!-- 侧边栏 -->
    <aside class="chat-sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <Sidebar 
        :rooms="roomList"
        :contacts="contactList"
        :active-room-id="currentRoom?.id"
        @create-room="handleCreateRoom"
        @join-room="handleJoinRoom"
        @select-contact="handleSelectContact"
        @select-room="handleSelectRoom"
        @add-contact="handleAddContact"
        @toggle-theme="toggleTheme"
        @refresh="handleRefresh"
        @leave-room="handleLeaveRoomAction"
      />
    </aside>

    <!-- 移动端遮罩 -->
    <div 
      v-if="sidebarOpen" 
      class="mobile-overlay"
      @click="closeSidebar"
    ></div>

    <!-- 主聊天区域 -->
    <main class="chat-main">
      <!-- 聊天头部 -->
      <header class="chat-header">
        <button class="menu-btn" @click="toggleSidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 12h18M3 6h18M3 18h18" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <ChatHeader 
          :room-name="currentRoom?.name"
          :total-users="currentRoom?.totalUsers || 0"
          :online-users="currentRoom?.onlineUsers || 0"
          :ws-connected="wsConnected"
          :is-private-room="currentRoom?.isPrivate || false"
          :typing-users="typingUsers"
        />
      </header>

      <!-- 消息区域 -->
      <section class="messages-area">
        <MessageList 
          ref="messageListRef"
          :messages="messages"
          :loading="false"
          :has-more="false"
          :loading-more="false"
          @load-more="handleLoadMore"
        />
      </section>

      <!-- 输入区域 -->
      <footer class="input-area">
        <InputBar 
          :disabled="false"
          @send="handleSendMessage"
          @send-image="handleSendImage"
          @send-video="handleSendVideo"
          @send-file="handleSendFile"
          @start-recording="handleStartRecording"
          @stop-recording="handleStopRecording"
          @typing="handleTyping"
        />
      </footer>
    </main>

    <!-- 创建房间弹窗 -->
    <a-modal
      v-model:open="createRoomVisible"
      title="创建房间"
      :confirm-loading="createRoomLoading"
      @cancel="resetCreateRoomForm"
    >
      <a-form :model="createRoomForm" layout="vertical" class="compact-form">
        <a-form-item label="房间名称" required>
          <a-input v-model:value="createRoomForm.name" placeholder="请输入房间名称" :maxlength="20" show-count />
        </a-form-item>
        <a-form-item label="房间简介">
          <a-textarea v-model:value="createRoomForm.description" placeholder="请输入房间简介（可选）" :maxlength="100" show-count :rows="2" />
        </a-form-item>
        <a-form-item label="房间密码" class="mb-0">
          <a-input-password v-model:value="createRoomForm.password" placeholder="设置密码后为私密房间（可选）" :maxlength="20" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="resetCreateRoomForm">
          <font-awesome-icon :icon="['fas', 'times']" style="margin-right: 6px" />
          取消
        </a-button>
        <a-button type="primary" :loading="createRoomLoading" @click="submitCreateRoom">
          <font-awesome-icon :icon="['fas', 'plus']" style="margin-right: 6px" />
          创建
        </a-button>
      </template>
    </a-modal>

    <!-- 加入房间弹窗 -->
    <a-modal
      v-model:open="joinRoomVisible"
      title="加入房间"
      :confirm-loading="joinRoomLoading"
      @cancel="resetJoinRoomForm"
    >
      <a-form :model="joinRoomForm" layout="vertical" class="compact-form">
        <a-form-item label="房间ID" required>
          <a-input v-model:value="joinRoomForm.roomId" placeholder="请输入房间ID" :maxlength="20" />
        </a-form-item>
        <a-form-item label="房间密码" class="mb-0">
          <a-input-password v-model:value="joinRoomForm.password" placeholder="私密房间需要输入密码（可选）" :maxlength="20" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="resetJoinRoomForm">
          <font-awesome-icon :icon="['fas', 'times']" style="margin-right: 6px" />
          取消
        </a-button>
        <a-button type="primary" :loading="joinRoomLoading" @click="submitJoinRoom">
          <font-awesome-icon :icon="['fas', 'arrow-right']" style="margin-right: 6px" />
          加入
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import Sidebar from '@/components/index/Sidebar.vue'
import ChatHeader from '@/components/index/ChatHeader.vue'
import MessageList from '@/components/index/MessageList.vue'
import InputBar from '@/components/index/InputBar.vue'
import { getUserRooms, createRoom, joinRoom, leaveRoom } from '@/apis/room'
import type { CreateRoomParams, JoinRoomParams } from '@/apis/room'

// 消息列表引用
const messageListRef = ref<InstanceType<typeof MessageList>>()

// 消息ID计数器
let messageIdCounter = 100

// 响应式状态
const isDarkMode = ref(false)
const sidebarOpen = ref(false)
const wsConnected = ref(true)
const typingUsers = ref<any[]>([])

// 从localStorage恢复上次选中的房间ID
const savedRoomId = localStorage.getItem('currentRoomId')
const currentRoom = ref<any>(savedRoomId ? null : {
  id: 1,
  name: '测试房间',
  description: '这是一个测试房间',
  totalUsers: 15,
  onlineUsers: 8,
  isPrivate: true
})

// 房间列表
const roomList = ref<any[]>([])

// 联系人列表虚拟数据
const contactList = ref([
  { id: 1, nickname: '张三', avatar: '', sign: '今天天气不错', online: true },
  { id: 2, nickname: '李四', avatar: '', sign: '忙碌中...', online: false }
])

// 加载用户房间列表
const loadUserRooms = async () => {
  try {
    const result = await getUserRooms()
    if (result.code === 0) {
      roomList.value = result.data || []
      
      // 恢复上次选中的房间
      const savedRoomId = localStorage.getItem('currentRoomId')
      if (savedRoomId && roomList.value.length > 0) {
        const savedRoom = roomList.value.find(r => r.id == savedRoomId)
        if (savedRoom) {
          currentRoom.value = {
            ...savedRoom,
            totalUsers: 15,
            onlineUsers: 8,
            isPrivate: savedRoom.private === 1
          }
        }
      }
    }
  } catch (error) {
    console.error('加载房间列表失败:', error)
  }
}

// 页面加载时获取房间列表
onMounted(() => {
  loadUserRooms()
})

const messages = ref<any[]>([
  { id: 1, type: 'system', text: '欢迎来到聊天室', time: new Date(), isOwn: false },
  { id: 2, type: 'text', text: '大家好！', time: new Date(), isOwn: false, sender: { nickname: '用户A', avatar: '' }, username: '用户A' },
  { id: 3, type: 'text', text: '你好，很高兴认识大家', time: new Date(), isOwn: true, sender: { nickname: '我', avatar: '' }, username: '我', status: 'read', readCount: 5 },
  { id: 4, type: 'text', text: '这条消息已送达', time: new Date(), isOwn: true, sender: { nickname: '我', avatar: '' }, username: '我', status: 'delivered' },
  { id: 5, type: 'text', text: '这条消息刚发送', time: new Date(), isOwn: true, sender: { nickname: '我', avatar: '' }, username: '我', status: 'sent' },
  { id: 6, type: 'text', text: '这条消息正在发送中...', time: new Date(), isOwn: true, sender: { nickname: '我', avatar: '' }, username: '我', status: 'sending' },
  { id: 7, type: 'text', text: '这条消息发送失败了', time: new Date(), isOwn: true, sender: { nickname: '我', avatar: '' }, username: '我', status: 'failed' },
  { id: 8, type: 'text', text: '这是一条比较长的消息，用来测试气泡的换行效果。Swiss Modernism 2.0 风格强调简洁、清晰和功能性。', time: new Date(), isOwn: false, sender: { nickname: '设计师', avatar: '' }, username: '设计师' },
  { id: 9, type: 'text', text: '测试消息 9', time: new Date(), isOwn: false, sender: { nickname: '用户B', avatar: '' }, username: '用户B' },
  { id: 10, type: 'text', text: '测试消息 10', time: new Date(), isOwn: true, sender: { nickname: '我', avatar: '' }, username: '我', status: 'read', readCount: 3 },
  { id: 11, type: 'text', text: '测试消息 11 - 这是另一条消息', time: new Date(), isOwn: false, sender: { nickname: '用户C', avatar: '' }, username: '用户C' },
  { id: 12, type: 'text', text: '测试消息 12', time: new Date(), isOwn: true, sender: { nickname: '我', avatar: '' }, username: '我', status: 'sent' },
  { id: 13, type: 'text', text: '测试消息 13 - 继续测试滚动', time: new Date(), isOwn: false, sender: { nickname: '用户A', avatar: '' }, username: '用户A' },
  { id: 14, type: 'text', text: '测试消息 14', time: new Date(), isOwn: true, sender: { nickname: '我', avatar: '' }, username: '我', status: 'read', readCount: 2 },
  { id: 15, type: 'text', text: '测试消息 15 - 滚动测试', time: new Date(), isOwn: false, sender: { nickname: '用户B', avatar: '' }, username: '用户B' },
  { id: 16, type: 'text', text: '测试消息 16', time: new Date(), isOwn: true, sender: { nickname: '我', avatar: '' }, username: '我', status: 'sent' },
  { id: 17, type: 'text', text: '测试消息 17 - 更多内容', time: new Date(), isOwn: false, sender: { nickname: '用户C', avatar: '' }, username: '用户C' },
  { id: 18, type: 'text', text: '测试消息 18', time: new Date(), isOwn: true, sender: { nickname: '我', avatar: '' }, username: '我', status: 'read', readCount: 4 },
  { id: 19, type: 'text', text: '测试消息 19 - 快到底部了', time: new Date(), isOwn: false, sender: { nickname: '用户A', avatar: '' }, username: '用户A' },
  { id: 20, type: 'text', text: '测试消息 20 - 最后一条消息', time: new Date(), isOwn: true, sender: { nickname: '我', avatar: '' }, username: '我', status: 'sent' },
  { id: 21, type: 'text', text: '测试消息 21', time: new Date(), isOwn: false, sender: { nickname: '用户B', avatar: '' }, username: '用户B' },
  { id: 22, type: 'text', text: '测试消息 22', time: new Date(), isOwn: true, sender: { nickname: '我', avatar: '' }, username: '我', status: 'sent' },
  { id: 23, type: 'text', text: '测试消息 23', time: new Date(), isOwn: false, sender: { nickname: '用户C', avatar: '' }, username: '用户C' },
  { id: 24, type: 'text', text: '测试消息 24', time: new Date(), isOwn: true, sender: { nickname: '我', avatar: '' }, username: '我', status: 'sent' },
  { id: 25, type: 'text', text: '测试消息 25 - 最后', time: new Date(), isOwn: false, sender: { nickname: '用户A', avatar: '' }, username: '用户A' }
])

// ==================== 创建房间 ====================
const createRoomVisible = ref(false)
const createRoomLoading = ref(false)
const createRoomForm = reactive({
  name: '',
  description: '',
  password: ''
})

const handleCreateRoom = () => {
  createRoomVisible.value = true
}

const resetCreateRoomForm = () => {
  createRoomForm.name = ''
  createRoomForm.description = ''
  createRoomForm.password = ''
}

const submitCreateRoom = async () => {
  if (!createRoomForm.name.trim()) {
    message.warning('请输入房间名称')
    return
  }
  
  createRoomLoading.value = true
  try {
    const params: CreateRoomParams = {
      name: createRoomForm.name.trim(),
      description: createRoomForm.description.trim(),
    }
    
    if (createRoomForm.password.trim()) {
      params.password = createRoomForm.password.trim()
    }
    
    const result = await createRoom(params)
    if (result.code === 0) {
      message.success('房间创建成功')
      createRoomVisible.value = false
      resetCreateRoomForm()
      // 刷新房间列表
      await loadUserRooms()
    } else {
      message.error(result.msg || '创建房间失败')
    }
  } catch (error: any) {
    message.error(error.message || '创建房间失败')
  } finally {
    createRoomLoading.value = false
  }
}

// ==================== 加入房间 ====================
const joinRoomVisible = ref(false)
const joinRoomLoading = ref(false)
const joinRoomForm = reactive({
  roomId: '',
  password: ''
})

const handleJoinRoom = () => {
  joinRoomVisible.value = true
}

const resetJoinRoomForm = () => {
  joinRoomForm.roomId = ''
  joinRoomForm.password = ''
}

const submitJoinRoom = async () => {
  if (!joinRoomForm.roomId.trim()) {
    message.warning('请输入房间ID')
    return
  }
  
  joinRoomLoading.value = true
  try {
    const params: JoinRoomParams = {
      room_id: parseInt(joinRoomForm.roomId.trim())
    }
    
    if (joinRoomForm.password.trim()) {
      params.password = joinRoomForm.password.trim()
    }
    
    const result = await joinRoom(params)
    if (result.code === 0) {
      message.success('加入房间成功')
      joinRoomVisible.value = false
      resetJoinRoomForm()
      // 刷新房间列表
      await loadUserRooms()
    } else {
      message.error(result.msg || '加入房间失败')
    }
  } catch (error: any) {
    message.error(error.message || '加入房间失败')
  } finally {
    joinRoomLoading.value = false
  }
}

// 方法
const toggleSidebar = () => { sidebarOpen.value = !sidebarOpen.value }
const closeSidebar = () => { sidebarOpen.value = false }
const toggleTheme = () => { isDarkMode.value = !isDarkMode.value }
const handleSelectContact = (contact: any) => { console.log('选择联系人:', contact) }
const handleSelectRoom = (room: any) => { 
  currentRoom.value = {
    ...room,
    totalUsers: 15,
    onlineUsers: 8,
    isPrivate: room.private === 1
  }
  // 保存到localStorage
  localStorage.setItem('currentRoomId', room.id)
  closeSidebar()
}
const handleAddContact = () => { console.log('添加联系人') }
const handleRefresh = () => { loadUserRooms() }

// 退出房间
const handleLeaveRoomAction = async (room: any) => {
  try {
    const result = await leaveRoom(room.id)
    if (result.code === 0) {
      message.success('已退出房间')
      // 刷新房间列表
      await loadUserRooms()
      // 如果退出的是当前房间，清空当前房间
      if (currentRoom.value?.id === room.id) {
        currentRoom.value = null
      }
    } else {
      message.error(result.msg || '退出房间失败')
    }
  } catch (error: any) {
    message.error(error.message || '退出房间失败')
  }
}

const handleLoadMore = () => { console.log('加载更多消息') }

// 发送消息
const handleSendMessage = (text: string) => {
  const newMessage = {
    id: ++messageIdCounter,
    type: 'text' as const,
    text,
    time: new Date(),
    isOwn: true,
    sender: { nickname: '我', avatar: '' },
    username: '我',
    status: 'sending' as const,
    isNew: true // 标记为新消息，用于触发动画
  }
  
  messages.value.push(newMessage)
  
  // 滚动到底部
  nextTick(() => {
    messageListRef.value?.scrollToBottom(true)
  })
  
  // 模拟发送过程
  setTimeout(() => {
    const msg = messages.value.find(m => m.id === newMessage.id)
    if (msg) {
      msg.status = 'sent'
      msg.isNew = false
    }
  }, 800)
}
const handleSendImage = (file: File) => { console.log('发送图片:', file) }
const handleSendVideo = (file: File) => { console.log('发送视频:', file) }
const handleSendFile = (file: File) => { console.log('发送文件:', file) }
const handleStartRecording = () => { console.log('开始录音') }
const handleStopRecording = () => { console.log('停止录音') }
const handleTyping = () => {}
</script>

<style lang="scss" scoped>
// 变量已通过 vite.config.ts 全局导入

// 主容器 - 使用固定定位占满整个视口
.chat-app {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  background: $bg-color-page;
  font-family: $font-family-body;
  color: $text-primary;
  overflow: hidden;
}

// 深色模式
.chat-app.dark-mode {
  background: $bg-color-page-dark;
  color: $text-primary-dark;

  .chat-sidebar {
    background: $bg-color-elevated-dark;
    border-color: $border-base-dark;
  }

  .chat-main {
    background: $bg-color-dark;
  }

  .chat-header {
    background: $bg-color-elevated-dark;
    border-color: $border-base-dark;
  }

  .input-area {
    background: $bg-color-elevated-dark;
    border-color: $border-base-dark;
  }

  // 深色模式 - 消息列表区域
  :deep(.message-list) {
    background-color: $bg-color-dark;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");

    &::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.4);
    }
  }

  :deep(.loading-state) {
    color: $text-tertiary-dark;
  }

  :deep(.empty-text) {
    color: $text-primary-dark;
  }

  :deep(.empty-hint) {
    color: $text-tertiary-dark;
  }

  :deep(.load-more-btn) {
    background: rgba($primary-color, 0.15);
    border-color: rgba($primary-color, 0.3);
  }

  // 深色模式 - 消息气泡
  :deep(.msg-bubble) {
    background: $bg-bubble-dark;
    color: $text-primary-dark;

    &.msg-bubble-own {
      background: $primary-color;
      color: white;
    }
  }

  :deep(.system-badge) {
    background: rgba($text-tertiary-dark, 0.15);
    color: $text-tertiary-dark;
  }

  :deep(.msg-sender),
  :deep(.msg-time),
  :deep(.msg-meta-own) {
    color: $text-tertiary-dark;
  }

  :deep(.file-message) {
    background: $bg-bubble-dark;
    border-color: $border-base-dark;
  }

  :deep(.file-name) {
    color: $text-primary-dark;
  }

  :deep(.file-size) {
    color: $text-tertiary-dark;
  }

  // 深色模式 - 输入栏
  :deep(.tool-btn) {
    color: $text-tertiary-dark;

    &:hover:not(:disabled) {
      background: rgba($primary-color, 0.15);
      border-color: rgba($primary-color, 0.3);
    }
  }

  :deep(.text-input) {
    background: $bg-color-dark;
    color: $text-primary-dark;
    border-color: $border-base-dark;

    &::placeholder {
      color: $text-placeholder-dark;
    }

    &:focus {
      box-shadow: 0 0 0 3px rgba($primary-color, 0.15);
    }
  }

  :deep(.emoji-btn) {
    color: $text-tertiary-dark;

    &:hover:not(:disabled) {
      background: rgba($primary-color, 0.15);
    }
  }

  :deep(.attach-menu) {
    background: $bg-color-elevated-dark;
    border-color: $border-base-dark;
    box-shadow: $box-shadow-lg-dark;
  }

  :deep(.attach-item) {
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
}

// 侧边栏
.chat-sidebar {
  width: 320px;
  height: 100%;
  background: $bg-color-elevated;
  border-right: 1px solid $border-base;
  flex-shrink: 0;
  overflow: hidden;
}

// 主聊天区域 - 关键的flex布局
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  background: $bg-color;
}

// 聊天头部 - 固定高度
.chat-header {
  flex: 0 0 56px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
  background: $bg-color-elevated;
  border-bottom: 1px solid $border-base;
}

.menu-btn {
  display: none;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: $text-secondary;
  cursor: pointer;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:active {
    background: rgba($primary-color, 0.1);
  }

  svg {
    width: 22px;
    height: 22px;
  }
}

// 深色模式 - 菜单按钮
.chat-app.dark-mode .menu-btn {
  color: $text-secondary-dark;
  
  &:active {
    background: rgba($primary-color, 0.15);
  }
}

// 消息区域 - 占据剩余空间，内部滚动
.messages-area {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

// 输入区域 - 固定高度
.input-area {
  flex: 0 0 auto;
  padding: 12px 16px;
  background: $bg-color-elevated;
  border-top: 1px solid $border-base;
  position: relative;
}

// 移动端遮罩
.mobile-overlay {
  display: none;
}

// 紧凑表单样式
:deep(.compact-form) {
  .ant-form-item {
    margin-bottom: 12px;
  }
  
  &.mb-0,
  .mb-0 {
    margin-bottom: 0;
  }
}

// 移动端适配
@media (max-width: 1024px) {
  .chat-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 85%;
    max-width: 300px;
    transform: translateX(-100%);
    z-index: 1000;
    transition: transform 0.25s ease;

    &.sidebar-open {
      transform: translateX(0);
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
    }
  }

  .menu-btn {
    display: flex;
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 999;
  }

  .chat-header {
    padding: 0 8px;
  }

  .input-area {
    padding: 8px;
  }
}
</style>
