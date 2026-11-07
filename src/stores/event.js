import { defineStore } from 'pinia'
import {
  getEventStats,
  getEventTrend,
  getEventTypeDistribution,
  getEventSummary,
  getEvents,
  getEventDetail,
  dealEvent
} from '@/api'

export const useEventStore = defineStore('event', {
  state: () => ({
    stats: [],
    trend: { labels: [], data: [] },
    donut: [],
    alerts: [],
    overview: { rate: 0, avgMinutes: 0, overdue: 0 },
    filters: { type: '', level: '', orgName: '', range: 'last7' },
    list: [],
    total: 0,
    page: 1,
    size: 10,
    loading: false,
    detail: null,
    detailLoading: false,
    dealTarget: null
  }),
  actions: {
    async loadAll() {
      const [stats, trend, donut, summary] = await Promise.all([
        getEventStats(),
        getEventTrend(),
        getEventTypeDistribution(),
        getEventSummary()
      ])
      this.stats = stats
      this.trend = trend
      this.donut = donut
      this.alerts = summary.alerts
      this.overview = summary.overview
    },
    async loadList() {
      this.loading = true
      try {
        const { list, total } = await getEvents({
          ...this.filters,
          page: this.page,
          size: this.size
        })
        this.list = list
        this.total = total
      } finally {
        this.loading = false
      }
    },
    setFilter(key, value) {
      this.filters[key] = value
      this.page = 1
      this.loadList()
    },
    resetFilters() {
      this.filters = { type: '', level: '', orgName: '', range: 'last7' }
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
    async openDetail(id) {
      this.detailLoading = true
      this.detail = null
      try {
        this.detail = await getEventDetail(id)
      } finally {
        this.detailLoading = false
      }
    },
    async submitDeal(id, payload) {
      await dealEvent(id, payload)
      await this.loadList()
    }
  }
})
