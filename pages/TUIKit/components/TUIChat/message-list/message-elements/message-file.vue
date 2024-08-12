<template>
	<view class="flex-column max-width">
		<div
		  class="fileMessageContainer"
		  :title="TUITranslateService.t('TUIChat.单击下载')"
		  @click="download"
		>
		  <!-- <Icon :file="files" class="fileIcon"></Icon> -->
			<!-- <l-circle v-model:current="modelVale" :percent="target" size="50" strokeWidth="3" trailWidth="3" strokeColor="#fff">
			    <text>{{modelVale}}%</text>
			</l-circle> -->
			<div v-if="!props.content.url&&!secondUrl" class="flex-center mr-30">
				<u-loading-icon mode="semicircle"></u-loading-icon>
			</div>
			<imageBox v-else size='92' class="mr-10" :name='getIconByExtension(props.content.url||secondUrl)'></imageBox>
		  <div class="info">
				<!-- {{getIconByExtension(props.content.url) }} -->
		    <div>{{ props.content.name }}</div>
		    <div class="size" :class="[props.messageItem.flow === 'out' ? 'out' : 'in']">{{ props.content.size }}</div>
		  </div>
		</div>
		<text class="pd-lr-10 mt-10" v-if="getContent(props.messageItem)&&getContent(props.messageItem).txt"  >{{getContent(props.messageItem).txt}}</text>
		<div v-if="props.myMessageTranslates[props.messageItem.ID] || props.loadingTranslate[props.messageItem.ID]" :class="`line_translates_${props.messageItem.flow}`"></div>
      <div v-if="props.loadingTranslate[props.messageItem.ID]" class="max-width"><u-loading-icon :style="{ width: 'fit-content' }"></u-loading-icon></div>
      <span v-if="props.myMessageTranslates[props.messageItem.ID]" class="mb-20 pd-lr-10 textClass">
      <span  v-for="(t_item, t_index) in props.myMessageTranslates[props.messageItem.ID].text" :key="t_index">
        <span 
          v-if="t_item.name === 'text' && t_item.text"
          class="text-box" 
          v-html="setTextStyle(t_item.text, props.messageItem)"
        >
        </span>
        <img class="text-img" v-else :src="t_item.src" />
        </span>
      </span>
	</view>
 
</template>

<script lang="ts" setup>
import { withDefaults, computed } from "../../../../adapter-vue";
import TUIChatEngine, { TUITranslateService, IMessageModel } from "@tencentcloud/chat-uikit-engine";
import Icon from "../../../common/Icon.vue";
import imageBox from "@/components/image-icon/index.vue";
import {fileType} from "@/const";
import files from "../../../../assets/icon/files.png";
import type { IFileMessageContent } from "../../../../interface";
import { isPC } from "../../../../utils/env";
import { ref } from "../../../../adapter-vue";
import { ListMixin } from '@/mixin/list';
import store from "@/store/index.js"
import getContentFn from "../../utils/getContent";
import { watch } from "@vue/runtime-dom";
const props = withDefaults(
  defineProps<{
    content: IFileMessageContent;
    messageItem: IMessageModel;
    loadingTranslate: any,
    myMessageTranslates: any,
  }>(),
  {
    content: () => ({} as IFileMessageContent),
    messageItem: () => ({} as IMessageModel),
    myMessageTranslates:{
	    type: Object,
	    default: () => {
        return {}
      },
    },
    loadingTranslate: {
      type: Object,
      default: () => {
        return {}
      },
    },
  }
);

const secondUrl = ref('')

function getContent(msg) {
		return getContentFn(msg)
	}
function getIconByExtension(filePath) {
    const fileExtension = getFileExtension(filePath);

    const mappings = fileType;

    for (const mapping of mappings) {
        if (mapping.arr.includes(fileExtension)) {
            return mapping.icon;
        }
    }

    return 'tb_others';
}

function getFileExtension(filePath) {
    const parts = filePath.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

// todo: 区分 web 和 uniapp
const download = () => {
	// 拦截上传中的文件
	if(!props.content.url&&!secondUrl.value) return
	
	let content = props.content;
	if(!props.content.url){
		content.url = secondUrl.value;
	}
	
	let dataInfo = {
		content: content,
		messageItem: props.messageItem
	}
	
	uni.setStorageSync('files', dataInfo)
	uni.navigateTo({
		url: '/pages/home/views/downLoad/index'
	})
	
  // if (props.messageItem.hasRiskContent) {
  //   return;
  // }
  // const option = {
  //   mode: "cors",
  //   headers: new Headers({
  //     "Content-Type": "application/x-www-form-urlencoded",
  //   }),
  // } as RequestInit;
  // // 浏览器支持fetch则用blob下载，避免浏览器点击a标签，跳转到新页面预览的行为
  // // If the browser supports fetch, use blob to download, so as to avoid the browser clicking the a tag and jumping to the preview of the new page
  // if ((window as any)?.fetch) {
  //   fetch(props.content.url, option)
  //     .then((res) => res.blob())
  //     .then((blob) => {
  //       const a = document.createElement("a");
  //       const url = window.URL.createObjectURL(blob);
  //       a.href = url;
  //       a.download = props.content.name;
  //       a.click();
  //     });
  // } else {
  //   const a = document.createElement("a");
  //   a.href = props.content.url;
  //   a.target = "_blank";
  //   a.download = props.content.name;
  //   a.click();
  // }
};
const getUrl = () =>{
		let {conversationID,sequence,conversationType,time} = props.messageItem
		let params = {}
		if(conversationType=='GROUP'){
			params = {
				conversationID: conversationID,
				sequence: sequence,
				count: 1,
				direction: 1
			}
		}else{
			params = {
				conversationID: conversationID,
				time: time,
				count: 1,
				direction: 1
			}			
		}
		TUIChatEngine.chat.getMessageListHopping(params).then((res)=>{
			console.log("请求陈工",res)
			secondUrl.value = res.data.messageList[0].payload.fileUrl
		})
	}

watch(
	() => [props.content.url],
		(newVal: any, oldVal: any) => {
			if (newVal !== oldVal && props.content.url) {
				if(props.content.url){
					// getUrl()
					secondUrl.value = props.content.url
				}
			}
		},
	{
	    immediate: true,
	    deep: true,
	}
);
</script>
<style lang="scss" scoped>
@import "../../../../assets/styles/common.scss";
.fileMessageContainer {
  display: flex;
  flex-direction: row;
  cursor: pointer;
  width: 400rpx;
  .fileIcon {
    margin: auto 8px;
  }
}

.text-box {
  white-space: pre-wrap;
  font-size: inherit;
  word-break: break-word;
  font-size: 32rpx;
  text-size-adjust: none;
}

.info {
	display: flex;
	flex-direction: column;
	justify-content: center;
	.size {
		font-size: 24rpx;
		&.out {
			color: #4285F6;
		}
		&.in {
			color: #AEB6BE;
		}
	}
}
</style>
