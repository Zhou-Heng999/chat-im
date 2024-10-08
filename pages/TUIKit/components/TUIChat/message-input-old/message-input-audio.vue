<template>
	<div class="message-input-audio" :class="[props.isAudioMainShow && 'message-input-audio-open']">
		<div v-if="isApp || isWeChat || isH5" @click="switchAudio">
			<!-- <Icon class="audio-message-icon" :file="audio"></Icon> -->
			<imageIcon width="54rpx" height="54rpx" name="outlined_mike2"></imageIcon>
		</div>
		<view v-if="props.isAudioMainShow" class="TUI-message-input-main" @longpress="handleLongPress"
			@touchmove="handleTouchMove" @touchend="handleTouchEnd">
			<span>{{ $tc(textValue) }}</span>
			<view class="record-modal" v-if="popupToggle" @longpress="handleLongPress" @touchmove="handleTouchMove"
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

<script setup lang="ts">
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

	const props = defineProps({
		isAudioMainShow: {
			type: Boolean,
			default: false,
		},
	});

	const emits = defineEmits(["switchAudio"]);

	const showAudioMain = ref<boolean>(false);
	const recorderManager = TUIGlobal?.getRecorderManager();
	const popupToggle = ref(false);
	const isRecording = ref(false);
	const canSend = ref(true);
	const textValue = ref("按住说话");
	const title = ref();
	const title2 = ref();
	const recordTime = ref();
	const recordTimer = ref(null);
	const currentConversation = ref<IConversationModel>();

	const onCurrentConversation = (conversation : IConversationModel) => {
		currentConversation.value = conversation;
	}

	function onWatchStore() {
		TUIStore.watch(StoreName.CONV, {
			currentConversation: onCurrentConversation,
		});
	}

	const switchAudio = () => {
		showAudioMain.value = !showAudioMain.value;
		emits("switchAudio", showAudioMain.value);
	};
	onUnmounted(() => {
		TUIStore.unwatch(StoreName.CONV, {
			currentConversation: onCurrentConversation,
		});
	})

	onMounted(() => {
		onWatchStore()
		// 加载声音录制管理器
		recorderManager.onStop((res : any) => {
			clearInterval(recordTimer.value);
			// 兼容 uniapp 打包app，duration 和 fileSize 需要用户自己补充
			// 文件大小 ＝ (音频码率) x 时间长度(单位:秒) / 8
			let msg = {
				duration: res.duration ? res.duration : recordTime.value * 1000,
				tempFilePath: res.tempFilePath,
				fileSize: res.fileSize
					? res.fileSize
					: ((48 * recordTime.value) / 8) * 1024,
			};
			TUIGlobal?.hideLoading();
			// 兼容 uniapp 语音消息没有duration
			if (canSend.value) {
				if (msg.duration < 1000) {
					TUIGlobal?.showToast({
						title: tc("录音时间太短"),
						icon: "none",
					});
				} else {
					// res.tempFilePath 存储录音文件的临时路径
					const options = {
						to:
							currentConversation?.value?.groupProfile?.groupID ||
							currentConversation?.value?.userProfile?.userID,
						conversationType: currentConversation?.value?.type,
						payload: { file: msg },
						needReadReceipt: isEnabledMessageReadReceiptGlobal(),
					} as SendMessageParams;
					TUIChatService?.sendAudioMessage(options);
				}
			}
			popupToggle.value = false;
			isRecording.value = false;
			canSend.value = true;
			title.value = " ";
			textValue.value = "按住说话";
		});
		recorderManager.onError((errMsg : any) => {
			console.warn('recorder error:', errMsg);
		});
	});

	const handleLongPress = (e : any) => {
		const appAuthorizeSetting = uni.getAppAuthorizeSetting();
		if (appAuthorizeSetting.microphoneAuthorized != "authorized") {
			uni.$emit('showMicNeed')
			return
		}



		popupToggle.value = true;
		recorderManager.start({
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
		title.value = "正在录音";
		isRecording.value = true;
		recordTime.value = 0;
		recordTimer.value = setInterval(() => {
			recordTime.value++;
		}, 1000);
	};
	const touchesTop = ref(null)
	// 录音时的手势上划移动距离对应文案变化
	const handleTouchMove = (e : any) => {
		if (isRecording.value) {
			if (!touchesTop.value) touchesTop.value = e.changedTouches[e.changedTouches.length - 1].clientY
			if (
				touchesTop.value -
				e.changedTouches[e.changedTouches.length - 1].clientY >
				100
			) {
				textValue.value = "抬起停止";
				title.value = "松开手指，取消发送";
				title2.value = "";
				canSend.value = false;
			} else if (
				touchesTop.value -
				e.changedTouches[e.changedTouches.length - 1].clientY >
				20
			) {
				textValue.value = "抬起停止";
				title.value = "上划可取消";
				title2.value = "";
				canSend.value = true;
			} else {
				textValue.value = "抬起停止";
				title.value = "正在录音";
				title2.value = "上划可取消";
				canSend.value = true;
			}
		}
	};

	// 手指离开页面滑动
	const handleTouchEnd = () => {
		isRecording.value = false;
		popupToggle.value = false;
		textValue.value = "按住说话";
		TUIGlobal?.hideLoading();
		recorderManager.stop();
	};
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
				top: -800rpx;
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
</style>