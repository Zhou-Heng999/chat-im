<template>
  <view class="message_file">
    <view class="file" @click="clickFile">
      <imageIcon
        class="icon"
        :size='92'
        :name="iconName"
      />
      <view class="right">
        <view class="name ellipsis1">{{ messageItem.payload.fileName }}</view>
        <view :class="['size', `size_${messageItem.flow}`]">{{ showSize }}</view>
      </view>
    </view>
    <MessageText
      v-if="content"
      class="cloud_custom_data"
      :messageItem="formatCloudMessageItem"
    />
  </view>
</template>
<script>
import { fileType } from "@/const";
import MessageText from './message-text.vue';
import getContentFn from "../../utils/getContent";
export default {
  components: { MessageText },
  props: {
    messageItem: {
      type: Object,
      required: true,
    },
  },
  computed: {
    iconName() {
      const fileExtension = this.getFileExtension(this.messageItem.payload.fileUrl);

      for (const mapping of fileType) {
        if (mapping.arr.includes(fileExtension)) {
          return mapping.icon;
        }
      }

      return 'tb_others'; 
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
    },
    showSize() {
      const size = this.messageItem.payload.fileSize
      let t = "";
		  return t = size >= 1048576 ? `${(size/1048576).toFixed(2)} Mb` : size >= 1024 ? `${(size/1024).toFixed(2)} Kb` :
		  	`${size.toFixed(2)}B`, t
      }
  },
  methods: {
    getFileExtension(filePath) {
      const parts = filePath.split('.');
      return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    },
    clickFile() {
	    let dataInfo = {
	    	content: {
          url: this.messageItem.payload.fileUrl,
          size: this.showSize,
          showName: this.messageItem.nameCard || this.messageItem.nick,
          name: this.messageItem.payload.fileName
        },
	    	messageItem: this.messageItem
	    }

	    uni.setStorageSync('files', dataInfo)
	    uni.navigateTo({
	    	url: '/pages/home/views/downLoad/index'
	    })
    },
  }
}
</script>
<style lang="scss" scoped>
.message_file {
  .file {
    display: flex;
    .icon {

    }
    .right {
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-left: 10rpx;
      max-width: 300rpx;
      .size {
        
		    font-size: 24rpx;

        &.size_in {
          color: #979c9a;
          
        }
        &.size_out {
          color: #4285f6;

        }
      }
    }
  }
  .cloud_custom_data {

  }
}
</style>