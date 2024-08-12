import request from '@/utils/request'

/**
 * 发现页列表 
 * @param {*} payload
 */
export const list = payload => {
  return request('/app_discovery/list', {
    data: payload,
	method:'GET'
  })
}