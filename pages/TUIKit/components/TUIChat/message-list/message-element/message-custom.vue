<template>
  <div class="custom">
		<view v-if="content.custom=='business'" @click="clickBusiness" >
			<view class="business-box">
				<view class="flex-align pd-tb-20">
					<avatarModal w='80' h='80' class="mr-30 mb-10" :info='formatData' ></avatarModal>
					<text class="main-text" >{{formatData.nick}}</text>
				</view>
				<view class="flex-align less-black font-24 business-bottom" >{{$tc('个人名片')}}</view>
			</view>
		</view>
      <span v-else v-html="content.custom"></span>
	
  </div>
</template>
<script>
import { isUrl, JSONToObject } from "../../../../utils/index";
import { CHAT_MSG_CUSTOM_TYPE } from "../../../../constant";
import TUIChatEngine, { TUIStore } from "@tencentcloud/chat-uikit-engine";
export default {
  props: {
    messageItem: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isUrl,
      CHAT_MSG_CUSTOM_TYPE,
    }
  },
  computed: {
    formatData() {
      return JSONToObject(this.messageItem.payload.data)
    },
    extension() {
      return JSONToObject(this.messageItem.payload.extension)
    },
    content() {
      return TUIChatEngine.TUIChat.messageHandler.handleCustomMessage(this.messageItem)
    }
  },
  methods: {
    clickBusiness() {
      const conversationModel = TUIStore.getConversationModel(this.messageItem.conversationID);
      this.setCardInfo(
				this.formatData.userID,
				conversationModel, 
				(options) => {
					this.$emit('seeCardInfo', options)
				}
			)
    },
    openLink(url) {
      this.jumpUrl(url)
    }
  }
}
</script>
<style lang="scss" scoped>
@import "../../../../assets/styles/common.scss";
a {
  color: #679ce1;
}
.business-box{
	width: 400rpx;
	opacity: 1;
	padding: 0 30rpx;
	border-radius: 12rpx;
	background: rgba(255, 255, 255, 1);
}
.main-text{
	color: #000000;
	font-size: 32rpx;
}
.business-bottom{
	padding: 8rpx 0;
	color:#adb5bd;
	font-size: 24rpx;
	border-top: 1px solid #EDEDED;

}
.custom {
	border-radius: 12rpx;
  box-shadow: 2px 2px 4px #e9e9e9;
  font-size: 14px;
  h1 {
    font-size: 14px;
    color: #000000;
  }
  h1,
  a,
  p {
    font-size: 14px;
  }
  .evaluate {
    ul {
      display: flex;
      padding-top: 10px;
    }
    &-list {
      display: flex;
      flex-direction: row;
      &-item {
        padding: 0px 2px;
      }
    }
  }
  .order {
    display: flex;
    main {
      padding-left: 5px;
      p {
        font-family: PingFangSC-Regular;
        width: 145px;
        line-height: 17px;
        font-size: 14px;
        color: #999999;
        letter-spacing: 0;
        margin-bottom: 6px;
        word-break: break-word;
      }
      span {
        font-family: PingFangSC-Regular;
        line-height: 25px;
        color: #ff7201;
      }
    }
    img {
      width: 67px;
      height: 67px;
    }
  }
}
</style>