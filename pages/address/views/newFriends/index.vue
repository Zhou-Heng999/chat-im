<template>
	<ql-page ref="qlPage" class="pd-box flex-column">
		<u-navbar placeholder border autoBack :title="$tc('新朋友')" @clickLeft="BackPage"></u-navbar>
		<!-- <view v-if="newList.length > 0">
			<view class="pd-tb-20 flex-between" v-for="item in newList">
				<view class="flex-align flex1">
					<avatarModal :info='item' class="mr-10"></avatarModal>
					<view class="flex-column">
						<text>{{item.nick}}</text>
					</view>
				</view>
				<btn v-if="item.addType=='0'" :text="$tc('同意')" w='156' h='68' shape='square'
					@click="confrimFriend(item,0)"></btn>
				<u-button v-if="item.addType=='0'" @click="confrimFriend(item,1)" :text="$tc('拒绝')"
					style="width: 156rpx; height: 68rpx; margin-left: 15rpx;" type="error"></u-button>
				<btn v-if="item.addType!='0'" :text="$tc('待验证')" btnType='disabled' w='156' h='68' shape='square'></btn>
			</view>
		</view> -->

		<view v-if="friend.length > 0">
			<u-list :key="key" height="90vh">
				<u-list-item v-for="(item, index) in friend" :key="index">
					<view class="pd-tb-20 flex-between">
						<view class="flex-align flex1">
							<avatarModal :info='item' class="mr-10"></avatarModal>
							<view class="flex-column">
								<text>{{item.nick}}</text>
							</view>
						</view>
						<view v-if="!item.addType">
							<view v-if="item.response_action =='Response_Action_AgreeAndAdd'">
								<btn :text="$tc('已添加')"
									btnType='disabled' w='156' h='68' shape='square'></btn>								
							</view>
							
							<view v-if="item.response_action =='Response_Action_Agree'">
								<btn :text="$tc('已添加')"
									btnType='disabled' w='156' h='68' shape='square'></btn>
							</view>
								
							<view v-if="item.response_action =='Response_Action_Reject'">
								<btn :text="$tc('已拒绝')"
									btnType='disabled' w='156' h='68' shape='square'></btn>
							</view>
							<btn v-if="item.response_action =='response_action'" :text="$tc('被拒绝')" btnType='disabled'
								w='156' h='68' shape='square'></btn>
						</view>
						<view v-else class="flex-between">
							<btn v-if="item.addType=='0'" :text="$tc('同意')" w='156' h='68' shape='square'
								@click="confrimFriend(item,0)"></btn>
							<u-button v-if="item.addType=='0'" @click="confrimFriend(item,1)" :text="$tc('拒绝')"
								style="width: 156rpx; height: 68rpx; margin-left: 15rpx;" type="error"></u-button>
							<btn v-if="item.addType!='0'" :text="$tc('待验证')" btnType='disabled' w='156' h='68'
								shape='square'>
							</btn>
						</view>
					</view>
				</u-list-item>
			</u-list>
		</view>
		<noData v-else />
		<agree :userDetail='friendInfo' :isShow="isAgreeShow" @closeModal='isAgreeShow=false' @onRefuse="onRefuse"
			@onAgree='onAgree'></agree>
	</ql-page>
</template>

<script>
	import agree from '../../components/agree/index.vue'
	import noData from '@/components/noData'
	import TUIChatEngine, {
		TUITranslateService,
		TUIConversationService,
		TUIStore,
		StoreName,
		IMessageModel,
		IConversationModel,
		SendMessageParams
	} from "@tencentcloud/chat-uikit-engine";
	export default {
		components: {
			agree,
			noData,
		},
		data() {
			return {
				friendHistory: [],
				newList: [],
				friend: [], //全部的好友历史记录加上新申请的
				isAgreeShow: false,
				friendInfo: null,
				key: 1,
				typeList: {
					[TUIChatEngine?.TYPES.SNS_APPLICATION_SENT_TO_ME]: '0',
					[TUIChatEngine?.TYPES.SNS_APPLICATION_SENT_BY_ME]: '1',
				},
				getAddFriendTimes:0
			};
		},
		onShow() {
			this.getNewList()
			this.setRead()
		},
		methods: {
			merged(array1, array2) {
				let mergedArray = array1.concat(array2);
				let groupedDict = {};
				let a = []
				console.log('mergedArray...', mergedArray);
				if (mergedArray.length == 0) {
					this.friend = a
					console.log('空数组，无任何好友记录...');
					return
				} else {
					mergedArray.forEach(item => {
						if (!groupedDict[item.userID]) {
							groupedDict[item.userID] = item;
						} else {
							// 如果当前元素的时间戳更大，则更新该分组中的元素
							if (item.time > groupedDict[item.userID].time) {
								groupedDict[item.userID] = item;
							}
						}
					});
					let groupedArr = Object.values(groupedDict);
					groupedArr.sort((a, b) => b.time - a.time);
					this.friend = groupedArr
					this.sortFriend();
					console.log('friend222...', this.friend);
				}
				this.key = this.key + 1
			},
			
			//排序
			sortFriend() {
				this.friend.sort((a, b) => {
				    if (a.addType === '0' && b.addType !== '0') {
				        return -1; // 将 a 放在 b 的前面
				    } else if (a.addType !== '0' && b.addType === '0') {
				        return 1; // 将 b 放在 a 的前面
				    } else {
				        return 0; // 不改变顺序
				    }
				});
			},

			//添加好友记录
			getAddFriend() {

				this.friendHistory = []
				this.$http.add_friend_log.addFriendList().then(res => {
					this.getAddFriendTimes = 0;
					console.log('添加好友记录', res);
					this.friendHistory = res.data.list
					this.merged(this.newList, this.friendHistory)
				}).catch(err=>{
					this.getAddFriendTimes += 1;
					if(this.getAddFriendTimes<3){
						this.getAddFriend()
					}else{
						this.getAddFriendTimes = 0;
					}
				})

			},

			// 获取好友申请
			getNewList() {
				let {
					typeList
				} = this
				uni.$chatKit?.chat?.getFriendApplicationList().then(res => {
					let list = res.data.friendApplicationList
					list.forEach(item => {
						item.addType = typeList[item.type]
					})
					this.newList = list
					this.getAddFriend()
				})
			},
			confrimFriend(item, addType) {
				let a = {
					...item,
					addType
				}
				console.log(a);
				this.friendInfo = a
				this.isAgreeShow = true
			},
			onRefuse(userID) {
				this.toastText(this.$tc('已拒绝'))
				let obj = this.friend.find(item => item.userID == userID);
				if (obj) {
					delete obj.addType
					obj.response_action = 'Response_Action_Reject';
				}
				this.sortFriend();
				// setTimeout(() => {
				// 	this.getNewList()
				// }, 500)
			},
			onAgree(userID) {
				this.toastText(this.$tc('已同意'))
				let obj = this.friend.find(item => item.userID == userID);
				if (obj) {
					delete obj.addType
					obj.response_action = 'Response_Action_AgreeAndAdd';
				}
				this.sortFriend();
				// setTimeout(() => {
				// 	this.getNewList()
				// }, 500)
			},

			// 上报已读
			setRead() {
				uni.$chatKit?.chat?.setFriendApplicationRead()
			}
		}
	};
</script>
<style scoped lang="scss">

</style>