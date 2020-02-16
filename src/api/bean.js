import request from '@/utils/request'

export function getBeanList() {
  return request({
    url: '/bean/list',
    method: 'get'
  })
}

export function getBeanInfoByName(name) {
  return request({
    url: `/bean/${name}`,
    method: 'get'
  })
}

