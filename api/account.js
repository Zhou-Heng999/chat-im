import request from '@/utils/request'

/**
 * 登陆 (市场/场面/服务)
 * @param {*} payload
 */
export const loginAccount = payload => {
  return request('/account/loginAccount', {
    data: payload,
	method:'POST'
  })
}


/**
 * 账户信息
 * @param {*} payload
 */
export const getUserInfo = payload => {
  return request('/account/getUserInfo', {
    data: payload,
	method:'POST'
  })
}
// 户口
export const getOptions = (payload) => {
  return request(`/account/getOptions`, {
    data: payload,
    method: "GET",
  });
};

//# 充值币种选项
export const rechargeOptions = (payload) => {
  return request(`/hall/rechargeOptions`, {
    data: payload,
    method: "GET",
  });
};

//# 佔成厅馆
export const zhancheng_open_list = (payload) => {
  return request(`/account/zhancheng_open_list`, {
    data: payload,
    method: "GET",
  });
};



export const get_parent_id = (payload) => {
  return request(`/account/get_parent_id`, {
    data: payload,
    method: "GET",
  });
};


// 驗證密碼
export const get_auth = (payload) => {
  return request(`/account/get_auth`, {
    data: payload,
    method: "GET",
  });
};


// 驗證密碼
export const auth_pwd = (payload) => {
  return request(`/account/auth_pwd`, {
    data: payload,
    method: "POST",
  });
};


export const zhancheng_open = (payload) => {
  return request(`/account/zhancheng_open`, {
    data: payload,
    method: "POST",
  });
};



//#  提现币种选项
export const withdrawOptions = (payload) => {
  return request(`/hall/withdrawOptions`, {
    data: payload,
    method: "GET",
  });
};

//#  开工币种
export const workingOptions = (payload) => {
  return request(`/hall/workingOptions`, {
    data: payload,
    method: "GET",
  });
};



/**
 * 登出
 * @param {*} payload
 */
export const logout = payload => {
  return request('/account/logout', {
    data: payload,
	method:'POST'
  })
}
/**
 * 录入客户
 * @param {*} payload
 */
export const register = payload => {
  return request('/account/register', {
    data: payload,
	method:'POST'
  })
}

/**
 * 未开户客户
 * @param {*} payload
 */
export const notOpen = payload => {
  return request('/account/notOpen', {
    data: payload,
	method:'POST'
  })
}
/**
 * 客户列表
 * @param {*} payload
 */
export const list = payload => {
  return request('/account/list', {
    data: payload,
	method:'POST'
  })
}


/**
 * 修改密码
 * @param {*} payload
 */
export const editPassword = payload => {
  return request('/account/editPassword', {
    data: payload,
	method:'POST'
  })
}
/**
 * 设置客户状态
 * @param {*} payload
 */
export const setStatus = payload => {
  return request('/account/setStatus', {
    data: payload,
	method:'POST'
  })
}

/**
 * 服务人员列表/服务项/场面人员列表
 * @param {*} payload
 */
export const selectList = payload => {
  return request('/account/selectList', {
    data: payload,
	method:'POST'
  })
}

/**
 * 安排服务
 * @param {*} payload
 */
export const booking = payload => {
  return request('/account/booking', {
    data: payload,
	method:'POST'
  })
}

/**
 * 安排场面
 * @param {*} payload
 */
export const scene = payload => {
  return request('/account/scene', {
    data: payload,
	method:'POST'
  })
}


/**
 * 修改客户偏好
 * @param {*} payload
 */
export const editPreference = payload => {
  return request('/account/editPreference', {
    data: payload,
	method:'POST'
  })
}

/**
 * 修改客户基本信息
 * @param {*} payload
 */
export const editUserInfo = payload => {
  return request('/account/editUserInfo', {
    data: payload,
	method:'POST'
  })
}

/**
 * 上传图片
 * @param {*} payload
 */
export const uploadImg = (payload) => {
  return request(`/uploadImg`, {
    data: payload,
    method: "POST",
  });
};



/**
 修改服务状态
 * @param {*} payload
 */

export const changeFuwu = (payload) => {
  return request(`/account/changeFuwu`, {
    data: payload,
    method: "POST",
  });
};


// 服务列表

export const fuwuing = (payload) => {
  return request(`/account/fuwuing`, {
    data: payload,
    method: "POST",
  });
};

/**
 * 获取二维码
 * @param {*} payload
 */
export const getQRCode = payload => {
  return request('/account/getQRCode', {
    data: payload,
	method:'POST'
  })
}

/**
 * 设置 支付密码
 * @param {*} payload
 */
export const setWithdrawPwd = payload => {
  return request('/account/setWithdrawPwd', {
    data: payload,
	method:'POST'
  })
}


/**
 * 转账
 * @param {*} payload
 */
export const transfer = payload => {
  return request('/account/transfer', {
    data: payload,
	method:'POST'
  })
}

/**
 * 查询客户币种余额
 * @param {*} payload
 */
export const getCurrencys = payload => {
  return request('/account/getCurrencys', {
    data: payload,
	method:'POST'
  })
}



/**
 * 查询客户币种余额
 * @param {*} payload
 */
export const transfer_log = payload => {
  return request('/account/transfer_log', {
    data: payload,
	method:'POST'
  })
}



/**
 * 佣金列表
 * @param {*} payload
 */
export const commissionLog = payload => {
  return request('/account/commissionLog', {
    data: payload,
  })
}



/**
 * 佣金详情
 * @param {*} payload
 */
export const commissionLogInfo = payload => {
  return request('/account/commissionLogInfo', {
    data: payload,
  })
}


/**
 * 查询佣金配置
 * @param {*} payload
 */
export const commissionConfig = payload => {
  return request('/account/commissionConfig', {
    data: payload,
  })
}


/**
 * 保存佣金
 * @param {*} payload
 */
export const saveCommissionConfig = payload => {
  return request('/account/saveCommissionConfig', {
    data: payload,
	method:"POST"
  })
}



























