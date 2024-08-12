<template>
	<div @click.stop='onStop' :class="['message-input pos-relative', !isPC && 'message-input-h5']">
		<div :class="['flex-row flex-align-end safe-bottom']" style="position: relative;">
			<MessageInputAudio ref="msgAudio" :class="[
          'message-input-audio mr-10 mt-10',
          isWeChat && 'message-input-wx-audio',
          isFunctionShow('audio') && 'message-input-wx-audio-open',
        ]" :isAudioMainShow="showAudio" @switchAudio="switchAudio"></MessageInputAudio>
			<div v-show="!showAudio" class="message-input-emoji ml-10 mt-10"
				@click="onEmojiClick">
				<imageIcon width="54rpx" height="54rpx" name="sticker2"></imageIcon>
			</div>
			<MessageInputEditor v-show="!showAudio" class="message-input-editor" ref="editor"
				:placeholder="placeholder" :isMuted="isMuted" :muteText="muteText" :enableInput="enableInput"
				:enableAt="enableAt" :enableTyping="enableTyping" :isGroup="isGroup" :isOnFocus="isOnFocus"
				@sendMessage="sendMessage" @onTyping="onTyping" @onAt="onAt" @onFocus="onFocus" @onBlur="onBlur"
				@sendEditMessage="sendEditMessage">
			</MessageInputEditor>
			<MessageInputAt v-show="enableAt" ref="messageInputAtRef" @insertAt="insertAt" @onAtListOpen="onAtListOpen">
			</MessageInputAt>

			<div v-show="!editMsgContent&&!showAudio" class="message-input-send ml-20 mt-10 font-28"
				@touchend.prevent="sendMessage">
				<div class="send white-color">{{$tc('发送')}}</div>
			</div>

			<div v-show="editMsgContent" class="message-input-send ml-20 mt-10 font-28" @click="sendEditMessage">
				<div class="send white-color">{{$tc('编辑')}}</div>
			</div>
			<div class="message-input-more ml-10 mt-10" @click="clickOutlinedAdd" >
				<imageIcon  width="54rpx" height="54rpx" name="adds"></imageIcon>
			</div>
		</div>
		<MessageEdit v-if="editMsgContent" :style="{minWidth: 0}" :currentFunction="currentFunction" />
		
		<MessageQuote :style="{minWidth: 0}" :currentFunction="currentFunction" />
		<div v-show="showFootContent" :style="{ height: keyboardHeight ? (keyboardHeight + 'px') : 'auto' }" >

			
			<!-- <div class="message-input-emoji-picker" v-if="currentFunction=='emoji'"> -->
				<EmojiList :show="isShowEmoji" @change="changeEmojiList" @sendMessage="sendMessage" />
			<!-- </div> -->
			<MessageInputToolbar v-show="showToolbar"
				:class="['TUI-chat-message-input-toolbar', !isPC && 'TUI-chat-h5-message-input-toolbar']"
				@insertEmoji="insertEmoji" @sendFile='sendFile'></MessageInputToolbar>
		</div>
		<!-- 截图发送 -->
		<screenshot v-if="isScreenShow" :screenInfo='screenInfo' :isShow='isScreenShow' @closeModal='isScreenShow=false'
			@submit='submitScreen'></screenshot>
		<view v-if="isShowBox&&currentFunction==''" :style="{height:atHeight+'px'}">

		</view>
	</div>
</template>

<script>
	import TUIChatEngine, {
		TUIStore,
		StoreName,
		TUIChatService,
		IConversationModel,
	} from "@tencentcloud/chat-uikit-engine";
	import {
		ref,
		nextTick,
		getCurrentInstance,
		onMounted,
		onUnmounted,
		computed
	} from "../../../adapter-vue";
	import MessageInputToolbar from "../message-input-toolbar/index.vue";
	import MessageInputEditor from "./message-input-editor.vue";
	import MessageInputAt from "./message-input-at/index.vue";
	import MessageInputAudio from "./message-input-audio.vue";
	import EmojiPickerDialog from "../message-input-toolbar/emoji-picker/emoji-picker-dialog.vue";
	import MessageQuote from "./message-input-quote/index.vue";
	import MessageEdit from "./message-input-edit/index.vue";
	import Icon from "../../common/Icon.vue";
	import faceIcon from "../../../assets/icon/face-uni.png";
	import moreIcon from "../../../assets/icon/more-uni.png";
	import EmojiList from '../message-inputs/components/emojiList'
	import screenshot from "@/components/screenshot/index";
	import {
		isPC,
		isH5,
		isWeChat,
		isApp
	} from "../../../utils/env";
	import {
		sendMessages,
		sendTyping
	} from "../utils/sendMessage";
	import store from '@/store/index.js';
	import {
		removeTip
	} from '@/utils/util'
	import {
		ListMixin
	} from '@/mixin/list';

	export default {
		components: {
			MessageInputToolbar,
			MessageInputEditor,
			MessageInputAt,
			MessageInputAudio,
			EmojiPickerDialog,
			MessageQuote,
			MessageEdit,
			Icon,
			EmojiList,
			faceIcon,
			moreIcon,
			screenshot
		},
		props: {
			placeholder: {
				type: String,
				default: "this is placeholder",
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
			isGroup: {
				type: Boolean,
				default: false,
			},
			currentConversation: {
				type: Object || null,
				default: null,
			}
		},
		data() {
			return {
				isPC,
				isH5,
				isWeChat,
				isApp,
				filePath: '',
				isShowEmoji:false,
				showToolbar:false,
				atHeight: 0,
				isShowBox: false,
				isAudioEnable: '',
				currentFunction: '',
				inputIsEmpty: '',
				screenInfo: null,
				showAudio: false,
				isScreenShow: false,
				fileData: null,
				isOnFocus: false,
				sendTime: 0,
				sendStart: 0,
				sendEnd: 0,
				canSend: true,
				sendCount: 0,
				atInfoList: [],
			}
		},
		computed: {
		  editMsgContent() {
		    return store.state.editMsgContent
		  },
		  showFootContent() {
		    return !this.showAudio && (this.isShowEmoji || this.showToolbar || this.keyboardHeight)
		  }
		},
		beforeDestory() {
			uni.offKeyboardHeightChange(this.onKeyboardHeightChange)
			TUIStore.unwatch(StoreName.CHAT, {
				quoteMessage: this.onQuoteMessage,
			})
		},
		mounted() {
			this.uploadScreenshot(this.sendImage)
			uni.onKeyboardHeightChange(this.onKeyboardHeightChange)
			TUIStore.watch(StoreName.CHAT, {
				quoteMessage: this.onQuoteMessage,
			});
		},
		methods: {
			onKeyboardHeightChange(options) {
				this.$store.commit('setKeyboardHeight',options.height)
			},
			sendFile(e) {
				this.$emit('sendFile', e)
			},
			onEmojiClick(){
				let {currentFunction,isShowEmoji,keyboardHeight,showToolbar}=this
				if(isShowEmoji){
					if(keyboardHeight){
						this.$store.commit('setKeyboardHeight',0)
					}else{
						this.isShowEmoji=false
					}
				}else{
					this.isShowEmoji=true
					console.log('keyboardHeight',keyboardHeight)
					if(showToolbar)this.showToolbar=false
				}
			},
			onBlur() {
				this.isOnFocus = false;
			},
			clickOutlinedAdd() {
				if(this.showAudio){
					this.$refs.msgAudio.switchAudio()
				}
				
				if (this.showToolbar) {
					this.isOnFocus = true;
				  if (this.keyboardHeight) {
					  this.$store.commit('setKeyboardHeight',0)
				    
				  } else {
				    this.showToolbar = false
				  }
				} else {
				  this.showToolbar = true
				  if (this.isShowEmoji) {
				    this.isShowEmoji = false
				  }
				}
			},
			hideBox() {
				this.isShowBox = false
				this.isShowEmoji=false
				this.showToolbar=false
			},
			toSendData() {
				let info = this.currentConversation
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
			},
			//发送图片
			sendImage(imgBlob, data) {
				console.log('data', data)
				this.screenInfo = {
					imgBlob,
					info: {
						fileFun: 'sendImageMessage',
						fileData: data
					}
				}
				this.isScreenShow = true
				this.fileData = {
					file: data,
				}
			},
			submitScreen(val) {
				const options = {
					to: this.currentConversation.groupProfile.groupID ||
						this.currentConversation.userProfile.userID,
					conversationType: this.currentConversation.type,
				}
				TUIChatService.sendImageMessage({
					...options,
					payload: this.fileData
				})
				TUIChatService.sendTextMessage({
					...options,
					payload: {
						text: val.text
					}
				});
			},
			switchAudio(value) {
				this.showAudio = value
				if(!value){
					this.isOnFocus = true;
				}
			},
			changeEmojiList(emoji) {
				this.$refs.editor.addEmoji && this.$refs.editor.addEmoji({
					name: emoji
				});
			},
			//设置输入框是否聚焦
			switchEmojiAndFeature(funcName) {
				this.$nextTick(() => {
					this.currentFunction = funcName
					this.isOnFocus = false
				})
				if (this.currentFunction === 'emoji') {
					if (funcName === 'emoji') {
						this.currentFunction = "";
					} else {
						this.currentFunction = funcName;
					}
					if (funcName === 'more') {
						this.$nextTick(() => {
							this.$emit("handleToolbarListShow", funcName);
						});
					}
				} else if (this.currentFunction === 'more') {
					this.$emit("handleToolbarListShow");
					if (funcName === 'more') {
						this.$nextTick(() => {
							this.currentFunction = ""
							this.isOnFocus = true
						})
					} else {
						this.$nextTick(() => {
							this.currentFunction = funcName;
						});
					}
				} else {
					this.currentFunction = funcName;
					if (funcName === 'more') {
						this.$emit("handleToolbarListShow");
					}
				}
			},
			isFunctionShow(funcName) {
				if (this.currentFunction === funcName) {
					return true
				}
				return false
			},
			onTyping(inputContentEmpty, inputBlur) {
				this.inputIsEmpty = inputContentEmpty
				sendTyping(inputContentEmpty, inputBlur);
			},
			onAt(show) {
				this.$refs.messageInputAtRef.toggleAtList(show)
			},
			onFocus(keyboardHeight) {
				this.toggleBox()
			},
			resetReplyOrReference() {
				console.warn("resetReplyOrReference");
			},
			onStop() {
				uni.$emit('closeMessageTool', {
					show: false
				})
			},
			getSendCoolTime() {
				const now = parseInt(Date.now() / 1000)
				const interval = 10 // 间隔N秒
				const total = 15 // 条数

				if (now > this.sendEnd) {
					this.sendStart = now
					this.sendEnd = now + interval
					this.sendCount = 0
				}

				if (now < this.sendEnd && this.sendCount >= total) {
					this.canSend = false

					if (this.sendTime > 0) return
					this.sendTime = 2
					setSendCoolTime()
					return
				}

				this.sendCount++
			},
			setSendCoolTime() {
				setTimeout(() => {
					this.sendTime--
					if (this.sendTime <= 0) {
						this.sendCount = 0
						this.sendStart = 0
						this.sendEnd = 0
						this.canSend = true
						return
					}
					setSendCoolTime()
				}, 1000)
			},
			async sendMessage() {

				// if (this.canSend == false) {
				// 	uni.$u.toast('操作频繁')
				// 	return
				// }

				let messageList;
				if (this.$refs.editor.getEditorContent) {
					messageList = this.$refs.editor.getEditorContent();
					this.$refs.editor.setEditorContent('')
				}
				this.$refs.editor.resetEditor && this.$refs.editor.resetEditor();
				let txt=messageList[0].payload.text.trim()
				if(txt.length==0){
					uni.showToast({
						icon:'none',
						title:this.$tc('不能发送空白消息')
					})
					return
				}
				// 发送艾特逻辑
				if (messageList[0].payload.atUserList) {
					let atList = [...new Map(this.atInfoList.map(item => [item.id, item])).values()]
					let {
						atUserList
					} = messageList[0].payload
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
					this.atInfoList.length = 0
				}

				// console.log('oldText',messageList[0].payload.text)
				// return 

				this.currentFunction = ''
				await sendMessages(
					messageList,
					this.currentConversation
				);
				this.$emit("sendMessage");
			},
			sendEditMessage() {
				let inputContent = this.$refs.editor.getEditorContent()
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
							oldText = oldText.replace(regex, `@${ListMixin.methods.deleteChannel(item)}_{${item}}`)
						}
					})
					sendContent.payload.text = oldText
				}

				TUIChatEngine.chat.modifyMessage(sendContent).then(res => {
					console.log('编辑成功', res)
				})
				this.$refs.editor.resetEditor && this.$refs.editor.resetEditor();
			},
			insertEmoji(emoji) {
				this.$refs.editor.addEmoji && this.$refs.editor.addEmoji(emoji);
			},

			deleteEmoji() {
				this.$refs.editor.deleteEmoji && this.$refs.editor.deleteEmoji();
			},
			longpressToDelete() {
				this.$refs.editor.longpressToDelete && this.$refs.editor.longpressToDelete()
			},
			longpressStop() {
				this.$refs.editor.longpressStop && this.$refs.editor.longpressStop()
			},
			insertAt(atInfo) {
				this.atInfoList = [...this.atInfoList, atInfo]
				this.$refs.editor.insertAt && this.$refs.editor.insertAt(atInfo);
			},
			onAtListOpen() {
				this.$refs.editor.blur && this.$refs.editor.blur();
			},
			// 消息撤回后重新编辑
			reEdit(content) {
				this.$refs.editor.resetEditor();
				this.resetReplyOrReference();
				this.$refs.editor.setEditorContent(content);
			},
			toggleBox() {
				this.$nextTick(() => {
					this.currentFunction = ''
				})
			},
			getName() {
				return this.currentFunction
			},
			onQuoteMessage(options) {
				if (options.message && options.type === "quote") {
					// 监听到新的消息引用
					this.isOnFocus = true;
				}
			}
		}
	}
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
		height: 60rpx;
		.send {
			padding: 8rpx 28rpx;
			border-radius: 10rpx;
			background: #07c160;
		}
	}
	.safe-bottom{
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		box-sizing: content-box;
	}
</style>