<template>
  <div class="login-page">
    <!-- Vibrant gradient background for glass effect -->
    <div class="vibrant-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- Floating decorative elements -->
    <div class="decorative-elements">
      <div class="float-circle circle-1"></div>
      <div class="float-circle circle-2"></div>
      <div class="float-circle circle-3"></div>
      <div class="float-square square-1"></div>
      <div class="float-square square-2"></div>
      <div class="glass-blob blob-1"></div>
      <div class="glass-blob blob-2"></div>
    </div>

    <!-- Frosted glass login card -->
    <div class="login-container">
      <div class="glass-card">
        <!-- Logo section -->
        <div class="logo-section">
          <div class="logo-circle animate__animated animate__zoomIn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
              <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
              <circle cx="12" cy="10" r="1.5" fill="currentColor"/>
              <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
            </svg>
          </div>
          <h1 class="app-title animate__animated animate__fadeInDown" style="animation-delay: 0.15s">Secure Chat</h1>
          <p class="app-subtitle animate__animated animate__fadeInDown" style="animation-delay: 0.25s">端对端加密通讯</p>
        </div>

        <!-- Login form -->
        <a-form
          :model="formState"
class="login-form"
          @finish="handleLogin"
          layout="vertical"
        >
          <a-form-item
            name="username"
            :rules="[{ required: true, message: '请输入用户名' }]"
            class="animate__animated animate__fadeInDown"
            style="animation-delay: 0.35s"
          >
            <template #label>
              <span class="input-label">用户名</span>
            </template>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
              </svg>
              <a-input
                v-model:value="formState.username"
placeholder="请输入用户ID或昵称"
                size="large"
                autocomplete="username"
                class="glass-input"
              />
            </div>
          </a-form-item>

          <a-form-item
            name="password"
            :rules="[{ required: true, message: '请输入密码' }]"
            class="animate__animated animate__fadeInDown"
            style="animation-delay: 0.45s"
          >
            <template #label>
              <span class="input-label">密码</span>
            </template>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none">
                <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="currentColor"/>
              </svg>
              <a-input-password
                v-model:value="formState.password"
                placeholder="请输入您的密码"
                size="large"
                autocomplete="current-password"
                class="glass-input"
              />
            </div>
          </a-form-item>

          <div class="form-footer animate__animated animate__fadeInDown" style="animation-delay: 0.55s">
            <a-checkbox v-model:checked="formState.rememberMe" class="remember-me">
              记住我
            </a-checkbox>
          </div>

          <a-form-item class="submit-wrapper animate__animated animate__zoomIn" style="animation-delay: 0.65s">
            <button
              type="submit"
              :disabled="loading"
              class="submit-button"
            >
              <span v-if="!loading" class="btn-content">
                <span>登录</span>
                <svg class="btn-arrow" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span v-else class="loading-content">
                <span class="spinner"></span>
                登录中
              </span>
            </button>
          </a-form-item>
        </a-form>

        <!-- Security badge -->
        <div class="security-info animate__animated animate__fadeIn" style="animation-delay: 0.75s">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" fill="currentColor" opacity="0.3"/>
            <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM19 11C19 15.52 16.02 19.69 12 20.93C7.98 19.69 5 15.52 5 11V6.3L12 3.19L19 6.3V11Z" fill="currentColor"/>
          </svg>
          <span>256位端对端加密保护</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/apis/auth'
import { getRealIpFromThirdParty } from '@/utils/ip'
import {
  saveUserInfo,
  saveLoginCredentials,
  getLoginCredentials,
  clearLoginCredentials
} from '@/utils/storage'
import { Message } from '@/utils/message'

const router = useRouter()

interface FormState {
  username: string
  password: string
  rememberMe: boolean
}

const formState = reactive<FormState>({
  username: '',
  password: '',
  rememberMe: false
})

const loading = ref(false)

onMounted(() => {
  const savedCreds = getLoginCredentials()
  if (savedCreds) {
    formState.username = savedCreds.username
    formState.password = savedCreds.password
    formState.rememberMe = true
  }
})

const handleLogin = async () => {
  loading.value = true

  try {
    const clientIp = await getRealIpFromThirdParty()
    console.log('获取到的客户端IP:', clientIp || '使用后端获取')

    const requestData: any = {
      username: formState.username,
      password: formState.password
    }

    if (clientIp) {
      requestData.client_ip = clientIp
    }

    const response = await login(requestData)
    const result = response.data

    console.log('🔍 后端返回的完整响应:', result)

    if (result.code === 0) {
      console.log('登录成功，前端接收到的数据:', result)

      if (!result.token) {
        console.error('❌ 后端未返回token')
        Message.error('登录失败：未获取到token')
        return
      }

      const userInfo = {
        id: result.data.id,
        nick_name: result.data.nick_name,
        avatar: result.data.avatar,
        token: result.token
      }

      saveUserInfo(userInfo)

      const saved = localStorage.getItem('userInfo')
      console.log('✅ 验证保存结果:', saved)

      console.log('🍪 检查Cookie:', document.cookie)
      const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='))
      if (tokenCookie) {
        console.log('✅ Token已保存到Cookie:', tokenCookie)
      } else {
        console.warn('⚠️ Cookie中未找到token')
      }

      if (formState.rememberMe) {
        saveLoginCredentials({
          username: formState.username,
          password: formState.password
        })
      } else {
        clearLoginCredentials()
      }

      Message.success('登录成功')

      setTimeout(() => {
        router.push('/')
      }, 100)
    } else if (result.code === 403) {
      Message.error('账号无限期停用')
    } else {
      console.log('登录失败:', result.msg)
      Message.error(result.msg || '登录失败')
    }
  } catch (error: any) {
    console.error('登录失败:', error)
    Message.error('请求失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
/* San Francisco font fallback */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f7;
}

/* Vibrant gradient background - essential for glassmorphism */
.vibrant-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  top: -10%;
  left: -10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  bottom: -10%;
  right: -5%;
  animation-delay: -7s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  top: 40%;
  right: 20%;
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* Login container */
.login-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
}

/* Frosted glass card - Apple style */
.glass-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  box-shadow: 
    0 8px 32px rgba(31, 38, 135, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  position: relative;
  overflow: visible;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
}

/* Logo section */
.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-circle {
  width: 72px;
  height: 72px;
  margin: 0 auto 1rem;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3B82F6;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
  transition: transform 0.3s ease;
}

.logo-circle:hover {
  transform: scale(1.05);
}

.logo-circle svg {
  width: 40px;
  height: 40px;
}

.app-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1E293B;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.02em;
}

.app-subtitle {
  font-size: 0.9375rem;
  color: #64748B;
  margin: 0;
  font-weight: 400;
}

/* Form styles */
.login-form {
  margin-bottom: 1rem;
}

:deep(.ant-form-item) {
  margin-bottom: 1.25rem;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  display: block;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #94A3B8;
  z-index: 1;
  pointer-events: none;
}

:deep(.glass-input),
:deep(.ant-input-password) {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  padding-left: 3rem;
  font-size: 0.9375rem;
  color: #1E293B;
  transition: all 0.2s ease;
  height: 48px;
}

:deep(.ant-input-password .ant-input) {
  background: transparent;
  border: none;
  padding-left: 0;
}

:deep(.ant-input-password .ant-input-suffix) {
  margin-right: 0.5rem;
}

:deep(.glass-input::placeholder),
:deep(.ant-input-password .ant-input::placeholder) {
  color: #94A3B8;
}

:deep(.glass-input:hover),
:deep(.ant-input-password:hover) {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(59, 130, 246, 0.4);
}

:deep(.glass-input:focus),
:deep(.ant-input-password:focus-within),
:deep(.ant-input-focused) {
  background: rgba(255, 255, 255, 0.9);
  border-color: #3B82F6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

:deep(.ant-input-password-icon) {
  color: #94A3B8;
  transition: color 0.2s ease;
}

:deep(.ant-input-password-icon:hover) {
  color: #3B82F6;
}

/* Form footer */
.form-footer {
  margin-bottom: 1.5rem;
}

:deep(.remember-me) {
  font-size: 0.875rem;
  color: #475569;
}

:deep(.ant-checkbox-inner) {
  border-radius: 6px;
  border-color: #CBD5E1;
  background: rgba(255, 255, 255, 0.8);
}

:deep(.ant-checkbox-checked .ant-checkbox-inner) {
  background: #3B82F6;
  border-color: #3B82F6;
}

/* Submit button */
.submit-wrapper {
  margin-bottom: 0;
}

.submit-button {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  color: #FFFFFF;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
  position: relative;
  overflow: hidden;
}

.submit-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(59, 130, 246, 0.4);
}

.submit-button:hover:not(:disabled)::before {
  opacity: 1;
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-button span {
  position: relative;
  z-index: 1;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-arrow {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.submit-button:hover:not(:disabled) .btn-arrow {
  transform: translateX(4px);
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Security info */
.security-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  color: #64748B;
  font-size: 0.8125rem;
}

.security-info svg {
  width: 18px;
  height: 18px;
  color: #3B82F6;
}

/* Responsive design */
@media (max-width: 640px) {
  .login-page {
    padding: 1rem;
  }

  .glass-card {
    padding: 2rem 1.5rem;
    border-radius: 18px;
  }

  .app-title {
    font-size: 1.5rem;
  }

  .logo-circle {
    width: 64px;
    height: 64px;
    border-radius: 16px;
  }

  .logo-circle svg {
    width: 36px;
    height: 36px;
  }

  .gradient-orb {
    filter: blur(60px);
  }

  .float-circle,
  .float-square,
  .glass-blob {
    display: none;
  }
}

@media (max-width: 380px) {
  .glass-card {
    padding: 1.75rem 1.25rem;
  }

  .app-title {
    font-size: 1.375rem;
  }

  :deep(.glass-input),
  :deep(.ant-input-password) {
    height: 44px;
  }

  .submit-button {
    height: 46px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .login-page {
    background: #1a1a1a;
  }

  .glass-card {
    background: rgba(30, 30, 30, 0.4);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .app-title {
    color: #F8FAFC;
  }

  .app-subtitle {
    color: #94A3B8;
  }

  .input-label {
    color: #E2E8F0;
  }

  :deep(.glass-input),
  :deep(.ant-input-password) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    color: #F8FAFC;
  }

  :deep(.glass-input::placeholder),
  :deep(.ant-input-password .ant-input::placeholder) {
    color: #64748B;
  }

  :deep(.remember-me) {
    color: #CBD5E1;
  }

  .security-info {
    color: #94A3B8;
    border-top-color: rgba(255, 255, 255, 0.1);
  }
}

/* Accessibility - Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate__animated {
    animation: none !important;
  }
}
</style>

