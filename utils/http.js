let pageNumber = 0
import store from '@/store/index.js'
let {
	baseUrl
} = store.state
const service = createWebService(baseUrl);

function createWebService(baseUrl) {
	return new Proxy({}, {
		get(target, propKey, receiver) {
			console.log(Reflect.get(target, propKey))
			
			return function(params = {
				method: "GET",
				data: {}
			}) {
				return new Promise((resolve, reject) => {
					let {
						method,
						data
					} = params
					uni.request({
						url: baseUrl + propKey,
						method,
						header: {
							'content-type': 'application/x-www-form-urlencoded'
						},
						withCredentials: true,
						data,
						success: (res) => {
							if (res.data.result) {
								pageNumber = 0
								resolve(res.data)

							} else {
								if (res.data.msg == 'login' && pageNumber == 0) {
									uni.reLaunch({
										url: '/pages/login/index'
									})
									pageNumber += 1
									return false
								}

								if (res.data.msg) {
									uni.$u.toast(res.data.msg);
								} else {
									// uni.$u.toast('服务器错误');
								}
								reject(res)
							}
						},
						fail: (err) => {
							reject(err)
						},
						complete: () => {}
					})
				});
			}
		}
	})
}




export default service
