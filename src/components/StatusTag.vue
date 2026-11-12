<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  text: { type: String, default: '' },
  tone: { type: String, default: '' }
})

const TONES = {
  高: 'red',
  中: 'orange',
  低: 'green',
  紧急: 'red',
  告警: 'orange',
  提示: 'blue',
  待处置: 'red',
  处置中: 'blue',
  已处置: 'green',
  在线: 'green',
  离线: 'gray',
  已生效: 'green',
  下发成功: 'green',
  在职: 'green',
  临时: 'blue',
  启用: 'green',
  停用: 'gray',
  正常: 'green',
  异常: 'red'
}

const STATUS_KEYS = {
  待处置: 'pending',
  处置中: 'processing',
  已处置: 'done',
  在线: 'online',
  离线: 'offline',
  已生效: 'effective',
  在职: 'active',
  临时: 'temporary',
  停用: 'disabled',
  启用: 'enabled',
  下发成功: 'issued',
  高: 'high',
  中: 'medium',
  低: 'low',
  正常: 'normal',
  异常: 'abnormal',
  待采集: 'waiting'
}

const finalTone = computed(() => props.tone || TONES[props.text] || 'gray')
const label = computed(() => {
  const key = STATUS_KEYS[props.text]
  return key ? t(`status.${key}`) : props.text
})
</script>

<template>
  <span class="status-tag" :class="`is-${finalTone}`">{{ label }}</span>
</template>

<style scoped lang="less">
.status-tag {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 9px;
  border-radius: 3px;
  font-size: 11px;
  line-height: 22px;
  white-space: nowrap;
}

.is-red {
  background: #fde9e9;
  color: #e23c3c;
}

.is-orange {
  background: #fff3e0;
  color: #f08c00;
}

.is-green {
  background: #e6f7ee;
  color: #18a058;
}

.is-blue {
  background: #e8f0ff;
  color: #1a66ff;
}

.is-gray {
  background: #f2f4f8;
  color: #8a97a8;
}
</style>
