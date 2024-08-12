<template>
	<ql-page class="mute-page">
		<u-navbar placeholder border autoBack :title="$tc('禁言管理')" @clickLeft="BackPage"></u-navbar>
		<view class="owner">
			<view class="pd-lr-24 title">{{$tc('群主')}}</view>
			<infoOption :info="owner" class="info-option">
				<!-- <u-switch slot="tr" v-model="group.muteAllMembers" @change="changeMuteAllMembers" /> -->
			</infoOption>
		</view>
		<view class="member">
			<view class="h100 flex-between pd-lr-24 title" @click="clickAddMute">
				<view class="left">{{$tc('添加禁言成员')}}</view>
				<view class="right">
					<imageIcon name="an_jty" class="ml-10" size="20" />
				</view>
			</view>
			<scroll-view v-if="memberList.length > 0" scroll-y="true" class="list">
				<infoOption v-for="member in memberList" :key="member.userID" :info="member" class="info-option">
					<button slot="tr" class="text-btn btn-relieve" @click="clickRelieve(member)">{{$tc('解除')}}</button>
				</infoOption>
			</scroll-view>
			<noData v-else :text="$tc('暂无禁言成员')" image="tb_cjql" />
		</view>

		<confirmModal :show.sync="showConfirmModal" :title="$tc('解除禁言')"
			:content="`${$tc('确认解除成员')}${currentMember.nick}${$tc('的禁言吗？')}`" @confirm="confirmConfirmModal" />
	</ql-page>
</template>

<script>
	import imageIcon from '@/components/image-icon'
	import infoOption from '@/components/info-option'
	import confirmModal from '@/components/confirm-modal'
	import noData from '@/components/noData'
	export default {
		components: {
			infoOption,
			imageIcon,
			confirmModal,
			noData
		},
		data() {
			return {
				groupID: '',
				showConfirmModal: false,
				timestamp: 0,
				owner: {},
				memberList: [],
				memberListLength: 0,
				currentMember: {},
				group: {},
			};
		},
		onLoad(opt) {
			let {
				groupID
			} = opt
			this.groupID = groupID
		},
		onShow() {
			this.getGroup()
		},
		methods: {
			getGroup() {
				uni.$chatKit?.chat?.getGroupProfile({
					groupID: this.groupID
				}).then(result => {
					this.group = result.data.group
					this.getGroupMember()
				})
			},
			getGroupMember() {
				uni.$chatKit?.chat?.getGroupMemberList({
					groupID: this.groupID,
					offset: this.memberListLength,
					count: 1000
				}).then(result => {
					this.timestamp = +((+new Date()).toString().substring(0, 10))
					this.memberList = [
						...(this.memberListLength ? this.memberList : []),
						...result.data.memberList.filter(member => {
							if (member.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER) {
								this.owner = member
								return false
							} else {
								return member.muteUntil > this.timestamp
							}
						})
					]
					console.log('memberList...', this.memberList)
					this.memberListLength += result.data.memberList.length

					if (this.memberListLength < this.group.memberCount) {
						this.getGroupMember()
					}
				})
			},
			changeMuteAllMembers() {
				const newParams = {
					groupID: this.groupID,
					muteAllMembers: this.group.muteAllMembers,
				}
				uni.$chatKit?.chat?.updateGroupProfile(newParams).then(result => {
					this.getGroup()
				})
			},
			clickAddMute() {
				this.memberListLength = 0
				uni.navigateTo({
					url: `/pages/address/views/group/views/group-settings/views/manager/views/mute/views/addMute/index?groupID=${this.groupID}`
				})
			},
			clickRelieve(member) {
				this.currentMember = member
				this.showConfirmModal = true
			},
			forbidSendMsg() {
				let list = []
				list.push(this.currentMember.userID)
				// let idList = JSON.stringify(list)
				// console.log('idList...',idList);
				this.$http.chat_group_member.forbid_send_msg({
					groupId: this.groupID,
					list: list,
					muteTime: 0,
				}).then(res => {
					console.log('回调给后台',res);
				}).catch(err => {
					console.log('回调给后台失败', err);
				})
			},
			confirmConfirmModal() {
				console.log('this.currentMember.userID',this.currentMember.userID);
				const params = {
					groupID: this.groupID,
					userID: this.currentMember.userID,
					muteTime: 0
				}
				uni.$chatKit?.chat?.setGroupMemberMuteTime(params).then(result => {
					this.showConfirmModal = false
					this.memberListLength = 0
					// this.getGroupMember()
					const list = this.memberList.filter(item => item.userID != this.currentMember.userID)
					this.memberList = list
					this.forbidSendMsg()
				})
			}
		}
	};
</script>
<style scoped lang="scss">
	.mute-page {
		height: 100vh;
		background-color: $colorF5;

		.owner {
			margin-bottom: 20rpx;
			background-color: $colorF;

			.title {
				padding-top: 20rpx;
				color: $grayFont;
			}

			.info-option {
				height: 132rpx;
			}
		}

		.member {
			flex: 1;
			background-color: $colorF;
			display: flex;
			overflow: hidden;
			flex-direction: column;

			.title {
				background-color: $colorF;

				.left {
					margin-right: 30rpx;
				}

				.right {
					flex: 1;
					display: flex;
					flex-direction: row-reverse;
					align-items: center;
					color: $grayFont;
					overflow: hidden;
				}
			}

			.list {
				flex: 1;
				overflow: scroll;
				background-color: #fff;

				.info-option {
					height: 144rpx;
				}

				.btn-relieve {
					padding-right: 0rpx;
					font-size: 32rpx;
				}
			}
		}

	}
</style>