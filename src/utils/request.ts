import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'ant-design-vue'

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

    // 如果是FormData请求，删除Content-Type让Axios自动设置（带boundary）
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type']
      }

      // 打印FormData内容（调试用）
      for (let [key, value] of config.data.entries()) {
      }
    }

    // 暂时注释掉 Authorization header，只使用 Cookie 传递 token
    // 登录接口不需要添加 token
    // const isLoginRequest = config.url?.includes('/user/login')

    // if (!isLoginRequest) {
    //   try {
    //     const userInfo = localStorage.getItem('userInfo')
    //     if (userInfo) {
    //       const { token } = JSON.parse(userInfo)
    //       if (token && config.headers) {
    //         config.headers.Authorization = `Bearer ${token}`
    //       }
    //     }
    //   } catch (error) {
    //     console.error('获取token失败:', error)
    //   }
    // }

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
    return response.data
  },
  (error) => {
    // 对响应错误做点什么
    console.error('Response error:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      // 优先处理 401 未授权错误
      if (status === 401) {
        console.error('登录已过期，请重新登录')
        // 清除token并跳转到登录页
        localStorage.removeItem('userInfo')
        // 显示提示
        message.error('登录已过期，请重新登录')
        // 延迟跳转，让用户看到提示
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
        return Promise.reject(error)
      }
      
      // 如果后端返回了结构化的错误信息（包含 code 和 msg/message），直接返回
      // 这样前端可以通过 result.code 判断，而不是进入 catch 块
      if (data && typeof data === 'object' && ('code' in data || 'msg' in data || 'message' in data)) {
        console.error('后端业务错误:', data.msg || data.message)
        // 返回 resolved promise，让业务代码通过 result.code 判断
        return Promise.resolve(data)
      }
      
      // 否则根据 HTTP 状态码处理
      switch (status) {
        case 400:
          // 业务错误，返回后端的响应数据（包含code和msg）
          console.error('业务错误:', data?.msg || '请求失败')
          return Promise.resolve(data)
        case 403:
          console.error('拒绝访问')
          break
        case 404:
          console.error('请求地址出错')
          break
        case 500:
          console.error('服务器内部错误:', data?.msg || data?.message || '服务器错误')
          // 如果有后端返回的数据，返回它
          if (data) {
            return Promise.resolve(data)
          }
          break
        default:
          console.error(data?.msg || data?.message || '请求失败')
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
