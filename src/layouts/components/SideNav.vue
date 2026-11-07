<script setup>
import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { moduleOfPath } from '@/menu/menu.config'

const route = useRoute()
const router = useRouter()

const mod = computed(() => moduleOfPath(route.path))
const openMap = reactive({})

function isActive(path) {
  return route.path === path
}

function hasActive(item) {
  if (!item.children) return false
  return item.children.some((c) => c.path && route.path === c.path)
}

function initOpen() {
  for (const item of mod.value.menu) {
    if (item.children && openMap[item.title] === undefined) {
      openMap[item.title] = !!item.open || hasActive(item)
    }
  }
}

watch(
  () => [route.path, mod.value.key],
  () => {
    initOpen()
    const item = mod.value.menu.find((m) => hasActive(m))
    if (item) openMap[item.title] = true
  },
  { immediate: true }
)

function toggle(item) {
  openMap[item.title] = !openMap[item.title]
}

function go(path) {
  if (path && route.path !== path) router.push(path)
}
</script>

<template>
  <aside class="sidebar">
    <template v-for="item in mod.menu" :key="item.title">
      <div
        v-if="!item.children"
        class="sidebar__item"
        :class="{ 'is-active': isActive(item.path) }"
        @click="go(item.path)"
      >
        <AppIcon :name="item.icon || 'doc'" :size="16" />
        <span>{{ item.title }}</span>
      </div>
      <template v-else>
        <div class="sidebar__item sidebar__group" @click="toggle(item)">
          <AppIcon :name="item.icon || 'folder'" :size="16" />
          <span>{{ item.title }}</span>
          <span v-if="item.badge" class="sidebar__dot" />
          <span class="sidebar__caret" :class="{ 'is-open': openMap[item.title] }">
            <AppIcon name="chevD" :size="13" />
          </span>
        </div>
        <div v-show="openMap[item.title]" class="sidebar__children">
          <div
            v-for="child in item.children"
            :key="child.path"
            class="sidebar__child"
            :class="{ 'is-active': isActive(child.path) }"
            @click="go(child.path)"
          >
            {{ child.title }}
          </div>
        </div>
      </template>
    </template>
  </aside>
</template>

<style scoped lang="less">
.sidebar {
  width: var(--dw-side-w);
  flex-shrink: 0;
  background: var(--dw-sidebar-grad);
  color: #c2d2ea;
  overflow-y: auto;
  padding: 10px 8px;
}

.sidebar__item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 12px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  user-select: none;
  margin-bottom: 2px;
}

.sidebar__item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}

.sidebar__item.is-active {
  background: var(--dw-primary);
  color: #fff;
  font-weight: 500;
}

.sidebar__group {
  color: #c2d2ea;
}

.sidebar__caret {
  margin-left: auto;
  display: inline-flex;
  color: #8fa6c8;
  transition: transform 0.18s;
}

.sidebar__caret.is-open {
  transform: rotate(180deg);
}

.sidebar__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f5484a;
  margin-left: 2px;
}

.sidebar__children {
  margin-bottom: 4px;
}

.sidebar__child {
  display: flex;
  align-items: center;
  height: 36px;
  margin: 2px 0 2px 10px;
  padding: 0 12px 0 38px;
  border-radius: 6px;
  font-size: 13px;
  color: #b6c8e2;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
}

.sidebar__child:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}

.sidebar__child.is-active {
  background: var(--dw-primary);
  color: #fff;
  font-weight: 500;
}
</style>
