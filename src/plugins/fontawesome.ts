/**
 * FontAwesome 图标插件
 * 统一管理所有 FontAwesome 图标的注册
 */
import type { App } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// 导入所有需要的图标
import {
  faUser,
  faLock,
  faHome,
  faCog,
  faPlus,
  faMinus,
  faRefresh,
  faSearch,
  faEdit,
  faTrash,
  faSave,
  faCheck,
  faTimes,
  faEye,
  faEyeSlash,
  faDownload,
  faUpload,
  faArrowLeft,
  faArrowRight,
  faComments,
  faCommentDots,
  faShieldAlt,
  faSignOutAlt,
  faRightFromBracket,
  faHeart,
  faChartLine,
  faClock,
  faGift,
  faBell,
  faSpinner,
  faImage,
  faVideo,
  faFileAlt,
  faStar,
  faCrown
} from '@fortawesome/free-solid-svg-icons'

/**
 * FontAwesome 插件安装函数
 */
export default {
  install(app: App) {
    // 将所有图标添加到库中
    library.add(
      faUser,
      faLock,
      faHome,
      faCog,
      faPlus,
      faMinus,
      faRefresh,
      faSearch,
      faEdit,
      faTrash,
      faSave,
      faCheck,
      faTimes,
      faEye,
      faEyeSlash,
      faDownload,
      faUpload,
      faArrowLeft,
      faArrowRight,
      faComments,
      faCommentDots,
      faShieldAlt,
      faSignOutAlt,
      faRightFromBracket,
      faHeart,
      faChartLine,
      faClock,
      faGift,
      faBell,
      faSpinner,
      faImage,
      faVideo,
      faFileAlt,
      faStar,
      faCrown
    )

    // 注册全局组件
    app.component('font-awesome-icon', FontAwesomeIcon)
  }
}
