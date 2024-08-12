<template>
	<ql-page class="notification-page">
		<u-navbar placeholder border autoBack :title="$tc('群公告')" @clickLeft="BackPage">
			<imageIcon v-if="isOwner || isAdmin" slot="right" name="tb_bj" @click="clickTbBj" />
		</u-navbar>
		<infoOption :info="group" :type="infoOptionType" :headSize="110" :blText="isOwner ? $tc('群主') : $tc('管理员')"
			class="mb-10 info-option" @click="clickInfoOption" />
		<view class="content">{{ group.notification || '-' }}</view>
		<view class="flex-center bottom-content" v-if="group.notification">
			<btn v-if="isOwner || isAdmin" :text="$tc('删除')" btnType="error" @click="clickDelete" />
			<view v-else class="tip">{{$tc('仅群主及管理员可编辑')}}</view>
		</view>

		<confirmModal :show.sync="showConfirmModal" confirmText="删除" content="确定清空群公告？"
			@confirm="confirmConfirmModal" />
	</ql-page>
</template>

<script>
	import btn from '@/components/btn'
	import infoOption from '@/components/info-option'
	import imageIcon from '@/components/image-icon'
	import confirmModal from '@/components/confirm-modal/index'
	import { dateShow } from '@/utils/filter.js'
	export default {
		components: {
			infoOption,
			btn,
			imageIcon,
			confirmModal
		},
		data() {
			return {
				groupID: '',
				infoOptionType: uni.$chatKit.TUIChatEngine.TYPES.CONV_GROUP,
				showConfirmModal: false,
				group: {
					selfInfo: {}
				}
			};
		},
		computed: {
			isOwner() {
				return this.group.selfInfo.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER
			},
			isAdmin() {
				return this.group.selfInfo.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN
			},
		},
		onLoad(opt) {
			this.groupID = opt.groupID
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
					// this.group.lastInfoTime = dateShow(this.group.lastInfoTime)
					// this.group.name = this.group.lastMessage.nick
				})
			},
			clickTbBj() {
				uni.navigateTo({
					url: `/pages/address/views/group/views/group-settings/views/notification/views/editNotification/index?groupID=${this.groupID}`
				})
			},
			clickDelete() {
				this.showConfirmModal = true
			},
			clickInfoOption() {
			  if (this.isOwner) {
			    uni.navigateTo({
					  	url: `/pages/address/views/group/views/group-settings/views/avatarName/index?groupID=${this.groupID}`
					  })
			  }
			},
			confirmConfirmModal() {
				const params = {
					groupID: this.groupID,
					notification: '',
				}

				uni.$chatKit?.chat?.updateGroupProfile(params).then(result => {
					this.showConfirmModal = false
				})
			}
		}
	};
</script>
<style scoped lang="scss">
	.notification-page {
		.info-option {
			height: 150rpx;
		}

		.content {
			padding: 30rpx;
			font-size: 30rpx;
			background: $colorF;
		}

		.bottom-content {
			flex: 1;

			.tip {
				font-size: 28rpx;
				color: $grayFont;
			}
		}
	}
</style>