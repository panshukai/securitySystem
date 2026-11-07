<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppIcon from '@/components/AppIcon.vue'
import { modules, moduleOfPath } from '@/menu/menu.config'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const app = useAppStore()

const current = () => moduleOfPath(route.path).key

function go(mod) {
  if (mod.path) router.push(mod.path)
}

function onBell() {
  ElMessage.success(`你有 ${app.unread} 条未读通知`)
}

function onUser() {
  ElMessage.info(`当前用户：${app.user.name}（${app.user.role}）`)
}
</script>

<template>
  <header class="topbar">
    <div class="topbar__logo" @click="router.push('/event/center')">
      <span class="topbar__mark"><AppIcon name="shield" :size="20" /></span>
      <span class="topbar__name">鼎位安防综合管理平台</span>
    </div>
    <nav class="topbar__nav">
      <div
        v-for="mod in modules"
        :key="mod.key"
        class="topbar__item"
        :class="{ 'is-active': current() === mod.key }"
        @click="go(mod)"
      >
        <AppIcon :name="mod.icon" :size="17" />
        <span>{{ mod.title }}</span>
      </div>
    </nav>
    <div class="topbar__right">
      <span class="topbar__icon" @click="onBell">
        <AppIcon name="bell" :size="19" />
        <span v-if="app.unread" class="topbar__badge">{{ app.unread }}</span>
      </span>
      <span class="topbar__icon" @click="ElMessage.info('帮助中心：演示环境')">
        <AppIcon name="warn" :size="18" />
      </span>
      <span class="topbar__user" @click="onUser">
        <span class="topbar__avatar"><AppIcon name="user" :size="15" /></span>
        <span>{{ app.user.name }}</span>
        <AppIcon name="chevD" :size="13" />
      </span>
    </div>
  </header>
</template>

<style scoped lang="less">
.topbar {
  height: var(--dw-topbar-h);
  display: flex;
  align-items: center;
  background: var(--dw-topbar-grad);
  color: #fff;
  padding: 0 18px;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 2px 8px rgba(10, 30, 60, 0.25);
  flex-shrink: 0;
}

.topbar__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-right: 28px;
  white-space: nowrap;
  cursor: pointer;
}

.topbar__mark {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: linear-gradient(135deg, #2f7bff, #1653d6);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 2px 8px rgba(26, 102, 255, 0.45);
}

.topbar__name {
  font-size: 17px;
}

.topbar__nav {
  display: flex;
  height: 100%;
  flex: 1;
}

.topbar__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 22px;
  cursor: pointer;
  color: #c2d2ea;
  font-size: 15px;
  user-select: none;
  white-space: nowrap;
}

.topbar__item:hover {
  color: #fff;
}

.topbar__item.is-active {
  background: #fff;
  color: var(--dw-primary);
  font-weight: 600;
  border-radius: 8px 8px 0 0;
}

.topbar__item.is-active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  border: 7px solid transparent;
  border-bottom-color: var(--dw-bg);
}

.topbar__right {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #c2d2ea;
}

.topbar__icon {
  position: relative;
  display: inline-flex;
  cursor: pointer;
}

.topbar__icon:hover {
  color: #fff;
}

.topbar__badge {
  position: absolute;
  top: -7px;
  right: -9px;
  background: #f5484a;
  color: #fff;
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.topbar__user {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
}

.topbar__avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
