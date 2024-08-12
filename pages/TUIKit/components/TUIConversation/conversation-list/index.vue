<template>
	<div class="tui-conversation-list">
		<!-- 	<ActionsMenu v-if="isShowOverlay" :selectedConversation="currentConversation"
			:actionsMenuPosition="actionsMenuPosition" :selectedConversationDomRect="currentConversationDomRect"
			@closeConversationActionMenu="closeConversationActionMenu" /> -->
		<view class="max-width h100 flex-between edit-box pd-lr-20" v-if="isShowOverlay && canShowOverlay">
			<imageIcon name='close' @click="closeConversationActionMenu"></imageIcon>
			<view class="flex-align">
				<view class="flex-center box-item" :style="{background:item.style? item.style.backgroundColor:''}"
					v-for="(item,index) in getItemOptions(currentConversation)">
					<imageIcon :name='item.img' @click='onSwipeclick({name:currentConversationIndex,index})'>
					</imageIcon>
				</view>

			</view>
		</view>
		<scroll-view style="height: 85vh;" :scroll-top="scrollTop" scroll-y="true"  :scroll-anchoring="true" @scroll="onScroll">
			<!-- 	:scroll-top="scrollTop"
		@scroll="scroll"
		:refresher-threshold="60"
		refresher-enabled
		:refresher-triggered="refreshStatus"
		@refresherpulling="refresherpulling"
		@refresherrefresh="refresherrefresh" -->
			<!-- index==borderIndex?'item-border':'' -->
			<!-- <u-swipe-action ref="swipeRef" :autoClose='autoCloseSwipe'  >
				<u-swipe-action-item   @click='onSwipeclick' v-for="(conversation, index) in conversationList" :options="getItemOptions(conversation)"
				:name='index'
					:id="`convlistitem-${index}`" :key="index" :class="[
        'TUI-conversation-content',
        !isPC && 'TUI-conversation-content-h5',
		
      ]"> -->
			<!--  @longpress="showConversationActionMenu($event, conversation, index)"
	  @contextmenu.prevent="showConversationActionMenu($event, conversation, index, true)" -->

			<!-- <div
	   @longpress="showConversationActionMenu($event, conversation, index)"
	   @contextmenu.prevent="showConversationActionMenu($event, conversation, index, true)"
	   @touchstart="touchStart"
	   @touchend="touchend"
	   @click="enterConversationChat(conversation.conversationID)" -->
			<!-- @contextmenu.prevent="showConversationActionMenu($event, conversation, index, true)"
	   @touchstart="touchStart"
	   @touchend="touchend"
	   @touchmove="touchMove" -->
			<div @longpress="eventLongTap($event, conversation, index)" @click="eventClick(conversation)"
				v-for="(conversation, index) in conversationList" :id="`convlistitem-${index}`" :key="index" :class="[
          isPC && 'isPC',
          'TUI-conversation-item',
          currentConversationID === conversation.conversationID &&
            'TUI-conversation-item-selected',
          conversation.isPinned && 'TUI-conversation-item-pinned',
					currentConversation && currentConversation.conversationID  === conversation.conversationID && 'selected_bg'
        ]">
				<aside class="left">

					<Avatar
						:info="{ avatar: conversation.groupProfile ? conversation.groupProfile.avatar : conversation.userProfile.avatar }" />
					<div v-if="userOnlineStatusMap && isShowUserOnlineStatus(conversation)" :class="[
              'online-status',
              Object.keys(userOnlineStatusMap).length > 0 &&
              Object.keys(userOnlineStatusMap).includes(
                conversation.userProfile.userID
              ) &&
              userOnlineStatusMap[conversation.userProfile.userID]
                .statusType === 1
                ? 'online-status-online'
                : 'online-status-offline',
            ]"></div>
					<!-- <span
            class="num"
            v-if="conversation.unreadCount > 0 && !conversation.isMuted"
          >
            {{
              conversation.unreadCount > 99 ? "99+" : conversation.unreadCount
            }}
          </span> -->
					<!-- <span class="num-notify" v-if="conversation.unreadCount > 0 && conversation.isMuted"></span> -->
				</aside>
				<div class="content">
					<div class="content-header">
						<label class="content-header-label flex-align">
							<view v-if="conversation.type === 'GROUP'" class="mr-10 group-icon">
								<imageIcon name="qun_tx" :size="28" />
							</view>
							<p class="name">{{ conversation.getShowName() }}</p>
						</label>
						<div class="middle-box">
							<!-- {{conversation}} -->
							<span class="middle-box-at" v-if="
										pageIsShow &&
										conversation.type === 'GROUP' &&
										conversation.groupAtInfoList &&
										conversation.groupAtInfoList.length > 0
										">{{ handleAtInfo(conversation.getGroupAtInfo()) }}
							</span>
							<!-- v-if="pageIsShow" -->
							<p  v-if="pageIsShow" class="middle-box-content">
								<!-- {{conversation.lastMessage}} -->
								<!-- <span
											v-if="conversation.lastMessage.type=='TIMCustomElem'&&conversation.lastMessage.payload.description=='business'">[个人名片]</span>
										<span
											v-else-if="conversation.lastMessage.type=='TIMCustomElem'&&conversation.lastMessage.payload.description=='newFriends'">你们已成为好友，打声招呼吧</span>
										<span v-else-if="conversation.lastMessage.type=='TIMRelayElem'">[聊天记录]</span>
										<span v-else-if="conversation.lastMessage.type=='TIMGroupTipElem'">[群公告]{{conversation.lastMessage.payload.newGroupProfile.notification}}</span>
										<span v-else>{{removeTip(conversation.getLastMessage("text"))  }}</span> -->
								{{ handleLastMessage(conversation) }}
							</p>
						</div>
					</div>
					<div class="content-footer max-height">
						<view class="flex-align">
							<imageIcon
								v-if="conversation.lastMessage.fromAccount==userProfile&&conversation.type=='C2C'"
								class="mr-10" width="28rpx" height="28rpx"
								:src="`/static/images/g_${conversation.lastMessage.isPeerRead?1:2}.png`"></imageIcon>
							<!-- {{ conversation.getLastMessage("time") }} -->
							<!-- v-if="pageIsShow" -->
							<span 
							v-if="pageIsShow"
								class="time">{{$tc(formatTimestamp(conversation.lastMessage.lastTime))}}</span>
						</view>
						<!-- v-if="pageIsShow" -->
						<view v-if="pageIsShow"  class="flex-align">
							<u-badge
								v-if="conversation.messageRemindType === TUIChatEngine.TYPES.MSG_REMIND_ACPT_NOT_NOTE"
								bgColor='#adb5bd' max="99" :value="conversation.unreadCount"></u-badge>

							<u-badge
								v-if="conversation.messageRemindType === TUIChatEngine.TYPES.MSG_REMIND_ACPT_AND_NOTE"
								max="99" :value="conversation.unreadCount">
							</u-badge>
							<!-- <image style="width: 20px; height: 20px; background-color: #eeeeee;"  src="/static/images/tb_zd_home.png"
									                       ></image> -->
							<imageIcon v-if="conversation.isPinned" width="30rpx" height="30rpx"
								src="/static/images/tb_zd_home.png" />

							<imageIcon
								v-if="conversation.messageRemindType === TUIChatEngine.TYPES.MSG_REMIND_ACPT_NOT_NOTE"
								width="30rpx" height="30rpx" src="/static/images/iconify-mdi_bell-off.png" />

							<!-- <Icon v-if="conversation.isMuted" :file="muteIcon"></Icon> -->
						</view>

					</div>
				</div>
			</div>
			<!-- </u-swipe-action-item>

			</u-swipe-action> -->

			<view class="h120 mb-20 mt-20">

			</view>
			<!-- + -->
		</scroll-view>
	</div>
</template>

<script lang="ts" setup>
	interface IUserStatus {
		statusType : number;
		customStatus : string;
	}

	interface IUserStatusMap {
		[userID : string] : IUserStatus;
	}
	import * as avue from "../../../adapter-vue";
	import { ref, nextTick, onMounted, computed, watch, getCurrentInstance, onUnmounted } from "../../../adapter-vue";
	import store from '@/store'
	import { TUIChatKit, genTestUserSig } from "@/pages/TUIKit";
	import TUIChatEngine, {
		TUIStore,
		StoreName,
		TUIConversationService,
	} from "@tencentcloud/chat-uikit-engine";
	import Icon from "../../common/Icon.vue";
	import Avatar from '@/components/avatar'
	import imageIcon from '@/components/image-icon'
	import ActionsMenu from "../actions-menu/index.vue";
	import muteIcon from "../../../assets/icon/mute.svg";
	import { isPC, isH5, isUniFrameWork } from "../../../utils/env";
	import { CONV_OPERATION } from "../../../constant";
	import { tc, handleEmojiToLanguage } from '@/utils/util'
	const toTop = computed(() => store.state.toTop)
	import { ListMixin } from '@/mixin/list'

	const props = defineProps({
		pageIsShow: {
			type: Boolean,
			required: true,
		},
	});
	const pageIsShow = ref<boolean>(false)
	const userProfile = uni.getStorageSync('userInfo').userID
	const emits = defineEmits(["handleSwitchConversation", "getPassingRef"]);
	const currentConversation = ref<IConversationModel>();
	const currentConversationID = ref<string>();
	const currentConversationDomRect = ref<DOMRect>();
	const isShowOverlay = ref<boolean>(false);
	const conversationList = ref<IConversationModel[]>([]);
	const conversationListDomRef = ref<HTMLElement | undefined>();
	const actionsMenuPosition = ref<{ top : number, left ?: number, conversationHeight ?: number }>({
		top: 0,
	});
	const loadingFirstGetConversation = ref(false)
	const thisInstance = getCurrentInstance()?.proxy || getCurrentInstance();
	const refreshStatus = ref<boolean>(false)
	const oldScroll = ref({
		scrollTop: 0
	})

	const getItemOptions = (item) => {
		if (!item) return
		let list = [
			{

				img: 'tb_sc', style: {
					backgroundColor: '#e94242',
				},
				type: CONV_OPERATION.DELETE

			},
			{

				img: `${item.isPinned ? 'tb_zdtd1' : 'tb_zdtd'}`, style: {
					backgroundColor: '#ff8d1a',
				},
				type: `${item.isPinned ? CONV_OPERATION.DISPINNED : CONV_OPERATION.ISPINNED}`

			},
			{
				img: `${item.messageRemindType === TUIChatEngine.TYPES.MSG_REMIND_ACPT_NOT_NOTE ? 'tb_mdr_1' : 'tb_mdr'}`,
				style: {
					backgroundColor: '#efefef',
				},
				type: `${item.messageRemindType === TUIChatEngine.TYPES.MSG_REMIND_ACPT_NOT_NOTE ? CONV_OPERATION.NOTMUTE : CONV_OPERATION.MUTE}`
			}
		]
		return list
	}

	// 时间判断
	function formatTimestamp(timestamp) {
		if (!timestamp || timestamp === '0') return ''
		const targetDate = new Date(timestamp * 1000);
		const now = new Date();

		if (isToday(targetDate)) {
			return `${targetDate.getHours()}:${(targetDate.getMinutes() < 10 ? '0' : '') + targetDate.getMinutes()}`;
		} else if (isThisWeek(targetDate, now)) {
			return getDayOfWeek(targetDate.getDay());
		} else if (isThisMonth(targetDate, now) || isThisYear(targetDate, now)) {
			return `${targetDate.getMonth() + 1}-${targetDate.getDate()}`;
		} else {
			return `${targetDate.getFullYear()}-${targetDate.getMonth() + 1}-${targetDate.getDate()}`;
		}
	}

	function isToday(date) {
		const now = new Date();
		return date.getDate() === now.getDate() &&
			date.getMonth() === now.getMonth() &&
			date.getFullYear() === now.getFullYear();
	}

	function isThisWeek(date, now) {
		const daysDifference = Math.floor((now - date) / (1000 * 60 * 60 * 24));
		return daysDifference < now.getDay();
	}

	function isThisMonth(date, now) {
		return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
	}

	function isThisYear(date, now) {
		return date.getFullYear() === now.getFullYear();
	}

	function getDayOfWeek(dayIndex) {
		const daysOfWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
		return daysOfWeek[dayIndex];
	}
	const displayOnlineStatus = ref(false); // 在线状态 默认关闭
	const userOnlineStatusMap = ref<IUserStatusMap>();
	let lastestOpenActionsMenuTime : number | null = null;
	const borderIndex = ref(-1)
	const isCheckGroup = ref(null)
	const deleList = ref([])
	// 检测用户是否被踢出群或群解散
	const checkUserIsInGroup = () => {
		console.log('checkUserIsInGroup',)
	}
	function findDifference(arr1, arr2) {
		const set1 = new Set(arr1);
		const set2 = new Set(arr2);
		const diff = new Set([...arr1.filter(x => !set2.has(x)), ...arr2.filter(x => !set1.has(x))]);
		return Array.from(diff);
	}

	function renderBatch(array, batchSize = 5) {
		var index = 0;
		function render() {
			var batch = array.slice(index, index + batchSize);
			// 这里可以将批次数据用于渲染
			conversationList.value = [...conversationList.value, ...batch]
			index += batchSize;
			if (index < array.length) {
				// 返回一个 Promise，延迟300ms后resolve
				return new Promise((resolve) => {
					setTimeout(resolve, 300);
				}).then(render); // 渲染下一个批次
			}
		}
		return render(); // 返回一个 Promise，用于异步执行批次渲染
	}
	const scrollTop=ref(0)
	const oldGroupList = ref([])
	const isInit = ref(true)
	const initList = ref()
	const getAdminMsg = (admin) => {
		if (!admin.isMuted) {
			setMute(admin)
		}
		let promise = TUIChatEngine.chat.getMessageListHopping({ conversationID: admin.conversationID, time: admin.lastMessage.lastTime, count: admin.unreadCount, direction: 0 });
		promise.then(res => {
			// 处理个人的GM指令
			console.log('res', res)
		})
		TUIChatEngine.chat.setMessageRead({ conversationID: admin.conversationID })
	}
	const onCurrentConversation = (conversation : IConversationModel) => {
		currentConversation.value = conversation;
	}
	const onConversationList = (res) => {
		let nowNoRead = res.filter(item => item.conversationID == currentConversationID.value).map(item => item.unreadCount)
		let arrayToSum = res.filter(item => !item.isMuted && item.conversationID != currentConversationID.value).map(item => item.unreadCount)
		const sum = arrayToSum.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
		let totalUnreadCount = sum > 99 ? 99 : sum;
		thisInstance.$store.commit('setTotalUnreadCount', totalUnreadCount)
	}

	const conversationModel = ref()
	const swipeModal = ref()
	const onSwipeclick = (e) => {
		let { name, index } = e
		console.log('handleItem', name, index)
		swipeModal.value = conversationList.value[name]
		console.log('swipeModal.value', swipeModal.value)
		let type = getItemOptions(swipeModal.value)[index].type
		handleItem(type)
	}
	const swipeRef = ref(null)
	const handleItem = (name) => {
		const conversationModel = swipeModal.value;
		console.log('handleItem===name', name, conversationModel)
		switch (name) {
			case CONV_OPERATION.DELETE:
				conversationModel?.deleteConversation();
				// ListMixin.methods.setTabNum()
				break;
			case CONV_OPERATION.ISPINNED:
				conversationModel?.pinConversation();
				break;
			case CONV_OPERATION.DISPINNED:
				conversationModel?.pinConversation();
				break;
			case CONV_OPERATION.MUTE:
				//   conversationModel?.muteConversation();
				setMute(conversationModel)
				break;
			case CONV_OPERATION.NOTMUTE:
				//   conversationModel?.muteConversation();
				setNoMute(conversationModel)
				break;
		}
		swipeRef.value.closeAll()

	};
	const setList = (list) => {
		let newList = list.map(item => item._group.groupID)
		if (oldGroupList.value.length > list.length || oldGroupList.value.length == 0) {
			if (oldGroupList.value.length != 0) {
				let kList = findDifference(oldGroupList.value, newList)
				nextTick(() => {
					deleList.value = kList
					kList.forEach(async (item, index) => {
						let t = conversationList.value.findIndex(p => p.type == 'GROUP' && p.groupProfile.groupID == item)
						let page = uni.$u.pages()
						let nowPage = page[page.length - 1].route
						if (nowPage == 'pages/TUIKit/components/TUIChat/index' && conversationList.value[t].conversationID == currentConversationID.value) {
							console.log('进入了触发返回逻辑',currentConversationID.value,kList)
							// uni.navigateBack()
						}

						onSwipeclick({ index: 0, name: t })
					})
				})

			}
		}
		oldGroupList.value = newList
	}
	uni.$on('deleGroup', () => {
		TUIStore.unwatch(StoreName.GRP, {
			groupList: setList
		})
		setTimeout(()=>{
			scrollTop.value=0
		},0)
		conversationList.value=[]
		oldGroupList.value = 0
	})

	function setMute(_conversationModel : any) {

		if (_conversationModel.type === TUIChatEngine.TYPES.CONV_GROUP) {
			let groupID = _conversationModel.groupProfile.groupID;

			const params = {
				groupID: groupID,
				messageRemindType: TUIChatEngine.TYPES.MSG_REMIND_ACPT_NOT_NOTE,
			}
			TUIChatEngine.chat?.setMessageRemindType(params)
				.then((result : any) => {
					// this.getConversation()
				}).catch((err : any) => {
					console.log('setMessageRemindType.err =', err)
					// this.conversation.messageRemindType = this.conversation.messageRemindType === MessageRemindTypes['在线和离线都拒收消息']
				})

		}
		else if (_conversationModel.type === TUIChatEngine.TYPES.CONV_C2C) {

			let userID = _conversationModel.userProfile.userID;

			const params = {
				userIDList: [userID],
				messageRemindType: TUIChatEngine.TYPES.MSG_REMIND_ACPT_NOT_NOTE
			}

			console.log('setMessageRemindType params...', params)
			TUIChatEngine.chat?.setMessageRemindType(params)
				.then((result : any) => {

				})
				.catch((err : any) => {
					console.log('setMessageRemindType.err =', err)
					// this.conversation.messageRemindType = this.conversation.messageRemindType === MessageRemindTypes['在线和离线都拒收消息']
				})
		}

	}


	const setNoMute = (_conversationModel : any) => {

		if (_conversationModel.type === TUIChatEngine.TYPES.CONV_GROUP) {
			let groupID = _conversationModel.groupProfile.groupID;

			const params = {
				groupID: groupID,
				messageRemindType: TUIChatEngine.TYPES.MSG_REMIND_ACPT_AND_NOTE,
			}
			TUIChatEngine.chat?.setMessageRemindType(params)
				.then((result : any) => {
					// this.getConversation()
				}).catch((err : any) => {
					console.log('setMessageRemindType.err =', err)
					// this.conversation.messageRemindType = this.conversation.messageRemindType === MessageRemindTypes['在线和离线都拒收消息']
				})

		}
		else if (_conversationModel.type === TUIChatEngine.TYPES.CONV_C2C) {

			let userID = _conversationModel.userProfile.userID;

			const params = {
				userIDList: [userID],

				messageRemindType: TUIChatEngine.TYPES.MSG_REMIND_ACPT_AND_NOTE
			}
			console.log('setMessageRemindType params...', params)
			TUIChatEngine.chat?.setMessageRemindType(params)
				.then((result : any) => {

				})
				.catch((err : any) => {
					console.log('setMessageRemindType.err =', err)
					// this.conversation.messageRemindType = this.conversation.messageRemindType === MessageRemindTypes['在线和离线都拒收消息']
				})
		}

	}


	const isShowUserOnlineStatus = (conversation : IConversationModel) : boolean => {
		return (
			displayOnlineStatus.value &&
			conversation.type === TUIChatEngine.TYPES.CONV_C2C
		);
	};
	const currentConversationIndex = ref(0)
	let isTriggeredScroll = false, scrollTimer = null
	const onScroll = () => {
		isTriggeredScroll = true
		clearTimeout(scrollTimer)
		scrollTimer = setTimeout(() => {
			isTriggeredScroll = false
		}, 100)
	}
	const canShowOverlay = ref(true)
	let startT = 0, startE = 0
	const touchStart = () => {
		startT = new Date().getTime()
	}
	const touchend = () => {
		startE = new Date().getTime()
		isTriggeredScroll = false
	}
	const touchMove = () => {
		canShowOverlay.value = false

	}
	const eventClick = (conversation) => {
		let { conversationID, unreadCount } = conversation
		if (Math.abs(startT - startE) < 300) {

			getApp().globalData.unreadCount = unreadCount
			getApp().globalData.currentConversationInfo = conversation

			enterConversationChat(conversationID)
		}
	}
	const eventLongTap = (
		event : Event,
		conversation : IConversationModel,
		index : number,
		isContextMenuEvent ?: boolean
	) => {
		if (isTriggeredScroll == false) {
			showConversationActionMenu(event, conversation, index)
		}
	}

	const showConversationActionMenu = (
		event : Event,
		conversation : IConversationModel,
		index : number,
		isContextMenuEvent ?: boolean
	) => {
		if (isContextMenuEvent && isUniFrameWork) {
			return;
		}
		currentConversation.value = conversation;
		currentConversationIndex.value = index
		lastestOpenActionsMenuTime = Date.now();
		isShowOverlay.value = true;
		canShowOverlay.value = true
		// getActionsMenuPosition(event, index);
	};

	const closeConversationActionMenu = () => {
		// 防止连续触发overlay的tap事件
		if (
			lastestOpenActionsMenuTime &&
			Date.now() - lastestOpenActionsMenuTime > 300
		) {
			currentConversation.value = undefined;
			isShowOverlay.value = false;
		}
	};

	const getActionsMenuPosition = (event : Event, index : number, conversation ?: any) => {
		if (isUniFrameWork) {
			if (typeof conversationListDomRef.value === 'undefined') {
				emits('getPassingRef', conversationListDomRef);
			}
			const query = uni.createSelectorQuery().in(conversationListDomRef.value);
			query.select(`#convlistitem-${index}`).boundingClientRect(data => {
				if (data) {
					actionsMenuPosition.value = {
						// uni-h5的uni-page-head不被认为是视窗中的成员，因此手动上head的高度
						top: data.bottom + (isH5 ? 44 : 0),
						left: event.touches[0].pageX,
						conversationHeight: data.height,
					};
					isShowOverlay.value = true;
				}
			}).exec();
		} else {
			// 处理Vue原生
			const rect = event.currentTarget?.getBoundingClientRect();
			if (rect) {
				actionsMenuPosition.value = {
					top: rect.bottom,
					left: isPC ? event.clientX : undefined,
					conversationHeight: rect.height,
				};
			}
			isShowOverlay.value = true;
		}
	};

	const enterConversationChat = (conversationID : string) => {
		store.commit('setNowConId', conversationID)
		emits("handleSwitchConversation", conversationID);
		uni.navigateTo({
			url: "/pages/TUIKit/components/TUIChat/index",
		});
		TUIConversationService.switchConversation(conversationID);
	};

	const handleAtInfo = (info) => {
		let str = info.replace(/\[|\]/g, '')
		let str2 = tc(str)
		if (!str2) return info
		return `[${str2}]`
	};

	function handleLastMessage(_conversation : any) {
		// console.log('_conversation',_conversation)
		// console.log('会话列表（官方方法）..', _conversation.getLastMessage("text"));
		try{
			
			if (!_conversation.lastMessage.type || !_conversation.lastMessage.payload || _conversation.lastMessage.isRevoked) {
				return "";
			}
			
			if (_conversation.lastMessage.type === TUIChatEngine.TYPES.MSG_MERGER) {
			
				// 私聊不需要显示发送者名称和冒号
				if (_conversation.type === "C2C") {
					return tc('聊天记录');
				}
			
				return _conversation.lastMessage.nick + ':' + tc('聊天记录');
			}
			else if (_conversation.lastMessage.type === TUIChatEngine.TYPES.MSG_TEXT) {
				let message = _conversation.getLastMessage("text");
				// message =  handleEmojiToLanguage(message)
				message = message.replace(/^\[\d+(?:\+)?条\]/, '');
				let r_ms = removeTip(message);
				if (r_ms.startsWith("我:")) {
					const regex = new RegExp('^' + '我:');
					r_ms = r_ms.replace(regex, `${tc('我')}:`)
			
					r_ms = r_ms.replace(`@所有人 `, `${tc('@所有人')} `)
					// r_ms = r_ms.replace('我',tc('我'));
				}
				return r_ms;
			}
			else if (_conversation.lastMessage.type === TUIChatEngine.TYPES.MSG_GRP_TIP) {
				if (_conversation.lastMessage.payload.operationType == 1) {
					let t = thisInstance.$setUserID(_conversation.lastMessage.payload.memberList[0].userID)
					return t + " " + tc('加入群聊');
				}
			
				else if (_conversation.lastMessage.payload.operationType == 6) {
			
					if (_conversation.lastMessage.payload.newGroupProfile.notification) {
						let tip = _conversation.lastMessage.nick + " " + tc('发布') +
							tc('群公告') + ":" + _conversation.lastMessage.payload.newGroupProfile.notification.slice(0, 5) + '...';
			
						return tip;
					}
					else if (_conversation.lastMessage.payload.newGroupProfile.ownerID) {
						return channelIgnore(_conversation.lastMessage.payload.newGroupProfile.ownerID) + " " + tc('成为新的群主');
					}
					else if (_conversation.lastMessage.payload.newGroupProfile.inviteOption) {
			
						if (_conversation.lastMessage.payload.newGroupProfile.inviteOption === TUIChatEngine.TYPES.INVITE_OPTIONS_NEED_PERMISSION) {
							return _conversation.lastMessage.nick + " " + tc('开启进群需审核');
						}
						else {
							return _conversation.lastMessage.nick + " " + tc('关闭进群需审核');
						}
			
					}
					else if (_conversation.lastMessage.payload.newGroupProfile.muteAllMembers != undefined) {
						if (_conversation.lastMessage.payload.newGroupProfile.muteAllMembers === true) {
							return _conversation.lastMessage.nick + " " + tc('开启全员禁言');
						}
						else if (_conversation.lastMessage.payload.newGroupProfile.muteAllMembers === false) {
							return _conversation.lastMessage.nick + " " + tc('取消全员禁言');
						}
					}
					else if (_conversation.lastMessage.payload.newGroupProfile.avatar) {
						return _conversation.lastMessage.nick + " " + tc('编辑群头像');
					}
			
			
			
					else {
			
						return tc('群资料更新');
					}
			
				}
				if (_conversation.lastMessage.payload.operationType == 7) {
					// console.log(_conversation.lastMessage.payload.userIDList[0])
			
					// let stats = "";
			
					// if(_conversation.lastMessage.payload.memberList[0].muteTime == 0){
					// 	stats = '取消禁言'
					// }
					// else if(_conversation.lastMessage.payload.memberList[0].muteTime > 0){
					// 	stats = '被禁言'
					// }
			
			
					// let tips = _conversation.lastMessage.payload.memberList[0].nick + stats;
			
					// return tips;
			
			
					return "";
				}
			
				else if (_conversation.lastMessage.payload.operationType == 3) {
			
					// let tips = _conversation.lastMessage.nick + tc('被踢出群组');
			
					return "";
				}
			
			
				else if (_conversation.lastMessage.payload.operationType == 4) {
			
					let tips = _conversation.lastMessage.payload.memberList[0].nick + " " + tc('成为管理员');
			
					return tips;
				}
				else if (_conversation.lastMessage.payload.operationType == 5) {
			
					let tips = _conversation.lastMessage.payload.memberList[0].nick + " " + tc('被撤销管理员');
			
					return tips;
				}
			
			}
			else if (_conversation.lastMessage.type === TUIChatEngine.TYPES.MSG_CUSTOM) {
			
			
				if (_conversation.lastMessage.payload.description == 'business') {
					return '[' + tc("个人名片") + ']';
				}
				else if (_conversation.lastMessage.payload?.description == 'GM_ORDER') {
					// let data = JSON.parse(_conversation.lastMessage.payload.data);
			
					// if(data.code == "delete_message"){
					// 	return _conversation.lastMessage.nick + "删除了一条消息";
					// }
					return "";
				}
				else if (_conversation.lastMessage.payload?.description == 'newFriends') {
					// return _conversation.lastMessage.payload.data;
					return tc("你们已成为好友，打声招呼吧");
				}
				else if (_conversation.lastMessage.payload.description == 'group_delete') {
					const newString = _conversation.getLastMessage("text").split(':')[0];
					return newString.replace('我', tc('我')) + " " + tc("解散群聊");
				}
				else if (_conversation.lastMessage.payload.description == 'add_pinned_msgs') {
					const newString = _conversation.getLastMessage("text").split(':')[0];
					return newString.replace('我', tc('我')) + " " + tc("置顶了一条消息");
				}
			
				else if (_conversation.lastMessage.payload.description == 'remove_pinned_msgs') {
					const newString = _conversation.getLastMessage("text").split(':')[0];
					return newString.replace('我', tc('我')) + " " + tc("取消了一条置顶消息");
				}
			
				else if (_conversation.lastMessage.payload.description == 'c2c_set_top') {
					return channelIgnore(_conversation.lastMessage.fromAccount) + " " + tc("置顶了一条消息");
				}
			
				else if (_conversation.lastMessage.payload.description == 'c2c_rm_top') {
					return channelIgnore(_conversation.lastMessage.fromAccount) + " " + tc("取消了一条置顶消息");
				}
			
			
			
				else {
					// console.log('_conversation.lastMessage.payload.data',_conversation.lastMessage)
					if (_conversation.lastMessage.payload.data) {
						// console.log('55',_conversation.lastMessage.payload.data)
						let data = JSON.parse(_conversation.lastMessage.payload.data);
						// console.log('data...',twoData);
						// console.log('嵌套。。。', JSON.parse(data.data));
						if (data.businessID) {
							if (data.businessID == 'group_create') {
								// return data.opUser + _conversation.getLastMessage("text") + " " + tc("创建群聊");
								const newString = _conversation.getLastMessage("text").split(':')[0];
								return newString.replace('我', tc('我')) + " " + tc("创建群聊");
							} else if (data.businessID == '1') {
								try {
									let twoData = JSON.parse(data.data)
									if (data.actionType == '2' && twoData.data.cmd == "audioCall") {
										return channelIgnore(_conversation.lastMessage.fromAccount) + " " + tc("取消语音通话");
									} else if (data.actionType == '1' && twoData.data.cmd == "audioCall" && !twoData.data.excludeFromHistoryMessage) {
										return tc("拒绝语音通话");
									} else if (data.actionType == '1' && twoData.data.cmd == "audioCall" && twoData.data.excludeFromHistoryMessage != false) {
										return channelIgnore(_conversation.lastMessage.fromAccount) + " " + tc("发起语音通话");
									} else if (data.actionType == '5' && twoData.data.cmd == "audioCall") {
										return tc("语音无应答");
									}
									// 视频电话
									else if (data.actionType == '2' && twoData.data.cmd == "videoCall") {
										return channelIgnore(_conversation.lastMessage.fromAccount) + " " + tc("取消视频通话");
									} else if (data.actionType == '1' && twoData.data.cmd == "videoCall" && twoData.data.excludeFromHistoryMessage != false) {
										return channelIgnore(_conversation.lastMessage.fromAccount) + " " + tc("发起视频通话");
									} else if (data.actionType == '5' && twoData.data.cmd == "videoCall") {
										return tc("视频无应答");
									} else if (data.actionType == '1' && twoData.data.cmd == "videoCall" && !twoData.data.excludeFromHistoryMessage) {
										return tc("拒绝视频通话");
									}
								} catch (e) {
									//TODO handle the exception
								}
								console.log('yu===', data)
								// console.log('two',twoData)
							}
			
			
						}
					}
			
				}
			
			}
			
			else {
				let content = _conversation.getLastMessage("text") ? _conversation.getLastMessage("text").replace('我', tc('我')) : _conversation.getLastMessage("text");
				// const content = _conversation.getLastMessage("text").replace('我',tc('我'))
				return content;
				// return _conversation.getLastMessage("text");
			}
			
		}catch(e){
			return _conversation.lastMessage?.payload?.text||'';
			//TODO handle the exception
		}

	}


	function removeTip(text : any) {
		let regex = /_{(.*?)}/g;
		text = text.replace(regex, '');
		return text
	}

	function channelIgnore(_str : string) {

		let str_list = _str.split("#");

		if (str_list[1]) {
			return str_list[1];
		}
		else {
			return _str;
		}
	}

	const getConversationList = (cb) => {
		TUIChatEngine.chat.getConversationList().then(result => {
			conversationList.value = result.data.conversationList
			store.commit('setAllConversation', result.data.conversationList)
			if (cb) cb()
		})
	}

	const refresherpulling = () => {
		console.log('正在触发下拉刷新...')
		refreshStatus.value = true
	}

	const refresherrefresh = () => {
		console.log('触发了下拉刷新...')
		const cb = () => {
			setTimeout(() => {
				refreshStatus.value = false
			}, 1500)
		}
		TUIStore.watch(StoreName.USER, {
			netStateChange: (value : string) => {
				console.log('netStateChange...', value)
				if (!value || value === 'connected') getConversationList(cb)
			}
		})
	}

	// 滚动事件
	const scroll = (e) => {
		oldScroll.value.scrollTop = e.detail.scrollTop
	}
	// 滚动到顶部
	watch(() => toTop.value, val => {
		if (val == false) return
		scrollTop.value = oldScroll.value.scrollTop
		nextTick(() => {
			getConversationList()
			scrollTop.value = 0
			store.commit('setToTop', false)
		})
	})

	function onCurrentConversationIDUpdate(id : string) {
		if (id !== currentConversationID.value) {
			currentConversationID.value = id
		}
	}
	function sortList(arr, name) {
		return arr.sort(function (a, b) {
			var nameA = a[name].toUpperCase(); // 不区分大小写
			var nameB = b[name].toUpperCase(); // 不区分大小写
			if (nameA < nameB) {
				return 1;
			}
			if (nameA > nameB) {
				return -1;
			}
			return 0; // 名字相等
		})
	}
	function onConversationListUpdate(list : Array<IConversationModel>) {
		if (loadingFirstGetConversation.value) {
			return
		}
		let lastIndex = list.reduce((lastIndex, currentItem, currentIndex) => {
			if (currentItem.isPinned) {
				return currentIndex;  // 更新为当前索引
			}
			return lastIndex;  // 保持不变
		}, -1);
		list.forEach(item => {
			if (item.type == 'GROUP' && item.lastMessage.lastTime == 0) {
				item.lastMessage.lastTime = item?.groupProfile?.lastMessage?.lastTime
			}
		})
		let topList = list.filter(item => item.isPinned)
		sortList(topList, 'conversationID')
		let bottomList = list.filter(item => !item.isPinned)
		bottomList.sort((a, b) => b.lastMessage.lastTime - a.lastMessage.lastTime)
		list = [...topList, ...bottomList]
		let filterIDList = ['C2Cadministrator', 'C2Cacc4switch', 'C2Cacc4video', 'C2Cacc4avatar']
		let newList = list.filter(item => !filterIDList.includes(item.conversationID))
		let admin = list.find(item => item.conversationID == 'C2Cadministrator')
		if (admin && (!admin.isMuted || admin.unreadCount != 0)) {
			getAdminMsg(admin)
		}
		borderIndex.value = lastIndex

		if (conversationList.value.length === 0 && newList.length != 0) {
			loadingFirstGetConversation.value = true
			newList.forEach((item, index) => {
				setTimeout(() => {
					conversationList.value = [...conversationList.value, item]
					if (index === newList.length - 1) {
						loadingFirstGetConversation.value = false
					}
				}, index * 50)
			})
		} else {
			conversationList.value = newList
		}
		store.commit('setAllConversation', newList)
		onConversationList(newList)
	}

	function onDisplayOnlineStatusUpdate(status : boolean) {
		if (displayOnlineStatus.value !== status) {
			displayOnlineStatus.value = status
		}
	}

	function onUserStatusListUpdate(list : Map<string, IUserStatus>) {
		if (list.size !== 0) {
			userOnlineStatusMap.value = [...list.entries()].reduce(
				(obj, [key, value]) => {
					obj[key] = value;
					return obj;
				},
				{} as IUserStatusMap
			);
		}
	}
	const isUnWatch = computed(() => thisInstance.$store.state.isUnWatch)
	watch(isUnWatch, (val) => {
		if (val) {
			TUIStoreWatchEnd()
		}
		console.log('isUnWatch', val)
	})

	function TUIStoreWatchStart() {
		TUIStore.watch(StoreName.CONV, {
			currentConversationID: onCurrentConversationIDUpdate,
			conversationList: onConversationListUpdate,
			currentConversation: onCurrentConversation,
		})

		TUIStore.watch(StoreName.USER, {
			displayOnlineStatus: onDisplayOnlineStatusUpdate,
			userStatusList: onUserStatusListUpdate,
		});

		TUIStore.watch(StoreName.GRP, {
			groupList: setList
		})
	}

	function TUIStoreWatchEnd() {
		TUIStore.unwatch(StoreName.CONV, {
			currentConversationID: onCurrentConversationIDUpdate,
			conversationList: onConversationListUpdate,
			currentConversation: onCurrentConversation,
		})

		TUIStore.unwatch(StoreName.USER, {
			displayOnlineStatus: onDisplayOnlineStatusUpdate,
			userStatusList: onUserStatusListUpdate,
		});

		TUIStore.unwatch(StoreName.GRP, {
			groupList: setList
		})
	}

	watch(
		() => props.pageIsShow,
		(newV) => {
			pageIsShow.value = newV
			if (newV) {
				TUIStoreWatchStart()
			} else {
				TUIStoreWatchEnd()
			}
		},
		{
			immediate: true
		}
	)

	onMounted(() => {
		TUIStoreWatchStart()
		//监听修改备注
		uni.$on('changConversationRemark', (data) => {
			let targetItem = conversationList.value.find(item => item.conversationID == `C2C${data.userID}`);
			if (targetItem) {
				targetItem.remark = data.remark;
			}
		})
	})


	onUnmounted(() => {
		TUIStoreWatchEnd()
		uni.$off('changConversationRemark')
	})


	// 暴露给父组件，当监听到滑动事件时关闭actionsMenu
	defineExpose({ closeChildren: closeConversationActionMenu });
</script>

<style lang="scss" scoped src="./style/index.scss"></style>
<style lang="scss" scoped>
	.selected_bg {
		background-color: #e5f0ff;
	}

	.edit-box {
		position: fixed;
		z-index: 888;

		top: var(--status-bar-height);
		left: 0;
		background: #fff;
	}

	.middle-box-content {
		display: flex;
		align-items: center;
		height: 100%;
	}

	.box-item {
		height: 60rpx;
		width: 60rpx;
		margin-left: 15rpx;
		border-radius: 20rpx;
	}

	.item-border {
		border-bottom: 1px solid #efefef;
	}

	.group-icon {
		width: 28rpx;
		height: 28rpx;
	}
</style>