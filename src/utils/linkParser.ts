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
 * 将文本中的链接转换为可点击的 HTML
 */
export function linkify(text: string): string {
  if (!text) return ''
  return text.replace(URL_REGEX, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="message-link">${url}</a>`
  })
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
 * 分离文本和URL - 返回纯文本和URL数组
 */
export function separateTextAndUrls(text: string): { text: string; urls: string[] } {
  if (!text) return { text: '', urls: [] }
  
  const urls: string[] = []
  const urlMatches = Array.from(text.matchAll(URL_REGEX))
  
  // 提取所有URL（去重）
  urlMatches.forEach(match => {
    if (!urls.includes(match[0])) {
      urls.push(match[0])
    }
  })
  
  // 移除URL后的纯文本
  let pureText = text
  urls.forEach(url => {
    pureText = pureText.replace(url, '').trim()
  })
  
  return {
    text: pureText,
    urls: urls
  }
}
