import request from '@/utils/request'

/**
 * 图片验证码
 * @param {*} payload
 */
export const getImageCaptcha = payload => {
  return request('/user/getImageCaptcha', {
    data: payload
  })
}


/**
 * 注册
 * @param {*} payload
 */
export const dcRegister = payload => {
  return request('/user/dcRegister', {
    data: payload,
	method:"POST"
  })
}


/**
 * 手机号登录
 * @param {*} payload
 */
export const loginPhone = payload => {
  return request('/user/loginPhone', {
    data: payload,
	method:"POST"
  })
}


/**
 * 账号登录
 * @param {*} payload
 */
export const loginAccount = payload => {
  return request('/user/loginAccount', {
    data: payload,
	method:"POST"
  })
}




/**
 * 获取登录短信验证码
 * @param {*} payload
 */
export const getLoginSmsCaptcha = payload => {
  return request('/user/getLoginSmsCaptcha', {
    data: payload
  })
}


/**
 * 登出
 * @param {*} payload
 */
export const logout = payload => {
  return request('/user/logout', {
    data: payload,
	method:"POST"
  })
}


/**
 * 玩家信息查询
 * @param {*} payload
 */
export const user_info = payload => {
  return request('/user/user_info', {
    data: payload
  })
}



/**
 * 绑定手机验证码
 * @param {*} payload
 */
export const getBindSmsCaptcha = payload => {
  return request('/user/getBindSmsCaptcha', {
    data: payload
  })
}

/**
 * 绑定手机
 * @param {*} payload
 */
export const bindPhone = payload => {
  return request('/user/bindPhone', {
    data: payload,
	method:'POST'
  })
}

/**
 * 获取密保问题列表
 * @param {*} payload
 */
export const getSecretQuestion = payload => {
  return request('/user/getSecretQuestion', {
    data: payload
  })
}


/**
 * 设置密保问题
 * @param {*} payload
 */
export const setSecretQuestion = payload => {
  return request('/user/setSecretQuestion', {
    data: payload,
	method:'POST'
  })
}


/**
 * 修改密码
 * @param {*} payload
 */
export const editPassword = payload => {
  return request('/user/editPassword', {
    data: payload,
	method:'POST'
  })
}


/**
 * 通过密保问题重置密码，忘记密码
 * @param {*} payload
 */
export const resetPassword = payload => {
  return request('/user/resetPassword', {
    data: payload,
	// method:'POST'
  })
}


/**
 * 实名
 * @param {*} payload
 */
export const bindRealName = payload => {
  return request('/user/bindRealName', {
    data: payload,
	// method:'POST'
  })
}




/**
 * 查询私人秘钥
 * @param {*} payload
 */
export const get_sec_key = payload => {
  return request('/user/get_sec_key', {
    data: payload
  })
}


/**
 * 设置私人秘钥
 * @param {*} payload
 */
export const setSecKey = payload => {
  return request('/user/set_sec_key', {
    data: payload,
	method:'POST'
  })
}


/**
 * 地址列表
 * @param {*} payload
 */
export const addressList = payload => {
  return request('/user/address_list', {
    data: payload,
  })
}


/**
 * 添加/编辑 地址
 * @param {*} payload
 */
export const setAddress = payload => {
  return request('/user/set_address', {
    data: payload,
	method:"POST"
  })
}


/**
 * 删除地址
 * @param {*} payload
 */
export const delAddress = payload => {
  return request('/user/del_address', {
    data: payload,
	method:"POST"
  })
}


/**
 * 邀请链接
 * @param {*} payload
 */
export const getInviteUrl = payload => {
  return request('/user/getInviteUrl', {
    data: payload
  })
}

/**
 * 用户余额
 * @param {*} payload
 */
export const balance = payload => {
  return request('/user/balance', {
    data: payload
  })
}

/**
 * 背包列表
 * @param {*} payload
 */
export const bag = payload => {
  return request('/user/bag', {
    data: payload
  })
}


/**
 * 消息列表
 * @param {*} payload
 */
export const mailList = payload => {
  return request('/user/mailList', {
    data: payload
  })
}

// /**
//  * 下载路径
//  * @param {*} payload
//  */
// export const getDownUrl = payload => {
//   return request('/user/getDownUrl', {
//     data: payload
//   })
// }


// /**
//  * 下载路径
//  * @param {*} payload
//  */
// export const getUser = payload => {
//   return request('/user/getUser', {
//     data: payload
//   })
// }

// /**
//  * 设置资金密码
//  * @param {*} payload
//  */
// export const setWithdrawPwd = payload => {
//   return request('/user/setWithdrawPwd', {
//     data: payload,
// 	method:"POST"
//   })
// }

// /**
//  * 获取玩家基本信息
//  * @param {*} payload
//  */
// export const getUserInfo = payload => {
//   return request('/user/getUserInfo', {
//     data: payload
//   })
// }


// /**
//  * 实名
//  * @param {*} 收益
//  */
// export const earnings = payload => {
//   return request('/user/earnings', {
//     data: payload,
// 	method:'POST'
//   })
// }
