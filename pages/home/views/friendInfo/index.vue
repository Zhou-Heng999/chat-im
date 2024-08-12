<template>
	<ql-page ref="qlPage" class="pd-box flex-column " >
		<u-navbar placeholder border autoBack :title="$tc('在线')" @clickLeft="BackPage" ></u-navbar>
		<view class="flex-center mt-60 flex-column" v-if="peopleInfo" >
			<avatarModal class="mb-40" :info='peopleInfo' w='190' h='190' ></avatarModal>
			<text class="font-40 font-blod mb-20" >{{peopleInfo.nick}}</text>
			<text class="less-black" >{{peopleInfo.selfSignature}}</text>
			
			<btn v-if="isBlack" :text="$tc('移除黑名单')" class="mt-60" @click="removeBlack" ></btn>
			<btn v-else :text="$tc('添加')" class="mt-60" @click="onAdd" ></btn>
		</view>
		
		
		<verify :isShow="isVerifyShow" @closeModal='isVerifyShow=false' :defaultVal='userNick'  @confirm='addFriend' ></verify>
	</ql-page>
</template>

<script>
	import verify from '../../components/verify/index.vue'
	import {
	  TUIStore,
	  StoreName,
	} from "@tencentcloud/chat-uikit-engine";
export default {
	components:{
		verify
	},
	data() {
		return {
			peopleInfo:null,
			isVerifyShow:false,
			form:{
				remark: '',
				groupName: '',
				wording: '',
			},
			userNick:'',
			isBlack: false, //是否在黑名单里
		};
	},
	onLoad(opt) {
		this.userID=this.$setUserID(opt.userID)
		this.getInfo()
		this.getBlackList()
		this.getMyData()
	},
	methods: {
		getMyData(){
		uni.$chatKit.chat.getMyProfile().then(res=>{
			this.userNick=this.$tc('我是') + " " +res.data.nick
		})	
		},
		getInfo(){
			let {userID}=this
			uni.$chatKit.chat.getUserProfile({
				userIDList:[userID]
			}).then(res=>{
				let info=res.data[0]
				this.peopleInfo=info
			})
		},
		addFriend(val){
			let {peopleInfo,userID}=this
			this.form.wording=val
			uni.$chatKit.chat.addFriend({
			  to: userID,
			  source:'AddSource_Type_Search',
			  ...this.form
			}).then(res=>{
				this.isVerifyShow=false
				this.toastText('已发送好友申请','success',()=>{
					uni.navigateBack()
				})
				//发送打招呼消息
				this.sendFirstMsg(userID)
				
			}).catch(err=>{
				let that = this
				console.log('addFriend...', err)
				if(JSON.stringify(err)) {
					const e = JSON.parse(JSON.stringify(err))
					if(e.message === 'Err_SNS_FriendAdd_Forbid_By_Admin')  {
						uni.showToast({
							title: that.$tc('您没有添加好友权限'),
							duration: 2000
						})
					}
				}
			})
		},
		getBlackList(){
			TUIStore.watch(StoreName.USER, {
			  userBlacklist: (userBlacklist) => {
				  let idx = userBlacklist.findIndex(item=>item.userID==this.userID)
				  console.log(idx)
				  this.isBlack = idx!=-1
				  console.log(userBlacklist,this.userID)
			  },
			});
		},
		removeBlack(){
			uni.$chatKit.chat.removeFromBlacklist({
				userIDList: [this.userID]
			}).then(res=>{
				this.toastText('已移除')
			})
		},
		onAdd() {
			const allow = this.canAddUser()
			if(allow == false) {
				uni.showToast({
					title: this.$tc('您没有添加好友权限'),
					duration: 2000
				})
				return
			}
			
			this.isVerifyShow = true
		},
	}
};
</script>
<style scoped lang="scss">
	
</style>