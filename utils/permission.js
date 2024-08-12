const whiteList=[
	'/pages/login/login'
]
const loginPage="/pages/login/login";
export  function initPermission(){
	console.log("initPermission:",)
	const routeFnList=["navigateTo","redirectTo","reLaunch","switchTab"]
	routeFnList.forEach(item=>{
		console.log('item',item)
		uni.addInterceptor(item,{
			invoke(e){
				console.log('111',e)
				console.log("invoke:")
				const token=uni.getStorageInfoSync("token");
				console.log("url:",e)
				const url=e.url.split("?")[0];
				let notNeed=whiteList.includes(url)
				if(notNeed){
					return e
				}else{
					console.log("token:",token)
					if(token.keys.length==0){
						uni.showToast({
							title:"请登录",
							icon:"none"
						})
						uni.navigateTo({
							url:loginPage
						})
						return false
					}else{
						return e
					}
				}
			},
			success(res){
				console.log("invoke-success",res)
			},
			fail(err){
				console.log("err",err)
			}	
		})		
	})
	
}