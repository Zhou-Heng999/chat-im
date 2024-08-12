<template>
  <u-modal
    :show="show"
    :title="$tc('发送给：')"
    :confirmText="$tc('发送')"
    :cancelText="$tc('取消')"
    :showCancelButton="true"
    class="modal-repost-message"
    :asyncClose="true"
    @confirm="confirm"
    @cancel="cancel"
    @close="close"
  >
		<view class="content">
      <infoOption
        v-if="userList.length === 1"
        :info="userList[0]"
        class="info-option"
      >
        <!-- <imageIcon slot="tr" name="an_jty" size="20" /> -->
      </infoOption>
      <scroll-view v-else scroll-x="true" class="avatars pd-lr-30 flex-align">
				<avatar
          v-for="user in userList"
          :key="user.userID"
          :info="user"
          w="96"
          h="96"
          class="mg-lr-30 scroll-view-item_H"
        />
			</scroll-view>
      <div class="mg-tb-40 pd-lr-40 message-show flex-center">
        <imageIcon width="300rpx" height="300rpx" :src="url" />
      </div>

      <u--input
        v-model="remark"
        :placeholder="$tc('给朋友留言')"
        border="surround"
        class="remark-input"
      />
		</view>
	</u-modal>
</template>

<script>
import avatar from '@/components/avatar'
import imageIcon from '@/components/image-icon'
import infoOption from '@/components/info-option'
export default {
  components: { imageIcon, infoOption, avatar },
  props: {
    url: {
      type: String,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
    userList: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      remark: ''
    }
  },
  methods: {
    confirm() {
      this.$emit('clickSend', this.remark)
    },
    cancel() {
      this.$emit('update:show', false)
    },
    close() {
      this.$emit('update:show', false)
    },
  }
}
</script>

<style scoped lang="scss">
.modal-repost-message {
  ::v-deep {
    .u-popup__content {
      .u-modal__title {
        padding: 30rpx 35rpx 0rpx 35rpx;
        height: 60rpx;
        line-height: 60rpx;
        text-align: left;
      }
      .u-modal__content {
        padding: 0rpx;
        .content {
          width: 100%;
        }
      }
    }
  }
  .content {
    .avatars {
	  	display: flex;
	  	align-items: center;
	  	width: 100%;
      height: 112rpx;
      overflow-x: scroll;
	  	white-space: nowrap;
	  	.scroll-view-item_H {
	  		overflow: hidden;
	  		display: inline-block;
	  	}
	  }

    .message-show {
      ::v-deep {
        .u-image {
          margin: auto;
        }
      }
    }

    .remark-input {
      margin: 30rpx;
      padding: 0rpx 20rpx;
      height: 80rpx;
      background-color: #f5f5f5;
      border-radius: 20rpx;
    }
  }

}
</style>