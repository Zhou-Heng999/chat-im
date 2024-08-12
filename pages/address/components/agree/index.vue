<template>
	<u-popup :show="isShow" closeable :round="10" mode="center" @close="close">
		<view class="option-view" v-if="userDetail">
			<view v-if="userDetail.addType == 0" class="title font-32 flex-center">
				{{$tc('确认添加')}}
			</view>
			<view v-else class="title font-32 flex-center">
				{{$tc('确认拒绝')}}
			</view>
			<view class="flex-column flex-center mt-30 mb-20">
				<avatarModal class="mb-40" :info='userDetail' w='190' h='190' ></avatarModal>
				<text class="font-40 font-blod mb-10" >{{userDetail.nick}}</text>
				<view class="flex-align less-black font-20">
					<text class="mr-10" >ID：{{$setUserID(userDetail.userID)}}</text>
					<u-icon name="file-text" ></u-icon>
				</view>
			</view>
			
			<!-- 用户信息 -->
			<view class="max-width mb-100">
				<view class="h100 has-border pd-lr-20 flex-between font-32" v-for="item in userTip" @click="onOpenModal(item)" >
					<text class=" less-black" >{{$tc(item.title)}}</text>
					<view class="flex-align">
						<text>{{item.edit?from[item.type]:userDetail[item.type]}}</text>
						<u-icon name="arrow-right" v-if="item.edit" @click="openModal(item)" ></u-icon>
					</view>
					
				</view>
			</view>
			
			<!-- 聊天或者分享 -->
			<view class="flex-column flex-center">
				<btn v-if="userDetail.addType == 0" :text="$tc('同意')" :loading="agreeLoading" class="mb-40 " @click="onAgree" ></btn>
				<u-button v-else @click="refuse" :text="$tc('拒绝')" :loading="agreeLoading" style=" border-radius: 50rpx; width: 75%; height: 90rpx; " type="error" ></u-button>
				<inputModal :isShow="isInputShow" title='好友备注' @confirm='confirmData' @closeModal='isInputShow=false' ></inputModal>
			</view>
		</view>
	</u-popup>
</template>

<script>
	import inputModal from '@/components/inputModal/index';
	import TUIChatEngine, {
		TUIStore,
		StoreName,
		TUIChatService,
		IConversationModel,
	} from "@tencentcloud/chat-uikit-engine";
export default {
	components:{
		inputModal
	},
	props: {
		isShow: {
			type: Boolean,
			default: false
		},
		userDetail:{
			type: Object||null,
			default: null
		}
	},
	data() {
		return {
			from:{
				remark:'',
			},
			isInputShow:false,
			userTip:[
				// {title:'来源',type:'source'},
				{title:'请求消息',type:'wording'},
				{title:'备注',type:'remark',edit:true},
			],
			agreeLoading: false
		};
	},
	methods: {
		close() {
			this.$emit('closeModal');
		},
		confirmData(e){
			this.from.remark=e
		},
		onOpenModal(e){
			if(e.edit){
				this.isInputShow=true
			}
		},
		onAgree(){
			this.agreeLoading = true;
			let {userDetail,from}=this
			uni.$chatKit.chat.acceptFriendApplication({
			  userID: userDetail.userID,
			  remark: from.remark,
			  type: uni.$chatKit.TUIChatEngine.TYPES.SNS_APPLICATION_AGREE_AND_ADD
			}).then(res=>{
				this.agreeLoading = false
				this.$emit('onAgree',userDetail.userID);
				this.toSendData()
				this.close()
			}).catch(err=>{
				this.agreeLoading = false
				console.log(err)
			})
		},
		refuse(){
			this.agreeLoading = true;
			let {userDetail,from}=this
			uni.$chatKit.chat.refuseFriendApplication({
			  userID: userDetail.userID,
			}).then(res=>{
				this.agreeLoading = false
				console.log('拒绝',res);
				this.$emit('onRefuse',userDetail.userID);
				this.close()
			}).catch(err=>{
				this.agreeLoading = false
				console.log(err)
			})
		},
		toSendData(){
			let {userDetail,from}=this
				let message =TUIChatEngine.chat.createCustomMessage({
					to:userDetail.userID,
					conversationType:'C2C',
					payload:{
						data: '我们是朋友了', 
						description: 'newFriends', 
						extension: 'newFriends'
					},
				})
				TUIChatService.sendCustomMessage(message)
		},
	}
};
</script>
<style scoped lang="scss">
.option-view {
	height: 80vh;
	width: 700rpx;
}
.title{
	height: 100rpx;
}
</style>