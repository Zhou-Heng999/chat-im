<template>

	<ql-page class="main-box">

		<u-navbar placeholder border :title="$tc('通讯录')" leftIcon=''>
			<imageIcon slot="right" name="tb_tjhy" @click="clickTbTjhy" />
		</u-navbar>	
		<view class="" style="flex: 1;">
		
		<scroll-view style="height: 90vh;margin-bottom: 130rpx;box-sizing: border-box;" scroll-y="true"
		 :scroll-anchoring="true">
						
		<view class="flex-column max-width pd-box">
			<view class="max-width" @click="clickSearch">
				<u-search  @click="clickSearch" :placeholder="$tc('搜索')" :showAction='false'></u-search>
				<!-- <u-search placeholder="搜索" disabled :showAction='false' ></u-search> -->
			</view>
			<view class="max-width  flex-between pd-tb-20" v-for="item in topEditList" @click="toPage(item.url)" >
				<view class="flex-align">
					<imageIcon class="mr-30" width="94rpx" height="94rpx"
						:src="`/static/images/${item.icon}.png`"></imageIcon>
					<text class="font-32">{{$tc(item.title)}}</text>
			
				</view>
				<u-badge max="99" :value="item.msg"></u-badge>
			</view>
		</view>
		
		<!-- 好友列表  -->
		<view class="h40 pd-lr-20 flex-align less-bg">
		</view>
		<view class="flex-column max-width pd-box">
			<view class="flex-align  pd-tb-20" v-for="item in userList" @click="toUser(item)" >
				<avatarModal :info='setAvatarInfo(item)' class="mr-30" ></avatarModal>
				<view class="flex-column max-height flex-around-x">
					<text class="font-32" >{{item.remark||item.profile.nick}}</text>
					<!-- <text class="font-20 less-black" >{{setOnlineTime(item.profile.lastUpdatedTime)}}</text> -->
					<text class="font-20 less-black" >{{$setUserID(item.userID)}}</text>
				</view>
			</view>
			
			<view class="flex-center font-24 less-black mt-20 mb-30">
				{{userList.length}} {{$tc('位联系人')}}
			</view>
		</view>
		<view class="h120" ></view>
		</scroll-view>
		
		</view>
		<!-- <addressModal></addressModal> -->
	</ql-page>
</template>

<script>
import imageIcon from '@/components/image-icon'
	import addressModal from '@/pages/TUIKit/components/TUIContact/index'
	import {
	  TUIStore,
	  StoreName,
	} from "@tencentcloud/chat-uikit-engine";
	export default {
		components: {
			addressModal,
			imageIcon
		},
		data() {
			return {
				show:true,
				userList:[],
				topEditList: [{
						title: '新的朋友',
						type: 0,
						msg: 0,
						icon: 'address1',
						url:'/pages/address/views/newFriends/index'
					},
					{
						title: '群聊',
						type: 0,
						msg: 0,
						icon: 'address2',
						url:'/pages/address/views/group/index'
					},
					{
						title: '群通知',
						type: 0,
						msg: 0,
						icon: 'address_sys',
						url:'/pages/address/views/groupInform/index'
					},
					{
						title: '黑名单',
						type: 0,
						msg: 0,
						icon: 'black',
						url:'/pages/address/views/black/index'
					},
				]
			};
		},
		onReady() {
		},
		onShow() {
			try{
				this.getNewList()
			this.setTabNum()
			this.setTabbar()
			let userInfoData=uni.getStorageSync('userInfo')
			let {userInfo}=this
				uni.$chatKit?.chat?.getFriendList().then(res=>{
					// let list=res.data
					// console.log('好有列表',list)
					// if(list.length!=0)list=list.filter(item=>item.userID!=userInfoData.userID)
					// this.userList=list
				}).catch(err=>{
					console.log('好有列表',err)
				})
				
				TUIStore.watch(StoreName.FRIEND, {
				  friendList: (friendList) => {
					  // console.log('friendList',friendList)
					  this.userList=friendList.filter(item=>item.userID!=userInfoData.userID)
				    // contactListMap.value.friendList.list = friendList;
				    // updateCurrentContactInfoFromList(
				    //   contactListMap.value.friendList.list,
				    //   "friendList"
				    // );
				  },
				});
				
			}catch(e){
				console.log('e',e)
				//TODO handle the exception
			}
			
		},
		onLoad() {
			let that = this;
			uni.$on('updateUnread',function(data){
				that.topEditList[0].msg = data.unread;
			})
		},
		onUnload() {
			uni.$off('updateUnread')
		},
		methods: {
			setOnlineTime(timestamp) {
				let time = uni.$u.timeFrom(timestamp);
				let timeType = [
					'分钟',
					'小时',
					'天',
				]
				let newStr = ''
				timeType.forEach(item=>{
					if(time.indexOf(item) != -1){
						newStr = time.replace(item, this.$tc(item));
					}
				})
				if(newStr.indexOf('前') != -1){
					newStr = newStr.replace("前", this.$tc('前'));
				}
				if(newStr.indexOf('刚刚') != -1){
					newStr = newStr.replace("刚刚", this.$tc('刚刚'));
				}
				
				return newStr
			},
			setAvatarInfo(item){
				item.profile.remark=item.remark
				return item.profile
			},
			// 获取好友申请
			getNewList(){
				uni.$chatKit?.chat?.getFriendApplicationList().then(res=>{
					let {unreadCount}=res.data
					this.topEditList[0].msg=unreadCount
					
				})
			},
			clickSearch() {
				uni.navigateTo({
					url:`/pages/address/views/searchUsers/index`
				})
			},
			clickTbTjhy() {
				uni.navigateTo({
					url:`/pages/home/views/addFriend/index`
				})
			},
			toUser(e){
				let {userID}=e
				userID=this.$setUserID(userID)
				uni.navigateTo({
					url:`/pages/address/views/user/index?userID=${userID}`
				})
			}
		}
	};
</script>
<style scoped lang="scss">
 .main-box {
	 padding-bottom: 50px;
 }
</style>