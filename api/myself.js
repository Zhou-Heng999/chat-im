import request from '@/utils/request'

/**
 * 服务部-服务列表
 * @param {*} payload
 */
export const fuwulist = payload => {
  return request('/myself/fuwulist', {
    data: payload,
	method:'POST'
  })
}


/**
 * 输赢记录
 * @param {*} payload
 */
export const workingLog = payload => {
  return request('/myself/workingLog', {
    data: payload,
	method:'POST'
  })
}


/**
 * 输赢记录详情
 * @param {*} payload
 */
export const workingLogInfo = payload => {
  return request('/myself/workingLogInfo', {
    data: payload,
	method:'POST'
  })
}


/**
 * 今天转码
 * @param {*} payload
 */
export const todayZM = payload => {
  return request('/myself/todayZM', {
    data: payload,
	method:'POST'
  })
}


/**
 * 今天服务
 * @param {*} payload
 */
export const todayFW = payload => {
  return request('/myself/todayFW', {
    data: payload,
	method:'POST'
  })
}


/**
 * 修改上班状态
 * @param {*} payload
 */
export const changeStatus = payload => {
  return request('/myself/changeStatus', {
    data: payload,
	method:'POST'
  })
}



