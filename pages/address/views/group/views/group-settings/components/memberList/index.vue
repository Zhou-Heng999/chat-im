<template>
	<view class="member-list">
		<view class="flex-between head">
			<view class="left">{{$tc('群成员')}}</view>
			<view class="right" @click="clickAnJty" v-if="group.memberCount">
				{{$tc('共')}}{{ ` ${group.memberCount} ` }}{{$tc('人')}}
				<imageIcon name="an_jty" size="20" />
			</view>
		</view>
		<view class="list">
			<view v-for="member in showMemberList" :key="member.userID" class="constraint">
				<view class="member" @click="clickMember(member)">
					<avatar :info="member" w="96" h="96" class="avatar" :badgeBottom="0" :badgeRight="0">
						<imageIcon v-if="member.roleIcon" slot="badge" :name="member.roleIcon" :size="30" />
					</avatar>
					<view class="ellipsis1 nick">{{ member.remark||member.nick }}</view>
				</view>
			</view>
			<view v-if="showJia&&group.memberCount" class="constraint" @click="clickJia1">
				<imageIcon name="tb_jia1" :size="96" class="flex-center icon-btn" />
				<view class="ellipsis1 nick"></view>
			</view>
			<view v-if="showJian&&group.memberCount" class="constraint" @click="clickJian1">
				<imageIcon name="tb_jian1" :size="96" class="flex-center icon-btn" />
				<view class="ellipsis1 nick"></view>
			</view>
		</view>

		<button v-if="memberList.length > 8" class="text-btn btn" @click="clickAnJty">{{$tc('查看更多群成员')}}
			<imageIcon name="an_jty" size="20" />
		</button>
	</view>
</template>

<script>
	import avatar from '@/components/avatar'
	import imageIcon from '@/components/image-icon'
	export default {
		components: {
			imageIcon,
			avatar
		},
		props: {
			group: {
				type: Object,
				required: true,
			},
			viewDetail: {
				type: Boolean|undefined,
				required: true,
			},
			showJia: {
				type: Boolean,
				required: false,
				default: true,
			},
			showJian: {
				type: Boolean,
				required: false,
				default: true,
			},
			memberList: {
				type: Array,
				required: true,
				default: [],
			}
		},
		data() {
			return {
				// memberList: [],
			}
		},
		computed: {
			showMemberList() {
				const ownerList = []
				const adminList = []
				const membermemberList = []
				this.memberList.forEach(member => {
					if (member.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER) {
						ownerList.push({
							...member,
							roleIcon: 'tb_qz'
						})
					} else if (member.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN) {
						adminList.push({
							...member,
							roleIcon: 'tb_gly'
						})
					} else {
						membermemberList.push(member)
					}
				})
				return [...ownerList, ...adminList, ...membermemberList].filter((_, index) => index >= 0 && index <= 7)
			}
		},
		methods: {
			// getMemberList() {
			// 	uni.$chatKit?.chat?.getGroupMemberList({
			// 		groupID: this.group.groupID,
			// 		offset: 0,
			// 	}).then(result => {
			// 		console.log('mebmers.result =', result.data)
			// 		let list = result.data.memberList;
			// 		uni.$chatKit?.chat?.getFriendList().then(res=>{
			// 			let friendlist=res.data
			// 			list.forEach(item=>{
			// 				let target = friendlist.find(member=>member.userID==item.userID)
			// 				if(target){
			// 					item.remark = target.remark
			// 				}
			// 			})
			// 			this.memberList = list
			// 		})
			// 		// this.memberList = result.data.memberList
			// 	})
			// },
			clickMember(member) {
				if (this.viewDetail) {
					const userID = this.$setUserID(member.userID)
					uni.navigateTo({
						url: `/pages/address/views/user/index?userID=${userID}`
					})
				}
			},
			clickAnJty() {
				let groupID = this.$setUserID(this.group.groupID)
				uni.navigateTo({
					url: `/pages/address/views/group/views/group-settings/views/allMember/index?groupID=${groupID}&viewDetail=${this.viewDetail}`
				})
			},
			clickJia1() {
				let groupID = this.$setUserID(this.group.groupID)
				let allUserID=this.memberList.map(item=>item.userID)
				getApp().globalData.groupUserID=allUserID
				uni.navigateTo({
					url: `/pages/address/views/group/views/group-settings/views/addMember/index?groupID=${groupID}&memberCount=${this.group.memberCount}`,
				})
			},
			clickJian1() {
				let groupID = this.$setUserID(this.group.groupID)
				uni.navigateTo({
					url: `/pages/address/views/group/views/group-settings/views/removeMember/index?groupID=${groupID}`
				})
			},
		},
	}
</script>

<style scoped lang="scss">
	.nick {
		height: 48rpx;
		line-height: 48rpx;
		text-align: center;
	}

	.member-list {
		padding: 10rpx 30rpx 10rpx 40rpx;
		background-color: $colorF;

		.head {
			height: 48rpx;

			.left {
				font-size: 32rpx;
			}

			.right {
				display: flex;
				align-items: center;
				font-size: 28rpx;
				color: rgba(173, 181, 189, 1);
			}
		}

		.list {
			display: flex;
			flex-wrap: wrap;

			.constraint {
				// margin-right: calc(25% - 120rpx);
				margin-right: calc(25% - 121rpx);
				width: 96rpx;

				&:nth-child(5n + 0) {
					margin-right: 0rpx;
				}

				.member {
					margin-top: 20rpx;

					.avatar {
						margin: 0rpx auto 6rpx auto;

						.role {
							right: 0rpx;
							bottom: 0rpx;
						}
					}


					.role {
						right: 0rpx;
						bottom: 0rpx;
					}
				}

				.icon-btn {
					height: 96rpx;
					margin-top: 30rpx;
				}
			}
		}

		.btn {
			margin-top: 20rpx;
			height: 48rpx;
			font-size: 30rpx;
			color: $grayFont;
		}
	}
</style>