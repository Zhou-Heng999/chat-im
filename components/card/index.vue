<template>
	<u-popup :show="isShow" overlayOpacity='0.1' closeable :round="10" mode="center" @close="close">
		<view class="option-view " v-if="info" >
			<view class="title font-32 flex-center">
				{{$tc('用户名片')}}
			</view>
			<view class="flex-center flex-column pd-lr-20">
				<view class="flex-column flex-center mt-30 mb-20">
					<avatarModal class="mb-40" :info='info' w='190' h='190' ></avatarModal>
					<text class="font-40 font-blod mb-10" >{{info.nick}}</text>
				</view>
				<view class="max-width mb-100">
					<view class="h100 has-border pd-lr-20 flex-between font-32" v-for="item in userTip" >
						<text class=" less-black" >{{$tc(item.title)}}</text>
						<text class="value ellipsis1" v-if="item.type!='gender'" >{{info[item.type]}}</text>
						<text v-else >{{$tc(genderList[info[item.type]])}}</text>
					</view>
				</view>
				<!-- 聊天或者分享 -->
				<view v-if="info.userID != userInfo.userID" class="flex-column flex-center">
					<btn :text="$tc('添加好友')" class="mb-40" @click="isVerifyShow=true" ></btn>
				</view>
			</view>
		</view>
		<verify :isShow="isVerifyShow" @closeModal='isVerifyShow=false' @confirm='addFriend' :defaultVal='userNick' ></verify>
	</u-popup>
</template>

<script>
	import TUIChatEngine from "@tencentcloud/chat-uikit-engine";
	import verify from '@/pages/home/components/verify/index.vue'
export default {
	props: {
		isShow: {
			type: Boolean,
			default: false
		},
		info: {
			type: Object,
			default: null
		},
	},
	computed:{
		userInfo() {
			return this.$store.state.userInfo;
		},
	},
	components:{
		verify
	},
	data() {
		return {
			userTip:[
				{title:'昵称',type:'nick'},
				{title:'性别',type:'gender'},
				{title:'个性签名',type:'selfSignature'},
			],
			form:{
				remark: '',
				groupName: '',
				wording: '',
			},
			userNick:'',
			isVerifyShow:false,
			genderList: {
			  [uni.$chatKit.TUIChatEngine.TYPES.GENDER_UNKNOWN]: '', // 未设置性别
			  [uni.$chatKit.TUIChatEngine.TYPES.GENDER_FEMALE]: '女', // 女性
			  [uni.$chatKit.TUIChatEngine.TYPES.GENDER_MALE]: '男', // 男性
			}
		};
	},
	watch:{
		info: {
			handler(val) {
				if(val){
				}
			},
			immediate: true
		},
	},
	mounted() {
		uni.$chatKit.chat.getMyProfile().then(res=>{
			// console.log('我的个人信息',res)
			this.userNick = this.$tc('我是') + " " + res.data.nick
		})
	},
	methods: {
		close() {
			this.$emit('closeModal');
		},
		addFriend(val){
			let that = this;
			let {userID}=this.info
			this.form.wording=val
			uni.$chatKit.chat.addFriend({
			  to: userID,
			  source:'AddSource_Type_Search',
			  ...this.form
			}).then(res=>{
				this.isVerifyShow=false
				this.close()
				//发送打招呼消息
				this.sendFirstMsg(userID)
				
				uni.showToast({
					title: that.$tc('已发送好友申请'),
					duration: 2000
				})
			}).catch(err=>{
				this.isVerifyShow=false
				this.close()
			})
		},
	}
};
</script>
<style scoped lang="scss">
.option-view {
	width: 690rpx;
	color: #1b252f;
}
.title{
	height: 100rpx;
}
.value {
	// flex: 1;
	text-align: right;
	width: 400rpx;
}
</style>