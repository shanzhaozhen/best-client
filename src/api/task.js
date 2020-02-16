import request from '@/utils/request'

export function getTaskPage(query) {
  return request({
    url: '/task/page',
    method: 'post',
    data: query
  })
}

export function getTaskById(id) {
  return request({
    url: `/task/${id}`,
    method: 'get'
  })
}

export function addTask(data) {
  return request({
    url: '/task',
    method: 'post',
    data
  })
}

export function updateTask(data) {
  return request({
    url: '/task',
    method: 'put',
    data
  })
}

export function deleteTask(id) {
  return request({
    url: `/task/${id}`,
    method: 'delete'
  })
}

export function runTask(id) {
  return request({
    url: `/task/${id}/run`,
    method: 'get'
  })
}

export function startTask(id) {
  return request({
    url: `/task/${id}/start`,
    method: 'get'
  })
}

export function stopTask(id) {
  return request({
    url: `/task/${id}/stop`,
    method: 'get'
  })
}

