import request from '@/utils/request'

export const forbid_send_msg = payload => {
	return request('/chat_group_member/forbid_send_msg', {
		method: 'POST',
		data: payload,
	}, "application/json")
}