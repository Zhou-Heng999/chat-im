<template>
	<view class="message-video">
    <imageIcon @click="clickImage" v-if="messageItem.status === 'success'|| messageItem.progress === 1" :size='100' name='video-play' class="play_icon" />
	<view class="" style="position: relative;" @click="clickImage" >
		
    <ImageCache
      class="image"
      :src="messageItem.payload.snapshotUrl"
      style="max-width: 400rpx; max-height: 300rpx;"
      
    />
	<!-- <ImageCache
	  class="image"
	  :src="messageItem.payload.snapshotUrl"
	  :style="{ width: fixedSize.width + 'rpx', height: fixedSize.height + 'rpx' }"
	  
	/> -->
		</view>
    <MessageText
      v-if="content"
      class="cloud_custom_data"
      :messageItem="formatCloudMessageItem"
    />
  </view>
</template>

<script>
import MessageText from './message-text.vue';
import getContentFn from "../../utils/getContent";
	import ImageCache from '@/components/image-cache';
const maxSize = 300
export default {
  components: { MessageText,ImageCache },
  props: {
    messageItem: {
      type: Object,
      required: true,
    },
  },
  data() {
  	return {
	}
  },
  computed: {
    fixedSize() {
      const { snapshotWidth, snapshotHeight } = this.messageItem.payload
      const ratio = snapshotWidth / snapshotHeight
      return {
        width: ratio < 0 ? maxSize : (maxSize * ratio),
        height: ratio > 0 ? maxSize : (maxSize * ratio)
      }
    },
    content() {
	  	return getContentFn(this.messageItem)
	  },
    formatCloudMessageItem() {
      if (this.content) {
        return {
          ...this.messageItem,
          payload: {
            text: this.content.txt
          }
        }
      } else {
        return {}
      }
    }
  },
	methods: {
		clickImage() {
	  	getApp().globalData.videoUrl = this.messageItem.payload.videoUrl
	  	uni.navigateTo({
	  		url: `/pages/TUIKit/components/TUIChat/video-play`,
	  	});
	  }
	}
};
</script>
<style scoped lang="scss">
.message-video {
  .image {
    border-radius: 16rpx;
  }
  .play_icon {
    position: absolute;
    top: calc(50% - 50rpx);
    right: calc(50% - 50rpx);
    z-index: 1;
  }
  .cloud_custom_data {

  }
}
</style>