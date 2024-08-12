<template>
	<ql-page class="edit-notification-page">
		<u-navbar placeholder border autoBack :title="$tc('群公告')" @clickLeft="BackPage" >
			<btn slot="right" w='100' h='50' shape='square' :text="$tc('发布')" @click="clickPublish" />
    </u-navbar>		
		<u--textarea maxlength='130' v-model="notification" :placeholder="$tc('请输入内容')" class="textarea" height="300px" />
    <confirmModal
			:show.sync="showConfirmModal"
      :title="$tc('发布确认')"
			:content="$tc(`发布该公告会通知全部群成员，是否发布？`)"
			@confirm="confirmConfirmModal"
		/>
	</ql-page>
</template>

<script>
import btn from '@/components/btn'
import confirmModal from '@/components/confirm-modal'
import { ListMixin } from '@/mixin/list';
import store from "@/store/index.js"
export default {
	components: { btn, confirmModal },
	data() {
		return {
      groupID: '',
      group: {},
      notification: '',
      showConfirmModal: false,
		};
	},
	onLoad(opt) {
		this.groupID = opt.groupID;
	},
	onShow() {
    this.getGroup()
  },
	methods: {
    getGroup() {
      uni.$chatKit?.chat?.getGroupProfile({ groupID: this.groupID }).then(result => {
		  	this.group = result.data.group
        this.notification = this.group.notification
		  })
    },
    clickPublish() {
      this.showConfirmModal = true
    },
    confirmConfirmModal() {
		let a = ListMixin.methods.maskSensitiveInfo(this.notification,store.state.sensitiveData)
      const params = {
        groupID: this.groupID,
        notification: a,
      }
      this.showConfirmModal = false
      uni.$chatKit?.chat?.updateGroupProfile (params).then(result => {
		  	uni.navigateBack({
		  	  delta: 2,
	    	})
		  })
    },
	}
};
</script>
<style scoped lang="scss">
.edit-notification-page {
  .textarea {
  }
}
</style>