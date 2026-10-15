<template>
  <div
    class="user-card-wrapper animate__animated animate__fadeIn"
    style="--animate-duration: 0.4s"
  >
    <div class="user-card">
      <div class="user-avatar-wrapper">
        <div
          class="avatar-frame-container animate__animated animate__bounceIn"
          style="--animate-duration: 0.5s"
          @click.stop="triggerAvatarUpload"
          :title="'点击更换头像'"
        >
          <!-- 头像框（装饰图 + 流光）：按要求暂时隐藏，恢复时取消注释即可 -->
          <!-- <div class="avatar-glow"></div>
          <img
            src="@/assets/icons/header_icon.png"
            alt="frame"
            class="avatar-frame"
          /> -->
          <div class="user-avatar">
            <img
              v-if="userInfo.avatar"
              :src="avatarUrl"
              :alt="userInfo.nick_name"
            />
            <span v-else class="avatar-placeholder">
              {{ userInfo.nick_name?.charAt(0) || "U" }}
            </span>
            <!-- 上传中遮罩 -->
            <div v-if="uploadingAvatar" class="avatar-uploading">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="9" stroke-width="3" opacity="0.25" />
                <path d="M21 12a9 9 0 00-9-9" stroke-width="3" stroke-linecap="round" />
              </svg>
            </div>
            <!-- 悬停提示：更换头像 -->
            <div v-else class="avatar-edit-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          </div>
          <!-- 隐藏的头像文件选择器 -->
          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleAvatarChange"
          />
        </div>
        <div
          class="status-indicator animate__animated animate__bounceIn"
          style="--animate-duration: 0.4s; --animate-delay: 0.15s"
        ></div>
      </div>

      <div class="user-info" @click.stop="openProfileEdit" title="点击编辑资料">
        <div
          class="user-name animate__animated animate__fadeInLeft"
          style="--animate-duration: 0.35s; --animate-delay: 0.05s"
        >
          {{ userInfo.nick_name || "用户" }}
        </div>
        <div
          class="user-id animate__animated animate__fadeInLeft"
          style="--animate-duration: 0.35s; --animate-delay: 0.1s"
        >
          <span class="id-label">ID</span>
          <span class="id-value">{{ userInfo.id || "---" }}</span>
          <span class="edit-hint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </span>
        </div>
      </div>

      <button
        class="logout-btn animate__animated animate__fadeIn"
        style="--animate-duration: 0.3s; --animate-delay: 0.15s"
        @click="handleLogout"
        title="退出登录"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <!-- 版本日志按钮 -->
    <button
      class="version-log-btn animate__animated animate__fadeIn"
      style="--animate-duration: 0.3s; --animate-delay: 0.2s"
      @click="showVersionLog = true"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span>版本日志</span>
      <span class="version-badge">v2.0.1</span>
    </button>
  </div>

  <!-- 版本日志弹窗 -->
  <VersionLog v-model:open="showVersionLog" />

  <!-- 编辑资料弹窗 -->
  <ProfileEditModal v-model:open="showProfileEdit" @saved="handleProfileSaved" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { Modal } from "ant-design-vue";
import { clearUserInfo } from "@/utils/storage";
import { Message } from "@/utils/message";
import { uploadAvatar } from "@/apis/auth";
import { useUserStore } from "@/store/user";
import { useWebSocketStore } from "@/store/websocket";
import { useChatStore } from "@/store/chat";
import VersionLog from "@/components/common/VersionLog.vue";
import ProfileEditModal from "@/components/common/ProfileEditModal.vue";

// 服务器地址
const serverUrl = import.meta.env.VITE_SERVER_URL || "";

const router = useRouter();
const userStore = useUserStore();

// 从 store 读取用户信息（响应式，头像/昵称变更后立即刷新，无需刷新页面）
const userInfo = computed(() => userStore.userInfo || ({} as any));

// 版本日志弹窗
const showVersionLog = ref(false);

// 编辑资料弹窗
const showProfileEdit = ref(false);
const wsStore = useWebSocketStore();
const chatStore = useChatStore();

const openProfileEdit = () => {
  showProfileEdit.value = true;
};

// 资料保存成功：本地即时生效 + 广播给同房间其他人刷新
const handleProfileSaved = (info: { nickname: string; avatar: string; sign?: string }) => {
  const uid = userStore.userInfo?.id;
  if (uid) {
    chatStore.updateUserProfile(uid, info.nickname, info.avatar);
  }
  wsStore.broadcastProfileUpdated({
    user_id: uid || 0,
    nickname: info.nickname,
    avatar: info.avatar,
  });
};

// 头像上传
const avatarInput = ref<HTMLInputElement>();
const uploadingAvatar = ref(false);

// 拼接头像URL（正确处理 http 绝对地址、/storage 相对地址）
const avatarUrl = computed(() => {
  const avatar = userInfo.value.avatar;
  if (!avatar) return "";
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) return avatar;
  const path = avatar.startsWith("/") ? avatar : "/" + avatar;
  return serverUrl + path;
});

// 点头像 -> 触发文件选择
const triggerAvatarUpload = () => {
  if (uploadingAvatar.value) return;
  avatarInput.value?.click();
};

// 选择头像文件
const handleAvatarChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  target.value = ""; // 允许重复选择同一文件
  if (!file) return;

  uploadingAvatar.value = true;
  try {
    const result = await uploadAvatar(file);
    if (result.code === 0 && result.data) {
      const url = result.data.url || result.data.avatar;
      userStore.updateUserInfo({ avatar: url });
      Message.success("头像更新成功");
    } else {
      Message.error(result.msg || "头像上传失败");
    }
  } catch (error: any) {
    Message.error(error?.message || "头像上传失败");
  } finally {
    uploadingAvatar.value = false;
  }
};

// 退出登录
const handleLogout = () => {
  Modal.confirm({
    title: "确认退出",
    content: "确定要退出登录吗？",
    okText: "退出",
    cancelText: "取消",
    okButtonProps: { danger: true },
    onOk: () => {
      userStore.clearUser();
      clearUserInfo();
      Message.success("已退出登录");
      router.push("/login");
    },
  });
};
</script>

<style lang="scss" scoped>
// 变量已通过 vite.config.ts 全局导入

.user-card-wrapper {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid $border-light;
  transition: border-color $transition-base;
}

.dark-mode .user-card-wrapper {
  border-color: $border-light-dark;
}

.user-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg;
  background: transparent;
  cursor: pointer;

  &:hover {
    .user-avatar-wrapper {
      transform: scale(1.05);
    }
  }
}

// ==================== 头像区域 ====================
.user-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
  transition: transform $transition-base;
}

.avatar-frame-container {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 流光特效
.avatar-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: conic-gradient(
    from 0deg,
    #ff0080 0%,
    #ff8c00 15%,
    #ffd700 30%,
    #00ff88 45%,
    #00d4ff 60%,
    #8000ff 75%,
    #ff0080 90%,
    #ff0080 100%
  );
  border-radius: 50%;
  animation: avatarGlowRotate 3s linear infinite;
  z-index: 0;
  opacity: 0.7;
  filter: blur(3px);
}

@keyframes avatarGlowRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.avatar-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  z-index: 2;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: $border-radius-base;
  overflow: hidden;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// 头像容器可点击交互
.avatar-frame-container {
  cursor: pointer;

  &:hover .avatar-edit-hint {
    opacity: 1;
  }
}

// 更换头像悬停提示
.avatar-edit-hint {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;

  svg {
    width: 20px;
    height: 20px;
  }
}

// 上传中遮罩
.avatar-uploading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;

  svg {
    width: 22px;
    height: 22px;
    animation: avatarSpin 0.9s linear infinite;
  }
}

@keyframes avatarSpin {
  to {
    transform: rotate(360deg);
  }
}

.avatar-placeholder {
  font-family: $font-family-heading;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: white;
  text-transform: uppercase;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: $success-color;
  border: 2px solid $bg-color-elevated;
  border-radius: $border-radius-round;
  transition: border-color $transition-base;
}

.dark-mode .status-indicator {
  border-color: $bg-color-elevated-dark;
}

// ==================== 用户信息 ====================
.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

// 可点击编辑资料的提示
.user-info {
  cursor: pointer;

  &:hover .edit-hint {
    opacity: 1;
  }
}

.edit-hint {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  color: $primary-color;
  opacity: 0;
  transition: opacity 0.2s ease;

  svg {
    width: 13px;
    height: 13px;
  }
}

.user-name {
  font-family: $font-family-heading;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color $transition-base;
}

.dark-mode .user-name {
  color: $text-primary-dark;
}

.user-id {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-xs;
}

.id-label {
  padding: 2px 6px;
  background: rgba($primary-color, 0.1);
  color: $primary-color;
  border-radius: $border-radius-sm;
  font-weight: $font-weight-medium;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.id-value {
  color: $text-secondary;
  font-weight: $font-weight-medium;
  transition: color $transition-base;
}

.dark-mode .id-value {
  color: $text-secondary-dark;
}

// ==================== 退出按钮 ====================
.logout-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: $text-tertiary;
  cursor: pointer;
  border-radius: $border-radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all $transition-fast;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: rgba($danger-color, 0.1);
    color: $danger-color;
  }

  &:active {
    transform: scale(0.95);
  }
}

.dark-mode .logout-btn {
  color: $text-tertiary-dark;
}

// ==================== 版本日志按钮 ====================
.version-log-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  width: 100%;
  padding: $spacing-md $spacing-lg;
  border: none;
  background: transparent;
  color: $text-secondary;
  font-family: $font-family-body;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-base;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: $spacing-lg;
    right: $spacing-lg;
    height: 1px;
    background: $border-light;
    transition: background $transition-base;
  }

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    transition: transform $transition-base;
  }

  span {
    transition: color $transition-base;
  }

  .version-badge {
    padding: 2px 8px;
    background: rgba($primary-color, 0.1);
    color: $primary-color;
    border-radius: $border-radius-sm;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    font-family: "Consolas", "Monaco", monospace;
    transition: all $transition-base;
  }

  &:hover {
    background: rgba($primary-color, 0.05);
    color: $primary-color;

    &::before {
      background: $primary-color;
    }

    svg {
      transform: translateY(-2px);
    }

    .version-badge {
      background: $primary-color;
      color: white;
    }
  }

  &:active {
    transform: scale(0.98);
  }
}

.dark-mode .version-log-btn {
  color: $text-secondary-dark;

  &::before {
    background: $border-light-dark;
  }

  .version-badge {
    background: rgba($primary-color, 0.15);
  }

  &:hover {
    background: rgba($primary-color, 0.1);
    color: $primary-light;

    &::before {
      background: $primary-light;
    }
  }
}

// ==================== 移动端适配 ====================
@media (max-width: 768px) {
  .user-card {
    padding: $spacing-md;
    gap: $spacing-sm;
  }

  .avatar-frame-container {
    width: 52px;
    height: 52px;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
  }

  .avatar-placeholder {
    font-size: $font-size-lg;
  }

  .status-indicator {
    width: 10px;
    height: 10px;
  }

  .user-name {
    font-size: $font-size-sm;
  }

  .user-id {
    font-size: 10px;
  }

  .id-label {
    padding: 1px 4px;
  }

  .logout-btn {
    width: 32px;
    height: 32px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  .version-log-btn {
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-xs;
    gap: $spacing-xs;

    &::before {
      left: $spacing-md;
      right: $spacing-md;
    }

    svg {
      width: 16px;
      height: 16px;
    }

    .version-badge {
      font-size: 10px;
      padding: 1px 6px;
    }
  }
}
</style>
