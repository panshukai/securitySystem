<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import AppIcon from '@/components/AppIcon.vue'
import StatusTag from '@/components/StatusTag.vue'
import TrendChart from '@/components/charts/TrendChart.vue'
import DonutChart from '@/components/charts/DonutChart.vue'
import RingProgress from '@/components/charts/RingProgress.vue'
import { useEventStore } from '@/stores/event'
import { getOrgOptions } from '@/api'

const router = useRouter()
const store = useEventStore()
const { t } = useI18n()

const rawOrgOptions = ref([{ label: '', value: '' }])
const orgOptions = computed(() => rawOrgOptions.value.map((o, i) => (i === 0 ? { ...o, label: t('page.event.allOrgs') } : o)))

const EVENT_TYPE_KEYS = { 门禁事件: 'access', 视频告警: 'video', 设备异常: 'device', 人员事件: 'person', 其他事件: 'other' }
const LEVEL_KEYS = { 高: 'high', 中: 'medium', 低: 'low' }
const STATUS_KEYS = { 待处置: 'pending', 处置中: 'processing', 已处置: 'done' }
const STAT_KEYS = { total: 'totalEvents', pending: 'pending', processing: 'processing', done: 'done', major: 'major' }

function typeLabel(value) {
  return t(`eventTypes.${EVENT_TYPE_KEYS[value] || 'other'}`)
}
function levelLabel(value) {
  return t(`status.${LEVEL_KEYS[value] || 'low'}`)
}
function statusLabel(value) {
  return t(`status.${STATUS_KEYS[value] || 'pending'}`)
}
function statLabel(key) {
  return t(`page.event.${STAT_KEYS[key] || 'totalEvents'}`)
}

const typeOptions = computed(() => [
  { label: t('page.event.allEvents'), value: '' },
  ...Object.keys(EVENT_TYPE_KEYS).map((value) => ({ label: typeLabel(value), value }))
])
const levelOptions = computed(() => [
  { label: t('page.event.allLevels'), value: '' },
  { label: t('status.high'), value: '高' },
  { label: t('status.medium'), value: '中' },
  { label: t('status.low'), value: '低' }
])
const rangeOptions = computed(() => [
  { label: t('page.event.last7'), value: 'last7' },
  { label: t('page.event.last30'), value: 'last30' },
  { label: t('page.event.customRange'), value: 'custom' }
])

const typeIcon = {
  门禁事件: 'door',
  视频告警: 'cam',
  设备异常: 'device',
  人员事件: 'user',
  其他事件: 'warn'
}

const detailVisible = ref(false)
const dealVisible = ref(false)
const dealForm = reactive({ result: 'confirm', note: '' })
const submitting = ref(false)

const detail = computed(() => store.detail)

onMounted(async () => {
  await Promise.all([store.loadAll(), store.loadList()])
  rawOrgOptions.value = await getOrgOptions()
})

async function openDetail(row) {
  detailVisible.value = true
  await store.openDetail(row.id)
}

function openDeal(row) {
  dealVisible.value = true
  dealForm.result = 'confirm'
  dealForm.note = ''
  store.detail = row
}

function openDealFromDetail() {
  detailVisible.value = false
  openDeal(detail.value)
}

async function submitDeal() {
  if (!detail.value) return
  submitting.value = true
  try {
    await store.submitDeal(detail.value.id, { result: dealForm.result, note: dealForm.note })
    dealVisible.value = false
    const msg =
      dealForm.result === 'false'
        ? t('page.event.msgFalse')
        : dealForm.result === 'ticket'
          ? t('page.event.msgTicket')
          : t('page.event.msgDeal')
    ElMessage.success(msg)
  } finally {
    submitting.value = false
  }
}

function quickGo(path) {
  router.push(path)
}

function onQuery() {
  store.loadList()
  ElMessage.success(t('page.event.msgQuery'))
}
</script>

<template>
  <div class="event-page">
    <PageHeader :title="t('page.event.title')" :subtitle="t('page.event.subtitle')" />

    <div class="event-layout">
      <div class="event-main">
        <div class="stat-row">
          <div v-for="s in store.stats" :key="s.key" class="dw-card dw-stat">
            <div class="dw-stat__icon" :class="s.tone">
              <AppIcon :name="s.icon" :size="22" />
            </div>
            <div>
              <div class="dw-stat__label">{{ statLabel(s.key) }}</div>
              <div class="dw-stat__num">{{ s.value }}</div>
              <div class="dw-stat__delta">
                <span :class="s.dir === 'up' ? 'up' : 'down'">
                  {{ s.dir === 'up' ? '▲' : '▼' }} {{ s.delta }}
                </span>
                <span class="flat"> {{ t('page.event.vsYesterday') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-row">
          <div class="dw-card chart-card">
            <div class="dw-card__title">{{ t('page.event.trend') }}</div>
            <TrendChart :data="store.trend.data" :labels="store.trend.labels" :height="190" />
          </div>
          <div class="dw-card chart-card">
            <div class="dw-card__title">{{ t('page.event.typeDist') }}</div>
            <div class="donut-wrap">
              <DonutChart :data="store.donut" total="1,286" :center-label="t('page.event.totalEvents')" :height="150" />
              <div class="donut-legend">
                <div v-for="d in store.donut" :key="d.name" class="donut-legend__row">
                  <span class="dw-dot" :style="{ background: d.color }" />
                  <span class="donut-legend__name">{{ typeLabel(d.name) }}</span>
                  <span class="donut-legend__pct">{{ d.percent }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="dw-card filter-card">
          <div class="filter-row">
            <span class="filter-label">{{ t('page.event.filterType') }}:</span>
            <el-select
              :model-value="store.filters.type"
              size="small"
              :placeholder="t('page.event.allEvents')"
              style="width: 88px"
              @update:model-value="(v) => store.setFilter('type', v)"
            >
              <el-option v-for="o in typeOptions" :key="o.value" :label="o.label" :value="o.value" />
            </el-select>
            <span class="filter-label">{{ t('page.event.filterLevel') }}:</span>
            <el-select
              :model-value="store.filters.level"
              size="small"
              :placeholder="t('page.event.allLevels')"
              style="width: 94px"
              @update:model-value="(v) => store.setFilter('level', v)"
            >
              <el-option v-for="o in levelOptions" :key="o.value" :label="o.label" :value="o.value" />
            </el-select>
            <span class="filter-label">{{ t('page.event.filterOrg') }}:</span>
            <el-select
              :model-value="store.filters.orgName"
              size="small"
              :placeholder="t('page.event.allOrgs')"
              style="width: 112px"
              @update:model-value="(v) => store.setFilter('orgName', v)"
            >
              <el-option v-for="o in orgOptions" :key="o.value" :label="o.label" :value="o.value" />
            </el-select>
            <span class="filter-label">{{ t('page.event.filterTime') }}:</span>
            <el-select
              :model-value="store.filters.range"
              size="small"
              :placeholder="t('page.event.last7')"
              style="width: 88px"
              @update:model-value="(v) => store.setFilter('range', v)"
            >
              <el-option v-for="o in rangeOptions" :key="o.value" :label="o.label" :value="o.value" />
            </el-select>
            <span class="filter-grow" />
            <span class="filter-btns">
              <el-button type="primary" size="small" @click="onQuery">{{ t('common.search') }}</el-button>
              <el-button size="small" @click="store.resetFilters()">{{ t('common.reset') }}</el-button>
            </span>
          </div>
        </div>

        <div class="dw-card table-card">
          <el-table :data="store.list" v-loading="store.loading" class="compact-table" style="width: 100%">
            <el-table-column type="selection" width="24" />
            <el-table-column prop="time" :label="`${t('page.event.colTime')} ↓`" width="120" class-name="nowrap-cell" />
            <el-table-column :label="t('page.event.colType')" width="88">
              <template #default="{ row }">
                <span class="type-cell">
                  <AppIcon :name="typeIcon[row.type] || 'warn'" :size="14" style="color: #1a66ff" />
                  {{ typeLabel(row.type) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column :label="t('page.event.colLevel')" width="64">
              <template #default="{ row }">
                <StatusTag :text="row.level" />
              </template>
            </el-table-column>
            <el-table-column prop="desc" :label="t('page.event.colDesc')" min-width="92" show-overflow-tooltip />
            <el-table-column prop="orgName" :label="t('page.event.colOrg')" min-width="92" class-name="nowrap-cell" show-overflow-tooltip />
            <el-table-column :label="t('page.event.colStatus')" width="68">
              <template #default="{ row }">
                <StatusTag :text="row.status" />
              </template>
            </el-table-column>
            <el-table-column prop="handler" :label="t('page.event.colHandlerShort')" width="52" />
            <el-table-column :label="t('common.actions')" width="104" fixed="right">
              <template #default="{ row }">
                <span class="ops-links">
                  <span v-if="row.status !== '已处置'" class="dw-link" @click.stop="openDeal(row)">{{ t('page.event.deal') }}</span>
                  <span class="dw-link" @click.stop="openDetail(row)">{{ t('common.detail') }}</span>
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

      <aside class="event-aside">
        <div class="dw-card">
          <div class="dw-card__title">
            {{ t('page.event.realtime') }}
            <span class="more" @click="quickGo('/event/alarm')">{{ t('page.event.more') }}</span>
          </div>
          <div
            v-for="a in store.alerts"
            :key="a.id"
            class="alert-item"
          >
            <div class="alert-thumb" :class="`t${a.tone}`" />
            <div class="alert-main">
              <div class="alert-name">{{ a.name }}</div>
              <div class="alert-loc"><AppIcon name="org" :size="11" /> {{ a.location }}</div>
            </div>
            <div class="alert-side">
              <div>{{ a.time }}</div>
              <StatusTag :text="a.level" />
            </div>
          </div>
        </div>

        <div class="dw-card overview-card">
          <div class="dw-card__title">{{ t('page.event.overview') }}</div>
          <div class="overview-body">
            <RingProgress :percent="store.overview.rate" color="#18a058" :height="86" />
            <div class="overview-list">
              <div class="overview-row">
                <span><AppIcon name="clock" :size="14" style="color: #f08c00" /> {{ t('page.event.avg') }}</span>
                <b>{{ t('page.event.minutes', { n: store.overview.avgMinutes }) }}</b>
              </div>
              <div class="overview-row">
                <span><AppIcon name="warn" :size="14" style="color: #e23c3c" /> {{ t('page.event.overdue') }}</span>
                <b class="danger">{{ t('page.event.items', { n: store.overview.overdue }) }}</b>
              </div>
            </div>
          </div>
        </div>

        <div class="dw-card">
          <div class="dw-card__title">{{ t('page.event.quick') }}</div>
          <div class="quick-grid">
            <div class="quick-item" @click="quickGo('/event/query')">
              <AppIcon name="search" :size="20" />
              <span>{{ t('page.event.quickQuery') }}</span>
            </div>
            <div class="quick-item" @click="quickGo('/event/ticket')">
              <AppIcon name="doc" :size="20" />
              <span>{{ t('page.event.newTicket') }}</span>
            </div>
            <div class="quick-item" @click="quickGo('/event/flow')">
              <AppIcon name="flow" :size="20" />
              <span>{{ t('page.event.flow') }}</span>
            </div>
            <div class="quick-item" @click="quickGo('/event/linkage')">
              <AppIcon name="link" :size="20" />
              <span>{{ t('page.event.linkage') }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <el-dialog v-model="detailVisible" :title="t('page.event.detailTitle')" width="460px">
      <div v-loading="store.detailLoading">
        <template v-if="detail">
          <div v-for="item in [
            { k: t('page.event.code'), v: detail.code },
            { k: t('page.event.time'), v: detail.time },
            { k: t('page.event.type'), v: typeLabel(detail.type) },
            { k: t('page.event.level'), v: levelLabel(detail.level) },
            { k: t('page.event.desc'), v: detail.desc },
            { k: t('page.event.org'), v: detail.orgName },
            { k: t('page.event.statusLabel'), v: statusLabel(detail.status) },
            { k: t('page.event.handler'), v: detail.handler }
          ]" :key="item.k" class="modal-row">
            <span class="modal-key">{{ item.k }}</span>
            <span class="modal-val">{{ item.v }}</span>
          </div>
          <div class="modal-row">
            <span class="modal-key">{{ t('page.event.relatedVideo') }}</span>
            <span class="modal-val">
              <span class="dw-link" @click="router.push('/video/live')">{{ t('page.event.viewLive') }}</span>
            </span>
          </div>
        </template>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">{{ t('common.close') }}</el-button>
        <el-button v-if="detail && detail.status !== '已处置'" type="primary" @click="openDealFromDetail">{{ t('page.event.dealNow') }}</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dealVisible" :title="t('page.event.dealTitle')" width="440px">
      <template v-if="detail">
        <div class="modal-row">
          <span class="modal-key">{{ t('page.event.desc') }}</span>
          <span class="modal-val">{{ detail.desc }}（{{ detail.orgName }}）</span>
        </div>
        <div class="dialog-label">{{ t('page.event.dealResult') }}</div>
        <el-radio-group v-model="dealForm.result">
          <el-radio value="confirm">{{ t('page.event.confirmDeal') }}</el-radio>
          <el-radio value="false">{{ t('page.event.falseAlarm') }}</el-radio>
          <el-radio value="ticket">{{ t('page.event.toTicket') }}</el-radio>
        </el-radio-group>
        <div class="dialog-label">{{ t('page.event.dealNote') }}</div>
        <el-input
          v-model="dealForm.note"
          type="textarea"
          :rows="3"
          :placeholder="t('page.event.dealNotePlaceholder')"
        />
      </template>
      <template #footer>
        <el-button @click="dealVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="submitDeal">{{ t('common.submit') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
.event-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 288px;
  gap: 14px;
  align-items: start;
}

.event-main {
  min-width: 0;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

:deep(.dw-stat) {
  padding: 10px 12px;
  gap: 9px;
}

:deep(.dw-stat__icon) {
  width: 40px;
  height: 40px;
  border-radius: 9px;
}

:deep(.dw-stat__num) {
  font-size: 22px;
}

:deep(.dw-stat__label) {
  font-size: 11px;
}

.chart-row {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 14px;
  margin-top: 14px;
}

.chart-card {
  padding: 14px 16px;
}

.donut-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.donut-wrap > :first-child {
  width: 150px;
  flex-shrink: 0;
}

.donut-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 9px;
  font-size: 12px;
}

.donut-legend__row {
  display: flex;
  align-items: center;
}

.donut-legend__name {
  color: #3a4a5f;
}

.donut-legend__pct {
  margin-left: auto;
  color: #8a97a8;
  font-variant-numeric: tabular-nums;
}

.filter-card {
  margin-top: 14px;
  padding: 12px 14px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.filter-label {
  color: #5a6b85;
  font-size: 11px;
}

.ops-links {
  white-space: nowrap;
}

.filter-grow {
  flex: 1;
}

.filter-btns {
  display: flex;
  gap: 6px;
  margin-left: auto;
}

.table-card {
  margin-top: 14px;
  padding: 8px 0 12px;
}

.event-page :deep(.compact-table) {
  font-size: 11.5px;
}

@media (max-width: 1400px) {
  :deep(.dw-stat) {
    padding: 9px 10px;
    gap: 7px;
  }

  :deep(.dw-stat__icon) {
    width: 36px;
    height: 36px;
  }

  :deep(.dw-stat__num) {
    font-size: 20px;
  }
}

.type-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.table-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 0;
}

.event-aside {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.event-aside .dw-card {
  padding: 14px 16px;
}

.alert-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f3f8;
}

.alert-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.alert-thumb {
  width: 78px;
  height: 52px;
  border-radius: 6px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.alert-thumb.t1 {
  background-image: url('/cameras/area-1.jpg');
  background-size: cover;
  background-position: center;
}

.alert-thumb.t2 {
  background-image: url('/cameras/area-3.jpg');
  background-size: cover;
  background-position: center;
}

.alert-thumb.t3 {
  background-image: url('/cameras/area-4.jpg');
  background-size: cover;
  background-position: center;
}

.alert-main {
  min-width: 0;
}

.alert-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alert-loc {
  font-size: 11px;
  color: #8a97a8;
  margin-top: 3px;
  white-space: nowrap;
}

.alert-side {
  margin-left: auto;
  text-align: right;
  font-size: 11px;
  color: #8a97a8;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.overview-body {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overview-body > :first-child {
  width: 86px;
  flex-shrink: 0;
}

.overview-list {
  flex: 1;
}

.overview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 0;
  font-size: 12px;
  color: #5a6b85;
  border-bottom: 1px solid #f0f3f8;
}

.overview-row:last-child {
  border-bottom: none;
}

.overview-row b {
  color: #1f2d3d;
  font-size: 13px;
}

.overview-row b.danger {
  color: #e23c3c;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.quick-item {
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  padding: 12px 2px 10px;
  text-align: center;
  cursor: pointer;
  color: #1a66ff;
  transition: all 0.15s;
}

.quick-item span {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #3a4a5f;
}

.quick-item:hover {
  border-color: #1a66ff;
  background: #f6f9ff;
}

.modal-row {
  display: flex;
  font-size: 13px;
  padding: 7px 0;
  border-bottom: 1px solid #f5f7fb;
}

.modal-row:last-child {
  border-bottom: none;
}

.modal-key {
  width: 84px;
  color: #8a97a8;
  flex-shrink: 0;
}

.modal-val {
  color: #1f2d3d;
}

.dialog-label {
  margin: 14px 0 8px;
  color: #5a6b85;
  font-size: 13px;
}
</style>
