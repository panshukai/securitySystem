import { defineStore } from 'pinia'
import { getChannelTree } from '@/api'

function emptyPanes() {
  return Array.from({ length: 16 }, () => null)
}

export const useVideoStore = defineStore('video', {
  state: () => ({
    root: null,
    loading: false,
    split: 4,
    mode: 'multi',
    active: 0,
    panes: emptyPanes()
  }),
  getters: {
    allChannels(state) {
      if (!state.root) return []
      const out = []
      const walk = (node) => {
        if (node.channel) out.push(node)
        if (node.children) node.children.forEach(walk)
      }
      walk(state.root)
      return out
    },
    visibleCount(state) {
      return state.mode === 'single' ? 1 : state.split
    }
  },
  actions: {
    async loadTree() {
      this.loading = true
      try {
        this.root = await getChannelTree()
        if (!this.panes.some(Boolean)) {
          const first = this.allChannels.slice(0, 4)
          first.forEach((ch, i) => {
            this.panes[i] = { id: ch.id, name: ch.name }
          })
        }
      } finally {
        this.loading = false
      }
    },
    loadChannelToActive(channel) {
      this.panes[this.active] = { id: channel.id, name: channel.name }
    },
    loadByName(name) {
      const channel = this.allChannels.find((c) => c.name === name)
      if (!channel) return false
      this.panes[this.active] = { id: channel.id, name: channel.name }
      return true
    },
    setSplit(split) {
      this.split = split
      if (this.active >= split) this.active = 0
    },
    setMode(mode) {
      this.mode = mode
      if (mode === 'single' && this.active > 0) this.active = 0
    },
    setActive(index) {
      this.active = index
    }
  }
})
