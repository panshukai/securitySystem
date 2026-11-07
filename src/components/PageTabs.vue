<script setup>
defineProps({
  tabs: { type: Array, default: () => [] },
  modelValue: { type: [String, Number], default: '' },
  plain: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change'])

function pick(tab) {
  emit('update:modelValue', tab.value)
  emit('change', tab.value)
}
</script>

<template>
  <div class="dw-tabs" :class="{ 'dw-tabs--plain': plain }">
    <div
      v-for="tab in tabs"
      :key="tab.value"
      class="dw-tab"
      :class="{ 'is-active': modelValue === tab.value }"
      @click="pick(tab)"
    >
      {{ tab.label }}
    </div>
  </div>
</template>
