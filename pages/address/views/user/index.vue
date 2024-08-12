<template>
	<ql-page ref="qlPage" class="box-pd " v-if="userDetail" >
		<u-navbar placeholder border autoBack :title="$tc('好友详情')" style="z-index: 99;">
			<rightSelect v-if="userInfo.userID!=userDetail.userID" slot="right" iconName='tb_qt' :list='talkList' @clickItem='onClickItem' ></rightSelect>
		</u-navbar>
		<view class="flex-column flex-center mt-30 mb-20">
			<avatarModal class="mb-40" style="z-index: 10;" :info='userDetail' w='190' h='190' fontSize="56">
				 <image v-if="genderIcon[userDetail.gender]" slot="badge" class="gender" :src="`/static/images/${genderIcon[userDetail.gender] || ''}.png`" />
			</avatarModal>
			<text class="font-40 font-blod mb-10" >{{userDetail.remark||userDetail.nick}}</text>
			<view class="flex-align less-black font-24" @click="copyText($setUserID(userDetail.userID))">
				<text class="mr-10 font-28"  >ID：{{$setUserID(userDetail.userID)}}</text>
				<imageIcon src="/static/images/tb_fz3.png" class="ml-10" width="24rpx" height="24rpx"></imageIcon>
				<!-- <imageIcon name='tb_fz' ></imageIcon> -->
				<!-- <u-icon name="file-text" ></u-icon> -->
			</view>
		</view>
		
		<!-- 用户信息 -->
		<view class="max-width mb-100">
			<view class="h100 has-border pd-lr-20 flex-between font-32" v-for="item in userTip" @click="toEdit(item)" >
				<text class=" " >{{$tc(item.title)}}</text>
				<!-- <text>{{userDetail[item.type]}}</text> -->
				<view class="flex-align">
					<text class="value ellipsis1 less-black" v-if="item.type!='gender'" >{{userDetail[item.type]}}</text>
					<text v-else >{{$tc(genderList[userDetail[item.type]])}}</text>
					
					<u-icon v-if='item.isNeedIcon'  name='arrow-right'></u-icon>
				</view>
				
			</view>
		</view>
		
		<!-- 聊天或者分享 -->
		<view class="flex-column flex-center" v-if="userInfo.userID!=userDetail.userID">
			<btn :text="$tc('发送消息')" class="mb-40" @click="toChat(userID,chatType)" ></btn>
			<!-- <btn text='分享联系人' class="" btnType='info' ></btn> -->
		</view>
		<!-- 用户信息 -->
		<verify :title="$tc('设置备注')" :defaultVal='userDetail.remark' :maxLength="20" :isShow="isShowVerify" @closeModal='isShowVerify=false' @confirm='updateFriend' ></verify>
		<confirmModal :show="isSelfSignatureShow" :title="$tc('个性签名')" :content="selfSignatureText" :showCancelButton="false" @confirm="isSelfSignatureShow=false"/>
	</ql-page>
</template>

<script>
	import confirmModal from '@/components/confirm-modal/index'
	import rightSelect from '@/components/right-select/index'
	import verify from '@/pages/home/components/verify/index.vue'
	import {
	  TUITranslateService,
	  TUIConversationService,
	  TUIStore,
	  StoreName,
	} from "@tencentcloud/chat-uikit-engine";
export default {
	components: {
		confirmModal,
		rightSelect,
		verify
	},
	data() {
		return {
			// userInfo:null,
			userDetail:null,
			isShowVerify:false,
			isSelfSignatureShow: false,
			selfSignatureText: '',
			userID:null,
			talkList: [{
					title: '加入黑名单',
					icon: 'account-fill',
					type: 'black',
					imageUrl:'tb_jrhmd'
				},
				{
					title: '删除联系人',
					icon: 'account-fill',
					type: 'dele',
					imageUrl:'tb_sc_red',
					cls:'red-color'
				},
			],
			userTip:[
				{title:'昵称',type:'nick'},
				{title:'备注名',type:'remark',isNeedIcon: true},
				{title:'性别',type:'gender'},
				{title:'个性签名',type:'selfSignature',isNeedIcon: true},
			],
			chatType:'',
			genderList: {
			  [uni.$chatKit.TUIChatEngine.TYPES.GENDER_UNKNOWN]: '', // 未设置性别
			  [uni.$chatKit.TUIChatEngine.TYPES.GENDER_FEMALE]: '女', // 女性
			  [uni.$chatKit.TUIChatEngine.TYPES.GENDER_MALE]: '男', // 男性
			},
			genderIcon: {
			  [uni.$chatKit.TUIChatEngine.TYPES.GENDER_UNKNOWN]: '', // 未设置性别
			  [uni.$chatKit.TUIChatEngine.TYPES.GENDER_FEMALE]: 'tb_nv2', // 女性
			  [uni.$chatKit.TUIChatEngine.TYPES.GENDER_MALE]: 'tb_nan2', // 男性
			}
		};
	},
	onShow() {
		// if (this.userID === this.userInfo.userID) {
		//   this.genderIcon = {
		//     [uni.$chatKit.TUIChatEngine.TYPES.GENDER_UNKNOWN]: 'tb_xbxz', // 未设置性别
		//     [uni.$chatKit.TUIChatEngine.TYPES.GENDER_FEMALE]: 'tb_nv2', // 女性
		//     [uni.$chatKit.TUIChatEngine.TYPES.GENDER_MALE]: 'tb_nan2', // 男性
		//   };
		// }else{
		// 	this.genderIcon = {
		// 		[uni.$chatKit.TUIChatEngine.TYPES.GENDER_UNKNOWN]: '', // 未设置性别
		// 		[uni.$chatKit.TUIChatEngine.TYPES.GENDER_FEMALE]: 'tb_nv2', // 女性
		// 		[uni.$chatKit.TUIChatEngine.TYPES.GENDER_MALE]: 'tb_nan2', // 男性
		//   };
		// }
	},
	onLoad(opt) {
		let {userID,chatType='C2C'}=opt
		this.userID=this.$setUserID(userID)
		// this.userInfo = uni.getStorageSync('userInfo')
		// console.log('uni.getStorageSync()....',this.userInfoData);
		
		this.chatType='C2C'
		this.getUser()
	},
	methods: {
		async  onClickItem({type}){
			let {userID}=this
			if(type=='dele'){//删除
				uni.$chatKit.chat.deleteFriend({
					userIDList: [userID],
					type:uni.$chatKit.TUIChatEngine.TYPES.SNS_DELETE_TYPE_SINGLE
				}).then(res=>{
					this.toastText('删除成功','success',()=>{
						uni.navigateBack()
					})
				})
			}else{//拉黑
			let userInfoData = uni.getStorageSync('userInfo')
		 await	this.$http.app_user.pre_addblack({
				from_account:userInfoData.userID,
				to_account:userID
			})
				uni.$chatKit.chat.addToBlacklist({userIDList: [userID]}).then(res=>{
					this.toastText('已拉黑','success',()=>{
						uni.navigateBack()
					})
				})
			}
		},
		toEdit({
			type
		}) {
			if (type == 'remark') {
				this.isShowVerify=true
				// this.updateFriend()
			}
			if (type == 'selfSignature') {
				this.selfSignatureText = this.userDetail[type] || this.$tc('暂无数据')
				this.isSelfSignatureShow=true
				// this.updateFriend()
			}
		},
		updateFriend(val) {
			let {
				userID
			} = this
			if(!val)return
			uni.$chatKit.chat.updateFriend({
				userID: userID,
				remark: val
			}).then(res => {
				this.toastText('修改成功')
				this.getUser()
				uni.$emit('updateRemark')
				
				//及时更新会话列表备注
				let data = {
					userID: userID,
					remark: val
				}
				uni.$emit('changConversationRemark',data)
			}).catch(err=>{
			})
		},
		// 获取好友详情
	   async	getUser(){
			let {userID}=this
			let nowDetail=null
		await	uni.$chatKit?.chat?.getFriendList().then(res=>{
				let list=res.data
				nowDetail=list.find(item=>item.userID==userID)
			})
		await	uni.$chatKit?.chat?.getUserProfile({
				userIDList:[userID]
			}).then(res=>{
				let info=res.data[0]
				info.remark=nowDetail?.remark
				this.userDetail=info
				console.log('this.userDetail...',this.userDetail);
			})
		},
	}
};
</script>
<style scoped lang="scss">
	.value {
		flex: 1;
		text-align: right;
		width: 500rpx;
	}
	.gender {
	  width: 42rpx;
	  height: 42rpx;
	}
</style>