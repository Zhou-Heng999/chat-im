<template>
	<ql-page class="box-pd " v-if="userDetail" >
		<u-navbar placeholder border autoBack :title="$tc('好友详情')"></u-navbar>
		<view class="flex-column flex-center mt-30 mb-20">
			<avatarModal class="mb-40" :info='userDetail' w='190' h='190' ></avatarModal>
			<text class="font-40 font-blod mb-10" >{{userDetail.nick}}</text>
			<view class="flex-align less-black font-20">
				<text class="mr-10" >ID：{{userDetail.userID}}</text>
				<u-icon name="file-text" ></u-icon>
			</view>
		</view>
		
		<!-- 用户信息 -->
		<view class="max-width mb-100">
			<view class="h100 has-border pd-lr-20 flex-between font-32" v-for="item in userTip" >
				<text class=" less-black" >{{$tc(item.title)}}</text>
				<text>{{userDetail[item.type]}}</text>
			</view>
		</view>
		
		<!-- 聊天或者分享 -->
		<view class="flex-column flex-center">
			<btn :text="$tc('发送消息')" class="mb-40" @click="toChat" ></btn>
			<btn :text="$tc('分享联系人')" class="" btnType='info' ></btn>
		</view>
		
	</ql-page>
</template>

<script>
	import {
	  TUITranslateService,
	  TUIConversationService,
	  TUIStore,
	  StoreName,
	} from "@tencentcloud/chat-uikit-engine";
export default {
	data() {
		return {
			userDetail:null,
			userTip:[
				{title:'昵称',type:'nick'},
				{title:'备注名',type:''},
				{title:'个性签名',type:'selfSignature'},
				{title:'出生日期',type:'birthday'},
			]
		};
	},
	onLoad(opt) {
		let {userID}=opt
		this.getUser(userID)
	},
	methods: {
		 async toChat(){
			 let {userID}=this.userDetail
			await this.generateConversation(`C2C${userID}`);
			this.routerForward(`C2C${userID}`);
		},
		// 获取好友列表
		getUser(userID){
			uni.$chatKit?.chat?.getUserProfile({
				userIDList:[userID]
			}).then(res=>{
				this.userDetail=res.data[0]
				console.warn(res)
			})
		},
		
		routerForward(conversationID){
			if(conversationID){
				uni.redirectTo({
					url:'/TUIKit/components/TUIChat/index'
				})
			}
		},
		generateConversation(conversationID){
			TUIConversationService.switchConversation(conversationID)
			  .then(() => {
			   
			    console.warn("打开会话成功");
			  })
			  .catch((err) => {
			    console.warn("打开会话失败", err.code, err.msg);
			  });
		}
	}
};
</script>
<style scoped lang="scss">
	
</style>