
import request from '@/utils/request'


/**
 * 获取配置项
 * @param {*} payload
 */
export const qry = payload => {
  return request('/setting/qry', {
    data: payload,
	method:'GET'
  })
}