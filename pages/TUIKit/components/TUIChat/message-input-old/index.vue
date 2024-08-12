<template>
	<div @click.stop='onStop' :class="['message-input pos-relative', !isPC && 'message-input-h5']">
		<!-- 	<view class=" max-width flex-column file-box" style="width: 700rpx;" v-if="filePath">
			<view class="flex-between mb-20">
				<text></text>
				<text>取消</text>
			</view>
			<u--image class="mb-20" width="100%" height="600rpx"  :src="filePath"  />
		</view> -->
		<div class="flex-row flex-align-start" style="position: relative;">
			<MessageInputAudio v-if="!editMsgContent" :class="[
          'message-input-audio mr-10 mt-10',
          isWeChat && 'message-input-wx-audio',
          isFunctionShow('audio') && 'message-input-wx-audio-open',
        ]" :isAudioMainShow="isFunctionShow('audio')" @switchAudio="switchAudio"></MessageInputAudio>
			<div v-show="!isFunctionShow('audio')" class="message-input-emoji ml-10 mt-10" @click="switchEmojiAndFeature('emoji')">
				<imageIcon width="54rpx" height="54rpx" name="sticker2"></imageIcon>
				<!-- <Icon :file="faceIcon" class="icon icon-face"></Icon> -->
			</div>
			<MessageInputEditor v-show="!isFunctionShow('audio')" class="message-input-editor" ref="editor"
				:placeholder="props.placeholder" :isMuted="props.isMuted" :muteText="props.muteText"
				:enableInput="props.enableInput" :enableAt="props.enableAt" :enableTyping="props.enableTyping"
				:isGroup="isGroup" :isOnFocus="isOnFocus" @sendMessage="sendMessage" @onTyping="onTyping" @onAt="onAt"
				@onFocus="onFocus" @sendEditMessage="sendEditMessage">
			</MessageInputEditor>
			<MessageInputAt v-show="props.enableAt" ref="messageInputAtRef" @insertAt="insertAt"
				@onAtListOpen="onAtListOpen"></MessageInputAt>

			<div v-show="!editMsgContent" class="message-input-send ml-20 mt-10 font-28"
				@touchend.prevent="sendMessage">
				<div class="send white-color">{{$tc('发送')}}</div>
			</div>

			<div v-show="editMsgContent" class="message-input-send ml-20 mt-10 font-28" @click="sendEditMessage">
				<div class="send white-color">{{$tc('编辑')}}</div>
			</div>
			<div class="message-input-more ml-10 mt-10" @click="switchEmojiAndFeature('more')">
				<imageIcon width="54rpx" height="54rpx" name="adds"></imageIcon>
				<!-- <Icon :file="moreIcon" class="icon icon-more"></Icon> -->
			</div>
		</div>
		<div>

			<MessageEdit v-if="editMsgContent" :style="{minWidth: 0}" :currentFunction="currentFunction" />

			<MessageQuote :style="{minWidth: 0}" :currentFunction="currentFunction" />
			<div class="message-input-emoji-picker" v-if="currentFunction=='emoji'">
				<!-- <EmojiPickerDialog @insertEmoji="insertEmoji" @deleteEmoji="deleteEmoji"
					@longpressToDelete="longpressToDelete" @longpressStop="longpressStop" @sendMessage="sendMessage">
				</EmojiPickerDialog> -->
				<EmojiList :show="currentFunction=='emoji'" @change="changeEmojiList" @sendMessage="sendMessage" />
			</div>
			<MessageInputToolbar v-if="currentFunction=='more'"
				:class="['TUI-chat-message-input-toolbar', !isPC && 'TUI-chat-h5-message-input-toolbar']"
				@insertEmoji="insertEmoji" @sendFile='sendFile'></MessageInputToolbar>
		</div>
		<!-- 截图发送 -->
		<screenshot :screenInfo='screenInfo' :isShow='isScreenShow' @closeModal='isScreenShow=false'
			@submit='submitScreen'></screenshot>
		<view v-if="isShowBox&&currentFunction==''" :style="{height:atHeight+'px'}">

		</view>
	</div>
</template>
<script setup lang="ts">
	import TUIChatEngine, {
		TUIStore,
		StoreName,
		TUIChatService,
		IConversationModel,
	} from "@tencentcloud/chat-uikit-engine";
	import MessageInputToolbar from "../message-input-toolbar/index.vue";
	import { ref, nextTick, getCurrentInstance, onMounted, onUnmounted, computed } from "../../../adapter-vue";
	import MessageInputEditor from "./message-input-editor.vue";
	import MessageInputAt from "./message-input-at/index.vue";
	import MessageInputAudio from "./message-input-audio.vue";
	import EmojiPickerDialog from "../message-input-toolbar/emoji-picker/emoji-picker-dialog.vue";
	import MessageQuote from "./message-input-quote/index.vue";
	import MessageEdit from "./message-input-edit/index.vue";
	import Icon from "../../common/Icon.vue";
	import EmojiList from '../message-inputs/components/emojiList'
	import faceIcon from "../../../assets/icon/face-uni.png";
	import moreIcon from "../../../assets/icon/more-uni.png";
	import { isPC, isH5, isWeChat, isApp } from "../../../utils/env";
	import { sendMessages, sendTyping } from "../utils/sendMessage";
	import screenshot from "@/components/screenshot/index";
	import store from '@/store/index.js';
	import { removeTip } from '@/utils/util'
	import { ListMixin } from '@/mixin/list';
	const props = defineProps({
		placeholder: {
			type: String,
			default: "this is placeholder",
		},
		replyOrReference: {
			type: Object,
			default: () => ({}),
			required: false,
		},
		isMuted: {
			type: Boolean,
			default: true,
		},
		muteText: {
			type: String,
			default: "",
		},
		enableInput: {
			type: Boolean,
			default: true,
		},
		enableAt: {
			type: Boolean,
			default: true,
		},
		enableTyping: {
			type: Boolean,
			default: true,
		},
	});

	const emit = defineEmits([
		"sendMessage",
		"resetReplyOrReference",
		"onTyping",
		"handleToolbarListShow",
		'sendFile'
	]);

	const filePath = ref('')
	const sendFile = (e) => {
		emit('sendFile', e)
	}
	const atHeight = ref(0)
	const isShowBox = ref(false)
	// uni.onKeyboardHeightChange((res) => {
	// 	let keyboardHeight = getApp().globalData.keyboardHeight
	// 	console.log('keyboardHeight===', getApp().globalData.keyboardHeight)
	// 	if (res.height > 0 && getApp().globalData.keyboardHeight) {
	// 		isShowBox.value = true
	// 		atHeight.value = getApp().globalData.keyboardHeight
	// 	}
	// 	if (!keyboardHeight && keyboardHeight != res.height) {
	// 		getApp().globalData.keyboardHeight = res.height
	// 		thisInstance.$store.commit('setKeyboardHeight', res.height)
	// 		atHeight.value = res.height
	// 	}
	// 	console.log('键盘高度', res.height)
	// })
	const hideBox = () => {
		isShowBox.value = false
	}
	const toSendData = () => {
		let info = currentConversation.value
		let userID = info.type == 'C2C' ? info.userProfile.userID : info.groupProfile.groupID
		let message = TUIChatEngine.chat.createCustomMessage({
			to: userID,
			conversationType: TUIChatEngine.TYPES[`CONV_${info.type}`],
			payload: {
				data: '我们是朋友了',
				description: 'newFriends',
				extension: 'newFriends'
			},
		})
		TUIChatService.sendCustomMessage(message)
	}
	const thisInstance = getCurrentInstance()?.proxy || getCurrentInstance();
	const replyOrReference = ref();
	const editor = ref();
	const messageInputAtRef = ref();
	const currentConversation = ref<IConversationModel>();
	const isAudioEnable = ref(isWeChat || isApp);
	const currentFunction = ref<string>("");
	const isGroup = ref<boolean>(false);
	const inputIsEmpty = ref<boolean>(true); // true-输入框内容为空
	const onCurrentConversation = (conversation) => {
		currentConversation.value = conversation;
		isGroup.value =
			currentConversation?.value?.type === TUIChatEngine.TYPES.CONV_GROUP;
	}


	onUnmounted(() => {
		TUIStore.unwatch(StoreName.CONV, {
			currentConversation: onCurrentConversation,
		});
		TUIStore.unwatch(StoreName.CHAT, {
			quoteMessage: onQuoteMessage,
		});
	})
	//发送图片
	const screenInfo = ref(null)
	const isScreenShow = ref(false)
	const fileData = ref(null)
	function sendImage(imgBlob, data) {
		console.log('data', data)
		screenInfo.value = {
			imgBlob,
			info: {
				fileFun: 'sendImageMessage',
				fileData: data
			}
		}
		// screenInfo.value = {
		// 	imgBlob,
		// 	fileFun:'sendFileMessage'
		// }
		isScreenShow.value = true
		fileData.value = {
			file: data,
		}
	}
	const submitScreen = (val) => {
		const options = {
			to:
				currentConversation?.value?.groupProfile?.groupID ||
				currentConversation?.value?.userProfile?.userID,
			conversationType: currentConversation?.value?.type,
		}
		TUIChatService.sendImageMessage({ ...options, payload: fileData.value })
		TUIChatService.sendTextMessage({ ...options, payload: { text: val.text } });
	}
	thisInstance.uploadScreenshot(sendImage)
	const switchAudio = (isAudioShow : boolean) => {
		if (isAudioShow) {
			switchEmojiAndFeature("audio");
		} else {
			switchEmojiAndFeature("");
		}
	};
	function changeEmojiList(emoji) {
		editor?.value?.addEmoji && editor?.value?.addEmoji({ name: emoji });
	}
	//设置输入框是否聚焦
	const isOnFocus = ref(false)
	const switchEmojiAndFeature = (funcName : string) => {
		nextTick(() => {
			currentFunction.value = funcName
			isOnFocus.value = false
		})
		if (currentFunction.value === 'emoji') {
			if (funcName === 'emoji') {
				currentFunction.value = "";
			} else {
				currentFunction.value = funcName;
			}
			if (funcName === 'more') {
				nextTick(() => {
					emit("handleToolbarListShow", funcName);
				});
			}
		} else if (currentFunction.value === 'more') {
			emit("handleToolbarListShow");
			if (funcName === 'more') {
				nextTick(() => {
					currentFunction.value = ""
					isOnFocus.value = true
				})
			} else {
				nextTick(() => {
					currentFunction.value = funcName;
				});
			}
		} else {
			currentFunction.value = funcName;
			if (funcName === 'more') {
				emit("handleToolbarListShow");
			}
		}
	};

	const isFunctionShow = (funcName : string) => {
		if (currentFunction.value === funcName) {
			return true;
		}
		return false;
	};

	const onTyping = (inputContentEmpty : boolean, inputBlur : boolean) => {
		// console.log('inputContentEmpty',inputContentEmpty)
		// console.log('inputBlur',inputBlur)
		inputIsEmpty.value = inputContentEmpty
		sendTyping(inputContentEmpty, inputBlur);
	};

	const onAt = (show : boolean) => {
		messageInputAtRef?.value?.toggleAtList(show);
	};

	const onFocus = (keyboardHeight ?: number) => {
		toggleBox()
	};

	const resetReplyOrReference = () => {
		console.warn("resetReplyOrReference");
	};
	const onStop = () => {
		uni.$emit('closeMessageTool', { show: false })
	}


	let sendTime = ref(0),
		sendStart = ref(0),
		sendEnd = ref(0),
		canSend = ref(true),
		sendCount = ref(0)

	const getSendCoolTime = () => {
		const now = parseInt(Date.now() / 1000)
		const interval = 10 // 间隔N秒
		const total = 15 // 条数

		if (now > sendEnd.value) {
			sendStart.value = now
			sendEnd.value = now + interval
			sendCount.value = 0
		}

		if (now < sendEnd.value && sendCount.value >= total) {
			canSend.value = false

			if (sendTime.value > 0) return
			sendTime.value = 2
			setSendCoolTime()
			return
		}

		sendCount.value++
	}

	const setSendCoolTime = () => {
		setTimeout(() => {
			sendTime.value--
			if (sendTime.value <= 0) {
				sendCount.value = 0
				sendStart.value = 0
				sendEnd.value = 0
				canSend.value = true
				return
			}
			setSendCoolTime()
		}, 1000)
	}

	const atInfoList = ref([])
	const sendMessage = async () => {
		console.log('sendMessage....')

		if (canSend.value == false) {
			uni.$u.toast('操作频繁')
			return
		}

		// getSendCoolTime()
		// if (sendTime.value > 0) return

		let messageList;
		if (editor?.value?.getEditorContent) {
			messageList = editor?.value?.getEditorContent();
		}
		editor?.value?.resetEditor && editor?.value?.resetEditor();
		// resetReplyOrReference();
		// 发送艾特逻辑
		if (messageList[0].payload.atUserList) {
			let atList = [...new Map(atInfoList.value.map(item => [item.id, item])).values()]
			let { atUserList } = messageList[0].payload
			let oldText = messageList[0].payload.text
			atList.forEach(item => {
				if (oldText.indexOf(`@${item.label}`) != -1) {
					let regex = new RegExp(`@${item.label}`, 'g');
					if (item.id != '__kImSDK_MesssageAtALL__') {
						oldText = oldText.replace(regex, `@${item.label}_{${item.id}}`)
					}

				}
			})
			messageList[0].payload.text = oldText
			atInfoList.value.length = 0
		}

		// console.log('oldText',messageList[0].payload.text)
		// return 

		currentFunction.value = ''
		await sendMessages(
			messageList,
			currentConversation.value
		);
		emit("sendMessage");
	};

	const sendEditMessage = () => {
		let inputContent = editor?.value?.getEditorContent()
		let sendContent = store.state.editMsgContent;
		// 判断非文本
		if (sendContent.cloudCustomData) {
			let j_data = JSON.parse(sendContent.cloudCustomData);
			j_data.txt = inputContent[0].payload.text
			sendContent.cloudCustomData = JSON.stringify(j_data)
		} else {
			sendContent.payload.text = inputContent[0].payload.text;
		}

		if (sendContent.atUserList.length > 0) {
			let atList = sendContent.atUserList
			let oldText = sendContent.payload.text
			atList.forEach(item => {
				if (oldText.indexOf(`@${ListMixin.methods.deleteChannel(item)}`) != -1) {
					let regex = new RegExp(`@${ListMixin.methods.deleteChannel(item)}`, 'g');
					// if(item.id!='__kImSDK_MesssageAtALL__'){
					oldText = oldText.replace(regex, `@${ListMixin.methods.deleteChannel(item)}_{${item}}`)
					// }
				}
			})
			sendContent.payload.text = oldText
		}

		TUIChatEngine.chat.modifyMessage(sendContent).then(res => {
			console.log('编辑成功', res)
		})
		editor?.value?.resetEditor && editor?.value?.resetEditor();
	}

	const insertEmoji = (emoji : any) => {
		editor?.value?.addEmoji && editor?.value?.addEmoji(emoji);
	};

	const deleteEmoji = () => {
		editor?.value?.deleteEmoji && editor?.value?.deleteEmoji();
	}
	const longpressToDelete = () => {
		editor?.value?.longpressToDelete && editor?.value?.longpressToDelete()
	}
	const longpressStop = () => {
		editor?.value?.longpressStop && editor?.value?.longpressStop()
	}

	const insertAt = (atInfo) => {
		atInfoList.value = [...atInfoList.value, atInfo]
		editor?.value?.insertAt && editor?.value?.insertAt(atInfo);
		// 解决第二次@群员后没有效果问题
		// isOnFocus.value = false;
		// nextTick(() => {
		// 	isOnFocus.value = true;
		// });
	};

	const onAtListOpen = () => {
		editor?.value?.blur && editor?.value?.blur();
		// nextTick(() => {
		// 	isOnFocus.value = false;
		// });
	};

	// 消息撤回后重新编辑
	const reEdit = (content : any) => {
		editor?.value?.resetEditor();
		resetReplyOrReference();
		editor?.value?.setEditorContent(content);
	};
	const toggleBox = (val) => {
		nextTick(() => {
			currentFunction.value = ''
		})

	}
	const getName = () => {
		return currentFunction.value
	}
	const onQuoteMessage = (options : { message : IMessageModel, type : string }) => {
		console.log('引用消息')
		if (options.message && options.type === "quote") {
			// 监听到新的消息引用
			isOnFocus.value = true;
		}
	}
	onMounted(() => {
		TUIStore.watch(StoreName.CHAT, {
			quoteMessage: onQuoteMessage,
		});
		TUIStore.watch(StoreName.CONV, {
			currentConversation: onCurrentConversation,
		});
	})

	defineExpose({
		insertEmoji,
		reEdit,
		toggleBox,
		getName,
		hideBox
	});
</script>

<style scoped lang="scss">
	@import url("../../../assets/styles/common.scss");

	.file-box {
		position: absolute;
		top: -100%;
	}

	.message-input {
		position: relative;
		display: flex;
		flex-direction: column;
		border: none;
		height: 100%;
		width: 100%;
		max-height: 100%;
		max-width: 100%;
		// overflow: hidden;

		// background: #ebf0f6;
		&-editor {
			flex: 1;
			display: flex;
			background: #fff;
		}

		&-button {
			width: fit-content;
		}

		.icon {
			width: 23px;
			height: 23px;

			&-face {
				margin: 7px;
			}

			&-more {
				margin: 7px 0px;
			}
		}

		&-wx {
			&-audio {
				&-open {
					flex: 1;
				}
			}
		}

		&-emoji-picker {
			padding-top: 10px;
			box-sizing: border-box;
		}
	}

	.message-input-h5 {
		display: flex;
		flex-direction: column;
		height: calc(100% - 20px);
		width: calc(100% - 20px);
		max-height: 100%;
		max-width: calc(100% - 20px);
		padding: 10px;
		// overflow: hidden;
	}

	.flex-row {
		display: flex;
		flex-direction: row;
	}

	.message-input-send {
		.send {
			padding: 8rpx 28rpx;
			border-radius: 10rpx;
			background: #07c160;
		}
	}
</style>