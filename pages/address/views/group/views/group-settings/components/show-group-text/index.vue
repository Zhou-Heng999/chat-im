<template>
	<ql-page class="show-group-text-page">
		<u-navbar placeholder border autoBack :title="title" @clickLeft="BackPage">
			<imageIcon v-if="isOwner || isAdmin" slot="right" name="tb_bj" @click="clickTbBj" />
		</u-navbar>		
		<infoOption
      :info="group"
			:type="infoOptionType"
      :headSize="110"
			trText="2023-08-09"
			blText="群主"
      class="mb-10 info-option"
    />
		<view class="content">{{ content || '-' }}</view>
		<view class="flex-center bottom-content">
			<btn v-if="isOwner || isAdmin" text="删除" btnType="error" @click="clickDelete" />
			<view v-else class="tip">仅群主及管理员可编辑</view>
		</view>
	</ql-page>
</template>

<script>
import btn from '@/components/btn'
import infoOption from '@/components/info-option'
import imageIcon from '@/components/image-icon'
export default {
  components: { infoOption, btn, imageIcon },
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
			infoOptionType: uni.$chatKit.TUIChatEngine.TYPES.CONV_GROUP,
			group: {
				selfInfo: {}
			}
		};
	},
	computed: {
    isOwner() {
      return this.group.selfInfo.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER
    },
    isAdmin() {
      return this.group.selfInfo.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN
    },
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
    },
    content() {
      let text = ''
      switch(this.pageType) {
        case 'notification':
          text = this.group.notification
          break;
        case 'welcome':
          text = this.group.groupCustomField.welcome
          break; 
      }
      return text
    },
	},
  onShow() {
    this.getGroup()
  },
	methods: {
    getGroup() {
      uni.$chatKit?.chat?.getGroupProfile({ groupID: this.groupID }).then(result => {
		  	this.group = result.data.group
		  })
    },
		clickTbBj() {
			uni.navigateTo({
				url: `/pages/address/views/group/views/group-settings/views/notification/views/editNotification/index?groupID=${this.groupID}`
			})
		},
    clickDelete() {

    },
	}
};
</script>
<style scoped lang="scss">
.show-group-text-page {
	.info-option {
    height: 150rpx;
  }
	.content {
		padding: 30rpx;
		font-size: 30rpx;
		background: $colorF;
	}
	.bottom-content {
		flex: 1;
		.tip {
			font-size: 28rpx;
			color: $grayFont;
		}
	}
}
</style>