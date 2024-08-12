<template>
	<ql-page class="main-box" @click="clickParent">

		<u-navbar class="home-navbar" placeholder leftIcon=''>
			<view slot="center" class="flex-center font-blod medium" style="width: 100%; height: 100%;" @click.stop="navbarClick">
				<view>{{appName}}</view>
			</view>

			<view slot="right" class="pos-relative">
				<rightSelect :list='talkList' ref="right-select" iconSize="60" @clickItem='onClickItem'></rightSelect>
			</view>
		</u-navbar>
		<view class="max-width pd-tb-20 pd-lr-20 white-bg home-search" @click="toPage('/pages/home/views/search/index')">
			<u-search @click="toPage('/pages/home/views/search/index')" :placeholder="$tc('搜索')" :showAction='false'></u-search>
		</view>
		<!-- <view @click="toPath" style="height: 150rpx;width: 300rpx;background: red;" >测试</view> -->
		<MsgModal :pageIsShow="pageIsShow"></MsgModal>
		
		<!-- <web-view src="https://im.2024go.xyz/h5/index.html#/" ></web-view> -->
		
		<!-- <view class="camera" @click="toCamera">camera</view> -->
	</ql-page>


</template>

<script>
	import TUIChatEngine from "@tencentcloud/chat-uikit-engine";
	import MsgModal from '@/pages/TUIKit/components/TUIConversation/index';
	import rightSelect from '@/components/right-select/index'
	import {
		TUIChatKit,
		genTestUserSig
	} from "@/pages/TUIKit";
	export default {
		components: {
			MsgModal,
			rightSelect
		},
		data() {
			return {
				pageIsShow: false,
				options1: [{
					text: this.$tc('删除')
				}],
				title: 'Hello',
				isCreateShow: false,
				isShowMsg: true,
				talkList: [{
						title: '添加联系人',
						icon: 'account-fill',
						type: 0,
						imageUrl: 'tb_tjhy2',
						url: '/pages/home/views/addFriend/index'
					},
					{
						title: '发起群聊',
						icon: 'account-fill',
						type: 1,
						imageUrl: 'tb_dl2',
						url: '/pages/home/views/createChat/index'
					},
					{
						title: '扫一扫',
						icon: 'account-fill',
						type: 'scan',
						imageUrl: 'tb_sys2',
						url: ''
					},
				],
				touchCount: 0,
			};
		},
		computed:{
			totalUnreadCount(){
				return getApp().globalData.noRead||'0'
			}
		},
		// watch:{
		// 	totalUnreadCount: {
		// 		handler(val) {
		// 			console.log('val',val)
		// 			if(val=='0'){
		// 				uni.removeTabBarBadge({
		// 					index:0,
		// 				})
		// 			}else{
		// 				uni.setTabBarBadge({
		// 					index:0,
		// 					text:`${val}`
		// 				})
		// 			}
		// 		},
		// 		immediate:true,
		// 		deep:true
		// 	}
		// },
		onHide() {
			this.pageIsShow = false
		},
		onReady() {
			this.toastBox()
			this.uploadScreenshot()
		},
		onShow() {
			this.pageIsShow = true
			// console.log('onshow',getApp().globalData.noRead)
			this.$nextTick(() => {
				this.clickParent()
			})
			
			let totalUnreadCount = uni.$chatKit?.chat?.getTotalUnreadMessageCount()
			if(totalUnreadCount=='0'){
				uni.removeTabBarBadge({
					index:0,
				})
			}else if(totalUnreadCount>0){
				if(totalUnreadCount<99){
					uni.setTabBarBadge({
						index:0,
						text:`${totalUnreadCount}`
					})
				}else{
					console.log('home-onShow',totalUnreadCount)
					uni.setTabBarBadge({
						index:0,
						text:'99+'
					})
				}
				
			}
			
			this.setTabNum()

		},
		onReachBottom() {
		  // 阻止页面继续向下滑动
		  uni.createSelectorQuery().selectViewport().boundingClientRect(rect => {
		    if (rect) {
		      uni.pageScrollTo({
		        scrollTop: rect.bottom
		      });
		    }
		  }).exec();
		},
		onReachTop() {
		  // 阻止页面继续向上滑动
		  uni.pageScrollTo({
		    scrollTop: 0
		  });
		},
		methods: {
			toCamera() {
				uni.navigateTo({
					url:'/pages/address/camera'
				})
			},
			toCreate(url) {
				this.toPage(url)
				this.closeCreate()
			},
			toPath(){
				uni.navigateTo({
					url:'/pages/home/views/chat/test'
				})
			},
			clickParent() {
				if (this.$refs['right-select']?.isCreateShow) {
					this.$refs['right-select'].onClose()
				}
			},
			closeCreate() {
				this.isCreateShow = false
			},
			onClickItem(e) {
				let that=this
				if (e.url) {
					this.toPage(e.url)
				}else if(e.type=='scan'){
					console.log(TUIChatEngine.TYPES)
					uni.scanCode({
						success: function (res) {
							let {result}=res
							if(result){
								let t=JSON.parse(result)
								that.onHandledScan(t)
							}
						}
					});
				}
			},
			onHandledScan({type,id}){
				if(type=='GROUP'){//群聊逻辑
				 let promise = TUIChatEngine.chat.joinGroup({
				     groupID: id,
				     applyMessage:'' 
				  });
				promise.then(res=>{
					let tipList={
						[TUIChatEngine.TYPES.JOIN_STATUS_WAIT_APPROVAL]:'等待管理员同意',
						[TUIChatEngine.TYPES.JOIN_STATUS_SUCCESS]:'加群成功',
						[TUIChatEngine.TYPES.JOIN_STATUS_ALREADY_IN_GROUP]:'已经在群中',
					}
					uni.showToast({
						icon:'none',
						title:this.$tc(tipList[res.data.status])
					})
				})
					
				}else{//个人名片
				// 检测好友关系
				uni.$chatKit.chat.checkFriend({
				  userIDList: [id],
				}).then(res=>{
					let {successUserIDList, failureUserIDList}=res.data
					if(successUserIDList&&successUserIDList.length!=0){
						let {relation}=successUserIDList[0]
						if(relation=='CheckResult_Type_NoRelation'||relation=='CheckResult_Type_BWithA'){
							this.toFriend({userID:id})
						}else{
							uni.navigateTo({
								url:`/pages/address/views/user/index?userID=${this.$setUserID(id)}`
							})
						}
					}
				});
					// this.toFriend({userID:id})
				}
			},
			toFriend({userID}){
				uni.navigateTo({
					url:`/pages/home/views/friendInfo/index?userID=${this.$setUserID(userID)}`
				})
			},
			navbarClick(e){
				this.touchCount ++
				// setTimeout(()=>{
					if(this.touchCount == 1){
						console.log('click...')
					}
					if(this.touchCount >= 2){
						console.log('dobule click...')
						this.handleNavbarDobuleClick()
					}
					this.touchCount = 0
					
					if (e.cancelable) {
					  e.preventDefault();
					}
				// }, 200)
			},
			handleNavbarDobuleClick() {
				this.$store.commit('setToTop', true)
			}
		}
	};
</script>

<style lang="scss" scoped>
	.page-box {
		background: #fdfdfd;
	}
	
	.main-box {
		 padding-bottom: var(--window-bottom);
	}
	
	.home-navbar {
		::v-deep {
			.u-navbar--fixed {
				z-index: 12;
			}
			.u-navbar__content {
				box-shadow: 0rpx 0rpx 0rpx white;
				// box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.04);
			}
		}
	}
	.home-search {
		box-shadow: 0rpx 1rpx 1rpx rgba(0, 0, 0, 0.04);
		z-index: 11;
	}

	.index {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;

		&-button {
			width: 180px;
			padding: 10px 40px;
			color: #fff;
			background-color: #006eff;
			font-size: 16px;
			margin-top: 65px;
			border-radius: 30px;
			text-align: center;
		}
	}

	.u-demo-block__title {
		padding: 10px 0 2px 15px;
	}

	.swipe-action {
		&__content {
			padding: 25rpx 0;

			&__text {
				font-size: 15px;
				color: $u-main-color;
				padding-left: 30rpx;
			}
		}
	}
	
	.camera {
		position: fixed;
		right: 0;
		bottom: 10vh;
		padding: 6px;
		color: #000;
		border: 1px solid #000;
		z-index: 100;
	}
</style>