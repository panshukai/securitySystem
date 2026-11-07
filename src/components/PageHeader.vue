<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' }
})
</script>

<template>
  <div class="dw-page-head">
    <span class="dw-page-head__title">{{ title }}</span>
    <span v-if="subtitle" class="dw-page-head__sub">{{ subtitle }}</span>
    <div class="dw-page-head__right">
      <slot />
    </div>
  </div>
</template>
