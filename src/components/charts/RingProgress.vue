<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const props = defineProps({
  percent: { type: Number, default: 93.5 },
  color: { type: String, default: '#18a058' },
  height: { type: Number, default: 86 }
})

const option = computed(() => ({
  animationDuration: 600,
  series: [
    {
      type: 'pie',
      radius: ['72%', '92%'],
      center: ['50%', '50%'],
      silent: true,
      label: { show: false },
      labelLine: { show: false },
      data: [
        {
          value: props.percent,
          itemStyle: { color: props.color, borderRadius: 10 }
        },
        {
          value: 100 - props.percent,
          itemStyle: { color: '#edf1f7' }
        }
      ]
    }
  ],
  graphic: [
    {
      type: 'text',
      left: 'center',
      top: '38%',
      style: {
        text: `${props.percent}%`,
        fill: '#1f2d3d',
        fontSize: 15,
        fontWeight: 700,
        textAlign: 'center'
      }
    }
  ]
}))
</script>

<template>
  <BaseChart :option="option" :height="height" />
</template>
