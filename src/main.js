import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import Avue from '@smallwei/avue'
import 'element-plus/dist/index.css'
import '@smallwei/avue/lib/index.css'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

import App from './App.vue'
import router from './router'
import { i18n } from './i18n'

import './styles/tokens.less'
import './styles/element-overrides.less'
import './styles/base.less'
import './styles/video.less'

dayjs.locale('zh-cn')

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(ElementPlus)
app.use(Avue)
app.mount('#app')
