<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import PageTabs from '@/components/PageTabs.vue'
import AppIcon from '@/components/AppIcon.vue'
import StatusTag from '@/components/StatusTag.vue'
import OrgTreePanel from '@/components/OrgTreePanel.vue'
import { useDeviceStore } from '@/stores/device'

const router = useRouter()
const store = useDeviceStore()
const { t } = useI18n()

const DEVICE_TYPE_KEYS = { 网络摄像机: 'camera', 门禁一体机: 'doorDevice', 存储NVR: 'nvr', 网络交换机: 'switch' }
const STAT_KEYS = { video: 'statVideo', door: 'statDoor', nvr: 'statNvr', network: 'statNetwork' }

function typeLabel(value) {
  return t(`deviceTypes.${DEVICE_TYPE_KEYS[value] || 'camera'}`)
}
function statLabel(key) {
  return t(`page.device.${STAT_KEYS[key] || 'statVideo'}`)
}
function statusLabel(value) {
  return t(`status.${value === '在线' ? 'online' : 'offline'}`)
}
const detailOpen = ref(true)
const narrow = ref(false)
let mq = null

function onMqChange(e) {
  narrow.value = e.matches
  detailOpen.value = !e.matches
}

const deviceTabs = computed(() => [
  { label: t('menu.device.overview'), value: '' },
  { label: t('page.device.tabVideo'), value: '网络摄像机' },
  { label: t('page.device.tabDoor'), value: '门禁一体机' },
  { label: t('page.device.tabStorage'), value: '存储NVR' },
  { label: t('page.device.tabNetwork'), value: '网络交换机' }
])

const typeIcon = {
  网络摄像机: 'cam',
  门禁一体机: 'door',
  存储NVR: 'nvr',
  网络交换机: 'net'
}

const selectedOrgId = computed(() => {
  if (!store.selectedOrg) return ''
  let found = ''
  const walk = (n) => {
    if (n.name === store.selectedOrg) found = n.id
    ;(n.children || []).forEach(walk)
  }
  if (store.tree) walk(store.tree)
  return found
})

onMounted(async () => {
  mq = window.matchMedia('(max-width: 1366px)')
  narrow.value = mq.matches
  detailOpen.value = !mq.matches
  mq.addEventListener('change', onMqChange)
  await Promise.all([store.loadTree(), store.loadStats(), store.loadList()])
})

onBeforeUnmount(() => {
  if (mq) mq.removeEventListener('change', onMqChange)
})

function onSelectOrg(node) {
  store.setOrg(node.name)
}

function preview(device) {
  if (!device?.channel) {
    ElMessage.warning(t('page.device.notSupport'))
    return
  }
  router.push({ path: '/video/live', query: { channel: device.channel } })
}

function selectDevice(row) {
  detailOpen.value = true
  store.selectDevice(row.id)
}

function todo(name) {
  ElMessage.info(t('page.device.demo', { name }))
}

const statusTab = ref('basic')
</script>

<template>
  <div class="device-page">
    <PageHeader :title="t('menu.device.overview')" :subtitle="t('page.device.subtitle')">
      <PageTabs :tabs="deviceTabs" :model-value="store.typeTab" @change="store.setType" />
    </PageHeader>

    <div class="device-layout" :class="{ 'no-detail': !detailOpen }">
      <div class="dw-card tree-card">
        <OrgTreePanel
          :title="t('page.device.orgTitle')"
          :data="store.tree ? [store.tree] : []"
          :selected-key="selectedOrgId"
          :search-placeholder="t('page.device.orgSearch')"
          @select="onSelectOrg"
        />
      </div>

      <div class="device-main">
        <div class="dev-stat">
          <div v-for="s in store.stats" :key="s.key" class="dw-card dw-stat dev-stat-card">
            <div class="dw-stat__icon" :class="s.tone">
              <AppIcon :name="s.icon" :size="22" />
            </div>
            <div>
              <div class="dw-stat__label">{{ statLabel(s.key) }}</div>
              <div class="dw-stat__num">{{ s.value }}</div>
              <div class="stat-dots">
                <span class="down">● {{ t('page.device.onlineShort') }} {{ s.online }}</span>
                <span class="flat">● {{ t('page.device.offlineShort') }} {{ s.offline }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="dw-card list-card">
          <div class="dw-toolbar">
            <el-button type="primary" size="small" @click="todo(t('page.device.addDevice'))">
              <AppIcon name="add" :size="14" style="margin-right: 5px" />{{ t('page.device.addDevice') }}
            </el-button>
            <el-button size="small" @click="todo(t('page.device.batch'))">
              <AppIcon name="list" :size="14" style="margin-right: 5px" />{{ t('page.device.batch') }}
            </el-button>
            <el-button size="small" @click="todo(t('page.device.config'))">
              <AppIcon name="gear" :size="14" style="margin-right: 5px" />{{ t('page.device.config') }}
            </el-button>
            <el-button size="small" @click="todo(t('page.device.maintain'))">
              <AppIcon name="wrench" :size="14" style="margin-right: 5px" />{{ t('page.device.maintain') }}
            </el-button>
            <el-button size="small" @click="todo(t('page.device.export'))">
              <AppIcon name="export" :size="14" style="margin-right: 5px" />{{ t('page.device.export') }}
            </el-button>
            <span class="grow" />
            <div class="dw-search" style="width: 190px">
              <el-input
                :model-value="store.keyword"
                size="small"
                :placeholder="t('page.device.searchPlaceholder')"
                clearable
                @update:model-value="store.setKeyword"
                @keyup.enter="store.loadList()"
              />
              <span class="dw-search__btn">
                <el-button size="small" @click="store.loadList()">
                  <AppIcon name="search" :size="13" />
                </el-button>
              </span>
            </div>
          </div>

          <el-table :data="store.list" v-loading="store.loading" class="compact-table device-table" style="width: 100%; margin-top: 10px">
            <el-table-column type="selection" width="24" />
            <el-table-column :label="t('page.device.colName')" width="136">
              <template #default="{ row }">
                <span class="dev-name" @click="selectDevice(row)">
                  <AppIcon :name="typeIcon[row.type] || 'device'" :size="14" style="color: #5a6b85" />
                  {{ row.name }}
                </span>
              </template>
            </el-table-column>
            <el-table-column :label="t('page.device.colType')" width="68">
              <template #default="{ row }">{{ typeLabel(row.type) }}</template>
            </el-table-column>
            <el-table-column prop="orgName" :label="t('page.device.colOrg')" width="106" show-overflow-tooltip />
            <el-table-column prop="ip" :label="t('page.device.colIp')" width="92" />
            <el-table-column :label="t('page.device.colStatus')" width="46">
              <template #default="{ row }">
                <StatusTag :text="row.status" />
              </template>
            </el-table-column>
            <el-table-column prop="model" :label="t('page.device.colModel')" width="100" />
            <el-table-column :label="t('common.actions')" width="116" fixed="right">
              <template #default="{ row }">
                <span class="ops-links">
                  <span class="dw-link" @click.stop="preview(row)">{{ t('page.device.preview') }}</span>
                  <span class="dw-link" @click.stop="todo(t('page.device.remoteConfig'))">{{ t('common.config') }}</span>
                  <span class="dw-link" @click.stop="selectDevice(row)">{{ t('common.more') }}</span>
                </span>
              </template>
            </el-table-column>
          </el-table>

          <div class="table-foot">
            <span class="dw-sub">{{ t('common.total', { n: store.total }) }}</span>
            <el-pagination
              background
              layout="prev, pager, next, sizes"
              :total="store.total"
              :current-page="store.page"
              :page-size="store.size"
              :page-sizes="[10, 20, 50]"
              :pager-count="5"
              @current-change="store.changePage"
              @size-change="store.changeSize"
            />
          </div>
        </div>
      </div>

      <div v-if="narrow && detailOpen" class="detail-backdrop" @click="detailOpen = false" />
      <div v-if="detailOpen" class="dw-card detail-card">
        <div class="detail-head">
          <span class="detail-title">{{ t('page.device.detailTitle') }}</span>
          <span class="detail-close" @click="detailOpen = false"><AppIcon name="close" :size="15" /></span>
        </div>
        <template v-if="store.current">
          <div class="detail-hero">
            <div class="detail-hero__icon">
              <AppIcon :name="typeIcon[store.current.type] || 'device'" :size="38" />
            </div>
            <div class="detail-hero__name">{{ store.current.name }}</div>
            <div class="detail-hero__type">
              {{ typeLabel(store.current.type) }}
              <StatusTag :text="store.current.status" style="margin-left: 6px" />
            </div>
          </div>
          <div class="dw-tabs detail-tabs">
            <div class="dw-tab" :class="{ 'is-active': statusTab === 'basic' }" @click="statusTab = 'basic'">{{ t('page.device.basic') }}</div>
            <div class="dw-tab" :class="{ 'is-active': statusTab === 'run' }" @click="statusTab = 'run'">{{ t('page.device.run') }}</div>
          </div>
          <template v-if="statusTab === 'basic'">
            <div v-for="item in [
              { k: t('page.device.fieldOrg'), v: store.current.orgName },
              { k: t('page.device.fieldModel'), v: store.current.model },
              { k: t('page.device.fieldSn'), v: store.current.sn },
              { k: t('page.device.fieldIp'), v: store.current.ip },
              { k: t('page.device.fieldAccess'), v: store.current.installedAt },
              { k: t('page.device.fieldFirmware'), v: store.current.firmware },
              { k: t('page.device.fieldLocation'), v: store.current.location }
            ]" :key="item.k" class="detail-field">
              <span class="k">{{ item.k }}</span>
              <span class="v">{{ item.v }}</span>
            </div>
          </template>
          <template v-else>
            <div v-for="item in [
              { k: t('page.device.fieldStatus'), v: t('page.device.runStatus') },
              { k: t('page.device.cpu'), v: '23%' },
              { k: t('page.device.memory'), v: '41%' },
              { k: t('page.device.stream'), v: `${t('page.video.mainStream')} 2048 Kbps` },
              { k: t('page.device.uptime'), v: t('page.device.uptimeValue') },
              { k: t('page.device.lastPatrol'), v: '2025-01-08 09:00' }
            ]" :key="item.k" class="detail-field">
              <span class="k">{{ item.k }}</span>
              <span class="v">{{ item.v }}</span>
            </div>
          </template>

          <div class="detail-actions">
            <div class="detail-action" @click="preview(store.current)">
              <AppIcon name="play" :size="18" />
              <span>{{ t('page.device.viewLive') }}</span>
            </div>
            <div class="detail-action" @click="todo(t('page.device.playback'))">
              <AppIcon name="rec" :size="18" />
              <span>{{ t('page.device.playback') }}</span>
            </div>
            <div class="detail-action" @click="todo(t('page.device.remoteConfig'))">
              <AppIcon name="ptz" :size="18" />
              <span>{{ t('page.device.remoteConfig') }}</span>
            </div>
          </div>
        </template>
        <div v-else class="dw-empty">{{ t('page.device.empty') }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.device-layout {
  display: grid;
  grid-template-columns: 215px minmax(0, 1fr) 240px;
  gap: 12px;
  align-items: stretch;
}

.device-layout.no-detail {
  grid-template-columns: 215px minmax(0, 1fr);
}

.tree-card {
  padding: 14px 12px;
  min-height: calc(100vh - 196px);
}

.device-main {
  min-width: 0;
}

.dev-stat {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.dev-stat :deep(.dw-stat) {
  padding: 10px 11px;
  gap: 8px;
}

.dev-stat :deep(.dw-stat__icon) {
  width: 36px;
  height: 36px;
  border-radius: 9px;
}

.dev-stat :deep(.dw-stat__num) {
  font-size: 21px;
}

.dev-stat :deep(.dw-stat__label) {
  font-size: 11px;
  white-space: nowrap;
}

.stat-dots {
  margin-top: 2px;
  font-size: 10px;
  white-space: nowrap;
}

.stat-dots span + span {
  margin-left: 5px;
}

.stat-dots .down {
  color: #18a058;
}

.stat-dots .flat {
  color: #8a97a8;
}

.list-card {
  margin-top: 14px;
  padding: 12px 14px 12px;
}

.list-card :deep(.dw-toolbar) {
  gap: 8px;
}

.ops-links {
  white-space: nowrap;
}

.ops-links .dw-link + .dw-link {
  margin-left: 8px;
}

.device-table {
  font-size: 11px;
}

.device-table :deep(.cell) {
  padding: 0 5px;
}

.device-table :deep(.el-table th.el-table__cell) {
  height: 38px;
}

.device-table :deep(.el-table td.el-table__cell) {
  height: 40px;
}

.device-table :deep(.status-tag) {
  padding: 0 6px;
  font-size: 10.5px;
}

.device-table :deep(.dw-link) {
  font-size: 11px;
}

.device-table .ops-links .dw-link + .dw-link {
  margin-left: 6px;
}

.dev-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #1f2d3d;
}

.dev-name:hover {
  color: #1a66ff;
}

.table-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
}

.detail-card {
  padding: 14px 16px;
  min-height: calc(100vh - 196px);
}

.detail-backdrop {
  position: fixed;
  inset: 56px 0 0 0;
  background: rgba(10, 25, 50, 0.28);
  z-index: 55;
}

@media (max-width: 1366px) {
  .device-layout {
    grid-template-columns: 215px minmax(0, 1fr);
  }

  .detail-card {
    position: fixed;
    top: 72px;
    right: 16px;
    bottom: 16px;
    width: 300px;
    z-index: 60;
    min-height: 0;
    overflow: auto;
    box-shadow: -8px 0 28px rgba(15, 30, 60, 0.2);
  }
}

.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.detail-title {
  font-size: 15px;
  font-weight: 600;
}

.detail-close {
  color: #8a97a8;
  cursor: pointer;
  display: inline-flex;
}

.detail-close:hover {
  color: #e23c3c;
}

.detail-hero {
  text-align: center;
  padding: 4px 0 14px;
  border-bottom: 1px solid #f0f3f8;
}

.detail-hero__icon {
  width: 82px;
  height: 82px;
  margin: 0 auto;
  border-radius: 12px;
  background: #0b1526;
  color: #7fa4dd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-hero__name {
  font-weight: 600;
  margin-top: 9px;
  font-size: 14px;
}

.detail-hero__type {
  font-size: 12px;
  color: #8a97a8;
  margin-top: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.detail-tabs {
  margin: 10px 0 4px;
}

.detail-tabs .dw-tab {
  padding: 6px 10px;
  font-size: 13px;
}

.detail-tabs .dw-tab.is-active::after {
  left: 10px;
  right: 10px;
}

.detail-field {
  display: flex;
  font-size: 13px;
  padding: 7px 0;
  border-bottom: 1px solid #f5f7fb;
}

.detail-field .k {
  width: 74px;
  color: #8a97a8;
  flex-shrink: 0;
}

.detail-field .v {
  color: #1f2d3d;
  word-break: break-all;
}

.detail-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 16px;
}

.detail-action {
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  padding: 10px 2px 8px;
  text-align: center;
  color: #1a66ff;
  font-size: 12px;
  cursor: pointer;
}

.detail-action span {
  display: block;
  margin-top: 5px;
  color: #3a4a5f;
}

.detail-action:hover {
  border-color: #1a66ff;
  background: #f6f9ff;
}
</style>
