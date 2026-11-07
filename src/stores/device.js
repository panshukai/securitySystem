import { defineStore } from 'pinia'
import { getDeviceTree, getDeviceStats, getDevices, getDeviceDetail } from '@/api'

export const useDeviceStore = defineStore('device', {
  state: () => ({
    tree: null,
    stats: [],
    typeTab: '',
    selectedOrg: '',
    keyword: '',
    page: 1,
    size: 10,
    list: [],
    total: 0,
    loading: false,
    currentId: null,
    current: null
  }),
  actions: {
    async loadTree() {
      this.tree = await getDeviceTree()
    },
    async loadStats() {
      this.stats = await getDeviceStats()
    },
    async loadList() {
      this.loading = true
      try {
        const { list, total } = await getDevices({
          type: this.typeTab,
          orgName: this.selectedOrg,
          keyword: this.keyword,
          page: this.page,
          size: this.size
        })
        this.list = list
        this.total = total
        if (!list.some((d) => d.id === this.currentId)) {
          this.currentId = list[0]?.id || null
        }
        if (this.currentId) this.current = await getDeviceDetail(this.currentId)
      } finally {
        this.loading = false
      }
    },
    setType(type) {
      this.typeTab = type
      this.page = 1
      this.loadList()
    },
    setOrg(orgName) {
      this.selectedOrg = this.selectedOrg === orgName ? '' : orgName
      this.page = 1
      this.loadList()
    },
    setKeyword(keyword) {
      this.keyword = keyword
      this.page = 1
      this.loadList()
    },
    async selectDevice(id) {
      this.currentId = id
      this.current = await getDeviceDetail(id)
    },
    changePage(page) {
      this.page = page
      this.loadList()
    },
    changeSize(size) {
      this.size = size
      this.page = 1
      this.loadList()
    }
  }
})
