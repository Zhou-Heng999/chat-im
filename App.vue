<script lang="ts">
	import TencentCloudChat from '@tencentcloud/chat';
	import timpushConfigs from "@/utils/timpush-configs.json";
	import {
		config
	} from '@/const'
	const bugly = uni.requireNativePlugin("WHY-Bugly");
	export default {
		onLaunch: function (e) {
			if (uni.getSystemInfoSync().platform === "ios") {
				bugly.initBugly({
					'appId': 'bd3da0d3c4' 
				})
			} else {
				bugly.initBugly({
					'appId': '08eadee482' 
				})
			}
			
			let that=this
				// #ifdef H5
				uni.navigateTo({
					url:'/pages/index/index'
				})
				// #endif
				// #ifndef H5
				
				// #endif
			// this.getOss()
			this.setTabbar();
			// #ifdef APP
			this.accredit();
			uni.$TUICallKit = uni.requireNativePlugin('TencentCloud-TUICallKit');
			// const TIMPush = uni.requireNativePlugin("TencentCloud-TIMPush");
			// const chat = TencentCloudChat.create({SDKAppID: config.SDKAppID})
			// chat.registerPlugin({
			//   'tim-push': TIMPush,
			//   pushConfig: {
			//     androidConfig: timpushConfigs,   // Android 推送配置，如不需要可传空。
			//     iOSConfig: {	
			//       "iOSBusinessID": "xxx" // iOS 推送配置，如不需要可传空。
			//      }    
			//   }
			// })
			// setTimeout(()=>{
			// 	console.log('TIMPush',TIMPush)
			// 	TIMPush.setOfflinePushListener((data) => {
			// 	    // 透传 entity 中的内容，不包含推送的 Message
			// 	    console.log('setOfflinePushListener', data);
			// 	    // 跳转到应用内指定界面
				    
			// 	});
			// },1500)
			// 监听
			// #endif
			uni.getSystemInfo({
				success(res) {
					that.$store.commit('setPlatform',res)
				}
			})
			// bb=6555
			// uni.onPushMessage((res) => {
			// 			console.log("收到推送消息：",res) //监听推送消息
			// 		})
			this.updateApp()
		},
		onShow: function () {
			console.log('App Show')
			// console.log(this.userInfo?.userID)
			bugly.setUserInfo({
			    'userId': this.userInfo?.userID,
			    'userName': this.userInfo?.userID,
			    'phone':this.userInfo?.userID,
			})
		},
		onHide: function () {
			console.log('App Hide')
		},
		onError: function (error) {
			let userInfo = uni.getStorageSync("userInfo");
			let t={
				pageRoute:uni.$u.page(),
				userID:userInfo.userID||'',
				errorData:`${error}`
			}
			this.sendMsgError(t)
		}
	};
</script>
<style lang="scss">
	@import '@/static/style/page.scss';
	@import '@/static/style/ui.scss';
	@import '@/static/style/mixin.scss';

	@font-face {
		font-family: 'opensans';
		src: url("~@/static/fontFamily/roboto-regular.ttf") format("truetype");
	}
	@font-face {
		font-family: 'opensans-medium';
		src: url("~@/static/fontFamily/opensans-medium.ttf") format("truetype");
	}
	@font-face {
		font-family: 'opensans-regular';
		src: url("~@/static/fontFamily/opensans-regular.ttf") format("truetype");
	}

	/*每个页面公共css */
	uni-page-body,
	html,
	body,
	page {
		// font-family: 'opensans', Avenir, Helvetica, Arial, sans-serif !important;
		font-family: 'opensans-regular', Avenir, Helvetica, Arial, sans-serif !important;
		width: 100% !important;
		height: 100% !important;
		overflow: hidden;
	}

	.toast-box {
		position: fixed;
		height: 300rpx;
		width: 300rpx;
		background: red;
		top: 50%;
		left: 50%;
	}
</style>