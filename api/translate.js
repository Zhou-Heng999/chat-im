import request from '@/utils/request'

export const text = payload => {
  return request('/translate/text', {
    data: payload,
	  method:'POST'
  })
}