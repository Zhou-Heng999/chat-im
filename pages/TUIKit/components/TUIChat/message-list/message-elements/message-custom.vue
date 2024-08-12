<template>
  <div class="custom">
    <template v-if="isCustom.businessID === CHAT_MSG_CUSTOM_TYPE.SERVICE">
      <div>
        <h1>
          <label>{{ extension.title }}</label>
          <a
            v-if="extension.hyperlinks_text"
            :href="extension.hyperlinks_text.value"
            target="view_window"
            >{{ extension.hyperlinks_text.key }}</a
          >
        </h1>
        <ul v-if="extension.item && extension.item.length > 0">
          <li v-for="(item, index) in extension.item" :key="index">
            <a v-if="isUrl(item.value)" :href="item.value" target="view_window">{{ item.key }}</a>
            <p v-else>{{ item.key }}</p>
          </li>
        </ul>
        <article>{{ extension.description }}</article>
      </div>
    </template>
    <template v-else-if="isCustom.businessID === CHAT_MSG_CUSTOM_TYPE.EVALUATE">
      <div class="evaluate">
        <h1>{{ $tc(TUITranslateService.t("message.custom.对本次服务评价")) }}</h1>
        <ul class="evaluate-list">
          <li
            class="evaluate-list-item"
            v-for="(item, index) in Math.max(isCustom.score, 0)"
            :key="index"
          >
            <Icon :file="star" class="file-icon"></Icon>
          </li>
        </ul>
        <article>{{ isCustom.comment }}</article>
      </div>
    </template>
    <template v-else-if="isCustom.businessID === CHAT_MSG_CUSTOM_TYPE.ORDER">
      <div class="order" @click="openLink(isCustom.link)">
        <image :src="isCustom.imageUrl" alt="" />
        <main>
          <h1>{{ isCustom.title }}</h1>
          <p>{{ isCustom.description }}</p>
          <span>{{ isCustom.price }}</span>
        </main>
      </div>
    </template>
    <template v-else-if="isCustom.businessID === CHAT_MSG_CUSTOM_TYPE.LINK">
      <div class="textLink">
        <p>{{ isCustom.text }}</p>
        <a :href="isCustom.link" target="view_window">{{
          $tc(TUITranslateService.t("message.custom.查看详情>>"))
        }}</a>
      </div>
    </template>
    <template v-else>
		<view v-if="content.custom=='business'" @click="setCardInfo(setObj(props.messageItem.payload.data).userID,emits,props.currentConversationInfo)" >
			<view class="business-box">
				<view class="flex-align pd-tb-20">
					<avatarModal w='80' h='80' class="mr-30 mb-10" :info='setObj(props.messageItem.payload.data)' ></avatarModal>
					<text class="main-text" >{{setObj(props.messageItem.payload.data).nick}}</text>
				</view>
				<view class="flex-align less-black font-24 business-bottom" >{{$tc('个人名片')}}</view>
			</view>
			<!-- {{setObj(props.messageItem.payload.data).userID}} -->
		</view>
      <span v-else v-html="content.custom"></span>
	  
    </template>
	
  </div>
</template>

<script lang="ts" setup>
import { watchEffect, ref,getCurrentInstance } from "../../../../adapter-vue";
import TUIChatEngine,{ TUITranslateService, IMessageModel } from "@tencentcloud/chat-uikit-engine";
import { Toast, TOAST_TYPE } from "@/pages/TUIKit/components/common/Toast";
import { isUrl, JSONToObject } from "../../../../utils/index";
import { CHAT_MSG_CUSTOM_TYPE } from "../../../../constant";
import { ICustomMessagePayload } from "../../../../interface";
import Icon from "../../../common/Icon.vue";
import star from "../../../../assets/icon/star-light.png";
interface Props {
  messageItem: IMessageModel;
  content: any;
  currentConversationInfo:any
}
const thisInstance = getCurrentInstance()?.proxy || getCurrentInstance();
const emits=defineEmits('seeCardInfo')
const props = withDefaults(defineProps<Props>(), {
  messageItem: undefined,
  content: undefined,
  currentConversationInfo:null
})
const setObj=(obj)=>{
	return JSON.parse(obj)
}
const custom = ref();
const message = ref<IMessageModel>();
const extension = ref();
const isCustom = ref<ICustomMessagePayload>({
  businessID: "",
});


watchEffect(() => {
  console.log('props.content ===', props.content, JSON.parse(props.messageItem.payload.data))
  custom.value = props.content;
  message.value = props.messageItem;
  const { payload } = props.messageItem;
  isCustom.value = payload.data || "";
  isCustom.value = JSONToObject(payload.data);
  if (payload.data === CHAT_MSG_CUSTOM_TYPE.SERVICE) {
    extension.value = JSONToObject(payload.extension);
  }
});
const openLink = (url: any) => {
  window.open(url);
};
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
	// border: 1rpx solid rgba(230, 230, 230, 1);
	// box-shadow: 0px 6rpx 6rpx  rgba(0, 0, 0, 0.1);
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
