<template>
	<view>
		<ChangeGroupMemberPage
			:title="$tc('选择管理员')"
			:userList="userList"
			:submitBtnText="`${$tc('完成')}(${chooseList.length})`"
			@change="changeChooseList"
			@clickCancel="clickCancel"
			@clickSubmit="clickSubmit"
		/>
    <confirmModal
			:show.sync="showConfirmModal"
			:content="`${$tc('确定要添加选中的')} ${chooseList.length} ${$tc('位成员吗？')}`"
			@confirm="confirmConfirmModal"
		/>
	</view>
</template>

<script>
import confirmModal from '@/components/confirm-modal'
import ChangeGroupMemberPage from '@/components/change-group-member-page'
export default {
  components: { confirmModal, ChangeGroupMemberPage },
	data() {
		return {
      groupID: '',
	  groupOffset:0,
      existCount: '',
			showConfirmModal: false,
			userList:[],
			chooseList:[],
		};
	},
	onLoad(opt) {
		let {
			groupID,
			existCount
		} = opt
		this.groupID = groupID
		this.existCount=+existCount
		this.getUserList()
	},
	methods: {
    getUserList(offset=0) {
		  uni.$chatKit?.chat?.getGroupMemberList({
        groupID: this.groupID,
        offset,
      }).then(result => {
		  let list=result.data.memberList.filter(user => user.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_MEMBER)
		  if(result.data.offset!=0){
			  this.getUserList(result.data.offset)
		  }
        this.userList = [...this.userList,...list]
      })
    },
		changeChooseList(list) {
			this.chooseList = list
		},
		clickSubmit() {
			if ((this.existCount + this.chooseList.length) > 10) {
				uni.showToast({
					title: this.$tc('管理员人数已达上限'),
					icon: 'none'
				})
				// this.$message({ message: '管理员人数已达上限' })
			} else {
				this.showConfirmModal = true
			}
		},
    confirmConfirmModal() {
			this.showConfirmModal = false
      Promise.all(this.chooseList.map(async (user) => {
				const result = await uni.$chatKit.chat.setGroupMemberRole({
					groupID: this.groupID,
					userID: user.userID,
					role: uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN
				})
				return result
			})).then(result => {
				uni.navigateBack({
			    delta: 1,
	  	  })
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