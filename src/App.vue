<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

const route = useRoute()
const { locale, t, te } = useI18n()
const epLocale = computed(() => (locale.value === 'en-US' ? en : zhCn))

function currentTitle() {
  if (route.path === '/login') return t('page.login.title')
  if (route.path === '/event/center') return t('page.event.title')
  const key = `menu.${route.path.replace(/^\//, '').replace(/\//g, '.')}`
  return te(key) ? t(key) : route.meta.title || ''
}

watch(
  [locale, () => route.path],
  () => {
    const title = currentTitle()
    document.title = title ? `${title} · ${t('app.name')}` : t('app.name')
  },
  { immediate: true }
)
</script>

<template>
  <el-config-provider :locale="epLocale">
    <router-view />
  </el-config-provider>
</template>
