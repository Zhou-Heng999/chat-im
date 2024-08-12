<template>
  <div class="merger-box flex-column flex-between" @click='downloadMergerMessage(messageItem)'>
		<view class="flex-align fon-28 mb-10 max-width">
			{{$tc('聊天记录')}}
		</view>
		<view class="flex top-box max-width less-black flex-column u-line-1">
			<view class="mb-10 font-24 u-line-1" v-for="(item,index) in messageItem.payload.abstractList" v-if="index<3" >{{ handleItem(item)}}</view>
		</view>
	</div>
</template>
<script>
import TUIChatEngine from "@tencentcloud/chat-uikit-engine";
export default {
  props: {
    messageItem: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {}
  },
  methods: {
    async downloadMergerMessage(messageItem) {
	  	let messageList = null
		console.log('messageItem===',messageItem)
	  	if (messageItem.payload.downloadKey != '') {
	  		await TUIChatEngine.chat.downloadMergerMessage(messageItem).then(res => {
				console.log(res)
	  			messageList = res.payload.messageList
	  		})
	  	} else {
	  		messageList = messageItem.payload.messageList
	  	}
		messageList.forEach(item=>item.conversationID=messageItem.conversationID)
	  	getApp().globalData.mergerTitle=messageItem.payload.title
	  	getApp().globalData.mergerAllList = messageItem
	  	getApp().globalData.mergerList = messageList
	  	uni.navigateTo({
	  		url: '/pages/home/views/merger/index',
	  	})

	  },
    handleItem(item) {
	  	let msg = this.removeTip(item);
	  	let newContent = msg.replace(/\[消息\]/g, this.$tc('[消息]'))
	  	  .replace(/\[图片\]/g, this.$tc('[图片]'))
	  	  .replace(/\[语音\]/g, this.$tc('[语音]'))
	  	  .replace(/\[视频\]/g, this.$tc('[视频]'))
	  	  .replace(/\[文件\]/g, this.$tc('[文件]'))
	  	  .replace(/\[文本\]/g, this.$tc('[文本]'))
	  	  .replace(/\[个人名片\]/g, this.$tc('[个人名片]'))
	  	  .replace(/\[聊天记录\]/g, this.$tc('[聊天记录]'));
	  	return newContent;
	  }
  }
}
</script>
<style lang="scss" scoped>
@import "../../../../assets/styles/common.scss";
.merger-box {
	width: 350rpx;
}
.top-box {
	height: 140rpx;
}
.bottom-box {
	height: 60rpx;
	border-top: 1rpx solid #efefef;
}
</style>