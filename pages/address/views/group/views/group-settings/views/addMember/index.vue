<template>
	<ql-page ref="qlPage">
		{{ memberCount }}
		<ChangeGroupMemberPage :title="$tc('选择联系人')" :userList="userList" :allSelector="true"
			:submitBtnText="`${$tc('完成')}(${chooseList.length})`" @change="changeChooseList" @clickCancel="clickCancel"
			@clickSubmit="clickSubmit" />
	</ql-page>
</template>

<script>
	import ChangeGroupMemberPage from '@/components/change-group-member-page'
	import TUIChatEngine from "@tencentcloud/chat-uikit-engine";
	export default {
		components: {
			ChangeGroupMemberPage
		},
		data() {
			return {
				groupID: '',
				// userList: [],
				chooseList: [],
				TUIChatEngine,
				memberCount: 0,
				memberListLength: 0,
				memberList: [],
				friendList: [],
				myProfile: null
			};
		},
		onLoad(opt) {
			console.log('onLoad', this.$setUserID(opt.groupID), opt.memberCount)
			this.groupID = this.$setUserID(opt.groupID)
			this.memberCount = opt.memberCount
			this.getGroupMember()
			// let user = TUIChatEngine;
		},
		computed: {
			userList() {
				if(this.memberList.length==0) return []
				let userList = [];
				const memberIdList = this.memberList.map(member => member.userID)
				userList = this.friendList.filter(item => !memberIdList.includes(item.userID))
				let arr = [this.myProfile, ...userList]
				userList = arr.filter(item => item?.userID != this.TUIChatEngine.userID)
				return userList
			}
		},
		methods: {
			getFriendListAndgetMyProfile() {
				uni.$chatKit?.chat?.getFriendList().then(result => {
					let list = result.data.map(item => ({
						...item.profile,
						remark: item.remark || ''
					}))
					this.friendList = list;
				}).catch(err => {
					console.log(999, err)
				})
				uni.$chatKit?.chat?.getMyProfile().then(result1 => {
					this.myProfile = result1.data;
				})
			},
			async getGroupMember() {
				await this.getFriendListAndgetMyProfile()
				uni.$chatKit?.chat?.getGroupMemberList({
					groupID: this.groupID,
					offset: this.memberListLength,
					count: 1000
				}).then(result => {
					this.memberList = [...(this.memberListLength ? this.memberList : []), ...result.data.memberList];
					this.memberListLength += result.data.memberList.length
					if (this.memberListLength < this.memberCount) {
						this.getGroupMember()
					} else {
						// this.getUserList()
					}
				})
			},
			async getUserList() {
				// uni.$chatKit?.chat?.getFriendList().then(res=>{
				//  console.log(6666,res)
				// })
				// this.userList = this.memberList;
				try {
					uni.$chatKit?.chat?.getFriendList().then(result => {
						let list = result.data.map(item => ({
							...item.profile,
							remark: item.remark || ''
						}))
						const memberIdList = this.memberList.map(member => member.userID)
						this.userList = list.filter(item => !memberIdList.includes(item.userID))
						uni.$chatKit?.chat?.getMyProfile().then(result1 => {
							let arr = [result1.data, ...this.userList]
							this.userList = arr.filter(item => item.userID != this.TUIChatEngine
								.userID)
						})
					}).catch(err => {
						console.log(999, err)
					})
				} catch (e) {
					console.log('e', e)
					//TODO handle the exception
				}

			},
			changeChooseList(list) {
				this.chooseList = list
			},
			clickSubmit() {
				const params = {
					groupID: this.groupID,
					userIDList: this.chooseList.map(user => user.userID),
				}
				// return
				uni.$chatKit.chat.addGroupMember(params).then(res => {
					console.log('1111')
					this.toastText('添加成功', 'success', () => {
						uni.navigateBack({
							delta: 1,
						})
					})


				}).catch(err => {
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