import dayjs from 'dayjs'

/* ================= 组织 ================= */
const REGION_DEFS = [
  { id: 'east', name: '华东区域', count: 18, warehouses: [
    { id: 'hz001', code: 'HZ001', name: '杭州前置仓', personCount: 12 },
    { id: 'hz002', code: 'HZ002', name: '宁波前置仓', personCount: 10 },
    { id: 'hz003', code: 'HZ003', name: '嘉兴前置仓', personCount: 8 }
  ] },
  { id: 'south', name: '华南区域', count: 12, warehouses: [], icon: 'folder' },
  { id: 'west', name: '华西区域', count: 10, warehouses: [], icon: 'folder' },
  { id: 'north', name: '华北区域', count: 8, warehouses: [], icon: 'folder' },
  { id: 'central', name: '华中区域', count: 6, warehouses: [], icon: 'folder' }
]

const CHANNEL_SUFFIXES = ['仓库出入口', '自营资产区', '合作方区', '验收充电区', '异常资产区']

export const orgTree = [
  {
    id: 'root',
    name: '总部',
    count: 54,
    open: true,
    children: REGION_DEFS.map((r) => ({
      id: `region-${r.id}`,
      name: r.name,
      count: r.count,
      open: r.id === 'east',
      icon: r.icon,
      children: r.warehouses.map((w) => ({
        id: `wh-${w.id}`,
        name: `${w.code}-${w.name}`,
        open: w.code === 'HZ001',
        icon: 'folder',
        children: CHANNEL_SUFFIXES.map((s, i) => ({
          id: `ch-${w.id}-${i + 1}`,
          name: `${w.code}-${s}`,
          icon: 'cam',
          channel: true
        }))
      }))
    }))
  }
]

export const personOrgTree = [
  {
    id: 'p-root',
    name: '总部',
    count: 54,
    open: true,
    children: [
      {
        id: 'p-east',
        name: '华东区域',
        count: 18,
        open: true,
        children: [
          { id: 'p-hz001', name: 'HZ001-杭州前置仓', count: 12, open: false, icon: 'building' },
          { id: 'p-hz002', name: 'HZ002-宁波前置仓', count: 10, open: false, icon: 'building' },
          { id: 'p-hz003', name: 'HZ003-嘉兴前置仓', count: 8, open: false, icon: 'building' }
        ]
      },
      { id: 'p-south', name: '华南区域', count: 12, open: false, icon: 'folder' },
      { id: 'p-west', name: '华西区域', count: 10, open: false, icon: 'folder' },
      { id: 'p-north', name: '华北区域', count: 8, open: false, icon: 'folder' },
      { id: 'p-central', name: '华中区域', count: 6, open: false, icon: 'folder' }
    ]
  }
]

export const deviceOrgTree = [
  {
    id: 'd-root',
    name: '总部',
    count: 54,
    open: true,
    children: [
      {
        id: 'd-east',
        name: '华东区域',
        count: 18,
        open: true,
        children: [
          { id: 'd-hz001', name: 'HZ001-杭州前置仓', open: false, icon: 'building' },
          { id: 'd-hz002', name: 'HZ002-宁波前置仓', open: false, icon: 'building' },
          { id: 'd-hz003', name: 'HZ003-嘉兴前置仓', open: false, icon: 'building' }
        ]
      },
      { id: 'd-south', name: '华南区域', count: 12, open: false, icon: 'folder' },
      { id: 'd-west', name: '华西区域', count: 10, open: false, icon: 'folder' },
      { id: 'd-north', name: '华北区域', count: 8, open: false, icon: 'folder' },
      { id: 'd-central', name: '华中区域', count: 6, open: false, icon: 'folder' }
    ]
  }
]

/* ================= 事件 ================= */
export const eventStats = [
  { key: 'total', label: '事件总数', icon: 'event', tone: 'blue', value: '1,286', delta: '+4.7%', dir: 'up' },
  { key: 'pending', label: '待处置', icon: 'clock', tone: 'orange', value: '64', delta: '+12.3%', dir: 'up' },
  { key: 'processing', label: '处置中', icon: 'refresh', tone: 'cyan', value: '26', delta: '-7.1%', dir: 'down' },
  { key: 'done', label: '已处置', icon: 'check', tone: 'green', value: '1,196', delta: '-3.9%', dir: 'down' },
  { key: 'major', label: '重大事件', icon: 'warn', tone: 'red', value: '6', delta: '+50.0%', dir: 'up' }
]

export const eventTrend = {
  labels: ['01-02', '01-03', '01-04', '01-05', '01-06', '01-07', '01-08'],
  data: [80, 112, 132, 122, 205, 150, 162]
}

export const eventDonut = [
  { name: '门禁事件', percent: 41.6, color: '#1a66ff' },
  { name: '视频告警', percent: 24.9, color: '#2eb872' },
  { name: '设备异常', percent: 14.7, color: '#f5a623' },
  { name: '人员事件', percent: 10.2, color: '#8b72f0' },
  { name: '其他事件', percent: 8.6, color: '#c3ccda' }
]

export const realtimeAlerts = [
  { id: 1, name: '仓库区域人员闯入', location: 'HZ001-仓库出入口', time: '2分钟前', level: '高', tone: 1 },
  { id: 2, name: '门禁多次验证失败', location: 'HZ002-员工通道', time: '5分钟前', level: '中', tone: 2 },
  { id: 3, name: '摄像机离线', location: 'HZ003-装配区', time: '8分钟前', level: '低', tone: 3 }
]

const EVENT_TYPES = ['门禁事件', '视频告警', '设备异常', '门禁事件', '视频告警', '人员事件', '设备异常', '其他事件', '门禁事件', '视频告警', '门禁事件', '人员事件']
const EVENT_LEVELS = ['高', '中', '中', '低', '低', '中']
const DESCRIPTIONS = {
  门禁事件: ['仓库区域人员闯入报警', '多次验证失败（5次）', '非授权时段开门', '门禁长时间未关闭', '胁迫密码开门'],
  视频告警: ['装配区域移动侦测报警', '仓库通道遮挡报警', '消防通道滞留检测', '充电区烟火识别报警', '镜头偏离检测'],
  设备异常: ['门禁控制器离线', '摄像机离线', 'NVR 硬盘 SMART 异常', '网络交换机端口异常', '设备心跳超时'],
  人员事件: ['陌生人员人脸识别', '访客超出授权区域', '黑名单人员出现', '人脸比对不通过'],
  其他事件: ['系统磁盘使用率过高', 'UPS 市电中断', '门磁状态异常', '温湿度超限']
}

const HANDLERS = ['张三', '李四', '王五', '赵六', '孙七']
const ORGS = ['HZ001-杭州前置仓', 'HZ002-宁波前置仓', 'HZ003-嘉兴前置仓']

const FIRST_EVENTS = [
  { t: '2025-01-08 14:26', type: '门禁事件', level: '高', desc: '仓库区域人员闯入报警', org: 'HZ001-杭州前置仓', status: '待处置', by: '-' },
  { t: '2025-01-08 14:21', type: '视频告警', level: '中', desc: '装配区域移动侦测报警', org: 'HZ001-杭州前置仓', status: '已处置', by: '张三' },
  { t: '2025-01-08 14:15', type: '设备异常', level: '中', desc: '门禁控制器离线', org: 'HZ002-宁波前置仓', status: '已处置', by: '李四' },
  { t: '2025-01-08 13:58', type: '门禁事件', level: '中', desc: '多次验证失败（5次）', org: 'HZ001-杭州前置仓', status: '处置中', by: '王五' },
  { t: '2025-01-08 13:42', type: '视频告警', level: '低', desc: '仓库通道遮挡报警', org: 'HZ003-嘉兴前置仓', status: '已处置', by: '李四' },
  { t: '2025-01-08 13:36', type: '人员事件', level: '低', desc: '陌生人员人脸识别', org: 'HZ001-杭州前置仓', status: '已处置', by: '张三' },
  { t: '2025-01-08 13:20', type: '设备异常', level: '低', desc: '摄像机离线', org: 'HZ003-嘉兴前置仓', status: '已处置', by: '孙七' },
  { t: '2025-01-08 13:05', type: '其他事件', level: '低', desc: '系统磁盘使用率过高', org: 'HZ001-杭州前置仓', status: '已处置', by: '赵六' }
]

function buildEvents() {
  const base = dayjs('2025-01-08 14:26:00')
  const list = FIRST_EVENTS.map((e, i) => ({
    id: i + 1,
    code: `EV-2025${100001 + i}`,
    time: e.t,
    type: e.type,
    level: e.level,
    desc: e.desc,
    orgName: e.org,
    status: e.status,
    handler: e.by
  }))

  for (let i = FIRST_EVENTS.length; i < 1286; i += 1) {
    const type = EVENT_TYPES[i % EVENT_TYPES.length]
    const descList = DESCRIPTIONS[type]
    const status = i % 19 === 0 ? '待处置' : i % 41 === 0 ? '处置中' : '已处置'
    const time = base.subtract(81 + (i - 7) * 9 + (i % 7), 'minute').format('YYYY-MM-DD HH:mm')
    list.push({
      id: i + 1,
      code: `EV-2025${100001 + i}`,
      time,
      type,
      level: EVENT_LEVELS[i % EVENT_LEVELS.length],
      desc: descList[i % descList.length],
      orgName: ORGS[i % ORGS.length],
      status,
      handler: status === '待处置' ? '-' : HANDLERS[i % HANDLERS.length]
    })
  }
  return list
}

export const events = buildEvents()

/* ================= 视频通道 ================= */
export const channels = orgTree[0].children.flatMap((region) =>
  (region.children || []).flatMap((wh) => (wh.children || []).filter((c) => c.channel))
)

/* ================= 设备 ================= */
export const deviceStats = [
  { key: 'video', label: '视频设备', icon: 'cam', tone: 'blue', value: '270', online: 265, offline: 5 },
  { key: 'door', label: '门禁设备', icon: 'door', tone: 'green', value: '54', online: 54, offline: 0 },
  { key: 'nvr', label: '存储设备 (NVR)', icon: 'nvr', tone: 'cyan', value: '54', online: 54, offline: 0 },
  { key: 'network', label: '网络设备', icon: 'net', tone: 'orange', value: '54', online: 52, offline: 2 }
]

export const devices = [
  { id: 1, name: 'HZ001-仓库出入口', type: '网络摄像机', orgName: 'HZ001-杭州前置仓', ip: '192.168.1.101', status: '在线', model: 'DS-2CD2240T', sn: 'K1234567890', firmware: 'V5.7.3_240925', location: '仓库出入口（东侧）', installedAt: '2025-01-05 10:24:36', channel: 'HZ001-仓库出入口' },
  { id: 2, name: 'HZ001-自营资产区', type: '网络摄像机', orgName: 'HZ001-杭州前置仓', ip: '192.168.1.102', status: '在线', model: 'DS-2CD2240T', sn: 'K1234567891', firmware: 'V5.7.3_240925', location: '自营资产区（南侧）', installedAt: '2025-01-05 10:24:40', channel: 'HZ001-自营资产区' },
  { id: 3, name: 'HZ001-合作方区', type: '网络摄像机', orgName: 'HZ001-杭州前置仓', ip: '192.168.1.103', status: '在线', model: 'DS-2CD2240T', sn: 'K1234567892', firmware: 'V5.7.3_240925', location: '合作方区（西侧）', installedAt: '2025-01-05 10:24:44', channel: 'HZ001-合作方区' },
  { id: 4, name: 'HZ001-验收充电区', type: '网络摄像机', orgName: 'HZ001-杭州前置仓', ip: '192.168.1.104', status: '在线', model: 'DS-2CD2240T', sn: 'K1234567893', firmware: 'V5.7.3_240925', location: '验收充电区（北侧）', installedAt: '2025-01-05 10:24:48', channel: 'HZ001-验收充电区' },
  { id: 5, name: 'HZ001-异常资产区', type: '网络摄像机', orgName: 'HZ001-杭州前置仓', ip: '192.168.1.105', status: '在线', model: 'DS-2CD2240T', sn: 'K1234567894', firmware: 'V5.7.3_240925', location: '异常资产区（围栏）', installedAt: '2025-01-05 10:24:52', channel: 'HZ001-异常资产区' },
  { id: 6, name: 'HZ001-仓库门禁', type: '门禁一体机', orgName: 'HZ001-杭州前置仓', ip: '192.168.1.200', status: '在线', model: 'DS-K1T670M', sn: 'D9876543210', firmware: 'V2.2.6_240815', location: '仓库出入口门卫', installedAt: '2025-01-05 09:12:03' },
  { id: 7, name: 'HZ001-NVR', type: '存储NVR', orgName: 'HZ001-杭州前置仓', ip: '192.168.1.150', status: '在线', model: 'DS-7808N-G1/8P', sn: 'N5555444433', firmware: 'V4.62.005_240820', location: '机房机柜A3', installedAt: '2025-01-05 09:10:11' }
]

/* ================= 门禁 ================= */
export const plans = [
  { id: 'plan-1', name: '常规工作人员计划', desc: '工作日 08:00-20:00' },
  { id: 'plan-2', name: '仓点管理员计划', desc: '每日 07:00-22:00' },
  { id: 'plan-3', name: '临时入仓计划', desc: '指定日期和时间段' },
  { id: 'plan-4', name: '合作伙伴计划', desc: '按合作方作业要求设定' }
]

export const doorTree = [
  {
    id: 'door-root',
    name: '总部',
    count: '54',
    open: true,
    children: [
      {
        id: 'door-east',
        name: '华东区域',
        count: '18',
        open: true,
        children: [
          {
            id: 'door-hz001',
            name: 'HZ001-杭州前置仓',
            count: '2/2',
            open: true,
            children: [
              { id: 'door-hz001-out', name: 'HZ001-仓库出入口', icon: 'door' },
              { id: 'door-hz001-room', name: 'HZ001-设备间门', icon: 'door' }
            ]
          },
          {
            id: 'door-hz002',
            name: 'HZ002-宁波前置仓',
            count: '0/1',
            open: false,
            children: [{ id: 'door-hz002-pass', name: 'HZ002-员工通道', icon: 'door' }]
          },
          {
            id: 'door-hz003',
            name: 'HZ003-嘉兴前置仓',
            count: '0/1',
            open: false,
            children: [{ id: 'door-hz003-in', name: 'HZ003-收货区门', icon: 'door' }]
          }
        ]
      },
      { id: 'door-south', name: '华南区域', count: '12', open: false, icon: 'folder' },
      { id: 'door-north', name: '华北区域', count: '8', open: false, icon: 'folder' }
    ]
  }
]

export const initialPermissions = [
  { id: 1, personId: 'A10001', name: '张三', no: 'A10001', door: 'HZ001-仓库出入口', plan: '常规工作人员计划', start: '2025-01-01 00:00', end: null, status: '已生效' },
  { id: 2, personId: 'A10001', name: '张三', no: 'A10001', door: 'HZ001-设备间门', plan: '常规工作人员计划', start: '2025-01-01 00:00', end: null, status: '已生效' },
  { id: 3, personId: 'A10002', name: '李四', no: 'A10002', door: 'HZ001-仓库出入口', plan: '常规工作人员计划', start: '2025-01-01 00:00', end: null, status: '已生效' },
  { id: 4, personId: 'A10003', name: '王五', no: 'A10003', door: 'HZ001-设备间门', plan: '仓点管理员计划', start: '2025-01-01 00:00', end: null, status: '已生效' }
]

export const issueRecords = [
  { id: 1, time: '2025-01-08 14:26', target: '张三等 3 人', doors: 2, result: '下发成功' },
  { id: 2, time: '2025-01-07 09:41', target: '合作方人员组', doors: 4, result: '下发成功' },
  { id: 3, time: '2025-01-06 16:20', target: 'HZ002-仓点人员组', doors: 1, result: '下发成功' }
]

/* ================= 人员 ================= */
const PERSON_DEFS = [
  { name: '张三', post: '仓点管理员', status: '在职', idCard: '330101199005201234', phone: '138****6688' },
  { name: '李四', post: '运营人员', status: '在职', idCard: '330101199103158765', phone: '137****2210' },
  { name: '王五', post: '设备巡检', status: '在职', idCard: '330101199207201998', phone: '139****3456' },
  { name: '赵六', post: '运营人员', status: '在职', idCard: '330101199308080321', phone: '136****7788' },
  { name: '孙七', post: '合作方人员', status: '临时', idCard: '330101198811229876', phone: '135****9900' },
  { name: '钱八', post: '安全员', status: '在职', idCard: '330101199409091122', phone: '138****1122' },
  { name: '周九', post: '运营人员', status: '在职', idCard: '330101199510103344', phone: '137****3344' },
  { name: '吴十', post: '设备巡检', status: '在职', idCard: '330101199611115566', phone: '139****5566' },
  { name: '郑一', post: '合作方人员', status: '临时', idCard: '330101199712127788', phone: '136****7789' },
  { name: '冯二', post: '运营人员', status: '在职', idCard: '330101199801019900', phone: '135****9901' },
  { name: '陈三', post: '安全员', status: '在职', idCard: '330101199902021234', phone: '138****1234' },
  { name: '褚四', post: '运营人员', status: '停用', idCard: '330101200003034567', phone: '137****4567' }
]

function buildPersons() {
  const out = []
  let seq = 1
  const whConfig = [
    { org: 'HZ001-杭州前置仓', count: 12 },
    { org: 'HZ002-宁波前置仓', count: 10 },
    { org: 'HZ003-嘉兴前置仓', count: 8 }
  ]
  for (const wh of whConfig) {
    for (let i = 0; i < wh.count; i += 1) {
      const def = PERSON_DEFS[(seq - 1) % PERSON_DEFS.length]
      out.push({
        id: seq,
        no: `A100${String(seq).padStart(2, '0')}`,
        name: def.name,
        orgName: wh.org,
        post: def.post,
        status: def.status,
        idCard: def.idCard,
        phone: def.phone,
        faceCollected: seq % 5 !== 0
      })
      seq += 1
    }
  }
  return out
}

export const persons = buildPersons()

export const personTracks = [
  { time: '2025-01-08 14:02:11', door: 'HZ001-仓库出入口', action: '人脸验证通过', result: '通行' },
  { time: '2025-01-08 13:41:26', door: 'HZ001-设备间门', action: '人脸验证通过', result: '通行' },
  { time: '2025-01-08 09:12:03', door: 'HZ001-仓库出入口', action: '人脸验证通过', result: '通行' },
  { time: '2025-01-07 18:22:45', door: 'HZ001-仓库出入口', action: '人脸验证通过', result: '通行' }
]

/* ================= 可变状态 ================= */
export const state = {
  events,
  permissions: [...initialPermissions],
  records: [...issueRecords]
}
