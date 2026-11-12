import { defineStore } from 'pinia'
import { getPersons, getPlans, getDoorTree, getPermissions, getIssueRecords, issuePermissions, revokePermission } from '@/api'

export const useAccessStore = defineStore('access', {
  state: () => ({
    step: 1,
    mode: 'person',
    persons: [],
    plans: [],
    doorTree: null,
    selectedNos: ['A10001', 'A10002', 'A10003'],
    planId: 'plan-1',
    doorIds: ['door-hz001-out', 'door-hz001-room'],
    validity: { type: 'long', from: '2025-01-01', to: '2025-12-31' },
    permissions: [],
    records: [],
    loading: false
  }),
  getters: {
    selectedPersons(state) {
      return state.persons.filter((p) => state.selectedNos.includes(p.no))
    },
    selectedPlan(state) {
      return state.plans.find((p) => p.id === state.planId) || null
    },
    selectedDoors(state) {
      if (!state.doorTree) return []
      const out = []
      const walk = (n) => {
        if (n.icon === 'door' && state.doorIds.includes(n.id)) out.push(n)
        if (n.children) n.children.forEach(walk)
      }
      walk(state.doorTree)
      return out
    },
    canNext(state) {
      if (state.step === 1) return state.selectedNos.length > 0
      if (state.step === 2) return !!state.planId
      if (state.step === 3) {
        if (!state.doorIds.length) return false
        if (state.validity.type === 'custom') {
          return !!state.validity.from && !!state.validity.to && state.validity.from <= state.validity.to
        }
        return true
      }
      return true
    }
  },
  actions: {
    async loadAll() {
      this.loading = true
      try {
        const [{ list }, plans, doors, permissions, records] = await Promise.all([
          getPersons({ orgName: 'HZ001-杭州前置仓', page: 1, size: 20 }),
          getPlans(),
          getDoorTree(),
          getPermissions(),
          getIssueRecords()
        ])
        this.persons = list
        this.plans = plans
        this.doorTree = doors
        this.permissions = permissions
        this.records = records
      } finally {
        this.loading = false
      }
    },
    togglePerson(no) {
      const idx = this.selectedNos.indexOf(no)
      if (idx >= 0) this.selectedNos.splice(idx, 1)
      else this.selectedNos.push(no)
    },
    toggleDoor(id, checked) {
      const idx = this.doorIds.indexOf(id)
      if (checked && idx < 0) this.doorIds.push(id)
      if (!checked && idx >= 0) this.doorIds.splice(idx, 1)
    },
    nextStep() {
      if (!this.canNext) return false
      if (this.step < 4) this.step += 1
      return true
    },
    prevStep() {
      if (this.step > 1) this.step -= 1
    },
    async issue() {
      if (!this.selectedNos.length) return { ok: false, code: 'noPerson' }
      if (!this.doorIds.length) return { ok: false, code: 'noDoor' }
      if (this.validity.type === 'custom' && this.validity.from > this.validity.to) {
        return { ok: false, code: 'date' }
      }
      const doors = this.selectedDoors.map((d) => d.name)
      const planName = this.selectedPlan?.name || ''
      const res = await issuePermissions({
        nos: this.selectedNos,
        doors,
        planName,
        validity: this.validity
      })
      this.permissions = res.permissions
      this.records = res.records
      this.step = 1
      return { ok: true, count: res.createdCount, doors: doors.length }
    },
    async revoke(id) {
      this.permissions = await revokePermission(id)
    }
  }
})
