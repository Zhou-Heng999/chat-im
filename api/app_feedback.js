import request from '@/utils/request'

/**
 * 意见反馈 
 * @param {*} payload
 */
export const appFeedback = payload => {
  return request('/app_feedback/add', {
    data: payload,
	method:'POST'
  })
}