<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import PageTabs from '@/components/PageTabs.vue'
import AppIcon from '@/components/AppIcon.vue'
import StatusTag from '@/components/StatusTag.vue'
import OrgTreePanel from '@/components/OrgTreePanel.vue'
import { useDeviceStore } from '@/stores/device'

const router = useRouter()
const store = useDeviceStore()
const detailOpen = ref(true)
const narrow = ref(false)
let mq = null

function onMqChange(e) {
  narrow.value = e.matches
  detailOpen.value = !e.matches
}

const deviceTabs = [
  { label: '设备总览', value: '' },
  { label: '视频设备', value: '网络摄像机' },
  { label: '门禁设备', value: '门禁一体机' },
  { label: '存储设备', value: '存储NVR' },
  { label: '网络设备', value: '网络交换机' }
]

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
    ElMessage.warning('该设备类型不支持实时预览')
    return
  }
  router.push({ path: '/video/live', query: { channel: device.channel } })
}

function selectDevice(row) {
  detailOpen.value = true
  store.selectDevice(row.id)
}

function todo(name) {
  ElMessage.info(`「${name}」为演示占位功能`)
}

const statusTab = ref('basic')
</script>

<template>
  <div class="device-page">
    <PageHeader title="设备总览" subtitle="视频 / 门禁 / 存储 / 网络设备统一接入与运维">
      <PageTabs :tabs="deviceTabs" :model-value="store.typeTab" @change="store.setType" />
    </PageHeader>

    <div class="device-layout" :class="{ 'no-detail': !detailOpen }">
      <div class="dw-card tree-card">
        <OrgTreePanel
          title="组织资源"
          :data="store.tree ? [store.tree] : []"
          :selected-key="selectedOrgId"
          search-placeholder="请输入组织/仓点名称"
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
              <div class="dw-stat__label">{{ s.label }}</div>
              <div class="dw-stat__num">{{ s.value }}</div>
              <div class="stat-dots">
                <span class="down">● 在线 {{ s.online }}</span>
                <span class="flat">● 离线 {{ s.offline }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="dw-card list-card">
          <div class="dw-toolbar">
            <el-button type="primary" size="small" @click="todo('添加设备')">
              <AppIcon name="add" :size="14" style="margin-right: 5px" />添加设备
            </el-button>
            <el-button size="small" @click="todo('批量操作')">
              <AppIcon name="list" :size="14" style="margin-right: 5px" />批量操作
            </el-button>
            <el-button size="small" @click="todo('设备配置')">
              <AppIcon name="gear" :size="14" style="margin-right: 5px" />设备配置
            </el-button>
            <el-button size="small" @click="todo('远程维护')">
              <AppIcon name="wrench" :size="14" style="margin-right: 5px" />远程维护
            </el-button>
            <el-button size="small" @click="todo('导出')">
              <AppIcon name="export" :size="14" style="margin-right: 5px" />导出
            </el-button>
            <span class="grow" />
            <div class="dw-search" style="width: 190px">
              <el-input
                :model-value="store.keyword"
                size="small"
                placeholder="设备名称 / IP / 序列号"
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
            <el-table-column label="设备名称" width="136">
              <template #default="{ row }">
                <span class="dev-name" @click="selectDevice(row)">
                  <AppIcon :name="typeIcon[row.type] || 'device'" :size="14" style="color: #5a6b85" />
                  {{ row.name }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="设备类型" width="68" />
            <el-table-column prop="orgName" label="所属仓点" width="110" show-overflow-tooltip />
            <el-table-column prop="ip" label="IP地址" width="92" />
            <el-table-column label="状态" width="46">
              <template #default="{ row }">
                <StatusTag :text="row.status" />
              </template>
            </el-table-column>
            <el-table-column prop="model" label="型号" width="104" />
            <el-table-column label="操作" width="106" fixed="right">
              <template #default="{ row }">
                <span class="ops-links">
                  <span class="dw-link" @click.stop="preview(row)">预览</span>
                  <span class="dw-link" @click.stop="todo('远程配置')">配置</span>
                  <span class="dw-link" @click.stop="selectDevice(row)">更多</span>
                </span>
              </template>
            </el-table-column>
          </el-table>

          <div class="table-foot">
            <span class="dw-sub">共 {{ store.total }} 条</span>
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
          <span class="detail-title">设备详情</span>
          <span class="detail-close" @click="detailOpen = false"><AppIcon name="close" :size="15" /></span>
        </div>
        <template v-if="store.current">
          <div class="detail-hero">
            <div class="detail-hero__icon">
              <AppIcon :name="typeIcon[store.current.type] || 'device'" :size="38" />
            </div>
            <div class="detail-hero__name">{{ store.current.name }}</div>
            <div class="detail-hero__type">
              {{ store.current.type }}
              <StatusTag :text="store.current.status" style="margin-left: 6px" />
            </div>
          </div>
          <div class="dw-tabs detail-tabs">
            <div class="dw-tab" :class="{ 'is-active': statusTab === 'basic' }" @click="statusTab = 'basic'">基本信息</div>
            <div class="dw-tab" :class="{ 'is-active': statusTab === 'run' }" @click="statusTab = 'run'">运行状态</div>
          </div>
          <template v-if="statusTab === 'basic'">
            <div v-for="item in [
              { k: '所属仓点', v: store.current.orgName },
              { k: '设备型号', v: store.current.model },
              { k: '序列号', v: store.current.sn },
              { k: 'IP 地址', v: store.current.ip },
              { k: '接入时间', v: store.current.installedAt },
              { k: '固件版本', v: store.current.firmware },
              { k: '安装位置', v: store.current.location }
            ]" :key="item.k" class="detail-field">
              <span class="k">{{ item.k }}</span>
              <span class="v">{{ item.v }}</span>
            </div>
          </template>
          <template v-else>
            <div v-for="item in [
              { k: '设备状态', v: '在线 · 心跳正常' },
              { k: 'CPU 使用率', v: '23%' },
              { k: '内存使用率', v: '41%' },
              { k: '码流状态', v: '主码流 2048 Kbps' },
              { k: '已运行时长', v: '37 天 6 小时' },
              { k: '最近巡检', v: '2025-01-08 09:00' }
            ]" :key="item.k" class="detail-field">
              <span class="k">{{ item.k }}</span>
              <span class="v">{{ item.v }}</span>
            </div>
          </template>

          <div class="detail-actions">
            <div class="detail-action" @click="preview(store.current)">
              <AppIcon name="play" :size="18" />
              <span>实时预览</span>
            </div>
            <div class="detail-action" @click="todo('录像回放')">
              <AppIcon name="rec" :size="18" />
              <span>录像回放</span>
            </div>
            <div class="detail-action" @click="todo('远程配置')">
              <AppIcon name="ptz" :size="18" />
              <span>远程配置</span>
            </div>
          </div>
        </template>
        <div v-else class="dw-empty">请选择设备查看详情</div>
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
