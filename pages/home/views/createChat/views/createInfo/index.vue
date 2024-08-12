<template>
	<ql-page ref="qlPage" class="pd-40 create-info-page">
		<u-navbar placeholder border autoBack :title="$tc('创建聊天')" @clickLeft="BackPage" ></u-navbar>		
		<view class="head-image flex-center">
			<imageIcon  width="180rpx" height="180rpx" :src="groupInfo.avatar?groupInfo.avatar:'https://web.sdk.qcloud.com/im/assets/images/Public.svg'" class="has-avatar-image" @click="showUpdateImagePopup = true" />
			<!-- <view v-else class="not-avatar-image" @click="showUpdateImagePopup = true">
				<imageIcon width="90rpx" height="90rpx" class="image-tb_qldr" :src="`/static/images/tb_qldr.png`"/>
			</view> -->
			<imageIcon width="60rpx" height="60rpx" :src="`/static/images/tb_xbxz.png`" class="badge" @click="showUpdateImagePopup = true" />
		</view>
		<view class="title">{{$tc('群聊名称')}}</view>
		<u--form
			labelPosition="left"
			:model="groupInfo"
			:rules="rules"
			ref="uForm"
			class="group-form"
		>
			<u-form-item prop="name" >
				<u--input
					v-model="groupInfo.name"
					border="none"
					class="control-input"
				/>
			</u-form-item>
		</u--form>
		<view class="is-pinned-content">
			<view class="title">{{$tc('置顶群聊')}}</view>
			<view class="content">{{$tc('群聊创建成功后，开启群聊置顶状态')}}</view>
			<view class="control">
				<u-switch v-model="groupInfo.isPinned" />
			</view>
		</view>
		<view class="flex-center btn-content">
			<btn :loading="loading" :disabled='loading' :text="$tc('完成')" class="btn-complete" @click="clickComplete" />
		</view>
		<updateImagePopup :show.sync="showUpdateImagePopup" @change="changeUpdateImagePopup" @close="showUpdateImagePopup=false"/>
		
		<!-- <u-loading-page :loading="loading" loadingText="" loadingMode="spinner" iconSize ="32" bg-color="rgba(0,0,0, .5)"></u-loading-page> -->
	</ql-page>
</template>

<script>
import btn from '@/components/btn'
import updateImagePopup from '@/components/update-image-popup'
import { config } from '@/const'
import { ListMixin } from '@/mixin/list';
import store from "@/store/index.js"
export default {
	components: { btn, updateImagePopup },
	data() {
		return {
			userList: [],
			showUpdateImagePopup: false,
			groupTypes: {
				['好友工作群，默认']: uni.$chatKit.TUIChatEngine.TYPES.GRP_WORK,
				['陌生人社交群']: uni.$chatKit.TUIChatEngine.TYPES.GRP_PUBLIC,
				['临时会议群']: uni.$chatKit.TUIChatEngine.TYPES.GRP_MEETING,
				['直播群']: uni.$chatKit.TUIChatEngine.TYPES.GRP_AVCHATROOM,
				['社群']: uni.$chatKit.TUIChatEngine.TYPES.GRP_COMMUNITY,
			},
			groupInfo: {
				name: '',
				avatar: '',
				isPinned: false,
			},
			rules: {
				name: [
					{
						required: true,
						message: this.$tc('请输入群聊名称'),
						trigger: ['blur', 'change']
					}
				]
			},
			loading: false
		};
	},
	onShow() {
		this.userList = uni.getStorageSync('create_chat_user_list')
	},
	methods: {
		changeUpdateImagePopup(avatar) {
			this.showUpdateImagePopup = false
			this.groupInfo.avatar = avatar
		},
		async clickComplete() {
			this.loading = true
			const groupID = config.channel + '#' + +new Date()
			try {
				let groupInfoAvatar=this.groupInfo.avatar||'https://web.sdk.qcloud.com/im/assets/images/Public.svg'
				const resutlValidate = await this.$refs.uForm.validate()
				this.groupInfo.name=ListMixin.methods.maskSensitiveInfo(this.groupInfo.name,store.state.sensitiveData)
				if (resutlValidate) {
					const params = {
						groupID,
						name: this.groupInfo.name,
						type: this.groupTypes['陌生人社交群'],
						avatar: groupInfoAvatar,
						inviteOption: uni.$chatKit.TUIChatEngine.TYPES.INVITE_OPTIONS_FREE_ACCESS,
						joinOption: uni.$chatKit.TUIChatEngine.TYPES.JOIN_OPTIONS_FREE_ACCESS,
						memberList: this.userList.map(user => ({
							userID: user.userID,
							role: user.role
						})),
						isSupportTopic: false,
					}
					const resultCreateGroup = await uni.$chatKit.chat.createGroup(params)
					console.log('resultCreateGroup...', resultCreateGroup)

					if (this.groupInfo.isPinned) {
						// 通过群ID获取会话
						const rseultGetConversationProfile = await uni.$chatKit?.chat?.getConversationProfile('GROUP' + groupID)

						// 通过会话ID置顶此会话
						const resultPinConversation = await uni.$chatKit?.chat?.pinConversation({
							isPinned: this.groupInfo.isPinned,
							conversationID: rseultGetConversationProfile.data.conversation.conversationID
						})
					}

					const resultInitGroupAttributes = await uni.$chatKit?.chat?.initGroupAttributes({
					  groupID,
					  groupAttributes: { key1: 'false' }
					})
					
					this.loading = false
					uni.removeStorageSync('create_chat_user_list');
					this.toastText('创建成功', 'success', ()=>{
						uni.switchTab({
							url:`/pages/home/index`
						})
					})
					
				}
					
			} catch (error) {
				console.log('error =', error)
				this.loading = false
			}
		}
	}
};
</script>
<style scoped lang="scss">
.create-info-page {
background-color: $colorF;
.head-image {
	margin: 60rpx 0rpx;
	height: 180rpx;
	position: relative;
	.has-avatar-image {
		margin: auto;
		height: 180rpx;
		width: 180rpx;
		border-radius: 50%;
		background-color: rgba(204, 204, 204, 1);
		overflow: hidden;
	}
	.not-avatar-image {
		margin: auto;
		height: 180rpx;
		width: 180rpx;
		border-radius: 50%;
		background-color: rgba(204, 204, 204, 1);
		position: relative;
		.image-tb_qldr {
			position: absolute;
			left: calc(50% - 45rpx);
			top: calc(50% - 45rpx);
		}
	}
	.badge {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		position: absolute;
		left: calc(50% + 30rpx);
		bottom: 0rpx;
	}
}
.title {
	font-size: 30rpx;
}
.group-form {
	.control-input {
		height: 110rpx;
	  background-color: rgba(245, 245, 245, 1);
	  border-radius: 20rpx;
		::v-deep {
			input {
				padding: 0rpx 40rpx;
			}
		}
	}
}

.is-pinned-content {
	margin-top: 20rpx;
	padding: 20rpx 30rpx;
	border-radius: 20rpx;
	background-color: #f5f5f5;
	.title {
		height: 60rpx;
		line-height: 60rpx;
	}
	.content {
		height: 30rpx;
		line-height: 30rpx;
		font-size: 30rpx;
		color: $grayFont;
	}
	.control {
		margin-top: 30rpx;
		display: flex;
		flex-direction: row-reverse;
	}
}
.btn-content {
	flex: 1;
	.btn-complete {
		margin: 0rpx auto 140rpx auto;
	}
}
}
</style>