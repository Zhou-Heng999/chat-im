

import request from '@/utils/request'

export const online = payload => {
	return request('/game/online', {
		data: payload,
	})
}