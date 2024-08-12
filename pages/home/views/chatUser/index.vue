<template>
	<ql-page ref="qlPage" class="box-pd " v-if="userDetail">
		<u-navbar placeholder border autoBack :title="$tc('聊天设置')">
		</u-navbar>
		<view class="flex-column flex-center mt-30 mb-20">
			<avatarModal class="mb-40" :info='userDetail' w='190' h='190'></avatarModal>
			<text class="font-40 font-blod mb-10">{{userDetail.remark||userDetail.nick}}</text>
			<view class="flex-align less-black font-24" @click="copyText($setUserID(userDetail.userID))" >
				<text class="mr-10">ID：{{$setUserID(userDetail.userID)}}</text>
				<imageIcon name="tb_fz3" class="ml-10" width="24rpx" height="24rpx"></imageIcon>
			</view>
		</view>
		<view class="flex-column max-width pd-lr-10">
			<view class="flex-between h100 has-border" v-for="item in userTip" @click="toEdit(item)">
				<text class="mr-12">{{$tc(item.title)}}</text>
				<view class="ellipsis1 flex1" :style="{textAlign: 'right'}" v-if="item.isNeedIcon" >
					<text>{{userDetail.remark}}</text>
				</view>
				<u-icon  name='arrow-right'></u-icon>
				
			</view>
		
			<view class="flex-between h100 has-border">
				<text>{{$tc('免打扰')}}</text>
				<view class="flex-align" >
					<u-switch
            v-model="isDisturb"
            @change="changeMsgRemindDiscard"
          />
				</view>
				
			</view>
			<view class="flex-between h100 has-border">
				<text>{{$tc('置顶')}}</text>
				<view class="flex-align" >
					<u-switch
            v-model="conversation.isPinned"
            @change="changeIsPinned"
          />
				</view>
				
			</view>

			<button class="h100 text-btn"  @click="clickClearRecord">{{$tc('清空聊天记录')}}</button>
		</view>
		<!-- 用户信息 -->
		<verify title='设置备注' :maxLength="20" :defaultVal='userDetail.remark'  :isShow="isShowVerify" @closeModal='isShowVerify=false' @confirm='updateFriend' ></verify>

		<!-- 聊天或者分享 -->

    <confirmModal
			:show.sync="showConfirmModal"
      confirmText="确认"
			:content="$tc('清除当前对话的聊天记录？')"
			@confirm="confirmConfirmModal"
		/>

	</ql-page>
</template>

<script>
	import rightSelect from '@/components/right-select/index'
	import verify from '../../components/verify/index.vue'
import confirmModal from '@/components/confirm-modal/index'
	import { TUIStore, StoreName, TUIFriendService } from "@tencentcloud/chat-uikit-engine";
	
	// const MessageRemindTypes = {
	//   ['在线正常接收消息，离线时会有厂商的离线推送通知（Web 和小程序端无离线推送）']: uni.$chatKit.TUIChatEngine?.TYPES.MSG_REMIND_ACPT_AND_NOTE ,
	//   ['在线和离线都拒收消息']: uni.$chatKit.TUIChatEngine?.TYPES.MSG_REMIND_ACPT_NOT_NOTE,
	//   ['在线正常接收消息，离线不会有推送通知（消息免打扰）']: uni.$chatKit.TUIChatEngine?.TYPES.MSG_REMIND_ACPT_NOT_NOTE ,
	// }

	export default {
		components: {
			rightSelect,
			confirmModal,
			verify
		},
		data() {
			return {
				userDetail: null,
				userID: null,
				showConfirmModal: false,
				isShowVerify:false,
				userTip: [{
						title: '备注名',
						type: 'remark',
						isNeedIcon: true
					},
					// {
					// 	title: '来源',
					// 	type: 'gender'
					// },
				],
				genderList: {
					[uni.$chatKit.TUIChatEngine.TYPES.GENDER_UNKNOWN]: '', // 未设置性别
					[uni.$chatKit.TUIChatEngine.TYPES.GENDER_FEMALE]: '女', // 女性
					[uni.$chatKit.TUIChatEngine.TYPES.GENDER_MALE]: '男', // 男性
				},
				conversation: {},
				isDisturb:false,
			};
		},
		onLoad(opt) {
			let {
				userID
			} = opt
			this.userID = this.$setUserID(userID)
			this.getUser()
			TUIStore.watch(StoreName.CONV, {
				currentConversation: conversation => {
					this.conversation = conversation;

					if(this.conversation.messageRemindType === uni.$chatKit?.TUIChatEngine.TYPES.MSG_REMIND_ACPT_NOT_NOTE){
						this.isDisturb = true;
					}
					else if(this.conversation.messageRemindType === uni.$chatKit?.TUIChatEngine.TYPES.MSG_REMIND_ACPT_AND_NOTE){
						this.isDisturb = false;
					}

					console.log('this.conversation ====', this.conversation)
				},
			});
		},
		methods: {
			onClickItem({
				type
			}) {
				let {
					userID
				} = this
				if (type == 'dele') { //删除
					uni.$chatKit.chat.deleteFriend({
						userIDList: [userID]
					}).then(res => {
						console.log('已删除')
					})
				} else { //拉黑
					uni.$chatKit.chat.addToBlacklist({
						userIDList: [userID]
					}).then(res => {
						console.log('已拉黑')
					})
				}
			},
			toEdit({
				type
			}) {
				if (type == 'remark') {
					this.isShowVerify=true
				}
			},
			updateFriend(val) {
				let {
					userID
				} = this
				console.log('val',val)
				if(!val)return

				TUIFriendService.updateFriend({
				  userID,
				  remark:val,
				}).then(res=>{
					this.toastText('修改成功')
					this.getUser()
					uni.$emit('updateRemark')
				})
			},
			// 获取好友详情
			async	getUser(){
						let {userID}=this
						let nowDetail=null
					await	uni.$chatKit?.chat?.getFriendList().then(res=>{
							let list=res.data
							nowDetail=list.find(item=>item.userID==userID)
						})
					await	uni.$chatKit?.chat?.getUserProfile({
							userIDList:[userID]
						}).then(res=>{
							let info=res.data[0]
							info.remark=nowDetail?.remark
							this.userDetail=info
						})
					},
    changeMsgRemindDiscard() {

		let messageRemindType = uni.$chatKit?.TUIChatEngine.TYPES.MSG_REMIND_ACPT_AND_NOTE;

		if(this.isDisturb){
			messageRemindType = uni.$chatKit?.TUIChatEngine.TYPES.MSG_REMIND_ACPT_NOT_NOTE;
		}

		const params = {
			userIDList: [this.userID], 
			
			messageRemindType: messageRemindType
		}
		console.log('setMessageRemindType params...', params)
		uni.$chatKit?.chat?.setMessageRemindType(params).then(result => {
			}).catch(err => {
			console.log('setMessageRemindType.err =', err)
			// this.conversation.messageRemindType = this.conversation.messageRemindType === MessageRemindTypes['在线和离线都拒收消息']
		})
    },
			
    changeIsPinned() {
      const params = {
        conversationID: this.conversation.conversationID, 
        isPinned: this.conversation.isPinned,
      }
      uni.$chatKit?.chat?.pinConversation(params).then(result => {
		  }).catch(err => {
        console.log('pinConversation.err =', err)
        this.conversation.isPinned = !this.conversation.isPinned
      })
    },
    clickClearRecord() {
      this.showConfirmModal = true
    },
    confirmConfirmModal() {
      this.showConfirmModal = false
      uni.$chatKit?.chat?.clearHistoryMessage(this.conversation.conversationID).then(res=>{
			uni.$emit('resetMessage')
			console.log('confirmConfirmModal11111111')
			// this.toastText('删除成功')
			uni.navigateBack({
				delta: 1,
			})
	  })
    },
		}
	};
</script>
<style scoped lang="scss">

</style>