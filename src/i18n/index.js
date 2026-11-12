import { createI18n } from 'vue-i18n'
import Avue from '@smallwei/avue'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

const STORAGE_KEY = 'dw-locale'
const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : ''
const initial = saved === 'en-US' || saved === 'zh-CN' ? saved : 'zh-CN'

Avue.locale.use(initial === 'en-US' ? 'en' : 'zh-cn')

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: initial,
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  },
  missingWarn: false,
  fallbackWarn: false
})

export function setLocale(locale) {
  i18n.global.locale.value = locale
  Avue.locale.use(locale === 'en-US' ? 'en' : 'zh-cn')
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale === 'en-US' ? 'en' : 'zh-CN'
  }
}

export const localeOptions = [
  { value: 'zh-CN', label: '简体中文', short: '中文' },
  { value: 'en-US', label: 'English', short: 'EN' }
]

if (typeof document !== 'undefined') {
  document.documentElement.lang = initial === 'en-US' ? 'en' : 'zh-CN'
}
