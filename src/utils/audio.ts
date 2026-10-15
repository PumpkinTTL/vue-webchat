/**
 * 音频处理工具函数
 */

/**
 * 获取音频时长
 * @param file 音频文件
 * @returns Promise<number> 音频时长（秒）
 */
export const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio')
    audio.preload = 'metadata'

    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(audio.src)
      resolve(Math.floor(audio.duration))
    }

    audio.onerror = () => {
      URL.revokeObjectURL(audio.src)
      reject(new Error('无法读取音频信息'))
    }

    audio.src = URL.createObjectURL(file)
  })
}

/**
 * 验证音频文件
 * @param file 文件对象
 * @returns 验证结果
 */
export const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  // 检查文件类型
  const allowedTypes = [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
    'audio/ogg', 'audio/aac', 'audio/mp4', 'audio/webm'
  ]
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '不支持的音频格式，请上传 MP3、WAV、OGG、AAC、M4A 或 WebM 格式的音频'
    }
  }

  // 检查文件大小（50MB）
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '音频文件过大，最大支持 50MB'
    }
  }

  return { valid: true }
}
