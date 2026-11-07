import { defineStore } from 'pinia'
import { getPersonOrgTree, getPersons, getPersonDetail } from '@/api'

const ORG_NAME_BY_ID = {
  'p-hz001': 'HZ001-杭州前置仓',
  'p-hz002': 'HZ002-宁波前置仓',
  'p-hz003': 'HZ003-嘉兴前置仓'
}

export const usePersonStore = defineStore('person', {
  state: () => ({
    orgTree: null,
    selectedOrgId: 'p-hz001',
    selectedOrgName: 'HZ001-杭州前置仓',
    keyword: '',
    status: '',
    page: 1,
    size: 5,
    list: [],
    total: 0,
    loading: false,
    currentId: 1,
    detail: null,
    detailLoading: false,
    detailTab: 'perm'
  }),
  actions: {
    async loadOrgs() {
      this.orgTree = await getPersonOrgTree()
    },
    async loadList() {
      this.loading = true
      try {
        const { list, total } = await getPersons({
          orgName: this.selectedOrgName,
          keyword: this.keyword,
          status: this.status,
          page: this.page,
          size: this.size
        })
        this.list = list
        this.total = total
        if (!list.some((p) => p.id === this.currentId)) {
          this.currentId = list[0]?.id ?? null
        }
        if (this.currentId) await this.loadDetail(this.currentId)
        else this.detail = null
      } finally {
        this.loading = false
      }
    },
    selectOrg(node) {
      if (!ORG_NAME_BY_ID[node.id]) return
      this.selectedOrgId = node.id
      this.selectedOrgName = ORG_NAME_BY_ID[node.id]
      this.page = 1
      this.loadList()
    },
    setKeyword(keyword) {
      this.keyword = keyword
      this.page = 1
      this.loadList()
    },
    setStatus(status) {
      this.status = status
      this.page = 1
      this.loadList()
    },
    changePage(page) {
      this.page = page
      this.loadList()
    },
    changeSize(size) {
      this.size = size
      this.page = 1
      this.loadList()
    },
    async loadDetail(id) {
      this.detailLoading = true
      try {
        this.detail = await getPersonDetail(id)
      } finally {
        this.detailLoading = false
      }
    },
    async selectPerson(id) {
      this.currentId = id
      this.detailTab = 'perm'
      await this.loadDetail(id)
    }
  }
})
