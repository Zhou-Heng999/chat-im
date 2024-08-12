

import request from '@/utils/request'

/**
 * 划转开工
 * @param {*} payload
 */
export const ready = payload => {
  return request('/working/ready', {
    data: payload,
	method:'POST'
  })
}

/**
 * 划转列表
 * @param {*} payload
 */
export const trans_list = payload => {
  return request('/working/trans_list', {
    data: payload,
  })
}

// 离场收工
export const closing = payload => {
  return request('/working/closing', {
    data: payload,
	method:'POST'
  })
}

// 离场收工
export const game_balance = payload => {
  return request('/working/game_balance', {
    data: payload,
  })
}


/**
 * 划转详情
 * @param {*} payload
 */
export const trans_info = payload => {
  return request('/working/trans_info', {
    data: payload,
  })
}

/**
 * 取消划转
 * @param {*} payload
 */
export const cancel = payload => {
  return request('/working/cancel', {
    data: payload,
	method:'POST'
  })
}

