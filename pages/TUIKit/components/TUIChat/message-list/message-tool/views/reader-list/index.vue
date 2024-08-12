<template>
	<ql-page>
		<u-navbar placeholder border autoBack :title="$tc('已读人列表')" @clickLeft="BackPage"></u-navbar>

		<scroll-view scroll-y="true" style="height: 94vh">
			<view class="pd-tb-20 pd-lr-20">
				<view class="list">
					<view class="item flex mb-40" v-for="item in readPeopleList" :key="item.userID">
						<avatarModal :info='item' class="ml-10 mr-30"></avatarModal>
						<view class="content">
							<view class="title">{{item.nick}}</view>
							<view class="subtitle">
								<imageIcon width="36rpx" height="32rpx" src="/static/images/g_1.png"></imageIcon>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</ql-page>
</template>

<script>
	import TUIChatEngine, {
		TUIStore,
		StoreName,
		TUITranslateService,
		IMessageModel,
	} from "@tencentcloud/chat-uikit-engine";

	import {
		ref,
		watchEffect,
		computed,
		getCurrentInstance
	} from "../../../../../../adapter-vue";
	export default {
		data() {
			return {
				readPeopleList: [],
			}
		},
		onLoad(options) {
			const eventChannel = this.getOpenerEventChannel();
			// 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
			const that = this
			eventChannel.on('acceptDataFromOpenerPage', function(data) {
				console.log('acceptDataFromOpenerPage...', data)
				that.getReadPeople(data.message, data.currentConversation)
			})
		},
		onShow() {},
		methods: {
			getReadPeople(message, currentConversation) {
				TUIChatEngine.chat.getGroupMessageReadMemberList({
					message: message,
					filter: 0,
					cursor: '',
					count: 100
				}).then(imResponse => {
					console.log('getGroupMessageReadMemberList...', imResponse)
					const {
						isCompleted,
						cursor,
						messageID,
						readUserIDList
					} = imResponse.data;
					TUIChatEngine.chat.getGroupMemberProfile({
						groupID: currentConversation?.groupProfile?.groupID,
						userIDList: readUserIDList
					}).then(res => {
						console.log('res.data.memberList', res.data.memberList)
						this.readPeopleList = res.data.memberList
					})
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.list {
		.item {
			.content {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: space-around;
			}
		}
	}
</style>