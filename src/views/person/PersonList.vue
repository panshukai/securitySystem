<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import PageTabs from '@/components/PageTabs.vue'
import AppIcon from '@/components/AppIcon.vue'
import StatusTag from '@/components/StatusTag.vue'
import OrgTreePanel from '@/components/OrgTreePanel.vue'
import { usePersonStore } from '@/stores/person'

const router = useRouter()
const store = usePersonStore()
const baseUrl = import.meta.env.BASE_URL
const keyword = ref('')
const statusFilter = ref('')

const tabs = [
  { label: '人员档案', value: '/access/person' },
  { label: '人员批量导入', value: '/access/person-import' },
  { label: '人员分组', value: '/access/person-group' },
  { label: '人员变更记录', value: '/access/person-log' }
]

const detailTabs = [
  { label: '基本信息', value: 'basic' },
  { label: '身份凭证', value: 'credential' },
  { label: '门禁权限', value: 'perm' },
  { label: '人员轨迹', value: 'track' }
]

const orgOptions = [
  { label: 'HZ001-杭州前置仓', value: 'HZ001-杭州前置仓' },
  { label: 'HZ002-宁波前置仓', value: 'HZ002-宁波前置仓' },
  { label: 'HZ003-嘉兴前置仓', value: 'HZ003-嘉兴前置仓' }
]

const selectedOrgName = computed({
  get: () => store.selectedOrgName,
  set: (name) => {
    let target = null
    const walk = (n) => {
      if (n.name === name) target = n
      ;(n.children || []).forEach(walk)
    }
    if (store.orgTree) walk(store.orgTree)
    if (target) store.selectOrg(target)
  }
})

onMounted(async () => {
  await store.loadOrgs()
  await store.loadList()
})

function search() {
  store.setKeyword(keyword.value)
}

function changeStatus(v) {
  statusFilter.value = v
  store.setStatus(v)
}

function switchTab(path) {
  if (path !== '/access/person') router.push(path)
}

function rowClass({ row }) {
  return row.id === store.currentId ? 'row-selected' : ''
}

function fmtExpire(value) {
  return value || '长期有效'
}

function todo(name) {
  ElMessage.info(`「${name}」为演示占位功能`)
}
</script>

<template>
  <div class="person-page">
    <PageHeader title="人员信息管理" subtitle="组织人员档案、身份凭证与门禁权限统一管理">
      <PageTabs :tabs="tabs" model-value="/access/person" @change="switchTab" />
    </PageHeader>

    <div class="person-layout">
      <div class="dw-card tree-card">
        <OrgTreePanel
          title="组织架构"
          :data="store.orgTree ? [store.orgTree] : []"
          :selected-key="store.selectedOrgId"
          search-placeholder="请输入组织名称"
          show-add
          @select="store.selectOrg"
        />
      </div>

      <div class="person-main">
        <div class="dw-card list-card">
          <div class="toolbar-row">
            <el-button type="primary" size="small" @click="todo('新增人员')">
              <AppIcon name="add" :size="14" style="margin-right: 5px" />新增人员
            </el-button>
            <el-button size="small" @click="todo('批量导入')">
              <AppIcon name="export" :size="14" style="margin-right: 5px" />批量导入
            </el-button>
            <el-button size="small" @click="todo('批量导出')">
              <AppIcon name="down" :size="14" style="margin-right: 5px" />批量导出
            </el-button>
            <el-button size="small" @click="todo('人脸采集')">
              <AppIcon name="facescan" :size="14" style="margin-right: 5px" />人脸采集
            </el-button>
            <el-button size="small" @click="todo('更多操作')">
              <AppIcon name="more" :size="14" style="margin-right: 5px" />更多操作
            </el-button>
          </div>

          <div class="filter-row">
            <div class="dw-search" style="width: 240px">
              <el-input
                v-model="keyword"
                size="small"
                placeholder="姓名 / 工号 / 证件号码"
                clearable
                @keyup.enter="search"
              >
                <template #suffix>
                  <span style="cursor: pointer; display: inline-flex" @click="search">
                    <AppIcon name="search" :size="14" style="color: #8a97a8" />
                  </span>
                </template>
              </el-input>
            </div>
            <span class="filter-label">人员状态：</span>
            <el-select :model-value="statusFilter" size="small" placeholder="全部" style="width: 96px" @update:model-value="changeStatus">
              <el-option label="全部" value="" />
              <el-option label="在职" value="在职" />
              <el-option label="临时" value="临时" />
              <el-option label="停用" value="停用" />
            </el-select>
            <span class="filter-label">所属组织：</span>
            <el-select v-model="selectedOrgName" size="small" style="width: 158px">
              <el-option v-for="o in orgOptions" :key="o.value" :label="o.label" :value="o.value" />
            </el-select>
          </div>

          <el-table
            :data="store.list"
            v-loading="store.loading"
            :row-class-name="rowClass"
            class="compact-table"
            style="width: 100%; margin-top: 10px"
            @row-click="(row) => store.selectPerson(row.id)"
          >
            <el-table-column type="selection" width="26" />
            <el-table-column label="姓名" width="66">
              <template #default="{ row }">
                <span class="person-name">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="no" label="工号" width="78" />
            <el-table-column prop="orgName" label="所属组织" min-width="116" />
            <el-table-column prop="post" label="岗位" width="84" />
            <el-table-column label="人员状态" width="68">
              <template #default="{ row }"><StatusTag :text="row.status" /></template>
            </el-table-column>
            <el-table-column prop="idCard" label="身份证号" min-width="132" />
            <el-table-column label="操作" width="104" fixed="right">
              <template #default="{ row }">
                <span class="ops-links">
                  <span class="dw-link" @click.stop="store.selectPerson(row.id)">编辑</span>
                  <span class="dw-link" @click.stop="todo('更多')">更多 ⌄</span>
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
              :page-sizes="[5, 10, 20]"
              :pager-count="5"
              @current-change="store.changePage"
              @size-change="store.changeSize"
            />
          </div>
        </div>

        <div class="dw-card detail-card" v-loading="store.detailLoading">
          <template v-if="store.detail">
            <div class="detail-person">
              <div class="detail-avatar">
                <img v-if="store.detail.id === 1" :src="`${baseUrl}avatar-zhang.jpg`" alt="张三" />
                <span v-else>{{ store.detail.name[0] }}</span>
              </div>
              <div class="detail-name">
                {{ store.detail.name }}
                <span class="detail-no">（{{ store.detail.no }}）</span>
                <StatusTag :text="store.detail.status" />
              </div>
              <div class="detail-meta">
                <div><AppIcon name="org" :size="14" /> 所属组织：{{ store.detail.orgName }}</div>
                <div><AppIcon name="building" :size="14" /> 岗位：{{ store.detail.post }}</div>
                <div><AppIcon name="phone" :size="14" /> 手机：{{ store.detail.phone }}</div>
                <div><AppIcon name="idcard" :size="14" /> 身份证：{{ store.detail.idCard }}</div>
              </div>
            </div>

            <div class="detail-body">
              <div class="dw-tabs detail-tabs">
                <div
                  v-for="t in detailTabs"
                  :key="t.value"
                  class="dw-tab"
                  :class="{ 'is-active': store.detailTab === t.value }"
                  @click="store.detailTab = t.value"
                >
                  {{ t.label }}
                </div>
              </div>

              <div v-if="store.detailTab === 'perm'" class="detail-pane">
                <el-table :data="store.detail.permissions" class="compact-table" style="width: 100%">
                  <el-table-column prop="door" label="门禁点" min-width="116" class-name="nowrap-cell" />
                  <el-table-column prop="plan" label="权限计划" min-width="114" class-name="nowrap-cell" />
                  <el-table-column prop="start" label="生效时间" width="116" class-name="nowrap-cell" />
                  <el-table-column label="失效时间" width="82" class-name="nowrap-cell">
                    <template #default="{ row }">{{ fmtExpire(row.end) }}</template>
                  </el-table-column>
                  <el-table-column label="下发状态" width="72">
                    <template #default="{ row }"><StatusTag :text="row.status" /></template>
                  </el-table-column>
                </el-table>
                <div v-if="!store.detail.permissions.length" class="dw-empty">该人员暂无门禁权限</div>
              </div>

              <div v-else-if="store.detailTab === 'basic'" class="detail-pane basic-grid">
                <div v-for="item in [
                  { k: '姓名', v: store.detail.name },
                  { k: '工号', v: store.detail.no },
                  { k: '所属组织', v: store.detail.orgName },
                  { k: '岗位', v: store.detail.post },
                  { k: '人员状态', v: store.detail.status },
                  { k: '手机号码', v: store.detail.phone },
                  { k: '身份证号', v: store.detail.idCard },
                  { k: '人脸采集', v: store.detail.faceCollected ? '已采集' : '未采集' }
                ]" :key="item.k" class="basic-item">
                  <span class="k">{{ item.k }}</span>
                  <span class="v">{{ item.v }}</span>
                </div>
              </div>

              <div v-else-if="store.detailTab === 'credential'" class="detail-pane">
                <el-table :data="store.detail.credentials" style="width: 100%">
                  <el-table-column prop="type" label="凭证类型" min-width="140" />
                  <el-table-column prop="value" label="凭证信息" min-width="180" />
                  <el-table-column label="状态" width="100">
                    <template #default="{ row }"><StatusTag :text="row.status" /></template>
                  </el-table-column>
                </el-table>
              </div>

              <div v-else class="detail-pane track-pane">
                <div v-for="(t, i) in store.detail.tracks" :key="i" class="track-item">
                  <div class="track-line">
                    <span class="track-dot" />
                    <span v-if="i < store.detail.tracks.length - 1" class="track-rule" />
                  </div>
                  <div class="track-content">
                    <div class="track-time">{{ t.time }}</div>
                    <div class="track-desc">{{ t.door }} · {{ t.action }}<span class="track-result">{{ t.result }}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <div v-else class="dw-empty">请选择人员查看详情</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.person-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 14px;
  align-items: stretch;
}

.tree-card {
  padding: 14px 12px;
  min-height: 520px;
}

.person-main {
  min-width: 0;
}

.list-card {
  padding: 14px 16px 12px;
}

.toolbar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.filter-label {
  color: #5a6b85;
  font-size: 13px;
}

.person-name {
  font-weight: 500;
  color: #1f2d3d;
}

.ops-links {
  white-space: nowrap;
}

.table-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
}

:deep(.row-selected > td.el-table__cell) {
  background: #eef5ff !important;
}

.detail-card {
  margin-top: 14px;
  padding: 16px;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 16px;
}

@media (max-width: 1366px) {
  .detail-card {
    grid-template-columns: 220px minmax(0, 1fr);
  }
}

.detail-person {
  border-right: 1px solid #f0f3f8;
  padding-right: 18px;
}

.detail-avatar {
  width: 96px;
  height: 112px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 28%, #e8eefb 0 18%, transparent 19%),
    radial-gradient(circle at 50% 78%, #dbe6f8 0 34%, transparent 35%),
    linear-gradient(160deg, #f2f6fd, #dfe9fb);
  color: #1a66ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  font-weight: 600;
}

.detail-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-name {
  margin-top: 12px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.detail-no {
  font-size: 13px;
  font-weight: 400;
  color: #5a6b85;
}

.detail-meta {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13px;
  color: #3a4a5f;
}

.detail-meta div {
  display: flex;
  align-items: center;
  gap: 7px;
}

.detail-meta :deep(svg) {
  color: #8a97a8;
}

.detail-body {
  min-width: 0;
}

.detail-tabs {
  margin-bottom: 4px;
}

.detail-tabs .dw-tab {
  padding: 8px 14px;
  font-size: 14px;
}

.detail-tabs .dw-tab.is-active::after {
  left: 14px;
  right: 14px;
}

.detail-pane {
  padding-top: 10px;
}

.detail-pane :deep(.compact-table) {
  font-size: 11.5px;
}

.basic-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 26px;
}

.basic-item {
  display: flex;
  font-size: 13px;
  padding: 9px 0;
  border-bottom: 1px solid #f5f7fb;
}

.basic-item .k {
  width: 84px;
  color: #8a97a8;
  flex-shrink: 0;
}

.basic-item .v {
  color: #1f2d3d;
}

.track-pane {
  padding-top: 14px;
}

.track-item {
  display: flex;
  gap: 12px;
}

.track-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 14px;
}

.track-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #1a66ff;
  margin-top: 5px;
  flex-shrink: 0;
}

.track-rule {
  width: 1px;
  flex: 1;
  background: #dbe5f4;
  margin: 4px 0;
  min-height: 24px;
}

.track-content {
  padding-bottom: 16px;
}

.track-time {
  font-size: 12px;
  color: #8a97a8;
}

.track-desc {
  font-size: 13px;
  margin-top: 3px;
  color: #1f2d3d;
}

.track-result {
  margin-left: 8px;
  color: #18a058;
}
</style>
