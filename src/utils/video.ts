/**
 * 视频处理工具函数
 */

/**
 * 获取视频时长
 * @param file 视频文件
 * @returns Promise<number> 视频时长（秒）
 */
export const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(Math.floor(video.duration))
    }
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('无法读取视频信息'))
    }
    
    video.src = URL.createObjectURL(file)
  })
}

/**
 * 格式化视频时长
 * @param seconds 秒数
 * @returns 格式化后的时长字符串（如 "1:23" 或 "12:34"）
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds < 0) return '0:00'
  
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * 验证视频文件
 * @param file 文件对象
 * @returns 验证结果
 */
export const validateVideoFile = (file: File): { valid: boolean; error?: string } => {
  // 检查文件类型：MIME 或扩展名任一命中即通过
  // （部分浏览器对 .mp4 可能给出 video/x-m4v 或空 type，用扩展名兜底避免误拒）
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-m4v']
  const allowedExts = ['mp4', 'webm', 'ogv', 'ogg', 'mov', 'm4v']
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
    return {
      valid: false,
      error: '不支持的视频格式，请上传 MP4、WebM、OGG 或 MOV 格式的视频'
    }
  }
  
  // 检查文件大小（200MB）
  const maxSize = 200 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '视频文件过大，最大支持 200MB'
    }
  }
  
  return { valid: true }
}
