<script setup>
import TopBar from './components/TopBar.vue'
import SideNav from './components/SideNav.vue'
</script>

<template>
  <div class="app-shell">
    <TopBar />
    <div class="app-body">
      <SideNav />
      <main class="app-content">
        <div class="app-canvas">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped lang="less">
.app-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.app-content {
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: 14px;
}

.app-canvas {
  background: #fff;
  border-radius: 12px;
  padding: 16px 18px 18px;
  min-height: 100%;
  box-shadow: 0 1px 4px rgba(20, 40, 80, 0.05);
}
</style>
