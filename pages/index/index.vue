<template>
	<view class="main">
		<view class="logo">
			<image style="width: 180rpx;" mode="widthFix" src="/static/images/index_logo.png"></image>
		</view>
	</view>
</template>

<script>
	import {loginTX} from '@/utils/util'
	import TUIChatEngine, {
		TUIStore,
		StoreName,
	} from "@tencentcloud/chat-uikit-engine";
	import { TUILogin } from "@tencentcloud/tui-core";
	import * as all from "@tencentcloud/chat-uikit-engine";
// import home from '@/pages/home/index'
export default {
	// components: { home },
	data() {
		return {
			isInit:true
		};
	},
	onReady() {
		
	},
	onShow() {
		let userInfo=uni.getStorageSync('userInfo')
		if(!userInfo){
			uni.reLaunch({
				url:'/pages/login/index'
			})
		}else{
			let pages=uni.$u.pages()
			let lastPage=uni.getStorageSync('lastPage')
			this.checkToken(()=>{
				loginTX(null,()=>{
					let switchList=['/pages/home/index','/pages/address/index','/pages/community/index','/pages/my/index']
					let isSwitch=switchList.includes(lastPage)
					this.watchChat()
					this.getPowerUser()
					// if(lastPage){
					// 	uni[isSwitch?'switchTab':'redirectTo']({
					// 	url:lastPage	
					// 	})
					// 	uni.removeStorageSync('lastPage')
					// }else{
						
						// TUIChatEngine.chat.on(TUIChatEngine.EVENT.SDK_READY, ()=>{
						// 	console.log('准备好了')
						// });
						
						this.watchLoginStatus()
						// console.log('TUIChatEngine', new all.TUIFUN({a:1}))
						// console.log('登录好了',TUIChatEngine.EVENT.SDK_READY)
						
					// }
				}) 
			})
			
		}
	},
	mounted() {
		console.log('watchLoginStatus==========')
		this.watchLoginStatus()
	},
	onUnload() {
		TUIStore.unwatch(StoreName.CONV, {
			conversationList: this.toHomePage,
		});
	},
	onHide() {
		TUIStore.unwatch(StoreName.CONV, {
			conversationList: this.toHomePage,
		});
	},
	methods: {
		clickJump() {
			uni.navigateTo({
				url:`/pages/login/index`
			})
		},
		toHomePage(list){
				uni.switchTab({
					url:'/pages/home/index'
				})
		},
		watchChat(){
			TUIStore.watch(StoreName.CONV, {
				conversationList: this.toHomePage,
			});
			// TUIChatEngine.chat.getConversationList().then(res=>{
			// 	console.log('getConversationList',res)
			// 	setTimeout(()=>{
			// 		uni.switchTab({
			// 			url:'/pages/home/index'
			// 		})
			// 	},700)
				
			// })
		},
		watchLoginStatus() {
			const toLogin = async() => {
				uni.clearStorageSync()
				try{
					const res = await uni.$chatKit?.chat?.logout()
					uni.reLaunch({
						url:`/pages/login/index`
					})
				}catch(err){
					console.log('logout error...', err)
					if(JSON.stringify(err)) {
						const e = JSON.parse(JSON.stringify(err))
						if(e.message === 'The user has not logged in') {
							uni.reLaunch({
								url:`/pages/login/index`
							})
						}
					}
				}
			}
			const stateArr = [
				{ state: 'multipleAccount', text: '重复登录' },
				{ state: 'REST_API_Kick', text: '' }, // 修改密码和全局禁用返回的state是一样的
			]
			TUIStore.watch(StoreName.USER, {
			  kickedOut: (state) => {
				  console.log('kickedOut...', state)
				  for(const item of stateArr) {
					  if(item.state === state) {
						  if(item.text) uni.$u.toast(item.text)
						  // setTimeout(() => {
						  	toLogin()
						  // }, 1500)
						  break
					  }
				  }
			  }
			})
		},
	},
	beforeDestroy() {
		TUIStore.unwatch(StoreName.USER, {
			kickedOut: () => {}
		})
	},
};
</script>
<style scoped lang="scss">
	.main {
		width: 100vw;
		height: 100vh;
		background: linear-gradient(105.17deg, #160B25 0%, #311765 100%);

		position: relative;
	}
	.logo {
		position: absolute;
		left: 50%;
		transform: translate(-50%,-50%);
		top: 550rpx;
	}
</style>