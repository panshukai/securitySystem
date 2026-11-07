<script setup>
import PageHeader from '@/components/PageHeader.vue'
import AppIcon from '@/components/AppIcon.vue'

defineProps({
  title: { type: String, default: '功能页面' },
  subtitle: { type: String, default: '' }
})
</script>

<template>
  <div>
    <PageHeader :title="title" subtitle="演示占位页" />
    <div class="dw-card placeholder">
      <AppIcon name="layers" :size="44" style="color: #c9d4e4" />
      <div class="placeholder__title">{{ title }}</div>
      <div class="placeholder__desc">
        {{ subtitle || '该页面暂未在首版范围内实现，可在确认整体方案后继续补充。' }}
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
