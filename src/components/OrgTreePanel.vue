<script setup>
import { computed, reactive, ref } from 'vue'
import OrgTreeNode from './OrgTreeNode.vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  title: { type: String, default: '组织资源' },
  data: { type: Array, default: () => [] },
  selectedKey: { type: [String, Number], default: '' },
  searchPlaceholder: { type: String, default: '请输入组织/仓点名称' },
  checkable: { type: Boolean, default: false },
  checked: { type: Object, default: () => ({}) },
  showAdd: { type: Boolean, default: false }
})

const emit = defineEmits(['select', 'check'])

const keyword = ref('')
const expanded = reactive({})

function filterNodes(nodes, kw) {
  if (!kw) return nodes
  const out = []
  for (const n of nodes) {
    const kids = n.children ? filterNodes(n.children, kw) : []
    if ((n.name || '').includes(kw) || kids.length) {
      out.push({ ...n, children: kids.length ? kids : n.children ? [] : undefined })
    }
  }
  return out
}

const visible = computed(() => filterNodes(props.data, keyword.value.trim()))

function toggle(node) {
  const cur = expanded[node.id] !== undefined ? expanded[node.id] : node.open !== false
  expanded[node.id] = !cur
}
</script>

<template>
  <div class="org-panel">
    <div class="org-panel__head">
      <span class="org-panel__title">{{ title }}</span>
      <span v-if="showAdd" class="org-panel__add"><AppIcon name="add" :size="14" /></span>
      <span class="org-panel__more"><AppIcon name="more" :size="15" /></span>
    </div>
    <el-input
      v-model="keyword"
      size="small"
      :placeholder="searchPlaceholder"
      clearable
      class="org-panel__search"
    >
      <template #suffix>
        <AppIcon name="search" :size="14" style="color: #8a97a8" />
      </template>
    </el-input>
    <div class="org-panel__body">
      <OrgTreeNode
        v-for="node in visible"
        :key="node.id"
        :node="node"
        :selected-key="selectedKey"
        :expanded="expanded"
        :checkable="checkable"
        :checked="checked"
        @toggle="toggle"
        @select="emit('select', $event)"
        @check="emit('check', $event)"
      />
      <div v-if="!visible.length" class="dw-empty" style="padding: 24px 0">无匹配组织</div>
    </div>
  </div>
</template>

<style scoped lang="less">
.org-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.org-panel__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.org-panel__title {
  font-size: 15px;
  font-weight: 600;
}

.org-panel__add {
  margin-left: auto;
  color: #5a6b85;
  cursor: pointer;
  display: inline-flex;
}

.org-panel__more {
  color: #5a6b85;
  cursor: pointer;
  display: inline-flex;
}

.org-panel__search {
  margin-bottom: 8px;
}

.org-panel__body {
  flex: 1;
  overflow: auto;
  min-height: 0;
  margin: 0 -6px;
  padding: 0 6px;
}
</style>
