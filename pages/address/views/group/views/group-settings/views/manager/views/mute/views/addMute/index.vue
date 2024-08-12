<template>
	<view>
		<ChangeGroupMemberPage :title="$tc('禁言管理')" :userList="userList"
			:submitBtnText="`${$tc('确定')}(${chooseList.length})`" @change="changeChooseList" @clickCancel="clickCancel"
			@clickSubmit="clickSubmit" />
		<confirmModal :show.sync="showConfirmModal" :content="`${$tc('确定要禁言选中的')} ${chooseList.length} ${$tc('位成员吗？')}`"
			@confirm="confirmConfirmModal" />
	</view>
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
				list: [],
				groupID: '',
				existCount: '',
				showConfirmModal: false,
				userList: [],
				chooseList: [],
				offset: 0,
				allUserList: [],
			};
		},
		onLoad(opt) {
			let {
				groupID,
				existCount
			} = opt
			this.groupID = groupID
			console.log('groupID1111...', this.groupID);
			this.existCount = +existCount
			this.getUserList()
		},
		methods: {
			getUserList() {
				let {
					offset
				} = this
				uni.$chatKit?.chat?.getGroupMemberList({
					groupID: this.groupID,
					offset,
				}).then(result => {
					const timestamp = +((+new Date()).toString().substring(0, 10))
					let resOffset = result.data.offset
					if (resOffset != 0) {
						this.offset = resOffset
						this.getUserList()
					}
					let list = result.data.memberList.filter(user => user.muteUntil < timestamp && user.role !==
						uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER &&
						user.role !== uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN)
					this.allUserList = [...this.allUserList, ...list]

					this.userList = this.allUserList.filter(item => item.userID != this.userInfo.userID)
				})
			},
			changeChooseList(list) {
				this.chooseList = list
			},
			clickSubmit() {
				this.showConfirmModal = true
			},
			forbidSendMsg(list) {
				// let idList = JSON.stringify(list)
				// console.log('idList...',idList);
				this.$http.chat_group_member.forbid_send_msg({
					groupId: this.groupID,
					list: list,
					muteTime: 999999999,
				}).then(res => {
					console.log('回调给后台',res);
				}).catch(err => {
					console.log('回调给后台失败', err);
				})
			},
			confirmConfirmModal() {
				this.showConfirmModal = false
				Promise.all(this.chooseList.map(async (user) => {
					const result = await uni.$chatKit.chat.setGroupMemberMuteTime({
						groupID: this.groupID,
						userID: user.userID,
						muteTime: 60 * 60 * 24 * 30
					})
					console.log('user.userID', user.userID);
					this.list.push(user.userID)
					return result
				})).then(result => {
					uni.navigateBack({
						delta: 1,
					})
					console.log(this.list);
					this.forbidSendMsg(this.list)
					this.list = []
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