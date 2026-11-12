<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  total: { type: String, default: '1,286' },
  centerLabel: { type: String, default: '事件总数' },
  height: { type: Number, default: 150 }
})

const option = computed(() => ({
  animationDuration: 500,
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(15,32,60,.92)',
    borderWidth: 0,
    textStyle: { color: '#fff', fontSize: 12 },
    formatter: '{b}<br/>{c}%'
  },
  series: [
    {
      type: 'pie',
      radius: ['58%', '82%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      labelLine: { show: false },
      data: props.data.map((d) => ({ name: d.name, value: d.percent, itemStyle: { color: d.color } }))
    }
  ],
  graphic: [
    {
      type: 'text',
      left: 'center',
      top: '41%',
      style: {
        text: props.total,
        fill: '#1f2d3d',
        fontSize: 18,
        fontWeight: 700,
        textAlign: 'center'
      }
    },
    {
      type: 'text',
      left: 'center',
      top: '56%',
      style: {
        text: props.centerLabel,
        fill: '#8a97a8',
        fontSize: 11,
        textAlign: 'center'
      }
    }
  ]
}))
</script>

<template>
  <BaseChart :option="option" :height="height" />
</template>
