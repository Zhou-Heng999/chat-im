<template>
	<div class="TUIChat" :class="[!isPC ? 'TUIChat-H5' : '']">
		<div class="TUIChat-main">
			<!-- 查看旧数据 -->
			<view class="see-more-msg flex-center" style="top: 420rpx;bottom: auto;z-index: 10;" @click="toOldList"
				v-if="isSeeOldMessage">
				<image-icon name='tb_xxjt' style="transform: scaleY(-1);" size='28'></image-icon>
				{{unreadCountNum}}{{$tc('条新消息')}}
			</view>

			<!-- 回到最新消息 -->
			<view class="see-more-msg flex-center" style="bottom: 680rpx;z-index: 10;" @click="backNewList"
				v-if='isBackNewList'>
				<image-icon name='tb_xxjt' size='28'></image-icon>
				{{$tc('回到最新位置')}}
			</view>

			<view>
				<view v-if="!isShowEdit" class="max-width pos-relative">
					<slot name="topSlot"></slot>
					<div class="TUIChat-application-tips application-top-tips application-top-tips-notification"
						v-if="groupNotification&&isGroup" @click="clickNotification">
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
							</view>

							<view v-if="pinnedMsgContent" style="display: flex;align-items: center;"
								@click="onPinnedMsgContent(pinnedMsgContent)">
								<view style="display: flex;align-items: baseline;width: 100%;">
									<view class="msg-content ellipsis1">
										{{ removeTip(pinnedMsgContent.text) }}
									</view>
								</view>
								<u-icon style="" @tap.native.stop="clickClosePinnedMsg" class="mr-10" name="close"
									color="#737373" size="15"></u-icon>
							</view>
						</view>
					</div>

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

					<view class="loading-box max-width flex-center"
						v-if="isShowLoading&&!isGetAllData&&messageList.length>=15">
						<u-loading-icon></u-loading-icon>
					</view>
				</view>

				<view v-else class="flex-column max-width pd-lr-40 pd-tb-40">
					<view style="height: var(--status-bar-height);"></view>
					<view class="flex-wrap font-blod flex-align">
						<text class="font-36 mr-60" @click="cancelSelect">{{$tc('取消')}}</text>
						<text>{{checkedIdList.length}}</text>
					</view>
				</view>
			</view>
			<scroll-view id="messageScrollList" class="TUI-message-list"
				style="transform:scaleY(-1);overflow-y:auto ;overflow-x:hidden;" scroll-y :scroll-top="scrollTop"
				:scroll-into-view='intoViewID' @scrolltolower='_scrolltolower' @scroll="_onScroll"
				@scrolltoupper='_scrolltoupper'>
				<view style="transform: scaleY(-1); translateZ(0);flex-grow: 0.98;" id="hideBox">

				</view>

				<view v-for="(item, index) in sendingMessageList" :id="`msg-bubble-${item.ID}`" :key="item.ID"
					:class="'message-li ' + item.flow" style="position: relative">
					<view style="transform: scaleY(-1);translateZ(0);">
						<div class="message-item" @click.stop="messageClick" @touchstart="messageTouchstart(item)">
							<MessageTip v-if="
									item.type === TYPES.MSG_GRP_TIP ||
									isCreateGroupCustomMessage(item)
								" :content="getMessageContent(item)" :item="item" />
							<div v-else-if="!item.isRevoked && !isPluginMessage(item)" :id="`msg-bubble-${item.ID}`"
								class="message-bubble-container">
								<MessageBubble :class="['message_bubble', `bubble_${item.flow}`,]" :messageItem="item"
									:blinkMessageIDList="blinkMessageIDList" :toggleID="toggleID"
									:isCheckMore="isShowEdit" :checkedIdList="checkedIdList" @seeCardInfo="seeCardInfo"
									@resendMessage="resendMessage(item)" @changeCheck="changeCheck(item, index)"
									@blinkMessage="blinkMessage" @scrollTo="scrollTo"
									@scrollToOriginalMessage='scrollToOriginalMessage' @longPress="longPressBubble">
									<MessageText v-show="item.type === TYPES.MSG_TEXT" :messageItem="item"
										@seeCardInfo="seeCardInfo" />
									<MessageImage v-show="item.type === TYPES.MSG_IMAGE" :messageItem="item"
										@clickImage="handleImagePreview" />
									<MessageVideo v-if="item.type === TYPES.MSG_VIDEO" :messageItem="item" />
									<MessageMerger v-else-if="item.type === TYPES.MSG_MERGER" :messageItem="item" />
									<MessageAudio v-else-if="item.type === TYPES.MSG_AUDIO" :messageItem="item" />
									<MessageFile v-else-if="item.type === TYPES.MSG_FILE" :messageItem="item" />
									<MessageCustom v-else-if="item.type === TYPES.MSG_CUSTOM" @seeCardInfo="seeCardInfo"
										:messageItem="item" />
									<!-- <view v-else>没有兼容的消息</view> -->
								</MessageBubble>
							</div>
							<MessagePlugin v-else-if="!item.isRevoked && isPluginMessage(item)" :message="item"
								@resendMessage="resendMessage" @handleToggleMessageItem="handleToggleMessageItem"
								@handleH5LongPress="handleH5LongPress" />


						</div>
					</view>
				</view>
				<view class="h100 flex-center font-22 less-color pd-lr-40" style="transform: scaleY(-1);"
					v-if="!isMyFriend">
					{{$tc('你还不是他（她）的朋友，请发送朋友验证请求。')}}<text class="blue-color"
						@click="openAddModal">{{$tc('发送朋友验证')}}</text>
				</view>

				<view v-for="(item, index) in cutMessageList" :id="`msg-bubble-${item.ID}`" :key="item.ID"
					:class="'message-li ' + item.flow" style="position: relative">
					<view style="transform: scaleY(-1);translateZ(0);">
						<MessageTimestamp v-if="item" :message="item" :currTime="item.time"
							:prevTime="cutMessageList[index - 1] ? cutMessageList[index - 1].time : 0"
							:nextTime="cutMessageList[index + 1] ? cutMessageList[index + 1].time : 0">
						</MessageTimestamp>
						<div class="message-item" @click.stop="messageClick" @touchstart="messageTouchstart(item)">
							<MessageTip v-if="
									item.type === TYPES.MSG_GRP_TIP ||
									isCreateGroupCustomMessage(item)
								" :content="getMessageContent(item)" :item="item" />

							<view v-else-if="
								item.type == 'TIMCustomElem' &&
								item.payload.description == 'newFriends'
							" class="newFriends-box flex-center">
								{{$tc('你们已成为好友，打声招呼吧')}}
							</view>
							<div v-else-if="!item.isRevoked && !isPluginMessage(item)" class="message-bubble-container">
								<!-- {{item.from}} -->
								<!-- <MessageBubble :class="['message_bubble', `bubble_${item.flow}`,]" :messageItem="item" :blinkMessageIDList="blinkMessageIDList"
									:toggleID="toggleID" :isCheckMore="isShowEdit" :checkedIdList="checkedIdList"
									@seeCardInfo="seeCardInfo" @resendMessage="resendMessage(item)"
									@changeCheck="changeCheck(item, index)" @blinkMessage="blinkMessage"
									@scrollTo="scrollTo" @scrollToOriginalMessage='scrollToOriginalMessage'
									@longPress="longPressBubble"> -->

								<view :id="`main_${item.ID}`"
									:class="['message_bubble', `bubble_${item.flow}`,isShowEdit ? 'pl_80' : '']"
									@touchstart="touchstart($event,item)" @touchmove='touchmove' @touchend="touchend"
									@click="changeCheck(item, index)">
									<view v-if="isShowEdit" class="icon_check">
										<imageIcon v-if="checkedIdList.includes(item.ID)" name="tb_g1" :size="34" />
										<imageIcon v-else name="tb_g2" :size="34" />
									</view>
									<image v-if="item.flow!='out'" mode='aspectFill' class="avatar"
										:src="item.avatar + '?imageMogr2/thumbnail/100x/'" @click="clickAvatar(item)" />
									<view class="center">
										<view v-if="showProgress(item)" class="progress_bg">
											<progress class="progress" :percent="item.progress * 100" />
										</view>
										<view v-if="item.flow!='out'" class="show_name">{{ showName(item) }}</view>

										<!-- <view v-if="!messageItem.isShowNick" class=""></view> -->

										<view
											:class="['content',isTouchStart && toggleID == item.ID?'content_opacity':'']">

											<!-- 自定义消息处理逻辑 -->
											<view v-if="item.cloudCustomData" class="cloud_custom_data">
												<!-- 转发消息才有的提示 -->
												<view v-if="contentItem(item).from" class="forward_tip">
													<text class="mr-10">{{ $tc('转发的消息') }}</text>
													<text>{{ contentItem(item).from }}</text>
												</view>

												<!-- 回复消息 -->
												<DefMessageQuote v-else :message="item" @blinkMessage="blinkMessage"
													@scrollTo="scrollTo"
													@scrollToOriginalMessage="scrollToOriginalMessage(item.ID)" />
											</view>

											<!-- 消息主体 -->
											<!-- 文本 -->
											<view class="message-text" v-if="item.type === TYPES.MSG_TEXT">
												<view class="default_text text-box"
													v-html="formatText(item.payload.text,item)"
													@click="clickItem($event,item)" />

												<view v-if="hasTranslates(item) || loadingTranslate(item)"
													:class="['translate_text', `translate_text_${item.flow}`]">
													<u-loading-icon v-if="loadingTranslate(item)"
														:style="{ width: 'fit-content' }" />
													<view v-else-if="hasTranslates(item)" class="default_text text-box"
														v-html="formatText(hasTranslates(item).text[0].text,item)">
													</view>
												</view>
											</view>

											<!-- 图片 -->

											<view class="message-image" v-else-if="item.type === TYPES.MSG_IMAGE">
												<ImageCache class="image"
													v-if="showInfo(item).url || showInfo(item).imageUrl"
													:src="showInfo(item).url || showInfo(item).imageUrl"
													@click="clickImage(item)" />

												<view v-if="contentItem(item)" class="message-text cloud_custom_data">
													<view class="default_text text-box"
														@click="clickItem($event,formatCloudMessageItem(item))" />

													<view
														v-if="hasTranslates(formatCloudMessageItem(item)) || loadingTranslate(formatCloudMessageItem(item))"
														:class="['translate_text', `translate_text_${formatCloudMessageItem(item).flow}`]">
														<u-loading-icon
															v-if="loadingTranslate(formatCloudMessageItem(item))"
															:style="{ width: 'fit-content' }" />
														<view v-else-if="hasTranslates(formatCloudMessageItem(item))"
															class="default_text text-box"
															v-html="formatText(hasTranslates(item).text[0].text,formatCloudMessageItem(item))">
														</view>
													</view>
												</view>
												<!-- <MessageText
										    v-if="content"
										    class="cloud_custom_data"
										    :messageItem="formatCloudMessageItem"
										  /> -->
											</view>


											<!-- 视频 -->

											<!-- 	<view class="message-video" v-else-if="item.type === TYPES.MSG_VIDEO" >
										  <imageIcon @click="clickVideoImage(item)" v-if="item.status === 'success'|| item.progress === 1" :size='100' name='video-play' class="play_icon" />
											<view class="" style="position: relative;" @click="clickVideoImage(item)" >
												
										  <ImageCache
										    class="image"
										    :src="item.payload.snapshotUrl"
										    style="max-width: 400rpx; max-height: 300rpx;"
										  /></view>
										 <view v-if="contentItem(item)" class="message-text cloud_custom_data"  >
										 	<view class="default_text text-box"  @click="clickItem($event,formatCloudMessageItem(item))" />
										 	
										 	<view
										 		v-if="hasTranslates(formatCloudMessageItem(item)) || loadingTranslate(formatCloudMessageItem(item))"
										 		:class="['translate_text', `translate_text_${formatCloudMessageItem(item).flow}`]"
										 	>
										 		<u-loading-icon
										 			v-if="loadingTranslate(formatCloudMessageItem(item))"
										 			:style="{ width: 'fit-content' }"
										 		/>
										 		<view v-else-if="hasTranslates(formatCloudMessageItem(item))" class="default_text text-box" v-html="formatText(hasTranslates(item).text[0].text,formatCloudMessageItem(item))" ></view>
										 	</view>
										 </view>
										</view> -->



											<!-- 音频消息 -->

											<!-- <view class="message-audio flex-center" :class="[item.flow === 'out' && 'reserve']" @click="handlePlay(item)" v-else-if="item.type === TYPES.MSG_AUDIO" >
												  <view class="mr-10">
												  	<audioAnm :isPlay="isPlay" :size="24" :direction="item.flow === 'out'? 'left':'right'"></audioAnm>
												  </view>
											  <label class="audio-time">
											    {{ item.payload.second || 1 }}
											  </label>
											</view> -->
											<!-- 合并消息 -->

											<!-- <div class="merger-box flex-column flex-between" @click='downloadMergerMessage(item)' v-else-if="item.type === TYPES.MSG_MERGER" >
													<view class="flex-align fon-28 mb-10 max-width">
														{{$tc('聊天记录')}}
													</view>
													<view class="flex top-box max-width less-black flex-column u-line-1">
														<view class="mb-10 font-24 u-line-1" v-for="(pitem,index) in item.payload.abstractList" v-if="index<3" >{{ handleItem(pitem)}}</view>
													</view>
												</div> -->

											<!-- 文件消息 -->
											<!-- <view class="message_file" v-else-if="item.type === TYPES.MSG_FILE" >
											  <view class="file" @click="clickFile(item)">
											    <imageIcon
											      class="icon"
											      :size='92'
											      :name="iconName(item)"
											    />
											    <view class="right">
											      <view class="name ellipsis1">{{ item.payload.fileName }}</view>
											      <view :class="['size', `size_${item.flow}`]">{{ showSize(item) }}</view>
											    </view>
											  </view>
											  <view v-if="contentItem(item)" class="message-text cloud_custom_data"  >
											  	<view class="default_text text-box"  @click="clickItem($event,formatCloudMessageItem(item))" />
											  	
											  	<view
											  		v-if="hasTranslates(formatCloudMessageItem(item)) || loadingTranslate(formatCloudMessageItem(item))"
											  		:class="['translate_text', `translate_text_${formatCloudMessageItem(item).flow}`]"
											  	>
											  		<u-loading-icon
											  			v-if="loadingTranslate(formatCloudMessageItem(item))"
											  			:style="{ width: 'fit-content' }"
											  		/>
											  		<view v-else-if="hasTranslates(formatCloudMessageItem(item))" class="default_text text-box" v-html="formatText(hasTranslates(item).text[0].text,formatCloudMessageItem(item))" ></view>
											  	</view>
											  </view>
											</view> -->

											<!-- 自定义消息 -->

											<!-- <div class="custom" v-else-if="item.type === TYPES.MSG_CUSTOM" >
													<view v-if="customContent(item).custom=='business'" @click="clickBusiness(item)" >
														<view class="business-box">
															<view class="flex-align pd-tb-20">
																<avatarModal w='80' h='80' class="mr-30 mb-10" :info='formatData(item)' ></avatarModal>
																<text class="main-text" >{{formatData(item).nick}}</text>
															</view>
															<view class="flex-align less-black font-24 business-bottom" >{{$tc('个人名片')}}</view>
														</view>
													</view>
											    <span v-else v-html="customContent(item).custom"></span>
											</div> -->

											<!-- <MessageImage v-show="item.type === TYPES.MSG_IMAGE" :messageItem="item"
												@clickImage="handleImagePreview" /> -->
											<MessageVideo v-if="item.type === TYPES.MSG_VIDEO" :messageItem="item" />
											<MessageMerger v-else-if="item.type === TYPES.MSG_MERGER"
												:messageItem="item" />
											<MessageAudio v-else-if="item.type === TYPES.MSG_AUDIO"
												:messageItem="item" />
											<MessageFile v-else-if="item.type === TYPES.MSG_FILE" :messageItem="item" />
											<MessageCustom v-else-if="item.type === TYPES.MSG_CUSTOM"
												@seeCardInfo="seeCardInfo" :messageItem="item" />


											<!-- 消息主体end -->


											<text class="time"
												v-if="$u.timeFormat(item.time,'h:M')">{{ $u.timeFormat(item.time,'h:M') }}</text>
										</view>
									</view>


									<view v-if="item.flow=='out'" class="status">
										<view v-if="item.status === 'fail' || item.hasRiskContent" class="icon_fail"
											@click="resendMessage(item)">
											!
										</view>
										<imageIcon v-if="item.status === 'unSend'" :size='30' name='loading'
											class="loadingCircle" />
									</view>



									<!-- <view v-else>没有兼容的消息</view> -->
								</view>
								<!-- </MessageBubble> -->
							</div>
							<MessagePlugin v-else-if="!item.isRevoked && isPluginMessage(item)" :message="item"
								@resendMessage="resendMessage" @handleToggleMessageItem="handleToggleMessageItem"
								@handleH5LongPress="handleH5LongPress" />

						</div>
					</view>
				</view>




				<view class="h80 flex-center font-22 less-color" style="transform: scaleY(-1); translateZ(0);"
					v-if="isGetAllData">{{$tc('暂无更多数据')}}</view>

			</scroll-view>

			<view v-if="toggleID && !hiddenTool" class='box-pos' :style="{...toolStyle,zIndex:'8888',width: '284rpx'}">
				<MessageTool :isPower="isPower" :messageItem="messageItem" @clearID='toggleID=""'
					@onChangeMsg='onChangeMsg' @deleMsg='deleMsg' @onChangeMsgPinned='onChangeMsgPinned' />
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
			<u-modal :show="reSendDialogShow" v-if='reSendDialogShow'
				:title='$tc(TUITranslateService.t("TUIChat.确认重发该消息？"))' :confirmText='$tc("确定")' :cancelText='$tc("取消")'
				showCancelButton @cancel='reSendDialogShow=!reSendDialogShow' @confirm='resendMessageConfirm'></u-modal>

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
<script lang="ts" setup>
	import {
		ref,
		computed,
		nextTick,
		onMounted,
		onUnmounted,
		getCurrentInstance,
		watch,
	} from "../../../adapter-vue";

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
	import verify from '@/pages/home/components/verify/index.vue'
	import DefMessageQuote from "./message-elements/def-message-quote/index.vue";
	import MessageText from "./message-element/message-text.vue";
	import MessageImage from "./message-element/message-image.vue";
	import MessageVideo from "./message-element/message-video.vue";
	import MessageAudio from "./message-element/message-audio.vue";
	import MessageFile from "./message-element/message-file.vue";
	import MessageCustom from "./message-element/message-custom.vue";
	import MessageMerger from "./message-element/message-merger.vue";
	import MessageTip from "./message-elements/message-tip.vue";
	import MessageBubble from "./message-element/message-bubble.vue";
	import MessageTimestamp from "./message-elements/message-timestamp.vue";
	import MessageTool from "./message-tool/index.vue";
	import MessageGroupSystem from "./message-elements/message-group-system.vue";
	import MessagePlugin from "../../../plugins/plugin-components/message-plugin.vue";
	import ReadReciptPanel from "./read-receipt-panel/index.vue";
	import { isPluginMessage } from "../../../plugins/plugin-components/index";
	import Dialog from "../../common/Dialog/index.vue";
	import ImagePreviewer from "../../common/ImagePreviewer/index.vue";
	import { isCreateGroupCustomMessage } from "../utils/utils";

	import {
		getBoundingClientRect,
		getScrollInfo,
		instanceMapping,
	} from "../../../utils/universal-api/domOperation";
	import { isEnabledMessageReadReceiptGlobal } from "../utils/utils";
	import { isPC, isH5 } from "../../../utils/env";
	import imageIcon from "@/components/image-icon";
	import { enableSampleTaskStatus } from "../../../utils/enableSampleTaskStatus";
	import { JSONToObject } from "../../../utils/index";
	import { Toast, TOAST_TYPE } from "../../common/Toast/index";
	import { tc } from '@/utils/util'
	import confirmModal from '@/components/confirm-modal'
	import { ListMixin } from '@/mixin/list';
	import ImageCache from '@/components/image-cache';
	import getContentFn from "../utils/getContent";
	import audioAnm from "@/components/audioAnm/index"
	import { TUIGlobal } from "../../../utils/universal-api/index";
	import { fileType } from "@/const";
	const props = defineProps({
		groupID: {
			type: String,
			default: "",
		},
		conversation: {
			type: Object,
			default() {
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
	});
	const newMsgID = ref([]);
	const isHasAllData = ref(false)
	const allMessageData = ref([])
	const oldNextID = ref('')
	const isShowMore = ref(false)
	const bottomID = ref('')
	const isInit = ref(true)
	const isSeeOld = ref(false)
	const noReadList = ref([])
	const isBackNewList = ref(false)
	const allData = ref([]);
	const unreadCountNum = ref(0);
	const topID = ref('')
	const isLinkMsg = ref(true)
	const toolStyle = ref(null)
	const checkedIdList = ref<string[]>([])
	const isInitData = ref(false)
	const oldMessageList = ref<IMessageModel[]>([])
	const isCanLink = ref(false)
	// 频发消息数据加载
	const msgData = ref([])
	const isHasDone = ref(true)
	const noReadCout = ref(0)
	let dataTime = null
	const cutNum = 30
	let intervalScrollNotification = null;
	let timeoutScrollList = null;
	const isCardShow = ref(false);
	const cardInfo = ref(null);
	const seeCardInfo = (obj) => {
		cardInfo.value = obj;
		isCardShow.value = true;
	};
	const getMessageContent = (item) => {
		let messageHandlers = {
			[TUIChatService.getEngine().TYPES.MSG_TEXT]: (e) =>
				TUIChatService.getEngine().TUIChat.messageHandler.handleTextMessage(e),
			[TUIChatService.getEngine().TYPES.MSG_FACE]: (e) =>
				TUIChatService.getEngine().TUIChat.messageHandler.handleFaceMessage(e),
			[TUIChatService.getEngine().TYPES.MSG_LOCATION]: (e) =>
				TUIChatService.getEngine().TUIChat.messageHandler.handleLocationMessage(
					e
				),
			[TUIChatService.getEngine().TYPES.MSG_IMAGE]: (e) =>
				TUIChatService.getEngine().TUIChat.messageHandler.handleImageMessage(e),
			[TUIChatService.getEngine().TYPES.MSG_AUDIO]: (e) =>
				TUIChatService.getEngine().TUIChat.messageHandler.handleAudioMessage(e),
			[TUIChatService.getEngine().TYPES.MSG_VIDEO]: (e) =>
				TUIChatService.getEngine().TUIChat.messageHandler.handleVideoMessage(e),
			[TUIChatService.getEngine().TYPES.MSG_FILE]: (e) =>
				TUIChatService.getEngine().TUIChat.messageHandler.handleFileMessage(e),
			[TUIChatService.getEngine().TYPES.MSG_CUSTOM]: (e) =>
				TUIChatService.getEngine().TUIChat.messageHandler.handleCustomMessage(e),
			[TUIChatService.getEngine().TYPES.MSG_MERGER]: (e) =>
				TUIChatService.getEngine().TUIChat.messageHandler.handleMergeMessage(e),
			[TUIChatService.getEngine().TYPES.MSG_GRP_TIP]: (e) => {
				const payload = item._message.payload;
				// 禁言某个成员
				if (payload.operationType == 7) return

				if (payload.operationType == 4) {
					return { text: ` ${tc('群成员')}` + '：' + item._message.nick + ` ${tc('成为管理员')}` };
				}
				// 删除某个成员
				if (payload.operationType == 3 && payload.memberList.length > 0) return

				if (
					payload.operationType === 6 &&
					Object.keys(payload.newGroupProfile || {})[0] === "notification"
				) {
					if (payload.newGroupProfile.notification === "") {
						return { text: item._message.nick + ` ${tc('删除群公告')}` };
					}
				}
				var oldObj = TUIChatService.getEngine().TUIChat.messageHandler.handleGroupTipsMessage(e);
				let obj = {
					text: ''
				}
				if (oldObj.text) {
					oldObj.text = oldObj.text.replace('群成员', tc('群成员'))
					var arr = oldObj.text.split(" "); // 将字符串按空格进行分割
					obj.text = `${arr[arr.length - 2]} ${tc(arr[arr.length - 1])}`
				}

				return obj
				// return TUIChatService.getEngine().TUIChat.messageHandler.handleGroupTipsMessage(e);
			},
		};
		const e = messageHandlers[item.type];
		if (!e) return {};
		if (item.type === TUIChatService.getEngine().TYPES.MSG_GRP_TIP)
			return e(item._message);
		const t = TUIChatService.getEngine().TUIFriend.getFriendRemark([item.from]);
		return Object.assign(Object.assign({}, e(item._message)), {
			showName: t[item.from] || item.nameCard || item.nick || item.from,
		});
	};

	// 添加好友
	const isVerifyShow = ref(false)
	const userNick = ref('')
	function addFriend(val) {

		TUIChatEngine.chat.addFriend({
			to: currentConversationInfo.value.userProfile.userID,
			source: 'AddSource_Type_Search',
			wording: val,
			remark: '',
			groupName: '',
		}).then(res => {
			isVerifyShow.value = false
			Toast({
				message: tc('已发送好友申请'),
				type: TOAST_TYPE.NORMAL,
			});
			ListMixin.methods.sendFirstMsg(currentConversationInfo.value.userProfile.userID)
		}).catch(err => {
			console.log('addFriend添加好友失败...', err)
			if (err == 'Error: The specified userID is my friend already') {
				console.log('删除好友咯')
				TUIChatEngine.chat.deleteFriend({
					userIDList: [currentConversationInfo.value.userProfile.userID],
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
	}

	const messageItem = computed(() => {
		if (toggleID.value) {
			return messageList.value.find(item => item.ID === toggleID.value)
		} else {
			return null
		}
	})

	const openAddModal = () => {

		TUIChatEngine.chat.getMyProfile().then(res => {
			userNick.value = tc('我是') + " " + res.data.nick
			isVerifyShow.value = true
		})

	}

	const refGroupNotification = ref();
	const notificationScrollLeft = ref(0);
	const pageNum = ref(1)
	let observer : any = null;
	let observer2 : any = null;
	let groupType : string | undefined;
	const sentReceiptMessageID = new Set<string>();
	const thisInstance = getCurrentInstance()?.proxy || getCurrentInstance();
	const paging = ref(null);
	const isShowLoading = ref(false)
	const isGetOldList = ref(true)
	const messageListRef = ref();
	const title = ref("TUIChat");
	const messageList = ref<IMessageModel[]>([]);
	const isCompleted = ref(false);
	const currentConversationInfo = ref(getApp().globalData.currentConversationInfo)
	const currentConversationID = ref(getApp().globalData?.currentConversationInfo?.conversationID);
	// console.log('getApp().globalData.currentConversationInfo',getApp().globalData.currentConversationInfo)
	const nextReqMessageID = ref();
	const toggleID = ref("");
	const scrollTop = ref(); // 首次是 15 条消息，最大消息高度为300
	const TYPES = ref(TUIChatEngine.TYPES);
	const listRef = ref();
	const isLoadMessage = ref(false);
	const isLongpressing = ref(false);
	const blinkMessageIDList = ref<string[]>([]);
	const isMyFriend = ref(true)
	const pinnedMsg = ref(null); // 置顶的会话信息
	let hisTime = null
	// 阅读回执状态message
	const readStatusMessage = ref<IMessageModel>();
	const isShowReadUserStatusPanel = ref<boolean>(false);

	// 加群申请系统消息
	const groupApplicationCount = ref(0);
	const showGroupApplication = ref(false);
	const applicationUserIDList = ref([]);
	const allMessageList = ref([]);
	// 消息重发 Dialog
	const reSendDialogShow = ref(false);
	const resendMessageData = ref();


	//置顶消息相关
	const pinnedMsgList = ref([]);// 置顶的会话信息
	const pinnedMsgIndex = ref<number>(0);
	const pinnedMsgContent = ref<any>(null);
	const selectedPinnedMsg = ref<any>(null);



	const emits = defineEmits(["handleEditor", "handChangeInput", "closeToolbar", 'updateMemberCount', 'updateGroup', 'groupWatch']);

	// 图片预览相关
	const showImagePreview = ref(false);
	const currentImagePreview = ref<IMessageModel>();
	const imageMessageList = computed(() =>
		messageList?.value?.filter((item : IMessageModel) => {
			return (
				!item.isRevoked &&
				!item.hasRiskContent &&
				item.type === TYPES.value.MSG_IMAGE
			);
		})
	);


	// 消息滑动到底部，建议搭配 nextTick 使用
	const allHeight = ref("");
	const isTopScroll = ref(false);
	const isCanScrollY = ref(true);

	// 滚动到最底部了
	const isScrollBottom = ref(true)
	const oldScrollTop = ref(0)
	const hiddenTool = ref(false);
	const isHasCloseNoMore = ref(false)
	const scrollDirection = ref('bottom')
	const _onScroll = (e) => {
		// toggleID.value = "";
		scrollDirection.value = oldScrollTop.value < e.detail.scrollTop ? 'top' : 'bottom'
		oldScrollTop.value = e.detail.scrollTop
		// scrollTop.value=e.detail.scrollTop
		if (e.detail.scrollTop == 0) {
			isScrollBottom.value = true
		} else {
			isScrollBottom.value = false
		}
		// console.log('e.detail.scrollTop',e.detail.scrollTop)
		// console.log('scrollTop======',e.detail.scrollTop)
		// observer2?.disconnect();
	};
	const oldHeight = ref("");
	const scrollToBottom = () => {
		console.log('滚动到底部了。。。。')
		scrollTop.value = oldScrollTop.value
		nextTick(function () {
			scrollTop.value = 0
		});
	};
	const getGroupCustomField = async (groupInfo) => {
		pinnedMsgList.value = [];
		pinnedMsgIndex.value = 0;
		let { groupCustomField } = groupInfo;
		for (let i = 0; i < groupCustomField.length; i++) {
			let item = groupCustomField[i]
			if (item.key == "pinnedMsgs") {
				if (item.value && item.value.length > 0) {
					pinnedMsgList.value = JSON.parse(item.value);
				}
				else {
					pinnedMsgList.value = item.value;
				}
				break;
			}
		}
		// groupCustomField.forEach(item => {

		// })
		// console.log('pinnedMsgList.value', pinnedMsgList.value)
		if (pinnedMsgList.value && pinnedMsgList.value.length > 0) {
			for (let i = pinnedMsgList.value.length - 1; i >= 0; i--) {
				let messageBody = await handlePinnedMsg(pinnedMsgList.value[i].seq);

				if (!messageBody) {
					pinnedMsgList.value.splice(i, 1);
				}
				else {

					if (typeof (pinnedMsgList.value[i]) == 'object') {
						pinnedMsgList.value[i].body = messageBody;
					}

				}
			}
			pinnedMsgList.value.reverse()
			console.log('pinnedMsgContent.value=========', pinnedMsgContent.value)
			if (pinnedMsgList.value[pinnedMsgIndex.value]) {
				if (pinnedMsgList.value[pinnedMsgIndex.value].body) {
					pinnedMsgContent.value = handlePinnedMsgContent(pinnedMsgList.value[pinnedMsgIndex.value].body);
				}
				else {
					pinnedMsgContent.value = null;
				}
			}

		}
		else {
			console.log('删完了')
			pinnedMsgContent.value = null;
		}
	}
	const onUpdateGroupCustomField = () => {

		TUIGroupService.getGroupProfile({
			groupID: currentConversationInfo.value.groupProfile.groupID,
		}).then(res => {
			console.log('getGroupCustomField====', res.data.group)
			getGroupCustomField(res.data.group)
		})
	}
	const onGroupHandle = async () => {
		console.log('onGroupHandle=======',)
		let conversation = currentConversationInfo.value
		TUIGroupService.getGroupApplicationList().then((res : any) => {
			console.log('getGroupApplicationList', res)
			const applicationList = res.data.applicationList.filter(
				(application : any) => application.groupID === props.groupID
			);
			applicationUserIDList.value = applicationList.map((application : any) => {
				return application.applicationType === 0
					? application.applicant
					: application.userID;
			});
			TUIStore.update(
				StoreName.CUSTOM,
				"groupApplicationCount",
				applicationList.length
			);
		});
		// 开启已读回执的状态 群聊缓存群类型
		if (isEnabledMessageReadReceiptGlobal()) {
			const { groupProfile } =
				TUIStore.getConversationModel(currentConversationID.value) || {};
			groupType = groupProfile?.type;
		}


		if (conversation?.type === TUIChatEngine.TYPES.CONV_GROUP) {
			watchGroup()
			onUpdateGroupCustomField()
		}
		else if (conversation?.type === TUIChatEngine.TYPES.CONV_C2C) {
			getC2cmsgToplist();
		}
	}
	// 消息主体
	function showProgress(messageItem) {
		if (messageItem.status !== 'unSend') {
			return false
		} else {
			return messageItem.status === 'unSend' &&
				[TUIChatEngine.TYPES.MSG_IMAGE, TUIChatEngine.TYPES.MSG_VIDEO, TUIChatEngine.TYPES.MSG_AUDIO, TUIChatEngine.TYPES.MSG_FILE].includes(messageItem.type)
		}
	}
	function changeItemCheck() {
		this.$emit("changeCheck")
		this.onSendMsgError()
	}
	function showName(messageItem) {
		return messageItem.nameCard || messageItem.nick
	}
	function clickAvatar(messageItem) {
		const conversationModel = TUIStore.getConversationModel(messageItem.conversationID);
		thisInstance.setCardInfo(
			messageItem.from,
			conversationModel,
			(options) => {
				seeCardInfo(options)
				// this.$emit('seeCardInfo', options)
			}
		)
	}
	let timeout = null
	const isTouchStart = ref(false)
	function touchstart(e, messageItem) {
		isTouchStart.value = true
		timeout = setTimeout(() => {
			onLongPress(e, messageItem)
		}, 500)
	}
	function touchmove() {
		isTouchStart.value = false
		if (timeout) {
			clearTimeout(timeout)
			timeout = null
		}
	}
	function touchend() {
		isTouchStart.value = false
		if (timeout) {
			clearTimeout(timeout)
			timeout = null
		}
	}

	function onLongPress(e, messageItem) {
		let { screenHeight, screenWidth } = thisInstance.platform
		let { pageY, pageX } = e.touches[0]
		let toolStyle = null
		let quoteContent = false
		try {
			let messageCl = JSON.parse(messageItem.cloudCustomData || "{}");
			quoteContent = messageCl.messageReply ? true : false
		} catch (e) {
			quoteContent = false
		}
		const query = uni.createSelectorQuery();
		query.select(`#main_${messageItem.ID}`).boundingClientRect();
		query.exec(() => {
			let extra = messageItem.flow === 'in' ? 80 : 0
			if (pageY < screenHeight / 2) {
				toolStyle = { top: pageY + 'rpx', left: pageX + extra + 'rpx' }
			}
			if (pageY > screenHeight / 2) {
				toolStyle = { bottom: (screenHeight - pageY) + 'rpx', left: pageX + extra + 'rpx' }
			}
			longPressBubble({ toolStyle, isLongpress: true })
			// this.$emit("longPress", { toolStyle, isLongpress: true })
		});
	}



	function onSendMsgError(messageItem) {
		let { from, flow, payload, avatar, nick } = messageItem
		let t = {
			from, flow, payload, avatar, nick
		}
		thisInstance.$http.app_user.errlog({
			log: JSON.stringify(t)
		}).then(res => {
			console.log('onSendMsgError===', res)
		})
	}
	// 文本消息内容逻辑
	const hasTranslates = (messageItem) => {
		return thisInstance.$store.getters.myMessageTranslates?.[messageItem.ID]
	}
	const loadingTranslate = (messageItem) => {
		return thisInstance.$store.state.loadingTranslates[messageItem.ID]
	}
	const hasUrl = (text) => {
		let pattern = /(https?:\/\/[^\s]+)/g;
		return pattern.test(text)
	}
	const replaceUrlText = (url, flow) => {
		let color = flow == 'out' ? '#4285F6' : '#4285F6';
		var pattern = /(https?:\/\/[^\s]+)/g;
		url = url.replace(pattern, (match) => {
			return `<uni-text style="color: ${color};text-decoration: underline;" data-url="${match}">${match}</uni-text>`;
		});
		return url
	}
	function replaceAtText(text, flow) {
		let color = flow == 'out' ? '#4285F6' : '#4285F6';
		let pat = /@([^_\s]+)_{([^#]+#[^}]+)}/g;

		let replaceText = `<uni-text data-mention="$2" style="color:${color}; cursor: pointer;">@$1</uni-text>`;
		text = text ? text.replace(pat, replaceText) : '';

		let replaceText2 = `<uni-text style="color:${color};">${thisInstance.$tc('@所有人')}</uni-text>`;
		text = text ? text.replace('@所有人', replaceText2) : '';

		return text
	}

	function formatText(text, messageItem) {
		let t = null
		if (hasUrl(text)) {
			t = replaceUrlText(text, messageItem.flow)
		} else {
			t = text
		}
		t = replaceAtText(t, messageItem.flow)
		return t
	}

	function clickItem(event, item) {
		const dataset = event.target.dataset
		if (dataset.mention) { // @行为
			const conversationModel = TUIStore.getConversationModel(item.conversationID);
			thisInstance.setCardInfo(
				dataset.mention,
				conversationModel,
				(options) => {
					seeCardInfo(options)
					// this.$emit('seeCardInfo', options)
				}
			)
		} else if (dataset.url) { //url
			thisInstance.jumpUrl(dataset.url)
		}
	}


	// 图片消息逻辑
	function showInfo(messageItem) {
		return {
			...messageItem?.payload?.imageInfoArray?.[1] || ''
		}
	}
	function contentItem(messageItem) {
		return getContentFn(messageItem)
	}
	function formatCloudMessageItem(messageItem) {
		if (contentItem(messageItem)) {
			return {
				...messageItem,
				payload: {
					text: contentItem(messageItem).txt
				}
			}
		} else {
			return {}
		}
	}
	function clickImage(messageItem) {
		handleImagePreview(messageItem)
		// this.$emit('clickImage', this.messageItem)
	}

	// 视频消息
	function clickVideoImage(messageItem) {
		getApp().globalData.videoUrl = messageItem.payload.videoUrl
		uni.navigateTo({
			url: `/pages/TUIKit/components/TUIChat/video-play`,
		});
	}

	// 合并消息
	async function downloadMergerMessage(messageItem) {
		let messageList = null
		console.log('messageItem===', messageItem)
		if (messageItem.payload.downloadKey != '') {
			await TUIChatEngine.chat.downloadMergerMessage(messageItem).then(res => {
				console.log(res)
				messageList = res.payload.messageList
			})
		} else {
			messageList = messageItem.payload.messageList
		}
		messageList.forEach(item => item.conversationID = messageItem.conversationID)
		getApp().globalData.mergerTitle = messageItem.payload.title
		getApp().globalData.mergerAllList = messageItem
		getApp().globalData.mergerList = messageList
		uni.navigateTo({
			url: '/pages/home/views/merger/index',
		})

	}

	function handleItem(item) {
		let msg = thisInstance.removeTip(item);
		let newContent = msg.replace(/\[消息\]/g, thisInstance.$tc('[消息]'))
			.replace(/\[图片\]/g, thisInstance.$tc('[图片]'))
			.replace(/\[语音\]/g, thisInstance.$tc('[语音]'))
			.replace(/\[视频\]/g, thisInstance.$tc('[视频]'))
			.replace(/\[文件\]/g, thisInstance.$tc('[文件]'))
			.replace(/\[文本\]/g, thisInstance.$tc('[文本]'))
			.replace(/\[个人名片\]/g, thisInstance.$tc('[个人名片]'))
			.replace(/\[聊天记录\]/g, thisInstance.$tc('[聊天记录]'));
		return newContent;
	}

	// 音频消息
	// const audioRef = ref(TUIGlobal.createInnerAudioContext())
	// const isPlay = ref(false)
	// function onWatchAudio() {
	// 	audioRef.value.onPlay(() => {
	// 		console.log("开始播放");
	// 	});
	// 	audioRef.value.onEnded(() => {
	// 		console.log("停止播放");
	// 		isPlay.value = false;
	// 	});
	// 	audioRef.value.onError((err) => {
	// 		isPlay.value = false;
	// 		console.log("报错了", err)
	// 		// ios 音频播放无声，可能是因为系统开启了静音模式
	// 		TUIGlobal?.showToast({
	// 			icon: "none",
	// 			title: "该音频暂不支持播放",
	// 		});
	// 	});
	// 	audioRef.value.onPause(() => {
	// 		isPlay.value = false;
	// 	});

	// 	// 监听一个关闭播放
	// 	uni.$on('stopAudioPlay', () => {
	// 		audioRef.value.stop();
	// 		isPlay.value = false;
	// 	})
	// }

	// 文件消息
	function iconName(messageItem) {
		const fileExtension = getFileExtension(messageItem.payload.fileUrl);

		for (const mapping of fileType) {
			if (mapping.arr.includes(fileExtension)) {
				return mapping.icon;
			}
		}

		return 'tb_others';
	}

	function getFileExtension(filePath) {
		const parts = filePath.split('.');
		return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
	}
	function showSize(messageItem) {
		const size = messageItem.payload.fileSize
		let t = "";
		return t = size >= 1048576 ? `${(size / 1048576).toFixed(2)} Mb` : size >= 1024 ? `${(size / 1024).toFixed(2)} Kb` :
			`${size.toFixed(2)}B`, t
	}
	function clickFile(messageItem) {
		let dataInfo = {
			content: {
				url: messageItem.payload.fileUrl,
				size: showSize(messageItem),
				showName: messageItem.nameCard || messageItem.nick,
				name: messageItem.payload.fileName
			},
			messageItem: messageItem
		}

		uni.setStorageSync('files', dataInfo)
		uni.navigateTo({
			url: '/pages/home/views/downLoad/index'
		})
	}


	// 自定义消息
	function formatData(messageItem) {
		return JSONToObject(messageItem.payload.data)
	}
	function customContent(messageItem) {
		return TUIChatEngine.TUIChat.messageHandler.handleCustomMessage(messageItem)
	}
	function clickBusiness(messageItem) {
		const conversationModel = TUIStore.getConversationModel(messageItem.conversationID);
		thisInstance.setCardInfo(
			formatData(messageItem).userID,
			conversationModel,
			(options) => {
				seeCardInfo(options)
			}
		)
	}
	function openLink(url) {
		thisInstance.jumpUrl(url)
	}



	// 分割线--------------

	// function handlePlay(messageItem) {
	// 	if (messageItem.hasRiskContent) {
	// 		return;
	// 	}
	// 	onWatchAudio()

	// 	if (isPlay.value) {
	// 		audioRef.value.stop();
	// 		isPlay.value = false;
	// 		return
	// 	}
	// 	if (messageItem.payload.url) {
	// 		if (messageItem.payload.url.includes("_doc")) {
	// 			audioRef.value.src = messageItem.payload.url;
	// 			audioRef.value.play();
	// 		} else {
	// 			uni.downloadFile({
	// 				url: messageItem.payload.url,
	// 				success: (res) => {
	// 					if (res.statusCode === 200) {
	// 						audioRef.value.src = res.tempFilePath;
	// 						audioRef.value.play();
	// 					}
	// 				}
	// 			});
	// 		}
	// 	}
	// 	isPlay.value = true;
	// }

	// 监听回调函数
	const onCurrentConversationIDUpdated = (conversationID : string) => {
		currentConversationID.value = conversationID;
	};

	// operationType 操作类型 1: 有用户申请加群   23: 普通群成员邀请用户进群
	const onGroupSystemNoticeList = (list : Array<IMessageModel>) => {
		const systemNoticeList = list.filter((message) => {
			const { operationType } = message.payload;
			return (
				(operationType === 1 || operationType === 23) &&
				message.to === props.groupID
			);
		});

		systemNoticeList.forEach((systemNotice) => {
			const { operationType } = systemNotice.payload;
			if (operationType === 1) {
				const { operatorID } = systemNotice.payload;
				if (!applicationUserIDList?.value?.includes(operatorID)) {
					applicationUserIDList.value.push(operatorID);
				}
			}
			if (operationType === 23) {
				const { inviteeList } = systemNotice.payload;
				inviteeList.forEach((invitee) => {
					if (!applicationUserIDList?.value?.includes(invitee)) {
						applicationUserIDList.value.push(invitee);
					}
				});
			}
		});
		const applicationCount = applicationUserIDList.value.length;
		TUIStore.update(StoreName.CUSTOM, "groupApplicationCount", applicationCount);
	};
	function onCurrentConversation(conversation) {
		currentConversationInfo.value = conversation
		if (conversation?.groupProfile) {
			let { selfInfo } = conversation.groupProfile
			isPower.value = selfInfo.role != 'Member'
		} else {
			isPower.value = true
		}
		if(conversation?.lastMessage?.lastTime==0){
			console.warn('清空数据11111111')
			// setTimeout(()=>{
			// 	messageList.value=[]
			// 	intervalList=[]
			// 	console.log('清空后====',messageList.value)
				
			// },350)
			
			nextTick(()=>{
				messageList.value=[]
				intervalList=[]
			})
			
		}
	}

	// 定时器逻辑==============
	let intervalList : Array<any> = [] // 没被渲染的数据
	let interval : NodeJS.Timeout | null = null
	function endInterval() {
		if (interval) {
			console.log('clearIntervalclearInterval')
			// isLoadMessage.value=false
			clearInterval(interval)
			interval = null
		}
	}
	let updateCount = 0
	let startSec = 350
	let messageCutNum : number = 60
	let isUpdate = true
	let intervalCount = 0
	function startInterval() {
		if (interval) {
			return
		}
		// let time = +new Date()
		onMessageListUpdated()
		interval = setInterval(() => {
			// let newTime = +new Date()
			// console.log('setInterval.time =======', newTime - time)
			// time = newTime
			intervalCount += 1
			if (messageList.value.length != 0) {
				if (messageList.value[0].ID === intervalList[intervalList.length - 1].ID || intervalCount >= updateCount) {
					endInterval()
				}
			}
			// console.log('startInterval111111111',messageList.value[0].ID,intervalList[intervalList.length-1].ID,isScrollBottom.value)
			// if(isUpdate){
			// 	console.log('isUpdate===',isUpdate)
			onMessageListUpdated()

			// }

		}, startSec)
	}

	function onMessageListUpdatedTimeout(list : Array<any>) {
		updateCount += 1
		// if(isScrollBottom.value){
		// 	intervalList = list.slice(-100)
		// }else{
		intervalList = list
		// }

		startInterval()
	}
	// 定时器逻辑==============

	function onWatchStore() {
		// 消息列表监听
		TUIStore.watch(StoreName.CHAT, {
			messageList: onMessageListUpdatedTimeout,
			isCompleted: onChatCompletedUpdated,
		});
		TUIStore.watch(StoreName.CONV, {
			currentConversation: onCurrentConversation,
		});

		TUIStore.watch(StoreName.USER, {
			userProfile: onUserProfile,
		});
		let { type } = getApp().globalData.currentConversationInfo
		if (getApp().globalData.unreadCount > 0) {
			unreadCountNum.value = getApp().globalData.unreadCount;
			// 判断是否有更多未读条数
			if (getApp().globalData.unreadCount > 15) {
				isSeeOldMessage.value = true
			}
		}
		if (type == 'GROUP') {
			onGroupHandle()
		}
	}

	const handlePinnedMsg = async (_seq : any) => {

		let pinnedMsgBody = TUIChatEngine.chat.getMessageListHopping(
			{
				conversationID: currentConversationID.value,
				sequence: _seq,
				count: 1,
				direction: 0
			}
		)
			.then((res : any) => {

				if (res.data.messageList[0]) {

					return res.data.messageList[0];

				}
				else {
					return null;
				}

			})
			.catch((error : any) => {
				return null;
			})


		return pinnedMsgBody;

	};


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


	const handleC2cToplist = async (_list : any) => {
		if (_list.length == 0) {
			pinnedMsgContent.value = null;
			return;
		}
		pinnedMsgList.value = _list;


		if (pinnedMsgList.value && pinnedMsgList.value.length > 0) {

			for (let i = pinnedMsgList.value.length - 1; i >= 0; i--) {

				if (!pinnedMsgList.value[i]) {
					continue;
				}

				let time = Number(pinnedMsgList.value[i].time)

				let messageBody = await getMessageListHoppingTime(time, pinnedMsgList.value[i].id).catch(err => {
					console.log('errr', err)
				});
				// console.log('messageBody===', messageBody)
				if (!messageBody) {
					pinnedMsgList.value.splice(i, 1);
				}
				else {

					if (!pinnedMsgList.value[i]) {
						continue;
					}

					pinnedMsgList.value[i].body = messageBody;
				}
			}


			if (pinnedMsgList.value[pinnedMsgIndex.value]) {
				if (pinnedMsgList.value[pinnedMsgIndex.value].body) {
					pinnedMsgContent.value = handlePinnedMsgContent(pinnedMsgList.value[pinnedMsgIndex.value].body);
				}
				else {
					pinnedMsgContent.value = null;
				}
			}
			else {
				pinnedMsgContent.value = null;
			}

		}
		else {
			pinnedMsgContent.value = null;
		}

	}

	const isSeeOldMessage = ref(false)
	let allList = ref([])
	// TUIStore.watch(StoreName.CONV, {
	// 	currentConversationID: onCurrentConversationIDUpdated,
	// });
	function getApplicationCount() {
		TUIChatEngine.chat.getGroupApplicationList().then(res => {
			console.log('getGroupApplicationList===========',)
		})
	}
	function watchGroup() {

		// 群系统消息
		TUIStore.watch(StoreName.GRP, {
			groupSystemNoticeList: onGroupSystemNoticeList,
		});
		// 群系统消息数量
		// getApplicationCount()
		TUIStore.watch(StoreName.CUSTOM, {
			groupApplicationCount: onGroupApplicationCountUpdated,
		});

	}


	// watch(props, (newV, oldV) => {
	// 	if (newV.groupNotification && !intervalScrollNotification) {
	// 		scrollGroupNotification();
	// 	}
	// });








	function sortStringsByCharacters(arr : any) {

		arr.sort((a : any, b : any) => {
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
	}








	const getMessageListHoppingTime = async (_time : any, _messageID : any) => {
		let pinnedMsgBody = TUIChatEngine.chat.getMessageListHopping(
			{
				conversationID: currentConversationID.value,
				time: _time,
				count: 15,
				direction: 0
			}
		)
			.then((res : any) => {

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
			.catch((error : any) => {
				return null;
			})


		return pinnedMsgBody;

	}

	// 清空聊天记录后续
	const resetMessage = () => {
		console.log('resetMessage66666666666',)
		let allId = messageList.value.map(item => item.ID)
		handleGmDeleteMessage(allId)
		// messageList.value = []
		// messageList.value.length = 0
	}


	let renderInterTime = null
	onMounted(() => {
		instanceMapping.set("messageList", thisInstance);
		onWatchStore()

		//监听触发清除聊天列表数据
		uni.$on('resetMessage', function (data) {
			resetMessage()
		})

		//监听获取麦克风权限
		uni.$on('showMicNeed', function (data) {
			isShowTips.value = true
		})

		uni.$on('closeMessageTool', function (data) {
			if (data && data.show == false) {
				toggleID.value = ''
			}
		})
		// onWatchAudio()
	});

	const onClearAll = () => {
		// paging?.value?.clear()
		// thisInstance.setUserMsg(currentConversationID.value, messageList.value);
		// clearInterval(intervalScrollNotification);
		TUIStore.unwatch(StoreName.CHAT, {
			messageList: onMessageListUpdatedTimeout,
			isCompleted: onChatCompletedUpdated,
		});
		TUIStore.unwatch(StoreName.USER, {
			userProfile: onUserProfile,
		});
		TUIStore.unwatch(StoreName.CONV, {
			currentConversationID: onCurrentConversationIDUpdated,
			currentConversation: onCurrentConversation,
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
		observer2?.disconnect();
		observer2 = null;
		uni.$off('resetMessage')
		uni.$off('showMicNeed')
		uni.$off('closeMessageTool')
	}
	// 取消监听
	onUnmounted(() => {
		clearInterval(renderInterTime)
		onClearAll()
		endInterval()
		if (hisTime) clearInterval(hisTime)
	});

	const isPower = ref(false)
	const getMemberList = () => {
		if (!props.isGroup) {
			isPower.value = true
			return
		}
		uni.$chatKit?.chat?.getGroupMemberList({
			groupID: props.groupID,
			offset: 0,
		}).then(result => {
			let list = result.data.memberList;
			console.log('TUIChatEngine.userID', TUIChatEngine.userID, result)
			let target = list.find(item => item.userID == TUIChatEngine.userID)
			console.log('target', target)
			if (target.role !== 'Member') {
				isPower.value = true
			} else {
				isPower.value = false
			}
			// this.memberList = result.data.memberList
		})
	}

	const changeCheck = (item, index) => {
		// onSendMsgError
		if (!props.isShowEdit) return
		// let { isCheck } = item;
		// messageList.value[index].isCheck = !isCheck;
		// let newArr = messageList.value.map(item => item.isCheck && item).filter(item => item);
		if (checkedIdList.value.includes(item.ID)) {
			checkedIdList.value = checkedIdList.value.filter(id => id !== item.ID)
		} else {
			checkedIdList.value = [...checkedIdList.value, item.ID]
		}
	};
	const onChangeMsg = (val) => {
		emits("handChangeInput", true);
		toggleID.value = ''
	};


	const onChangeMsgPinned = (message : any) => {

		if (message.conversationType === TUIChatEngine.TYPES.CONV_GROUP) {
			let messageID = message.ID
			let groupID = message.conversationID.replace(/GROUP/g, "")

			//置顶前,先获取一次群资料
			TUIChatEngine.chat.getGroupProfile({ groupID: groupID })
				.then((res : any) => {

					toTopMessageNext(res.data.group, message);
				})
				.catch((error : any) => {
					console.log('getGroupProfile error:', error); // 获取群详细资料失败的相关信息
				});
		}
		else if (message.conversationType === TUIChatEngine.TYPES.CONV_C2C) {
			let otherId = message.to;

			if (otherId == TUIChatEngine.getMyUserID()) {
				otherId = message.from;
			}


			let idList = sortStringsByCharacters([TUIChatEngine.getMyUserID(), otherId]);

			let sessionId = idList.join("");


			let params = {
				sessionId: sessionId,
				id: message.ID,
				time: message.time + ""
			}

			onC2cmsgSetTop(params);

		}


	};


	const toTopMessageNext = (_groupProfile : any, _message : any) => {

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

			if (pinnedMsgsObj.value && pinnedMsgsObj.value.length > 0) {
				messageIdList = JSON.parse(pinnedMsgsObj.value);

				messageIdList.push(messageObj);
			}
			else {
				messageIdList = [messageObj];
			}

			if (messageIdList) {
				pinnedMsgsObj.value = messageIdList;
			}


		}
		else {
			let newObj = {
				key: "pinnedMsgs",
				value: [messageObj]
			}

			pinnedMsgsObj = newObj;

		}


		if (!pinnedMsgsObj) {
			return;
		}


		let list = [...new Set(pinnedMsgsObj.value.map(item => item.id))].map(id => {
			return pinnedMsgsObj.value.find(item => item.id === id);
		});

		pinnedMsgsObj.value = JSON.stringify(list);

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
		promise.then((res : any) => {

			sendAddPinnedMsgsTips(_groupProfile.groupID);
		}).catch((error : any) => {
			console.warn('updateGroupProfile error:', error); // 修改群组资料失败的相关信息
		});

	};
	//私聊消息置顶
	const onC2cmsgSetTop = (_params : any) => {
		thisInstance.$http.app_user.c2cmsgSetTop(_params)
			.then((res : any) => {
				if (res.result) {
					console.log('私聊消息置顶')
					getC2cmsgToplist();
					sendGmC2cmsgSetTopGm();
					sendGmC2cmsgSetTopTips();
				}
				else {
					//异常
					Toast({
						message: TUITranslateService.t("TUIChat.置顶失败"),
						type: TOAST_TYPE.ERROR,
					});
				}
			})
			.catch((error : any) => {
				Toast({
					message: TUITranslateService.t("TUIChat.置顶失败"),
					type: TOAST_TYPE.ERROR,
				});
			})

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


	const sendGmC2cmsgSetTopTips = () => {

		let payload = {
			data: "",
			description: 'c2c_set_top',
			extension: 'c2c_set_top'
		}

		let to = currentConversationInfo.value.conversationID.replace(TUIChatEngine.TYPES.CONV_C2C, "");

		let sendMessage = TUIChatEngine.chat.createCustomMessage({
			to: to,
			conversationType: TUIChatEngine.TYPES.CONV_C2C,
			payload: payload
		})

		TUIChatEngine.chat.sendMessage(sendMessage)
			.then((res : any) => {

				console.log("=====c2c置顶提示发送成功")
			})
			.catch((error : any) => {
				Toast({
					message: error?.message,
					type: TOAST_TYPE.ERROR,
				});
			})

	}







	const setBlinkView = (messageID) => {
		return new Promise((resolve) => {
			isCanLink.value = false
			const index = blinkMessageIDList.value.indexOf(messageID);
			if (index < 0) {
				blinkMessageIDList?.value.push(messageID);
				const timer = setTimeout(() => {
					blinkMessageIDList.value.splice(
						blinkMessageIDList.value.indexOf(messageID),
						1
					);
					clearTimeout(timer);
					resolve();
				}, 3000);
			}
		});
	}



	// const getAllMessageList=(sequence)=>{

	// }


	const toLinkMsg = async (sequence, count = 15) => {
		let searchType = currentConversationInfo.value.type == 'GROUP' ? 'sequence' : 'time'

		let sendData = { conversationID: currentConversationID.value, count, direction: 1 }
		sendData[searchType] = sequence
		// console.log('messageList.value',messageList.value)
		// let k=messageList.value.findIndex(item=>item.sequence==sequence||item.time==sequence)
		// console.log('k',k)
		// if(k!=-1){
		// 	console.log('列表内有')
		// 	return
		// }
		uni.showLoading()
		Promise.all([
			TUIChatEngine.chat.getMessageListHopping({ ...sendData, direction: 0 }),
			TUIChatEngine.chat.getMessageListHopping({ ...sendData, direction: 1 }),
		]).then(async results => {
			let list = [...results[0].data.messageList.map(item => new TUIFUN(item)), ...results[1].data.messageList.filter((_, index) => index !== 0).map(item => new TUIFUN(item))].reverse()
			// messageList.value = [...results[0].data.messageList.map(item => new TUIFUN(item)), ...results[1].data.messageList.filter((_, index) => index !== 0).map(item => new TUIFUN(item))].reverse()
			const index = list.findIndex(message => message.ID === results[1].data.messageList[0].ID)
			const m = list.find(message => message.ID === results[1].data.messageList[0].ID)

			if (index > -1) {
				uni.hideLoading()
				toQuoteMessage('quote', [m])
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
	}


	const toQuoteMessage = (title, list) => {
		getApp().globalData.title = title
		let newList = []
		if (list && list.length != 0) {
			newList = list.map(item => new TUIFUN(item))
		}
		getApp().globalData.list = newList
		uni.navigateTo({
			url: '/pages/TUIKit/components/TUIChat/message-list/quote',
			events: {
				deletePinnedMessage(data) {
					// console.log('deletePinnedMessage...', data)
					pinnedMsgIndex.value = data.index
					clickClosePinnedMsg()
				}
			}
		})
	}

	const onPinnedMsgContent = (item) => {

		// 点击置顶消息打开新页面
		const list = pinnedMsgList.value.map(item => item.body)
		// console.log('onPinnedMsgContent===', list)
		toQuoteMessage('pinned', list)
		return

		let messageId = pinnedMsgList.value[pinnedMsgIndex.value].id;
		let { id, seq } = pinnedMsgList.value[pinnedMsgIndex.value]
		if (!messageId) {
			return;
		}


		let index = messageList.value.findIndex(message => message.ID === messageId);
		if (index >= 0) {
			//滚动到置顶消息位置
			// paging?.value.scrollIntoViewById(`msg-bubble-${messageList.value[index].ID}`,50)
			scrollToOriginalMessage(messageList.value[index].ID)
			// setBlinkView(messageList.value[index].ID)
			// newScrollTo(messageId);
		}
		else {
			isLinkMsg.value = false
			toLinkMsg(seq)
			//置顶消息弹窗位置

		}

		let oldIndex = pinnedMsgIndex.value;

		pinnedMsgIndex.value += 1;

		if (pinnedMsgIndex.value > pinnedMsgList.value.length - 1) {
			pinnedMsgIndex.value = 0;
		}

		if (oldIndex == pinnedMsgIndex.value) {
			return;
		}

		let messageBody = pinnedMsgList.value[pinnedMsgIndex.value].body;

		if (messageBody) {
			pinnedMsgContent.value = handlePinnedMsgContent(messageBody);
		}
		else {

			pinnedMsgContent.value = messageBody;
		}

	};



	const handlePinnedMsgContent = (pinnedMsg : any) => {
		console.log('handlePinnedMsgContent...', pinnedMsg, TYPES)
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



	const sendAddPinnedMsgsTips = (_groupID : any) => {
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
			.then((res : any) => {
				Toast({
					message: tc('置顶成功'),
					type: TOAST_TYPE.NORMAL,
				});
				onUpdateGroupCustomField()
			})
			.catch((error : any) => {
				Toast({
					message: error?.message,
					type: TOAST_TYPE.NORMAL,
				});
			})
	};


	const clickClosePinnedMsg = () => {

		if (currentConversationInfo.value.type === TUIChatEngine.TYPES.CONV_GROUP) {
			let groupProfile = currentConversationInfo.value.groupProfile;
			if (!groupProfile) {
				return;
			}

			if (groupProfile.selfInfo.role === TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER || groupProfile.selfInfo.role === TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN) {
				selectedPinnedMsg.value = pinnedMsgList.value[pinnedMsgIndex.value];
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
						// let index = list.indexOf(selectedPinnedMsg.value);
						let index = list.findIndex(item => item.id == selectedPinnedMsg.value.id);

						if (index < 0) {
							return;
						}


						list.splice(index, 1);
						// console.log('JSON.stringify(list)', JSON.stringify(list))
						nextTick(() => {
							pinnedMsgList.value.splice(pinnedMsgIndex.value, 1);

							pinnedMsgIndex.value = 0;
							pinnedMsgContent.value = null;

							if (pinnedMsgList.value[pinnedMsgIndex.value]) {
								let messageBody = pinnedMsgList.value[pinnedMsgIndex.value].body;

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

				pinnedMsgList.value.splice(pinnedMsgIndex.value, 1);

				pinnedMsgIndex.value = 0;
				pinnedMsgContent.value = null;

				if (pinnedMsgList.value[pinnedMsgIndex.value]) {
					let messageBody = pinnedMsgList.value[pinnedMsgIndex.value].body;

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

	};


	const deleteC2cPinnedMsg = () => {
		let otherId = currentConversationInfo.value.conversationID.replace(TUIChatEngine.TYPES.CONV_C2C, "");

		let idList = sortStringsByCharacters([TUIChatEngine.getMyUserID(), otherId]);

		let sessionId = idList.join("");

		let infos = {
			sessionId: sessionId,
			id: pinnedMsgList.value[pinnedMsgIndex.value].id
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




	const sendRemovePinnedMsgsTips = () => {
		let payload = {
			data: "",
			description: 'remove_pinned_msgs',
			extension: 'remove_pinned_msgs'
		}


		let sendMessage = TUIChatEngine.chat.createCustomMessage({
			to: currentConversationInfo.value.groupProfile.groupID,
			conversationType: TUIChatEngine.TYPES.CONV_GROUP,
			payload: payload
		})

		TUIChatEngine.chat.sendMessage(sendMessage)
			.then((res : any) => {

				console.log("=====取消置顶提示发送成功")
				// setTimeout(()=>{
				// onUpdateGroupCustomField()
				// },600)
			})
			.catch((error : any) => {
				Toast({
					message: error?.message,
					type: TOAST_TYPE.ERROR,
				});
			})
	}
	const getMessageID = (index) => {
		return Date.now() + index
	}
	const getAllCheckMsg = () => {
		// let fList = messageList.value.filter((item) => item.isCheck);
		let fList = messageList.value.filter((item) => checkedIdList.value.includes(item.ID));
		return fList;
	};
	const scrollGroupNotification = () => {
		intervalScrollNotification = setInterval(() => {
			console.log('intervalScrollNotification======')
			const scrollEl = refGroupNotification?.value?.$el;
			if (scrollEl) {
				const notification =
					scrollEl.children[0].children[0].children[0].children[0];

				const scrollW = scrollEl.offsetWidth;
				const notificationW = notification.offsetWidth;

				if (notificationScrollLeft.value + scrollW >= notificationW + 20) {
					notificationScrollLeft.value = 0;
				} else {
					notificationScrollLeft.value = notificationScrollLeft.value + 5;
				}
			}

		}, 250);
	};
	const clickNotification = () => {
		uni.navigateTo({
			url: `/pages/address/views/group/views/group-settings/views/notification/index?groupID=${props.groupID}`,
		});
	};

	const updateList = (list) => {
		if (list && list.length != 0)
			messageList.value = messageList.value.filter(
				(message) => !list.includes(message.ID)
			);
		// setTimeout(() => {
		// scrollToBottom();
		// }, 500);
	};

	const getUpList = async (sequence) => {
		if (isCanLink.value) return
		let searchType = currentConversationInfo.value.type == 'GROUP' ? 'sequence' : 'time'
		let sendData = { conversationID: currentConversationID.value, count: 15, direction: 0 }
		sendData[searchType] = topID.value
		let promise = await TUIChatEngine.chat.getMessageListHopping(sendData);
		let { isCompleted, nextMessageSeq, nextMessageTime } = promise.data
		let nextType = currentConversationInfo.value.type == 'GROUP' ? 'nextMessageSeq' : 'nextMessageTime'
		let msgList = promise.data.messageList
		let nlist = msgList.map(item => new TUIFUN(item)).reverse()
		topID.value = promise.data[nextType]
		messageList.value = [...messageList.value, ...nlist]
		// paging?.value?.complete(nlist)
	}
	const _scrolltolower = () => {
		if (isSeeOld.value) {
			getUpList()
		} else {
			if (!isGetAllData.value) {
				getHistoryMessageList();
			}
		}
		// if (isTopScroll.value) return;
		// isCanScrollY.value = false;
		// isTopScroll.value = true;
		// allHeight.value += 5000;
	};

	// 删除消息
	const deleMsg = (ID) => {
		let list = messageList.value.filter(item => item.ID != ID)
		messageList.value = list
		// console.log('all===',allMessageList.value)

		// return
		// paging.value.resetTotalData(list)
	}
	function setAtBox() {
		if (messageList.value.length == 0) return;
		let userInfo = uni.getStorageSync("userInfo");
		let mLen = messageList.value.length;
		let newList = messageList.value.slice(
			Math.max(mLen - unreadCountNum.value, 0)
		);
		let i = newList
			.filter((item) => item.atUserList.includes(userInfo.userID))
			.map((P) => P.ID);
		if (i != -1) {
			// console.log('有人艾特你',i)
			// unreadCountNum.value=0
		}
	}
	const onUserProfile = (res) => {
		let { userID } = res;
		allData.value = thisInstance.getUserMsg(
			currentConversationID.value,
			userID
		);
	}

	let msgTotalList = []
	let itemList = []
	let currentTime = null
	let isTimeInter = null

	const lastSep = computed(() => messageList.value[0]?.sequence || '')
	let oldSeq = 0
	let msgTime = null
	watch(msgData, async (newV, oldV) => {
		if (newV.length != 0 && isScrollBottom.value) {
			// let pushList = newV[0]
			// 300ms后触发回调
			let cutSeq = [1, 2, 3]
			if (oldSeq != 0) return
			oldSeq = lastSep.value
			let pushList = newV.filter(item => cutSeq.includes(item.sequence - lastSep.value))
			let pushID = pushList.map(item => item.sequence)
			await new Promise(resolve => {
				msgTime = setTimeout(() => {
					messageList.value = [...pushList, ...messageList.value];
					msgData.value = msgData.value.filter(item => !pushID.includes(item.sequence))
					oldSeq = 0;
					clearTimeout(msgTime)
					msgTime = null
					resolve();
				}, 250)
			});
		}
		if (oldV.length == 0) {
			console.log('初始化')
		}
	})
	const toNewList = () => {
		messageList.value = oldMessageList.value.slice(0, 15)
		isInitData.value = true
		// isScrollBottom.value=true
		msgData.value.length = 0
		scrollToBottom()
		setTimeout(() => {
			isInitData.value = false
		}, 200)
	}

	async function scrollToOriginalMessage(originMessageID : string) {
		scrollTop.value = oldScrollTop.value
		const scrollViewRect = await getBoundingClientRect('#messageScrollList', 'messageList');
		const originalMessageRect = await getBoundingClientRect('#msg-bubble-' + originMessageID, 'messageList');
		let finalScrollTop = oldScrollTop.value - originalMessageRect.top + scrollViewRect.height
		scrollTo({
			finalScrollTop, originMessageID
		})
	}

	// 回到最新消息
	const backNewList = () => {
		isSeeOld.value = false
		isBackNewList.value = false
		messageList.value = [...intervalList].reverse()
		scrollToBottom()
	}
	const toOldList = () => {
		getNoreadList(() => {
			let searchType = currentConversationInfo.value.type == 'GROUP' ? 'sequence' : 'time'
			isSeeOld.value = true
			isSeeOldMessage.value = false
			isBackNewList.value = true

			messageList.value = noReadList.value
			console.log('toOldList', noReadList.value)
			if (messageList.value.length != 0) {
				bottomID.value = messageList.value[0][searchType] + 1
				topID.value = messageList.value[messageList.value.length - 1][searchType] - 1
				isInitData.value = true
				scrollToOriginalMessage(messageList.value[messageList.value.length - 1].ID)
			}
		})


		// paging?.value.reload()
		// setTimeout(()=>{
		// 	paging?.value.scrollToY(600,0)
		// 	isInitData.value=false
		// },200)
	}
	async function getNoreadList(callBack) {
		let mlist = messageList.value
		if (mlist.length == 0) return
		let promise = await TUIChatEngine.chat.getMessageListHopping({ conversationID: currentConversationID.value, sequence: mlist[0].sequence - unreadCountNum.value - 1, count: 15, direction: 1 });
		let beforeList = promise.data.messageList
		let nlist = beforeList.map(item => new TUIFUN(item))
		noReadList.value = nlist.reverse()
		if (callBack) callBack()
		// console.log('promise',nlist)
	}
	// 
	const isBottomListDone = ref(true)
	const getUDList = async ({ sequence = '', direction = 1, count = 15 }) => {
		console.log('获取下一页数据')
		// return 
		if (!isBottomListDone.value || isCanLink.value) return
		isBottomListDone.value = false
		let promise = await TUIChatEngine.chat.getMessageListHopping({ conversationID: currentConversationID.value, sequence, count, direction });
		let { isCompleted, nextMessageSeq } = promise.data
		let msgList = promise.data.messageList.reverse()
		if (isCompleted || msgList.length < count) {
			isBackNewList.value = false
			isSeeOld.value = false
		}
		if (!isCompleted) {
			let nextType = currentConversationInfo.value.type == 'GROUP' ? 'nextMessageSeq' : 'nextMessageTime'
			let nlist = msgList.map(item => new TUIFUN(item))
			bottomID.value = promise.data[nextType]
			// paging?.value?.addDataFromTop(nlist)
			let scrollID = nlist.find(item => item.sequence == sequence)
			messageList.value = [...nlist, ...messageList.value]
			intoViewID.value = 'msg-bubble-' + scrollID.ID
			setTimeout(() => {
				setTimeout(() => {
					scrollToOriginalMessage(scrollID.ID)
					isBottomListDone.value = true
				})
			})
		}

	}
	const _scrolltoupper = (e) => {
		isScrollBottom.value = true
		if (isSeeOld.value && isLinkMsg.value) {
			getUDList({ sequence: bottomID.value, direction: 1, count: 15 })
		}
	}

	// 回到未读消息

	const checkFriend = () => {
		// return
		TUIChatEngine.chat.checkFriend({
			userIDList: [currentConversationInfo.value.userProfile.userID],
		}).then(res => {
			let { successUserIDList, failureUserIDList } = res.data
			if (successUserIDList && successUserIDList.length != 0) {
				let { relation } = successUserIDList[0]
				if (relation == 'CheckResult_Type_BothWay') {
					isMyFriend.value = true
				}
			}
		});
	}
	let currentTimestamp = null;
	let lastMessageTimestamp = null
	const deletedMessageID = ref([])
	const intoViewID = ref('')

	const sendingMessageList = ref([])
	let renderMessageList = []
	function onFiliterMessage(list) {
		let userInfo = uni.getStorageSync("userInfo");
		observer?.disconnect();
		// GM指令删除
		let needRefresh = false;
		let sendingList = []
		// 检查是不是好友
		if (!isMyFriend.value && currentConversationInfo?.value.type == 'C2C') {
			checkFriend()
		}
		// 记录被删除的发送失败的消息id,防止再次渲染
		if (isDeleteAllMessage) {
			list.forEach((item) => {
				if (item.status === 'fail') {
					deletedMessageID?.value.push(item.ID)
				}
			});
		}
		list = list
			.filter((item) => {
				if (item.status == 'unSend') {
					sendingList.push(item)
					return false;
				}
				if (item.status === 'fail' && deletedMessageID?.value.includes(item.ID)) {
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
						handleGmOrder(item);
						item.isDeleted = true;
					}
				}
				return !item.isDeleted; // 筛选掉已删除的消息
			}).reverse()
		const stringifySendingMessageList = JSON.stringify(sendingMessageList.value.map(item => item.ID))
		const stringifySendingList = JSON.stringify(sendingList.map(item => item.ID))
		const needUpdateUnsendM = stringifySendingMessageList != stringifySendingList
		sendingMessageList.value = sendingList
		// 新消息的频繁触发
		// if (!needUpdateUnsendM) {
		// 	if (messageList.value.length != 0 && isScrollBottom.value&&list.length!=0) {
		// 		console.log('needUpdateUnsendM-====',list)
		// 		if (list[list.length - 1].ID == messageList.value[0].ID) {
		// 			return []
		// 		}
		// 	}
		// }
		return list
	}
	function sliceFun(list, startIndex, size) {
		if (startIndex < 0) {
			return list
		}

		const sliceList = []
		const _endIndex = size ? (size + startIndex) : list.length

		for (let i = startIndex; i < _endIndex && i < list.length; i++) {
			sliceList.push(list[i])
		}

		return sliceList
	}
	function onMessageListUpdated() {
		if (isScrollBottom.value) {
			messageCutNum = 40
			if (messageList.value.length != 0 && intervalList.length !== 0) {
				let t = intervalList[intervalList.length - 1].sequence - messageList.value[0].sequence
				messageCutNum = t > messageCutNum ? t : messageCutNum
			}
		}
		// const list: IMessageModel[] = isLoadMessage.value ? intervalList : intervalList.slice(-messageCutNum)
		let list : IMessageModel[] = isLoadMessage.value ? intervalList : sliceFun(intervalList, intervalList.length - messageCutNum + 1)
		// list=onFiliterMessage(list)
		// 如果是在查看历史未读消息  则不走messageList 赋值
		if (isSeeOld.value) {
			return
		}
		if (messageList.value.length != 0 && list[list.length - 1].sequence == messageList.value[0]?.sequence && !isLoadMessage.value) {
			return
		}

		let newList = []
		// console.log('isLoadMessage.value', list,intervalList)
		if (messageList.value.length > 0) {
			if (isLoadMessage.value) {//查看上一页数据
				const lastIndex = list.findIndex(item => item.ID === messageList.value[messageList.value.length - 1].ID)
				newList = onFiliterMessage(list.slice(0, lastIndex))
				
				if (newList.length != 0) {
					messageList.value = [...messageList.value, ...newList]
				}
			} else {//加载新数据
				let lastIndex
				const firstID = messageList.value[0].ID
				for (let i = list.length - 1; i >= 0; i--) {
					if (list[i].ID === firstID) {
						lastIndex = i
						break
					}
				}
				// lastIndex=lastIndex-sendingMessageList.value.length
				const sliceList = sliceFun(list, lastIndex + 1, 5)
				// console.log(list.length,lastIndex)
				// const sliceList = slice(list, lastIndex + 1)

				newList = sliceList
				let isHasSelfMsg = newList.some(item => item.from == TUIChatEngine.userID)
				// console.log('isHasSelfMsg',isHasSelfMsg,isScrollBottom.value,newList.length,list.length)
				if (isHasSelfMsg) {

					isScrollBottom.value = true
					scrollDirection.value = 'bottom'
				}
				// console.log('isScrollBottom666',isScrollBottom.value)
				if (!isScrollBottom.value) {
					return
				}
				if (newList.length != 0 || isScrollBottom.value) {
					nextTick(() => {
						// console.log('intervalList',intervalList.length,messageList.value.length)
						messageList.value = onFiliterMessage(list)
						onScrollBottom()
					})
				}
			}
		} else {
			console.log('初始化渲染', list.length)
			if (list.length == 0) {
				endInterval()
				return
			}
				onGetInitData(onFiliterMessage(list))

		}
	}
	function onScrollBottom() {
		setTimeout(() => {
			isShowLoading.value = false
		}, 300)
		// 监听已读回执
		// if (isEnabledMessageReadReceiptGlobal()) {
		// 	nextTick(() => bindIntersectionObserver());
		// }
		// console.log('onScrollBottom---',scrollDirection.value)
		if (!isLoadMessage.value && isScrollBottom.value) {
			if (isShowMore.value) isShowMore.value = false
			if (scrollDirection.value == 'top') return
			scrollToBottom()
		}
	}
	function onGetInitData(list) {
		console.log('onGetInitData')
		// 初始化获取历史列表的时候 若不够十五条则继续取历史记录
		if (list.length < 15 && !hisTime) {
			hisTime = setInterval(() => {
				getHistoryMessageList()
			}, 200)
			setTimeout(() => {
				clearInterval(hisTime)
				hisTime = null
			}, 500)
		}
		// 初始化渲染的时候 先渲染五条 再渲染全部的
		messageList.value = list.slice(0, 10)
		setTimeout(() => {
			messageList.value = list
			getMemberList();
		}, 150)

		onScrollBottom()
	}

	let messageCout = 40
	const cutMessageList = computed(() => {
		if (isScrollBottom.value) {
			messageCout = 40
		}
		return messageList.value.slice(0, messageCout)
	})
	// const cutMessageList = ref<any[]>([])

	// watch(
	// 	messageList,
	// 	(newV) => {
	// 		if (isScrollBottom.value) {
	// 			messageCout = 50
	// 		}
	// 		cutMessageList.value = newV.slice(0, messageCout)
	// 	},
	// 	{
	// 		immediate: true
	// 	}
	// )

	function onChatCompletedUpdated(flag : boolean) {
		isCompleted.value = flag;
	}

	function onGroupApplicationCountUpdated(count : number) {
		groupApplicationCount.value = count;
	}
	// 手动获取历史全部消息

	const getAllMessageList = async (params = { conversationID: currentConversationID.value }) => {
		// console.log('params',params)
		let promiss = await TUIChatEngine.chat.getMessageList(params)
		let { isCompleted, nextReqMessageID, messageList } = promiss.data
		let newList = messageList.map(item => new TUIFUN(item))
		allMessageData.value = [...allMessageData.value, ...newList]
		if (!isCompleted) {
			params.nextReqMessageID = nextReqMessageID
			getAllMessageList(params)
		}
		console.log('promis', allMessageData.value.length)
	}
	// getAllMessageList()
	// 获取历史消息;
	const isGetAllData = ref(false)
	const beforeCout = ref(0)
	const hideBox = ref(null)
	function getHistoryMessageList() {
		// nextTick(() => {
		isLoadMessage.value = true;
		// })
		console.log('getHistoryMessageList ================')
		if (isShowLoading.value) return
		messageCutNum += 20
		messageCout += 30
		isShowLoading.value = true
		TUIChatService.getMessageList().then(async (res : any) => {
			const { nextReqMessageID: ID, isCompleted, messageList: hisList } = res.data;
			nextReqMessageID.value = ID;
			const query = uni.createSelectorQuery().in(thisInstance);
			query
				.select("#hideBox")
				.boundingClientRect((data) => {
					if (data.height == 0) {
						isGetAllData.value = isCompleted
					}
				})
				.exec();
			// if()
			// if (isCompleted) {
			// 	setTimeout(() => {
			// 		isGetAllData.value = false
			// 	}, 2000)
			// }
			beforeCout.value = hisList.length
			uni.$u.debounce(() => {
				console.log('11111111111isLoadMessage.value')
				isLoadMessage.value = false;
				isTopScroll.value = false;
				isCanScrollY.value = true;
				isShowLoading.value = false
			}, 1000)
			// nextTick( ()=>{
			// })
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

	const clickDispose = () => {
		uni.navigateTo({
			url: `/pages/address/views/groupInform/index`,
			events: {
				// 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
				handleGroupApplication: function (data) {
					console.log('handleGroupApplication...', data)
					groupApplicationCount.value = data.amount
					emits('updateMemberCount', 1)
				},
			},
		});
	};

	const messageClick = () => {
		toggleID.value = "";
		emits("closeToolbar");
	};
	const chooseMessage = ref(null)
	const messageTouchstart = (message) => {
		// console.log('touchstart...', JSON.stringify(message.payload))
		chooseMessage.value = message
	}
	// todo: webview 跳转
	const openComplaintLink = (type : any) => { };

	// 消息操作
	const handleToggleMessageItem = (
		e : any,
		// message : IMessageModel,
		// index : number,
		message : any,
		index : any,
		isLongpress = false
	) => {
		if (isLongpress) {
			hiddenTool.value = false;
		}
		toggleID.value = chooseMessage.value.ID
	};

	function longPressBubble(options : any) {
		toolStyle.value = options.toolStyle
		handleToggleMessageItem(null, null, null, options.isLongpress)
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


	uni.$on('clear', (res) => {
		console.log('666clear')
		onClearAll()
	})
	uni.$on('setFriendType', (res) => {
		console.log('setFriendType...')
		isMyFriend.value = res.isFriend
	})

	// 重发消息
	const resendMessage = (message : IMessageModel) => {
		reSendDialogShow.value = true;
		resendMessageData.value = message;
	};

	// 图片预览
	// 开启图片预览
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
	const cancelSelect = () => {
		checkedIdList.value = []
		emits('handChangeInput', false)
	}

	const clearSelect = () => {
		checkedIdList.value = []
		// messageList.value.forEach(msg => {
		// 	msg.isCheck = false
		// })
	}

	async function blinkMessage(quoteContent) : Promise<void> {
		let searchType = currentConversationInfo.value.type == 'GROUP' ? 'messageSequence' : 'messageTime'
		let i = messageList.value.findIndex(item => item.sequence == quoteContent[searchType])

		// 点击引用直接打开
		toLinkMsg(quoteContent[searchType])
		return

		if (i == -1) {
			console.log('获取了blinkMessage====', quoteContent[searchType])
			toLinkMsg(quoteContent[searchType])
			return
		}
		let messageID = messageList.value[i].ID
		console.log('直接滚动了======', messageID)
		return scrollToOriginalMessage(messageID)
	}


	function scrollTo({ finalScrollTop, originMessageID }) {
		isCanLink.value = true
		scrollTop.value = finalScrollTop;
		blinkMessageIDList.value.length = 0
		setBlinkView(originMessageID)

	}

	// 滚动到最新消息
	async function scrollToLatestMessage() {
		const { scrollHeight } = await getScrollInfo(
			"#messageScrollList",
			"messageList"
		);
		const { height } = await getBoundingClientRect(
			"#messageScrollList",
			"messageList"
		);
		oldHeight.value = scrollHeight;
		scrollTop.value = scrollHeight - height;
	}

	async function bindIntersectionObserver() {
		if (messageList.value.length === 0) {
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
			.createIntersectionObserver(thisInstance, {
				threshold: [0.7],
				observeAll: true,
				// uni 下会把 safetip 也算进去 需要负 margin 来排除
			})
			.relativeTo("#messageScrollList", { top: -70 });

		observer?.observe(".message-li.in .message-bubble-container", (res : any) => {
			console.log('监听已读=====', res.id)
			if (sentReceiptMessageID.has(res.id)) {
				return;
			}
			const matchingMessage = messageList.value.find((message : IMessageModel) => {
				return res.id.indexOf(message.ID) > -1;
			});
			if (
				matchingMessage &&
				matchingMessage.needReadReceipt &&
				matchingMessage.flow === "in" &&
				!matchingMessage.readReceiptInfo?.isPeerRead
			) {
				console.log("TUIChatService.sendMessageReadReceipt====", matchingMessage)
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



	//处理GM指令
	function handleGmOrder(_item : any) {

		let payload = _item.payload;
		let payload_data = JSON.parse(payload.data);

		let code = payload_data.code;
		let value = payload_data.value;

		if (code == "delete_message") {
			if (value.idList) {
				handleGmDeleteMessage(value.idList);
			}
		}
		else if (code == "c2c_set_top") {
			console.log('处理gm指令')
			getC2cmsgToplist();
		}

	}

	var delCount = 0, delTotal = 0, isDeleteAllMessage = false
	function handleGmDeleteMessage(_idList : any) {
		isDeleteAllMessage = true
		delTotal = _idList.length
		console.log('_idList', _idList)
		for (let i = 0; i < _idList.length; i++) {
			let _id = _idList[i];
			gmDeleteMessage(_id, _idList.length, _idList.length);
		}
	}


	function gmDeleteMessage(_id : any) {

		const messageModel = TUIStore.getMessageModel(_id);
		if (messageModel) {
			messageModel.deleteMessage().then(() => {
				delCount++
				if (delCount == delTotal) {
					console.log('删除完毕...')
					messageList.value = []
					isDeleteAllMessage = false
					delCount = 0
					console.log('deletedMessageID...', deletedMessageID.value)
				}
			})
		}

	}


	const isShowTips = ref(false)
	const toGetPower = () => {
		isShowTips.value = false;
		uni.openAppAuthorizeSetting()
	}

	// 后台管理删除消息
	const onAdminDeleMsg = (msgArr) => {
		handleGmDeleteMessage(msgArr)
	}
	const revokeMessage = (msgArr) => {
		// 获取 messageModel
		msgArr.forEach(item => {
			let messageModel = TUIStore.getMessageModel(item);
			messageModel
				.revokeMessage()
				.then(() => {
					enableSampleTaskStatus('revokeMessage');
				})
		})

	}

	TUIChatEngine.chat.on(TUIChatEngine.EVENT.MESSAGE_RECEIVED, function (event) {
		let list = event.data
		if (list && list.length != 0) {
			let groupMsg = list.filter(item => item.type == 'TIMGroupSystemNoticeElem' && item.payload
				.userDefinedField)
			let groupInfo = groupMsg[0]
			try {
				let c = JSON.parse(groupInfo.payload.userDefinedField)
				if (c.Desc == 'GM' && c.Data && currentConversationID.value.indexOf(groupInfo.to) != -1) {
					let { Args, Cmd } = c.Data
					if (Cmd == 'delete_message') {
						revokeMessage(Args)
					} else if (Cmd == 'delete_message_by_user') {
						let allMsgIdList = messageList.value.filter(item => item.from == Args[0]).map(item => item.ID)
						revokeMessage(allMsgIdList)
					} else if (Cmd == 'clear_group_msg') {
						TUIChatEngine.chat.clearHistoryMessage(currentConversationID.value).then(res => {
							let allId = messageList.value.map(item => item.ID)
							revokeMessage(allId)
							messageList.value.length = 0
						})
					} else if (Cmd == 'delete_group_member' || Cmd == 'ban_group_member' || Cmd == 'unban_group_member' || Cmd == 'ban_all_group_member') {

						emits('updateGroupCout', {
							Cmd,
							Args
						})
					}

				}
			} catch (e) {
				//TODO handle the exception
			}
			console.log('groupMsg====', groupInfo, groupInfo.to, currentConversationID.value)
		}
		// 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
		// event.name - TencentCloudChat.EVENT.MESSAGE_RECEIVED
		// event.data - 存储 Message 对象的数组 - [Message]
	})

	defineExpose({
		getAllCheckMsg,
		updateList,
		clearSelect,
		onClearAll,
		revokeMessage
	});
</script>

<style lang="scss" scoped src="./style/index.scss">
</style>