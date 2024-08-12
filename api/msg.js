import request from '@/utils/request'

/**
 * 发送消息
 * @param {*} payload
 */
export const send = payload => {
  return request('/msg/send', {
    data: payload,
	method:'POST'
  })
}


/**
 * 查看对话消息
 * @param {*} payload
 */
export const dialogs = payload => {
  return request('/msg/dialogs', {
    data: payload,
  })
}


/**
 * 消息列表
 * @param {*} payload
 */
export const list = payload => {
  return request('/msg/list', {
    data: payload,
  })
}
/**
 * 最新消息
 * @param {*} payload
 */
export const news = payload => {
  return request('/msg/news', {
    data: payload,
  })
}

/**
 * 通知列表
 * @param {*} payload
 */
export const notice = payload => {
  return request('/msg/notice', {
    data: payload,
  })
}


/**
 * 清空未读
 * @param {*} payload
 */
export const clear = payload => {
  return request('/msg/clear', {
    data: payload,
	method:'POST'
  })
}







