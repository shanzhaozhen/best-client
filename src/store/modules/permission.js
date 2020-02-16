// import { asyncRoutes, constantRoutes } from '@/router'
import { constantRoutes, allRoutes } from '@/router'
import { getResources } from '@/api/resource'

const defaultRoute = {
  path: '',
  component: {},
  redirect: '',
  name: '',
  meta: {},
  children: []
}

/**
 * 将路由全权交给后台管理
 * @param asyncRouters
 * @returns {[]}
 */
function generateAsyncRoutes(asyncRouters) {
  const res = []

  asyncRouters.forEach(asyncRouter => {
    const tmpRoute = Object.assign({}, defaultRoute)
    tmpRoute.path = asyncRouter.path
    tmpRoute.component = allRoutes[asyncRouter.name].component
    tmpRoute.redirect = asyncRouter.redirect
    tmpRoute.name = asyncRouter.name
    tmpRoute.hidden = asyncRouter.hidden
    tmpRoute.alwaysShow = asyncRouter.alwaysShow
    tmpRoute.meta = asyncRouter.meta
    if (asyncRouter.children && asyncRouter.children.length) {
      tmpRoute.children = generateAsyncRoutes(asyncRouter.children)
    }
    if (asyncRouter.props && asyncRouter.props !== '{}') {
      tmpRoute.props = JSON.parse(asyncRouter.props)
    }
    res.push(tmpRoute)
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  getResources({ commit }) {
    return new Promise((resolve, reject) => {
      getResources().then(res => {
        resolve(res.data)
      }).catch(error => {
        reject(error)
      })
    })
  },
  generateRoutes({ commit }, menus) {
    return new Promise(resolve => {
      // const accessedRoutes = filterAndRenderingAsyncRoutes(asyncRoutes, menus)
      const accessedRoutes = generateAsyncRoutes(menus)
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
