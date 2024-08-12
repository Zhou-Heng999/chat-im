<template>
	<ql-page ref="qlPage">
		<ChangeGroupMemberPage :title="$tc('删除成员')" :userList="userList"
			:submitBtnText="`${$tc('确定')}(${chooseList.length})`" @change="changeChooseList" @clickCancel="clickCancel"
			@clickSubmit="clickSubmit" />
		<confirmModal :show.sync="showConfirmModal" :content="`${$tc('确定要删除选中的')}${chooseList.length}${$tc('位成员吗？')}`"
			@confirm="confirmConfirmModal" />
	</ql-page>
</template>

<script>
	import confirmModal from '@/components/confirm-modal'
	import ChangeGroupMemberPage from '@/components/change-group-member-page'
	export default {
		components: {
			confirmModal,
			ChangeGroupMemberPage
		},
		data() {
			return {
				groupID: '',
				showConfirmModal: false,
				userList: [],
				chooseList: [],
				groupInfo:null,
				filterRole:[],
				allUserList:[],
				offset:0
			};
		},
		onLoad(opt) {
			this.groupID = this.$setUserID(opt.groupID)
			this.getGroupProfile()
			// this.getUserList()
		},
		methods: {
			getGroupProfile(){
				uni.$chatKit?.chat?.getGroupProfile({
					groupID: this.groupID
				}).then(result2 => {
					console.log('result2',result2)
					let filterRole = []
					if (result2.data?.group?.selfInfo?.role === uni.$chatKit.TUIChatEngine.TYPES
						.GRP_MBR_ROLE_OWNER) {
						filterRole = [uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER]
					} else {
						// 不是群主就是管理员		
						filterRole = [uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER, uni.$chatKit
							.TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN
						]
					}
					console.log('filterRole',filterRole)
					console.log('result2.data',result2.data)
					this.filterRole=filterRole
					this.groupInfo=result2.data.group
					this.getUserList()
					// this.userList = result1.data.memberList.filter(item => !filterRole.includes(item.role))
				})
			},
			getUserList() {
				let {filterRole,groupInfo,offset}=this
				uni.$chatKit?.chat?.getGroupMemberList({
					groupID: this.groupID,
					offset,
				}).then(result1 => {
					let {memberList}=result1.data
					let resOffset=result1.data.offset
					if(resOffset!=0){
						this.offset=resOffset
						this.getUserList()
					}
					this.allUserList=[...this.allUserList,...memberList]
					this.userList = this.allUserList.filter(item => !filterRole.includes(item.role))
				})
			},
			changeChooseList(list) {
				this.chooseList = list
			},
			clickSubmit() {
				this.showConfirmModal = true
			},
			confirmConfirmModal() {
				this.showConfirmModal = false
				const params = {
					groupID: this.groupID,
					userIDList: this.chooseList.map(user => user.userID),
				}
				uni.$chatKit.chat.deleteGroupMember(params).then(res => {
					
					this.toastText('删除成功','success',()=>{
						uni.navigateBack({
							delta: 1,
						})
					})
				}).catch(err=>{
					uni.navigateBack({
						delta: 1,
					})
				})
			},
			clickCancel() {
				uni.navigateBack({
					delta: 1,
				})
			},
		}
	};
</script>
<style scoped lang="scss">

</style>