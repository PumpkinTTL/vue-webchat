/**
 * 链接解析工具
 */

// URL 正则表达式 - 匹配 http/https 链接
const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/gi

/**
 * 从文本中提取所有 URL
 */
export function extractUrls(text: string): string[] {
  if (!text) return []
  const matches = text.match(URL_REGEX)
  return matches ? [...new Set(matches)] : [] // 去重
}

/**
 * 从文本中提取第一个 URL
 */
export function extractFirstUrl(text: string): string | null {
  const urls = extractUrls(text)
  return urls.length > 0 ? urls[0] : null
}

/**
 * 验证 URL 是否有效
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * 检查文本是否包含链接
 */
export function hasUrl(text: string): boolean {
  if (!text) return false
  URL_REGEX.lastIndex = 0 // 重置正则状态
  return URL_REGEX.test(text)
}

/**
 * 分离文本和URL - 返回纯文本和URL数组（优化版）
 */
export function separateTextAndUrls(text: string): { text: string; urls: string[] } {
  if (!text) return { text: '', urls: [] }
  
  // 使用 Set 自动去重
  const urlSet = new Set<string>()
  let pureText = text
  
  // 一次遍历完成提取和替换
  pureText = text.replace(URL_REGEX, (url) => {
    urlSet.add(url)
    return '' // 移除 URL
  })
  
  // 清理多余的空格
  pureText = pureText.replace(/\s+/g, ' ').trim()
  
  return {
    text: pureText,
    urls: Array.from(urlSet)
  }
}
