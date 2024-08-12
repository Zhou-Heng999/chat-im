<template>
	<ql-page>

		<div class="chat pos-relative">
			<div :class="['TUI-chat', !isPC && 'TUI-chat-h5']">
				<div v-if="!currentConversationID" :class="['TUI-chat-default', !isPC && 'TUI-chat-h5-default']">
					<slot></slot>
				</div>
				<div v-if="currentConversationID" :class="['TUI-chat', !isPC && 'TUI-chat-h5']"
					@click="closeToolbarShow">
					<ChatHeader :class="[
		          'TUI-chat-header',
		          !isPC && 'TUI-chat-H5-header',
		          isUniFrameWork && 'TUI-chat-uniapp-header',
		        ]" @closeChat="closeChat"></ChatHeader>
					<Forward ref="forwardModule"></Forward>
					<!-- 头部信息 -->
					<u-navbar class="navbar" placeholder border @leftClick='leftClick'>
						<view slot="center" class="flex-col-center">
							<view class="font-blod">
								{{`${navTitle}${conversationInfo&&conversationInfo.type!='C2C'?`(${memberCount})`:''}`}}
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

						<imageIcon v-if="isExistGroup" slot="right" width="54rpx" height="54rpx"
							src="/static/images/tb_qt.png" @click="openModal"></imageIcon>
					</u-navbar>

					<view class="max-width">

						<div class='edit-chat flex-around pd-lr-40' v-if='isShowEdit'>
							<imageIcon class="close-edit" @click="handChangeInput(false)" width="30rpx" height="30rpx"
								src="/static/images/close.png"></imageIcon>
							<view class="flex-column flex-center" @click="onClickEdit(item)" v-for="item in editList">

								<view class="flex-center mb-10 url-box">
									<imageIcon class="" width="40rpx" height="40rpx" :src="item.url"></imageIcon>
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
						@updateMemberCount="updateMemberCount">


					</MessageList>


					<div v-if="isMutedAll" class="mute-input">{{$tc('全员禁言中')}}</div>
					<div v-else-if="isMuted" class="mute-input">{{$tc('您已被禁言')}}</div>
					<MessageInput v-else :class="[
						'TUI-chat-message-input',
						!isPC && 'TUI-chat-h5-message-input',
						isUniFrameWork && 'TUI-chat-uni-message-input',
						isWeChat && 'TUI-chat-wx-message-input',
					  ]" ref="messageInputRef" :isMuted="false" :muteText="$tc(TUITranslateService.t('TUIChat.您已被管理员禁言'))"
						:placeholder="$tc(TUITranslateService.t('TUIChat.请输入消息'))"
						@handleToolbarListShow="handleToolbarListShow"></MessageInput>
					<!-- </view> -->
					<!-- <view class="max-width" @click.stop='()=>{}' > -->


					<!-- </view> -->

					<!-- 兼容 uni 打包支付宝小程序 v-show 无效问题 -->

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
			<conversation v-if="isShowPeople" @closeModal='isShowPeople=false' @chooseSend='onShareMore'
				:isShow='isShowPeople'></conversation>
			<cardModal :info='cardInfo' v-if="isCardShow" :isShow='isCardShow' @closeModal='isCardShow=false'>
			</cardModal>
		</div>
		<!-- <u-navbar placeholder border autoBack title="新朋友" @clickLeft="BackPage" ></u-navbar> -->
		<!-- <avatarModal v-for="item in plist" :info='item' ></avatarModal> -->

	</ql-page>
</template>

<script>
	import TUIChatEngine, {
		TUITranslateService,
		TUIConversationService,
		TUIStore,
		StoreName,
		IMessageModel,
		IConversationModel,
		TUIUserService,
		SendMessageParams
	} from "@tencentcloud/chat-uikit-engine";
	import TUICore, {
		TUIConstants,
		ExtensionInfo,
	} from "@tencentcloud/tui-core";
	import cardModal from '@/components/card/index'
	import conversation from '@/components/conversation/index.vue'
	import MessageList from "@/pages/TUIKit/components/TUIChat/message-list/index";
	import MessageInput from "@/pages/TUIKit/components/TUIChat/message-input/index.vue";
	import ChatHeader from "@/pages/TUIKit/components/TUIChat/chat-header/index.vue";
	import Forward from "@/pages/TUIKit/components/TUIChat/forward/index.vue";
	import TUIChatConfig from "@/pages/TUIKit/components/TUIChat/config";
	import {
		isPC,
		isWeChat,
		isUniFrameWork
	} from "@/pages/TUIKit/utils/env";
	import {
		tc
	} from '@/utils/util'
	export default {
		components: {
			MessageList,
			cardModal,
			conversation,
			Forward,
			MessageInput,
			ChatHeader
		},
		data() {
			return {
				messageInputRef: null,
				currentConversationID: null,
				isPC,
				isWeChat,
				isUniFrameWork,
				isGroup: false,
				navTitle: '标题',
				TUITranslateService,
				userID: '',
				userStatus: '',
				groupID: '',
				currentGroup: '',
				isCardShow: false,
				cardInfo: null,
				groupManageExt: '',
				conversationInfo: null,
				isCheckMore: false,
				conversationList: [],
				isShowPeople: false,
				isShowEdit: false,
				editList: [{
						name: '合并转发',
						url: '/static/images/tb_zf_b.png',
						type: 'share'
					},
					{
						name: '删除',
						url: '/static/images/tb_sc_b.png',
						type: 'dele'
					},
				],
				uToastRef: null,
				msgRef: null,
				memberCount: 0,
				memberList: [],
				totalUnreadCount: '',
				isExistGroup: true,
				forwardModule: null
			};
		},
		computed:{
			isMutedAll(){
			const myself = this.currentGroup?.selfInfo
			return this.currentGroup?.muteAllMembers && myself.role === TUIChatEngine.TYPES.GRP_MBR_ROLE_MEMBER	
			},
			isMuted(){
				const timestamp = +((+new Date()).toString().substring(0, 10))
					
					const myself = this.currentGroup?.selfInfo
					const iIsMute = this.memberList.find(member => member.userID === myself?.userID)?.muteUntil > timestamp
					// return (currentGroup.value?.muteAllMembers && myself.role === TUIChatEngine.TYPES.GRP_MBR_ROLE_MEMBER) || iIsMute
					return iIsMute
			}
		},
		onLoad() {
			this.watchTrtc()
		},
		onUnload() {
			this.reset();
			uni.$off('closeSinForWard')
		},
		methods: {
			watchTrtc() {
				uni.$on('updateRemark', (res) => {
					let {
						conversationInfo
					} = this
					let {
						userID
					} = conversationInfo.userProfile
					TUIChatEngine.chat.getFriendList().then(res => {
						let list = res.data
						let info = list.find(item => item.userID == userID)
						this.navTitle = info.remark
					})
				})
				uni.$on('closeSinForWard',function(data){
					this.$refs.forwardModule?.closeForwardPanel()
				})
				TUIStore.watch(StoreName.GRP,{
					currentGroupMemberList: (list) => {
						this.memberList=list
					},
					currentGroup:(res)=>{
						this.currentGroup = res
						this.memberCount=res.memberCount
						this.navTitle=res.name
						this.getGroup(res.groupID)
					}
				})
				
				TUIStore.watch(StoreName.CONV, {
				  // totalUnreadCount: (count: number) => {
				  //   totalUnreadCount.value = count>99?99:count;
				  // },
				  conversationList:(res)=>{
					  let{currentConversationID}=this
					  let nowNoRead=res.filter(item=>item.conversationID==currentConversationID).map(item=>item.unreadCount)
					  let arrayToSum =res.filter(item=>!item.isMuted&&item.conversationID!=currentConversationID).map(item=>item.unreadCount)
					  const sum = arrayToSum.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
					  this.totalUnreadCount = sum>99?99:sum;
				  }
				})
				TUIStore.watch(StoreName.CONV, {
				  currentConversation: (conversation) => {
					  let {currentConversationID,conversationInfo}=this
				    if (currentConversationID === conversation?.conversationID) {
				      return;
				    }
					if(conversation){
						this.conversationInfo=conversation
						if(conversation.type=='C2C'){
							this.navTitle=conversation?.userProfile?.remark||conversation?.userProfile?.nick
							
							if(conversation.userProfile && conversation.userProfile.userID) {
								this.userID = conversation.userProfile.userID
								uni.$chatKit?.chat.getUserStatus({userIDList: [`${this.userID}`]}).then(res => {
									const { successUserList } = res.data
									this.userStatus = successUserList[0].statusType
								})
							}
						}else{
							this.navTitle=conversation.groupProfile.name
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
				    this.currentConversationID = conversation?.conversationID;
				    this.isGroup = conversation?.type === TUIChatEngine.TYPES.CONV_GROUP;
					let {isGroup,groupID}=this
				    if (isUniFrameWork && isGroup && groupID !== conversation?.groupProfile?.groupID) {
				      const extList = TUICore.getExtensionList(TUIConstants.TUIChat.EXTENSION.CHAT_HEADER.EXT_ID, {
				        filterManageGroup: !isGroup,
				      });
				      this.groupManageExt = extList[0];
				    }
				    if (isUniFrameWork && !isGroup) {
				      this.groupManageExt = [];
				    }
						this.currentGroup = conversation?.groupProfile;
				    this.groupID = conversation?.groupProfile?.groupID;
					
				  },
				})
			},
			openModal() {
				let {
					groupManageExt,
					isGroup,
					conversationInfo
				} = this
				if (isUniFrameWork && isGroup && groupManageExt) {
					handleGroup()
				} else {
					uni.navigateTo({
						url: `/pages/home/views/chatUser/index?userID=${this.$setUserID(conversationInfo.userProfile.userID)}`
					})
				}
			},
			openPeoPleList() {
				TUIChatEngine.chat.getConversationList().then(res => {
					let list = res.data.conversationList
					list.forEach(item => {
						item.isCheck = false
					})
					this.conversationList = list
					this.isShowPeople = true
				})
			},
			onClickEdit({
				type
			}) {
				let allMsg = this.$refs.msgRef.getAllCheckMsg()
				if (allMsg.length == 0) {
					Toast({
						message: '请选择操作的消息',
						type: TOAST_TYPE.ERROR,
					});
					return
				}
				console.log('allMsg', allMsg)
				if (type == 'share') {
					openPeoPleList()
				} else {
					onDeleList()

				}
			},
			// 批量删除
			onDeleList() {
				let {
					conversationInfo
				} = this
				let allMsg = this.$refs.msgRef.getAllCheckMsg()
				let allIDList = allMsg.map(item => {
					return {
						ID: item.ID,
						to: item[item.flow == 'in' ? 'from' : 'to']
					}
				})
				let idsToRemove = allIDList.map(item => item.ID)
				// 判断条件不能删除
				let userData = uni.getStorageSync('userInfo')
				if (conversationInfo.type == "GROUP") {

				} else {
					let isAllMySelf = allMsg.every(item => item.from == userData.userID)
					if (!isAllMySelf) {
						Toast({
							message: '选中的消息内不能包含他人消息',
							type: TOAST_TYPE.ERROR,
						});
						return
					}

					console.log('isAllMySelf', isAllMySelf)
				}



				// 群组的多选删除
				// if(conversationInfo.value.type=="GROUP"){
				allMsg.forEach(async (item) => {
					let messageModel = TUIStore.getMessageModel(item.ID);
					await messageModel
						.revokeMessage()
						.then(() => {
							enableSampleTaskStatus('revokeMessage');
						})
						.catch((error) => {
							// 调用异常时业务侧可以通过 promise.catch 捕获异常进行错误处理
							if ((error.code = 20016)) {
								const message = tc("只能删除最近7天内的消息");
								Toast({
									message,
									type: TOAST_TYPE.ERROR,
								});
							}
						});
				})
				// }
				return
				TUIChatEngine.chat.deleteMessage(allMsg).then(res => {
					this.$refs.msgRef.updateList(idsToRemove)
				})
			},
			handChangeInput(val) {
				this.isShowEdit = val
				if (!val) {
					this.$refs.msgRef.clearSelect()
				}
			},
			onShareMore(list) {
				let {
					navTitle,
					groupID
				} = this
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
				let title = groupID ? tc('群聊的聊天记录') : `${navTitle}${tc('与')}${userInfo.account}${tc('的聊天记录')}`
				let abstractList = []
				let allMsg = this.$refs.msgRef.getAllCheckMsg()


				allMsg.sort(function(a, b) {
					return a.time - b.time;
				});

				let cutList = allMsg.slice(-3)
				cutList.forEach((item, index) => {
					abstractList.push(
						`${item.nick}:${item.type=='TIMTextElem'?item._message.payload.text:typeList[item.type]}`
						)
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
							this.isShowEdit = false
							this.isShowPeople = false
							// isShowEdit.value=false
							// isShowPeople.value=false
						}
					})
				})

			},
			getGroup(groupID) {
				if (!groupID) return
				uni.$chatKit?.chat.getGroupProfile({
					groupID: groupID
				}).then(res => {
					this.memberCount = res.data.group.memberCount
				})
			},
			leftClick() {
				let allPage = uni.$u.pages()
				let beforePage = allPage[allPage.length - 2].route
				if (beforePage == 'pages/TUIKit/components/TUIChat/index') {
					uni.switchTab({
						url: '/pages/home/index'
					})
				} else {
					uni.navigateBack()
				}
			},
			reset() {
				TUIConversationService.switchConversation();
			},
			closeChat  (conversationID)  {
				console.log('关闭')
			  emits("closeChat", conversationID);
			  reset();
			},
			insertEmoji  (emojiObj) {
			  this.$refs.messageInputRef?.insertEmoji(emojiObj);
			},
			closeToolbarShow(){
				if(this.$refs.messageInputRef?.getName()){
					this.isToolbarShow=false
				}
				this.$refs.messageInputRef?.toggleBox('')
				
			},
			handleToolbarListShow  (show)  {
				let {isToolbarShow}=this
			  if (isUniFrameWork) {
				  
			    this.isToolbarShow = (show === undefined) ? !isToolbarShow : show;
			  } else {
			    this.isToolbarShow = true;
			  }
			},
			handleEditor  (message, type) {
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
			        this.$refs.messageInputRef?.reEdit(message?.payload?.text);
			      }
			      break;
			    default:
			      break;
			  }
			},
			handleGroup  ()  {
				let {groupID}=this
				uni.navigateTo({
					url: `/pages/address/views/group/views/group-settings/index?groupID=${groupID}`
				})
			},
			updateMemberCount  (count)  {
				this.memberCount+= count
			}
			
		}
	};
</script>
<style scoped lang="scss">
	@import url('../../../TUIKit/components/TUIChat/style/index.scss');
.navbar {
		::v-deep {
			.u-navbar__content {
				background-color: rgba(250, 250, 250, 0.8) !important;
				backdrop-filter: blur(10px);
			}
		}
	}
</style>