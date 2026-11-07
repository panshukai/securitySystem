import { createRouter, createWebHashHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { allLeaves } from '@/menu/menu.config'

const placeholderRoutes = allLeaves()
  .filter((leaf) => !leaf.implemented)
  .map((leaf) => ({
    path: leaf.path.slice(1),
    component: () => import('@/views/Placeholder.vue'),
    meta: { title: leaf.title, group: leaf.group },
    props: { title: leaf.title }
  }))

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/Login.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/',
      component: AppLayout,
      redirect: '/event/center',
      children: [
        {
          path: 'event/center',
          component: () => import('@/views/event/EventCenter.vue'),
          meta: { title: '事件中心', group: 'event' }
        },
        {
          path: 'video/live',
          component: () => import('@/views/video/LivePreview.vue'),
          meta: { title: '实时预览', group: 'video' }
        },
        {
          path: 'device/overview',
          component: () => import('@/views/device/DeviceOverview.vue'),
          meta: { title: '设备总览', group: 'device' }
        },
        {
          path: 'access/perm',
          component: () => import('@/views/access/AccessPermission.vue'),
          meta: { title: '门禁权限配置', group: 'access' }
        },
        {
          path: 'access/person',
          component: () => import('@/views/person/PersonList.vue'),
          meta: { title: '人员信息管理', group: 'access' }
        },
        ...placeholderRoutes
      ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/event/center' }
  ]
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · 鼎位安防综合管理平台` : '鼎位安防综合管理平台'
})

export default router
