<template>
	<ql-page class="pd-box pd-safe" >
		<view class="top-view" ></view>
	<view class="max-width">
		<u-search :placeholder="$tc('搜索')" focus v-model="keyword" :actionText="$tc('取消')" @custom='BackPage' ></u-search>
		<view class="flex-column max-width mt-30">
			<infoModal class="mb-10" v-for="item in searchList" :isFriend="true" :info="item.profile" @click="jumpChat(item)" ></infoModal>
		</view>
		<!-- <u--textarea v-model="value1" :placeholder="`请在此处粘贴推荐的客户信息，实例：\n客户姓名：***\n客户电话：17512345678\n客户性别：男\n备注信息：这是备注`" ></u--textarea> -->
		<!-- {{searchList}} -->
	</view>
	</ql-page>
</template>

<script>
	import infoModal from '@/components/info-option/index.vue'
export default {
	components:{
		infoModal
	},
	data() {
		return {
			keyword:'',
			value1:'\n客户姓名：\n客户电话：17512345678\n客户性别：男\n备注信息：这是备注',
			userList:[],
			groupList:[]
		};
	},
	computed:{
		searchList(){
			let {userList,keyword,groupList}=this
			if(!keyword)return []
			list = []
			let list = userList.concat(groupList)
			// console.log('listlist', list);
			const result = this.filterSearch(keyword,list)
			// const result = list.filter(item => {
			//   // 检查昵称或备注是否包含关键字
			// 	if(!item.profile.remark){
			// 		item.profile.remark = item.remark
			// 	}
			//   return item.profile.nick.includes(keyword) || (item.remark && item.remark.includes(keyword))||(item.profile.userID && item.profile.userID.includes(keyword));
			// });
			// console.log('result', result);
			  return result;
		}
	},
	onLoad() {
		this.getFriends()
		this.getGroups()
	},
	methods: {
		getFriends(){
			uni.$chatKit?.chat?.getFriendList().then(res=>{
				let list=res.data
				console.log('userList',list)
				this.userList=list
			})
		},
		getGroups(){
			uni.$chatKit?.chat?.getGroupList().then(result => {
				let list = result.data.groupList
				list.forEach(item=>{
					item.profile = {
						userID: item.groupID,
						nick: item.name,
						avatar: item.avatar
					}
				})
				this.groupList = list
			})
		},
		jumpChat(item){
			if(item.userID){
				this.toChat(item.profile.userID)
			}else {
				this.toChat(item.profile.userID, uni.$chatKit.TUIChatEngine.TYPES.CONV_GROUP)
			}
		}
	}
};
</script>
<style scoped lang="scss">
	.top-view{
		height: var(--status-bar-height);
	}
</style>