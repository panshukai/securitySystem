<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps({
  title: { type: String, default: '功能页面' },
  subtitle: { type: String, default: '' }
})

const route = useRoute()
const { t, te } = useI18n()
const pageTitle = computed(() => {
  const key = `menu.${route.path.replace(/^\//, '').replace(/\//g, '.')}`
  return te(key) ? t(key) : props.title
})
</script>

<template>
  <div>
    <PageHeader :title="pageTitle" :subtitle="t('page.placeholder.subtitle')" />
    <div class="dw-card placeholder">
      <AppIcon name="layers" :size="44" style="color: #c9d4e4" />
      <div class="placeholder__title">{{ pageTitle }}</div>
      <div class="placeholder__desc">
        {{ props.subtitle || t('page.placeholder.desc') }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.placeholder {
  padding: 64px 0;
  text-align: center;
  color: var(--dw-text-3);
}

.placeholder__title {
  margin-top: 14px;
  font-size: 15px;
  color: #3a4a5f;
}

.placeholder__desc {
  margin-top: 6px;
  font-size: 12px;
}
</style>
