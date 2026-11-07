<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import AppIcon from '@/components/AppIcon.vue'
import OrgTreePanel from '@/components/OrgTreePanel.vue'
import { useVideoStore } from '@/stores/video'

const route = useRoute()
const store = useVideoStore()
const videoCard = ref(null)
const now = ref('')
let timer = null

const cols = computed(() => {
  if (store.mode === 'single') return 1
  return store.split === 4 ? 2 : store.split === 9 ? 3 : 4
})

const rows = computed(() => {
  if (store.mode === 'single') return 1
  return store.split === 4 ? 2 : store.split === 9 ? 3 : 4
})

const activeChannelId = computed(() => store.panes[store.active]?.id || '')

function tick() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  now.value = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

onMounted(async () => {
  tick()
  timer = setInterval(tick, 1000)
  await store.loadTree()
  if (route.query.channel) {
    store.loadByName(String(route.query.channel))
  }
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

function onSelectChannel(node) {
  store.loadChannelToActive(node)
  ElMessage.success(`「${node.name}」已加载到窗格 ${store.active + 1}`)
}

function setSplit(n) {
  store.setSplit(n)
}

function feedOf(index) {
  const pane = store.panes[index]
  if (!pane) return { hasImage: false, style: {} }
  let img = 'area-1'
  if (pane.name.includes('充电')) img = 'area-3'
  else if (pane.name.includes('异常')) img = 'area-4'
  else if (pane.name.includes('自营') || pane.name.includes('合作') || pane.name.includes('资产')) img = 'area-2'
  return {
    hasImage: true,
    style: { backgroundImage: `url(${import.meta.env.BASE_URL}cameras/${img}.jpg)` }
  }
}

function placeholder(name) {
  ElMessage.info(`「${name}」为演示占位`)
}

async function toggleFullscreen() {
  const el = videoCard.value
  if (!el) return
  if (!document.fullscreenElement) {
    await el.requestFullscreen?.()
  } else {
    await document.exitFullscreen?.()
  }
}
</script>

<template>
  <div class="live-page">
    <PageHeader title="实时预览" subtitle="GB28181 国标设备接入 · 浏览器免插件播放">
      <div class="seg">
        <span :class="{ on: store.mode === 'multi' }" @click="store.setMode('multi')">多画面</span>
        <span :class="{ on: store.mode === 'single' }" @click="store.setMode('single')">单画面</span>
      </div>
      <div class="seg">
        <span :class="{ on: store.split === 4 && store.mode !== 'single' }" @click="setSplit(4)">
          <AppIcon name="grid" :size="13" /> 四分屏
        </span>
        <span :class="{ on: store.split === 9 && store.mode !== 'single' }" @click="setSplit(9)">
          <AppIcon name="grid" :size="13" /> 九分屏
        </span>
        <span :class="{ on: store.split === 16 && store.mode !== 'single' }" @click="setSplit(16)">
          <AppIcon name="grid" :size="13" /> 十六分屏
        </span>
        <span @click="placeholder('自定义分屏')"><AppIcon name="grid" :size="13" /> 自定义</span>
      </div>
      <span class="icon-btn" @click="toggleFullscreen"><AppIcon name="full" :size="17" /></span>
    </PageHeader>

    <div class="video-layout">
      <div class="dw-card tree-card">
        <OrgTreePanel
          title="资源目录"
          :data="store.root ? [store.root] : []"
          :selected-key="activeChannelId"
          search-placeholder="请输入仓点名称或通道名称"
          @select="onSelectChannel"
        />
      </div>

      <div ref="videoCard" class="dw-card video-card">
        <div
          class="dw-video-grid"
          :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0,1fr))` }"
        >
          <div
            v-for="i in store.visibleCount"
            :key="i"
            class="dw-video-pane"
            :class="{ 'is-active': store.active === i - 1 }"
            @click="store.setActive(i - 1)"
          >
            <template v-if="store.panes[i - 1]">
              <div
                class="dw-video-pane__feed"
                :class="{ 'has-image': feedOf(i - 1).hasImage }"
                :style="feedOf(i - 1).style"
              />
              <div class="dw-video-pane__top">
                <span class="dw-video-pane__dot" />
                <span>{{ store.panes[i - 1].name }}</span>
                <span class="dw-video-pane__time">{{ now }}</span>
              </div>
            </template>
            <div v-else class="dw-video-pane__empty">
              <AppIcon name="cam" :size="30" />
              <span>请从左侧资源树选择通道</span>
              <small>点击选中该窗格后再点通道即可加载</small>
            </div>
          </div>
        </div>

        <div class="video-bar">
          <span class="bar-icon" title="播放/停止" @click="placeholder('播放/停止')"><AppIcon name="play" :size="15" /></span>
          <span class="bar-icon" title="截图" @click="placeholder('截图')"><AppIcon name="snap" :size="15" /></span>
          <span class="bar-icon" title="录像" @click="placeholder('录像')"><AppIcon name="rec" :size="15" /></span>
          <span class="bar-icon" title="声音" @click="placeholder('声音')"><AppIcon name="audio" :size="15" /></span>
          <span class="bar-icon" title="云台控制" @click="placeholder('云台控制')"><AppIcon name="ptz" :size="15" /></span>
          <span class="bar-icon" title="分屏调整" @click="placeholder('分屏调整')"><AppIcon name="grid" :size="15" /></span>
          <span class="stream" @click="placeholder('码流切换')">主码流 ⌄</span>
          <span class="bar-icon bar-full" @click="toggleFullscreen"><AppIcon name="full" :size="16" /></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.live-page {
  height: calc(100vh - 118px);
  display: flex;
  flex-direction: column;
}

.video-layout {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 14px;
}

.tree-card {
  padding: 14px 12px;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.video-card {
  padding: 10px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #fff;
}

.dw-video-grid {
  flex: 1;
}

.video-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 6px 8px 2px;
  color: #5a6b85;
  flex-shrink: 0;
}

.bar-icon {
  display: inline-flex;
  cursor: pointer;
}

.bar-icon:hover {
  color: #1a66ff;
}

.bar-full {
  margin-left: 4px;
}

.stream {
  margin-left: auto;
  font-size: 12px;
  border: 1px solid #d5deeb;
  border-radius: 4px;
  padding: 2px 10px;
  cursor: pointer;
  color: #3a4a5f;
}

.stream:hover {
  border-color: #1a66ff;
  color: #1a66ff;
}

.seg {
  display: flex;
  border: 1px solid #d5deeb;
  border-radius: 5px;
  overflow: hidden;
}

.seg span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 13px;
  font-size: 13px;
  cursor: pointer;
  color: #5a6b85;
  background: #fff;
  white-space: nowrap;
}

.seg span + span {
  border-left: 1px solid #d5deeb;
}

.seg span.on {
  background: #1a66ff;
  color: #fff;
}

.seg span:not(.on):hover {
  color: #1a66ff;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d5deeb;
  border-radius: 5px;
  color: #3a4a5f;
  cursor: pointer;
}

.icon-btn:hover {
  border-color: #1a66ff;
  color: #1a66ff;
}
</style>
