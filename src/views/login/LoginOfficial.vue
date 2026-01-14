<template>
  <div class="official-login">
    <!-- Single unified card with brand content on left and form on right -->
    <div class="unified-login-card">
      <!-- Left side - Brand content (hidden on mobile) -->
      <div class="card-brand-section">
        <div class="brand-content animate__animated animate__fadeInLeft">
          <div class="brand-header animate__animated animate__zoomIn" style="animation-delay: 0.2s">
            <div class="brand-logo">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7V12C2 17.55 5.84 22.74 11 24C16.16 22.74 20 17.55 20 12V7L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <div class="brand-info">
              <h1 class="brand-title">Secure Chat</h1>
              <p class="brand-tagline">企业级端对端加密通讯平台</p>
            </div>
          </div>
          
          <!-- Feature list -->
          <div class="feature-list">
            <div class="feature-item animate__animated animate__fadeInUp" style="animation-delay: 0.5s">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </div>
              <div class="feature-text">
                <h3>端对端加密</h3>
                <p>军事级 AES-256 加密保护</p>
              </div>
            </div>
            
            <div class="feature-item animate__animated animate__fadeInUp" style="animation-delay: 0.6s">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="feature-text">
                <h3>实时通讯</h3>
                <p>毫秒级消息送达</p>
              </div>
            </div>
            
            <div class="feature-item animate__animated animate__fadeInUp" style="animation-delay: 0.7s">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="feature-text">
                <h3>团队协作</h3>
                <p>支持多人群组聊天</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side - Login form -->
      <div class="card-form-section">
        <div class="form-header">
          <div class="header-card animate__animated animate__fadeInDown" style="animation-delay: 0.1s">
            <div class="header-top">
              <div class="security-badge">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="security-text">安全登录</span>
            </div>
            <p class="header-subtitle animate__animated animate__fadeInDown" style="animation-delay: 0.3s">
              请登录您的账户以继续使用
            </p>
          </div>
        </div>

        <a-form
          :model="formState"
          class="official-form"
          @finish="handleLogin"
        >
          <!-- 用户名 -->
          <div class="form-field-group animate__animated animate__fadeInUp" style="animation-delay: 0.4s">
            <a-form-item
              name="username"
              :rules="[{ required: true, message: '请输入用户名' }]"
            >
              <div class="field-wrapper">
                <label class="floating-label">用户名</label>
                <div class="field-box">
                  <svg class="field-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <input
                    v-model="formState.username"
                    type="text"
                    placeholder="请输入用户ID或昵称"
                    autocomplete="username"
                    class="field-input"
                  />
                </div>
              </div>
            </a-form-item>
          </div>

          <!-- 密码 -->
          <div class="form-field-group animate__animated animate__fadeInUp" style="animation-delay: 0.5s">
            <a-form-item
              name="password"
              :rules="[{ required: true, message: '请输入密码' }]"
            >
              <div class="field-wrapper">
                <label class="floating-label">密码</label>
                <div class="field-box">
                  <svg class="field-icon" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <input
                    v-model="formState.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="请输入您的密码"
                    autocomplete="current-password"
                    class="field-input"
                  />
                  <button
                    type="button"
                    class="password-toggle"
                    @click="showPassword = !showPassword"
                  >
                    <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4147 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.5719 9.14351 13.1984C8.99262 12.8248 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58525 10.1546 9.88 9.88" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </a-form-item>
          </div>

          <div class="form-options animate__animated animate__fadeInUp" style="animation-delay: 0.6s">
            <a-checkbox v-model:checked="formState.rememberMe">
              记住登录状态
            </a-checkbox>
            <a href="javascript:void(0)" class="forgot-link" @click.prevent>忘记密码？</a>
          </div>

          <div class="submit-group animate__animated animate__fadeInUp" style="animation-delay: 0.7s">
            <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              :loading="loading"
              size="large"
              block
              class="official-submit-btn"
            >
              <span v-if="!loading" class="btn-content">
                <span>登录</span>
                <svg class="btn-arrow" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span v-else>登录中...</span>
            </a-button>
          </a-form-item>
          </div>
        </a-form>

        <div class="form-footer animate__animated animate__fadeIn" style="animation-delay: 0.8s">
          <div class="divider">
            <span>或</span>
          </div>
          
          <div class="social-login">
            <button class="social-btn" type="button">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </button>
            <button class="social-btn" type="button">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            <button class="social-btn" type="button">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </button>
          </div>
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
const showPassword = ref(false)

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
    const requestData: any = {
      username: formState.username,
      password: formState.password
    }

    if (clientIp) {
      requestData.client_ip = clientIp
    }

    console.log('🔍 发送登录请求:', requestData)
    
    // axios 拦截器已经返回了 response.data，所以这里直接就是结果
    const result = await login(requestData)
    
    console.log('🔍 后端返回的完整响应:', result)
    console.log('🔍 result.code:', result.code)
    console.log('🔍 result.token:', result.token)

    if (result.code === 0) {
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

      console.log('✅ 保存用户信息:', userInfo)
      saveUserInfo(userInfo)

      if (formState.rememberMe) {
        saveLoginCredentials({
          username: formState.username,
          password: formState.password
        })
      } else {
        clearLoginCredentials()
      }

      Message.success('登录成功')
      
      // 延迟跳转，确保消息显示
      setTimeout(() => {
        console.log('🔄 准备跳转到首页')
        router.push('/')
      }, 500)
    } else if (result.code === 403) {
      Message.error('账号无限期停用')
    } else {
      Message.error(result.msg || '登录失败')
    }
  } catch (error: any) {
    console.error('❌ 登录请求失败:', error)
    Message.error('请求失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
@import './css/LoginOfficial.scss';
</style>
