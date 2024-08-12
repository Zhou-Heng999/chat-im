import request from '@/utils/request'

/**
 * 今日汇率
 * @param {*} payload
 */
export const rate = payload => {
  return request('/worktable/rate', {
    data: payload,
	method:'POST'
  })
}



/**
 * 赌桌情况
 * @param {*} payload
 */
export const deskInfo = payload => {
  return request('/worktable/deskInfo', {
    data: payload,
	method:'POST'
  })
}

/**
 * 安排赌桌
 * @param {*} payload
 */
export const setDesk = payload => {
  return request('/worktable/setDesk', {
    data: payload,
	method:'POST'
  })
}

/**
 * 投注输赢记录
 * @param {*} payload
 */
export const bet = payload => {
  return request('/worktable/bet', {
    data: payload,
	method:'POST'
  })
}


/**
 * 待处理服务
 * @param {*} payload
 */
export const pending = payload => {
  return request('/worktable/pending', {
    data: payload,
	method:'POST'
  })
}

/**
 * 填写服务单
 * @param {*} payload
 */
export const submitFuwu = payload => {
  return request('/worktable/submitFuwu', {
    data: payload,
	method:'POST'
  })
}


/**
 * 换桌
 * @param {*} payload
 */
export const changeDesk = payload => {
  return request('/worktable/changeDesk', {
    data: payload,
	method:'POST'
  })
}


/**
 * 暂停
 * @param {*} payload
 */
export const stopWorking = payload => {
  return request('/worktable/stopWorking', {
    data: payload,
	method:'POST'
  })
}







