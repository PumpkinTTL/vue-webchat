<template>
  <div class="chat-app">
    <!-- 侧边栏 -->
    <aside class="chat-sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <Sidebar :rooms="roomList" :contacts="contactList" :active-room-id="currentRoom?.id"
        @create-room="handleCreateRoom" @join-room="handleJoinRoom" @select-contact="handleSelectContact"
        @select-room="handleSelectRoom" @add-contact="handleAddContact" @toggle-theme="toggleTheme"
        @refresh="handleRefresh" @leave-room="handleLeaveRoomAction" />
    </aside>

    <!-- 移动端遮罩 -->
    <div v-if="sidebarOpen" class="mobile-overlay" @click="closeSidebar"></div>

    <!-- 主聊天区域 -->
    <main class="chat-main">
      <!-- 聊天头部 -->
      <header class="chat-header">
        <button class="menu-btn" @click="toggleSidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 12h18M3 6h18M3 18h18" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
        <ChatHeader :room-name="currentRoom?.name" :total-users="currentRoom?.totalUsers || 0"
          :online-users="currentRoom?.onlineUsers || 0" :ws-connected="wsConnected"
          :is-private-room="currentRoom?.isPrivate || false" :typing-users="typingUsers"
          :is-locked="currentRoom?.lock === 1" :intimacy-info="intimacyStore.currentIntimacy"
          :show-floating-hearts="showFloatingHearts" :hearts-animation-key="heartsAnimationKey"
          @toggle-intimacy-panel="handleToggleIntimacyPanel" />
        
        <!-- 亲密度面板 -->
        <IntimacyPanel :visible="showIntimacyPanel" :intimacy-info="intimacyStore.currentIntimacy"
          :levels="intimacyStore.levels" :interaction="intimacyStore.interaction" :current-user="userStore.userInfo"
          :partner="intimacyPartner" @close="handleCloseIntimacyPanel"
          @toggle-exp-toast="handleToggleExpToast" @toggle-bond-effect="handleToggleBondEffect" />
      </header>

      <!-- 消息区域 -->
      <section class="messages-area">
        <MessageList ref="messageListRef" :messages="messages" :loading="messagesLoading" :has-more="hasMoreMessages"
          :loading-more="loadingMoreMessages" :upload-progress="uploadProgress" :has-reply="!!replyToMessage"
          @load-more="handleLoadMore" @reply="handleReplyMessage" @burn="handleBurnMessage" @edit="handleEditMessage"
          @scroll-change="handleScrollChange" />

        <!-- 新消息提示按钮 -->
        <Transition name="new-msg-fade">
          <button v-if="newMessageCount > 0" class="new-message-tip" @click="handleScrollToNewMessage">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 5v14M19 12l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>{{ newMessageCount }} 条新消息</span>
          </button>
        </Transition>
      </section>

      <!-- 输入区域 -->
      <footer class="input-area">
        <InputBar ref="inputBarRef" :disabled="isInputDisabled" :reply-to="replyToMessage" :is-admin="userStore.isAdmin"
          :current-room="currentRoom" :deleted-count="deletedCount" @send="handleSendMessage"
          @send-image="handleSendImage" @send-video="handleSendVideo" @send-file="handleSendFile"
          @start-recording="handleStartRecording" @stop-recording="handleStopRecording" @typing="handleTyping"
          @cancel-reply="handleCancelReply" @toggle-lock="handleToggleLock" @clear-room="handleClearRoom"
          @restore-room="handleRestoreRoom" />
      </footer>
    </main>



    <!-- 创建房间弹窗 -->
    <a-modal v-model:open="createRoomVisible" title="创建房间" :confirm-loading="createRoomLoading"
      @cancel="resetCreateRoomForm">
      <a-form :model="createRoomForm" layout="vertical" class="compact-form">
        <a-form-item label="房间名称" required>
          <a-input v-model:value="createRoomForm.name" placeholder="请输入房间名称" :maxlength="20" show-count
            autocomplete="off" />
        </a-form-item>
        <a-form-item label="房间简介">
          <a-textarea v-model:value="createRoomForm.description" placeholder="请输入房间简介（可选）" :maxlength="100" show-count
            :rows="2" autocomplete="off" />
        </a-form-item>
        <a-form-item label="房间密码" class="mb-0">
          <a-input-password v-model:value="createRoomForm.password" placeholder="设置密码后为私密房间（可选）" :maxlength="20"
            autocomplete="new-password" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="resetCreateRoomForm">
          <font-awesome-icon :icon="['fas', 'times']" style="margin-right: 6px" />
          取消
        </a-button>
        <a-button type="primary" :loading="createRoomLoading" @click="submitCreateRoom">
          <font-awesome-icon :icon="['fas', 'check']" style="margin-right: 6px" />
          确定
        </a-button>
      </template>
    </a-modal>

    <!-- 加入房间弹窗 -->
    <a-modal v-model:open="joinRoomVisible" title="加入房间" :confirm-loading="joinRoomLoading" @cancel="resetJoinRoomForm">
      <a-form :model="joinRoomForm" layout="vertical" class="compact-form">
        <a-form-item label="房间ID" required>
          <a-input v-model:value="joinRoomForm.roomId" placeholder="请输入房间ID" :maxlength="20" autocomplete="off" />
        </a-form-item>
        <a-form-item label="房间密码" class="mb-0">
          <a-input-password v-model:value="joinRoomForm.password" placeholder="私密房间需要输入密码（可选）" :maxlength="20"
            autocomplete="off" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="resetJoinRoomForm">
          <font-awesome-icon :icon="['fas', 'times']" style="margin-right: 6px" />
          取消
        </a-button>
        <a-button type="primary" :loading="joinRoomLoading" @click="submitJoinRoom">
          <font-awesome-icon :icon="['fas', 'check']" style="margin-right: 6px" />
          确定
        </a-button>
      </template>
    </a-modal>

    <!-- 编辑消息弹窗 -->
    <a-modal v-model:open="editMessageVisible" title="编辑消息" :confirm-loading="editMessageLoading"
      @ok="submitEditMessage" @cancel="resetEditMessageForm">
      <a-form :model="editMessageForm" layout="vertical" class="compact-form">
        <a-form-item label="消息内容" required>
          <a-textarea v-model:value="editMessageForm.content" placeholder="请输入消息内容" :maxlength="10000" show-count
            :rows="4" autocomplete="off" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="resetEditMessageForm">
          <font-awesome-icon :icon="['fas', 'times']" style="margin-right: 6px" />
          取消
        </a-button>
        <a-button type="primary" :loading="editMessageLoading" @click="submitEditMessage">
          <font-awesome-icon :icon="['fas', 'check']" style="margin-right: 6px" />
          确定
        </a-button>
      </template>
    </a-modal>
  </div>

  <!-- 亲密度升级弹窗 -->
  <IntimacyLevelUpModal :visible="intimacyStore.showLevelUpModal" :level-up-data="intimacyStore.levelUpData"
    @close="intimacyStore.closeLevelUp" />

  <!-- 经验获得提示 -->
  <IntimacyExpTip :tips="intimacyStore.expTips" />

  <!-- 羁绊上线提醒 -->
  <IntimacyBondNotification 
    :visible="showBondNotification"
    :current-user="userStore.userInfo"
    :partner="intimacyPartner"
    :intimacy-color="intimacyStore.currentIntimacy?.level_color || '#ec4899'"
    :intimacy-level="intimacyStore.currentIntimacy?.current_level || 1"
    :level-name="intimacyStore.currentIntimacy?.level_name || '恋人'"
    @close="handleCloseBondNotification"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import Sidebar from '@/components/index/Sidebar.vue'
import ChatHeader from '@/components/index/ChatHeader.vue'
import MessageList from '@/components/index/MessageList.vue'
import InputBar from '@/components/index/InputBar.vue'
import IntimacyPanel from '@/components/intimacy/IntimacyPanel.vue'
import IntimacyLevelUpModal from '@/components/intimacy/IntimacyLevelUpModal.vue'
import IntimacyExpTip from '@/components/intimacy/IntimacyExpTip.vue'
import IntimacyBondNotification from '@/components/intimacy/IntimacyBondNotification.vue'
import { getUserRooms, createRoom, joinRoom, leaveRoom, getRoomUserCount, toggleRoomLock as toggleRoomLockApi, clearRoomMessages, restoreRoomMessages, getDeletedMessagesCount } from '@/apis/room'
import { getMessageList, sendTextMessage, sendImageMessage, sendVideoMessage, sendFileMessage, editMessage } from '@/apis/message'
import type { CreateRoomParams, JoinRoomParams } from '@/apis/room'
import { useChat } from '@/composables/useChat'
import { useDarkMode } from '@/composables/useDarkMode'
import { useUserStore } from '@/store/user'
import { useIntimacyStore } from '@/store/intimacy'
import type { ChatMessageItem } from '@/store/chat'

// 使用用户 store
const userStore = useUserStore()

// 使用亲密度 store
const intimacyStore = useIntimacyStore()

// 使用深色模式 composable
const { toggle: toggleDarkMode } = useDarkMode()

// 使用聊天组合式函数
const { wsStore, chatStore, initChat, destroyChat, enterRoom, broadcastMessage, sendTyping, toggleRoomLock, clearRoomMessages: broadcastClearRoom, restoreRoomMessages: broadcastRestoreRoom } = useChat()

// 消息列表引用
const messageListRef = ref<InstanceType<typeof MessageList>>()

// 输入栏引用
const inputBarRef = ref<InstanceType<typeof InputBar>>()

// 响应式状态
const sidebarOpen = ref(false)

// 亲密度面板状态
const showIntimacyPanel = ref(false)

// 爱心飘出动画状态
const showFloatingHearts = ref(false)
const heartsAnimationKey = ref(0)

// 羁绊上线提醒状态
const showBondNotification = ref(false)
let bondNotificationTimer: ReturnType<typeof setTimeout> | null = null
// 记录已显示过羁绊连接通知的房间（会话级别，刷新清空）
const shownBondNotificationRooms = new Set<number>()

// 触发爱心飘出动画（只在两人都在线时触发）
const triggerFloatingHearts = () => {
  if (!currentRoom.value?.isPrivate || !intimacyStore.currentIntimacy) return
  
  // 只有两人都在线时才触发动画
  if (currentRoom.value.totalUsers !== 2 || currentRoom.value.onlineUsers !== 2) return
  
  showFloatingHearts.value = true
  heartsAnimationKey.value++
  
  // 1.2秒后隐藏动画（与CSS动画时长一致）
  setTimeout(() => {
    showFloatingHearts.value = false
  }, 1200)
}

// 亲密度伴侣信息（从store获取）
const intimacyPartner = computed(() => {
  if (!intimacyStore.partnerUser) return undefined
  
  return {
    name: intimacyStore.partnerUser.nick_name,
    avatar: intimacyStore.partnerUser.avatar
  }
})

// WebSocket 连接状态
const wsConnected = computed(() => wsStore.isConnected)

// 正在输入的用户列表
const typingUsers = computed(() => wsStore.typingUserList)

// 当前房间
const currentRoom = ref<any>(null)

// 消息列表 - 使用 chatStore 的消息
const messages = computed(() => chatStore.messages)

// 房间列表
const roomList = ref<any[]>([])

// 联系人列表虚拟数据
const contactList = ref([
  { id: 1, nickname: '张三', avatar: '', sign: '今天天气不错', online: true },
  { id: 2, nickname: '李四', avatar: '', sign: '忙碌中...', online: false }
])

// 消息加载状态
const messagesLoading = ref(false)
const hasMoreMessages = ref(false)
const loadingMoreMessages = ref(false)
const currentPage = ref(1)

// 引用回复状态
const replyToMessage = ref<any>(null)

// 输入状态防抖
let typingTimer: ReturnType<typeof setTimeout> | null = null

// 上传进度管理
const uploadProgress = ref<Record<string, number>>({})

// 房间管理状态
const deletedCount = ref(0) // 软删除消息数量

// 是否禁用输入（房间锁定且非管理员）
const isInputDisabled = computed(() => {
  if (!currentRoom.value) return false
  if (userStore.isAdmin) return false // 管理员不受限制
  // 直接使用 chatStore 的锁定状态，它会被 WebSocket 实时更新
  return chatStore.currentRoom?.isLocked ?? false
})

// ==================== 生命周期 ====================

onMounted(async () => {
  // 初始化用户信息
  userStore.initUserInfo()

  // 初始化 WebSocket
  initChat()

  // 加载亲密度等级配置
  await intimacyStore.loadLevels()

  // 覆盖 onRoomCleared 处理，添加重新加载消息的逻辑
  wsStore.setOnRoomCleared((data) => {
    if (data.is_restore) {
      // 恢复消息：显示提示并重新加载
      message.loading(`${data.cleared_by_nickname} 恢复数据正在刷新...`, 0)
      chatStore.addSystemMessage(`${data.cleared_by_nickname} 恢复了消息`)
      // 重新加载当前房间的消息
      if (currentRoom.value?.id) {
        loadRoomMessages(currentRoom.value.id).then(() => {
          message.destroy()
          message.success('数据刷新完成')
        }).catch(() => {
          message.destroy()
          message.error('数据刷新失败')
        })
      }
    } else {
      // 清理消息：清空列表
      chatStore.clearMessages()
      chatStore.addSystemMessage(`${data.cleared_by_nickname} 清空了聊天记录`)
    }
  })

  // 监听亲密度互动事件
  wsStore.setOnIntimacyStart(() => {
    console.log('[亲密度] 互动开始')
    intimacyStore.startInteraction()
  })

  wsStore.setOnIntimacyComplete((data) => {
    console.log('[亲密度] 互动完成，服务器已增加经验')
    // 服务器已经增加了经验，直接更新本地状态
    intimacyStore.completeInteraction()
    
    // 如果服务器返回了经验信息，更新本地亲密度
    if (data.exp_gain && data.intimacy) {
      console.log('[亲密度] 收到服务器经验数据:', data.exp_gain, data.intimacy)
      intimacyStore.updateIntimacyFromServer(data.intimacy, data.exp_gain)
    }
    
    // 自动通知服务器重启计时
    if (currentRoom.value?.id) {
      console.log('[亲密度] 通知服务器重启计时')
      wsStore.restartIntimacy(currentRoom.value.id)
    }
  })

  wsStore.setOnIntimacyReset(() => {
    console.log('[亲密度] 收到服务器重置信号，自动重启计时')
    // 重置倒计时状态（不隐藏组件）
    intimacyStore.resetInteraction()
    // 自动重启计时（如果是私密房间且两人在线）
    if (currentRoom.value?.isPrivate && currentRoom.value?.onlineUsers >= 2) {
      intimacyStore.startInteraction()
    }
  })

  // 监听WebSocket消息，更新亲密度信息
  wsStore.setOnMessage((data) => {
    // 如果消息包含亲密度信息，更新store并触发动画
    if (data.intimacy && currentRoom.value?.isPrivate) {
      console.log('[亲密度] WebSocket收到更新:', data.intimacy)
      intimacyStore.updateIntimacyFromMessage(data.intimacy)
      
      // 如果是别人发送的消息，也触发爱心动画
      if (data.from_user_id !== userStore.userInfo?.id) {
        triggerFloatingHearts()
      }
    }
    
    // 调用原有的消息处理逻辑
    if (wsStore.currentUserId) {
      chatStore.handleWsMessage(data, wsStore.currentUserId)
    }
  })

  // 监听 room_joined 事件，直接更新当前房间的在线人数
  wsStore.setOnRoomJoined((roomId, users) => {
    console.log('[房间加入] room_joined 事件 - roomId:', roomId, 'users:', users.length, 'currentRoom:', currentRoom.value?.id)
    
    // 更新 chatStore
    chatStore.updateRoomOnlineCount(users.length)
    
    // 直接更新 currentRoom 的在线人数（解决 watch 不触发的问题）
    if (currentRoom.value && currentRoom.value.id === roomId) {
      const previousOnline = currentRoom.value.onlineUsers
      currentRoom.value.onlineUsers = users.length
      console.log('[房间加入] 更新在线人数:', previousOnline, '->', users.length)
      
      // 如果是私密房间且有亲密度信息，检查是否需要启动互动
      if (currentRoom.value.isPrivate && 
          intimacyStore.currentIntimacy && 
          currentRoom.value.totalUsers === 2) {
        
        // 对方上线（从1变成2）：启动亲密度互动
        if (previousOnline === 1 && users.length === 2) {
          console.log('[亲密度] room_joined 检测到对方上线，启动互动')
          intimacyStore.startInteraction()
          
          // 显示羁绊通知
          if (!shownBondNotificationRooms.has(roomId)) {
            console.log('[羁绊通知] room_joined 准备显示通知')
            const showBondEffect = localStorage.getItem('intimacy_show_bond_effect')
            if (showBondEffect !== '0') {
              if (bondNotificationTimer) {
                clearTimeout(bondNotificationTimer)
              }
              bondNotificationTimer = setTimeout(() => {
                console.log('[羁绊通知] 显示通知')
                showBondNotification.value = true
                shownBondNotificationRooms.add(roomId)
              }, 500)
            }
          }
        }
        
        // 对方离线（从2变成1）：重置互动
        if (previousOnline === 2 && users.length === 1) {
          console.log('[亲密度] room_joined 检测到对方离线，重置互动')
          intimacyStore.resetInteraction()
          shownBondNotificationRooms.delete(roomId)
        }
      }
    }
  })

  // 加载房间列表
  await loadUserRooms()
})

onUnmounted(() => {
  // 清理 WebSocket
  destroyChat()

  // 清理输入状态定时器
  if (typingTimer) {
    clearTimeout(typingTimer)
  }
})

// 监听 WebSocket 认证成功后自动加入房间
watch(() => wsStore.isAuthed, (isAuthed) => {
  if (isAuthed && currentRoom.value?.id) {
    enterRoom(currentRoom.value.id)
  }
})

// 监听房间锁定状态变化
watch(() => chatStore.currentRoom?.isLocked, (isLocked) => {
  if (currentRoom.value && isLocked !== undefined) {
    currentRoom.value.lock = isLocked ? 1 : 0
  }
})

// 监听房间在线人数变化（统一处理在线人数更新、亲密度互动、羁绊通知）
watch(() => wsStore.onlineCount, (count, oldCount) => {
  console.log('[房间] WebSocket在线人数变化:', count, '(旧值:', oldCount, ')')
  if (currentRoom.value) {
    const previousOnline = currentRoom.value.onlineUsers
    currentRoom.value.onlineUsers = count
    
    // 同步更新 chatStore 的在线人数
    if (chatStore.currentRoom) {
      chatStore.currentRoom.onlineUsers = count
    }
    
    // 如果是私密房间且有亲密度信息
    if (currentRoom.value.isPrivate && intimacyStore.currentIntimacy && currentRoom.value.totalUsers === 2) {
      // 对方上线（从1变成2）：启动亲密度互动
      if (previousOnline === 1 && count === 2) {
        console.log('[亲密度] 对方上线，启动互动')
        intimacyStore.startInteraction()
      }
      
      // 对方离线（从2变成1）：重置互动（不关闭面板）
      if (previousOnline === 2 && count === 1) {
        console.log('[亲密度] 对方离线，重置互动计时器')
        intimacyStore.resetInteraction()
        // 清除通知记录，以便对方再次上线时可以显示通知
        shownBondNotificationRooms.delete(currentRoom.value.id)
      }
    }
    
    // 检查是否应该显示羁绊上线提醒
    // 条件：私密房间 + 有亲密度 + 从1人变成2人（对方刚上线）+ 未显示过
    if (currentRoom.value.isPrivate && 
        intimacyStore.currentIntimacy && 
        currentRoom.value.totalUsers === 2 &&
        previousOnline === 1 && 
        count === 2 &&
        !shownBondNotificationRooms.has(currentRoom.value.id)) {
      
      console.log('[羁绊通知] 满足条件，准备显示通知')
      const showBondEffect = localStorage.getItem('intimacy_show_bond_effect')
      if (showBondEffect !== '0') {
        // 清除之前的定时器
        if (bondNotificationTimer) {
          clearTimeout(bondNotificationTimer)
        }
        // 延迟500ms显示，让爱心点亮动画先完成
        bondNotificationTimer = setTimeout(() => {
          console.log('[羁绊通知] 显示通知')
          showBondNotification.value = true
          // 标记这个房间已显示过通知
          shownBondNotificationRooms.add(currentRoom.value!.id)
        }, 500)
      } else {
        console.log('[羁绊通知] 用户已关闭羁绊特效')
      }
    }
  }
})

// 是否正在加载历史消息的标志
const isLoadingHistory = ref(false)

// 是否在底部（用于判断是否自动滚动）
const isAtBottom = ref(true)

// 新消息数量
const newMessageCount = ref(0)

// 监听新消息，滚动到底部（仅在非加载历史消息时且在底部时）
watch(() => chatStore.messages.length, (newLength, oldLength) => {
  // 只有在消息增加且不是加载历史消息时才处理
  if (newLength > oldLength && !isLoadingHistory.value) {
    // 获取新增的消息
    const newMessages = chatStore.messages.slice(oldLength)
    
    // 过滤掉系统消息和自己的消息
    const nonSystemMessages = newMessages.filter(msg => msg.type !== 'system' && !msg.isOwn)

    // 如果在底部，自动滚动
    if (isAtBottom.value) {
      nextTick(() => {
        messageListRef.value?.scrollToBottom(true)
      })
    } else {
      // 不在底部时的处理
      if (nonSystemMessages.length > 0) {
        // 别人的消息：增加新消息计数
        newMessageCount.value += nonSystemMessages.length
      }
      
      // 自己的消息：显示toast提示
      const ownMessages = newMessages.filter(msg => msg.type !== 'system' && msg.isOwn)
      if (ownMessages.length > 0) {
        message.success('发送成功，继续看历史记录吧！')
      }
    }

    // 对于别人的新消息，触发已读检测
    nextTick(() => {
      newMessages.forEach(msg => {
        if (!msg.isOwn && msg.type !== 'system' && msg.id) {
          messageListRef.value?.observeNewMessage(Number(msg.id))
        }
      })
    })
  }
})

// ==================== 房间列表 ====================

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
          await handleSelectRoom(savedRoom)
        }
      } else if (roomList.value.length > 0 && !currentRoom.value) {
        await handleSelectRoom(roomList.value[0])
      }
    }
  } catch (error) {
    console.error('加载房间列表失败:', error)
  }
}

// ==================== 消息加载 ====================

const loadRoomMessages = async (roomId: number) => {
  messagesLoading.value = true
  chatStore.clearMessages()
  currentPage.value = 1

  try {
    const result = await getMessageList(roomId, 1, 100)
    if (result.code === 0 && result.data) {
      const serverUrl = import.meta.env.VITE_SERVER_URL || ''

      // 后端已经格式化好了消息，直接映射字段
      const convertedMessages: ChatMessageItem[] = result.data.messages.map(msg => {
        // 映射消息类型：normal/reply -> text
        let msgType = msg.type
        if (msgType === 'normal' || msgType === 'reply') {
          msgType = 'text'
        }

        // 处理图片URL
        let imageUrl = msg.imageUrl
        if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('blob:')) {
          imageUrl = serverUrl + imageUrl
        }

        // 处理视频URL
        let videoUrl = msg.videoUrl
        if (videoUrl && !videoUrl.startsWith('http://') && !videoUrl.startsWith('https://') && !videoUrl.startsWith('blob:')) {
          videoUrl = serverUrl + videoUrl
        }

        // 处理视频缩略图URL
        let videoThumbnail = msg.videoThumbnail
        if (videoThumbnail && !videoThumbnail.startsWith('http://') && !videoThumbnail.startsWith('https://') && !videoThumbnail.startsWith('blob:')) {
          videoThumbnail = serverUrl + videoThumbnail
        }

        // 处理文件URL
        let fileUrl = msg.fileUrl
        if (fileUrl && !fileUrl.startsWith('http://') && !fileUrl.startsWith('https://') && !fileUrl.startsWith('blob:')) {
          fileUrl = serverUrl + fileUrl
        }

        // 处理头像URL
        let avatar = msg.sender?.avatar || ''
        if (avatar && !avatar.startsWith('http://') && !avatar.startsWith('https://') && !avatar.startsWith('blob:')) {
          avatar = serverUrl + avatar
        }

        return {
          id: msg.id,
          type: msgType as any,
          text: msg.text,
          time: new Date(msg.time),
          isOwn: msg.isOwn,
          sender: msg.sender ? {
            id: msg.sender.id,
            nickname: msg.sender.nickname || '未知用户',
            avatar: avatar
          } : undefined,
          username: msg.sender?.nickname,
          status: msg.isOwn ? 'sent' : undefined,
          readCount: msg.read_count || 0,
          // 图片
          imageUrl: imageUrl,
          // 视频
          videoUrl: videoUrl,
          videoThumbnail: videoThumbnail,
          videoDuration: msg.videoDuration,
          // 文件
          fileName: msg.fileName,
          fileSize: msg.fileSize,
          fileExtension: msg.fileExtension,
          fileUrl: fileUrl,
          // 引用
          replyTo: msg.reply_to,
          // 编辑
          edited: msg.edited || false,
          editedAt: msg.edited_at
        }
      })

      chatStore.setMessages(convertedMessages)
      hasMoreMessages.value = result.data.has_more

      // 滚动到底部
      nextTick(() => {
        messageListRef.value?.scrollToBottom(false)
      })
    }
  } catch (error) {
    console.error('加载消息失败:', error)
    message.error('加载消息失败')
  } finally {
    messagesLoading.value = false
  }
}

const handleLoadMore = async () => {
  if (loadingMoreMessages.value || !hasMoreMessages.value || !currentRoom.value?.id) {
    return
  }

  loadingMoreMessages.value = true
  isLoadingHistory.value = true // 设置标志位

  // 记录加载前的滚动高度
  const container = messageListRef.value?.$el as HTMLElement
  const oldScrollHeight = container?.scrollHeight || 0

  try {
    // 使用page分页，不传lastTime
    currentPage.value++
    const result = await getMessageList(currentRoom.value.id, currentPage.value, 100)
    if (result.code === 0 && result.data) {
      const serverUrl = import.meta.env.VITE_SERVER_URL || ''

      const convertedMessages: ChatMessageItem[] = result.data.messages.map(msg => {
        let msgType = msg.type
        if (msgType === 'normal' || msgType === 'reply') {
          msgType = 'text'
        }

        // 处理图片URL
        let imageUrl = msg.imageUrl
        if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('blob:')) {
          imageUrl = serverUrl + imageUrl
        }

        // 处理视频URL
        let videoUrl = msg.videoUrl
        if (videoUrl && !videoUrl.startsWith('http://') && !videoUrl.startsWith('https://') && !videoUrl.startsWith('blob:')) {
          videoUrl = serverUrl + videoUrl
        }

        // 处理视频缩略图URL
        let videoThumbnail = msg.videoThumbnail
        if (videoThumbnail && !videoThumbnail.startsWith('http://') && !videoThumbnail.startsWith('https://') && !videoThumbnail.startsWith('blob:')) {
          videoThumbnail = serverUrl + videoThumbnail
        }

        // 处理文件URL
        let fileUrl = msg.fileUrl
        if (fileUrl && !fileUrl.startsWith('http://') && !fileUrl.startsWith('https://') && !fileUrl.startsWith('blob:')) {
          fileUrl = serverUrl + fileUrl
        }

        // 处理头像URL
        let avatar = msg.sender?.avatar || ''
        if (avatar && !avatar.startsWith('http://') && !avatar.startsWith('https://') && !avatar.startsWith('blob:')) {
          avatar = serverUrl + avatar
        }

        return {
          id: msg.id,
          type: msgType as any,
          text: msg.text,
          time: new Date(msg.time),
          isOwn: msg.isOwn,
          sender: msg.sender ? {
            id: msg.sender.id,
            nickname: msg.sender.nickname || '未知用户',
            avatar: avatar
          } : undefined,
          username: msg.sender?.nickname,
          status: msg.isOwn ? 'sent' : undefined,
          readCount: msg.read_count || 0,
          // 图片
          imageUrl: imageUrl,
          // 视频
          videoUrl: videoUrl,
          videoThumbnail: videoThumbnail,
          videoDuration: msg.videoDuration,
          // 文件
          fileName: msg.fileName,
          fileSize: msg.fileSize,
          fileExtension: msg.fileExtension,
          fileUrl: fileUrl,
          // 引用
          replyTo: msg.reply_to,
          // 编辑
          edited: msg.edited || false,
          editedAt: msg.edited_at
        }
      })

      chatStore.prependMessages(convertedMessages)
      hasMoreMessages.value = result.data.has_more

      // 恢复滚动位置（保持在原来的消息位置）
      nextTick(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight
          container.scrollTop = newScrollHeight - oldScrollHeight
        }
        // 延迟重置标志位，确保 watch 不会触发
        setTimeout(() => {
          isLoadingHistory.value = false
        }, 100)
      })
    }
  } catch (error) {
    console.error('加载更多消息失败:', error)
    isLoadingHistory.value = false
  } finally {
    loadingMoreMessages.value = false
  }
}

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
  createRoomVisible.value = false
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

// 编辑消息弹窗
const editMessageVisible = ref(false)
const editMessageLoading = ref(false)
const editMessageForm = reactive({
  messageId: 0,
  content: ''
})

const handleJoinRoom = () => {
  joinRoomVisible.value = true
}

const resetJoinRoomForm = () => {
  joinRoomVisible.value = false
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

// ==================== 房间操作 ====================

const toggleSidebar = () => { sidebarOpen.value = !sidebarOpen.value }
const closeSidebar = () => { sidebarOpen.value = false }
const toggleTheme = () => {
  // 使用 composable 切换深色模式（会自动更新 html 元素的 class）
  toggleDarkMode()
}
const handleSelectContact = (contact: any) => { console.log('选择人:', contact) }

const handleSelectRoom = async (room: any) => {
  if (!room || !room.id) {
    console.error('房间信息无效:', room)
    return
  }

  const roomId = typeof room.id === 'string' ? parseInt(room.id) : room.id

  // 切换房间时，从已显示通知的记录中移除当前房间
  // 这样切回来时可以再次显示通知
  if (currentRoom.value?.id) {
    shownBondNotificationRooms.delete(currentRoom.value.id)
    console.log('[羁绊通知] 离开房间，清除通知记录:', currentRoom.value.id)
    
    // 重置亲密度相关状态
    console.log('[亲密度] 切换房间，重置互动状态')
    intimacyStore.resetInteraction()
    showIntimacyPanel.value = false
    showBondNotification.value = false
    if (bondNotificationTimer) {
      clearTimeout(bondNotificationTimer)
      bondNotificationTimer = null
    }
  }

  // 切换房间时重置人数为0，等待WebSocket更新
  currentRoom.value = {
    ...room,
    id: roomId,
    totalUsers: 0,
    onlineUsers: 0,
    isPrivate: room.private === 1
  }

  localStorage.setItem('currentRoomId', String(roomId))
  closeSidebar()

  // 加载房间消息
  await loadRoomMessages(roomId)

  // 获取房间人数（仅获取总人数，在线人数等WebSocket更新）
  try {
    const result = await getRoomUserCount(roomId)
    if (result.code === 0 && currentRoom.value?.id === roomId) {
      currentRoom.value.totalUsers = result.data.total_count
      // 刷新页面时，使用HTTP返回的在线人数
      // 如果HTTP返回0，至少显示1（自己）
      currentRoom.value.onlineUsers = Math.max(1, result.data.online_count)
      console.log('[房间] HTTP获取人数 - 总数:', result.data.total_count, '在线:', result.data.online_count)
    }
  } catch (error) {
    console.error('获取房间人数失败:', error)
  }

  // 加载亲密度信息（仅私密房间）- 必须在 WebSocket 加入之前加载
  if (room.private === 1) {
    await intimacyStore.loadIntimacyInfo(roomId)
  } else {
    intimacyStore.clearIntimacy()
  }

  // 加入 WebSocket 房间（会触发room_joined事件，更新准确的在线人数）
  if (wsStore.isAuthed) {
    enterRoom(roomId)
    
    // 等待 WebSocket 更新在线人数后，检查是否需要启动亲密度互动
    // 使用 nextTick 确保 WebSocket 事件已处理
    nextTick(() => {
      setTimeout(() => {
        console.log('[房间切换] 延迟检查 - roomId:', roomId, 'currentRoom:', currentRoom.value?.id, 'isPrivate:', currentRoom.value?.isPrivate, 'intimacy:', !!intimacyStore.currentIntimacy, 'totalUsers:', currentRoom.value?.totalUsers, 'onlineUsers:', currentRoom.value?.onlineUsers)
        
        if (currentRoom.value?.id === roomId && 
            currentRoom.value.isPrivate && 
            intimacyStore.currentIntimacy && 
            currentRoom.value.totalUsers === 2 &&
            currentRoom.value.onlineUsers === 2) {
          console.log('[亲密度] 切换回房间，两人都在线，启动互动')
          intimacyStore.startInteraction()
          
          // 检查是否需要显示羁绊通知（切换回房间时，如果两人都在线且未显示过）
          if (!shownBondNotificationRooms.has(roomId)) {
            console.log('[羁绊通知] 切换回房间，准备显示通知')
            const showBondEffect = localStorage.getItem('intimacy_show_bond_effect')
            if (showBondEffect !== '0') {
              if (bondNotificationTimer) {
                clearTimeout(bondNotificationTimer)
              }
              bondNotificationTimer = setTimeout(() => {
                console.log('[羁绊通知] 显示通知')
                showBondNotification.value = true
                shownBondNotificationRooms.add(roomId)
              }, 500)
            }
          }
        } else {
          console.log('[房间切换] 延迟检查未通过条件')
        }
      }, 300) // 给 WebSocket 一些时间更新
    })
  }

  // 设置 chatStore 的当前房间并同步锁定状态
  chatStore.setCurrentRoom({
    id: roomId,
    name: room.name,
    isLocked: room.lock === 1,
    onlineUsers: currentRoom.value.onlineUsers,
    totalUsers: currentRoom.value.totalUsers,
    isPrivate: room.private === 1
  })

  // 更新软删除消息数量（仅管理员需要）
  if (userStore.isAdmin) {
    await updateDeletedCount()
  }
}

const handleAddContact = () => { console.log('添加联系人') }
const handleRefresh = () => { loadUserRooms() }

const handleLeaveRoomAction = async (room: any) => {
  try {
    const result = await leaveRoom(room.id)
    if (result.code === 0) {
      message.success('已退出房间')
      await loadUserRooms()
      if (currentRoom.value?.id === room.id) {
        currentRoom.value = null
        chatStore.clearMessages()
      }
    } else {
      message.error(result.msg || '退出房间失败')
    }
  } catch (error: any) {
    message.error(error.message || '退出房间失败')
  }
}

// ==================== 房间管理操作 ====================

// 锁定/解锁房间
const handleToggleLock = async () => {
  if (!currentRoom.value) return

  const newLockStatus = currentRoom.value.lock === 1 ? 0 : 1
  const actionText = newLockStatus === 1 ? '锁定' : '解锁'

  try {
    const result = await toggleRoomLockApi(currentRoom.value.id, newLockStatus)
    if (result.code === 0) {
      message.success(`房间已${actionText}`)
      currentRoom.value.lock = newLockStatus

      // 通过 WebSocket 广播锁定状态变化
      toggleRoomLock(newLockStatus === 1)
    } else {
      message.error(result.msg || `${actionText}失败`)
    }
  } catch (error: any) {
    message.error(error.message || `${actionText}失败`)
  }
}

// 清理房间消息
const handleClearRoom = async (hardDelete: boolean) => {
  if (!currentRoom.value) return

  const actionText = hardDelete ? '物理删除' : '软删除'

  Modal.confirm({
    title: `确认${actionText}所有消息？`,
    content: hardDelete
      ? '物理删除将永久删除所有消息和文件，无法恢复！'
      : '软删除的消息可以通过"恢复消息"功能恢复。',
    okText: '确认',
    okType: hardDelete ? 'danger' : 'primary',
    cancelText: '取消',
    onOk: async () => {
      try {
        const result = await clearRoomMessages(currentRoom.value!.id, hardDelete)
        if (result.code === 0) {
          message.success(`${actionText}成功，共删除 ${result.data.deleted_messages} 条消息`)

          // 清空本地消息列表
          chatStore.clearMessages()

          // 重新加载消息
          await loadRoomMessages(currentRoom.value!.id)

          // 更新软删除消息数量
          await updateDeletedCount()

          // 通过 WebSocket 广播清理事件
          broadcastClearRoom(hardDelete)
        } else {
          message.error(result.msg || `${actionText}失败`)
        }
      } catch (error: any) {
        message.error(error.message || `${actionText}失败`)
      }
    }
  })
}

// 恢复房间消息
const handleRestoreRoom = async () => {
  if (!currentRoom.value) return

  if (deletedCount.value === 0) {
    message.info('没有可恢复的消息')
    return
  }

  Modal.confirm({
    title: '确认恢复消息？',
    content: `将恢复 ${deletedCount.value} 条软删除的消息。`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        const result = await restoreRoomMessages(currentRoom.value!.id)
        if (result.code === 0) {
          message.success(`恢复成功，共恢复 ${result.data.restored_messages} 条消息`)

          // 重新加载消息
          await loadRoomMessages(currentRoom.value!.id)

          // 更新软删除消息数量
          await updateDeletedCount()

          // 通过 WebSocket 广播恢复事件
          broadcastRestoreRoom()
        } else {
          message.error(result.msg || '恢复失败')
        }
      } catch (error: any) {
        message.error(error.message || '恢复失败')
      }
    }
  })
}

// 更新软删除消息数量
const updateDeletedCount = async () => {
  if (!currentRoom.value) return

  try {
    const result = await getDeletedMessagesCount(currentRoom.value.id)
    if (result.code === 0) {
      deletedCount.value = result.data.count
    }
  } catch (error) {
    console.error('获取软删除消息数量失败:', error)
  }
}

// ==================== 消息操作 ====================

// 处理滚动位置变化
const handleScrollChange = (atBottom: boolean) => {
  isAtBottom.value = atBottom
  // 如果滚动到底部，清除新消息计数
  if (atBottom) {
    newMessageCount.value = 0
  }
}

// 点击新消息提示，滚动到底部
const handleScrollToNewMessage = () => {
  newMessageCount.value = 0
  nextTick(() => {
    messageListRef.value?.scrollToBottomWithHistory(true)
  })
}

// ==================== 消息发送 ====================

const handleSendMessage = async (text: string) => {
  if (!currentRoom.value?.id) {
    message.warning('请先选择房间')
    return
  }

  if (!userStore.userInfo) {
    message.error('请先登录')
    return
  }

  // 保存引用信息（发送后清除）
  const currentReplyTo = replyToMessage.value

  // 先添加到本地消息列表（显示发送中状态）
  const tempId = Date.now()
  const animKey = `anim-${tempId}`  // 动画key，不会被修改
  const newMessage: ChatMessageItem = {
    id: tempId,
    type: 'text',
    text,
    time: new Date(),
    isOwn: true,
    sender: {
      id: userStore.userInfo.id,
      nickname: userStore.userInfo.nick_name,
      avatar: userStore.userInfo.avatar
    },
    username: userStore.userInfo.nick_name,
    status: 'sending',
    isNew: true,
    animationKey: animKey,  // 用于动画的唯一标识
    // 如果有引用，添加到本地消息
    replyTo: currentReplyTo ? {
      message_id: currentReplyTo.id,
      content: getReplyPreviewText(currentReplyTo),
      nickname: currentReplyTo.sender?.nickname || '用户',
      user_id: currentReplyTo.sender?.id,
      message_type: getMessageTypeNumber(currentReplyTo.type),
      deleted: false
    } : undefined
  }

  chatStore.addMessage(newMessage)

  // 清除引用状态
  replyToMessage.value = null

  // 只有在底部时才自动滚动
  if (isAtBottom.value) {
    nextTick(() => {
      messageListRef.value?.scrollToBottom(true)
    })
  }

  try {
    // 通过 HTTP API 发送消息（带引用参数）
    const result = await sendTextMessage(
      currentRoom.value.id,
      text,
      currentReplyTo ? Number(currentReplyTo.id) : undefined
    )

    if (result.code === 0 && result.data) {
      // 更新消息ID和状态
      const msg = chatStore.messages.find(m => m.id === tempId)
      if (msg) {
        msg.id = result.data.id
        msg.status = 'sent'
      }

      // 私密房间：处理亲密度信息（注意：intimacy在result根级别，不是result.data下）
      if (currentRoom.value?.isPrivate && result.intimacy && result.intimacy.code === 0) {
        console.log('[亲密度] 收到更新:', result.intimacy)
        
        // 更新亲密度 store（即时刷新消息记录和经验值）
        intimacyStore.updateIntimacyFromMessage(result.intimacy.data)
        
        // 触发爱心飘出动画
        triggerFloatingHearts()
      }

      // 通过 WebSocket 广播消息给其他用户（携带亲密度信息）
      broadcastMessage({
        message_id: Number(result.data.id),
        message_type: 'text',
        content: text,
        reply_to: currentReplyTo ? {
          message_id: Number(currentReplyTo.id),
          content: currentReplyTo.text || currentReplyTo.content || '',
          user_id: currentReplyTo.sender?.id || 0,
          nickname: currentReplyTo.sender?.nickname || currentReplyTo.username || '用户',
          message_type: currentReplyTo.type,
          deleted: false
        } : undefined,
        intimacy: result.intimacy?.data // 只传递data部分，不传递整个intimacy对象
      })
    } else {
      // 发送失败
      chatStore.updateMessageStatus(tempId, 'failed')
      message.error(result.msg || '发送失败')
    }
  } catch (error: any) {
    chatStore.updateMessageStatus(tempId, 'failed')
    message.error(error.message || '发送失败')
  }
}

const handleSendImage = async (file: File) => {
  if (!currentRoom.value?.id) {
    message.warning('请先选择房间')
    return
  }

  // 生成临时消息ID
  const tempId = `temp_${Date.now()}`

  // 创建临时图片URL用于预览
  const tempImageUrl = URL.createObjectURL(file)

  // 初始化上传进度
  uploadProgress.value[tempId] = 0

  // 添加临时消息到列表（占位）
  const tempMessage: ChatMessageItem = {
    id: tempId,
    type: 'image',
    text: '',
    time: new Date(),
    isOwn: true,
    sender: {
      id: userStore.userInfo?.id || 0,
      nickname: userStore.userInfo?.nick_name || '我',
      avatar: userStore.userInfo?.avatar || ''
    },
    username: userStore.userInfo?.nick_name || '我',
    status: 'sending',
    imageUrl: tempImageUrl,
    isNew: true
  }

  chatStore.addMessage(tempMessage)

  // 只有在底部时才自动滚动
  if (isAtBottom.value) {
    nextTick(() => {
      messageListRef.value?.scrollToBottom(true)
    })
  }

  // 模拟上传进度（因为实际上传可能很快，模拟一个平滑的进度）
  const progressInterval = setInterval(() => {
    if (uploadProgress.value[tempId] < 85) {
      // 0-85%: 较慢增长，每次增加3-8%
      uploadProgress.value[tempId] += Math.random() * 5 + 3
      if (uploadProgress.value[tempId] > 85) {
        uploadProgress.value[tempId] = 85
      }
    } else if (uploadProgress.value[tempId] < 95) {
      // 85-95%: 非常慢的增长，每次增加0.5-2%
      uploadProgress.value[tempId] += Math.random() * 1.5 + 0.5
      if (uploadProgress.value[tempId] > 95) {
        uploadProgress.value[tempId] = 95
      }
    }
  }, 300)

  try {
    // 上传图片
    const result = await sendImageMessage(currentRoom.value.id, file)

    // 清除进度模拟
    clearInterval(progressInterval)
    uploadProgress.value[tempId] = 100

    console.log('[图片上传] 后端返回:', result)

    if (result.code === 0 && result.data) {
      // 获取图片路径
      const imageUrl = result.data.imageUrl || result.data.image_url || result.data.content || result.data.text || ''
      console.log('[图片上传] 图片路径:', imageUrl)

      // 拼接完整URL
      const serverUrl = import.meta.env.VITE_SERVER_URL || ''
      const fullImageUrl = imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')
        ? serverUrl + imageUrl
        : imageUrl

      console.log('[图片上传] 完整URL:', fullImageUrl)

      // 短暂延迟后更新临时消息（让用户看到100%）
      setTimeout(() => {
        // 释放临时URL
        URL.revokeObjectURL(tempImageUrl)

        // 清除进度（隐藏进度遮罩）
        delete uploadProgress.value[tempId]

        // 直接更新临时消息，不改变ID避免重新渲染
        const msg = chatStore.messages.find(m => m.id === tempId)
        if (msg) {
          // 不更新ID，保持临时ID，避免Vue重新渲染导致跳动
          msg.imageUrl = fullImageUrl // 更新为服务器URL
          msg.status = 'sent' // 更新状态
          msg.isNew = false; // 取消新消息标记
          // 保存真实ID到自定义属性，用于后续操作
          (msg as any).realId = Number(result.data.id);
        }

        // 私密房间：处理亲密度信息
        if (currentRoom.value?.isPrivate && result.intimacy && result.intimacy.code === 0) {
          console.log('[亲密度] 图片消息收到更新:', result.intimacy)
          intimacyStore.updateIntimacyFromMessage(result.intimacy.data)
          triggerFloatingHearts()
        }

        // 广播消息（携带图片路径和亲密度信息）
        console.log('[图片上传] 广播消息, content:', imageUrl)
        broadcastMessage({
          message_id: Number(result.data.id),
          message_type: 'image',
          content: imageUrl,
          intimacy: result.intimacy?.data
        })
      }, 300)
    } else {
      // 发送失败，更新临时消息状态
      clearInterval(progressInterval)
      delete uploadProgress.value[tempId]
      const msg = chatStore.messages.find(m => m.id === tempId)
      if (msg) {
        msg.status = 'failed'
      }
      message.error(result.msg || '图片发送失败')
    }
  } catch (error: any) {
    // 发送失败，更新临时消息状态
    clearInterval(progressInterval)
    delete uploadProgress.value[tempId]
    const msg = chatStore.messages.find(m => m.id === tempId)
    if (msg) {
      msg.status = 'failed'
    }

    // 优化错误提示
    let errorMsg = '图片发送失败'
    if (error.message) {
      if (error.message.includes('timeout')) {
        errorMsg = '图片上传超时，请检查网络连接'
      } else if (error.message.includes('Network Error')) {
        errorMsg = '网络连接失败，请检查网络'
      } else {
        errorMsg = error.message
      }
    }
    message.error(errorMsg)
  }
}

const handleSendVideo = async (file: File) => {
  if (!currentRoom.value?.id) {
    message.warning('请先选择房间')
    return
  }

  // 生成临时消息ID
  const tempId = `temp_${Date.now()}`

  // 创建临时视频URL用于预览
  const tempVideoUrl = URL.createObjectURL(file)

  // 初始化上传进度
  uploadProgress.value[tempId] = 0

  // 添加临时消息到列表（占位）
  const tempMessage: ChatMessageItem = {
    id: tempId,
    type: 'video',
    text: '',
    time: new Date(),
    isOwn: true,
    sender: {
      id: userStore.userInfo?.id || 0,
      nickname: userStore.userInfo?.nick_name || '我',
      avatar: userStore.userInfo?.avatar || ''
    },
    username: userStore.userInfo?.nick_name || '我',
    status: 'sending',
    videoUrl: tempVideoUrl,
    videoThumbnail: undefined,
    videoDuration: 0,
    isNew: true
  }

  chatStore.addMessage(tempMessage)

  // 只有在底部时才自动滚动
  if (isAtBottom.value) {
    nextTick(() => {
      messageListRef.value?.scrollToBottom(true)
    })
  }

  // 模拟上传进度（视频上传较慢）
  const progressInterval = setInterval(() => {
    if (uploadProgress.value[tempId] < 40) {
      // 0-40%: 较慢增长，每次增加2-5%
      uploadProgress.value[tempId] += Math.random() * 3 + 2
      if (uploadProgress.value[tempId] > 40) {
        uploadProgress.value[tempId] = 40
      }
    } else if (uploadProgress.value[tempId] < 70) {
      // 40-70%: 非常慢的增长，每次增加0.3-1%
      uploadProgress.value[tempId] += Math.random() * 0.7 + 0.3
      if (uploadProgress.value[tempId] > 70) {
        uploadProgress.value[tempId] = 70
      }
    }
  }, 300)

  try {
    // 上传视频
    const result = await sendVideoMessage(currentRoom.value.id, file)

    // 清除进度模拟
    clearInterval(progressInterval)
    uploadProgress.value[tempId] = 100

    console.log('[视频上传] 后端返回:', result)

    if (result.code === 0 && result.data) {
      // 获取视频路径
      const videoUrl = result.data.videoUrl || result.data.video_url || result.data.content || result.data.text || ''
      const videoThumbnail = result.data.videoThumbnail || result.data.video_thumbnail || ''
      const videoDuration = result.data.videoDuration || result.data.video_duration || 0

      console.log('[视频上传] 视频URL:', videoUrl)
      console.log('[视频上传] 缩略图URL:', videoThumbnail)
      console.log('[视频上传] 时长:', videoDuration)

      // 拼接完整URL
      const serverUrl = import.meta.env.VITE_SERVER_URL || ''
      const fullVideoUrl = videoUrl && !videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')
        ? serverUrl + videoUrl
        : videoUrl

      const fullThumbnailUrl = videoThumbnail && !videoThumbnail.startsWith('http://') && !videoThumbnail.startsWith('https://')
        ? serverUrl + videoThumbnail
        : videoThumbnail

      console.log('[视频上传] 完整视频URL:', fullVideoUrl)
      console.log('[视频上传] 完整缩略图URL:', fullThumbnailUrl)

      // 短暂延迟后更新临时消息（让用户看到100%）
      setTimeout(() => {
        // 释放临时URL
        URL.revokeObjectURL(tempVideoUrl)

        // 清除进度（隐藏进度遮罩）
        delete uploadProgress.value[tempId]

        // 直接更新临时消息，不改变ID避免重新渲染
        const msg = chatStore.messages.find(m => m.id === tempId)
        if (msg) {
          console.log('[视频上传] 更新临时消息:', { tempId, msgId: msg.id, currentStatus: msg.status })
          msg.videoUrl = fullVideoUrl // 更新为服务器URL
          msg.videoThumbnail = fullThumbnailUrl || undefined
          msg.videoDuration = videoDuration || 0
          msg.status = 'sent' // 更新状态
          msg.isNew = false; // 取消新消息标记
          // 保存真实ID到自定义属性，用于后续操作
          (msg as any).realId = Number(result.data.id)
          console.log('[视频上传] 临时消息已更新:', { status: msg.status, realId: (msg as any).realId })
        } else {
          console.warn('[视频上传] 未找到临时消息:', tempId)
        }

        // 私密房间：处理亲密度信息
        if (currentRoom.value?.isPrivate && result.intimacy && result.intimacy.code === 0) {
          console.log('[亲密度] 视频消息收到更新:', result.intimacy)
          intimacyStore.updateIntimacyFromMessage(result.intimacy.data)
          triggerFloatingHearts()
        }

        // 广播消息（携带视频路径和亲密度信息）
        console.log('[视频上传] 广播消息, videoUrl:', videoUrl, 'thumbnail:', videoThumbnail, 'duration:', videoDuration)
        broadcastMessage({
          message_id: Number(result.data.id),
          message_type: 'video',
          content: videoUrl,
          video_url: videoUrl,
          video_thumbnail: videoThumbnail || undefined,
          video_duration: videoDuration || undefined,
          intimacy: result.intimacy?.data
        })
      }, 300)
    } else {
      // 发送失败，更新临时消息状态
      clearInterval(progressInterval)
      delete uploadProgress.value[tempId]
      const msg = chatStore.messages.find(m => m.id === tempId)
      if (msg) {
        msg.status = 'failed'
      }
      message.error(result.msg || '视频发送失败')
    }
  } catch (error: any) {
    // 发送失败，更新临时消息状态
    clearInterval(progressInterval)
    delete uploadProgress.value[tempId]
    const msg = chatStore.messages.find(m => m.id === tempId)
    if (msg) {
      msg.status = 'failed'
    }

    // 优化错误提示
    let errorMsg = '视频发送失败'
    if (error.message) {
      if (error.message.includes('timeout')) {
        errorMsg = '视频上传超时，请检查网络连接或尝试压缩视频'
      } else if (error.message.includes('Network Error')) {
        errorMsg = '网络连接失败，请检查网络'
      } else {
        errorMsg = error.message
      }
    }
    message.error(errorMsg)
  }
}

const handleSendFile = async (file: File) => {
  if (!currentRoom.value?.id) {
    message.warning('请先选择房间')
    return
  }

  try {
    const result = await sendFileMessage(currentRoom.value.id, file)
    if (result.code === 0 && result.data) {
      // 私密房间：处理亲密度信息
      if (currentRoom.value?.isPrivate && result.intimacy && result.intimacy.code === 0) {
        console.log('[亲密度] 文件消息收到更新:', result.intimacy)
        intimacyStore.updateIntimacyFromMessage(result.intimacy.data)
        triggerFloatingHearts()
      }

      broadcastMessage({
        message_id: Number(result.data.id),
        message_type: 'file',
        content: '',
        file_name: file.name,
        file_size: file.size,
        intimacy: result.intimacy?.data
      })
      message.success('文件发送成功')
    } else {
      message.error(result.msg || '发送文件失败')
    }
  } catch (error: any) {
    message.error(error.message || '发送文件失败')
  }
}

const handleStartRecording = () => { console.log('开始录音') }
const handleStopRecording = () => { console.log('停止录音') }

const handleTyping = () => {
  // 发送正在输入状态
  sendTyping(true)

  // 清除之前的定时器
  if (typingTimer) {
    clearTimeout(typingTimer)
  }

  // 3秒后发送停止输入状态
  typingTimer = setTimeout(() => {
    sendTyping(false)
  }, 3000)
}

// ==================== 消息引用相关 ====================

// 获取引用预览文本
const getReplyPreviewText = (msg: any): string => {
  if (!msg) return ''

  if (msg.type === 'image') return '[图片]'
  if (msg.type === 'video') return '[视频]'
  if (msg.type === 'file') return '[文件]'

  const text = msg.text || msg.content || ''
  return text.length > 30 ? text.substring(0, 30) + '...' : text
}

// 获取消息类型数字
const getMessageTypeNumber = (type: string): number => {
  const typeMap: Record<string, number> = {
    'text': 1,
    'image': 2,
    'file': 3,
    'system': 4,
    'video': 5
  }
  return typeMap[type] || 1
}

// 回复消息
const handleReplyMessage = (msg: any) => {
  replyToMessage.value = {
    id: msg.id,
    type: msg.type,
    text: msg.text || msg.content || '',
    content: msg.text || msg.content || '',
    sender: msg.sender || {
      id: msg.senderId,
      nickname: msg.username || '用户'
    }
  }

  // 聚焦输入框
  nextTick(() => {
    inputBarRef.value?.focusInput()
  })
}

// 取消引用
const handleCancelReply = () => {
  replyToMessage.value = null
}

// 焚毁消息
const handleBurnMessage = async (messageId: string | number) => {
  // 显示确认框
  Modal.confirm({
    title: '确认焚毁',
    content: '焚毁后消息将永久删除，且所有人都无法查看，确定要焚毁这条消息吗？',
    okText: '确定焚毁',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      try {
        const { burnMessage: burnMessageApi } = await import('@/apis/message')
        const result = await burnMessageApi(Number(messageId))
        if (result.code === 0) {
          chatStore.removeMessage(Number(messageId))
          // 广播给其他用户
          wsStore.broadcastMessageBurned(Number(messageId))
          message.success('消息已焚毁')
        } else {
          message.error(result.msg || '焚毁失败')
        }
      } catch (error: any) {
        message.error(error.message || '焚毁失败')
      }
    }
  })
}

// 编辑消息
const handleEditMessage = (messageId: string | number, content: string) => {
  editMessageForm.messageId = Number(messageId)
  editMessageForm.content = content
  editMessageVisible.value = true
}

const resetEditMessageForm = () => {
  editMessageVisible.value = false
  editMessageForm.messageId = 0
  editMessageForm.content = ''
}

const submitEditMessage = async () => {
  if (!editMessageForm.content.trim()) {
    message.warning('请输入消息内容')
    return
  }

  editMessageLoading.value = true
  try {
    const result = await editMessage(editMessageForm.messageId, editMessageForm.content.trim())
    if (result.code === 0 && result.data) {
      const editedAt = (result.data as any).edited_at || new Date().toISOString()

      // 更新本地消息
      chatStore.editMessage(editMessageForm.messageId, editMessageForm.content.trim(), editedAt)

      // 广播给其他用户
      const { broadcastEditMessage } = useChat()
      broadcastEditMessage(editMessageForm.messageId, editMessageForm.content.trim(), editedAt)

      message.success('消息已编辑')
      resetEditMessageForm()
    } else {
      message.error(result.msg || '编辑失败')
    }
  } catch (error: any) {
    message.error(error.message || '编辑失败')
  } finally {
    editMessageLoading.value = false
  }
}

// ==================== 亲密度互动 ====================

// 处理经验提示开关
const handleToggleExpToast = (value: boolean) => {
  localStorage.setItem('intimacy_show_exp_toast', value ? '1' : '0')
}

// 处理羁绊上线提醒开关
const handleToggleBondEffect = (value: boolean) => {
  localStorage.setItem('intimacy_show_bond_effect', value ? '1' : '0')
}

// 关闭羁绊上线提醒
const handleCloseBondNotification = () => {
  showBondNotification.value = false
  if (bondNotificationTimer) {
    clearTimeout(bondNotificationTimer)
    bondNotificationTimer = null
  }
}

// 处理亲密度面板关闭
const handleCloseIntimacyPanel = () => {
  showIntimacyPanel.value = false
}

// 处理亲密度面板切换
const handleToggleIntimacyPanel = () => {
  showIntimacyPanel.value = !showIntimacyPanel.value
}
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
html.dark-mode .chat-app {
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

  // 深色模式 - 菜单按钮
  .menu-btn {
    color: $text-secondary-dark;

    &:active {
      background: rgba($primary-color, 0.15);
    }
  }

  // 深色模式 - 新消息提示
  .new-message-tip {
    background: $bg-color-elevated-dark;
    border-color: $primary-color;
    box-shadow: $box-shadow-lg-dark;

    &:hover {
      background: $primary-color;
      color: white;
      box-shadow: $box-shadow-lg-dark, 0 6px 20px rgba($primary-color, 0.4);
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
  position: relative; // 为 IntimacyPanel 提供定位上下文
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
  position: relative; // 为 IntimacyPanel 提供定位上下文
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

// 消息区域 - 占据剩余空间，内部滚动
.messages-area {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

// 新消息提示按钮
.new-message-tip {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: $bg-color-elevated;
  color: $primary-color;
  border: 1px solid $primary-color;
  border-radius: $border-radius-round;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: $box-shadow-lg;
  z-index: 100;
  transition: all $transition-base;
  white-space: nowrap;

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  span {
    font-weight: 600;
  }

  &:hover {
    background: $primary-color;
    color: white;
    transform: translateX(-50%) translateY(-2px);
    box-shadow: $box-shadow-lg, 0 6px 20px rgba($primary-color, 0.3);
  }

  &:active {
    transform: translateX(-50%) scale(0.98);
  }
}

// 新消息提示动画
.new-msg-fade-enter-active,
.new-msg-fade-leave-active {
  transition: all 0.3s ease;
}

.new-msg-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

.new-msg-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
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