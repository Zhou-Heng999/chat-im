<template>
	<div v-if="Boolean(quoteMessage) && currentFunction !== 'audio'" :class="[
      'input-quote-container',
      !isPC && 'input-quote-container-h5',
      isUniFrameWork && 'input-quote-container-uni'
    ]">
		<div class="input-quote-content flex-between">
			<div class="def-quote">
				<div class="def-quote--sender">{{ quoteMessage.nick || quoteMessage.from }}:</div>
				<div class="def-quote--text" style="padding-top: 10rpx;">{{ removeTip(quoteContentText) }}</div>
			</div>
			<Icon class="input-quote-close-icon" :file="closeIcon" width="11px" height="11px" @onClick="cancelQuote" />
		</div>
	</div>
</template>

<script>
	import { ref, computed, onMounted, onUnmounted } from "../../../../adapter-vue";
	import TUIChatEngine, {
		TUIStore,
		StoreName,
		TUITranslateService,
		IMessageModel,
	} from "@tencentcloud/chat-uikit-engine";
	import Icon from "../../../common/Icon.vue";
	import closeIcon from "../../../../assets/icon/icon-close.svg";
	import { isPC, isUniFrameWork } from "../../../../utils/env";
	import { tc } from '@/utils/util'
	
	const TYPES = TUIChatEngine.TYPES;
	
	export default {
		components: {
			Icon
		},
		data() {
			return {
				isPC,
				isUniFrameWork,
				closeIcon,
				quoteMessage: '',
			}
		},
		props: ['currentFunction'],
		computed: {
			quoteContentText() {
				let _quoteContentText;
				console.log('111', this.quoteMessage)
				let text = this.getQuoteMsg(this.quoteMessage)._quoteContentText;
				return tc(text);
			}
		},
		mounted() {
			this.onWatchStore()
		},
		beforeDestory() {
			this.onUnWatchStore()
		},
		methods: {
			onQuoteMessage(options) {
				if (options.message && options.type === "quote") {
					this.quoteMessage = options.message
				} else {
					this.quoteMessage = undefined
				}
			},
			onCurrentConversationID() {
				return this.cancelQuote()
			},
			onWatchStore() {
				TUIStore.watch(StoreName.CHAT, {
					quoteMessage: this.onQuoteMessage,
				});
				TUIStore.watch(StoreName.CONV, {
					currentConversationID: this.onCurrentConversationID
				})
			},
			onUnWatchStore() {
				TUIStore.unwatch(StoreName.CHAT, {
					quoteMessage: this.onQuoteMessage,
				});
				TUIStore.unwatch(StoreName.CONV, {
					currentConversationID: this.onCurrentConversationID
				})
			},
			getQuoteMsg(quoteMessage) {
				let robj = {
					_quoteContentText: "",
					_type: -1
				}
				
				switch (quoteMessage.type) {
					case TUIChatEngine.TYPES.MSG_MERGER:
				
						robj._type = 0;
						robj._quoteContentText = quoteMessage.payload.title
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
				console.log('robj', robj)
				return robj;
			},
			cancelQuote() {
				TUIStore.update(StoreName.CHAT, "quoteMessage", { message: undefined, type: "quote" })
			}
		}
	}
</script>

<style lang="scss" scoped>
	.input-quote-container {
		// margin: 5px 100px 5px 8px;
		margin: 0 !important;
		display: flex;
		flex: 0 1 auto;
		position: absolute;
		top: -100rpx;
		left: 0;

		.input-quote-content {
			position: relative;
			display: flex;
			flex: 0 1 auto;
			border-radius: 8px;
			padding: 8px 12px;
			font-size: 14px;
			align-items: center;
			line-height: 16px;
			width: 750rpx;
			box-sizing: border-box;
			min-width: 0;
			background: #FCFCFC;
			box-shadow: 0px -1px 1px #e9e9e9;

			&::before {
				content: '';
				position: absolute;
				top: 50%;
				left: 6px;
				transform: translateY(-50%);
				width: 2px;
				height: 68%;
				background: #4285F6;
			}

			.max-one-line {
				flex: 0 1 auto;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.def-quote {
				display: flex;
				flex-direction: column;
				justify-content: center;

				.def-quote--sender {
					color: #4285F6;
				}

				.def-quote--text {
					word-break: break-all;
					overflow: hidden;
					display: -webkit-box;
					-webkit-line-clamp: 1;
					-webkit-box-orient: vertical;
				}
			}
		}

		.input-quote-close-icon {
			margin-left: 5px;
			padding: 5px;
		}
	}

	.input-quote-container-h5 {
		@extend .input-quote-container;
		margin: 5px 0 0;
	}

	.input-quote-container-uni {
		@extend .input-quote-container;
		margin: 5px 60px 0 30px;
	}
</style>