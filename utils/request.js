let pageNumber=0
import store from '@/store/index.js'
import env from './env.js'
import { tc } from '@/utils/util'
// console.log(store.state)
export default function (url, params = {method:"GET",data:{}}, dataType = "application/x-www-form-urlencoded") {
  return new Promise((resolve, reject)=>{
	  let {method,data}=params
	  uni.request({
	  	url: env.baseUrl + url,
	  	method,
		header: {
			// 'content-type': dataType,
			"content-type": dataType,
			'token':uni.getStorageSync('token')||store.state.pageToken
		},
		withCredentials:true,
	  	data,
	  	success: (res) => {
			if(res.data.result){
				pageNumber=0
				resolve(res.data)
				
			}else{
				let {result,code} = res.data
				if(!result && code==2001){
					uni.$u.toast(tc('登录已过期,请重新登录'))
					uni.reLaunch({
						url:'/pages/login/index'
					})
					return false
				}
				
				if(res.data.msg && res.data.msg.indexOf('login') >= 0){
					uni.reLaunch({
						url:'/pages/login/login'
					})
					pageNumber+=1
					return false
				}
				
				if(res.data.msg){
					uni.$u.toast(tc(res.data.msg));
				}else{
					// uni.$u.toast(`${url}--${res.data}`);
				}
				reject(res)
			}
	  	},
	  	fail: (err) => {
			console.log(err)
	  		reject(err)
	  	},
	  	complete: () => {
	  	}
	  })
  })

}