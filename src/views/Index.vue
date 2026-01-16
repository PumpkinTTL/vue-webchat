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
          :loading="messagesLoading"
          :has-more="hasMoreMessages"
          :loading-more="loadingMoreMessages"
          :upload-progress="uploadProgress"
          @load-more="handleLoadMore"
          @reply="handleReplyMessage"
          @burn="handleBurnMessage"
          @scroll-change="handleScrollChange"
        />
        
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
        <InputBar 
          ref="inputBarRef"
          :disabled="false"
          :reply-to="replyToMessage"
          @send="handleSendMessage"
          @send-image="handleSendImage"
          @send-video="handleSendVideo"
          @send-file="handleSendFile"
          @start-recording="handleStartRecording"
          @stop-recording="handleStopRecording"
          @typing="handleTyping"
          @cancel-reply="handleCancelReply"
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
          <a-input v-model:value="createRoomForm.name" placeholder="请输入房间名称" :maxlength="20" show-count autocomplete="off" />
        </a-form-item>
        <a-form-item label="房间简介">
          <a-textarea v-model:value="createRoomForm.description" placeholder="请输入房间简介（可选）" :maxlength="100" show-count :rows="2" autocomplete="off" />
        </a-form-item>
        <a-form-item label="房间密码" class="mb-0">
          <a-input-password v-model:value="createRoomForm.password" placeholder="设置密码后为私密房间（可选）" :maxlength="20" autocomplete="new-password" />
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
    <a-modal
      v-model:open="joinRoomVisible"
      title="加入房间"
      :confirm-loading="joinRoomLoading"
      @cancel="resetJoinRoomForm"
    >
      <a-form :model="joinRoomForm" layout="vertical" class="compact-form">
        <a-form-item label="房间ID" required>
          <a-input v-model:value="joinRoomForm.roomId" placeholder="请输入房间ID" :maxlength="20" autocomplete="off" />
        </a-form-item>
        <a-form-item label="房间密码" class="mb-0">
          <a-input-password v-model:value="joinRoomForm.password" placeholder="私密房间需要输入密码（可选）" :maxlength="20" autocomplete="off" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import Sidebar from '@/components/index/Sidebar.vue'
import ChatHeader from '@/components/index/ChatHeader.vue'
import MessageList from '@/components/index/MessageList.vue'
import InputBar from '@/components/index/InputBar.vue'
import { getUserRooms, createRoom, joinRoom, leaveRoom, getRoomUserCount } from '@/apis/room'
import { getMessageList, sendTextMessage, sendImageMessage, sendVideoMessage, sendFileMessage } from '@/apis/message'
import type { CreateRoomParams, JoinRoomParams } from '@/apis/room'
import { useChat } from '@/composables/useChat'
import { getUserInfo } from '@/utils/storage'
import type { ChatMessageItem } from '@/store/chat'

// 使用聊天组合式函数
const { wsStore, chatStore, initChat, destroyChat, enterRoom, broadcastMessage, sendTyping } = useChat()

// 消息列表引用
const messageListRef = ref<InstanceType<typeof MessageList>>()

// 输入栏引用
const inputBarRef = ref<InstanceType<typeof InputBar>>()

// 响应式状态
const isDarkMode = ref(false)
const sidebarOpen = ref(false)

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

// 引用回复状态
const replyToMessage = ref<any>(null)

// 输入状态防抖
let typingTimer: ReturnType<typeof setTimeout> | null = null

// 上传进度管理
const uploadProgress = ref<Record<string, number>>({})

// ==================== 生命周期 ====================

onMounted(async () => {
  // 初始化 WebSocket
  initChat()
  
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

// 监听房间在线人数变化
watch(() => wsStore.onlineCount, (count) => {
  if (currentRoom.value) {
    currentRoom.value.onlineUsers = count
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
    // 过滤掉系统消息
    const nonSystemMessages = newMessages.filter(msg => msg.type !== 'system')
    
    // 如果在底部，自动滚动
    if (isAtBottom.value) {
      nextTick(() => {
        messageListRef.value?.scrollToBottom(true)
      })
    } else if (nonSystemMessages.length > 0) {
      // 如果不在底部且有非系统消息，增加新消息计数
      newMessageCount.value += nonSystemMessages.length
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
  
  try {
    const result = await getMessageList(roomId, 1, 50)
    if (result.code === 0 && result.data) {
      // 后端已经格式化好了消息，直接映射字段
      const convertedMessages: ChatMessageItem[] = result.data.messages.map(msg => {
        // 映射消息类型：normal/reply -> text
        let msgType = msg.type
        if (msgType === 'normal' || msgType === 'reply') {
          msgType = 'text'
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
            avatar: msg.sender.avatar || ''
          } : undefined,
          username: msg.sender?.nickname,
          status: msg.isOwn ? 'sent' : undefined,
          readCount: msg.read_count || 0,
          // 图片
          imageUrl: msg.imageUrl,
          // 视频
          videoUrl: msg.videoUrl,
          videoThumbnail: msg.videoThumbnail,
          videoDuration: msg.videoDuration,
          // 文件
          fileName: msg.fileName,
          fileSize: msg.fileSize,
          fileExtension: msg.fileExtension,
          fileUrl: msg.fileUrl,
          // 引用
          replyTo: msg.reply_to
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
    const oldestMessage = chatStore.messages[0]
    const lastTime = oldestMessage?.time?.toISOString()
    
    const result = await getMessageList(currentRoom.value.id, 1, 20, lastTime)
    if (result.code === 0 && result.data) {
      const convertedMessages: ChatMessageItem[] = result.data.messages.map(msg => {
        let msgType = msg.type
        if (msgType === 'normal' || msgType === 'reply') {
          msgType = 'text'
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
            avatar: msg.sender.avatar || ''
          } : undefined,
          username: msg.sender?.nickname,
          status: msg.isOwn ? 'sent' : undefined,
          readCount: msg.read_count || 0,
          // 引用
          replyTo: msg.reply_to
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
const toggleTheme = () => { isDarkMode.value = !isDarkMode.value }
const handleSelectContact = (contact: any) => { console.log('选择联系人:', contact) }

const handleSelectRoom = async (room: any) => {
  if (!room || !room.id) {
    console.error('房间信息无效:', room)
    return
  }
  
  const roomId = typeof room.id === 'string' ? parseInt(room.id) : room.id
  
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
  
  // 获取房间人数
  try {
    const result = await getRoomUserCount(roomId)
    if (result.code === 0 && currentRoom.value?.id === roomId) {
      currentRoom.value.totalUsers = result.data.total_count
      currentRoom.value.onlineUsers = result.data.online_count
    }
  } catch (error) {
    console.error('获取房间人数失败:', error)
  }
  
  // 加入 WebSocket 房间
  if (wsStore.isAuthed) {
    enterRoom(roomId)
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
    messageListRef.value?.scrollToBottom(true)
  })
}

// ==================== 消息发送 ====================

const handleSendMessage = async (text: string) => {
  if (!currentRoom.value?.id) {
    message.warning('请先选择房间')
    return
  }
  
  const userInfo = getUserInfo()
  if (!userInfo) {
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
      id: userInfo.id,
      nickname: userInfo.nick_name,
      avatar: userInfo.avatar
    },
    username: userInfo.nick_name,
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
  
  // 滚动到底部
  nextTick(() => {
    messageListRef.value?.scrollToBottom(true)
  })
  
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
        
        // 如果有好感度信息，更新
        if (result.data.intimacy) {
          msg.intimacy = {
            currentExp: result.data.intimacy.current_exp,
            currentLevel: result.data.intimacy.current_level
          }
        }
      }
      
      // 通过 WebSocket 广播消息给其他用户
      broadcastMessage({
        message_id: Number(result.data.id),
        message_type: 'text',
        content: text,
        reply_to: currentReplyTo ? Number(currentReplyTo.id) : undefined,
        intimacy: result.data.intimacy
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
  const userInfo = getUserInfo()
  
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
      id: userInfo?.id || 0,
      nickname: userInfo?.nick_name || '我',
      avatar: userInfo?.avatar || ''
    },
    username: userInfo?.nick_name || '我',
    status: 'sending',
    imageUrl: tempImageUrl,
    isNew: true
  }
  
  chatStore.addMessage(tempMessage)
  
  // 滚动到底部
  nextTick(() => {
    messageListRef.value?.scrollToBottom(true)
  })
  
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
          if (result.data.intimacy) {
            msg.intimacy = {
              currentExp: result.data.intimacy.current_exp,
              currentLevel: result.data.intimacy.current_level
            }
          }
          msg.isNew = false // 取消新消息标记
          // 保存真实ID到自定义属性，用于后续操作
          (msg as any).realId = Number(result.data.id)
        }
        
        // 广播消息（携带图片路径）
        console.log('[图片上传] 广播消息, content:', imageUrl)
        broadcastMessage({
          message_id: Number(result.data.id),
          message_type: 'image',
          content: imageUrl,
          intimacy: result.data.intimacy
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
  
  try {
    const result = await sendVideoMessage(currentRoom.value.id, file)
    if (result.code === 0 && result.data) {
      broadcastMessage({
        message_id: Number(result.data.id),
        message_type: 'video',
        content: '',
        intimacy: result.data.intimacy
      })
      message.success('视频发送成功')
    } else {
      message.error(result.msg || '发送视频失败')
    }
  } catch (error: any) {
    message.error(error.message || '发送视频失败')
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
      broadcastMessage({
        message_id: Number(result.data.id),
        message_type: 'file',
        content: '',
        file_name: file.name,
        file_size: file.size,
        intimacy: result.data.intimacy
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

// 深色模式 - 新消息提示
.chat-app.dark-mode .new-message-tip {
  background: $bg-color-elevated-dark;
  border-color: $primary-color;
  box-shadow: $box-shadow-lg-dark;

  &:hover {
    background: $primary-color;
    color: white;
    box-shadow: $box-shadow-lg-dark, 0 6px 20px rgba($primary-color, 0.4);
  }
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