<template>
	<ql-page class="manager-page" ref="qlPage">
		<u-navbar placeholder border autoBack :title="$tc('群管理')" @clickLeft="BackPage"></u-navbar>
		<view class="h100 flex-between pd-lr-20 option has-border">
			<view class="left w600">{{$tc('进群需审核')}}</view>
			<view class="ellipsis1 right">
				<u-switch v-model="group.joinNeedAudit" @change="changeJoinNeedAudit" />
			</view>
		</view>
		<view class="h100 flex-between pd-lr-20 option has-border">
			<view class="left w600">{{$tc('允许群成员邀请他人进群')}}</view>
			<view class="ellipsis1 right">
				<u-switch v-model="group.memberCanAudit" @change="changeMemberCanAudit" />
			</view>
		</view>
		<view class="h100 flex-between pd-lr-20 option has-border">
			<view class="left w600">{{$tc('禁止群成员加好友')}}</view>
			<view class="ellipsis1 right">
				<u-switch v-model="group.disabledAddFriend" @change="changeAddFriend" />
			</view>
		</view>
		<view class="h100 flex-between pd-lr-20 option has-border" v-if="isLeader||isAdmin" @click="clickMuteAllMembers">
			<view class="left w600">{{$tc('设置群内禁言')}}</view>
			<view class="ellipsis1 right">
				<imageIcon name="an_jty" class="ml-10" size="20" />
			</view>
		</view>
		<view v-if="isOwner" class="h100 flex-between pd-lr-20 option has-border" @click="clickManager">
			<view class="left w600">{{$tc('管理员')}}</view>
			<view class="ellipsis1 right">
				<imageIcon name="an_jty" class="ml-10" size="20" />
			</view>
		</view>
		<view class="h100 flex-between pd-lr-20 option has-border" @click="toastText('敬请期待')">
			<view class="left w600">{{$tc('入群欢迎')}}</view>
			<view class="ellipsis1 right">
				<imageIcon name="an_jty" class="ml-10" size="20" />
			</view>
		</view>
		<view class="h100 flex-between pd-lr-20 option has-border" @click="toastText('敬请期待')">
			<view class="left w600">{{$tc('定时消息')}}</view>
			<view class="ellipsis1 right">
				<imageIcon name="an_jty" class="ml-10" size="20" />
			</view>
		</view>
		<view v-if="isOwner" class="h100 flex-between  pd-lr-20 option has-border" @click="clickChangeOwner">
			<view class="left w600">{{$tc('转让群聊')}}</view>
			<view class="ellipsis1 right">
				<imageIcon name="an_jty" class="ml-10" size="20" />
			</view>
		</view>
		<view v-if="isLeader" class="h100 flex-between  pd-lr-20 option has-border" @click="clickDismissGroup">
			<view class="left w600">{{$tc('解散群聊')}}</view>
			<view class="ellipsis1 right">
				<imageIcon name="an_jty" class="ml-10" size="20" />
			</view>
		</view>

		<!-- <button class="text-btn mb-10" v-if="isLeader" @click="clickDismissGroup">解散群聊</button> -->
		<view class="padding"></view>

		<confirmModal :show.sync="showConfirmModal" :title="$tc('解散群聊')" :content="$tc('解散群聊后，群主和群成员都将移出群聊，所有聊天文件也将被删除。')"
			@confirm="confirmConfirmModal" />
	</ql-page>
</template>

<script>
	import imageIcon from '@/components/image-icon'
	import confirmModal from '@/components/confirm-modal/index'

	const JoinOptionTypes = {
		['自由加入，直播群固定为该值']: uni.$chatKit.TUIChatEngine.TYPES.JOIN_OPTIONS_FREE_ACCESS,
		['需要验证']: uni.$chatKit.TUIChatEngine.TYPES.JOIN_OPTIONS_NEED_PERMISSION,
		['禁止加群，好友工作群固定为该值']: uni.$chatKit.TUIChatEngine.TYPES.JOIN_OPTIONS_DISABLE_APPLY,
	}
	const inviteOptionTypes = {
		['无需审批直接邀请进群']: uni.$chatKit.TUIChatEngine.TYPES.INVITE_OPTIONS_FREE_ACCESS,
		['需要群主/群管理员验证']: uni.$chatKit.TUIChatEngine.TYPES.INVITE_OPTIONS_NEED_PERMISSION,
		['禁止邀请']: uni.$chatKit.TUIChatEngine.TYPES.INVITE_OPTIONS_DISABLE_INVITE,
	}

	export default {
		components: {
			imageIcon,
			confirmModal
		},
		data() {
			return {
				groupID: '',
				group: {
					selfInfo: {},
				},
				conversation: {},
				showConfirmModal: false,
			};
		},
		computed: {
			isOwner() {
				return this.group.selfInfo.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER
			},
			isAdmin() {
				return this.group.selfInfo.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN
			},
			isLeader(){
				return this.group.selfInfo.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER
			},
		},
		onShow() {
			this.getGroup()
			this.getConversation()
		},
		onLoad(opt) {
			this.groupID = opt.groupID;
		},
		methods: {
			getGroup() {
				uni.$chatKit?.chat?.getGroupProfile({
					groupID: this.groupID
				}).then(result => {
					const canAddFriend = result.data.group.groupCustomField.find(field => field.key === 'canAddFriend')?.value
					const memberCanAudit = result.data.group.groupCustomField.find(field => field.key === 'memberCanAudit')?.value
					this.group = {
						...result.data.group,
						joinNeedAudit: result.data.group.joinOption === JoinOptionTypes['需要验证'],
						disabledAddFriend: !(canAddFriend ? JSON.parse(canAddFriend) : false),
						memberCanAudit: memberCanAudit ? JSON.parse(memberCanAudit) : false,
					}
					console.log('this.group ========', this.group)
				})
			},
			updateGroup(params) {
				const newParams = {
					groupID: this.groupID,
					...params,
				}

				console.log('newParams =', newParams)

				uni.$chatKit?.chat?.updateGroupProfile(newParams).then(result => {
					console.log('updateGroupProfile')
					this.getGroup()
				})
			},
			getConversation() {
				uni.$chatKit?.chat?.getConversationProfile('GROUP' + this.groupID).then(result => {
					this.conversation = {
						...result.data.conversation
					}
				})
			},
			changeJoinNeedAudit() {
				this.updateGroup({
					joinOption: this.group.joinNeedAudit ? JoinOptionTypes['需要验证'] : JoinOptionTypes[
						'自由加入，直播群固定为该值'],
					inviteOption: this.group.joinNeedAudit ? inviteOptionTypes['需要群主/群管理员验证'] : inviteOptionTypes[
						'无需审批直接邀请进群'],
				})
			},
			changeMemberCanAudit() {
				this.updateGroup({
					groupCustomField: [{
						key: "memberCanAudit",
						value: JSON.stringify(this.group.memberCanAudit)
					}]
				})
			},
			changeAddFriend() {
				this.updateGroup({
					groupCustomField: [{
						key: "canAddFriend",
						value: JSON.stringify(!this.group.disabledAddFriend)
					}]
				})

			},
			changeMuteAllMembers() {
				this.updateGroup({
					muteAllMembers: this.group.muteAllMembers
				})
			},
			clickMuteAllMembers() {
				uni.navigateTo({
					url: `/pages/address/views/group/views/group-settings/views/manager/views/mute/index?groupID=${this.groupID}`
				})
			},
			clickManager() {
				uni.navigateTo({
					url: `/pages/address/views/group/views/group-settings/views/manager/views/manager/index?groupID=${this.groupID}`
				})
			},
			clickChangeOwner() {
				uni.navigateTo({
					url: `/pages/address/views/group/views/group-settings/views/manager/views/changeOwner/index?groupID=${this.groupID}`
				})
			},
			clickDismissGroup() {
				this.showConfirmModal = true
			},
			confirmConfirmModal() {

				//解散群组前,先发送一条解散群组的自定义消息通知群聊

				let to = this.groupID;


				let payload = {
					data: "", 
					description: 'group_delete', 
					extension: 'group_delete'
				}


				let sendMessage = uni.$chatKit?.chat?.createCustomMessage({
					to:to,
					conversationType:uni.$chatKit.TUIChatEngine.TYPES.CONV_GROUP,
					payload:payload
				})


				uni.$chatKit?.chat?.sendMessage(sendMessage)
				.then( (res) => {
					
					console.log("=======解散群组通知已发送")

					uni.$chatKit?.chat?.dismissGroup(this.groupID).then(result => {
						uni.switchTab({
							url:'/pages/home/index'
						})
					})

				})
				.catch( (error) => {
					Toast({
						message: error?.message,
						type: TOAST_TYPE.ERROR,
					});
				} )

				
			},
		}
	};
</script>
<style scoped lang="scss">
	.manager-page {
		background-color: $colorF5;

		.option {
			background-color: $colorF;

			.right {
				display: flex;
				align-items: center;
				font-size: 32rpx;
				color: $grayFont;
			}
		}

		.padding {
			background-color: $colorF;
			flex: 1;
		}
	}
	.w600 {
		width: 600rpx;
	}
</style>