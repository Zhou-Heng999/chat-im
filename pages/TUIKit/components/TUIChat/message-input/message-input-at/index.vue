<template>
	<BottomPopup :show="showAtList" @onClose="closeAt">
		<div :class="[isPC ? 'message-input-at' : 'message-input-at-h5']" ref="MessageInputAt">
			<div class="memberList" ref="dialog">
				<header class="memberList-title" v-if="!isPC">
					<span class="title">{{
            $tc("选择提醒的人")
          }}</span>
				</header>
				<view class='max-width mb-10 pd-lr-20'>
					<u-search v-model="keyWord" @change='changeKeyWord' :placeholder="$tc('搜索')"
						:showAction='false'></u-search>
				</view>


				<ul class="memberList-box">
					<li class="memberList-box-body" :class="[index === selectedIndex && 'selected']"
						v-for="(item, index) in (keyWord?searchList:showMemberList)" :key="index"
						@touchend.prevent="selectItem(index)" @touchmove="stopSelect" ref="memberListItems"
						 v-if="(item.userID != msgAtAll? true: isCanAtAll? true: false) && (item.userID != myId)">
						<avatarModal :info='item' class="mr-30"></avatarModal>
						<!-- <img
              class="memberList-box-body-avatar"
              :src="handleMemberAvatar(item)"
            /> -->
						<span class="memberList-box-body-name">{{
              handleMemberName(item)
            }}</span>
					</li>
				</ul>
			</div>
		</div>
	</BottomPopup>
</template>


<script>
	import TUIChatEngine, {
		TUIStore,
		StoreName,
		TUIGroupService,
		TUITranslateService,
	} from "@tencentcloud/chat-uikit-engine";
	import { ref, watch, onMounted, onUnmounted } from "../../../../adapter-vue";
	import { isPC, isH5 } from "../../../../utils/env";
	import { TUIGlobal } from "../../../../utils/universal-api/index";
	import BottomPopup from "../../../common/BottomPopup/index.vue";
	import store from "@/store/index.js"
	
	export default {
		components: {
			BottomPopup
		},
		data() {
			return {
				isPC: isPC,
				myId: '',
				MessageInputAt: '',
				memberListItems: '',
				showAtList: false,
				memberList: [],
				allMemberList: [],
				showMemberList: [],
				isGroup: false,
				position: { left: 0, top: 0 },
				selectedIndex: 0,
				currentConversationID: '',
				keyWord: '',
				searchList: [],
				userData: '',
				isCanAtAll: '',
				msgAtAll: TUIChatEngine.TYPES.MSG_AT_ALL,
				isCanSelect: true
			}
		},
		computed: {
			// 模拟vue3的watch多个变量
			listen() {
				const { position, MessageInputAt } = this
				return [position, MessageInputAt]
			}
		},
		mounted() {
			this.onWatchStore()
			
			this.myId = TUIChatEngine.getMyUserID()
			TUIGlobal.toggleAtList = this.toggleAtList
			TUIGlobal.handleAtListPosition = this.handleAtListPosition
			TUIGlobal.setCurrentSelectIndex = this.setCurrentSelectIndex
			TUIGlobal.setShowMemberList = this.setShowMemberList
			
			// defineExpose({
			// 	toggleAtList,
			// })
		},
		beforeDestory() {
			this.onUnWatchStore()
		},
		watch: {
			listen() {
				if (isH5 || !this.MessageInputAt || !this.MessageInputAt.style) {
					return;
				}
				this.MessageInputAt.style.left = this.position.left + "px";
				this.MessageInputAt.style.top =
					this.position.top - this.MessageInputAt.clientHeight + "px";
			}
		},
		methods: {
			// 搜索
			changeKeyWord(val) {
				const regex = new RegExp(val, 'i'); // 使用正则表达式匹配子串，不区分大小写
				let list = this.showMemberList.filter(item => regex.test(item.nick));
				this.searchList = list;
			},
			onCurrentConversationID(id) {
				if (id !== this.currentConversationID) {
					this.currentConversationID = id;
					this.memberList = [];
					this.allMemberList = [];
					this.showMemberList = [];
					this.isGroup = false;
					TUIStore.update(StoreName.CUSTOM, "memberList", this.memberList);
					if (this.currentConversationID.startsWith("GROUP")) {
						this.isGroup = true;
						const groupID = this.currentConversationID.substring(5);
						TUIGroupService.switchGroup(groupID);
					}
				}
			},
			onUserProfile(user) {
				this.userData = user
			},
			onCurrentGroupMemberList(list) {
				const all = {
					userID: TUIChatEngine.TYPES.MSG_AT_ALL,
					nick: "所有人",
					isAll: true,
					avatar: "https://web.sdk.qcloud.com/im/assets/images/at.svg",
				}
				let target = list.find(item=>item.userID == store.state.userInfo.userID)
				if(target!= -1 && (target?.role == "Owner" || target?.role == 'Admin')){
					this.isCanAtAll = true
				}else {
					this.isCanAtAll = false
				}
				// this.isCanAtAll = list.some(item => item.userID == this.myId && (item.role == "Owner" || item.role == 'Admin'))
				list = list.filter(item => item.userID != this.userData.userID)
				this.memberList = list;
				let AtList = [all, ...this.memberList]
				// if (!isCanAtAll) {
				// 	AtList.shift()
				// }
				this.allMemberList = AtList;
				// this.showMemberList = this.allMemberList.filter(item => item.userID != store.state.userInfo.userID);
				this.showMemberList = this.allMemberList;
				TUIStore.update(StoreName.CUSTOM, "memberList", this.memberList);
			},
			onWatchStore() {
				TUIStore.watch(StoreName.CONV, {
					currentConversationID: this.onCurrentConversationID,
				});
				TUIStore.watch(StoreName.USER, {
					userProfile: this.onUserProfile
				})
				TUIStore.watch(StoreName.GRP, {
					currentGroupMemberList: this.onCurrentGroupMemberList,
				});
			},
			onUnWatchStore() {
				TUIStore.unwatch(StoreName.CONV, {
					currentConversationID: this.onCurrentConversationID,
				});
				TUIStore.unwatch(StoreName.USER, {
					userProfile: this.onUserProfile
				})
				TUIStore.unwatch(StoreName.GRP, {
					currentGroupMemberList: this.onCurrentGroupMemberList,
				})
			},
			toggleAtList(show) {
				if (!this.isGroup) {
					return;
				}
				this.showAtList = show;
				if (this.showAtList) {
					this.$emit("onAtListOpen")
				}
			},
			handleAtListPosition(positionData) {
				this.position = positionData
			},
			setCurrentSelectIndex(index) {
				this.selectedIndex = index;
				this.memberListItems[this.selectedIndex].scrollIntoView(false)
			},
			setShowMemberList(list) {
				this.showMemberList = list;
			},
			closeAt() {
				this.showAtList = false;
				this.keyWord = ''
				this.showMemberList = this.allMemberList.filter(item => item.userID != store.state.userInfo.userID);
				this.position = {
					left: 0,
					top: 0,
				}
			},
			//防止滑动触发选择群员
			stopSelect() {
				this.isCanSelect = false
			},
			selectItem(index) {
				if(!this.isCanSelect){
					this.isCanSelect = true;
					return
				}
				
				if (TUIGlobal.selectItem) {
					TUIGlobal.selectItem(index);
				} else {
					//判断是否有搜索关键词查询不同的列表
					if (this.keyWord) {
						const item = this.searchList[index];
						this.$emit("insertAt", {
							id: item.userID,
							label: item.nick || item.userID,
						});
					} else if (this.showMemberList.length) {
						const item = this.showMemberList[index];
						this.$emit("insertAt", {
							id: item.userID,
							label: item.nick || item.userID,
						});
					}
				}
				this.closeAt()
			},
			handleMemberAvatar(item) {
				return (
					item.avatar ||
					"https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png"
				)
			},
			handleMemberName(item) {
				return item.nick ? item.nick : item.userID
			}
		}
	}
</script>

<style scoped lang="scss">
	@import url("../../../../assets/styles/common.scss");

	.message-input-at {
		position: fixed;
		width: 100%;
		height: 500rpx;
		overflow-x: hidden;
		overflow-y: scroll;
		background: #ffffff;
		box-shadow: 0 0.06rem 0.63rem 0 rgba(2, 16, 43, 0.15);
		border-radius: 0.13rem;
	}

	.memberList-box {
		&-header {
			height: 2.5rem;
			padding-top: 5px;
			cursor: pointer;

			&:hover {
				background: rgba(0, 110, 255, 0.1);
			}
		}

		span {
			font-family: PingFangSC-Regular;
			font-weight: 400;
			font-size: 12px;
			color: #000000;
			letter-spacing: 0;
			padding: 5px;
		}

		&-body {
			padding: 10rpx 30rpx;
			box-sizing: border-box;
			cursor: pointer;
			display: flex;
			align-items: center;

			.selected,
			&:hover {
				background: rgba(0, 110, 255, 0.1);
			}

			&-name {
				overflow: hidden;
				white-space: nowrap;
				word-wrap: break-word;
				word-break: break-all;
				text-overflow: ellipsis;
			}

			&-avatar {
				width: 20px;
				height: 20px;
				padding-left: 10px;
			}
		}

		.selected {
			background: rgba(0, 110, 255, 0.1);
		}
	}

	.message-input-at-h5 {
		.memberList {
			height: auto;
			height: 700rpx;
			width: 100%;
			max-width: 100%;
			background: white;
			border-radius: 12px 12px 0 0;
			display: flex;
			flex-direction: column;
			overflow: scroll;
			padding-bottom: 30rpx;

			&-title {
				height: fit-content;
				width: calc(100% - 30px);
				text-align: center;
				vertical-align: middle;
				padding: 15px;

				.title {
					vertical-align: middle;
					display: inline-block;
					font-size: 16px;
				}

				.close {
					vertical-align: middle;
					position: absolute;
					right: 10px;
					display: inline-block;
				}
			}

			&-box {
				flex: 1;
				overflow-y: scroll;

				&-body {
					padding: 10px;

					img {
						width: 26px;
						height: 26px;
					}

					span {
						font-size: 14px;
					}
				}
			}
		}
	}
</style>