<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import PageTabs from '@/components/PageTabs.vue'
import AppIcon from '@/components/AppIcon.vue'
import StatusTag from '@/components/StatusTag.vue'
import OrgTreePanel from '@/components/OrgTreePanel.vue'
import { usePersonStore } from '@/stores/person'

const router = useRouter()
const store = usePersonStore()
const { t } = useI18n()
const baseUrl = import.meta.env.BASE_URL
const keyword = ref('')
const statusFilter = ref('')

const tabs = computed(() => [
  { label: t('page.person.tabProfile'), value: '/access/person' },
  { label: t('menu.access.person-import'), value: '/access/person-import' },
  { label: t('menu.access.person-group'), value: '/access/person-group' },
  { label: t('menu.access.person-log'), value: '/access/person-log' }
])

const detailTabs = computed(() => [
  { label: t('page.person.detailBasic'), value: 'basic' },
  { label: t('page.person.detailCredential'), value: 'credential' },
  { label: t('page.person.detailPerm'), value: 'perm' },
  { label: t('page.person.detailTrack'), value: 'track' }
])

const POST_KEYS = { 仓点管理员: 'siteManager', 运营人员: 'operator', 设备巡检: 'inspector', 合作方人员: 'partner', 安全员: 'safety' }
const PERSON_STATUS_KEYS = { 在职: 'active', 临时: 'temporary', 停用: 'disabled' }
function postLabel(value) {
  return t(`posts.${POST_KEYS[value] || 'operator'}`)
}
function personStatusLabel(value) {
  return t(`status.${PERSON_STATUS_KEYS[value] || 'active'}`)
}
function credentialTypeLabel(value) {
  return value === '人脸凭证' ? t('page.person.credentialFace') : value === '门禁卡' ? t('page.person.credentialCard') : value
}
function trackActionLabel(value) {
  return value === '人脸验证通过' ? t('page.person.actionFace') : value
}
function trackResultLabel(value) {
  return value === '通行' ? t('page.person.resultPass') : value
}

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
  return value || t('common.longTerm')
}

function todo(name) {
  ElMessage.info(t('page.video.demo', { name }))
}
</script>

<template>
  <div class="person-page">
    <PageHeader :title="t('menu.access.person')" :subtitle="t('page.person.subtitle')">
      <PageTabs :tabs="tabs" model-value="/access/person" @change="switchTab" />
    </PageHeader>

    <div class="person-layout">
      <div class="dw-card tree-card">
        <OrgTreePanel
          :title="t('page.person.orgTitle')"
          :data="store.orgTree ? [store.orgTree] : []"
          :selected-key="store.selectedOrgId"
          :search-placeholder="t('page.person.orgSearch')"
          show-add
          @select="store.selectOrg"
        />
      </div>

      <div class="person-main">
        <div class="dw-card list-card">
          <div class="toolbar-row">
            <el-button type="primary" size="small" @click="todo(t('page.person.addPerson'))">
              <AppIcon name="add" :size="14" style="margin-right: 5px" />{{ t('page.person.addPerson') }}
            </el-button>
            <el-button size="small" @click="todo(t('page.person.batchImport'))">
              <AppIcon name="export" :size="14" style="margin-right: 5px" />{{ t('page.person.batchImport') }}
            </el-button>
            <el-button size="small" @click="todo(t('page.person.batchExport'))">
              <AppIcon name="down" :size="14" style="margin-right: 5px" />{{ t('page.person.batchExport') }}
            </el-button>
            <el-button size="small" @click="todo(t('page.person.faceCollect'))">
              <AppIcon name="facescan" :size="14" style="margin-right: 5px" />{{ t('page.person.faceCollect') }}
            </el-button>
            <el-button size="small" @click="todo(t('page.person.moreOps'))">
              <AppIcon name="more" :size="14" style="margin-right: 5px" />{{ t('page.person.moreOps') }}
            </el-button>
          </div>

          <div class="filter-row">
            <div class="dw-search" style="width: 240px">
              <el-input
                v-model="keyword"
                size="small"
                :placeholder="t('page.person.searchPlaceholder')"
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
            <span class="filter-label">{{ t('page.person.statusFilter') }}:</span>
            <el-select :model-value="statusFilter" size="small" :placeholder="t('common.all')" style="width: 96px" @update:model-value="changeStatus">
              <el-option :label="t('common.all')" value="" />
              <el-option :label="t('status.active')" value="在职" />
              <el-option :label="t('status.temporary')" value="临时" />
              <el-option :label="t('status.disabled')" value="停用" />
            </el-select>
            <span class="filter-label">{{ t('page.person.orgFilter') }}:</span>
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
            <el-table-column :label="t('page.person.colName')" width="66">
              <template #default="{ row }">
                <span class="person-name">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="no" :label="t('page.person.colNo')" width="78" />
            <el-table-column prop="orgName" :label="t('page.person.colOrg')" min-width="116" />
            <el-table-column :label="t('page.person.colPost')" width="104">
              <template #default="{ row }">{{ postLabel(row.post) }}</template>
            </el-table-column>
            <el-table-column :label="t('page.person.colStatus')" width="84">
              <template #default="{ row }"><StatusTag :text="row.status" /></template>
            </el-table-column>
            <el-table-column prop="idCard" :label="t('page.person.colId')" min-width="132" />
            <el-table-column :label="t('common.actions')" width="104" fixed="right">
              <template #default="{ row }">
                <span class="ops-links">
                  <span class="dw-link" @click.stop="store.selectPerson(row.id)">{{ t('page.person.edit') }}</span>
                  <span class="dw-link" @click.stop="todo(t('common.more'))">{{ t('page.person.more') }}</span>
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
                <span class="detail-no">({{ store.detail.no }})</span>
                <StatusTag :text="store.detail.status" />
              </div>
              <div class="detail-meta">
                <div><AppIcon name="org" :size="14" /> {{ t('page.person.fieldOrg') }}: {{ store.detail.orgName }}</div>
                <div><AppIcon name="building" :size="14" /> {{ t('page.person.fieldPost') }}: {{ postLabel(store.detail.post) }}</div>
                <div><AppIcon name="phone" :size="14" /> {{ t('page.person.fieldPhone') }}: {{ store.detail.phone }}</div>
                <div><AppIcon name="idcard" :size="14" /> {{ t('page.person.fieldId') }}: {{ store.detail.idCard }}</div>
              </div>
            </div>

            <div class="detail-body">
              <div class="dw-tabs detail-tabs">
                <div
                  v-for="tab in detailTabs"
                  :key="tab.value"
                  class="dw-tab"
                  :class="{ 'is-active': store.detailTab === tab.value }"
                  @click="store.detailTab = tab.value"
                >
                  {{ tab.label }}
                </div>
              </div>

              <div v-if="store.detailTab === 'perm'" class="detail-pane">
                <el-table :data="store.detail.permissions" class="compact-table" style="width: 100%">
                  <el-table-column prop="door" :label="t('page.person.colDoor')" min-width="116" class-name="nowrap-cell" />
                  <el-table-column prop="plan" :label="t('page.person.colPlan')" min-width="114" class-name="nowrap-cell" />
                  <el-table-column prop="start" :label="t('page.person.colStart')" width="116" class-name="nowrap-cell" />
                  <el-table-column :label="t('page.person.colEnd')" width="82" class-name="nowrap-cell">
                    <template #default="{ row }">{{ fmtExpire(row.end) }}</template>
                  </el-table-column>
                  <el-table-column :label="t('page.person.colIssueStatus')" width="72">
                    <template #default="{ row }"><StatusTag :text="row.status" /></template>
                  </el-table-column>
                </el-table>
                <div v-if="!store.detail.permissions.length" class="dw-empty">{{ t('page.person.emptyPerm') }}</div>
              </div>

              <div v-else-if="store.detailTab === 'basic'" class="detail-pane basic-grid">
                <div v-for="item in [
                  { k: t('page.person.fieldName'), v: store.detail.name },
                  { k: t('page.person.fieldNo'), v: store.detail.no },
                  { k: t('page.person.fieldOrg'), v: store.detail.orgName },
                  { k: t('page.person.fieldPost'), v: postLabel(store.detail.post) },
                  { k: t('page.person.fieldStatus'), v: personStatusLabel(store.detail.status) },
                  { k: t('page.person.fieldPhoneFull'), v: store.detail.phone },
                  { k: t('page.person.fieldIdFull'), v: store.detail.idCard },
                  { k: t('page.person.fieldFace'), v: store.detail.faceCollected ? t('page.person.collected') : t('page.person.notCollected') }
                ]" :key="item.k" class="basic-item">
                  <span class="k">{{ item.k }}</span>
                  <span class="v">{{ item.v }}</span>
                </div>
              </div>

              <div v-else-if="store.detailTab === 'credential'" class="detail-pane">
                <el-table :data="store.detail.credentials" style="width: 100%">
                  <el-table-column :label="t('page.person.colCredentialType')" min-width="140">
                  <template #default="{ row }">{{ credentialTypeLabel(row.type) }}</template>
                </el-table-column>
                  <el-table-column prop="value" :label="t('page.person.colCredentialValue')" min-width="180" />
                  <el-table-column :label="t('page.person.colCredentialStatus')" width="100">
                    <template #default="{ row }"><StatusTag :text="row.status" /></template>
                  </el-table-column>
                </el-table>
              </div>

              <div v-else class="detail-pane track-pane">
                <div v-for="(item, i) in store.detail.tracks" :key="i" class="track-item">
                  <div class="track-line">
                    <span class="track-dot" />
                    <span v-if="i < store.detail.tracks.length - 1" class="track-rule" />
                  </div>
                  <div class="track-content">
                    <div class="track-time">{{ item.time }}</div>
                    <div class="track-desc">{{ item.door }} · {{ trackActionLabel(item.action) }}<span class="track-result">{{ trackResultLabel(item.result) }}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <div v-else class="dw-empty">{{ t('page.person.emptyPerson') }}</div>
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
