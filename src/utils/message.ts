/**
 * 消息提示工具
 */
import { message } from 'ant-design-vue'

export const Message = {
  success(content: string) {
    message.success(content)
  },
  
  error(content: string) {
    message.error(content)
  },
  
  warning(content: string) {
    message.warning(content)
  },
  
  info(content: string) {
    message.info(content)
  }
}
