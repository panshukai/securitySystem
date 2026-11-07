<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
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

const orgOptions = ref([{ label: '全部组织', value: '' }])
const typeOptions = [
  { label: '全部事件', value: '' },
  { label: '门禁事件', value: '门禁事件' },
  { label: '视频告警', value: '视频告警' },
  { label: '设备异常', value: '设备异常' },
  { label: '人员事件', value: '人员事件' },
  { label: '其他事件', value: '其他事件' }
]
const levelOptions = [
  { label: '全部等级', value: '' },
  { label: '高', value: '高' },
  { label: '中', value: '中' },
  { label: '低', value: '低' }
]
const rangeOptions = [
  { label: '最近7天', value: 'last7' },
  { label: '最近30天', value: 'last30' },
  { label: '自定义', value: 'custom' }
]

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
  orgOptions.value = await getOrgOptions()
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
    const msg = dealForm.result === 'false' ? '已按误报关闭' : dealForm.result === 'ticket' ? '已转工单并标记处置完成' : '处置完成，状态已更新为「已处置」'
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
  ElMessage.success('已按当前条件查询')
}
</script>

<template>
  <div class="event-page">
    <PageHeader title="事件中心" subtitle="集中监测、统一处置、闭环管理" />

    <div class="event-layout">
      <div class="event-main">
        <div class="stat-row">
          <div v-for="s in store.stats" :key="s.key" class="dw-card dw-stat">
            <div class="dw-stat__icon" :class="s.tone">
              <AppIcon :name="s.icon" :size="22" />
            </div>
            <div>
              <div class="dw-stat__label">{{ s.label }}</div>
              <div class="dw-stat__num">{{ s.value }}</div>
              <div class="dw-stat__delta">
                <span :class="s.dir === 'up' ? 'up' : 'down'">
                  {{ s.dir === 'up' ? '▲' : '▼' }} {{ s.delta }}
                </span>
                <span class="flat"> 较昨日</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-row">
          <div class="dw-card chart-card">
            <div class="dw-card__title">事件趋势分析（近7天）</div>
            <TrendChart :data="store.trend.data" :labels="store.trend.labels" :height="190" />
          </div>
          <div class="dw-card chart-card">
            <div class="dw-card__title">事件类型分布</div>
            <div class="donut-wrap">
              <DonutChart :data="store.donut" total="1,286" :height="150" />
              <div class="donut-legend">
                <div v-for="d in store.donut" :key="d.name" class="donut-legend__row">
                  <span class="dw-dot" :style="{ background: d.color }" />
                  <span class="donut-legend__name">{{ d.name }}</span>
                  <span class="donut-legend__pct">{{ d.percent }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="dw-card filter-card">
          <div class="filter-row">
            <span class="filter-label">事件类型：</span>
            <el-select
              :model-value="store.filters.type"
              size="small"
              placeholder="全部事件"
              style="width: 88px"
              @update:model-value="(v) => store.setFilter('type', v)"
            >
              <el-option v-for="o in typeOptions" :key="o.value" :label="o.label" :value="o.value" />
            </el-select>
            <span class="filter-label">事件等级：</span>
            <el-select
              :model-value="store.filters.level"
              size="small"
              placeholder="全部等级"
              style="width: 94px"
              @update:model-value="(v) => store.setFilter('level', v)"
            >
              <el-option v-for="o in levelOptions" :key="o.value" :label="o.label" :value="o.value" />
            </el-select>
            <span class="filter-label">所属组织：</span>
            <el-select
              :model-value="store.filters.orgName"
              size="small"
              placeholder="全部组织"
              style="width: 112px"
              @update:model-value="(v) => store.setFilter('orgName', v)"
            >
              <el-option v-for="o in orgOptions" :key="o.value" :label="o.label" :value="o.value" />
            </el-select>
            <span class="filter-label">发生时间：</span>
            <el-select
              :model-value="store.filters.range"
              size="small"
              placeholder="最近7天"
              style="width: 88px"
              @update:model-value="(v) => store.setFilter('range', v)"
            >
              <el-option v-for="o in rangeOptions" :key="o.value" :label="o.label" :value="o.value" />
            </el-select>
            <span class="filter-grow" />
            <span class="filter-btns">
              <el-button type="primary" size="small" @click="onQuery">查询</el-button>
              <el-button size="small" @click="store.resetFilters()">重置</el-button>
            </span>
          </div>
        </div>

        <div class="dw-card table-card">
          <el-table :data="store.list" v-loading="store.loading" class="compact-table" style="width: 100%">
            <el-table-column type="selection" width="24" />
            <el-table-column prop="time" label="发生时间 ↓" width="120" class-name="nowrap-cell" />
            <el-table-column label="事件类型" width="88">
              <template #default="{ row }">
                <span class="type-cell">
                  <AppIcon :name="typeIcon[row.type] || 'warn'" :size="14" style="color: #1a66ff" />
                  {{ row.type }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="事件等级" width="66">
              <template #default="{ row }">
                <StatusTag :text="row.level" />
              </template>
            </el-table-column>
            <el-table-column prop="desc" label="事件描述" min-width="100" show-overflow-tooltip />
            <el-table-column prop="orgName" label="所属组织" min-width="100" class-name="nowrap-cell" show-overflow-tooltip />
            <el-table-column label="处置状态" width="70">
              <template #default="{ row }">
                <StatusTag :text="row.status" />
              </template>
            </el-table-column>
            <el-table-column prop="handler" label="处置人" width="52" />
            <el-table-column label="操作" width="84" fixed="right">
              <template #default="{ row }">
                <span class="ops-links">
                  <span v-if="row.status !== '已处置'" class="dw-link" @click.stop="openDeal(row)">处置</span>
                  <span class="dw-link" @click.stop="openDetail(row)">详情</span>
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

      <aside class="event-aside">
        <div class="dw-card">
          <div class="dw-card__title">
            实时告警
            <span class="more" @click="quickGo('/event/alarm')">更多 ›</span>
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
          <div class="dw-card__title">事件处置概览（今日）</div>
          <div class="overview-body">
            <RingProgress :percent="store.overview.rate" color="#18a058" :height="86" />
            <div class="overview-list">
              <div class="overview-row">
                <span><AppIcon name="clock" :size="14" style="color: #f08c00" /> 平均处置时长</span>
                <b>{{ store.overview.avgMinutes }} 分钟</b>
              </div>
              <div class="overview-row">
                <span><AppIcon name="warn" :size="14" style="color: #e23c3c" /> 超时事件</span>
                <b class="danger">{{ store.overview.overdue }} 件</b>
              </div>
            </div>
          </div>
        </div>

        <div class="dw-card">
          <div class="dw-card__title">快捷操作</div>
          <div class="quick-grid">
            <div class="quick-item" @click="quickGo('/event/query')">
              <AppIcon name="search" :size="20" />
              <span>事件查询</span>
            </div>
            <div class="quick-item" @click="quickGo('/event/ticket')">
              <AppIcon name="doc" :size="20" />
              <span>新建工单</span>
            </div>
            <div class="quick-item" @click="quickGo('/event/flow')">
              <AppIcon name="flow" :size="20" />
              <span>处置流程</span>
            </div>
            <div class="quick-item" @click="quickGo('/event/linkage')">
              <AppIcon name="link" :size="20" />
              <span>联动配置</span>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <el-dialog v-model="detailVisible" title="事件详情" width="460px">
      <div v-loading="store.detailLoading">
        <template v-if="detail">
          <div v-for="item in [
            { k: '事件编号', v: detail.code },
            { k: '发生时间', v: detail.time },
            { k: '事件类型', v: detail.type },
            { k: '事件等级', v: detail.level },
            { k: '事件描述', v: detail.desc },
            { k: '所属组织', v: detail.orgName },
            { k: '处置状态', v: detail.status },
            { k: '处置人', v: detail.handler }
          ]" :key="item.k" class="modal-row">
            <span class="modal-key">{{ item.k }}</span>
            <span class="modal-val">{{ item.v }}</span>
          </div>
          <div class="modal-row">
            <span class="modal-key">关联视频</span>
            <span class="modal-val">
              <span class="dw-link" @click="router.push('/video/live')">查看实时预览 ›</span>
            </span>
          </div>
        </template>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="detail && detail.status !== '已处置'" type="primary" @click="openDealFromDetail">立即处置</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dealVisible" title="事件处置" width="440px">
      <template v-if="detail">
        <div class="modal-row">
          <span class="modal-key">事件描述</span>
          <span class="modal-val">{{ detail.desc }}（{{ detail.orgName }}）</span>
        </div>
        <div class="dialog-label">处置结果</div>
        <el-radio-group v-model="dealForm.result">
          <el-radio value="confirm">确认处置</el-radio>
          <el-radio value="false">误报关闭</el-radio>
          <el-radio value="ticket">转工单</el-radio>
        </el-radio-group>
        <div class="dialog-label">处置备注</div>
        <el-input
          v-model="dealForm.note"
          type="textarea"
          :rows="3"
          placeholder="填写处置说明（演示）"
        />
      </template>
      <template #footer>
        <el-button @click="dealVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitDeal">提交</el-button>
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
