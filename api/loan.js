import request from '@/utils/request'

/**
 * 立即还款
 * @param {*} payload
 */
export const refund = payload => {
  return request('/loan/refund', {
    data: payload,
	method:'POST'
  })
}