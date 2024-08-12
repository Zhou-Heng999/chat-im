import request from '@/utils/request'

/**
 * 添加好友记录接口 
 * @param {*} payload
 */
export const addFriendList = payload => {
  return request('/add_friend_log/list', {
    data: payload,
	method:'GET'
  })
}