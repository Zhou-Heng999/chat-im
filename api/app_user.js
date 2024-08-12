import request from '@/utils/request'

/**
 * 注册 
 * @param {*} payload
 */
export const register = payload => {
	return request('/app_user/register', {
		data: payload,
		method: 'POST'
	})
}


/**
 * 登录 
 * @param {*} payload
 */
export const login = payload => {
	return request('/app_user/login', {
		data: payload,
		method: 'POST'
	})
}

/**
 * 登录 
 * @param {*} payload
 */
export const login2 = payload => {
	return request('/app_user/login2', {
		data: payload,
		method: 'POST'
	})
}



/**
 * 修改密码 
 * @param {*} payload
 */
export const modify_password = payload => {
	return request('/app_user/modify_password', {
		data: payload,
		method: 'POST'
	})
}


/**
 * 双向删除 
 * @param {*} payload
 */
export const delete_c2c_msg_both = payload => {
	return request('/app_user_c2c_msg/delete_c2c_msg_both', {
		data: payload,
		method: 'POST'
	})
}


/**
 * oss 
 * @param {*} payload
 */
export const costoken = payload => {
	return request('/app_user/costoken', {
		data: payload,
		method: 'GET'
	})
}


/**
 * oss 
 * @param {*} payload
 */
export const post_policy = payload => {
	return request('/app_user/post-policy', {
		data: payload,
		method: 'GET'
	})
}



/**
 * oss 
 * @param {*} payload
 */
export const pre_addblack = payload => {
	return request('/app_user/pre_addblack', {
		data: payload,
		method: 'POST'
	})
}

/**
 * 设置密保 
 * @param {*} payload
 */
export const set_question = payload => {
	return request('/app_user/set_question', {
		data: payload,
		method: 'POST'
	})
}

/**
 * 找回密码 
 * @param {*} payload
 */
export const reset_question = payload => {
	return request('/app_user/reset_question', {
		data: payload,
		method: 'POST'
	})
}

/**
 * 特权用户 
 * @param {*} payload
 */
export const privilege_list = payload => {
	return request('/app_user/privilege_list', {
		data: payload,
		method: 'GET'
	})
}


/**
 * 错误信息收集 
 * @param {*} payload
 */
export const errlog = payload => {
	return request('/test/errlog', {
		data: payload,
		method: 'POST'
	})
}


/**
 * 获取敏感词
 * @param {*} payload
 */
export const words_url = payload => {
	return request('/app_user/words_url', {
		data: payload,
		method: 'GET'
	})
}


/**
 * 私聊置顶列表 
 * @param {*} payload
 */
export const c2cmsgToplist = payload => {
	return request('/c2cmsg/toplist', {
		data: payload,
		method: 'GET'
	})
}




/**
 * 私聊消息置顶
 * @param {*} payload
 */
export const c2cmsgSetTop = payload => {
	return request('/c2cmsg/set_top', {
		data: payload,
		method: 'POST'
	})
}




/**
 * 私聊取消消息置顶
 * @param {*} payload
 */
export const c2cmsgRmTop = payload => {
	return request('/c2cmsg/rm_top', {
		data: payload,
		method: 'POST'
	})
}

/**
 * 获取渠道限制配置
 * @param {*} payload
 */
export const app_setting_list = payload => {
	return request('/app_setting/list', {
		data: payload,
		method: 'GET'
	})
}