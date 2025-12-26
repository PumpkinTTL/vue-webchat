import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from './App.vue'

// 样式导入
// 注意：使用 SASS 主题定制时，不要导入 element-plus/dist/index.css
// Element Plus 的样式会通过 vite.config.ts 中的配置自动处理
import 'animate.css'
import '@/style.css'

// Font Awesome 图标
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
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
  faArrowRight
} from '@fortawesome/free-solid-svg-icons'

// 添加图标到库
library.add(
  faUser, faLock, faHome, faCog, faPlus, faMinus, faRefresh,
  faSearch, faEdit, faTrash, faSave, faCheck, faTimes,
  faEye, faEyeSlash, faDownload, faUpload, faArrowLeft, faArrowRight
)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
