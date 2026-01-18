import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from './App.vue'

// 样式导入
// 注意：使用 SASS 主题定制时，不要导入 element-plus/dist/index.css
// Element Plus 的样式会通过 vite.config.ts 中的配置自动处理
import 'animate.css'
import 'ant-design-vue/dist/reset.css'

// 插件导入
import fontawesomePlugin from '@/plugins/fontawesome'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(fontawesomePlugin)

app.mount('#app')
