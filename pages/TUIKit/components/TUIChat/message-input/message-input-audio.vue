<template>
	<div class="message-input-audio" :class="[isAudioMainShow && 'message-input-audio-open']">
		<div  @click="switchAudio">
			<!-- <Icon class="audio-message-icon" :file="audio"></Icon> -->
			<imageIcon width="54rpx" height="54rpx" name="mike2"></imageIcon>
		</div>
		<view v-if="isAudioMainShow" class="TUI-message-input-main" @longpress="handleLongPress"
			@touchmove="handleTouchMove" @touchend="handleTouchEnd">
			<span>{{ $tc(textValue) }}</span>
			<view :class="['record-modal',isIOS? 'iosClass':'andClass']" v-if="popupToggle" @longpress="handleLongPress" @touchmove="handleTouchMove"
				@touchend="handleTouchEnd">
				<view class="wrapper">
					<view class="modal-loading"></view>
				</view>
				<view class="modal-title">
					{{ $tc(title) }}
					<text v-if="title2">,{{$tc(title2)}}</text>
				</view>
			</view>
		</view>
	</div>
</template>

<script>
	import { ref, onMounted, onUnmounted } from "../../../adapter-vue";
	import {
		TUIStore,
		StoreName,
		TUIChatService,
		SendMessageParams,
		IConversationModel,
	} from "@tencentcloud/chat-uikit-engine";
	import { isH5, isWeChat, isApp } from "../../../utils/env";
	import { TUIGlobal } from "../../../utils/universal-api/index";
	import { isEnabledMessageReadReceiptGlobal } from "../utils/utils";
	import Icon from "../../common/Icon.vue";
	import audio from "../../../assets/icon/audio.svg";
	import { tc } from '@/utils/util'
	
	export default {
		components: {
			Icon
		},
		props: {
			isAudioMainShow: {
				type: Boolean,
				default: true,
			}
		},
		data() {
			return {
				isH5,
				isWeChat,
				isApp,
				showAudioMain: false,
				recorderManager: '',
				popupToggle: false,
				isRecording: false,
				canSend: true,
				textValue: '按住说话',
				title: '',
				title2: '',
				recordTime: '',
				recordTimer: null,
				currentConversation: null,
				touchesTop: null,
				isIOS: false
			}
		},
		mounted() {
			this.recorderManager = TUIGlobal.getRecorderManager()
			
			this.onWatchStore()
			this.initRecorder()
			let system = uni.getSystemInfoSync()
			this.isIOS = system.platform === 'ios'
		},
		beforeDestory() {
			TUIStore.unwatch(StoreName.CONV, {
				currentConversation: this.onCurrentConversation,
			})
		},
		methods: {
			onCurrentConversation(conversation) {
				this.currentConversation = conversation
			},
			onWatchStore() {
				TUIStore.watch(StoreName.CONV, {
					currentConversation: this.onCurrentConversation,
				})
			},
			initRecorder() {
				// 加载声音录制管理器
				this.recorderManager.onStop((res) => {
					clearInterval(this.recordTimer);
					// 兼容 uniapp 打包app，duration 和 fileSize 需要用户自己补充
					// 文件大小 ＝ (音频码率) x 时间长度(单位:秒) / 8
					let msg = {
						duration: res.duration ? res.duration : this.recordTime * 1000,
						tempFilePath: res.tempFilePath,
						fileSize: res.fileSize
							? res.fileSize
							: ((48 * this.recordTime) / 8) * 1024,
					};
					TUIGlobal.hideLoading();
					// 兼容 uniapp 语音消息没有duration
					if (this.canSend) {
						if (msg.duration < 1000) {
							TUIGlobal.showToast({
								title: tc("录音时间太短"),
								icon: "none",
							});
						} else {
							// res.tempFilePath 存储录音文件的临时路径
							const options = {
								to: this.currentConversation?.groupProfile?.groupID || this.currentConversation?.userProfile?.userID,
								conversationType: this.currentConversation.type,
								payload: { file: msg },
								needReadReceipt: isEnabledMessageReadReceiptGlobal(),
							}
							TUIChatService.sendAudioMessage(options);
						}
					}
					this.popupToggle = false;
					this.isRecording = false;
					this.canSend = true;
					this.title = " ";
					this.textValue = "按住说话";
				});
				this.recorderManager.onError((errMsg) => {
					console.warn('recorder error:', errMsg);
				});
			},
			switchAudio() {
				this.showAudioMain = !this.showAudioMain
				this.$emit("switchAudio", this.showAudioMain)
			},
			handleLongPress(e) {
				const appAuthorizeSetting = uni.getAppAuthorizeSetting();
				if (appAuthorizeSetting.microphoneAuthorized != "authorized") {
					uni.$emit('showMicNeed')
					return
				}
				
				this.popupToggle = true;
				this.recorderManager.start({
					duration: 60000,
					// 录音的时长，单位 ms，最大值 600000（10 分钟）
					sampleRate: 44100,
					// 采样率
					numberOfChannels: 1,
					// 录音通道数
					encodeBitRate: 192000,
					// 编码码率
					format: "mp3", // 音频格式，选择此格式创建的音频消息，可以在即时通信 IM 全平台（Android、iOS、微信小程序和Web）互通
				});
				this.title = "正在录音";
				this.isRecording = true;
				this.recordTime = 0;
				this.recordTimer = setInterval(() => {
					this.recordTime++
				}, 1000)
			},
			// 录音时的手势上划移动距离对应文案变化
			handleTouchMove(e) {
				console.log('isAudioMainShow',this.isAudioMainShow,this.isRecording)
				if (this.isRecording) {
					if (!this.touchesTop) this.touchesTop = e.changedTouches[e.changedTouches.length - 1].clientY
					if (
						this.touchesTop -
						e.changedTouches[e.changedTouches.length - 1].clientY >
						100
					) {
						this.textValue = "抬起停止";
						this.title = "松开手指，取消发送";
						this.title2 = "";
						this.canSend = false;
					} else if (
						this.touchesTop -
						e.changedTouches[e.changedTouches.length - 1].clientY >
						20
					) {
						this.textValue = "抬起停止";
						this.title = "上划可取消";
						this.title2 = "";
						this.canSend = true;
					} else {
						this.textValue = "抬起停止";
						this.title = "正在录音";
						this.title2 = "上划可取消";
						this.canSend = true;
					}
				}
			},
			// 手指离开页面滑动
			handleTouchEnd() {
				this.isRecording = false
				this.popupToggle = false
				this.textValue = "按住说话"
				TUIGlobal.hideLoading()
				this.recorderManager.stop()
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import url("../../../assets/styles/common.scss");

	.message-input-audio {
		display: flex;
		flex-direction: row;

		.audio-message-icon {
			width: 23px;
			height: 23px;
			justify-items: center;
			padding: 7px 7px 7px 0px;
		}

		.audio-contain {
			display: flex;
			justify-content: center;
			font-size: 32rpx;
			font-family: PingFangSC-Regular;
		}

		.TUI-message-input-main {
			flex: 1;
			border-radius: 9.4px;
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
			background-color: #ffffff;
			-webkit-touch-callout: none;
			-webkit-user-select: none;
			-khtml-user-select: none;
			-moz-user-select: none;
			-ms-user-select: none;
			user-select: none;

			.record-modal {
				height: 300rpx;
				width: 60vw;
				background-color: #000;
				opacity: 0.8;
				position: fixed;
				// top: 670rpx;
				// top: -800rpx;
				z-index: 9999;
				left: 20vw;
				border-radius: 24rpx;
				display: flex;
				flex-direction: column;
			}

			.record-modal .wrapper {
				display: flex;
				height: 200rpx;
				box-sizing: border-box;
				padding: 10vw;
			}

			.record-modal .wrapper .modal-loading {
				opacity: 1;
				width: 40rpx;
				height: 16rpx;
				border-radius: 4rpx;
				background-color: #006fff;
				animation: loading 2s cubic-bezier(0.17, 0.37, 0.43, 0.67) infinite;
			}

			@keyframes loading {
				0% {
					transform: translate(0, 0);
				}

				50% {
					transform: translate(30vw, 0);
					background-color: #f5634a;
					width: 40px;
				}

				100% {
					transform: translate(0, 0);
				}
			}

			.modal-title {
				text-align: center;
				color: #fff;
			}
		}

		&-open {
			flex: 1;
		}
	}
	.iosClass{
		top: 670rpx;
	}
	.andClass{
		top: 670rpx;
	}
</style>