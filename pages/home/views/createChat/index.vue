<template>
	<ChangeGroupMemberPage
		:title="$tc('发起群聊')"
		:userList="userList"
		:submitBtnText="`${$tc('完成')}(${chooseList.length})`"
		:allSelector="true"
		@change="changeChooseList"
		@clickCancel="clickCancel"
		@clickSubmit="clickSubmit"
	/>
</template>

<script>
import ChangeGroupMemberPage from '@/components/change-group-member-page'
export default {
  components: { ChangeGroupMemberPage },
	data() {
		return {
			userList:[],
			chooseList:[],
		};
	},
	created() {
    this.getUserList()
	},
	methods: {
    getUserList() {
		  uni.$chatKit?.chat?.getFriendList().then(result => {
		  	this.userList = result.data.map(item => ({
          ...item.profile
        }))
        console.log('this.userList =', this.userList)
		  })
    },
		changeChooseList(list) {
			this.chooseList = list
		},
		clickSubmit() {
			const allow = this.canCreateGroup()
			// if(allow == false) {
			// 	uni.showToast({
			// 		title: '您没有创建群聊权限',
			// 		duration: 2000
			// 	})
			// 	return
			// }
			uni.setStorage({
				key: 'create_chat_user_list',
				data: this.chooseList
			})
			uni.navigateTo({
				url:`/pages/home/views/createChat/views/createInfo/index`
			})
		},
		clickCancel(){
			uni.navigateBack({
			  delta: 1,
	  	})
		},
	}
};
</script>
<style scoped lang="scss">

</style>