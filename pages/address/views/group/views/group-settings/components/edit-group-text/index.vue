<template>
	<ql-page class="group-info-page">
		<u-navbar placeholder border autoBack :title="title" @clickLeft="BackPage" >
			<btn slot="right" w='180' h='80' shape='square' text="发布" @click="clickPublish" />
    </u-navbar>		
		<u--textarea v-model="notification" placeholder="请输入内容" class="textarea" />
    <confirmModal
			:show.sync="showConfirmModal"
      title="发布确认"
			:content="`发布该公告会通知全部群成员，是否发布？`"
			@confirm="confirmConfirmModal"
		/>
	</ql-page>
</template>

<script>
import btn from '@/components/btn'
import confirmModal from '@/components/confirm-modal'
export default {
	components: { btn, confirmModal },
  props: {
    pageType: {
      type: String, // notification | welcome
      required: true,
    },
    groupID: {
      type: String,
      required: true,
    },
  },
	data() {
		return {
      group: {},
      notification: '',
      showConfirmModal: false,
		};
	},
	onShow() {
    this.getGroup()
  },
  computed: {
    title() {
      let text = ''
      switch(this.pageType) {
        case 'notification':
          text = '群公告'
          break;
        case 'welcome':
          text = '入群欢迎'
          break; 
      }
      return text
    }
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
      const params = {
        groupID: this.groupID,
        notification: this.notification,
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
.group-info-page {
  .textarea {
  }
}
</style>