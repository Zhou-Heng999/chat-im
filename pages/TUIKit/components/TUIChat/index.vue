<template>
	<!-- @touchmove.stop.prevent='onPageMove' -->
	<div class="chat pos-relative" >


		<div :class="['TUI-chat', !isPC && 'TUI-chat-h5']"  >
			<div v-if="!currentConversationID" :class="['TUI-chat-default', !isPC && 'TUI-chat-h5-default']">
				<slot></slot>
			</div>
			<div v-if="currentConversationID" :class="['TUI-chat', !isPC && 'TUI-chat-h5']"  >
				<!-- <ChatHeader :class="[
            'TUI-chat-header',
            !isPC && 'TUI-chat-H5-header',
            isUniFrameWork && 'TUI-chat-uniapp-header',
          ]" @closeChat="closeChat"></ChatHeader> -->
				<Forward v-if="isShowForwardPanel" @closeForwardPanel='closeForwardPanel' ref="forwardModule"></Forward>
				<!-- 头部信息 -->
				<u-navbar v-if="!isShowEdit" class="navbar" placeholder border @leftClick='leftClick'
					@click.native="closeMessageTool">
					<view slot="center" class="flex-col-center" style="width: 60%;overflow: hidden;">
						<view v-if="!isNetWorkError" class="font-blod ellipsis1">
							{{`${navTitle }${conversationInfo&&conversationInfo.type!='C2C'&&memberCount?`(${memberCount})`:''}`}}
						</view>
						<view v-else class="font-blod ellipsis1">
							{{$tc("正在连接")}}....
						</view>
						<view v-if="userID && userStatus" class="font-24">
							<text v-if="userStatus == 1" class="green-color">{{$tc('在线')}}</text>
							<text v-else class="gray-color2">{{$tc('离线')}}</text>
						</view>
					</view>
					<view slot="left" class="flex-align">
						<view class="mr-20 flex-center">
							<imageIcon width="18rpx" height="35rpx" name="back"></imageIcon>
						</view>
						<text v-if="totalUnreadCount!=0" class="no-read-box flex-center">{{totalUnreadCount}}</text>
					</view>

					<imageIcon v-if="isExistGroup" slot="right" width="54rpx" height="54rpx" name="tb_qt"
						@click="openModal"></imageIcon>
				</u-navbar>

				<view class="max-width">

					<div class='edit-chat flex-around safe-bottom' v-if='isShowEdit'>
						<imageIcon class="close-edit" @click="handChangeInput(false)" width="30rpx" height="30rpx"
							name="close"></imageIcon>
						<view class="flex-column flex-center" @click="onClickEdit(item)" v-for="item in editList">

							<view class="flex-center mb-10 url-box">
								<image style="width: 40rpx;height: 40rpx;" :src="item.url"></image>
							</view>
							<!-- <text class="font-20" >{{item.name}}</text> -->
						</view>

					</div>
				</view>
				<!-- <view class="" @click="closeToolbarShow" > -->
				<MessageList ref="msgRef" :class="['TUI-chat-message-list', !isPC && 'TUI-chat-h5-message-list']"
					:isGroup="isGroup" :groupID="groupID"
					:groupNotification="currentGroup ? currentGroup.notification : ''" @handleEditor="handleEditor"
					@handChangeInput='handChangeInput' @closeToolbar='closeToolbarShow' :isShowEdit='isShowEdit'
					@updateMemberCount="updateMemberCount" @updateGroupCout="updateGroupCout">


				</MessageList>


				<div v-if="isMutedAll" class="mute-input">{{$tc('全员禁言中')}}</div>
				<div v-else-if="isMuted" class="mute-input">{{$tc('您已被禁言')}}</div>
				<!-- <MessageInput v-else :class="[
				'TUI-chat-message-input',
				!isPC && 'TUI-chat-h5-message-input',
				isUniFrameWork && 'TUI-chat-uni-message-input',
				isWeChat && 'TUI-chat-wx-message-input',
			  ]" ref="messageInputRef" @sendFile='sendFile' :currentConversation='conversationInfo' :isGroup='conversationInfo.type!="C2C"' :isMuted="false"
					:muteText="$tc(TUITranslateService.t('TUIChat.您已被管理员禁言'))"
					:placeholder="$tc(TUITranslateService.t('TUIChat.请输入消息'))"
					@handleToolbarListShow="handleToolbarListShow" 
					@closeMessageTool="closeMessageTool"></MessageInput> -->

				<!-- @sendMessage='closeToolbarShow' -->
				<!-- </view> -->
				<!-- <view class="max-width" @click.stop='()=>{}' > -->


				<!-- </view> -->

				<!-- 兼容 uni 打包支付宝小程序 v-show 无效问题 -->

				<MessageInputs v-else ref="messageInputRef" :conversation="conversationInfo"
					:placeholder="$tc(TUITranslateService.t('TUIChat.请输入消息'))" @sendFile='sendFile'
					@closeToolbar='closeToolbarShow' />


			</div>
			<!-- 群组管理 -->
			<!-- <div
        class="group-profile"
        v-if="isUniFrameWork && isGroup && groupManageExt"
        @click="handleGroup"
      >
        {{ groupManageExt.text }}
      </div> -->
		</div>
		<screenshot @submit='onFileSubmit' :title="$tc('发送附件')" :screenInfo='screenInfo' v-if="isFileShow"
			:isShow='isFileShow' @closeModal='isFileShow=false'></screenshot>
		<conversation v-if="isShowPeople" @closeModal='isShowPeople=false' @chooseSend='onShareMore'
			:isShow='isShowPeople'></conversation>
		<cardModal :info='cardInfo' v-if="isCardShow" :isShow='isCardShow' @closeModal='isCardShow=false'></cardModal>
	</div>
</template>
<script lang="ts" setup>
	import TUIChatEngine, {
		TUITranslateService,
		TUIConversationService,
		TUIStore,
		StoreName,
		IMessageModel,
		IConversationModel,
		TUIUserService,
		SendMessageParams,
		TUIChatService
	} from "@tencentcloud/chat-uikit-engine";
	import screenshot from "@/components/screenshot/index";
	import TUICore, { TUIConstants, ExtensionInfo, } from "@tencentcloud/tui-core";
	import { ref, onMounted, onUnmounted, nextTick, getCurrentInstance, computed } from "../../adapter-vue";
	import cardModal from '@/components/card/index'
	import conversation from '@/components/conversation/index.vue'
	import ChatHeader from "./chat-header/index.vue";
	import MessageList from "./message-list/index.vue";
	import MessageInput from "./message-input/index.vue";
	import MessageInputs from "./message-inputs/index.vue";
	import Forward from "./forward/index.vue";
	import { isPC, isWeChat, isUniFrameWork } from "../../utils/env";
	import { enableSampleTaskStatus } from "../../utils/enableSampleTaskStatus";
	import { Toast, TOAST_TYPE } from "../common/Toast/index";
	import TUIChatConfig from "./config";
	import { tc } from '@/utils/util'
	import TUIChat from "locales/zh_cn/TUIChat";
	// #ifdef H5
	// import { TUICallKit } from "@/components/TUICallKit"
	// #endif

	TUIUserService.switchMessageReadStatus(true);
	const emits = defineEmits(["closeChat"]);
	const isToolbarShow = ref<boolean>(!isUniFrameWork);
	const messageInputRef = ref();
	const currentConversationID = ref();
	const thisInstance = getCurrentInstance()?.proxy || getCurrentInstance();
	// 是否显示群组管理
	const isGroup = ref(false);
	const navTitle = ref('')
	const userID = ref('')
	const userStatus = ref('')
	const groupID = ref("");
	const currentGroup = ref({});
	const groupManageExt = ref<ExtensionInfo>(undefined);
	const isCardShow = ref(false)
	const cardInfo = ref(null)
	const isShowForwardPanel = ref(false);
	// 群标题设置
	const memberCount = ref(0)
	const conversationInfo = ref(null)
	const memberList = ref([])
	// 右侧更多
	const openModal = () => {
		if (isUniFrameWork && isGroup.value && groupManageExt.value) {
			handleGroup()
		} else {
			uni.navigateTo({
				url: `/pages/home/views/chatUser/index?userID=${thisInstance.$setUserID(conversationInfo.value.userProfile.userID)}`
			})
		}
		uni.$emit('stopAudioPlay')
	}
	const closeMessageTool = () => {
		uni.$emit('closeMessageTool', { show: false })
	}
	const isNetWorkError = computed(() => thisInstance.$store.state.isNetworkError)
	const isFileShow = ref(false)
	const screenInfo = ref(null)
	const sendFile = (e) => {
		let imgBlob = e.fileFun == 'sendVideoMessage' ? e.payload.file.tempFilePath : e.payload.file?.tempFilePaths[0]
		screenInfo.value = {
			imgBlob,
			info: e
		}
		onFileSubmit({
			text: '',
			screenInfo: screenInfo.value,
			quoteMessage: quoteMessage.value
		})
		// console.log('screenInfo...', screenInfo.value)
		// isFileShow.value = true
	}
	function onFileSubmit(e) {
		console.log('onFileSubmit', e)
		let { text, screenInfo, quoteMessage } = e
		let { fileFun, ...parames } = screenInfo.info
		let t = {
			txt: text,
			...quoteMessage
		}
		console.log('t', t)
		parames.cloudCustomData = JSON.stringify(t)
		// console.log('parames=====',parames)
		// return
		// return 
		closeToolbarShow()
		TUIStore.update(StoreName.CHAT, "quoteMessage", { message: undefined, type: "quote" });
		TUIChatService[`${fileFun}`](parames)
	}
	const isQuote = ref(false)
	const quoteMessage = ref(null)
	function onQuoteMessage(options) {
		isQuote.value = options?.message && options?.type === "quote" || false
		if (options?.message && options?.type === "quote") {
			console.log('options.message', options.message)
			let {
				message
			} = options
			let messageAbstract = [

			]
			let reply = {
				messageReply: {
					"messageAbstract": quoteContentText(message)._quoteContentText,
					"messageSender": message.nick,
					"messageID": message.ID,
					"messageType": quoteContentText(message)._type,
					"messageTime": message.time,
					"messageSequence": message.sequence,
					"version": 1
				}
			}

			console.log('messageReply', reply)
			quoteMessage.value = reply;
		} else {
			quoteMessage.value = {};
		}
	}


	function quoteContentText(quoteMessage) {
		let robj = {
			_quoteContentText: "",
			_type: -1
		}

		switch (quoteMessage.type) {
			case TUIChatEngine.TYPES.MSG_MERGER:
				robj._type = 0;
				robj._quoteContentText = '[聊天记录]'
				break;
			case TUIChatEngine.TYPES.MSG_TEXT:
				robj._type = 1;
				robj._quoteContentText = quoteMessage.payload?.text
				break;
			case TUIChatEngine.TYPES.MSG_IMAGE:
				robj._type = 3;
				robj._quoteContentText = '[图片]'
				break;
			case TUIChatEngine.TYPES.MSG_AUDIO:
				robj._type = 4;
				robj._quoteContentText = '[语音]'
				break;
			case TUIChatEngine.TYPES.MSG_VIDEO:
				robj._type = 5;
				robj._quoteContentText = '[视频]'
				break;
			case TUIChatEngine.TYPES.MSG_FILE:
				robj._type = 6;
				robj._quoteContentText = '[文件]'
				break;
			case TUIChatEngine.TYPES.MSG_CUSTOM:
				robj._type = 2;
				if (quoteMessage.payload.description == "business" && quoteMessage.payload.extension == "business") {
					robj._quoteContentText = "[个人名片]";
				}
				else {
					robj._quoteContentText = '[自定义]';
				}
				break;
			default:
				robj._quoteContentText = '[消息]'
				robj._type = -1;
				break;
		}
		return robj;
	}

	function onSingleForwardMessageIDUpdated(messageID : string) {
		if (typeof messageID !== 'undefined') {
			openForwardPanel();
		}
	}
	function openForwardPanel() : void {
		isShowForwardPanel.value = true;
	}
	function closeForwardPanel() {
		isShowForwardPanel.value = false;
	}
	uni.$on('updateRemark', (res) => {
		let { userID } = conversationInfo.value.userProfile
		TUIChatEngine.chat.getFriendList().then(res => {
			let list = res.data
			let info = list.find(item => item.userID == userID)
			navTitle.value = info?.remark || ''
		})
	})
	const sendCout = ref(0)
	uni.$on('onSendFile', (opt) => {
		if (sendCout.value == 0) {
			sendCout.value += 1
			console.log('onSendFile', opt)
		}
	})
	const isCheckMore = ref(false)
	let conversationList = ref([])
	const isShowPeople = ref(false)
	const openPeoPleList = () => {
		TUIChatEngine.chat.getConversationList().then(res => {
			let list = res.data.conversationList
			list.forEach(item => {
				item.isCheck = false
			})
			conversationList.value = list
			isShowPeople.value = true
		})
	}
	const onClickEdit = ({ type }) => {
		let allMsg = msgRef.value.getAllCheckMsg()
		if (allMsg.length == 0) {
			Toast({
				message: tc('请选择操作的消息'),
				type: TOAST_TYPE.ERROR,
			});
			return
		}
		if (type == 'share') {
			openPeoPleList()
		} else {
			onDeleList()

		}
	}
	// 批量删除
	const onDeleList = () => {
		let allMsg = msgRef.value.getAllCheckMsg()
		let allIDList = allMsg.map(item => {
			return { ID: item.ID, to: item[item.flow == 'in' ? 'from' : 'to'] }
		})
		let idsToRemove = allIDList.map(item => item.ID)
		// 判断条件不能删除
		let userData = uni.getStorageSync('userInfo')
		console.log('conversationInfo.value...', conversationInfo.value);
		if (conversationInfo.value.type == "GROUP") {

		} else {
			// let isAllMySelf=allMsg.every(item=>item.from==userData.userID)
			for (let i = 0; i < allMsg.length; i++) {

				let messageModel = TUIStore.getMessageModel(allMsg[i].ID);

				let to;

				if (messageModel.flow == "out") {
					to = messageModel.to;
				}
				else if (messageModel.flow == "in") {
					to = messageModel.from;
				}

				let data = {
					code: "delete_message",
					value: {
						idList: [messageModel.ID]
					},
				}

				let payload = {
					data: JSON.stringify(data),
					description: 'GM_ORDER',
					extension: 'GM_ORDER'
				}

				let sendMessage = TUIChatEngine.chat.createCustomMessage({
					to: to,
					conversationType: TUIChatEngine.TYPES.CONV_C2C,
					payload: payload
				})

				TUIChatEngine.chat.sendMessage(sendMessage)
					.then((res : any) => {

						messageModel.deleteMessage();

					})
					.catch((error : any) => {
						Toast({
							message: error?.message,
							type: TOAST_TYPE.ERROR,
						});
					})

			}
			handChangeInput(false)
		}



		// 群组的多选删除
		if (conversationInfo.value.type == "GROUP") {
			allMsg.forEach(async (item) => {
				let messageModel = TUIStore.getMessageModel(item.ID);
				await messageModel
					.revokeMessage()
					.then(() => {
						enableSampleTaskStatus('revokeMessage');
						handChangeInput(false)
					})
					.catch((error : any) => {
						// 调用异常时业务侧可以通过 promise.catch 捕获异常进行错误处理
						console.log('error.code...', error.code);
						if ((error.code = 20016)) {
							const message = tc("只能删除最近7天内的消息");
							Toast({
								message,
								type: TOAST_TYPE.ERROR,
							});
						}
						if ((error.code = 10007)) {
							const message = tc("操作权限不足");
							Toast({
								message,
								type: TOAST_TYPE.ERROR,
							});
						}
					});
			})
		}
		return
		// let userInfo=uni.getStorageSync('userInfo')
		// let user0=userInfo.userID
		// let user1=conversationInfo.value.userProfile.userID
		// let t={
		// 	list:idsToRemove,
		// 	user0,
		// 	user1
		// }
		// thisInstance.$http.app_user.delete_c2c_msg_both(t).then(res=>{
		// 	console.log('删除成功')
		// })
		console.log('allMsg', allMsg, allIDList)
		// return
		// 判断是否是管理员

		// let data = {
		//   code:"delete_message",
		//   value:{
		//     idList:idsToRemove
		//   },
		// }
		// let payload = {
		//   data: JSON.stringify(data), 
		//   description: 'GM_ORDER', 
		//   extension: 'GM_ORDER'
		// }
		TUIChatEngine.chat.deleteMessage(allMsg).then(res => {
			msgRef.value.updateList(idsToRemove)
		})
	}
	const isShowEdit = ref(false)
	const handChangeInput = (val) => {
		isShowEdit.value = val
		if (!val) {
			msgRef.value.clearSelect()
		}
	}
	const editList = [
		// { name: '合并转发', url: '/static/images/tb_zf_b.png', type: 'share' },
		{ name: '删除', url: '/static/images/tb_sc_b.png', type: 'dele' },
	]
	const uToastRef = ref(null)
	const msgRef = ref(null)
	const onShareMore = (list) => {
		isShowEdit.value = false
		console.log('回调，。。。', list);
		let typeList = {
			'TIMTextElem': 'text',
			'TIMSoundElem': '[语音]',
			'TIMImageElem': '[图片]',
			'TIMFileElem': '[文件]',
			'TIMVideoFileElem': '[视频]',
			'TIMRelayElem': '[聊天记录]',
			'TIMCustomElem': '[个人名片]',
		}
		let userInfo = uni.getStorageSync('userInfo')
		let title = groupID.value ? tc('群聊的聊天记录') : `${navTitle.value} ${tc('与')} ${userInfo.account}${tc('的聊天记录')}`
		let abstractList = []
		let allMsg = msgRef.value.getAllCheckMsg()

		allMsg.sort(function (a, b) {
			return a.time - b.time;
		});

		let cutList = allMsg.slice(-3)
		cutList.forEach((item, index) => {
			abstractList.push(`${item.nick}:${item.type == 'TIMTextElem' ? item._message.payload.text : typeList[item.type]}`)
		})
		list.forEach(async (item, index) => {
			let userID = item.type == 'C2C' ? item.userProfile.userID : item.groupProfile.groupID
			let mergerMessage = await TUIChatEngine.chat.createMergerMessage({
				to: userID,
				conversationType: TUIChatEngine.TYPES[`CONV_${item.type}`],
				payload: {
					messageList: allMsg,
					title: title,
					abstractList,
					compatibleText: '请升级IMSDK到v2.10.1或更高版本查看此消息'
				},
			});
			await TUIChatEngine.chat.sendMessage(mergerMessage).then(res => {
				if (index == list.length - 1) {
					isShowEdit.value = false
					isShowPeople.value = false
				}
			})
		})
		msgRef.value.clearSelect()
	}

	// currentGroup 删除成员后成员数量返回不准确
	const getGroup = (groupID) => {
		if (!groupID) return
		uni.$chatKit?.chat.getGroupProfile({ groupID: groupID }).then(res => {
			memberCount.value = res.data.group.memberCount
		})
	}

	const updateGroupCout = ({ Cmd, Args }) => {
		if (Cmd == 'delete_group_member') {
			memberCount.value = memberCount.value - Args.length
		} else if (Cmd == 'ban_all_group_member') {

		}
	}


	const onCurrentGroupMemberList = (list) => {
		memberList.value = list
	}
	function getMyInfo() {
		TUIChatEngine.chat.getGroupMemberProfile({
			groupID: conversationInfo.value.groupProfile.groupID,
			userIDList: [TUIChatEngine.userID]
		}).then(res => {
			const timestamp = +((+new Date()).toString().substring(0, 10))
			isMuted.value = res.data.memberList[0].muteUntil > timestamp
		})
	}
	const onCurrentGroup = (res) => {
		console.log('onCurrentGroup===',res)
		currentGroup.value = res
		if (conversationInfo.value?.type !== 'C2C' && conversationInfo.value?.conversationID == thisInstance.$store.state.nowConId) {
			navTitle.value = res?.name || ''
			memberCount.value = res.memberCount
			
			getMyInfo()
		}
	}
	const totalUnreadCount = computed(() => thisInstance.$store.state.totalUnreadCount > 99 ? 99 : thisInstance.$store.state.totalUnreadCount)

	function onWatchStore() {
		TUIStore.watch(StoreName.CONV, {
			currentConversation: onCurrentConversationHanlder,
		});

		TUIStore.watch(StoreName.CUSTOM, {
			singleForwardMessageID: onSingleForwardMessageIDUpdated
		});

		setTimeout(() => {
			TUIStore.watch(StoreName.GRP, {
				currentGroup: onCurrentGroup
			})
		}, 300)

	}


	function onCurrentConversationHanlder(conversation : IConversationModel) {
		if (currentConversationID.value === conversation?.conversationID) {
			return;
		}
		thisInstance.$store.commit('setConversation', conversation)
		if (conversation) {
			conversationInfo.value = conversation
			if (conversation.type == 'C2C') {
				navTitle.value = conversation?.remark || conversation?.userProfile?.nick

				if (conversation.userProfile && conversation.userProfile.userID) {
					userID.value = conversation.userProfile.userID
					uni.$chatKit?.chat.getUserStatus({ userIDList: [`${userID.value}`] }).then(res => {
						const { successUserList } = res.data
						userStatus.value = successUserList[0].statusType
					})
				}
			} else {
				navTitle.value = conversation?.groupProfile?.name || ''
			}
		}
		// TUIChat 每次切换会话，需要初始化 chatType;
		TUIChatConfig.setChatType(conversation?.type);
		// 由 TUICustomerServicePlugin 插件判断如果当前会话是客服会话，则设置 chatType 并激活会话。
		TUICore.callService({
			serviceName: TUIConstants.TUICustomerServicePlugin.SERVICE.NAME,
			method: TUIConstants.TUICustomerServicePlugin.SERVICE.METHOD.ACTIVE_CONVERSATION,
			params: { conversationID: conversation?.conversationID },
		});
		currentConversationID.value = conversation?.conversationID;
		isGroup.value = conversation?.type === TUIChatEngine.TYPES.CONV_GROUP;
		if (isUniFrameWork && isGroup.value && groupID.value !== conversation?.groupProfile?.groupID) {
			const extList = TUICore.getExtensionList(TUIConstants.TUIChat.EXTENSION.CHAT_HEADER.EXT_ID, {
				filterManageGroup: !isGroup.value,
			});
			groupManageExt.value = extList[0];
		}
		if (isUniFrameWork && !isGroup.value) {
			groupManageExt.value = [];
		}
		currentGroup.value = conversation?.groupProfile;
		groupID.value = conversation?.groupProfile?.groupID;

	}
	const leftClick = () => {
		// let allPage = uni.$u.pages()
		// let beforePage = allPage[allPage.length - 2].route
		// const arr = [
		// 	'pages/TUIKit/components/TUIChat/index',
		// 	'pages/TUIKit/components/TUIChat/message-input-toolbar/camera/camera'
		// ]
		uni.switchTab({
			url: '/pages/home/index'
		})
		// if (arr.includes(beforePage)) {
		// 	uni.switchTab({
		// 		url: '/pages/home/index'
		// 	})
		// } else {
		// 	uni.navigateBack()
		// }
		// console.log(beforePage)
	}

	const isExistGroup = ref(true)
	const forwardModule = ref();
	onMounted(() => {
		onWatchStore()
		//关闭转发面板
		uni.$on('closeSinForWard', function (data) {
			forwardModule?.value?.closeForwardPanel()
		})
		TUIStore.watch(StoreName.CHAT, {
			quoteMessage: onQuoteMessage,
		})

		// 获取群资料来判定群是否解散
		// TUIChatEngine.chat.getGroupProfile({ groupID: groupID.value })
		// .then( (res:any) => {
		// 	isExistGroup.value = true
		// 	// console.log('获取成功 res:', res); // 获取群详细资料失败的相关信息
		// })
		// .catch( (error:any) => {
		// 	isExistGroup.value = false
		// 	// console.log('获取失败 error:', error); // 获取群详细资料失败的相关信息
		// });
	})
	onUnmounted(() => {
		onUnWatch()
	});

	const isMuted = ref(false)

	// 全员禁言
	const isMutedAll = computed(() => {
		const myself = currentGroup.value?.selfInfo
		return currentGroup.value?.muteAllMembers && myself.role === TUIChatEngine.TYPES.GRP_MBR_ROLE_MEMBER
	})

	// 清空当前 conversationID
	const onUnWatch = () => {
		TUIConversationService.switchConversation();
		TUIStore.unwatch(StoreName.GRP, {
			currentGroup: onCurrentGroup
		})
		TUIStore.unwatch(StoreName.CUSTOM, {
			singleForwardMessageID: onSingleForwardMessageIDUpdated
		});
		TUIStore.unwatch(StoreName.CONV, {
			currentConversation: onCurrentConversationHanlder,
			// conversationList: onConversationList
		});
		uni.$off('closeSinForWard')
		uni.$off('onSendFile')
	};

	const closeChat = (conversationID : string) => {
		console.log('关闭')
		emits("closeChat", conversationID);
		onUnWatch();
	};

	const insertEmoji = (emojiObj : object) => {
		messageInputRef?.value?.insertEmoji(emojiObj);
	};
	const closeToolbarShow = () => {
		if (messageInputRef?.value?.getName()) {
			isToolbarShow.value = false;
		}
		console.log('closeToolbarShow')
		messageInputRef?.value?.toggleBox('')
		messageInputRef?.value?.hideBox()
	}
	const showMessageTool = ref(false)
	const handleToolbarListShow = (show ?: boolean) => {
		if (isUniFrameWork) {
			isToolbarShow.value = (show === undefined) ? !isToolbarShow.value : show;
		} else {
			isToolbarShow.value = true;
		}
	};

	const handleEditor = (message : IMessageModel, type : string) => {
		if (!message || !type) return;
		switch (type) {
			case "reference":
				// todo
				break;
			case "reply":
				// todo
				break;
			case "reedit":
				if (message?.payload?.text) {
					messageInputRef?.value?.reEdit(message?.payload?.text);
				}
				break;
			default:
				break;
		}
	};

	const handleGroup = () => {
		uni.navigateTo({
			url: `/pages/address/views/group/views/group-settings/index?groupID=${groupID.value}`,
			events: {
				// 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
				getNewGroup: function (data) {
					memberCount.value = data.memberCount
					console.log(data)
				}
			}
		})
	};

	// 同意入群申请
	const updateMemberCount = (count) => {
		memberCount.value += count
	}
	const onPageMove=(e)=>{
		return
		console.log('onPageMove')
		e.preventDefault();
	}
</script>
<style scoped lang="scss" src="./style/index.scss"></style>
<style scoped lang="scss">
	.navbar {
		::v-deep {
			.u-navbar__content {
				background-color: rgba(250, 250, 250, 0.8) !important;
				backdrop-filter: blur(10px);
			}
		}
	}

	.safe-bottom {
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		box-sizing: content-box;
	}
</style>