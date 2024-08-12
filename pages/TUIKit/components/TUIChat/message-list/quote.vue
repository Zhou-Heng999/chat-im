<template>
	<ql-page class="merger-page" ref="qlPage">
		<u-navbar bgColor="rgba(250, 250, 250, 0.8)" placeholder border autoBack
			:title="navbarTitle === 'pinned' ? $tc('置顶消息') : $tc('引用消息')" @clickLeft="BackPage" />
		<div class="TUIChat" :class="[!isPC ? 'TUIChat-H5' : '']" style="background: #F3F3F3">
			<div class="TUIChat-main">
				<scroll-view id="messageScrollList" class="TUI-message-list" scroll-y="true" :scroll-top="scrollTop">
					<li v-for="(item, index) in messageList" :id="`tui-${item.ID}`" :key="item.vueForRenderKey"
						:class="'message-li ' + item.flow">
						<MessageTimestamp :currTime="item.time" :prevTime="index > 0 ? messageList[index - 1].time : 0">
						</MessageTimestamp>
						<div class="message-item" @click.stop="toggleID = ''">
							<!-- {{item}} -->
							<MessageTip v-if="
                item.type === TYPES.MSG_GRP_TIP ||
                isCreateGroupCustomMessage(item)
              " :content="item.getMessageContent()" />
							<div v-else-if="!item.isRevoked && !isPluginMessage(item)" :id="`msg-bubble-${item.ID}`"
								class="message-bubble-container"
								@longpress="handleToggleMessageItem($event, item, index, true)"
								@touchstart="handleH5LongPress($event, item, index, 'touchstart')"
								@touchend="handleH5LongPress($event, item, index, 'touchend')"
								@mouseover="handleH5LongPress($event, item, index, 'touchend')">
								<MessageBubble :messageItem="item" :content="item.getMessageContent()"
									:blinkMessageIDList="blinkMessageIDList" :isCheckMore='isCheckMore'
									@resendMessage="resendMessage(item)" @changeCheck="changeCheck(item,index)"
									@blinkMessage="blinkMessage" @scrollTo="scrollTo"
									@setReadReciptPanelVisible="setReadReciptPanelVisible">
									<view v-if="navbarTitle === 'pinned'" class="flex-justify-end mb-10">
										<u--image 
											:showLoading="true" 
											src="/static/images/tb_zd_home.png" 
											width="30rpx" 
											height="30rpx" 
											@click="clickClosePinnedMsg(index)">
										</u--image>
									</view>
									<MessageText v-if="item.type === TYPES.MSG_TEXT"
										:content="item.getMessageContent()" />
									<!-- <ProgressMessage v-if="item.type === TYPES.MSG_IMAGE"
										:content="item.getMessageContent()" :messageItem="item">
										<MessageImage :content="item.getMessageContent()" :messageItem="item"
											@previewImage="handleImagePreview" />
									</ProgressMessage> -->
									<MessageImage v-else-if="item.type === TYPES.MSG_IMAGE"
										:messageItem="item.messageItem||item" @clickImage="handleImagePreview" />
									<ProgressMessage v-if="item.type === TYPES.MSG_VIDEO"
										:content="item.getMessageContent()" :messageItem="item">
										<MessageVideo :content="item.getMessageContent()" :messageItem="item" />
									</ProgressMessage>
									<div v-if="item.type === TYPES.MSG_MERGER">
										<MessageMerger :content="item.getMessageContent()" :messageItem="item">
										</MessageMerger>
									</div>
									<MessageAudio v-if="item.type === TYPES.MSG_AUDIO"
										:content="item.getMessageContent()" :messageItem="item" />
									<MessageFile v-if="item.type === TYPES.MSG_FILE"
										:content="item.getMessageContent()" />
									<MessageFace v-if="item.type === TYPES.MSG_FACE" :content="item.getMessageContent()"
										:isPC="isPC" />
									<MessageLocation v-if="item.type === TYPES.MSG_LOCATION"
										:content="item.getMessageContent()" />
									<MessageCustom v-if="item.type === TYPES.MSG_CUSTOM"
										:content="item.getMessageContent()" :messageItem="item"
										:currentConversationInfo='currentConversationInfo' @seeCardInfo="seeCardInfo" />
								</MessageBubble>
							</div>
							<MessagePlugin v-else-if="!item.isRevoked && isPluginMessage(item)" :message="item"
								@resendMessage="resendMessage" @handleToggleMessageItem="handleToggleMessageItem"
								@handleH5LongPress="handleH5LongPress" />
							<!-- <MessageRevoked v-else :isEdit="item.type === TYPES.MSG_TEXT" :messageItem="item"
								@messageEdit="handleEdit(item)" /> -->
							<!-- <MessageTool :class="[
								'message-tool',
								item.flow === 'out' ? 'message-tool-out' : 'message-tool-in',
							  ]" :messageItem="item" @onChangeMsg='onChangeMsg' v-if="item.ID === toggleID" /> -->
						</div>
					</li>
				</scroll-view>
				<ImagePreviewer v-if="showImagePreview" :currentImage="currentImagePreview"
					:imageList="imageMessageList" @close="onImagePreviewerClose"></ImagePreviewer>
				<!-- <MessageGroupSystem v-if="showGroupApplication" :groupID="groupID"
					@toggleApplicationList="toggleApplicationList" @handleGroupApplication="handleGroupApplication">
				</MessageGroupSystem>
				<view class="fixed-box" style="z-index: 99;" v-if="isCardShow">
					<cardModal :info="cardInfo" :isShow="isCardShow" @closeModal="isCardShow = false">
					</cardModal>
				</view> -->
			</div>
		</div>
	</ql-page>
</template>
<script lang="ts" setup>
	import {
		ref,
		computed,
		nextTick,
		onMounted,
		onUnmounted,
		getCurrentInstance,
	} from "../../../adapter-vue";

	import TUIChatEngine, {
		IMessageModel,
		TUIStore,
		StoreName,
		TUITranslateService,
		TUIChatService,
		TUIGroupService,
	} from "@tencentcloud/chat-uikit-engine";

	import { onLoad } from "@dcloudio/uni-app";

	import Link from "./link";
	import MessageText from "./message-elements/message-text.vue";
	import ProgressMessage from "../../common/ProgressMessage/index.vue";
	// import MessageImage from "./message-elements/message-image.vue";
	import MessageImage from "./message-element/message-image.vue";
	import MessageAudio from "./message-elements/message-audio.vue";
	import MessageFile from "./message-elements/message-file.vue";
	import MessageFace from "./message-elements/message-face.vue";
	import MessageCustom from "./message-elements/message-custom.vue";
	import MessageMerger from "./message-elements/message-merger.vue";
	import MessageTip from "./message-elements/message-tip.vue";
	import MessageBubble from "./message-elements/message-bubble.vue";
	import MessageLocation from "./message-elements/message-location.vue";
	import MessageTimestamp from "./message-elements/message-timestamp.vue";
	import MessageVideo from "./message-elements/message-video.vue";
	import MessageTool from "./message-tool/index.vue";
	import MessageRevoked from "./message-tool/message-revoked.vue";
	import MessageGroupSystem from "./message-elements/message-group-system.vue";
	import MessagePlugin from "../../../plugins/plugin-components/message-plugin.vue";
	import ReadReciptPanel from "./read-receipt-panel/index.vue";
	import { isPluginMessage } from "../../../plugins/plugin-components/index";
	import Dialog from "../../common/Dialog/index.vue";
	import ImagePreviewer from "../../common/ImagePreviewer/index.vue";
	import { isCreateGroupCustomMessage } from "../utils/utils";
	import { getBoundingClientRect, getScrollInfo, instanceMapping } from "../../../utils/universal-api/domOperation";
	import { isEnabledMessageReadReceiptGlobal } from "../utils/utils";
	import { isPC, isH5 } from "../../../utils/env";
	import cardModal from "@/components/card/index";

	import { Toast, TOAST_TYPE } from "../../common/Toast/index";
	import { tc } from '@/utils/util'

	const currentConversationInfo = ref(getApp().globalData.currentConversationInfo)
	const isCardShow = ref(false);
	const cardInfo = ref(null);
	const seeCardInfo = (obj) => {
		cardInfo.value = obj;
		isCardShow.value = true;
	};
	const isCheckMore = ref(false)
	let observer : any = null;
	let groupType : string | undefined;
	const sentReceiptMessageID = new Set<string>();
	const thisInstance = getCurrentInstance()?.proxy || getCurrentInstance();
	console.log('thisInstance', thisInstance)
	const messageListRef = ref();
	const title = ref("TUIChat");
	const isCompleted = ref(false);
	const currentConversationID = ref("");
	const nextReqMessageID = ref();
	const toggleID = ref("");
	const scrollTop = ref(5000); // 首次是 15 条消息，最大消息高度为300
	const TYPES = ref(TUIChatEngine.TYPES);
	const listRef = ref();
	const isLoadMessage = ref(false);
	const isLongpressing = ref(false);
	const blinkMessageIDList = ref<string[]>([]);
	// 阅读回执状态message
	const readStatusMessage = ref<IMessageModel>();
	const isShowReadUserStatusPanel = ref<boolean>(false);

	// 加群申请系统消息
	const groupApplicationCount = ref(0);
	const showGroupApplication = ref(false);
	const applicationUserIDList = ref([]);

	// 消息重发 Dialog
	const reSendDialogShow = ref(false);
	const resendMessageData = ref();
	const emits = defineEmits(["handleEditor", 'handChangeInput']);

	// 图片预览相关
	const showImagePreview = ref(false);
	const currentImagePreview = ref<IMessageModel>();
	const imageMessageList = computed(() =>
		messageList.value?.filter((item : IMessageModel) => {
			return !item.isRevoked && !item.hasRiskContent && item.type === TYPES.value.MSG_IMAGE;
		})
	);

	const navbarTitle = ref('')
	const messageList = ref([])
	onLoad(() => {
		navbarTitle.value = getApp().globalData.title
		const list = getApp().globalData.list
		messageList.value = list.map(item => {
			item.flow = 'in'
			return item
		})
	})

	onMounted(() => { });

	const getMessageContent = (item) => {
		if (!item) return item
		let messageHandlers = {
			[TUIChatService.getEngine().TYPES.MSG_TEXT]: e => TUIChatEngine.TUIChat?.messageHandler?.handleTextMessage(e),
			[TUIChatService.getEngine().TYPES.MSG_FACE]: e => TUIChatEngine.TUIChat.messageHandler.handleFaceMessage(
				e),
			[TUIChatService.getEngine().TYPES.MSG_LOCATION]: e => TUIChatEngine.TUIChat.messageHandler
				.handleLocationMessage(e),
			[TUIChatService.getEngine().TYPES.MSG_IMAGE]: e => TUIChatEngine.TUIChat.messageHandler.handleImageMessage(
				e),
			[TUIChatService.getEngine().TYPES.MSG_AUDIO]: e => TUIChatEngine.TUIChat.messageHandler.handleAudioMessage(
				e),
			[TUIChatService.getEngine().TYPES.MSG_VIDEO]: e => TUIChatEngine.TUIChat.messageHandler.handleVideoMessage(
				e),
			[TUIChatService.getEngine().TYPES.MSG_FILE]: e => TUIChatEngine.TUIChat.messageHandler.handleFileMessage(
				e),
			[TUIChatService.getEngine().TYPES.MSG_CUSTOM]: e => TUIChatEngine.TUIChat.messageHandler
				.handleCustomMessage(e),
			[TUIChatService.getEngine().TYPES.MSG_MERGER]: e => TUIChatEngine.TUIChat.messageHandler
				.handleMergeMessage(e),
			[TUIChatService.getEngine().TYPES.MSG_GRP_TIP]: e => TUIChatEngine.TUIChat.messageHandler
				.handleGroupTipsMessage(e)
		}
		let itemType = item.type
		const e = messageHandlers[itemType];
		if (!e) return {};
		if (itemType === TUIChatService.getEngine().TYPES.MSG_GRP_TIP) return e(item);
		const t = TUIChatService.getEngine().TUIFriend.getFriendRemark([item.from]);
		let c = Object.assign(Object.assign({}, e(item)), {
			showName: t[item.from] || item.nameCard || item.nick || item.from
		})
		return c
	}

	// 消息滑动到底部，建议搭配 nextTick 使用
	const scrollToBottom = () => {
		// 文本消息高度：60, 最大消息高度 280
		scrollTop.value += 300;
		// 解决 uniapp 打包到 app 首次进入滑动到底部，300 可设置
		const timer = setTimeout(() => {
			scrollTop.value += 1;
			clearTimeout(timer);
		}, 300);
	};


	// 监听回调函数
	const onCurrentConversationIDUpdated = (conversationID : string) => {
		// currentConversationID.value = conversationID;
		// TUIGroupService.getGroupApplicationList().then((res : any) => {
		// 	const applicationList = res.data.applicationList.filter(
		// 		(application : any) => application.groupID === props.groupID
		// 	);
		// 	applicationUserIDList.value = applicationList.map((application : any) => {
		// 		return application.applicationType === 0
		// 			? application.applicant
		// 			: application.userID;
		// 	});
		// 	TUIStore.update(
		// 		StoreName.CUSTOM,
		// 		"groupApplicationCount",
		// 		applicationList.length
		// 	);
		// });

		// // 开启已读回执的状态 群聊缓存群类型
		// if (isEnabledMessageReadReceiptGlobal()) {
		// 	const { groupProfile } = TUIStore.getConversationModel(conversationID) || {};
		// 	groupType = groupProfile?.type;
		// }
	};

	// operationType 操作类型 1: 有用户申请加群   23: 普通群成员邀请用户进群
	const onGroupSystemNoticeList = (list : Array<IMessageModel>) => {
		const systemNoticeList = list.filter((message) => {
			const { operationType } = message.payload;
			// return (
			// 	(operationType === 1 || operationType === 23) &&
			// 	message.to === props.groupID
			// );
		});

		systemNoticeList.forEach((systemNotice) => {
			const { operationType } = systemNotice.payload;
			if (operationType === 1) {
				const { operatorID } = systemNotice.payload;
				if (!applicationUserIDList.value.includes(operatorID)) {
					applicationUserIDList.value.push(operatorID);
				}
			}
			if (operationType === 23) {
				const { inviteeList } = systemNotice.payload;
				inviteeList.forEach((invitee) => {
					if (!applicationUserIDList.value.includes(invitee)) {
						applicationUserIDList.value.push(invitee);
					}
				});
			}
		});
		const applicationCount = applicationUserIDList.value.length;
		TUIStore.update(StoreName.CUSTOM, "groupApplicationCount", applicationCount);
	};

	// 消息列表监听
	TUIStore.watch(StoreName.CHAT, {
		isCompleted: onChatCompletedUpdated,
	});

	TUIStore.watch(StoreName.CONV, {
		currentConversationID: onCurrentConversationIDUpdated,
	});

	// 群系统消息
	TUIStore.watch(StoreName.GRP, {
		groupSystemNoticeList: onGroupSystemNoticeList,
	});

	// 群系统消息数量
	TUIStore.watch(StoreName.CUSTOM, {
		groupApplicationCount: onGroupApplicationCountUpdated,
	});

	// 取消监听
	onUnmounted(() => {
		TUIStore.unwatch(StoreName.CHAT, {
			isCompleted: onChatCompletedUpdated,
		});

		TUIStore.unwatch(StoreName.CONV, {
			currentConversationID: onCurrentConversationIDUpdated,
		});

		// 群系统消息
		TUIStore.unwatch(StoreName.GRP, {
			groupSystemNoticeList: onGroupSystemNoticeList,
		});

		TUIStore.unwatch(StoreName.CUSTOM, {
			groupApplicationCount: onGroupApplicationCountUpdated,
		});

		observer?.disconnect();
		observer = null;
	});
	const changeCheck = (item, index) => {
		let { isCheck } = item
	}
	const onChangeMsg = (val) => {
		isCheckMore.value = true
		emits('handChangeInput', !isCheckMore.value)
	}
	const getAllCheckMsg = () => {
		let fList = []
		return fList
	}
	defineExpose({
		getAllCheckMsg
	})
	function onMessageListUpdated(list : IMessageModel[]) {
		observer?.disconnect();
		// 设定是否多选状态
		list.forEach(item => {
			if (!item.isCheck) item.isCheck = false
		})
			.filter(message => !message.isDeleted)
			.map((message) => {
				message.vueForRenderKey = `${message.ID}`;
				return message;
			});
		// 点击加载更多的消息不需要滑动到底部
		// if (!isLoadMessage.value) {
		//   scrollToBottom();
		// }

		if (isEnabledMessageReadReceiptGlobal()) {
			nextTick(() => bindIntersectionObserver());
		}
	}

	function onChatCompletedUpdated(flag : boolean) {
		isCompleted.value = flag;
	}

	function onGroupApplicationCountUpdated(count : number) {
		groupApplicationCount.value = count;
	}

	// 获取历史消息
	const getHistoryMessageList = () => {
		isLoadMessage.value = true;
		TUIChatService.getMessageList().then((res : any) => {
			const { nextReqMessageID: ID } = res.data;
			nextReqMessageID.value = ID;
			isLoadMessage.value = false;
		});
	};

	const toggleApplicationList = () => {
		showGroupApplication.value = !showGroupApplication.value;
	};

	const handleGroupApplication = (userID : string) => {
		const index = applicationUserIDList.value.indexOf(userID);
		if (index !== -1) {
			applicationUserIDList.value.splice(index, 1);
		}
	};
	// todo: webview 跳转
	const openComplaintLink = (type : any) => { };

	// 消息操作
	const handleToggleMessageItem = (
		e : any,
		message : IMessageModel,
		index : number,
		isLongpress = false
	) => {
		if (isLongpress) {
			isLongpressing.value = true;
		}
		toggleID.value = message.ID;
	};

	// h5 long press
	let timer : number;
	const handleH5LongPress = (
		e : any,
		message : IMessageModel,
		index : number,
		type : string
	) => {
		if (!isH5) return;
		function longPressHandler() {
			clearTimeout(timer);
			handleToggleMessageItem(e, message, index, true);
		}
		function touchStartHandler() {
			timer = setTimeout(longPressHandler, 500);
		}
		function touchEndHandler() {
			clearTimeout(timer);
		}
		switch (type) {
			case "touchstart":
				touchStartHandler();
				break;
			case "touchend":
				touchEndHandler();
				setTimeout(() => {
					isLongpressing.value = false;
				}, 200);
				break;
		}
	};

	// 消息撤回后，编辑消息
	const handleEdit = (message : IMessageModel) => {
		emits("handleEditor", message, "reedit");
	};

	// 重发消息
	const resendMessage = (message : IMessageModel) => {
		reSendDialogShow.value = true;
		resendMessageData.value = message;
	};

	// 图片预览
	// 开启图片预览
	// const handleImagePreview = (message : IMessageModel) => {
	// 	console.log('message', message)

	// 	showImagePreview.value = true;
	// 	currentImagePreview.value = message;
	// };
	const handleImagePreview = (message : IMessageModel) => {
		if (
			showImagePreview.value ||
			currentImagePreview.value ||
			isLongpressing.value
		) {
			return;
		}
		showImagePreview.value = true;
		currentImagePreview.value = message;
	};
	// 关闭图片预览
	const onImagePreviewerClose = () => {
		showImagePreview.value = false;
		setTimeout(() => {
			currentImagePreview.value = null;
		}, 50);
	};

	const resendMessageConfirm = () => {
		reSendDialogShow.value = !reSendDialogShow.value;
		const messageModel = resendMessageData.value;
		messageModel.resendMessage();
	};

	function blinkMessage(messageID : string) : Promise<void> {
		return new Promise((resolve) => {
			const index = blinkMessageIDList.value.indexOf(messageID);
			if (index < 0) {
				blinkMessageIDList.value.push(messageID);
				const timer = setTimeout(() => {
					blinkMessageIDList.value.splice(blinkMessageIDList.value.indexOf(messageID), 1);
					clearTimeout(timer);
					resolve();
				}, 3000);
			}
		});
	}

	function scrollTo(scrollHeight : number) {
		scrollTop.value = scrollHeight;
	}

	// 滚动到最新消息
	async function scrollToLatestMessage() {
		const { scrollHeight } = await getScrollInfo('#messageScrollList', 'messageList');
		const { height } = await getBoundingClientRect('#messageScrollList', 'messageList');
		scrollTop.value = scrollHeight - height;
	}

	async function bindIntersectionObserver() {
		if (messageList.value.length === 0) {
			return;
		}

		if (groupType === TYPES.value.GRP_AVCHATROOM || groupType === TYPES.value.GRP_COMMUNITY) {
			// 直播群以及社群不进行消息的已读回执监听
			return;
		}

		observer?.disconnect();
		observer = uni.createIntersectionObserver(thisInstance, {
			threshold: [0.7],
			observeAll: true,
			// uni 下会把 safetip 也算进去 需要负 margin 来排除
		}).relativeTo('#messageScrollList', { top: -70 });

		observer?.observe('.message-li.in .message-bubble-container', (res : any) => {
			if (sentReceiptMessageID.has(res.id)) {
				return;
			}
			const matchingMessage = messageList.value.find((message : IMessageModel) => {
				return res.id.indexOf(message.ID) > -1;
			});
			if (
				matchingMessage &&
				matchingMessage.needReadReceipt &&
				matchingMessage.flow === 'in' &&
				!matchingMessage.readReceiptInfo?.isPeerRead
			) {
				TUIChatService.sendMessageReadReceipt([matchingMessage]);
				sentReceiptMessageID.add(res.id);
			}
		});
	}

	function setReadReciptPanelVisible(visible : boolean, message ?: IMessageModel) {
		if (!visible) {
			readStatusMessage.value = undefined;
		} else {
			readStatusMessage.value = message;
		}
		isShowReadUserStatusPanel.value = visible;
	}


	const selectedPinnedMsg = ref(null)
	const pinnedMsgContent = ref(null)
	const pinnedMsgIndex = ref(0)
	const clickClosePinnedMsg = (index) => {
		// 调用列表置顶的代码
		const eventChannel = thisInstance.getOpenerEventChannel()
		messageList.value.splice(index, 1);
		eventChannel.emit('deletePinnedMessage', { index })
		return

		if (currentConversationInfo.value.type === TUIChatEngine.TYPES.CONV_GROUP) {
			let groupProfile = currentConversationInfo.value.groupProfile;
			if (!groupProfile) {
				return;
			}

			const { role } = groupProfile.selfInfo
			if (role === TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER || role === TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN) {
				selectedPinnedMsg.value = messageList.value[pinnedMsgIndex.value];
				TUIChatEngine.chat.getGroupProfile({ groupID: currentConversationInfo.value.groupProfile.groupID })
					.then((res : any) => {
						let groupCustomField = res.data.group.groupCustomField;
						let pinnedMsgsObj;

						for (let i = 0; i < groupCustomField.length; i++) {
							let item = groupCustomField[i];

							if (item.key == "pinnedMsgs") {
								pinnedMsgsObj = item;

								break;
							}
						}

						if (!pinnedMsgsObj) {
							return;
						}

						if (!pinnedMsgsObj.value || pinnedMsgsObj.value.length <= 0) {
							return;
						}

						let list = JSON.parse(pinnedMsgsObj.value);

						let index = list.findIndex(item => item.id == selectedPinnedMsg.value.id);
						if (index < 0) {
							return;
						}

						list.splice(index, 1)

						nextTick(() => {
							messageList.value.splice(pinnedMsgIndex.value, 1);

							pinnedMsgIndex.value = 0;
							pinnedMsgContent.value = null;

							if (messageList.value[pinnedMsgIndex.value]) {
								let messageBody = messageList.value[pinnedMsgIndex.value].body;

								if (messageBody) {
									pinnedMsgContent.value = handlePinnedMsgContent(messageBody);
								}
								else {
									pinnedMsgContent.value = messageBody;
								}
							}
						})
						pinnedMsgsObj.value = JSON.stringify(list);

						for (let i = 0; i < groupCustomField.length; i++) {

							if (groupCustomField[i].key == "pinnedMsgs") {
								groupCustomField[i] = pinnedMsgsObj;
							}
						}

						let promise = TUIChatEngine.chat.updateGroupProfile({
							groupID: currentConversationInfo.value.groupProfile.groupID,
							// 群成员能收到群自定义字段变更的群提示消息，且能获取到相关的内容，详见 Message.payload.newGroupProfile.groupCustomField
							groupCustomField: groupCustomField // 修改群组维度自定义字段
						});
						promise.then((res : any) => {

							Toast({
								message: tc("解除置顶成功"),
								type: TOAST_TYPE.NORMAL,
							});



							sendRemovePinnedMsgsTips();
						}).catch((error : any) => {

							Toast({
								message: tc("解除置顶失败"),
								type: TOAST_TYPE.NORMAL,
							});

							console.warn('updateGroupProfile error:', error); // 修改群组资料失败的相关信息
						});

					})
					.catch((error : any) => {
						console.log('getGroupProfile error:', error); // 获取群详细资料失败的相关信息
					});
			}
			else {

				messageList.value.splice(pinnedMsgIndex.value, 1);

				pinnedMsgIndex.value = 0;
				pinnedMsgContent.value = null;

				if (messageList.value[pinnedMsgIndex.value]) {
					let messageBody = messageList.value[pinnedMsgIndex.value].body;

					if (messageBody) {
						pinnedMsgContent.value = handlePinnedMsgContent(messageBody);
					}
					else {
						pinnedMsgContent.value = messageBody;
					}
				}

			}
		}
		else if (currentConversationInfo.value.type === TUIChatEngine.TYPES.CONV_C2C) {
			deleteC2cPinnedMsg();
		}
	}

	const deleteC2cPinnedMsg = () => {
		let otherId = currentConversationInfo.value.conversationID.replace(TUIChatEngine.TYPES.CONV_C2C, "");

		let idList = sortStringsByCharacters([TUIChatEngine.getMyUserID(), otherId]);

		let sessionId = idList.join("");

		let infos = {
			sessionId: sessionId,
			id: messageList.value[pinnedMsgIndex.value].id
		}

		thisInstance.$http.app_user.c2cmsgRmTop(infos)
			.then((res : any) => {

				let res_data = res.data;

				if (res.result) {
					console.log('deleteC2cPinnedMsg')
					getC2cmsgToplist();
					sendGmC2cmsgSetTopGm();
					sendGmC2cmsgRmTopTips();
				} else {
					//异常
					Toast({
						message: TUITranslateService.t("TUIChat.解除置顶失败"),
						type: TOAST_TYPE.ERROR,
					});
					console.log("===========c2cmsgSetTop error 1111")
					console.log(res)
				}


			})
			.catch((error : any) => {
				Toast({
					message: TUITranslateService.t("TUIChat.解除置顶失败"),
					type: TOAST_TYPE.ERROR,
				});
				console.log("===========c2cmsgSetTop error")
				console.log(error)
			})

	}

	function getC2cmsgToplist() {
		try {
			let otherId = currentConversationInfo.value.conversationID.replace(TUIChatEngine.TYPES.CONV_C2C, "");

			let idList = sortStringsByCharacters([TUIChatEngine.getMyUserID(), otherId]);

			let sessionId = idList.join("");
			let infos = {
				sessionId:
					sessionId
			}

			thisInstance.$http.app_user.c2cmsgToplist(infos)
				.then((res : any) => {

					let res_data = res.data;
					if (res.result) {
						let data = res_data;
						// data.reverse();
						handleC2cToplist(data);
					}

				})
				.catch((error : any) => {
					console.log("===============c2cmsgToplist error")
					console.log(error)
				})
		} catch (e) {
			console.log('e', e)
			//TODO handle the exception
		}


	}

	const sendGmC2cmsgSetTopGm = () => {


		let data = {
			code: "c2c_set_top",
			value: {},
		}

		let payload = {
			data: JSON.stringify(data),
			description: 'GM_ORDER',
			extension: 'GM_ORDER'
		}

		let to = currentConversationInfo.value.conversationID.replace(TUIChatEngine.TYPES.CONV_C2C, "");

		let sendMessage = TUIChatEngine.chat.createCustomMessage({
			to: to,
			conversationType: TUIChatEngine.TYPES.CONV_C2C,
			payload: payload
		})

		TUIChatEngine.chat.sendMessage(sendMessage)
			.then((res : any) => {

				console.log("=====c2c置顶刷新GM指令发送成功")
			})
			.catch((error : any) => {
				Toast({
					message: error?.message,
					type: TOAST_TYPE.ERROR,
				});
			})

	}

	const sendGmC2cmsgRmTopTips = () => {

		let payload = {
			data: "",
			description: 'c2c_rm_top',
			extension: 'c2c_rm_top'
		}

		let to = currentConversationInfo.value.conversationID.replace(TUIChatEngine.TYPES.CONV_C2C, "");

		let sendMessage = TUIChatEngine.chat.createCustomMessage({
			to: to,
			conversationType: TUIChatEngine.TYPES.CONV_C2C,
			payload: payload
		})

		TUIChatEngine.chat.sendMessage(sendMessage)
			.then((res : any) => {

				console.log("=====c2c取消置顶提示发送成功")
			})
			.catch((error : any) => {
				Toast({
					message: error?.message,
					type: TOAST_TYPE.ERROR,
				});
			})

	}

	const handlePinnedMsgContent = (pinnedMsg : any) => {
		console.log('%c handlePinnedMsgContent...', 'color: red', pinnedMsg, TYPES)
		let config = {}
		const payload = pinnedMsg.payload
		switch (pinnedMsg.type) {
			case TUIChatEngine.TYPES.MSG_TEXT:
				config = {
					type: 1,
					text: payload.text
				}
				break;
			case TUIChatEngine.TYPES.MSG_IMAGE:
				config = {
					type: 2,
					url: payload.imageInfoArray[1].imageUrl,
					text: tc('[图片消息]')
				}
				break;
			case TUIChatEngine.TYPES.MSG_AUDIO:
				config = {
					type: 1,
					url: "",
					text: tc('[语音消息]')
				}
				break;
			case TUIChatEngine.TYPES.MSG_VIDEO:
				config = {
					type: 1,
					url: payload.snapshotUrl,
					text: tc('[视频消息]')
				}
				break;
			case TUIChatEngine.TYPES.MSG_FILE:
				config = {
					type: 1,
					url: "",
					text: tc('[文件消息]')
				}
				break;
			case TUIChatEngine.TYPES.MSG_CUSTOM:
				config = {
					type: 1,
					url: "",
					text: tc('[自定义消息]')
				}
				break;
			case TUIChatEngine.TYPES.MSG_MERGER:
				config = {
					type: 1,
					url: "",
					text: tc('[合并消息]')
				}
				break;
			case TUIChatEngine.TYPES.MSG_LOCATION:
				config = {
					type: 1,
					url: "",
					text: tc('[位置消息]')
				}
				break;
			case TUIChatEngine.TYPES.MSG_FACE:
				config = {
					type: 1,
					url: "",
					text: tc('[表情消息]')
				}
				break;
			case TUIChatEngine.TYPES.MSG_GRP_TIP:
				config = {
					type: 1,
					url: "",
					text: tc('[群提示消息]')
				}
				break;
			case TUIChatEngine.TYPES.MSG_GRP_SYS_NOTICE:
				config = {
					type: 1,
					url: "",
					text: tc('[群系统通知消息]')
				}
				break;
		}
		console.log('config', config)
		return config;
	}
</script>
<style lang="scss" scoped src="./style/index.scss"></style>