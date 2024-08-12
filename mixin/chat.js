
import env from '@/utils/env.js'
import uniCopy from '@/utils/uni-copy.js'
// import {
// 	TUIChatKit,
// 	genTestUserSig
// } from "@/pages/TUIKit";
import {
	TUILogin
} from "@tencentcloud/tui-core";
 // import COS from 'cos-nodejs-sdk-v5';
  // const COS = require('cos-nodejs-sdk-v5');
  // import COS from 'cos-js-sdk-v5';
import TUIChatEngine,{
	TUITranslateService,
	TUIConversationService,
	TUIStore,
	StoreName,
	TUIChatService
} from "@tencentcloud/chat-uikit-engine";
let cosInfo=null
import appData from '@/const/app.json'
console.log('appData',appData)
import Vue from "vue";
export const ListMixin = {
	data() {
		return {
			redColor: '#E55A60',
			greenColor: '#30AD83',
			blueColor: '#3DBDFE',
			yellowColor: "#ffab2a",
			titleColor: '#15132b',
			channel: appData.channel,
			appName:appData.appName,
			powerUserList: [],
			appSettingList: []
		}
	},
	computed: {
		userInfo() {
			return this.$store.state.userInfo;
		},
		isPc() {
			const systemInfo = uni.getSystemInfoSync();
			return systemInfo.platform == 'windows';
		},
		ossClient() {
			return this.$store.state.ossClient;
		},
		ossInfo() {
			return this.$store.state.ossInfo;
		},
		platform(){
			return this.$store.state.platform;
		},
		isPowerUser(){
			return this.$store.state.isPower;
		},
		keyboardHeight(){
			return this.$store.state.keyboardHeight;
		},
		editMsgContent(){
			return this.$store.state.editMsgContent;
		}
	},
	onShow(){
		// #ifdef H5
		let page = uni?.$u?.pages()||''
		if(page&&page.length>1){
			let {query}=this.$route
			let pageRoute=`/${page[page.length-1].route}`
			if(pageRoute=='/pages/index/index')return
			let params  =new URLSearchParams(query)
			if(params.toString()){
				pageRoute+=`?${params.toString()}`
			}
			uni.setStorageSync('lastPage',pageRoute)
		}
		// #endif
		
	},
	onUnload() {},

	methods: {
		sendFirstMsg(userID) {
			let isAllowAny = false
			uni.$chatKit.chat.getUserProfile({
			  userIDList: [`${userID}`]
			}).then(function(res) {
				let type = res.data[0].allowType;
				isAllowAny = type == 'AllowType_Type_AllowAny'
				if(isAllowAny){
					let message =TUIChatEngine.chat.createCustomMessage({
						to:userID,
						conversationType:'C2C',
						payload:{
							data: '我们是朋友了', 
							description: 'newFriends', 
							extension: 'newFriends'
						},
					})
					TUIChatService.sendCustomMessage(message)
				}
			})
		},
		watchChat(){
			console.log('watchChat=======')
			TUIStore.watch(StoreName.CHAT, {
				messageList: (list)=>{
					console.log('消息列表999999999999999',list)
				},
			});
		}
		

	}
}