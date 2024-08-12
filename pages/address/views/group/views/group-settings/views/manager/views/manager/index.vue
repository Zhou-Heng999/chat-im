<template>
	<ql-page class="manager-page">
		<u-navbar placeholder border autoBack :title="$tc('管理员')" @clickLeft="BackPage"></u-navbar>
		<view class="owner">
			<view class="pd-lr-24 title">{{$tc('群主')}}</view>
			<infoOption :info="owner" class="info-option" />
		</view>
		<view class="admin">
			<view class="pd-tb-20 pd-lr-24 title">{{$tc('群管理员')}}（{{adminList.length}}/10）</view>
			<scroll-view v-if="adminList.length > 0" scroll-y="true" class="list">
				<infoOption v-for="admin in adminList" :key="admin.userID" :info="admin" class="info-option">
					<button slot="tr" class="text-btn btn-remove" @click="clickRemove(admin)">{{$tc('移除')}}</button>
				</infoOption>
			</scroll-view>
			<noData v-else :text="$tc('暂无管理员')" image="tb_cjql" />
		</view>
		<button class="pd-lr-30 btn-add-admin" @click="clickAddAdmin">
			<view class="flex-center mr-30 btn-icon">
				<imageIcon name="tb_jia1" :size="80" class="flex-center icon-btn" />
			</view>
			{{$tc('添加管理员')}}
		</button>

		<confirmModal :show.sync="showConfirmModal" :title="$tc('移除管理员')"
			:content="`${$tc('确认移除管理员')} ${currentAdmin.nick} ${$tc('吗？')}`" @confirm="confirmConfirmModal" />
	</ql-page>
</template>

<script>
	import infoOption from '@/components/info-option'
	import confirmModal from '@/components/confirm-modal'
	import imageIcon from '@/components/image-icon'
	import noData from '@/components/noData'
	export default {
		components: {
			infoOption,
			confirmModal,
			imageIcon,
			noData
		},
		data() {
			return {
				groupID: '',
				owner: {},
				memberListLength: 0,
				showConfirmModal: false,
				adminList: [],
				currentAdmin: {},
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
			console.log('123123 ======')
		},
		methods: {
    	getGroup() {
    	  uni.$chatKit?.chat?.getGroupProfile({ groupID: this.groupID }).then(result => {
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
					const adminList = []
					result.data.memberList.forEach(member => {
						if (member.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN) {
							console.log(member)
							adminList.push(member)
						} else if (member.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER) {
							this.owner = member
						}
					})
          this.adminList = [...(this.memberListLength ? this.adminList : []), ...adminList];
          this.memberListLength += result.data.memberList.length
          if (this.memberListLength < this.memberCount) {
            this.getGroupMember()
          }
				})
			},
			clickRemove(admin) {
				this.currentAdmin = admin
				this.showConfirmModal = true
			},
			confirmConfirmModal() {
				const params = {
					groupID: this.groupID,
					userID: this.currentAdmin.userID,
					role: uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_MEMBER
				}
				uni.$chatKit.chat.setGroupMemberRole(params).then(result => {
					this.showConfirmModal = false
      		this.memberListLength = 0
					this.getGroupMember()
				})
			},
			clickAddAdmin() {
				if (this.adminList.length >= 10) {
					uni.showToast({
						title: this.$tc('管理员人数已达上限'),
						icon: 'none'
					})
					// this.$message({ message: '管理员人数已达上限' })
				} else {
					this.memberListLength = 0
					uni.navigateTo({
						url: `/pages/address/views/group/views/group-settings/views/manager/views/manager/views/addAdmin/index?groupID=${this.groupID}&existCount=${this.adminList.length}`
					})
				}
			},
		}
	};
</script>
<style scoped lang="scss">
	.manager-page {
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

		.admin {
			flex: 1;
			background-color: $colorF;
			display: flex;
			overflow: hidden;
			flex-direction: column;

			.title {
				color: $grayFont;
			}

			.list {
				flex: 1;
				overflow: scroll;
				background-color: #fff;

				.info-option {
					height: 144rpx;
				}

				.btn-remove {
					padding-right: 0rpx;
					font-size: 32rpx;
				}
			}
		}

		.btn-add-admin {
			display: flex;
			align-items: center;
			width: 100%;
			height: 144rpx;
			background-color: #fff;
			font-size: 32rpx;

			&:after {
				border: 0px;
			}

			.btn-icon {
				width: 96rpx;
				height: 96rpx;
			}
		}
	}
</style>