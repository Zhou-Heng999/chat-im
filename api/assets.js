import request from '@/utils/request'

export const getAssetlog = payload => {
	return request('/assets/getAssetlog', {
		data: payload,
		method: 'POST'
	})
}
/**
 * 今日汇率
 * @param {*} payload
 */
export const rate = payload => {
	return request('/assets/rate', {
		data: payload
	})
}
// 划转
export const trans = payload => {
	return request('/assets/trans', {
		data: payload,
		method:"POST"
	})
}

// 佣金记录
export const commisslon_log = payload => {
	return request('/assets/commisslon_log', {
		data: payload
	})
}


// 佣金详情

export const commisslon_info = payload => {
	return request('/assets/commisslon_info', {
		data: payload
	})
}

// 存卡流水

export const cunka_log = payload => {
	return request('/assets/cunka_log', {
		data: payload
	})
}


// 划转记录
export const trans_log = payload => {
	return request('/assets/trans_log', {
		data: payload
	})
}

// 开工记录
export const working_log = payload => {
	return request('/assets/working_log', {
		data: payload
	})
}

/**
 * 结余
 * @param {*} payload
 */
export const balance = payload => {
	return request('/assets/balance', {
		data: payload
	})
}
//# 上下數詳情
export const updown_info = payload => {
	return request('/assets/updown_info', {
		data: payload
	})
}


//# 字典列表
export const dictionary = (payload) => {
  return request(`/dictionary/list`, {
    data: payload,
    method: "GET",
  });
};

/**
 * 存款记录
 * @param {*} payload
 */
export const getDepositLog = payload => {
	return request('/assets/getDepositLog', {
		data: payload,
		method: 'POST'
	})
}


/**
 * 上下数记录
 * @param {*} payload
 */
export const getShangXiaLog = payload => {
	return request('/assets/getShangXiaLog', {
		data: payload,
		method: 'POST'
	})
}




/**
 * 上下数详情
 * @param {*} payload
 */
export const getShangXiaInfo = payload => {
	return request('/assets/getShangXiaInfo', {
		data: payload,
		method: 'POST'
	})
}


/**
 * 转码记录
 * @param {*} payload
 */
export const getZhuanmaLog = payload => {
	return request('/assets/working_log', {
		data: payload
	})
}


/**
 * 转码详情
 * @param {*} payload
 */
export const getZhuanmaInfo = payload => {
	return request('/assets/zhuanma_info', {
		data: payload
	})
}


/**
 * 贷款信息
 * @param {*} payload
 */
export const loanInfo = payload => {
	return request('/assets/loanInfo', {
		data: payload,
		method: 'POST'
	})
}


/**
 * 获取二维码
 * @param {*} payload
 */
export const getQRCode = payload => {
	return request('/assets/getQRCode', {
		data: payload,
		method: 'POST'
	})
}


/**
 * 银行卡提现
 * @param {*} payload
 */
export const withdrawBank = payload => {
	return request('/assets/withdrawBank', {
		data: payload,
		method: 'POST'
	})
}