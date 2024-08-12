<template>
	<div class="TUIChat" :class="[!isPC ? 'TUIChat-H5' : '']">
		<div class="TUIChat-main">
			<!-- <div class="TUIChat-safe-tips">
        <span>
          {{
            TUITranslateService.t(
              "TUIChat.【安全提示】本 APP 仅用于体验腾讯云即时通信 IM 产品功能，不可用于业务洽谈与拓展。请勿轻信汇款、中奖等涉及钱款的信息，勿轻易拨打陌生电话，谨防上当受骗。"
            )
          }}
        </span>
        <a @click="openComplaintLink(Link.complaint)">{{
          TUITranslateService.t("TUIChat.点此投诉")
        }}</a>
      </div> -->
			<!-- <div
        class="TUIChat-application-tips"
        v-if="isGroup && groupApplicationCount > 0"
        @click="toggleApplicationList()"
      > -->

			<!-- 查看旧数据 -->
			<view class="see-more-msg flex-center" style="top: 320rpx;bottom: auto;z-index: 10;" @click="toOldList"
				v-if="isSeeOldMessage">
				<image-icon name='tb_xxjt' style="transform: rotate(180deg);" size='28'></image-icon>
				{{unreadCountNum}}{{$tc('条新消息')}}
			</view>

			<!-- 回到最新消息 -->
			<view class="see-more-msg flex-center" style="bottom: 300rpx;z-index: 10;" @click="backNewList"
				v-if='isBackNewList'>
				<image-icon name='tb_xxjt' size='28'></image-icon>
				{{$tc('回到最新位置')}}
			</view>

			<view>
				<view v-if="!isShowEdit" class="max-width pos-relative">
					<slot name="topSlot"></slot>
					<div class="TUIChat-application-tips application-top-tips application-top-tips-notification"
						v-if="groupNotification" @click="clickNotification">
						<view class="right fix-width">
							<view class="title">{{$tc('群公告')}}</view>
							<scroll-view ref="refGroupNotification" scroll-x="true"
								:scroll-left="notificationScrollLeft" :show-scrollbar="false"
								class="scroll-group-notification">
								<view class="group-notification">{{
	      groupNotification
	    }}</view>
							</scroll-view>
						</view>
					</div>

					<div class="TUIChat-application-tips application-top-tips" v-if="pinnedMsgContent">

						<view v-if="pinnedMsgContent.type !== 1" class="left">
							<image :src="pinnedMsgContent.url" class="image-msg" mode="aspectFit" />
						</view>
						<view class="right">
							<view class="title">
								{{$tc("置顶消息")}} #{{pinnedMsgIndex+1}}
								<!-- <imageIcon name="close" size="36" @click="clickClosePinnedMsg" /> -->
							</view>

							<view v-if="pinnedMsgContent" style="display: flex;align-items: center;"
								@click="onPinnedMsgContent(pinnedMsgContent)">
								<view style="display: flex;align-items: baseline;width: 100%;">
									<!-- <view v-if="pinnedMsgContent.type == 2">
										<u--image class="" width="40rpx" height="40rpx" :src="pinnedMsgContent.url">
										</u--image>
									</view> -->
									<view class="msg-content ellipsis1">
										{{ removeTip(pinnedMsgContent.text) }}
									</view>

								</view>
								<u-icon style="" @tap.native.stop="clickClosePinnedMsg" class="mr-10" name="close"
									color="#737373" size="15"></u-icon>
								<!-- <Icon 
	  						style="position: absolute;right: 1%;" 
	  						:file="close" 
	  						size="20px" 
	  						@onClick="onDeletePinnedMsg()" 
	  					/> -->
							</view>


							<!-- <view class="msg-content ellipsis1">
	  					{{
	  						pinnedMsgContent.text
	  					}}
	  				</view> -->
						</view>
					</div>

					<!-- 用类选择器样式在app没生效 -->
					<view v-if="isGroup && groupApplicationCount > 0" style="
	  				display: flex; 
	  				justify-content: center; 
	  				align-items: center;
	  				width: 100%;
	  				background: #fce4d3;
	  				padding: 6px 0;
	  				font-size: 12px;
	  				" @click="clickDispose">
						<view>{{ `${groupApplicationCount} ` }}{{ $tc(TUITranslateService.t("TUIChat.条入群申请")) }}</view>
						<view style="padding-left: 10px; color: #006eff;">
							{{ $tc(TUITranslateService.t("TUIChat.点击处理"))}}
						</view>
					</view>

					<!-- loading -->
					<view class="loading-box max-width flex-center"
						v-if="isShowLoading&&!isGetAllData&&messageList.length>=15">
						<u-loading-icon></u-loading-icon>
					</view>
				</view>

				<view v-else class="flex-column max-width pd-lr-40 pd-tb-40">
					<view style="height: var(--status-bar-height);"></view>
					<view class="flex-wrap font-blod flex-align">
						<text class="font-36 mr-60" @click="cancelSelect">{{$tc('取消')}}</text>
						<text>{{checkedList.length}}</text>
					</view>
				</view>
			</view>

			<!-- <slot name="mainSlot"></slot> -->
			<!-- 	<z-paging id="messageScrollList" class="TUI-message-list" ref="paging" @scroll="_onScroll"
			:auto="false"
				:virtualList.sync="allMessageList" use-chat-record-mode use-virtual-list cell-height-mode="dynamic"
				safe-area-inset-bottom @scrolltolower='_scrolltolower' @query="queryList" @scrolltoupper='_scrolltoupper'> -->
			<!-- <view class="flex-column TUI-message-list"> -->


			<scroll-view id="messageScrollList" class="TUI-message-list" scroll-with-animation
				style="transform:scaleY(-1);overflow-y:auto ;overflow-x:hidden;" scroll-y :scroll-top="scrollTop"
				:scroll-into-view='intoViewID' @scrolltolower='_scrolltolower' @scroll="_onScroll"
				@scrolltoupper='_scrolltoupper'>
				<view style="transform: scaleY(-1); translateZ(0);flex-grow: 0.98;" id="hideBox">

				</view>
				<view class="h100 flex-center font-22 less-color pd-lr-40" style="transform: scaleY(-1);"
					v-if="!isMyFriend">
					{{$tc('你还不是他（她）的朋友，请发送朋友验证请求。')}}<text class="blue-color"
						@click="openAddModal">{{$tc('发送朋友验证')}}</text>
				</view>
				<!-- @scrolltolower='_scrolltolower' -->
				<!-- <p
          v-if="!isCompleted"
          class="message-more"
          @click="getHistoryMessageList"
        >
          {{ TUITranslateService.t("TUIChat.查看更多") }}
        </p> -->
				<!-- v-for="(item, index) in messageList" -->

				<view v-for="(item, index) in messageList" :id="`zp-id-${item.ID}`" :key="item.ID"
					:class="'message-li ' + item.flow" style="position: relative">
					<!-- <view v-if="item.ID === toggleID && !hiddenTool" class='box-pos'
						:style="{...toolStyle,transform:'scaleY(-1)',zIndex:'8888',width: '284rpx'}">
						<MessageTool @clearID='toggleID=""' :messageItem="item" @onChangeMsg='onChangeMsg'
							@untranslateM="untranslateM" @deleMsg='deleMsg' :isPower="isPower" @translateM="translateM"
							@onChangeMsgPinned='onChangeMsgPinned' />
					</view> -->

					<view style="transform: scaleY(-1);translateZ(0);">
						<!-- {{item.ID}} -->
						<!-- todo 原代码 -->
						<!-- <MessageTimestamp v-if="item && messageList[index - 1]" :currTime="item.time"
							:prevTime="index > 0 && messageList[index - 1] ? messageList[index - 1].time : 0"
							>
						</MessageTimestamp> -->

						<!-- <view style="color: red;">--------------</view> -->
						<!-- <view v-if="item">{{index}} -- {{item.ID}}</view> -->
						<MessageTimestamp v-if="item" :message="item" :currTime="item.time"
							:prevTime="messageList[index - 1] ? messageList[index - 1].time : 0"
							:nextTime="messageList[index + 1] ? messageList[index + 1].time : 0">
						</MessageTimestamp>
						<div class="message-item" @click.stop="messageClick" @touchstart="messageTouchstart(item)">
							<MessageTip v-if="
									item.type === TYPES.MSG_GRP_TIP ||
									isCreateGroupCustomMessage(item)
								" :content="getMessageContent(item)" :item="item" />
							<!-- 好友欢迎 -->
							<view v-else-if="
								item.type == 'TIMCustomElem' &&
								item.payload.description == 'newFriends'
							" class="newFriends-box flex-center">
								{{$tc('你们已成为好友，打声招呼吧')}}
							</view>
							<div v-else-if="!item.isRevoked && !isPluginMessage(item)" :id="`msg-bubble-${item.ID}`"
								class="message-bubble-container">
								<!-- 
			  @longPress="handleToggleMessageItem($event, item, index, true)"
			 @touchstart="handleH5LongPress($event, item, index, 'touchstart')"
			 @touchend="handleH5LongPress($event, item, index, 'touchend')"
			 @mouseover="handleH5LongPress($event, item, index, 'touchend')"
			 -->
								<MessageBubble style="position: relative" :isPower='isPower' :messageItem="item"
									:toggleID="toggleID" @seeCardInfo="seeCardInfo" :content="item.getMessageContent()"
									:blinkMessageIDList="blinkMessageIDList" :hiddenTool="hiddenTool"
									:isCheckMore="isShowEdit" @resendMessage="resendMessage(item)"
									@changeCheck="changeCheck(item, index)" @blinkMessage="blinkMessage"
									@scrollTo="scrollTo" @onChangeMsgPinned="onChangeMsgPinned"
									@onChangeMsg="onChangeMsg" @setReadReciptPanelVisible="setReadReciptPanelVisible"
									@scrollToOriginalMessage='scrollToOriginalMessage' @setStyle='setStyle'
									@itemLongPress="
                  handleToggleMessageItem($event, item, index, true)
                ">
									<MessageText :loadingTranslate="loadingTranslate" :messageItem="item"
										v-if="item.type === TYPES.MSG_TEXT" :myMessageTranslates="myMessageTranslates"
										:content="item.getMessageContent()" @seeCardInfo="seeCardInfo"
										:currentConversationInfo='currentConversationInfo' />
									<ProgressMessage v-if="item.type === TYPES.MSG_IMAGE"
										:content="item.getMessageContent()" :messageItem="item">
										<MessageImage :loadingTranslate="loadingTranslate"
											:content="item.getMessageContent()" :messageItem="item"
											:myMessageTranslates="myMessageTranslates"
											@previewImage="handleImagePreview" />
									</ProgressMessage>
									<!-- {{item}} -->
									<ProgressMessage v-if="item.type === TYPES.MSG_VIDEO"
										:content="item.getMessageContent()" :messageItem="item">
										<MessageVideo :content="item.getMessageContent()"
											:myMessageTranslates="myMessageTranslates"
											:loadingTranslate="loadingTranslate" :messageItem="item" />
									</ProgressMessage>
									<div v-if="item.type === TYPES.MSG_MERGER">
										<MessageMerger :content="item.getMessageContent()" :messageItem="item">
										</MessageMerger>
									</div>
									<MessageAudio v-if="item.type === TYPES.MSG_AUDIO"
										:content="item.getMessageContent()" :messageItem="item" />
									<MessageFile v-if="item.type === TYPES.MSG_FILE"
										:loadingTranslate="loadingTranslate" :content="item.getMessageContent()"
										:myMessageTranslates="myMessageTranslates" :messageItem="item" />
									<MessageFace v-if="item.type === TYPES.MSG_FACE" :content="item.getMessageContent()"
										:isPC="isPC" />
									<MessageLocation v-if="item.type === TYPES.MSG_LOCATION"
										:content="item.getMessageContent()" />
									<MessageCustom @seeCardInfo="seeCardInfo" v-if="item.type === TYPES.MSG_CUSTOM"
										:content="item.getMessageContent()"
										:currentConversationInfo='currentConversationInfo' :messageItem="item" />
								</MessageBubble>
							</div>
							<MessagePlugin v-else-if="!item.isRevoked && isPluginMessage(item)" :message="item"
								@resendMessage="resendMessage" @handleToggleMessageItem="handleToggleMessageItem"
								@handleH5LongPress="handleH5LongPress" />

							<!-- <MessageRevoked v-else :isEdit="item.type === TYPES.MSG_TEXT" :messageItem="item"
								@messageEdit="handleEdit(item)" /> -->



						</div>
					</view>
				</view>

				<view class="h80 flex-center font-22 less-color" style="transform: scaleY(-1); translateZ(0);"
					v-if="isGetAllData">{{$tc('暂无更多数据')}}</view>

			</scroll-view>

			<view v-if="toggleID && !hiddenTool" class='box-pos' :style="{...toolStyle,zIndex:'8888',width: '284rpx'}">
				<MessageTool :isPower="isPower" :messageItem="messageItem" @clearID='toggleID=""'
					@onChangeMsg='onChangeMsg' @untranslateM="untranslateM" @deleMsg='deleMsg' @translateM="translateM"
					@onChangeMsgPinned='onChangeMsgPinned' />
			</view>


			<!-- </view> -->
			<!-- </z-paging> -->
			<!-- <template #bottom>
					<slot name="bottomSlot"></slot>
				</template> -->
			<!-- 查看更多消息 -->
			<view class="see-more-msg flex-center" @click="toNewList" v-if="msgData&&msgData.length!=0&&isShowMore">
				<image-icon name='tb_xxjt' size='28'></image-icon>
				{{msgData.length}}{{$tc('条新消息')}}
			</view>

			<view class="fixed-box" v-if="isCardShow">
				<cardModal :info="cardInfo" :isShow="isCardShow" @closeModal="isCardShow = false">
				</cardModal>
			</view>

			<Dialog v-if="reSendDialogShow" :show="reSendDialogShow" :isH5="!isPC" :center="true" :isHeaderShow="isPC"
				@submit="resendMessageConfirm()" @update:show="(e) => (reSendDialogShow = e)">
				<p class="delDialog-title">
					{{ $tc(TUITranslateService.t("TUIChat.确认重发该消息？")) }}
				</p>
			</Dialog>
			<ImagePreviewer v-if="showImagePreview" :currentImage="currentImagePreview" :imageList="imageMessageList"
				@close="onImagePreviewerClose"></ImagePreviewer>
			<MessageGroupSystem v-if="showGroupApplication" :groupID="groupID"
				@toggleApplicationList="toggleApplicationList" @handleGroupApplication="handleGroupApplication">
			</MessageGroupSystem>
			<!-- 已读回执用户列表面板 -->
			<ReadReciptPanel v-if="isShowReadUserStatusPanel" :message="Object.assign({}, readStatusMessage)"
				@setReadReciptPanelVisible="setReadReciptPanelVisible" />
			<!-- 麦克风权限 -->
			<confirmModal :show.sync="isShowTips" :content="$tc('录音权限没有开启,是否前往开启？')" @confirm="toGetPower">
			</confirmModal>
			<verify v-if="isVerifyShow" :isShow="isVerifyShow" @closeModal='isVerifyShow=false' :defaultVal='userNick'
				@confirm='addFriend'></verify>
		</div>
	</div>
</template>
<script>
	import TUIChatEngine, {
		IMessageModel,
		TUIStore,
		StoreName,
		TUITranslateService,
		TUIChatService,
		TUIGroupService,
		TUIFUN
	} from "@tencentcloud/chat-uikit-engine";
	import cardModal from "@/components/card/index";
	import Link from "./link";
	import verify from '@/pages/home/components/verify/index.vue'
	import MessageText from "./message-elements/message-text.vue";
	import ProgressMessage from "../../common/ProgressMessage/index.vue";
	import MessageImage from "./message-elements/message-image.vue";
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
	import {
		isPluginMessage
	} from "../../../plugins/plugin-components/index";
	import Dialog from "../../common/Dialog/index.vue";
	import ImagePreviewer from "../../common/ImagePreviewer/index.vue";
	import {
		isCreateGroupCustomMessage
	} from "../utils/utils";

	import {
		getBoundingClientRect,
		getScrollInfo,
		instanceMapping,
	} from "../../../utils/universal-api/domOperation";
	import {
		isEnabledMessageReadReceiptGlobal
	} from "../utils/utils";
	import {
		isPC,
		isH5
	} from "../../../utils/env";
	import imageIcon from "@/components/image-icon";
	import {
		enableSampleTaskStatus
	} from "../../../utils/enableSampleTaskStatus";
	import {
		Toast,
		TOAST_TYPE
	} from "../../common/Toast/index";
	import ContactInfo from "../../../components/TUIContact/contact-info";
	import {
		tc
	} from '@/utils/util'
	import confirmModal from '@/components/confirm-modal'
	import {
		FALSE
	} from "sass";
	import {
		isFriend
	} from "../../../components/TUIContact/utils";
	import store from '@/store/index.js'
	import messageTranslateManage, {
		translateText
	} from "../../../utils/messageTranslateManage";
	import {
		ListMixin
	} from '@/mixin/list';
	let dataTime = null
	const cutNum = 30
	let intervalScrollNotification = null;
	let timeoutScrollList = null;
	let hisTime = null
	let observer = null;
	let observer2 = null;
	let groupType;
	let intervalList = [] // 没被渲染的数据
	let renderedList = [] // 已经渲染的数据
	let interval = null
	let lastMessageTimestamp = null
	const sentReceiptMessageID = new Set();
	let delCount = 0,
		delTotal = 0,
		isDeleteAllMessage = false;
	export default {
		props: {
			groupID: {
				type: String,
				default: "",
			},
			conversation: {
				type: Object,
				default () {
					return {};
				},
			},
			isGroup: {
				type: Boolean,
				default: false,
			},
			groupNotification: {
				type: String,
				default: "",
			},
			isShowEdit: {
				type: Boolean,
				default: false,
			},
		},
		components: {
			MessageText,
			ProgressMessage,
			MessageImage,
			MessageAudio,
			MessageFile,
			MessageFace,
			MessageCustom,
			MessageMerger,
			MessageTip,
			MessageBubble,
			MessageLocation,
			MessageTimestamp,
			MessageVideo,
			MessageTool,
			MessageRevoked,
			MessageGroupSystem,
			MessagePlugin,
			ReadReciptPanel,
			confirmModal
		},
		data() {
			return {
				newMsgID: [],
				isPC,
				isHasAllData: false,
				allMessageData: [],
				oldNextID: '',
				isShowMore: false,
				isVerifyShow: false,
				bottomID: '',
				isInit: true,
				isSeeOld: false,
				noReadList: [],
				isBackNewList: false,
				allData: [],
				unreadCountNum: 0,
				topID: '',
				isLinkMsg: true,
				toolStyle: {},
				checkedList: [],
				isGetAllData: false,
				isShowTips: false,
				isInitData: false,
				oldMessageList: [],
				isCanLink: false,
				msgData: [],
				isHasDone: true,
				noReadCout: 0,
				isCardShow: false,
				cardInfo: null,
				refGroupNotification: '',
				notificationScrollLeft: 0,
				pageNum: 1,
				paging: null,
				isShowLoading: false,
				isGetOldList: true,
				title: 'TUIChat',
				messageList: [],
				isCompleted: false,
				currentConversationInfo: getApp().globalData.currentConversationInfo,
				currentConversationID: getApp().globalData?.currentConversationInfo?.conversationID,
				nextReqMessageID: '',
				toggleID: '',
				scrollTop: 5000,
				loadingTranslate: {},
				onUserProfile: null,
				TYPES: TUIChatEngine.TYPES,
				isLoadMessage: false,
				isLongpressing: false,
				blinkMessageIDList: [],
				isMyFriend: true,
				pinnedMsg: null,
				readStatusMessage: false,
				isShowReadUserStatusPanel: false,
				groupApplicationCount: 0,
				showGroupApplication: false,
				applicationUserIDList: [],
				allMessageList: [],
				reSendDialogShow: false,
				resendMessageData: null,
				pinnedMsgList: [],
				pinnedMsgIndex: 0,
				pinnedMsgContent: null,
				selectedPinnedMsg: null,
				showImagePreview: false,
				currentImagePreview: {},
				isTopScroll: false,
				isCanScrollY: true,
				isScrollBottom: true,
				oldScrollTop: 0,
				hiddenTool: false,
				isHasCloseNoMore: false,
				scrollDirection: 'bottom',
				oldHeight: null,
				isSeeOldMessage: false,
				isPower: false,
				isBottomListDone: true,
				deletedMessageID: [],
				intoViewID: '',
				myMessageTranslates: null,
				beforeCout: 0,
				hideBox: null,
				chooseMessage: null,
				timer: null,
			}
		},
		computed: {
			messageItem() {
				if (this.toggleID) {
					return this.messageList.find(item => item.ID === this.toggleID)
				} else {
					return null
				}
			},
			imageMessageList() {
				this.messageList?.filter((item) => {
					return (
						!item.isRevoked &&
						!item.hasRiskContent &&
						item.type === this.TYPES.MSG_IMAGE
					);
				})
			}
		},
		watch: {
			msgData: {
				deep: true,
				handler(newV) {
					if (newV.length != 0) {
						let pushList = newV[0]

						if (!this.isShowMore && this.isScrollBottom) {
							uni.$u.throttle(() => {
								console.log('pushList', pushList)
								this.messageList = [...this.messageList, ...pushList]
								this.msgData.shift()
							}, 300)
						}
					}
				}
			}
		},
		mounted() {
			instanceMapping.set("messageList", this);
			this.onWatchStore()
			this.chatOnLinsten()
			uni.$on('resetMessage', function(data) {
				resetMessage()
			})

			uni.$on('showMicNeed', function(data) {
				this.isShowTips = true
			})

			uni.$on('closeMessageTool', function(data) {
				if (data && data.show == false) {
					this.toggleID = ''
				}
			})
			uni.$on('clear', (res) => {
				onClearAll()
			})
			uni.$on('setFriendType', (res) => {
				this.isMyFriend = res.isFriend
			})
		},

		onUnload() {
			this.onClearAll()
			if (hisTime) clearInterval(hisTime)
		},
		methods: {
			isCreateGroupCustomMessage,
			isPluginMessage,
			seeCardInfo(obj) {
				this.cardInfo = obj
				this.isCardShow = true
			},
			addFriend(val) {
				TUIChatEngine.chat.addFriend({
					to: this.currentConversationInfo.userProfile.userID,
					source: 'AddSource_Type_Search',
					wording: val,
					remark: '',
					groupName: '',
				}).then(res => {
					this.isVerifyShow = false
					Toast({
						message: tc('已发送好友申请'),
						type: TOAST_TYPE.NORMAL,
					});
					ListMixin.methods.sendFirstMsg(this.currentConversationInfo.userProfile.userID)
				}).catch(err => {
					console.log('addFriend添加好友失败...', err)
					if (err == 'Error: The specified userID is my friend already') {
						console.log('删除好友咯')
						TUIChatEngine.chat.deleteFriend({
							userIDList: [this.currentConversationInfo.userProfile.userID],
							type: TUIChatEngine.TYPES.SNS_DELETE_TYPE_SINGLE
						}).then(res => {
							console.log('删除成功')
							addFriend(val)
						})
					}
					if (JSON.stringify(err)) {
						const e = JSON.parse(JSON.stringify(err))
						if (e.message === 'Err_SNS_FriendAdd_Forbid_By_Admin') {
							uni.showToast({
								title: tc('您没有添加好友权限'),
								duration: 2000
							})
						}
					}
				})
			},
			openAddModal() {

				TUIChatEngine.chat.getMyProfile().then(res => {
					this.userNick = tc('我是') + " " + res.data.nick
					this.isVerifyShow = true
				})

			},
			_onScroll(e) {
				this.toggleID = "";
				this.scrollDirection = this.oldScrollTop < e.detail.scrollTop ? 'top' : 'bottom'
				this.oldScrollTop = e.detail.scrollTop
				this.isScrollBottom = false
			},
			scrollToBottom() {
				this.scrollTop = this.oldScrollTop
				this.$nextTick(function() {
					this.scrollTop = 0
				});
			},
			async getGroupCustomField(groupInfo) {
				this.pinnedMsgList = [];
				this.pinnedMsgIndex = 0;
				let {
					groupCustomField
				} = groupInfo;
				for (let i = 0; i < groupCustomField.length; i++) {
					let item = groupCustomField[i]
					if (item.key == "pinnedMsgs") {
						if (item.value && item.value.length > 0) {
							this.pinnedMsgList = JSON.parse(item.value);
						} else {
							this.pinnedMsgList = item.value;
						}
						break;
					}
				}

				if (this.pinnedMsgList && this.pinnedMsgList.length > 0) {
					for (let i = this.pinnedMsgList.length - 1; i >= 0; i--) {
						let messageBody = await this.handlePinnedMsg(this.pinnedMsgList[i].seq);

						if (!messageBody) {
							this.pinnedMsgList.splice(i, 1);
						} else {

							if (typeof(this.pinnedMsgList[i]) == 'object') {
								this.pinnedMsgList[i].body = messageBody;
							}

						}
					}
					this.pinnedMsgList.reverse()
					if (this.pinnedMsgList[this.pinnedMsgIndex]) {
						if (this.pinnedMsgList[this.pinnedMsgIndex].body) {
							this.pinnedMsgContent = this.handlePinnedMsgContent(this.pinnedMsgList[this.pinnedMsgIndex]
								.body);
						} else {
							this.pinnedMsgContent = null;
						}
					}

				} else {
					this.pinnedMsgContent = null;
				}
			},
			onUpdateGroupCustomField() {
				TUIGroupService.getGroupProfile({
					groupID: this.currentConversationInfo.groupProfile.groupID,
				}).then(res => {
					console.log('getGroupCustomField====', res.data.group)
					this.getGroupCustomField(res.data.group)
				})
			},
			async onGroupHandle() {
				let conversation = this.currentConversationInfo
				TUIGroupService.getGroupApplicationList().then((res) => {
					console.log('getGroupApplicationList', res)
					const applicationList = res.data.applicationList.filter(
						(application) => application.groupID === this.groupID
					);
					this.applicationUserIDList = applicationList.map((application) => {
						return application.applicationType === 0 ?
							application.applicant :
							application.userID;
					});
					TUIStore.update(
						StoreName.CUSTOM,
						"groupApplicationCount",
						applicationList.length
					);
				});
				// 开启已读回执的状态 群聊缓存群类型
				if (isEnabledMessageReadReceiptGlobal()) {
					const {
						groupProfile
					} =
					TUIStore.getConversationModel(this.currentConversationID) || {};
					groupType = groupProfile?.type;
				}


				if (conversation?.type === TUIChatEngine.TYPES.CONV_GROUP) {
					this.watchGroup()
					this.onUpdateGroupCustomField()
				} else if (conversation?.type === TUIChatEngine.TYPES.CONV_C2C) {
					this.getC2cmsgToplist();
				}
			},
			onCurrentConversationIDUpdated(conversationID) {
				this.currentConversationID = conversationID;
			},
			onGroupSystemNoticeList(list) {
				const systemNoticeList = list.filter((message) => {
					const {
						operationType
					} = message.payload;
					return (
						(operationType === 1 || operationType === 23) &&
						message.to === props.groupID
					);
				});

				systemNoticeList.forEach((systemNotice) => {
					const {
						operationType
					} = systemNotice.payload;
					if (operationType === 1) {
						const {
							operatorID
						} = systemNotice.payload;
						if (!this.applicationUserIDList?.includes(operatorID)) {
							this.applicationUserIDList.push(operatorID);
						}
					}
					if (operationType === 23) {
						const {
							inviteeList
						} = systemNotice.payload;
						inviteeList.forEach((invitee) => {
							if (!this.applicationUserIDList?.includes(invitee)) {
								this.applicationUserIDList.push(invitee);
							}
						});
					}
				});
				const applicationCount = this.applicationUserIDList.length;
				TUIStore.update(StoreName.CUSTOM, "groupApplicationCount", applicationCount);
			},
			onCurrentConversation(conversation) {
				this.currentConversationInfo = conversation
				if (conversation.type == 'GROUP') {
					let {
						selfInfo
					} = conversation.groupProfile
					this.isPower = selfInfo.role != 'Member'
				} else {
					this.isPower = true
				}
			},
			endInterval() {
				if (interval) {
					clearInterval(interval)
					interval = null
				}
			},
			startInterval() {
				if (interval) {
					return
				}
				interval = setInterval(() => {

					if (renderedList.length === intervalList.length) {
						this.endInterval()
					}
					this.onMessageListUpdated(intervalList)
				}, 200)
			},
			onMessageListUpdatedTimeout(list) {
				intervalList = list.filter((message) => !message.isDeleted)

				this.startInterval()
			},
			onWatchStore() {
				// 消息列表监听
				TUIStore.watch(StoreName.CHAT, {
					messageList: this.onMessageListUpdated,
					isCompleted: this.onChatCompletedUpdated,
				});
				TUIStore.watch(StoreName.CONV, {
					currentConversation: this.onCurrentConversation,
				});

				TUIStore.watch(StoreName.USER, {
					userProfile: this.onUserProfile,
				});
				let {
					type
				} = getApp().globalData.currentConversationInfo
				if (getApp().globalData.unreadCount > 0) {
					this.unreadCountNum = getApp().globalData.unreadCount;
					// 判断是否有更多未读条数
					if (getApp().globalData.unreadCount > 15) {
						this.isSeeOldMessage = true
					}
				}
				if (type == 'GROUP') {
					this.onGroupHandle()
				}
			},
			async handlePinnedMsg(_seq) {

				let pinnedMsgBody = TUIChatEngine.chat.getMessageListHopping({
						conversationID: this.currentConversationID,
						sequence: _seq,
						count: 1,
						direction: 0
					})
					.then((res) => {

						if (res.data.messageList[0]) {

							return res.data.messageList[0];

						} else {
							return null;
						}

					})
					.catch((error) => {
						return null;
					})


				return pinnedMsgBody;

			},
			getC2cmsgToplist() {
				try {
					let otherId = this.currentConversationInfo.conversationID.replace(TUIChatEngine.TYPES.CONV_C2C, "");

					let idList = this.sortStringsByCharacters([TUIChatEngine.getMyUserID(), otherId]);

					let sessionId = idList.join("");
					let infos = {
						sessionId: sessionId
					}

					this.$http.app_user.c2cmsgToplist(infos)
						.then((res) => {

							let res_data = res.data;
							if (res.result) {
								let data = res_data;
								// data.reverse();
								this.handleC2cToplist(data);
							}

						})
						.catch((error) => {
							console.log("===============c2cmsgToplist error")
							console.log(error)
						})
				} catch (e) {
					console.log('e', e)
					//TODO handle the exception
				}
			},
			async handleC2cToplist(_list) {
				if (_list.length == 0) {
					this.pinnedMsgContent = null;
					return;
				}
				this.pinnedMsgList = _list;


				if (this.pinnedMsgList && this.pinnedMsgList.length > 0) {

					for (let i = this.pinnedMsgList.length - 1; i >= 0; i--) {

						if (!this.pinnedMsgList[i]) {
							continue;
						}

						let time = Number(this.pinnedMsgList[i].time)

						let messageBody = await this.getMessageListHoppingTime(time, this.pinnedMsgList[i].id).catch(
							err => {
								console.log('errr', err)
							});
						// console.log('messageBody===', messageBody)
						if (!messageBody) {
							this.pinnedMsgList.splice(i, 1);
						} else {

							if (!this.pinnedMsgList[i]) {
								continue;
							}

							this.pinnedMsgList[i].body = messageBody;
						}
					}


					if (this.pinnedMsgList[this.pinnedMsgIndex]) {
						if (this.pinnedMsgList[this.pinnedMsgIndex].body) {
							this.pinnedMsgContent = this.handlePinnedMsgContent(this.pinnedMsgList[this.pinnedMsgIndex]
								.body);
						} else {
							this.pinnedMsgContent = null;
						}
					} else {
						this.pinnedMsgContent = null;
					}

				} else {
					this.pinnedMsgContent = null;
				}

			},
			watchGroup() {

				TUIStore.watch(StoreName.GRP, {
					groupSystemNoticeList: this.onGroupSystemNoticeList,
				});
				TUIStore.watch(StoreName.CUSTOM, {
					groupApplicationCount: this.onGroupApplicationCountUpdated,
				});

			},
			sortStringsByCharacters(arr) {

				arr.sort((a, b) => {
					// 将字符串按字母顺序排序
					let orderA = a.split('').sort().join('');
					let orderB = b.split('').sort().join('');

					if (orderA === orderB) {
						// 如果字母顺序相同，则按数字大小排序
						let numA = parseInt(a.replace(/[^0-9]/g, ''));
						let numB = parseInt(b.replace(/[^0-9]/g, ''));
						return numA - numB;
					} else {
						// 否则按字母顺序排序
						return orderA.localeCompare(orderB);
					}
				});

				return arr;
			},
			async getMessageListHoppingTime(_time, _messageID) {
				let pinnedMsgBody = TUIChatEngine.chat.getMessageListHopping({
						conversationID: this.currentConversationID,
						time: _time,
						count: 15,
						direction: 0
					})
					.then((res) => {

						let list = res.data.messageList;

						let returnItem = null;

						for (let i = 0; i < list.length; i++) {
							let item = list[i];

							if (item.ID == _messageID) {
								returnItem = item;

								break;
							}
						}

						return returnItem;

					})
					.catch((error) => {
						return null;
					})


				return pinnedMsgBody;

			},
			resetMessage() {
				let allId = messageList.map(item => item.ID)
				this.handleGmDeleteMessage(allId)
				messageList.length = 0
			},
			onClearAll() {
				TUIStore.unwatch(StoreName.CHAT, {
					messageList: this.onMessageListUpdatedTimeout,
					isCompleted: this.onChatCompletedUpdated,
				});
				TUIStore.unwatch(StoreName.USER, {
					userProfile: this.onUserProfile,
				});
				TUIStore.unwatch(StoreName.CONV, {
					currentConversationID: this.onCurrentConversationIDUpdated,
					currentConversation: this.onCurrentConversation,
				});
				// 群系统消息
				TUIStore.unwatch(StoreName.GRP, {
					groupSystemNoticeList: this.onGroupSystemNoticeList,
				});
				TUIStore.unwatch(StoreName.CUSTOM, {
					groupApplicationCount: this.onGroupApplicationCountUpdated,
				});
				observer?.disconnect();
				observer = null;
				observer2?.disconnect();
				observer2 = null;
				uni.$off('resetMessage')
				uni.$off('showMicNeed')
				uni.$off('closeMessageTool')
			},
			changeCheck(item, index) {
				let {
					isCheck
				} = item;
				this.messageList[index].isCheck = !isCheck;
				let newArr = this.messageList.map(item => item.isCheck && item).filter(item => item);

				this.checkedList = newArr;
			},
			setStyle(style) {
				this.toolStyle = style.toolStyle
			},
			onChangeMsg(val) {
				this.emit("handChangeInput", true);
				this.toggleID = ''
			},
			onChangeMsgPinned(message) {

				if (message.conversationType === TUIChatEngine.TYPES.CONV_GROUP) {
					let messageID = message.ID
					let groupID = message.conversationID.replace(/GROUP/g, "")

					//置顶前,先获取一次群资料
					TUIChatEngine.chat.getGroupProfile({
							groupID: groupID
						})
						.then((res) => {

							this.toTopMessageNext(res.data.group, message);
						})
						.catch((error) => {
							console.log('getGroupProfile error:', error); // 获取群详细资料失败的相关信息
						});
				} else if (message.conversationType === TUIChatEngine.TYPES.CONV_C2C) {
					let otherId = message.to;

					if (otherId == TUIChatEngine.getMyUserID()) {
						otherId = message.from;
					}


					let idList = this.sortStringsByCharacters([TUIChatEngine.getMyUserID(), otherId]);

					let sessionId = idList.join("");


					let params = {
						sessionId: sessionId,
						id: message.ID,
						time: message.time + ""
					}

					this.onC2cmsgSetTop(params);

				}


			},
			toTopMessageNext(_groupProfile, _message) {

				if (!_groupProfile || !_message) {
					return;
				}

				let groupCustomField = _groupProfile.groupCustomField;

				let pinnedMsgsObj;

				for (let i = 0; i < groupCustomField.length; i++) {
					let item = groupCustomField[i];

					if (item.key == "pinnedMsgs") {
						pinnedMsgsObj = item;
					}
				}


				let messageObj = {
					id: _message.ID,
					seq: _message.sequence
				}

				//已有这个自定义字段
				if (pinnedMsgsObj) {

					let messageIdList;

					if (this.pinnedMsgsObj && this.pinnedMsgsObj.length > 0) {
						messageIdList = JSON.parse(this.pinnedMsgsObj);

						messageIdList.push(messageObj);
					} else {
						messageIdList = [messageObj];
					}

					if (messageIdList) {
						this.pinnedMsgsObj = messageIdList;
					}


				} else {
					let newObj = {
						key: "pinnedMsgs",
						value: [messageObj]
					}

					pinnedMsgsObj = newObj;

				}


				if (!pinnedMsgsObj) {
					return;
				}


				let list = [...new Set(this.pinnedMsgsObj.map(item => item.id))].map(id => {
					return this.pinnedMsgsObj.find(item => item.id === id);
				});

				this.pinnedMsgsObj = JSON.stringify(list);

				for (let i = 0; i < groupCustomField.length; i++) {

					if (groupCustomField[i].key == "pinnedMsgs") {
						groupCustomField[i] = pinnedMsgsObj;
					}
				}




				let promise = TUIChatEngine.chat.updateGroupProfile({
					groupID: _groupProfile.groupID,
					// 群成员能收到群自定义字段变更的群提示消息，且能获取到相关的内容，详见 Message.payload.newGroupProfile.groupCustomField
					groupCustomField: groupCustomField // 修改群组维度自定义字段
				});
				promise.then((res) => {

					this.sendAddPinnedMsgsTips(_groupProfile.groupID);
				}).catch((error) => {
					console.warn('updateGroupProfile error:', error); // 修改群组资料失败的相关信息
				});

			},
			onC2cmsgSetTop(_params) {
				this.$http.app_user.c2cmsgSetTop(_params)
					.then((res) => {
						if (res.result) {
							console.log('私聊消息置顶')
							this.getC2cmsgToplist();
							this.sendGmC2cmsgSetTopGm();
							this.sendGmC2cmsgSetTopTips();
						} else {
							//异常
							Toast({
								message: TUITranslateService.t("TUIChat.置顶失败"),
								type: TOAST_TYPE.ERROR,
							});
						}
					})
					.catch((error) => {
						Toast({
							message: TUITranslateService.t("TUIChat.置顶失败"),
							type: TOAST_TYPE.ERROR,
						});
					})

			},
			sendGmC2cmsgSetTopGm() {
				let data = {
					code: "c2c_set_top",
					value: {},
				}

				let payload = {
					data: JSON.stringify(data),
					description: 'GM_ORDER',
					extension: 'GM_ORDER'
				}

				let to = this.currentConversationInfo.conversationID.replace(TUIChatEngine.TYPES.CONV_C2C, "");

				let sendMessage = TUIChatEngine.chat.createCustomMessage({
					to: to,
					conversationType: TUIChatEngine.TYPES.CONV_C2C,
					payload: payload
				})

				TUIChatEngine.chat.sendMessage(sendMessage)
					.then((res) => {

						console.log("=====c2c置顶刷新GM指令发送成功")
					})
					.catch((error) => {
						Toast({
							message: error?.message,
							type: TOAST_TYPE.ERROR,
						});
					})

			},
			sendGmC2cmsgSetTopTips() {

				let payload = {
					data: "",
					description: 'c2c_set_top',
					extension: 'c2c_set_top'
				}

				let to = this.currentConversationInfo.conversationID.replace(TUIChatEngine.TYPES.CONV_C2C, "");

				let sendMessage = TUIChatEngine.chat.createCustomMessage({
					to: to,
					conversationType: TUIChatEngine.TYPES.CONV_C2C,
					payload: payload
				})

				TUIChatEngine.chat.sendMessage(sendMessage)
					.then((res) => {

						console.log("=====c2c置顶提示发送成功")
					})
					.catch((error) => {
						Toast({
							message: error?.message,
							type: TOAST_TYPE.ERROR,
						});
					})

			},
			setBlinkView(messageID) {
				return new Promise((resolve) => {
					console.log('messageID=====', messageID)
					const index = this.blinkMessageIDList.indexOf(messageID);
					if (index < 0) {
						this.blinkMessageIDList.push(messageID);
						const timer = setTimeout(() => {
							this.blinkMessageIDList.splice(
								this.blinkMessageIDList.indexOf(messageID),
								1
							);
							this.isCanLink = false
							clearTimeout(timer);
							resolve();
						}, 3000);
					}
				});
			},
			async toLinkMsg(sequence, count = 15) {
				let searchType = this.currentConversationInfo.type == 'GROUP' ? 'sequence' : 'time'

				let sendData = {
					conversationID: this.currentConversationID,
					count,
					direction: 1
				}
				sendData[searchType] = sequence

				uni.showLoading()
				Promise.all([
					TUIChatEngine.chat.getMessageListHopping({
						...sendData,
						direction: 0
					}),
					TUIChatEngine.chat.getMessageListHopping({
						...sendData,
						direction: 1
					}),
				]).then(async results => {
					let list = [...results[0].data.messageList.map(item => new TUIFUN(item)), ...results[1]
						.data.messageList.filter((_, index) => index !== 0).map(item => new TUIFUN(
							item))
					].reverse()
					const index = list.findIndex(message => message.ID === results[1].data.messageList[0]
						.ID)
					const m = list.find(message => message.ID === results[1].data.messageList[0].ID)

					if (index > -1) {
						uni.hideLoading()
						this.toQuoteMessage('quote', [m])
					} else {
						uni.hideLoading()
						uni.showToast({
							icon: 'none',
							title: tc('原消息已删除或超过30天，无法查询定位')
						})
					}

				}).catch(err => {
					uni.hideLoading()
				})
			},
			toQuoteMessage(title, list) {
				getApp().globalData.title = title
				getApp().globalData.list = list

				uni.navigateTo({
					url: '/pages/TUIKit/components/TUIChat/message-list/quote',
					events: {
						deletePinnedMessage(data) {
							this.pinnedMsgIndex = data.index
							this.clickClosePinnedMsg()
						}
					}
				})
			},
			onPinnedMsgContent(item) {

				// 点击置顶消息打开新页面
				const list = this.pinnedMsgList.map(item => item.body)
				this.toQuoteMessage('pinned', list)
				return
			},
			handlePinnedMsgContent(pinnedMsg) {
				return {}
			},
			sendAddPinnedMsgsTips(_groupID) {
				let payload = {
					data: "",
					description: 'add_pinned_msgs',
					extension: 'add_pinned_msgs'
				}


				let sendMessage = TUIChatEngine.chat.createCustomMessage({
					to: _groupID,
					conversationType: TUIChatEngine.TYPES.CONV_GROUP,
					payload: payload
				})

				TUIChatEngine.chat.sendMessage(sendMessage)
					.then((res) => {
						Toast({
							message: tc('置顶成功'),
							type: TOAST_TYPE.NORMAL,
						});
						this.onUpdateGroupCustomField()
					})
					.catch((error) => {
						Toast({
							message: error?.message,
							type: TOAST_TYPE.NORMAL,
						});
					})
			},
			clickClosePinnedMsg() {},
			deleteC2cPinnedMsg() {
				let otherId = this.currentConversationInfo.conversationID.replace(TUIChatEngine.TYPES.CONV_C2C, "");

				let idList = sortStringsByCharacters([TUIChatEngine.getMyUserID(), otherId]);

				let sessionId = idList.join("");

				let infos = {
					sessionId: sessionId,
					id: this.pinnedMsgList[this.pinnedMsgIndex].id
				}

				this.$http.app_user.c2cmsgRmTop(infos)
					.then((res) => {

						let res_data = res.data;

						if (res.result) {
							console.log('deleteC2cPinnedMsg')
							this.getC2cmsgToplist();
							this.sendGmC2cmsgSetTopGm();
							this.sendGmC2cmsgRmTopTips();
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
					.catch((error) => {
						Toast({
							message: TUITranslateService.t("TUIChat.解除置顶失败"),
							type: TOAST_TYPE.ERROR,
						});
						console.log("===========c2cmsgSetTop error")
						console.log(error)
					})

			},
			sendGmC2cmsgRmTopTips() {

				let payload = {
					data: "",
					description: 'c2c_rm_top',
					extension: 'c2c_rm_top'
				}

				let to = currentConversationInfo.conversationID.replace(TUIChatEngine.TYPES.CONV_C2C, "");

				let sendMessage = TUIChatEngine.chat.createCustomMessage({
					to: to,
					conversationType: TUIChatEngine.TYPES.CONV_C2C,
					payload: payload
				})

				TUIChatEngine.chat.sendMessage(sendMessage)
					.then((res) => {

						console.log("=====c2c取消置顶提示发送成功")
					})
					.catch((error) => {
						Toast({
							message: error?.message,
							type: TOAST_TYPE.ERROR,
						});
					})

			},
			sendRemovePinnedMsgsTips() {
				let payload = {
					data: "",
					description: 'remove_pinned_msgs',
					extension: 'remove_pinned_msgs'
				}


				let sendMessage = TUIChatEngine.chat.createCustomMessage({
					to: this.currentConversationInfo.groupProfile.groupID,
					conversationType: TUIChatEngine.TYPES.CONV_GROUP,
					payload: payload
				})

				TUIChatEngine.chat.sendMessage(sendMessage)
					.then((res) => {

						console.log("=====取消置顶提示发送成功")
						// setTimeout(()=>{
						// onUpdateGroupCustomField()
						// },600)
					})
					.catch((error) => {
						Toast({
							message: error?.message,
							type: TOAST_TYPE.ERROR,
						});
					})
			},
			getAllCheckMsg() {
				let fList = this.messageList.filter((item) => item.isCheck);
				return fList;
			},
			lickNotification() {
				uni.navigateTo({
					url: `/pages/address/views/group/views/group-settings/views/notification/index?groupID=${this.groupID}`,
				});
			},
			clickNotification  ()  {
				uni.navigateTo({
					url: `/pages/address/views/group/views/group-settings/views/notification/index?groupID=${this.groupID}`,
				});
			},
			
			updateList(list) {
				if (list && list.length != 0)
					this.messageList = this.messageList.filter(
						(message) => !list.includes(message.ID)
					);
			},
			async getUpList(sequence) {
				if (this.isCanLink) return
				let searchType = this.currentConversationInfo.type == 'GROUP' ? 'sequence' : 'time'
				let sendData = {
					conversationID: this.currentConversationID,
					count: 15,
					direction: 0
				}
				sendData[searchType] = this.topID
				let promise = await TUIChatEngine.chat.getMessageListHopping(sendData);
				let {
					isCompleted,
					nextMessageSeq,
					nextMessageTime
				} = promise.data
				let nextType = this.currentConversationInfo.type == 'GROUP' ? 'nextMessageSeq' : 'nextMessageTime'
				let msgList = promise.data.messageList
				let nlist = msgList.map(item => new TUIFUN(item)).reverse()
				this.topID = promise.data[nextType]
				this.messageList = [...this.messageList, ...nlist]
			},
			_scrolltolower() {
				if (this.isSeeOld) {
					this.getUpList()
				} else {
					if (!this.isGetAllData) {
						this.getHistoryMessageList();
					}
				}
			},
			deleMsg(ID) {
				let list = this.messageList.filter(item => item.ID != ID)
				this.messageList = list
			},
			toNewList() {
				this.messageList = this.oldMessageList.slice(0, 15)
				this.isInitData = true
				this.msgData.length = 0
				this.scrollToBottom()
				setTimeout(() => {
					this.isInitData = false
				}, 200)
			},
			async scrollToOriginalMessage(originMessageID, callback) {
				this.scrollTop = this.oldScrollTop
				const originalMessageRect = await getBoundingClientRect('#zp-id-' + originMessageID, 'messageList');
				let finalScrollTop = this.oldScrollTop - originalMessageRect.top + 300
				this.scrollTo({
					finalScrollTop,
					originMessageID
				})
			},
			backNewList() {
				this.isSeeOld = false
				this.isBackNewList = false
				this.messageList = this.oldMessageList.slice(0, 15)
				let mLen = this.messageList.length
				this.scrollToBottom()
			},
			toOldList() {
				this.getNoreadList(() => {
					let searchType = this.currentConversationInfo.type == 'GROUP' ? 'sequence' : 'time'
					this.isSeeOld = true
					this.isSeeOldMessage = false
					this.isBackNewList = true

					this.messageList = this.noReadList
					console.log('toOldList', this.noReadList)
					if (this.messageList.length != 0) {
						this.bottomID = this.messageList[0][searchType]
						this.topID = this.messageList[this.messageList.length - 1][searchType] - 1
						this.isInitData = true
						scrollToOriginalMessage(this.messageList[this.messageList.length - 1].ID)
					}
				})
			},
			async getNoreadList(callBack) {
				let mlist = this.messageList
				if (mlist.length == 0) return
				let promise = await TUIChatEngine.chat.getMessageListHopping({
					conversationID: this.currentConversationID,
					sequence: mlist[0].sequence - this.unreadCountNum - 1,
					count: 15,
					direction: 1
				});
				let beforeList = promise.data.messageList
				let nlist = beforeList.map(item => new TUIFUN(item))
				this.noReadList = nlist.reverse()
				if (callBack) callBack()
				// console.log('promise',nlist)
			},
			async getUDList({
				sequence = '',
				direction = 1,
				count = 15
			}) {
				console.log('获取下一页数据s')
				// return 
				if (!this.isBottomListDone || this.isCanLink) return
				this.isBottomListDone = false
				let promise = await TUIChatEngine.chat.getMessageListHopping({
					conversationID: this.currentConversationID,
					sequence,
					count,
					direction
				});
				let {
					isCompleted,
					nextMessageSeq
				} = promise.data
				let msgList = promise.data.messageList.reverse()
				if (isCompleted || msgList.length < count) {
					this.isBackNewList = false
					this.isSeeOld = false
				}
				if (!isCompleted) {
					let nextType = this.currentConversationInfo.type == 'GROUP' ? 'nextMessageSeq' : 'nextMessageTime'
					let nlist = msgList.map(item => new TUIFUN(item))
					this.bottomID = promise.data[nextType]
					// pagingthis.??.addDataFromTop(nlist)
					let scrollID = nlist.find(item => item.sequence == sequence)
					this.messageList = [...nlist, ...this.messageList]
					scrollToOriginalMessage(scrollID.ID)
					setTimeout(() => {
						this.isBottomListDone = true
					}, 300)
				}

			},
			_scrolltoupper(e) {
				if (this.isSeeOld && this.isLinkMsg) {
					this.getUDList({
						sequence: this.bottomID + 1,
						direction: 1,
						count: 15
					})
				}
				this.isScrollBottom = true
			},
			checkFriend() {
				// return
				TUIChatEngine.chat.checkFriend({
					userIDList: [this.currentConversationInfo.userProfile.userID],
				}).then(res => {
					let {
						successUserIDList,
						failureUserIDList
					} = res.data
					if (successUserIDList && successUserIDList.length != 0) {
						let {
							relation
						} = successUserIDList[0]
						if (relation == 'CheckResult_Type_BothWay') {
							this.isMyFriend = true
						}
					}
				});
			},
			throttleRender() {
				// 如果当前是爬楼状态，则提示有多少条未读
				if (!this.isScrollBottom) {
					console.log('有新消息来了==========', this.msgData.length);
					// this.isShowMore = true;
					// this.msgData = [...this.msgData, list[0]];
					// return;
				} else {
					// 如果目前是在最底部，则节流渲染，如300毫秒渲染2条
					// 优化渲染逻辑
					console.log('消息速度太快了')
					setTimeout(() => {
						// 在这里进行消息的渲染，根据需要渲染的条数和方式来处理
						// 例如：
						// this.msgData = [...this.msgData, ...newList.slice(0, 2)]; // 渲染前两条消息
					}, 300);
				}
			},
			onMessageListUpdated(list) {
				let isDeleteAllMessage = null
				console.log('onMessageListUpdated=======')
				// renderedList = list
				let userInfo = uni.getStorageSync("userInfo");
				observer?.disconnect();
				// GM指令删除
				let needRefresh = false;
				// 检查是不是好友
				if (!this.isMyFriend && currentConversationInfothis?.type == 'C2C') {
					this.checkFriend()
				}
				if (list.length == 0) return
				// 新消息的频繁触发
				if (this.messageList.length != 0 && this.isScrollBottom) {
					if (list[list.length - 1].ID == this.messageList[0].ID) {
						return
					}
				}
				// 记录被删除的发送失败的消息id,防止再次渲染
				if (isDeleteAllMessage) {
					list.forEach((item) => {
						if (item.status === 'fail') {
							deletedMessageIDthis?.push(item.ID)
						}
					});
				}
				// && message.type != TUIChatEngine.TYPES.MSG_GRP_TIP
				list = list
					.filter((item) => {
						if (item.status === 'fail' && deletedMessageIDthis?.includes(item.ID)) {
							item.isDeleted = true;
							return false;
						}

						if (item.isRevoked || item.payload.description === 'delete_message' || item.isSystemMessage) {
							item.isDeleted = true;
							return false;
						}

						if (item.type === TUIChatEngine.TYPES.MSG_CUSTOM && !item.isDeleted) {
							if (item.payload?.description === 'GM_ORDER') {
								needRefresh = true;
								this.handleGmOrder(item);
								item.isDeleted = true;
							}
						}
						return !item.isDeleted; // 筛选掉已删除的消息
					}).map((message, index) => {
						message.vueForRenderKey = `${message.ID}`;
						if (!message.isCheck) message.isCheck = false;
						// message.isPinned = false
						// if(pinnedIndexList.includes(message.sequence)) message.isPinned = true
						return message;
					}).reverse()
				// 判断是否是新消息
				let newList = []
				if (this.messageList && this.messageList?.length != 0) {
					let newID = this.messageList?.map((item) => item.ID);
					if (newID.length != 0) {
						newList = list.filter((item) => !newID.includes(item.ID));
					}
				}
				this.oldMessageList = list
				// 判断消息触发频率
				let currentTimestamp = Date.now()
				lastMessageTimestamp = lastMessageTimestamp ? lastMessageTimestamp : Date.now()
				let cutTime = currentTimestamp - lastMessageTimestamp
				lastMessageTimestamp = currentTimestamp
				if (cutTime < 300 && cutTime != 0) {
					console.log('消息频繁发送了========')
					this.throttleRender();
					return
				}else{
					// 判断是否是新消息
					if (newList && newList.length == 1) {
						// 判断是否是自己发的新消息 是的话 滚动到最底部
						if (newList[0].from == userInfo.userID) {
							this.scrollDirection = 'bottom'
							if (!this.isScrollBottom) {
								this.isScrollBottom = true
							}
						} 
					
					}
				}
				
				// 初始化获取历史列表的时候 若不够十五条则继续取历史记录
				if (this.isInit && list.length < 15 && !hisTime) {
					hisTime = setInterval(() => {
						this.getHistoryMessageList()
					}, 200)
					setTimeout(() => {
						clearInterval(hisTime)
						hisTime = null
					}, 500)
				}
				// 如果是在查看历史未读消息  则不走messageList 赋值
				if (this.isSeeOld) {
					return
				}
				// 初始化渲染的时候 先渲染五条 再渲染全部的
				if (this.isInit) {
					this.isInit = false
					this.messageList = list.slice(0, 5)
					setTimeout(() => {
						this.messageList = list
						console.log('初始化===', list)
						// getMemberList();
					}, 150)
				} else {
					this.messageList = list
				}
				// console.log('%c onMessageListUpdated...', 'color: red', this.messageList)
				setTimeout(() => {
					this.isShowLoading = false
				}, 300)
				// 监听已读回执
				// if (isEnabledMessageReadReceiptGlobal()) {
				// 	nextTick(() => bindIntersectionObserver());
				// }
				if (!this.isLoadMessage && this.isScrollBottom) {
					if (this.isShowMore) this.isShowMore = false
					if (this.scrollDirection == 'top') return
					this.scrollToBottom()

				}


			},
			onChatCompletedUpdated(flag) {
				this.isCompleted = flag

			},
			onGroupApplicationCountUpdated(count) {
				console.log('加群申请...', count)
				this.groupApplicationCount = count;
			},
			async getAllMessageList(params = {
				conversationID: this.currentConversationID
			}) {
				// console.log('params',params)
				let promiss = TUIChatEngine.chat.getMessageList(params)
				let {
					isCompleted,
					nextReqMessageID,
					messageList
				} = promiss.data
				let newList = messageList.map(item => new TUIFUN(item))
				this.allMessageData = [...this.allMessageData, ...newList]
				if (!isCompleted) {
					params.nextReqMessageID = nextReqMessageID
					this.getAllMessageList(params)
				}
			},
			getHistoryMessageList() {
				// nextTick(() => {
				this.isLoadMessage = true;
				// })
				if (this.isShowLoading) return
				this.isShowLoading = true
				TUIChatService.getMessageList().then(async (res) => {
					const {
						nextReqMessageID: ID,
						isCompleted,
						messageList: hisList
					} = res.data;
					this.nextReqMessageID = ID;
					const query = uni.createSelectorQuery().in(this);
					query
						.select("#hideBox")
						.boundingClientRect((data) => {
							if (data.height == 0) {
								this.isGetAllData = isCompleted
							}
						})
						.exec();
					// if()
					// if (isCompleted) {
					// 	setTimeout(() => {
					// 		isGetAllData.value = false
					// 	}, 2000)
					// }
					this.beforeCout = hisList.length
					uni.$u.debounce(() => {
						this.isLoadMessage = false;
						this.isTopScroll = false;
						this.isCanScrollY = true;
						this.isShowLoading = false
					}, 1000)
					// nextTick( ()=>{
					// })
				});
			},
			toggleApplicationList() {
				this.showGroupApplication = !this.showGroupApplication;
			},
			handleGroupApplication(userID) {
				const index = this.applicationUserIDList.indexOf(userID);
				if (index !== -1) {
					this.applicationUserIDList.splice(index, 1);
				}
			},
			clickDispose() {
				uni.navigateTo({
					url: `/pages/address/views/groupInform/index`,
					events: {
						// 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
						handleGroupApplication: function(data) {
							this.groupApplicationCount = data.amount
							emits('updateMemberCount', 1)
						},
					},
				});
			},
			messageClick() {
				this.toggleID = "";
				this.$emit("closeToolbar");
			},
			messageTouchstart(message) {
				// console.log('touchstart...', JSON.stringify(message.payload))
				this.chooseMessage = message
			},
			handleToggleMessageItem(
				e,
				message,
				index,
				isLongpress = false
			) {
				if (isLongpress) {
					this.hiddenTool = false;
				}
				this.toggleID = this.chooseMessage.ID
			},
			handleH5LongPress(
				e,
				message,
				index,
				type
			) {
				if (!isH5) return;

				function longPressHandler() {
					clearTimeout(timer);
					this.handleToggleMessageItem(e, message, index, true);
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
							this.isLongpressing = false;
						}, 200);
						break;
				}
			},

			handleEdit(message) {
				this.$emit("handleEditor", message, "reedit");
			},
			resendMessage(message) {
				this.reSendDialogShow = true;
				this.resendMessageData = message;
			},
			handleImagePreview(message) {
				if (
					this.showImagePreview ||
					this.currentImagePreview ||
					this.isLongpressing
				) {
					return;
				}
				this.showImagePreview = true;
				this.currentImagePreview = message;
			},
			onImagePreviewerClose() {
				this.showImagePreview = false;
				setTimeout(() => {
					this.currentImagePreview = null;
				}, 50);
			},
			resendMessageConfirm() {
				this.reSendDialogShow = !this.reSendDialogShow;
				const messageModel = this.resendMessageData;
				messageModel.resendMessage();
			},
			cancelSelect() {
				this.checkedList = []
				this.$emit('handChangeInput', false)
			},
			clearSelect() {
				this.checkedList = []
				this.messageList.forEach(msg => {
					msg.isCheck = false
				})
			},
			async blinkMessage(quoteContent) {
				let searchType = this.currentConversationInfo == 'GROUP' ? 'messageSequence' : 'messageTime'
				let i = this.messageList.findIndex(item => item.sequence == quoteContent[searchType])

				// 点击引用直接打开
				this.toLinkMsg(quoteContent[searchType])
				return

				if (i == -1) {
					console.log('获取了blinkMessage====', quoteContent[searchType])
					toLinkMsg(quoteContent[searchType])
					return
				}
				let messageID = this.messageList[i].ID
				console.log('直接滚动了======', messageID)
				return scrollToOriginalMessage(messageID)
			},
			scrollTo({
				finalScrollTop,
				originMessageID
			}) {
				this.isCanLink = true
				this.scrollTop = finalScrollTop;
				// if(!isCanLink.value)return
				// let msgList = messageList.value
				// let fileLen = msgList.map(item => item.type == 'TIMImageElem').length
				// console.log('originMessageID======', originMessageID)
				// observer2?.disconnect();
				// observer2 = uni.createIntersectionObserver(thisInstance).relativeTo('#messageScrollList', { top: -100 })
				// 	observer2.observe(`#msg-bubble-${originMessagTeID}`, async(res) => {
				// 		if(!isNaN(res.intersectionRatio)){
				// 			if(res.intersectionRatio==0){
				// 				console.log('没找到deid',originMessageID)
				// 				console.log('没找到==========',res)
				// 				scrollTop.value = Math.abs(res.boundingClientRect.top)+300;
				// 			}
				// 		}
				// 	})
				this.blinkMessageIDList.length = 0
				this.setBlinkView(originMessageID)

			},
			async scrollToLatestMessage() {
				const {
					scrollHeight
				} = await getScrollInfo(
					"#messageScrollList",
					"messageList"
				);
				const {
					height
				} = await getBoundingClientRect(
					"#messageScrollList",
					"messageList"
				);
				this.oldHeight = scrollHeight;
				this.scrollTop = scrollHeight - height;
			},
			bindIntersectionObserver() {
				if (this.messageList.length === 0) {
					return;
				}

				if (
					groupType === TYPES.value.GRP_AVCHATROOM ||
					groupType === TYPES.value.GRP_COMMUNITY
				) {
					// 直播群以及社群不进行消息的已读回执监听
					return;
				}

				observer?.disconnect();
				observer = uni
					.createIntersectionObserver(this, {
						threshold: [0.7],
						observeAll: true,
						// uni 下会把 safetip 也算进去 需要负 margin 来排除
					})
					.relativeTo("#messageScrollList", {
						top: -70
					});

				observer?.observe(".message-li.in .message-bubble-container", (res) => {
					if (this.sentReceiptMessageID.has(res.id)) {
						return;
					}
					const matchingMessage = this.messageList.find((message) => {
						return res.id.indexOf(message.ID) > -1;
					});
					if (
						matchingMessage &&
						matchingMessage.needReadReceipt &&
						matchingMessage.flow === "in" &&
						!matchingMessage.readReceiptInfo?.isPeerRead
					) {
						TUIChatService.sendMessageReadReceipt([matchingMessage]);
						this.sentReceiptMessageID.add(res.id);
					}
				});
			},
			setReadReciptPanelVisible(visible, message) {
				if (!visible) {
					this.readStatusMessage = undefined;
				} else {
					this.readStatusMessage = message;
				}
				this.isShowReadUserStatusPanel = visible;
			},
			handleGmOrder(_item) {

				let payload = _item.payload;
				let payload_data = JSON.parse(payload.data);

				let code = payload_data.code;
				let value = payload_data.value;

				if (code == "delete_message") {
					if (value.idList) {
						this.handleGmDeleteMessage(value.idList);
					}
				} else if (code == "c2c_set_top") {
					console.log('处理gm指令')
					this.getC2cmsgToplist();
				}

			},
			handleGmDeleteMessage(_idList) {
				isDeleteAllMessage = true
				delTotal = _idList.length
				for (let i = 0; i < _idList.length; i++) {
					let _id = _idList[i];
					this.gmDeleteMessage(_id, _idList.length, _idList.length);
				}
			},
			gmDeleteMessage(_id) {
				const messageModel = TUIStore.getMessageModel(_id);
				if (messageModel) {
					messageModel.deleteMessage().then(() => {
						delCount++
						if (delCount == delTotal) {
							console.log('删除完毕...')
							this.messageList = []
							this.isDeleteAllMessage = false
							delCount = 0

						}
					})
				}

			},
			toGetPower() {
				this.isShowTips = false;
				uni.openAppAuthorizeSetting()
			},
			translateM(translateObj, messageID) { // 翻译消息
				if (translateObj) {
					const userID = this.$store.state.userInfo.userID
					this.loadingTranslate = {
						...this.loadingTranslate,
						[messageID]: true
					}
					this.toggleID = ''
					translateText(translateObj).then(result => {
						if (result) {
							messageTranslateManage.setItem({
								userID,
								messageID,
								text: result
							})
							nextTick(() => {
								this.myMessageTranslates = store.getters.myMessageTranslates || {}
							})
						} else {
							const message = tc("翻译失败");
							Toast({
								message,
								type: TOAST_TYPE.ERROR,
							});
						}
					}).finally(() => {
						this.loadingTranslate = {
							...this.loadingTranslate,
							[messageID]: false
						}
					})
				} else {
					const message = tc("翻译失败");
					Toast({
						message,
						type: TOAST_TYPE.ERROR,
					});
				}
			},
			untranslateM() { // 消息原文
				this.$deletetoggleID = ''
				this.$nextTick(() => {
					this.myMessageTranslates = this.$store.getters.myMessageTranslates || {}
				})
			},
			onAdminDeleMsg(msgArr) {
				this.handleGmDeleteMessage(msgArr)
			},
			revokeMessage(msgArr) {
				// 获取 messageModel
				msgArr.forEach(item => {
					let messageModel = TUIStore.getMessageModel(item);
					messageModel
						.revokeMessage()
						.then(() => {
							enableSampleTaskStatus('revokeMessage');
						})
				})

			},
			chatOnLinsten() {
				TUIChatEngine.chat.on(TUIChatEngine.EVENT.MESSAGE_RECEIVED, function(event) {
					let list = event.data
					console.log('TUIChatEngine.EVENT.MESSAGE_RECEIVED',list)
					if (list && list.length != 0) {
						let groupMsg = list.filter(item => item.type == 'TIMGroupSystemNoticeElem' && item.payload
							.userDefinedField)
						let groupInfo = groupMsg[0]
						try {
							let {
								currentConversationID,
								messageList
							} = this
							let c = JSON.parse(groupInfo.payload.userDefinedField)
							if (c.Desc == 'GM' && c.Data && currentConversationID.indexOf(groupInfo.to) != -1) {
								let {
									Args,
									Cmd
								} = c.Data
								if (Cmd == 'delete_message') {
									this.revokeMessage(Args)
								} else if (Cmd == 'delete_message_by_user') {
									let allMsgIdList = messageList.filter(item => item.from == Args[0]).map(item =>
										item.ID)
									this.revokeMessage(allMsgIdList)
								} else if (Cmd == 'clear_group_msg') {
									TUIChatEngine.chat.clearHistoryMessage(currentConversationID).then(res => {
										let allId = messageList.map(item => item.ID)
										this.revokeMessage(allId)
										this.messageList.length = 0
									})
								} else if (Cmd == 'delete_group_member' || Cmd == 'ban_group_member' || Cmd ==
									'unban_group_member' || Cmd == 'ban_all_group_member') {

									this.$emit('updateGroupCout', {
										Cmd,
										Args
									})
								}

							}
						} catch (e) {
							//TODO handle the exception
						}
					}
					// 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
					// event.name - TencentCloudChat.EVENT.MESSAGE_RECEIVED
					// event.data - 存储 Message 对象的数组 - [Message]
				})
			}





		}
	}
</script>
<style lang="scss" scoped src="./style/index.scss">
</style>