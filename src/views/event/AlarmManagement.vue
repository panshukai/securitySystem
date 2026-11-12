<script setup>
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'

const { t } = useI18n()
const loading = ref(false)
const searchParams = ref({})
const page = reactive({ currentPage: 1, pageSize: 10, total: 0 })

const rawList = ref([
  { id: 1, name: '仓库区域人员闯入', location: 'HZ001-仓库出入口', level: '高', time: '2025-01-08 14:26', status: '待处置' },
  { id: 2, name: '门禁多次验证失败', location: 'HZ002-员工通道', level: '中', time: '2025-01-08 14:21', status: '待处置' },
  { id: 3, name: '摄像机离线', location: 'HZ003-装配区', level: '低', time: '2025-01-08 14:15', status: '已处置' },
  { id: 4, name: '消防通道滞留', location: 'HZ001-仓库通道', level: '中', time: '2025-01-08 13:58', status: '已处置' },
  { id: 5, name: '非授权时段开门', location: 'HZ002-月台门禁', level: '高', time: '2025-01-08 13:42', status: '待处置' },
  { id: 6, name: '镜头偏离检测', location: 'HZ001-异常资产区', level: '低', time: '2025-01-08 13:36', status: '已处置' },
  { id: 7, name: '门禁控制器离线', location: 'HZ003-收货区', level: '中', time: '2025-01-08 13:20', status: '已处置' },
  { id: 8, name: '充电区烟火识别', location: 'HZ001-验收充电区', level: '高', time: '2025-01-08 13:05', status: '待处置' },
  { id: 9, name: '陌生人脸识别', location: 'HZ001-仓库出入口', level: '中', time: '2025-01-08 12:55', status: '已处置' },
  { id: 10, name: '门禁长时间未关闭', location: 'HZ002-员工通道', level: '低', time: '2025-01-08 12:45', status: '已处置' },
  { id: 11, name: 'UPS 市电中断', location: 'HZ001-机房', level: '高', time: '2025-01-08 12:31', status: '处置中' },
  { id: 12, name: '温湿度超限', location: 'HZ003-存储区', level: '中', time: '2025-01-08 12:20', status: '已处置' }
])

const levelDict = computed(() => [
  { label: t('status.high'), value: '高' },
  { label: t('status.medium'), value: '中' },
  { label: t('status.low'), value: '低' }
])

const statusDict = computed(() => [
  { label: t('status.pending'), value: '待处置' },
  { label: t('status.processing'), value: '处置中' },
  { label: t('status.done'), value: '已处置' }
])

const option = computed(() => ({
  border: true,
  index: true,
  indexLabel: '#',
  stripe: true,
  searchShow: true,
  searchMenuSpan: 6,
  searchLabelWidth: 120,
  labelWidth: 110,
  menuWidth: 160,
  dialogWidth: 520,
  dialogDrag: true,
  addBtnText: t('page.alarm.add'),
  editBtnText: t('page.alarm.edit'),
  delBtnText: t('page.alarm.delete'),
  column: [
    {
      label: t('page.alarm.colName'),
      prop: 'name',
      search: true,
      searchPlaceholder: t('page.alarm.colName'),
      span: 24,
      rules: [{ required: true, message: t('page.alarm.colName'), trigger: 'blur' }]
    },
    {
      label: t('page.alarm.colLocation'),
      prop: 'location',
      search: true,
      searchPlaceholder: t('page.alarm.colLocation'),
      span: 24
    },
    {
      label: t('page.alarm.colLevel'),
      prop: 'level',
      type: 'select',
      placeholder: t('page.alarm.colLevel'),
      dicData: levelDict.value,
      search: true,
      searchPlaceholder: t('page.alarm.colLevel'),
      span: 12
    },
    {
      label: t('page.alarm.colTime'),
      prop: 'time',
      type: 'datetime',
      placeholder: t('page.alarm.colTime'),
      format: 'YYYY-MM-DD HH:mm',
      valueFormat: 'YYYY-MM-DD HH:mm',
      span: 12
    },
    {
      label: t('page.alarm.colStatus'),
      prop: 'status',
      type: 'select',
      placeholder: t('page.alarm.colStatus'),
      dicData: statusDict.value,
      span: 12
    }
  ]
}))

const filteredList = computed(() => {
  const { name = '', location = '', level = '' } = searchParams.value || {}
  return rawList.value.filter(
    (row) =>
      (!name || row.name.includes(name)) &&
      (!location || row.location.includes(location)) &&
      (!level || row.level === level)
  )
})

const pagedList = computed(() => {
  const start = (page.currentPage - 1) * page.pageSize
  return filteredList.value.slice(start, start + page.pageSize)
})

function onLoad(currentPage) {
  loading.value = true
  setTimeout(() => {
    currentPage.total = filteredList.value.length
    loading.value = false
  }, 200)
}

function onSearch(params, done) {
  searchParams.value = params || {}
  page.currentPage = 1
  page.total = filteredList.value.length
  done()
}

function rowSave(row, done, loadingFn) {
  loadingFn()
  setTimeout(() => {
    rawList.value = [{ ...row, id: Date.now() }, ...rawList.value]
    page.total = filteredList.value.length
    done()
    ElMessage.success(t('page.alarm.msgSaved'))
  }, 250)
}

function rowUpdate(row, index, done, loadingFn) {
  loadingFn()
  setTimeout(() => {
    rawList.value = rawList.value.map((item) => (item.id === row.id ? { ...item, ...row } : item))
    done()
    ElMessage.success(t('page.alarm.msgSaved'))
  }, 250)
}

async function rowDel(row, index, done) {
  try {
    await ElMessageBox.confirm(t('page.alarm.confirmDelete'), t('page.alarm.delete'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    })
    rawList.value = rawList.value.filter((item) => item.id !== row.id)
    page.total = filteredList.value.length
    done()
    ElMessage.success(t('page.alarm.msgDeleted'))
  } catch (e) {
    /* cancelled */
  }
}
</script>

<template>
  <div class="alarm-page">
    <PageHeader :title="t('page.alarm.title')" :subtitle="t('page.alarm.subtitle')" />
    <div class="dw-card alarm-card">
      <avue-crud
        v-model:page="page"
        :data="pagedList"
        :option="option"
        :table-loading="loading"
        @on-load="onLoad"
        @search-change="onSearch"
        @row-save="rowSave"
        @row-update="rowUpdate"
        @row-del="rowDel"
      />
    </div>
  </div>
</template>

<style scoped lang="less">
.alarm-card {
  padding: 14px 16px;
  min-height: calc(100vh - 180px);
}

.alarm-page :deep(.avue-crud__menu) {
  margin-bottom: 6px;
}

.alarm-page :deep(.avue-crud__search) {
  padding-bottom: 4px;
}

.alarm-page :deep(.el-table th.el-table__cell) {
  background: #f7f9fc;
}
</style>
