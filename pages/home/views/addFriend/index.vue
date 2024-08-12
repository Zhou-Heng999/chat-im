<template>
	<ql-page ref="qlPage" class="pd-box" >
		<u-navbar placeholder border autoBack :title="$tc('添加联系人')" @clickLeft="BackPage" ></u-navbar>
		<!-- <searchModal @onHanlderSearch='onHanlderSearch' ></searchModal> -->
		<view class="max-width">
			<u-search :placeholder="$tc('搜索')" @custom='BackPage' :actionText="$tc('取消')" :showAction='searchVal!=""' focus  v-model="searchVal"></u-search>
		</view>
		<!-- 搜索 -->
		<view class="flex-align h100 has-border" v-if="searchVal" @click="onSearchInput" >
			<u-icon name="search" class="mr-10" ></u-icon>
			{{searchVal}}
		</view>
		<view class="flex-column mt-20">
			<view class="flex-between pd-lr-20 pd-tb-20 has-border" v-for="item in peopleList" @click="toFriend(item)" >
				<view class="flex-align">
					<avatarModal :info='item' class="mr-10" ></avatarModal>
					<view class="flex-column flex-around-x">
						<text class="mb-10" >{{item.nick}}</text>
						<text class=" less-black font-22" >{{item.selfSignature}}</text>
					</view>
				</view>
				
				<btn :text="$tc('添加好友')" w='150' h='60' ></btn>
				
			</view>
		</view>
		
		<!-- <verify :isShow="isVerifyShow" ></verify> -->
	</ql-page>
</template>

<script>
export default {
	
	data() {
		return {
			peopleList:[],
			peopleInfo:null,
			searchVal:'',
			isVerifyShow:true,
			form:{
				remark: '小橙子',
				groupName: '好友',
				wording: '我是 user0',
			}
		};
	},
	methods: {
		onHanlderSearch(val){
			this.peopleList=[]
			if(val){
				 uni.$chatKit.chat.checkFriend({
				  userIDList: [val[0].userID],
				}).then(res=>{
					let {successUserIDList, failureUserIDList}=res.data
					if(successUserIDList&&successUserIDList.lenght!=0&&successUserIDList[0].relation=='CheckResult_Type_NoRelation'){
						this.peopleList=val
						this.peopleInfo=val[0]
					}else{
						console.log('已经是好友')
					}
					
				});
				
			}
		},
		onSearchInput(){
			let {searchVal}=this
			uni.$chatKit.chat.checkFriend({
			  userIDList: [ this.$setUserID(searchVal) ],
			}).then(res=>{
				let {successUserIDList, failureUserIDList}=res.data
				console.log('successUserIDList, failureUserIDList',successUserIDList, failureUserIDList)
				if(successUserIDList&&successUserIDList.length!=0){
					let {relation}=successUserIDList[0]
					if(relation=='CheckResult_Type_NoRelation'||relation=='CheckResult_Type_BWithA'){
						console.log('userID:searchVal',searchVal)
						this.toFriend({userID:searchVal})
					}else{
						uni.navigateTo({
							url:`/pages/address/views/user/index?userID=${searchVal}`
						})
					}
				}else{
					this.toastText(this.$tc('用户不存在'),'default')
				}
			});
		},
		toFriend({userID}){
			uni.navigateTo({
				url:`/pages/home/views/friendInfo/index?userID=${userID}`
			})
		},
		addFriend(){
			uni.$chatKit.chat.addFriend({
			  to: this.$setUserID(peopleInfo.userID),
			  ...this.form
			})
		},
	}
};
</script>
<style scoped lang="scss">
	
</style>