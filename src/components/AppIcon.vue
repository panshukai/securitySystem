<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, default: 'device' },
  size: { type: [Number, String], default: 16 }
})

const ICONS = {
  shield: '<path d="M12 2l8 3v6.2c0 5-3.4 8.6-8 10.8-4.6-2.2-8-5.8-8-10.8V5z" fill="currentColor" stroke="none"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/>',
  video: '<rect x="2" y="6" width="13" height="12" rx="2"/><path d="M15 10.5l7-3.5v10l-7-3.5z"/>',
  door: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><circle cx="15" cy="12" r="1.1" fill="currentColor" stroke="none"/>',
  device: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
  bell: '<path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2.2 2.2 0 0 0 4 0"/>',
  event: '<path d="M12 3l10 18H2z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.6" r=".9" fill="currentColor" stroke="none"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9L19 19M19 5l-2.1 2.1M7.1 16.9L5 19"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>',
  add: '<path d="M12 5v14M5 12h14"/>',
  export: '<path d="M12 14V3M7.5 7.5L12 3l4.5 4.5"/><path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>',
  play: '<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>',
  cam: '<rect x="2" y="7" width="13" height="10" rx="2"/><path d="M15 10.5l7-3.5v10l-7-3.5z"/>',
  nvr: '<rect x="3" y="8" width="18" height="8" rx="2"/><circle cx="17.3" cy="12" r="1" fill="currentColor" stroke="none"/><path d="M6 12h6"/>',
  net: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6.2 8-6.2s8 2.2 8 6.2"/>',
  org: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M6.5 10v4h11"/><path d="M17.5 14V6.5H10"/>',
  doc: '<path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5M9 12h8M9 16h8"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  chevD: '<path d="M6 9l6 6 6-6"/>',
  chevR: '<path d="M9 6l6 6-6 6"/>',
  full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  ptz: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
  snap: '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.4"/><path d="M8.5 7l1.8-3h3.4l1.8 3"/>',
  rec: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>',
  audio: '<path d="M4 10v4h4l5 5V5l-5 5z" fill="currentColor" stroke="none"/><path d="M16 9a4.5 4.5 0 0 1 0 6"/>',
  warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.2" r=".8" fill="currentColor" stroke="none"/>',
  more: '<circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
  folder: '<path d="M3 6h6l2 2.5h10V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
  grid: '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 3.5V9h-5.5"/>',
  link: '<path d="M9.5 14.5l5-5"/><path d="M8 17l-2.2 2.2a4 4 0 0 1-5.6 0" transform="translate(2.3 0)"/><path d="M11 8l2.2-2.2a4 4 0 0 1 5.6 5.6L16.5 13.7"/><path d="M13 16l-2.2 2.2a4 4 0 0 1-5.6-5.6L7.5 10.3"/>',
  flow: '<rect x="3" y="4" width="7" height="7" rx="1"/><rect x="14" y="13" width="7" height="7" rx="1"/><path d="M10 7.5h4v5.5h-3"/>',
  edit: '<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  key: '<circle cx="8" cy="14" r="4.5"/><path d="M11.5 10.5L20 2M16 6l3 3M13 9l2.5 2.5"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h5"/>',
  monitor: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  robot: '<rect x="5" y="8" width="14" height="11" rx="2"/><circle cx="9.5" cy="13" r="1.2" fill="currentColor" stroke="none"/><circle cx="14.5" cy="13" r="1.2" fill="currentColor" stroke="none"/><path d="M12 8V4M9 21v-2M15 21v-2"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1.1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.1" fill="currentColor" stroke="none"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  wrench: '<path d="M14.5 6.5a4.5 4.5 0 0 0-6 6L3 18l3 3 5.5-5.5a4.5 4.5 0 0 0 6-6L14 13l-3-3z"/>',
  log: '<path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
  reset: '<path d="M4 12a8 8 0 1 1 2.3 5.6"/><path d="M4 20.5V15h5.5"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  down: '<path d="M12 4v11M7 10.5l5 5 5-5"/><path d="M4 20h16"/>',
  updown: '<path d="M8 9l4-4 4 4M8 15l4 4 4-4"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
  idcard: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5 16c.5-1.6 1.6-2.4 3-2.4s2.5.8 3 2.4M14 9h5M14 13h5"/>',
  facescan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3"/><circle cx="9.5" cy="10" r="1"/><circle cx="14.5" cy="10" r="1"/><path d="M9 15c.8.8 1.8 1.2 3 1.2s2.2-.4 3-1.2"/>',
  building: '<path d="M4 21V4h10v17M14 9h6v12M7 7h4M7 11h4M7 15h4M17 12h1M17 16h1"/>'
}

const inner = computed(() => ICONS[props.name] || ICONS.device)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="inner"
  />
</template>

<style scoped lang="less">
svg {
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
