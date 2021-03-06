import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
import permissionRouter from './modules/permissionRouter'
import developerTool from './modules/developerTool'

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '主页', icon: 'dashboard', affix: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  permissionRouter,
  developerTool,
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

/**
 * 所有路由，用于后台动态获取路由是使用，通过路由名获取对应的view
 */
export const allRoutes = {
  'Permission': {
    name: 'Permission',
    component: Layout
  },
  'PagePermission': {
    name: 'PagePermission',
    component: () => import('@/views/permission/page')
  },
  'DirectivePermission': {
    name: 'DirectivePermission',
    component: () => import('@/views/permission/directive')
  },
  'RoutePermission': {
    name: 'RoutePermission',
    component: () => import('@/views/permission/route')
  },
  'ResourcePermission': {
    name: 'ResourcePermission',
    component: () => import('@/views/permission/resource')
  },
  'RolePermission': {
    name: 'RolePermission',
    component: () => import('@/views/permission/role')
  },
  'UserPermission': {
    name: 'UserPermission',
    component: () => import('@/views/permission/user')
  },
  'SystemConfig': {
    name: 'SystemConfig',
    component: Layout
  },
  'ScheduledTask': {
    name: 'ScheduledTask',
    component: () => import('@/views/system-config/task')
  },
  'RegionConfig': {
    name: 'RegionConfig',
    component: () => import('@/views/system-config/region')
  },
  'Iframe': {
    name: 'Iframe',
    component: Layout
  },
  'Druid': {
    name: 'Druid',
    component: () => import('@/views/iframe/index')
  },
  'Swagger': {
    name: 'Swagger',
    component: () => import('@/views/iframe/index')
  }
}

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
