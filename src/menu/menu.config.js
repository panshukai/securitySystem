export const modules = [
  {
    key: 'video',
    title: '视频监控',
    icon: 'video',
    path: '/video/live',
    menu: [
      { title: '首页', icon: 'home', path: '/video/home' },
      { title: '实时预览', icon: 'play', path: '/video/live', implemented: true },
      { title: '录像回放', icon: 'rec', path: '/video/playback' },
      { title: '录像检索', icon: 'search', path: '/video/search' },
      { title: '视频上墙', icon: 'monitor', path: '/video/wall' },
      { title: '视频巡检', icon: 'layers', path: '/video/patrol' },
      {
        title: '视频配置',
        labelKey: 'menu.video.configGroup',
        icon: 'gear',
        children: [
          { title: '视频参数配置', path: '/video/config/param' },
          { title: '录像存储配置', path: '/video/config/storage' }
        ]
      }
    ]
  },
  {
    key: 'access',
    title: '一卡通门禁',
    icon: 'card',
    path: '/access/person',
    menu: [
      { title: '首页', icon: 'home', path: '/access/home' },
      {
        title: '组织与人员',
        labelKey: 'menu.access.orgGroup',
        icon: 'org',
        open: true,
        children: [
          { title: '组织架构管理', path: '/access/org' },
          { title: '人员信息管理', path: '/access/person', implemented: true },
          { title: '人员分组管理', path: '/access/person-group' },
          { title: '身份凭证管理', path: '/access/credential' },
          { title: '人员批量导入', path: '/access/person-import' },
          { title: '人员变更记录', path: '/access/person-log' }
        ]
      },
      {
        title: '门禁管理',
        labelKey: 'menu.access.doorGroup',
        icon: 'door',
        open: true,
        children: [
          { title: '门禁资源管理', path: '/access/door' },
          { title: '通行计划模板', path: '/access/plan' },
          { title: '门禁权限配置', path: '/access/perm', implemented: true },
          { title: '权限下发与查询', path: '/access/issue' },
          { title: '通行记录', path: '/access/record' },
          { title: '门禁事件查询', path: '/access/event' },
          { title: '门禁控制与参数配置', path: '/access/control' }
        ]
      }
    ]
  },
  {
    key: 'device',
    title: '设备管理',
    icon: 'device',
    path: '/device/overview',
    menu: [
      { title: '首页', icon: 'home', path: '/device/home' },
      {
        title: '设备管理',
        labelKey: 'menu.device.deviceGroup',
        icon: 'device',
        open: true,
        children: [
          { title: '设备总览', path: '/device/overview', implemented: true },
          { title: '设备列表', path: '/device/list' },
          { title: '设备分组', path: '/device/group' },
          { title: '设备巡检', path: '/device/patrol' },
          { title: '设备维护', path: '/device/maintain' },
          { title: '在线状态', path: '/device/status' },
          { title: '设备日志', path: '/device/log' }
        ]
      },
      { title: '视频设备管理', icon: 'cam', path: '/device/video' },
      { title: '门禁设备管理', icon: 'door', path: '/device/door' },
      { title: '网络设备管理', icon: 'net', path: '/device/network' },
      { title: '存储设备管理', icon: 'nvr', path: '/device/storage' },
      { title: '设备配置', icon: 'gear', path: '/device/config' }
    ]
  },
  {
    key: 'event',
    title: '事件中心',
    icon: 'bell',
    path: '/event/center',
    menu: [
      {
        title: '告警管理',
        labelKey: 'menu.event.alarmGroup',
        icon: 'bell',
        open: true,
        badge: true,
        children: [
          { title: '实时告警', path: '/event/alarm', implemented: true },
          { title: '告警规则', path: '/event/alarm-rule' }
        ]
      },
      { title: '事件查询', icon: 'search', path: '/event/query' },
      { title: '事件联动', icon: 'link', path: '/event/linkage' },
      {
        title: '处置流程',
        labelKey: 'menu.event.flowGroup',
        icon: 'flow',
        children: [
          { title: '流程配置', path: '/event/flow' },
          { title: '处置记录', path: '/event/flow-log' }
        ]
      },
      { title: '工单管理', icon: 'doc', path: '/event/ticket' },
      { title: '统计分析', icon: 'monitor', path: '/event/stats' },
      { title: '事件配置', icon: 'gear', path: '/event/config' }
    ]
  },
  {
    key: 'system',
    title: '系统管理',
    icon: 'gear',
    path: '/system/user',
    menu: [
      {
        title: '系统管理',
        labelKey: 'menu.system.systemGroup',
        icon: 'gear',
        open: true,
        children: [
          { title: '用户管理', path: '/system/user' },
          { title: '角色管理', path: '/system/role' },
          { title: '菜单管理', path: '/system/menu' },
          { title: '部门管理', path: '/system/dept' },
          { title: '字典管理', path: '/system/dict' },
          { title: '参数设置', path: '/system/param' },
          { title: '日志管理', path: '/system/log' }
        ]
      }
    ]
  }
]

export function flattenMenu(menu, groupKey) {
  const out = []
  for (const item of menu) {
    if (item.children && item.children.length) {
      out.push(...flattenMenu(item.children, groupKey))
    } else if (item.path) {
      out.push({ ...item, group: groupKey })
    }
  }
  return out
}

export function allLeaves() {
  return modules.flatMap((m) => flattenMenu(m.menu, m.key))
}

export function findLeaf(path) {
  return allLeaves().find((l) => l.path === path)
}

export function moduleOfPath(path) {
  return modules.find((m) => path === m.path || path.startsWith(`/${m.key}/`)) || modules[3]
}
