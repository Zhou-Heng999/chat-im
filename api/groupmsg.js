

import request from '@/utils/request'

export const delete_all = payload => {
	return request('/groupmsg/delete_all', {
		method: 'POST',
		data: payload,
	})
}