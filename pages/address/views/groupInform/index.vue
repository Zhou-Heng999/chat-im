<template>
	<ql-page class="group-inform-page">
		<u-navbar placeholder border autoBack :title="$tc('群通知')" @clickLeft="BackPage" ></u-navbar>
		<scroll-view v-if="applicationList.length > 0" scroll-y="true" class="application-list">
			<apply
				v-for="(application, index) in applicationList"
				:key="index"
				:application="application"
				@clickInfo="clickInfo(application)"
				@clickAgree="clickAgree111(application)"
				@clickReject="clickReject(application)"
			/>
		</scroll-view>
		<noData v-else :text="$tc('暂无新通知')" image="tb_lb" />
	</ql-page>
</template>

<script>
import noData from '@/components/noData'
import apply from './components/apply/index'
export default {
	components: { apply, noData },
	data() {
		return {
			applicationList: [],
		};
	},
	onLoad(option) {
		
	},
	onShow() {
		this.getGroupApplicationList()
	},
	methods: {
		getGroupApplicationList() {
			uni.$chatKit?.chat?.getGroupApplicationList().then(result => {
				this.applicationList = result.data.applicationList
				
				const eventChannel = this.getOpenerEventChannel()
				eventChannel.emit('handleGroupApplication', { amount: this.applicationList.length });
		  })
		},
		clickInfo(application) {
			uni.setStorage({
				key: 'group_application',
				data: {
          application,
        }
			})
			uni.navigateTo({
				url:`/pages/address/views/groupInform/views/groupApplyDetail/index`
			})
		},
		async clickAgree111(application) {
			
			const params = {
				handleAction: 'Agree',
				groupID: application.groupID,
				application,
			}
			uni.$chatKit?.chat?.handleGroupApplication(params).then(result => {
				// const message = uni.$chatKit?.chat.createCustomMessage({
      	//   to: application.groupID,
      	//   conversationType: uni.$chatKit.TUIChatEngine.TYPES.CONV_GROUP,
      	//   payload: {
				// 		data: '热烈欢迎热烈欢迎',
				// 		description: 'welcome',
				// 		extension: 'welcome',
				// 	},
      	// })
				// uni.$chatKit?.chat.sendMessage(message)
				this.getGroupApplicationList()
		  })
		},
		clickReject(application) {
			const params = {
				handleAction: 'Reject',
				application,
			}
			uni.$chatKit?.chat?.handleGroupApplication(params).then(result => {
				this.getGroupApplicationList()
		  })
		},
	}
};
</script>
<style scoped lang="scss">
.group-inform-page {
	height: 100vh;
	.application-list {
		flex: 1;
		overflow: scroll;
	}
}
</style>