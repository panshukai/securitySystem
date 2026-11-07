import dayjs from 'dayjs'
import { mockRequest } from './http'
import {
  state,
  eventStats,
  eventTrend,
  eventDonut,
  realtimeAlerts,
  orgTree,
  deviceOrgTree,
  personOrgTree,
  deviceStats,
  devices,
  plans,
  doorTree,
  persons,
  personTracks
} from '@/mock'

/* ---------------- 事件 ---------------- */
export function getEventStats() {
  return mockRequest(eventStats)
}

export function getEventTrend() {
  return mockRequest(eventTrend)
}

export function getEventTypeDistribution() {
  return mockRequest(eventDonut)
}

export function getRealtimeAlerts() {
  return mockRequest(realtimeAlerts)
}

export function getEventSummary() {
  return mockRequest({ alerts: realtimeAlerts, overview: { rate: 93.5, avgMinutes: 8, overdue: 4 } })
}

export function getEvents(params = {}) {
  const { type = '', level = '', orgName = '', keyword = '', status = '', page = 1, size = 10 } = params
  let rows = state.events
  if (type) rows = rows.filter((e) => e.type === type)
  if (level) rows = rows.filter((e) => e.level === level)
  if (orgName) rows = rows.filter((e) => e.orgName === orgName)
  if (status) rows = rows.filter((e) => e.status === status)
  if (keyword) rows = rows.filter((e) => e.desc.includes(keyword) || e.code.includes(keyword))
  const total = rows.length
  const list = rows.slice((page - 1) * size, page * size)
  return mockRequest({ list, total })
}

export function getEventDetail(id) {
  const row = state.events.find((e) => e.id === Number(id))
  return mockRequest(row || null)
}

export function dealEvent(id, { result = 'confirm', note = '' } = {}) {
  const row = state.events.find((e) => e.id === Number(id))
  if (row) {
    row.status = '已处置'
    row.handler = '管理员'
    row.dealResult = result
    row.dealNote = note
    row.dealTime = dayjs('2025-01-08 15:12:00').format('YYYY-MM-DD HH:mm')
  }
  return mockRequest(row || null)
}

export function getOrgOptions() {
  return mockRequest([
    { label: '全部组织', value: '' },
    { label: 'HZ001-杭州前置仓', value: 'HZ001-杭州前置仓' },
    { label: 'HZ002-宁波前置仓', value: 'HZ002-宁波前置仓' },
    { label: 'HZ003-嘉兴前置仓', value: 'HZ003-嘉兴前置仓' }
  ])
}

/* ---------------- 视频 ---------------- */
export function getChannelTree() {
  return mockRequest(orgTree[0])
}

/* ---------------- 设备 ---------------- */
export function getDeviceTree() {
  return mockRequest(deviceOrgTree[0])
}

export function getDeviceStats() {
  return mockRequest(deviceStats)
}

export function getDevices(params = {}) {
  const { type = '', orgName = '', keyword = '', page = 1, size = 10 } = params
  let rows = devices
  if (type) rows = rows.filter((d) => d.type === type)
  if (orgName) rows = rows.filter((d) => d.orgName === orgName)
  if (keyword) {
    const kw = keyword.trim()
    rows = rows.filter((d) => `${d.name}${d.ip}${d.model}${d.sn}`.includes(kw))
  }
  const total = rows.length
  const list = rows.slice((page - 1) * size, page * size)
  return mockRequest({ list, total })
}

export function getDeviceDetail(id) {
  return mockRequest(devices.find((d) => d.id === Number(id)) || devices[0])
}

/* ---------------- 门禁 ---------------- */
export function getPlans() {
  return mockRequest(plans)
}

export function getDoorTree() {
  return mockRequest(doorTree[0])
}

export function getPermissions(personNo = '') {
  const rows = personNo ? state.permissions.filter((p) => p.no === personNo) : state.permissions
  return mockRequest(rows)
}

export function getIssueRecords() {
  return mockRequest(state.records)
}

export function issuePermissions({ nos = [], doors = [], planName = '', validity = { type: 'long', from: '', to: '' } } = {}) {
  const validText = validity.type === 'long' ? null : `${validity.from} 至 ${validity.to}`
  const created = []
  for (const no of nos) {
    const person = persons.find((p) => p.no === no)
    for (const door of doors) {
      created.push({
        id: Date.now() + Math.random(),
        personId: no,
        name: person ? person.name : no,
        no,
        door,
        plan: planName,
        start: '2025-01-08 15:00',
        end: validity.type === 'long' ? null : validity.to,
        status: '已生效',
        validText
      })
    }
  }
  state.permissions.unshift(...created)
  const names = [...new Set(nos.map((no) => persons.find((p) => p.no === no)?.name).filter(Boolean))]
  const record = {
    id: Date.now(),
    time: dayjs('2025-01-08 15:12:00').format('YYYY-MM-DD HH:mm'),
    target: `${names.slice(0, 3).join('、')}${names.length > 3 ? ` 等 ${names.length} 人` : ''}`,
    doors: doors.length,
    result: '下发成功'
  }
  state.records.unshift(record)
  return mockRequest({ permissions: state.permissions, records: state.records, createdCount: created.length })
}

export function revokePermission(id) {
  const idx = state.permissions.findIndex((p) => String(p.id) === String(id))
  if (idx >= 0) state.permissions.splice(idx, 1)
  return mockRequest(state.permissions)
}

/* ---------------- 人员 ---------------- */
export function getPersonOrgTree() {
  return mockRequest(personOrgTree[0])
}

export function getPersons(params = {}) {
  const { orgName = '', keyword = '', status = '', page = 1, size = 10 } = params
  let rows = persons
  if (orgName) rows = rows.filter((p) => p.orgName === orgName)
  if (status) rows = rows.filter((p) => p.status === status)
  if (keyword) {
    const kw = keyword.trim()
    rows = rows.filter((p) => `${p.name}${p.no}${p.idCard}`.includes(kw))
  }
  const total = rows.length
  const list = rows.slice((page - 1) * size, page * size)
  return mockRequest({ list, total })
}

export function getPersonDetail(id) {
  const person = persons.find((p) => p.id === Number(id)) || persons[0]
  const permissions = state.permissions.filter((p) => p.no === person.no)
  return mockRequest({
    ...person,
    credentials: [
      { id: 1, type: '人脸凭证', value: person.faceCollected ? '已采集' : '未采集', status: person.faceCollected ? '已生效' : '待采集' },
      { id: 2, type: '门禁卡', value: `CARD-${person.no.slice(1)}`, status: '已生效' }
    ],
    permissions,
    tracks: personTracks
  })
}

export function getPersonPermissions(personNo) {
  return mockRequest(state.permissions.filter((p) => p.no === personNo))
}
