import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  withCredentials: true, // 允许携带 cookie
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在发送请求之前做些什么
    
    // 登录接口不需要添加 token
    const isLoginRequest = config.url?.includes('/user/login')
    
    if (!isLoginRequest) {
      try {
        const userInfo = localStorage.getItem('userInfo')
        if (userInfo) {
          const { token } = JSON.parse(userInfo)
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
      } catch (error) {
        console.error('获取token失败:', error)
      }
    }
    
    console.log('📤 发送请求:', config.url, config.data)
    return config
  },
  (error) => {
    // 对请求错误做些什么
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 直接返回响应的 data 部分（后端返回的 JSON 数据）
    console.log('📥 API响应:', response.config.url, response.data)
    return response.data
  },
  (error) => {
    // 对响应错误做点什么
    console.error('Response error:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          console.error('未授权，请重新登录')
          // 清除token并跳转到登录页
          localStorage.removeItem('userInfo')
          window.location.href = '/login'
          break
        case 403:
          console.error('拒绝访问')
          break
        case 404:
          console.error('请求地址出错')
          break
        case 500:
          console.error('服务器内部错误')
          break
        default:
          console.error(data?.msg || '请求失败')
      }
    } else if (error.request) {
      console.error('网络错误，请检查网络连接')
    } else {
      console.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

// 导出类型安全的request函数
export default function request<T = any>(config: any): Promise<T> {
  return service(config)
}
