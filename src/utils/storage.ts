/**
 * 本地存储工具
 */

export interface UserInfo {
  id: number
  nick_name: string
  avatar: string
  token: string
}

export interface LoginCredentials {
  username: string
  password: string
}

/**
 * 保存用户信息
 */
export function saveUserInfo(userInfo: UserInfo): void {
  try {
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    console.log('✅ 用户信息已保存到本地存储:', userInfo)
  } catch (error) {
    console.error('保存用户信息失败:', error)
  }
}

/**
 * 获取用户信息
 */
export function getUserInfo(): UserInfo | null {
  try {
    const userInfo = localStorage.getItem('userInfo')
    return userInfo ? JSON.parse(userInfo) : null
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

/**
 * 清除用户信息
 */
export function clearUserInfo(): void {
  localStorage.removeItem('userInfo')
}

/**
 * 保存登录凭证（记住我）
 */
export function saveLoginCredentials(credentials: LoginCredentials): void {
  try {
    localStorage.setItem('login_credentials', JSON.stringify(credentials))
  } catch (error) {
    console.error('保存登录凭证失败:', error)
  }
}

/**
 * 获取登录凭证
 */
export function getLoginCredentials(): LoginCredentials | null {
  try {
    const credentials = localStorage.getItem('login_credentials')
    return credentials ? JSON.parse(credentials) : null
  } catch (error) {
    console.error('获取登录凭证失败:', error)
    localStorage.removeItem('login_credentials')
    return null
  }
}

/**
 * 清除登录凭证
 */
export function clearLoginCredentials(): void {
  localStorage.removeItem('login_credentials')
}

/**
 * 获取 token
 */
export function getToken(): string | null {
  const userInfo = getUserInfo()
  return userInfo?.token || null
}
