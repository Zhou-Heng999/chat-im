import request from '@/utils/request'
/**
 * 支持银行列表
 * @param {*} payload
 */
export const getBankType = payload => {
  return request('/bank/getBankType', {
    data: payload
  })
}


/**
 * 玩家银行卡列表
 * @param {*} payload
 */
export const getBankCard = payload => {
  return request('/bank/getBankCard', {
    data: payload
  })
}



/**
 * 添加银行卡
 * @param {*} payload
 */
export const addBankCard = payload => {
  return request('/bank/addBankCard', {
    data: payload,
	method:'POST'
  })
}


/**
 * 删除银行卡
 * @param {*} payload
 */
export const deleteBankCard = payload => {
  return request('/bank/deleteBankCard', {
    data: payload,
	method:'POST'
  })
}