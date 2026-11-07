import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    user: { name: '总部管理员', role: '超级管理员', org: '总部' },
    unread: 12,
    sidebarCollapsed: false
  }),
  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    }
  }
})
