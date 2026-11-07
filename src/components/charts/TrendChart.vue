<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  labels: { type: Array, default: () => [] },
  height: { type: Number, default: 190 }
})

const option = computed(() => ({
  animationDuration: 500,
  grid: { left: 44, right: 16, top: 18, bottom: 26 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(15,32,60,.92)',
    borderWidth: 0,
    textStyle: { color: '#fff', fontSize: 12 },
    axisPointer: { lineStyle: { color: '#b9cdf0', type: 'dashed' } }
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.labels,
    axisLine: { lineStyle: { color: '#e6eaf2' } },
    axisTick: { show: false },
    axisLabel: { color: '#9aa8bd', fontSize: 10 }
  },
  yAxis: {
    type: 'value',
    max: 250,
    interval: 50,
    axisLabel: { color: '#9aa8bd', fontSize: 10 },
    splitLine: { lineStyle: { color: '#eef1f7' } }
  },
  series: [
    {
      type: 'line',
      data: props.data,
      smooth: 0.35,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: '#fff', borderColor: '#1a66ff', borderWidth: 2 },
      lineStyle: { color: '#1a66ff', width: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(26,102,255,.26)' },
            { offset: 1, color: 'rgba(26,102,255,0)' }
          ]
        }
      }
    }
  ]
}))
</script>

<template>
  <BaseChart :option="option" :height="height" />
</template>
