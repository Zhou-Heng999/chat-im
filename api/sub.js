
import request from '@/utils/request'



/**
 * 下级列表
 * @param {*} payload
 */
export const sub_list = payload => {
  return request('/sub/sub_list', {
    data: payload,
	method:'POST'
  })
}


/**
 * 下级存款
 * @param {*} payload
 */
export const sub_assets = payload => {
  return request('/sub/sub_assets', {
    data: payload,
  })
}




/**
 * 下级贷款
 * @param {*} payload
 */
export const sub_loan = payload => {
  return request('/sub/sub_loan', {
    data: payload,
  })
}



/**
 * 下级上下数
 * @param {*} payload
 */
export const sub_winloss = payload => {
  return request('/sub/sub_winloss', {
    data: payload,
  })
}


/**
 * 下级转码
 * @param {*} payload
 */
export const sub_zhuanma = payload => {
  return request('/sub/sub_zhuanma', {
    data: payload,
  })
}


/**
 * 下级佣金
 * @param {*} payload
 */
export const sub_commission = payload => {
  return request('/sub/sub_commission', {
    data: payload,
  })
}



