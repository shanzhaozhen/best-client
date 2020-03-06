import request from '@/utils/request'

export function getAllRegionList() {
  return request({
    url: '/region/all',
    method: 'get'
  })
}

export function getRegionPage(query) {
  return request({
    url: '/region/page',
    method: 'post',
    data: query
  })
}

export function getRegionById(id) {
  return request({
    url: `/region/${id}`,
    method: 'get'
  })
}

export function addRegion(data) {
  return request({
    url: '/region',
    method: 'post',
    data
  })
}

export function updateRegion(data) {
  return request({
    url: '/region',
    method: 'put',
    data
  })
}

export function deleteRegion(id) {
  return request({
    url: `/region/${id}`,
    method: 'delete'
  })
}
