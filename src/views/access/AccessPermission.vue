<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import PageTabs from '@/components/PageTabs.vue'
import AppIcon from '@/components/AppIcon.vue'
import StatusTag from '@/components/StatusTag.vue'
import OrgTreeNode from '@/components/OrgTreeNode.vue'
import { useAccessStore } from '@/stores/access'

const router = useRouter()
const store = useAccessStore()
const expanded = reactive({})
const personKw = ref('')

const filteredPersons = computed(() => {
  const kw = personKw.value.trim()
  if (!kw) return store.persons
  return store.persons.filter((p) => `${p.name}${p.no}${p.orgName}`.includes(kw))
})

const tabs = [
  { label: '权限配置', value: 'perm' },
  { label: '权限下发', value: 'issue' },
  { label: '权限查询', value: 'query' },
  { label: '授权记录', value: 'record' },
  { label: '权限变更', value: 'change' }
]

const tabPath = {
  issue: '/access/issue',
  query: '/access/issue',
  record: '/access/record',
  change: '/access/control'
}

const steps = ['选择授权对象', '配置通行计划', '选择门禁资源', '确认并下发']

const checkedMap = computed(() => {
  const map = {}
  store.doorIds.forEach((id) => {
    map[id] = true
  })
  return map
})

function withCounts(nodes) {
  return nodes.map((n) => {
    if (!n.children) return { ...n }
    const children = withCounts(n.children)
    let count = n.count
    if (typeof n.count === 'string' && n.count.includes('/')) {
      let total = 0
      let checked = 0
      const walk = (node) => {
        if (node.icon === 'door') {
          total += 1
          if (store.doorIds.includes(node.id)) checked += 1
        }
        ;(node.children || []).forEach(walk)
      }
      walk(n)
      count = `${checked}/${total}`
    }
    return { ...n, children, count }
  })
}

const doorsTree = computed(() => (store.doorTree ? withCounts([store.doorTree]) : []))

const selectedPlanText = computed(() => store.selectedPlan?.name || '未选择')

onMounted(() => {
  store.loadAll()
})

function toggleNode(node) {
  const cur = expanded[node.id] !== undefined ? expanded[node.id] : node.open !== false
  expanded[node.id] = !cur
}

function onDoorCheck({ node, checked }) {
  store.toggleDoor(node.id, checked)
}

function onDoorSelect(node) {
  store.toggleDoor(node.id, !store.doorIds.includes(node.id))
}

function switchTab(value) {
  const path = tabPath[value]
  if (path) router.push(path)
}

function next() {
  if (store.step === 1) {
    if (!store.selectedNos.length) {
      ElMessage.warning('请先选择授权人员')
      return
    }
    if (store.validity.type === 'custom' && store.validity.from > store.validity.to) {
      ElMessage.warning('有效期开始日期不能晚于结束日期')
      return
    }
  }
  if (store.step === 2 && !store.planId) {
    ElMessage.warning('请选择通行计划')
    return
  }
  if (store.step === 3) {
    if (!store.doorIds.length) {
      ElMessage.warning('请至少选择一个门禁点')
      return
    }
    if (store.validity.type === 'custom' && store.validity.from > store.validity.to) {
      ElMessage.warning('有效期开始日期不能晚于结束日期')
      return
    }
  }
  store.nextStep()
}

function goStep(step) {
  if (step < store.step) store.step = step
  else if (step > store.step) ElMessage.info('请按步骤完成当前配置')
}

async function issue() {
  const res = await store.issue()
  if (!res.ok) {
    ElMessage.warning(res.message)
    return
  }
  ElMessage.success(`权限已下发到 ${res.doors} 个门禁点，共 ${res.count} 条授权（演示）`)
}

async function revoke(row) {
  try {
    await ElMessageBox.confirm(`确认撤销「${row.name}」在「${row.door}」的通行权限？`, '撤销授权', {
      confirmButtonText: '撤销',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await store.revoke(row.id)
    ElMessage.success('已撤销该条授权（演示）')
  } catch (e) {
    /* 取消 */
  }
}

function todo(name) {
  ElMessage.info(`「${name}」为演示占位功能`)
}

function validityText(row) {
  if (!row.end) return '长期有效'
  return `${row.start} 至 ${row.end}`
}
</script>

<template>
  <div class="access-page">
    <PageHeader title="门禁权限配置" subtitle="按人员批量授权，配置通行计划并下发到门禁控制器">
      <PageTabs :tabs="tabs" model-value="perm" @change="switchTab" />
    </PageHeader>

    <div class="dw-card step-card" v-loading="store.loading">
      <div class="steps">
        <div
          v-for="(label, idx) in steps"
          :key="label"
          class="step"
          :class="{ cur: store.step === idx + 1, done: store.step > idx + 1 }"
          @click="goStep(idx + 1)"
        >
          <span class="sn">{{ store.step > idx + 1 ? '✓' : idx + 1 }}</span>
          <span>{{ label }}</span>
        </div>
      </div>

      <!-- 第一步 -->
      <template v-if="store.step === 1">
        <div class="mode-row">
          <span class="mode-label">授权方式：</span>
          <el-radio-group v-model="store.mode">
            <el-radio value="org">按组织授权</el-radio>
            <el-radio value="group">按人员分组授权</el-radio>
            <el-radio value="person">按人员授权</el-radio>
          </el-radio-group>
        </div>

        <div class="perm-grid">
          <div class="panel">
            <div class="phead">
              <AppIcon name="user" :size="15" />
              <span>选择人员</span>
              <span class="cnt">（已选 {{ store.selectedNos.length }} 人）</span>
              <span class="add" @click="todo('添加人员')">＋添加人员</span>
            </div>
            <el-input v-model="personKw" size="small" placeholder="姓名 / 工号 / 证件号码" style="margin-bottom: 8px" />
            <div class="person-table">
              <div class="person-head">
                <span />
                <span>姓名</span>
                <span>工号</span>
                <span>所属组织</span>
              </div>
              <div
                v-for="p in filteredPersons"
                :key="p.id"
                class="person-row"
                :class="{ sel: store.selectedNos.includes(p.no) }"
                @click="store.togglePerson(p.no)"
              >
                <el-checkbox
                  :model-value="store.selectedNos.includes(p.no)"
                  @click.stop
                  @change="store.togglePerson(p.no)"
                />
                <span class="pname">{{ p.name }}</span>
                <span class="pno">{{ p.no }}</span>
                <span class="porg">{{ p.orgName }}</span>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="phead">
              <AppIcon name="clock" :size="15" />
              <span>通行计划</span>
              <span class="cnt">（1 个）</span>
            </div>
            <div
              v-for="p in store.plans"
              :key="p.id"
              class="plan"
              :class="{ sel: store.planId === p.id }"
              @click="store.planId = p.id"
            >
              <input v-model="store.planId" type="radio" class="radio" :value="p.id" @click.stop />
              <div>
                <div class="pname">{{ p.name }}</div>
                <div class="pdesc">{{ p.desc }}</div>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="phead">
              <AppIcon name="door" :size="15" />
              <span>选择门禁资源</span>
              <span class="cnt">（已选 {{ store.doorIds.length }} 个）</span>
            </div>
            <div class="door-tree">
              <OrgTreeNode
                v-for="node in doorsTree"
                :key="node.id"
                :node="node"
                :expanded="expanded"
                checkable
                :checked="checkedMap"
                @toggle="toggleNode"
                @select="onDoorSelect"
                @check="onDoorCheck"
              />
            </div>
          </div>
        </div>

        <div class="valid-row">
          <span class="mode-label">有效期：</span>
          <el-radio-group v-model="store.validity.type">
            <el-radio value="long">长期有效</el-radio>
            <el-radio value="custom">自定义</el-radio>
          </el-radio-group>
          <el-date-picker
            v-model="store.validity.from"
            type="date"
            size="small"
            value-format="YYYY-MM-DD"
            :disabled="store.validity.type !== 'custom'"
            style="width: 136px"
          />
          <span class="to">~</span>
          <el-date-picker
            v-model="store.validity.to"
            type="date"
            size="small"
            value-format="YYYY-MM-DD"
            :disabled="store.validity.type !== 'custom'"
            style="width: 136px"
          />
          <span class="grow" />
          <el-button type="primary" size="small" @click="next">
            下一步：确认并下发
          </el-button>
        </div>
      </template>

      <!-- 第二步 -->
      <template v-else-if="store.step === 2">
        <div class="perm-grid">
          <div class="panel">
            <div class="phead"><AppIcon name="user" :size="15" /><span>授权对象</span><span class="cnt">（{{ store.selectedNos.length }} 人）</span></div>
            <div v-for="p in store.selectedPersons" :key="p.id" class="recap-row">
              <span class="dw-avatar">{{ p.name[0] }}</span>
              <span>{{ p.name }}</span>
              <span class="recap-no">{{ p.no }}</span>
            </div>
          </div>
          <div class="panel">
            <div class="phead"><AppIcon name="clock" :size="15" /><span>通行计划</span></div>
            <div
              v-for="p in store.plans"
              :key="p.id"
              class="plan"
              :class="{ sel: store.planId === p.id }"
              @click="store.planId = p.id"
            >
              <input v-model="store.planId" type="radio" class="radio" :value="p.id" @click.stop />
              <div>
                <div class="pname">{{ p.name }}</div>
                <div class="pdesc">{{ p.desc }}</div>
              </div>
            </div>
          </div>
          <div class="panel">
            <div class="phead"><AppIcon name="doc" :size="15" /><span>时间参数</span></div>
            <div class="plan-note">{{ selectedPlanText }} · {{ store.selectedPlan?.desc }}</div>
            <div class="time-row">
              <el-input model-value="08:00" size="small" />
              <span class="to">至</span>
              <el-input model-value="20:00" size="small" />
            </div>
            <div class="dw-sub">演示原型：时段参数为示意，正式版按通行计划模板生成</div>
          </div>
        </div>
        <div class="step-actions">
          <el-button size="small" @click="store.prevStep()">上一步</el-button>
          <el-button type="primary" size="small" @click="next">下一步：选择门禁资源</el-button>
        </div>
      </template>

      <!-- 第三步 -->
      <template v-else-if="store.step === 3">
        <div class="panel" style="max-width: 660px">
          <div class="phead">
            <AppIcon name="door" :size="15" />
            <span>选择门禁资源</span>
            <span class="cnt">（已选 {{ store.doorIds.length }} 个）</span>
          </div>
          <div class="door-tree" style="max-height: 340px">
            <OrgTreeNode
              v-for="node in doorsTree"
              :key="node.id"
              :node="node"
              :expanded="expanded"
              checkable
              :checked="checkedMap"
              @toggle="toggleNode"
              @select="onDoorSelect"
              @check="onDoorCheck"
            />
          </div>
        </div>
        <div class="step-actions">
          <el-button size="small" @click="store.prevStep()">上一步</el-button>
          <el-button type="primary" size="small" @click="next">下一步：确认并下发</el-button>
        </div>
      </template>

      <!-- 第四步 -->
      <template v-else>
        <div class="perm-grid">
          <div class="panel">
            <div class="phead"><AppIcon name="user" :size="15" /><span>授权对象（{{ store.selectedNos.length }} 人）</span></div>
            <div v-for="p in store.selectedPersons" :key="p.id" class="recap-row">
              <span class="dw-avatar">{{ p.name[0] }}</span>
              <span>{{ p.name }}</span>
              <span class="recap-no">{{ p.no }}</span>
            </div>
          </div>
          <div class="panel">
            <div class="phead"><AppIcon name="clock" :size="15" /><span>通行计划</span></div>
            <div class="plan sel" style="cursor: default">
              <div>
                <div class="pname">{{ store.selectedPlan?.name }}</div>
                <div class="pdesc">{{ store.selectedPlan?.desc }}</div>
                <div class="pdesc">
                  有效期：{{ store.validity.type === 'long' ? '长期有效' : `${store.validity.from} 至 ${store.validity.to}` }}
                </div>
              </div>
            </div>
          </div>
          <div class="panel">
            <div class="phead"><AppIcon name="door" :size="15" /><span>门禁资源（{{ store.selectedDoors.length }} 个）</span></div>
            <div v-for="d in store.selectedDoors" :key="d.id" class="door-row">
              <AppIcon name="door" :size="13" /> {{ d.name }}
            </div>
          </div>
        </div>
        <div class="step-actions">
          <el-button size="small" @click="store.prevStep()">上一步</el-button>
          <el-button type="primary" size="small" @click="issue">
            <AppIcon name="check" :size="14" style="margin-right: 5px" />确认并下发
          </el-button>
        </div>
      </template>
    </div>

    <div class="bottom-grid">
      <div class="dw-card">
        <div class="dw-card__title">
          <AppIcon name="key" :size="15" />
          已配置权限（当前人员的门禁授权）
        </div>
        <el-table :data="store.permissions" class="compact-table" style="width: 100%">
          <el-table-column prop="name" label="姓名" width="54" />
          <el-table-column prop="no" label="工号" width="66" />
          <el-table-column prop="door" label="门禁点" min-width="118" />
          <el-table-column prop="plan" label="通行计划" min-width="110" />
          <el-table-column label="有效期" min-width="82">
            <template #default="{ row }">{{ validityText(row) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="62">
            <template #default="{ row }"><StatusTag :text="row.status" /></template>
          </el-table-column>
          <el-table-column label="操作" width="82">
            <template #default="{ row }">
              <span class="dw-link" @click="todo('变更')">变更</span>
              <span class="dw-link danger" @click="revoke(row)">撤销</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="dw-card">
        <div class="dw-card__title">
          <AppIcon name="doc" :size="15" />
          权限下发记录（最近 5 条）
          <span class="more" @click="todo('查看更多')">查看更多 ›</span>
        </div>
        <el-table :data="store.records.slice(0, 5)" class="compact-table" style="width: 100%">
          <el-table-column prop="time" label="下发时间" width="116" class-name="nowrap-cell" />
          <el-table-column prop="target" label="下发对象" min-width="96" show-overflow-tooltip />
          <el-table-column prop="doors" label="门禁点数量" width="80" />
          <el-table-column label="结果" width="84">
            <template #default="{ row }">
              <span style="color: #18a058">
                <AppIcon name="check" :size="12" /> {{ row.result }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.step-card {
  padding: 16px;
}

.steps {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}

.step {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px 0 26px;
  background: #f2f5fa;
  color: #8a97a8;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%);
  margin-left: -6px;
  white-space: nowrap;
}

.step:first-child {
  margin-left: 0;
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%);
  padding-left: 16px;
}

.step .sn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #c9d4e4;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.step.cur {
  background: #1a66ff;
  color: #fff;
}

.step.cur .sn {
  background: rgba(255, 255, 255, 0.28);
}

.step.done {
  background: #e8f0ff;
  color: #1a66ff;
}

.step.done .sn {
  background: #1a66ff;
}

.mode-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

.mode-label {
  color: #5a6b85;
  font-size: 13px;
}

.perm-grid {
  display: grid;
  grid-template-columns: 1.05fr 1fr 1fr;
  gap: 14px;
}

.panel {
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  padding: 12px;
  min-width: 0;
}

.phead {
  display: flex;
  align-items: center;
  gap: 7px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 10px;
  color: #1f2d3d;
}

.phead :deep(svg) {
  color: #1a66ff;
}

.phead .cnt {
  color: #1a66ff;
  font-weight: 400;
  font-size: 12px;
}

.phead .add {
  margin-left: auto;
  font-size: 12px;
  font-weight: 400;
  color: #1a66ff;
  cursor: pointer;
}

.person-table {
  max-height: 240px;
  overflow: auto;
}

.person-head,
.person-row {
  display: grid;
  grid-template-columns: 24px 64px 68px minmax(0, 1fr);
  align-items: center;
  gap: 5px;
  font-size: 12px;
  padding: 5px 2px;
}

.person-head {
  color: #8a97a8;
  border-bottom: 1px solid #f0f3f8;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 1;
}

.person-row {
  border-radius: 5px;
  cursor: pointer;
  color: #3a4a5f;
}

.person-row:hover {
  background: #f6f9ff;
}

.person-row.sel {
  background: #e8f0ff;
}

.person-row .pname {
  font-weight: 500;
  color: #1f2d3d;
}

.person-row .pno {
  color: #5a6b85;
  white-space: nowrap;
}

.person-row .porg {
  color: #5a6b85;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan {
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  padding: 9px 11px;
  margin-bottom: 8px;
  cursor: pointer;
  display: flex;
  gap: 9px;
}

.plan:hover {
  border-color: #9cc0ff;
}

.plan.sel {
  border-color: #1a66ff;
  background: #f6f9ff;
}

.plan .radio {
  width: 15px;
  height: 15px;
  accent-color: #1a66ff;
  flex-shrink: 0;
  margin-top: 2px;
}

.plan .pname {
  font-size: 13px;
  font-weight: 500;
}

.plan .pdesc {
  font-size: 12px;
  color: #8a97a8;
  margin-top: 2px;
}

.door-tree {
  max-height: 240px;
  overflow: auto;
}

.valid-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
}

.valid-row .to {
  color: #8a97a8;
}

.valid-row .grow {
  flex: 1;
}

.step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.recap-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 5px 0;
}

.recap-no {
  margin-left: auto;
  color: #8a97a8;
  font-size: 12px;
}

.plan-note {
  font-size: 13px;
  color: #5a6b85;
  margin-bottom: 10px;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.door-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 5px 0;
  color: #3a4a5f;
}

.door-row :deep(svg) {
  color: #7ba7f7;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: 14px;
  margin-top: 14px;
}

.bottom-grid .dw-card {
  padding: 14px 16px;
  min-width: 0;
}

.bottom-grid :deep(.compact-table) {
  font-size: 11.5px;
}
</style>
