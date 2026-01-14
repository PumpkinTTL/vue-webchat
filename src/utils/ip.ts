/**
 * IP 获取工具
 */

// 第三方IP获取接口配置
const IP_SERVICES = [
  { url: 'https://api.ipify.org?format=json', type: 'json' as const },
  { url: 'https://api.ipify.org', type: 'text' as const },
  { url: 'https://ifconfig.me/ip', type: 'text' as const },
]

/**
 * 从第三方接口获取真实IP（带超时控制）
 */
export async function getRealIpFromThirdParty(): Promise<string | null> {
  for (let i = 0; i < IP_SERVICES.length; i++) {
    try {
      console.log(`尝试IP服务 ${i + 1}:`, IP_SERVICES[i].url)

      // 创建超时控制器（3秒超时）
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch(IP_SERVICES[i].url, {
        method: 'GET',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.warn(`IP服务 ${i + 1} 响应失败:`, response.status)
        continue
      }

      let ip: string | null = null

      if (IP_SERVICES[i].type === 'json') {
        const data = await response.json()
        ip = data.ip
      } else {
        // 纯文本
        ip = await response.text()
        ip = ip.trim()
      }

      // 验证IP格式（支持IPv4和IPv6）
      if (ip && (/^[\d.]+$/.test(ip) || /^[0-9a-fA-F:]+$/.test(ip))) {
        console.log('成功获取IP:', ip)
        return ip
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn(`IP服务 ${i + 1} 超时`)
      } else {
        console.warn(`IP服务 ${i + 1} 失败:`, error.message)
      }
      continue
    }
  }

  // 所有服务都失败，返回null
  console.warn('所有IP服务都失败，将使用后端获取的IP')
  return null
}
