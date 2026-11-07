<script setup>
import AppIcon from './AppIcon.vue'

defineOptions({ name: 'OrgTreeNode' })

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
  selectedKey: { type: [String, Number], default: '' },
  expanded: { type: Object, default: () => ({}) },
  checkable: { type: Boolean, default: false },
  checked: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['toggle', 'select', 'check'])

function isOpen() {
  return props.expanded[props.node.id] !== undefined ? props.expanded[props.node.id] : props.node.open !== false
}

function onRowClick() {
  if (props.node.children && props.node.children.length) emit('toggle', props.node)
  else emit('select', props.node)
}

function onCheck(e) {
  emit('check', { node: props.node, checked: e.target.checked })
}
</script>

<template>
  <div>
    <div
      class="dw-tree-row"
      :class="{ 'is-active': selectedKey === node.id }"
      :style="{ paddingLeft: `${depth * 16 + 8}px` }"
      @click="onRowClick"
    >
      <span v-if="node.children && node.children.length" class="caret" :class="{ 'is-open': isOpen() }">
        <AppIcon name="chevR" :size="12" />
      </span>
      <span v-else-if="!checkable" class="caret" />
      <input
        v-if="checkable && !(node.children && node.children.length)"
        type="checkbox"
        :checked="!!checked[node.id]"
        style="accent-color: #1a66ff; width: 14px; height: 14px"
        @click.stop
        @change="onCheck"
      />
      <AppIcon
        v-if="node.children && node.children.length"
        name="folder"
        :size="14"
        class="folder"
      />
      <AppIcon v-else :name="node.icon || 'cam'" :size="13" class="leaf-ico" />
      <span class="name">{{ node.name }}</span>
      <span v-if="node.count !== undefined" class="count">({{ node.count }})</span>
      <span v-if="node.tail" class="tail">{{ node.tail }}</span>
    </div>
    <div v-if="node.children && node.children.length && isOpen()">
      <OrgTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :selected-key="selectedKey"
        :expanded="expanded"
        :checkable="checkable"
        :checked="checked"
        @toggle="emit('toggle', $event)"
        @select="emit('select', $event)"
        @check="emit('check', $event)"
      />
    </div>
  </div>
</template>
