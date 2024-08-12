<template>
	<div class="message-bubble " :class="[ !isNoPadding && isBlink ? 'blink-content' : '' ]" :style="{'padding-left': isCheckMore?'70rpx':'22px'}">

		<!-- todo 统一组件处理-->
		<div class="message-bubble-main-content pos-relative" @click="changeItemCheck(message)"
			:class="[message.flow === 'in' ? '' : 'reverse']">
			<!-- <view v-if="getContent(message)"
				:class="['from-info fle-align',message.flow === 'in'?'from-in':'from-out']">
				<span class="mr-10">{{$tc('转发的消息')}}</span>
				<span>{{message._message.cloudCustomData.from}}</span>
			</view> -->
			<view class="check-box flex-center">
				<imageIcon width="34rpx" height="34rpx" v-if="isCheckMore&&message.isCheck"
					:src="`/static/images/tb_g1.png`"></imageIcon>
					<imageIcon width="34rpx" height="34rpx" v-if="isCheckMore&&!message.isCheck"
						:src="`/static/images/tb_g2.png`"></imageIcon>
			</view>
			<avatarModal @click='onClickAvatar(message)' v-if="message.flow=='in'" :info='{...message,remark:props.content.showName}' w='80'
				h='80' idKey='from'   ></avatarModal>
				<!-- <view style="height: 80rpx;width: 80rpx;" v-else >
					
				</view> -->
			<main :id="`main_${message.ID}`" class="message-body pos-relative" @touchstart="touchstart" @touchmove='touchmove' @touchend="touchend" >
				<!-- @tap.stop="handleTap" -->
				<!-- @touchstart="touchstart" @touchmove='touchmove' @touchend="touchend" -->
				<!-- @longpress='onLongPress($event)' -->
				<div v-if="message.flow === 'in' && message.conversationType === 'GROUP'" class="message-body-nickName">
					{{ props.content.showName }}
				</div>
				<div :class="['message-body-main pos-relative', message.flow === 'out' && 'message-body-main-reverse']">
					<!-- !isNoPadding && isBlink ? 'blink-content' : '', -->
					<div :class="[
					  'blink ',
					  'message-body-content',
					  message.type=='TIMCustomElem'&&message.payload.description=='business'?'content-custom':'',
					  message.flow === 'out' ? 'content-out' : 'content-in',
					  message.hasRiskContent && 'content-has-risk',
					  isNoPadding ? 'content-noPadding' : '',
					  isNoPadding && isBlink ? 'blink-shadow' : '',
					  
					]">
						<div :class=" ['content-main',getQuoteMsg(message)]   ">
							<DefMessageQuote @scrollToOriginalMessage='scrollToOriginalMessage' :message="message" @blinkMessage="blinkMessage" @scrollTo="scrollTo" />
							<view v-if="getContent(message)&&getContent(message).from"
								:class="['from-info fle-align',message.flow === 'in'?'from-in':'from-out',message.type === TYPES.MSG_CUSTOM? 'mt-20 ml-20':'']">
								<span class="mr-10">{{$tc('转发的消息')}}</span>
								<span>{{getContent(message).from}}</span>
							</view>
							<image 
								v-if="(message.type === TYPES.MSG_IMAGE || message.type === TYPES.MSG_VIDEO) && message.hasRiskContent" 
								:class="['message-risk-replace', !isPC && 'message-risk-replace-h5']" 
								:src="riskImageReplaceUrl" 
							/>
							<slot v-else></slot>
						</div>
						<!-- 敏感信息失败提示 -->
						<div v-if="message.hasRiskContent" class="content-has-risk-tips">
							{{ riskContentText }}
						</div>
					</div>
					<!-- 发送失败 -->
					<div v-if="message.status === 'fail' || message.hasRiskContent" class="message-label fail"
						@click="resendMessage()">
						!
					</div>
					<!-- 加载图标 -->
					<Icon v-if="message.status === 'unSend' && needLoadingIconMessageType.includes(message.type)"
						class="message-label loadingCircle" :file="loadingIcon" :width="'15px'" :height="'15px'"></Icon>
					<!-- 已读 & 未读 -->

					<ReadStatus class="message-label align-self-bottom" :isPower='props.isPower' :message="shallowCopyMessage(message)" />
					<!-- @openReadUserPanel="openReadUserPanel" -->
					<!-- 提示框 -->
				<!-- 	<MessageTool :class="[
		      'message-tool',
		      message.flow === 'out' ? 'message-tool-out' : 'message-tool-in',
		    ]" :style="toolStyle" :messageItem="message" @onChangeMsg='onChangeMsg' @onChangeMsgPinned='onChangeMsgPinned'
						v-if="message.ID === props.toggleID && !hiddenTool" /> -->
				</div>

			</main>
		</div>
		<!-- 消息附加区域 -->
		<div class="message-bubble-extra-content" :class="message.flow === 'in' || 'reverse'">
			<!-- 消息引用 -->
			<!-- <MessageQuote :message="message" @blinkMessage="blinkMessage" @scrollTo="scrollTo" /> -->
		</div>
	</div>
</template>

<script lang="ts" setup>
	import {tc} from '@/utils/util'
	import { computed, toRefs, ref, getCurrentInstance,onUnmounted } from "../../../../adapter-vue";
	import TUIChatEngine, {

		TUITranslateService, IMessageModel, TUIStore,
		StoreName,

	} from "@tencentcloud/chat-uikit-engine";
	import Icon from "../../../common/Icon.vue";
	import ReadStatus from "./read-status/index.vue";
	import MessageQuote from "./message-quote/index.vue";
	import DefMessageQuote from "./def-message-quote/index.vue";
	import Avatar from "../../../common/Avatar/index.vue";
	import MessageTool from "../message-tool/index.vue";
	import loadingIcon from "../../../../assets/icon/loading.png";
	import { shallowCopyMessage } from "../../utils/utils";
	import { isPC } from "../../../../utils/env";
	const thisInstance = getCurrentInstance()?.proxy || getCurrentInstance();
	interface IProps {
		messageItem : IMessageModel;
		content ?: any;
		blinkMessageIDList ?: string[];
		isCheckMore ?: Boolean
		toggleID ?: string;
		hiddenTool ?: boolean,
		isPower ?: boolean,
	}

	interface IEmits {
		(e : 'resendMessage') : void;
		(e : 'blinkMessage', messageID : string) : void;
		(e : 'setReadReciptPanelVisible', visible : boolean, message ?: IMessageModel) : void;
		// 下面的方法是 uniapp 专属
		(e : "scrollTo", scrollHeight : number) : void;
		(e : "changeCheck",) : void;
		(e : "seeCardInfo",) : void;
		(e : "handChangeInput",) : void;
		(e : "onChangeMsgPinned",) : void;
		(e : "onChangeMsg",) : void;
		(e : "itemLongPress",) : void;
		(e : "setStyle",) : void;

	}
	const emits = defineEmits<IEmits>();
	const toolStyle = ref('')
	const timerInter = ref(null)
	const lastTapTime=ref(null)
	const handleTap=(e)=> {
	      const currentTime = new Date().getTime();
	      const interval = 300; // 300毫秒内被认为是双击
	
	      if (lastTapTime.value && currentTime - lastTapTime.value < interval) {
	        // 双击事件
			onLongPress(e)
	        // 在这里执行双击时的逻辑
	      } else {
	        // 单击事件
			e.stopPropagation()
	        console.log("Single Tap!",e);
	        // 在这里执行单击时的逻辑
	      }
	
	      lastTapTime.value = currentTime;
	    }
	const touchstart = (e) => {
		timerInter.value = setTimeout(() => {
			onLongPress(e)
		}, 1000)
	}
	const touchmove=(e)=>{
		clearTimeout(timerInter.value);
	}
	const touchend = () => {
		clearTimeout(timerInter.value);
	}
	const scrollToOriginalMessage=(id)=>{
		emits('scrollToOriginalMessage',id)
	}
	const getQuoteMsg=(msg)=>{
		let isShowStyle=''
		if(msg.cloudCustomData){
			try{
				let obj=JSON.parse(msg.cloudCustomData)
				if(obj.txt&&obj.messageReply){
				isShowStyle=msg.flow=='in'?'q-pd-20':'q-out q-pd-20'	
				}
			}catch(e){
				//TODO handle the exception
			}
		}
		return isShowStyle
	}
	const onLongPress = (e) => {
		let { screenHeight, screenWidth } = thisInstance.platform
		let { pageY, pageX } = e.touches[0]
		let toolStyle=null
		let quoteContent=false
		try{
			let messageCl =JSON.parse(message.value?.cloudCustomData || "{}");
			quoteContent= messageCl.messageReply?true:false
		}catch(e){
			quoteContent=false
			//TODO handle the exception
		}
		const query = uni.createSelectorQuery();  
			query.select(`#main_${message.value.ID}`).boundingClientRect();  
			query.exec(() => {  
				let extra = message.value.flow === 'in' ? 80 : -80
				if (pageY < screenHeight / 2) {
					toolStyle = { top: pageY + 'rpx', left:pageX + extra + 'rpx' }
				}
				if (pageY > screenHeight / 2) {
					toolStyle = { bottom: (screenHeight - pageY) + 'rpx', left:pageX + extra +'rpx' }
				}
				emits("setStyle",{toolStyle})
				emits("itemLongPress")
		});
	}

	// 提示框
	const onChangeMsgPinned = (message) => {
		emits('onChangeMsgPinned', message)
	}
	const onChangeMsg = (val) => {
		emits('onChangeMsg', true)
	}
	const currentConversationInfo = ref(null)
	const onCurrentConversation=(val)=>{
		currentConversationInfo.value = val
	}
	TUIStore.watch(StoreName.CONV, {
		currentConversation: onCurrentConversation,
	});
	
	onUnmounted(()=>{
		TUIStore.unwatch(StoreName.CONV, {
			currentConversation: onCurrentConversation,
		});
	})
	const onClickAvatar = (item) => {
		let info = currentConversationInfo.value
		let id = null
		if (info.type = 'C2C') {
			if (info.userProfile && info.userProfile.userID == item.from) {
				id = info.userProfile.userID
			} else {
				id = item.from
			}
		}
		thisInstance.setCardInfo(id, emits,info)
	}
	const toUser = (id) => {
		let userID = thisInstance.$setUserID(id)
		uni.navigateTo({
			url: `/pages/address/views/user/index?userID=${userID}`
		})
	}

	const props = withDefaults(defineProps<IProps>(), {
		messageItem: () => ({} as IMessageModel),
		content: () => ({}),
		blinkMessageIDList: () => [],
		isCheckMore: () => false,
		isPower: () => false,
	});

	const TYPES = TUIChatEngine.TYPES;
	const riskImageReplaceUrl =
		"https://web.sdk.qcloud.com/component/TUIKit/assets/has_risk_default.png";
	const needLoadingIconMessageType = [
		TYPES.MSG_LOCATION,
		TYPES.MSG_TEXT,
		TYPES.MSG_CUSTOM,
		TYPES.MSG_MERGER,
		TYPES.MSG_FACE,
	];

	const { blinkMessageIDList, messageItem: message } = toRefs(props);
	const changeItemCheck = (item : Object) => {
		emits("changeCheck", item);
		// console.log(item)
	}
	const isNoPadding = computed(() => {
		// return [TYPES.MSG_IMAGE, TYPES.MSG_VIDEO].includes(message.value.type);		//判断了如果是视频或者图片就改变引入样式
		return false
	});

	const riskContentText = computed<string>(() => {
		let content = tc(TUITranslateService.t("TUIChat.涉及敏感内容")) + ", ";
		if (message.value.flow === "out") {
			content += tc(TUITranslateService.t("TUIChat.发送失败"));
		} else {
			content += tc(TUITranslateService.t(
				message.value.type === TYPES.MSG_AUDIO ? "TUIChat.无法收听" : "TUIChat.无法查看"
			));
		}
		return content;
	});

	const isBlink = computed(() => {
		if (message.value?.ID) {
			return blinkMessageIDList?.value?.includes(message.value.ID);
		}
		return false;
	});

	function resendMessage() {
		if (!message.value?.hasRiskContent) {
			emits("resendMessage");
		}
	}
	function getContent(msg) {
		if(!msg._message?.cloudCustomData)return ''
		let t=''
		try{
			t=JSON.parse(msg._message?.cloudCustomData)
		}catch(e){
			t=''
			//TODO handle the exception
		}
		return t || ''
	}
	function blinkMessage(messageID : string) {
		emits("blinkMessage", messageID);
	}
	
	function scrollTo(scrollHeight : number) {
		emits("scrollTo", scrollHeight);
	}

	function openReadUserPanel() {
		emits("setReadReciptPanelVisible", true, message.value);
	}
</script>

<style lang="scss" scoped>
	@import url(../style/index.scss);

	.message-tool {
		position: absolute;
		z-index: 8;
		top: -50%;
	}
	.hidePad{
		padding-top: 8rpx !important;
		padding-bottom: 8rpx !important;
	}
	.message-tool {
		position: absolute;
		cursor: pointer;
		z-index: 5;
		// transform: translateY(-100%);
		width: 284rpx;
	}

	.message-tool-out {
		// right: 50%;
	}

	.message-tool-in {
		// left: 50%;
	}

	.reverse {
		display: flex;
		flex-direction: row-reverse;
		justify-content: flex-start;
	}
	.q-out{
		background: #C2E8FF;
	}
	.from-info {
		padding-bottom: 12rpx;
		color: #47a3fa;
		font-size: 24rpx;
	}

	.from-in {
		left: 100rpx;
	}

	.from-out {
		right: 100rpx;
	}

	.message-bubble {
		width: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		padding-top: 0;
		padding-right: 20px;
		padding-top: 28rpx;
		padding-bottom: 28rpx;
		// padding: 0 20px 40rpx 22px;
		position: relative;

		.message-bubble-main-content {
			display: flex;
			align-items: flex-end;
			position: relative;

			.check-box {
				position: absolute;
				bottom: 25rpx;
				left: -50rpx;
				transform: translate(0%, 0%);

			}

			.message-avatar {
				display: block;
				width: 36px;
				height: 36px;
				border-radius: 5px;
				flex: 0 0 auto;
			}

			.message-body {
				display: flex;
				flex: 0 1 auto;
				flex-direction: column;
				align-items: flex-start;
				margin: 0 8px;
				max-width: calc(100% - 54px);
				min-width: 130rpx;

				.message-body-nickName {
					margin-bottom: 4px;
					font-size: 12px;
					color: #999;
				}

				.message-body-main {
					display: flex;
					flex-direction: row;
					min-width: 0px;
					box-sizing: border-box;
					// width: 100%;

					&-reverse {
						flex-direction: row-reverse;
					}

					.message-body-content {
						display: flex;
						flex-direction: column;
						min-width: 100%;
						box-sizing: border-box;
						padding: 12px 14px;
						font-size: 14px;
						color: #000;
						letter-spacing: 0;
						word-wrap: break-word;
						word-break: break-all;
						position: relative;

						// overflow: hidden;
						.content-main {
							box-sizing: border-box;
							display: flex;
							flex-direction: column;
							flex-shrink: 0;
							align-content: flex-start;
							border: 0 solid black;
							margin: 0;
							padding: 0;
							min-width: 0;
							// margin-bottom: 2px;

							.message-risk-replace {
								width: 130px;
								height: 130px;
							}
						}

						.content-has-risk-tips {
							font-size: 12px;
							color: #fa5151;
							font-family: PingFang SC;
							margin-top: 5px;
							border-top: 1px solid #e5c7c7;
							padding-top: 5px;
						}
					}

					.content-in {
						color: #333333;
						border-radius: 20rpx 20px 20px 0px;
						min-width: 180rpx;
						max-width: 500rpx;
						box-shadow: 2px 2px 4px #e9e9e9;
						background: #fff;
					}

					.content-out {
						background: #C2E8FF;
						color: #000;
						border-radius: 20rpx 20rpx 0px 20rpx;
						min-width: 180rpx;
						max-width: 500rpx;
						position: relative;
					}

					.content-out-custom {
						border-radius: 20rpx 20rpx 0px 20rpx;
						min-width: 150rpx;
						position: relative;
					}

					.content-custom {
						background: #fff;
						padding: 0;
					}

					.content-noPadding {
						// padding: 0px;
						// background: transparent;
						border-radius: 10px;
						overflow: hidden;
					}

					.content-noPadding.content-has-risk {
						padding: 12px;
					}

					.content-has-risk {
						background: rgba(250, 81, 81, 0.16);
					}

					.blink-shadow {
						@keyframes shadowBlink {
							50% {
								box-shadow: rgba(255, 156, 25, 1) 0px 0px 10px 0px;
							}
						}

						box-shadow: rgba(255, 156, 25, 0) 0px 0px 10px 0px;
						animation: shadowBlink 1s linear 3;
					}

					.blink-content {
						@keyframes referenceBlink {
							50% {
								// background-color: #ff9c19;
								background-color: #D9EEFF;
							}
						}

						animation: referenceBlink 1s linear 3;
					}

					.message-label {
						align-self: flex-end;
						font-family: PingFangSC-Regular;
						font-size: 12px;
						color: #b3e0ff;
						word-break: keep-all;
						flex: 0 0 auto;
						// margin: 0px 8px;
						position: absolute;
						bottom: 2rpx;
						right: 10rpx;

						&.fail {
							width: 15px;
							height: 15px;
							border-radius: 15px;
							background: red;
							position: absolute;
							left: -45rpx;
							top: 50%;
							transform: translate(0, -50%);
							color: #fff;
							display: flex;
							justify-content: center;
							align-items: center;
							cursor: pointer;
						}

						&.loadingCircle {
							opacity: 0;
							position: relative;
							right: 0rpx;
							bottom: 25rpx;
							animation: circleLoading 2s linear 1s infinite;
						}

						@keyframes circleLoading {
							0% {
								transform: rotate(0);
								opacity: 1;
							}

							100% {
								opacity: 1;
								transform: rotate(360deg);
							}
						}
					}

					.align-self-bottom {
						align-self: flex-end;
					}
				}
			}
		}

		.message-bubble-extra-content {
			display: flex;
		}
	}
	.q-pd-20{
		padding: 20rpx !important;
	}
.blink-content {
	@keyframes referenceBlink {
		50% {
			// background-color: #ff9c19;
			background-color: #D9EEFF;
		}
	}

	animation: referenceBlink 1s linear 3;
}
</style>