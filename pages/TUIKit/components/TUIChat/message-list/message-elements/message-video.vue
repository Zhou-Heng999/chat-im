<template>
	<div 
		:class="['message-video flex-column flex-center',getContent(props.messageItem)&&getContent(props.messageItem).txt&&props.messageItem.flow!='in'?'file-video':'']"  >
		<!-- {{fixedSize}} -->
		<!-- <div
      :class="['message-video-box flex-column flex-center']"
      @click="handlerVideoPlay"
    > -->
		<!-- <image :src="props.content.snapshotUrl" class="message-video-box" mode="aspectFit"></image> -->
		<!-- <image :src="props.content.snapshotUrl" class="message-video-box" mode="aspectFill"></image> -->
		<!-- <image :src="props.content.snapshotUrl" class="message-video-box" mode="widthFix"></image> -->
		<div @click="handlerVideoPlay"
			:class="['flex-center imgBack',getContent(props.messageItem)&&getContent(props.messageItem).txt?'':'mr-img']" style="position: relative;">
			<div style="position: absolute; top: 20rpx; left: 10rpx; z-index: 999;" v-if="getVideoLength()" >
				<span
					style="padding: 0 10rpx; border-radius: 50rpx; color: #e2e2e2; background-color: rgba(0, 0, 0, 0.5);">
					{{time}}
				</span>
			</div>
			<view :style="fixedSize" class="flex-center" >
				<image :src="props.content.snapshotUrl||secondSnapUrl||getVideoImage()" @load="imageLoad"
					:style="{ width: imageStyles.width, height: imageStyles.height }" class="message-video-box"
					mode="heightFix" ref="imgeRef"></image>
			</view>
			
			<Icon v-if="props.messageItem.status === 'success' || props.messageItem.progress === 1" height='50px'
				width='50px' class="video-play" :file="playIcon"></Icon>
		</div>
		<span @click="handleUrlClick" :class="`${props.myMessageTranslates[props.messageItem.ID] ? '' : 'mb-20'} pd-lr-10 textClass`" v-if="getContent(props.messageItem)&&getContent(props.messageItem).txt" 
		 v-html="setTextStyle(getContent(props.messageItem).txt,props.messageItem)" ></span>
		<div v-if="props.myMessageTranslates[props.messageItem.ID] || props.loadingTranslate[props.messageItem.ID]" :class="`line_translates_${props.messageItem.flow}`"></div>
			<div v-if="props.loadingTranslate[props.messageItem.ID]" class="max-width"><u-loading-icon :style="{ width: 'fit-content' }"></u-loading-icon></div>
			<span v-if="props.myMessageTranslates[props.messageItem.ID]" class="mb-20 pd-lr-10 textClass">
			<span  v-for="(t_item, t_index) in props.myMessageTranslates[props.messageItem.ID].text" :key="t_index" @click="handleUrlClick">
        <span 
          v-if="t_item.name === 'text' && t_item.text"
          class="text-box" 
          v-html="setTextStyle(t_item.text, props.messageItem)"
        >
        </span>
        <img class="text-img" v-else :src="t_item.src" />
      </span>
      </span>
	</div>
</template>

<script lang="ts" setup>
	import { withDefaults, ref, watchEffect, onMounted, computed } from "../../../../adapter-vue";
	import type { IMessageModel } from "@tencentcloud/chat-uikit-engine";
	import Icon from "../../../common/Icon.vue";
	import playIcon from "../../../../assets/icon/video-play.png";
	import type { IVideoMessageContent } from "../../../../interface";
	import { ListMixin } from '@/mixin/list';
	import store from "@/store/index.js"
import getContentFn from "../../utils/getContent";
import TUIChatEngine, {
		TUIStore,
		StoreName,
		TUIChatService,
		IConversationModel,
	} from "@tencentcloud/chat-uikit-engine";
import { watch } from "@vue/runtime-dom";
	// const message = TUIStore.getMessageModel(singleForwardMessageID);
	const DEFAULT_MAX_SIZE = 155;
	const imageStyles = ref({ width: "auto", height: "auto" });
	const imgeRef = ref(null)
	const time = ref('0:00')
	const props = withDefaults(
		defineProps<{
			content : IVideoMessageContent;
			messageItem : IMessageModel;
			myMessageTranslates: any,
    	loadingTranslate: any,
		}>(),
		{
			content: () => ({} as IVideoMessageContent),
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
	// const maskedTxt = ListMixin.methods.maskSensitiveInfo(getContent(props.messageItem).txt);
	onMounted(() => {
		getVideoLength()
	});
	const getVideoLength = () => {
		if(props.messageItem.payload.videoSecond==0)return ''
		var totalSeconds = 0;
		if(props.messageItem.cloudCustomData!=''){
			var cloudCustomData = JSON.parse(props.messageItem.cloudCustomData)
			totalSeconds = Number(cloudCustomData.duration)
		}else{
			totalSeconds = Number(props.messageItem.payload.videoSecond)
		}
		// 计算分钟和剩余秒数
		var minutes = Math.floor(totalSeconds / 60);
		var seconds = Math.floor(totalSeconds) % 60;
		// 格式化成分:秒格式
		// if(!minutes.toString().padStart(2, '0') || !seconds.toString().padStart(2, '0')) return
		var formattedDuration = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
		time.value = formattedDuration
		
	};
	const fixedSize = computed<{ width: number | string; height: number | string }>(() => {
	  const maxH = DEFAULT_MAX_SIZE
	  const maxW = DEFAULT_MAX_SIZE
	  const { height, width } = props.content
	  let newW: number | string = DEFAULT_MAX_SIZE
	  let newH: number | string = DEFAULT_MAX_SIZE
	
	  if (width && height) {
	    if (width > height) {
	      if (width > maxW) {
	        newW = maxW
	        newH = Math.floor(maxW / width * height)
	      } else {
	        newW = width
	        newH = height
	      }
	    } else {
	      if (height > maxH) {
	        newW = Math.floor(maxH / height * width)
	        newH = maxH
	      } else {
	        newW = width
	        newH = height
	      }
	    }
	  }
	
	  return {
	    width: newW+'px',
	    height: newH+'px'
	  }
	})
	const genImageStyles = (value : { width ?: any; height ?: any }) => {
		const { width, height } = value;
		if (width === 0 || height === 0) {
			return;
		}

		let imageWidth = 0;
		let imageHeight = 0;
		if (width >= height) {
			imageWidth = DEFAULT_MAX_SIZE;
			imageHeight = (DEFAULT_MAX_SIZE * height) / width;
		} else {
			imageWidth = (DEFAULT_MAX_SIZE * width) / height;
			imageHeight = DEFAULT_MAX_SIZE;
		}
		imageStyles.value.width = imageWidth + "px";
		imageStyles.value.height = imageHeight + "px";
	};
	watchEffect(() => {
		genImageStyles(props.content);
	});

	const handleUrlClick=(event)=>{
		if(event.target.dataset.url){
			ListMixin.methods.jumpUrl(event.target.dataset.url)
		}
	}

	const imageLoad = (event : any) => {
		genImageStyles(event.detail);
	};
	const getWidth = () => {
		console.log('imgeRef', imgeRef.value)
	}
	const getVideoImage = () => {
		return getApp().globalData.videoInfo
	}
	const secondSnapUrl = ref('')
	const getSnapshotUrl = () =>{
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
			secondSnapUrl.value = res.data.messageList[0].payload.snapshotUrl
		})
	}
	function getContent(msg) {
		return getContentFn(msg)
	}
	function handlerVideoPlay() {
		getApp().globalData.videoUrl = props.content.url
		uni.navigateTo({
			url: `/pages/TUIKit/components/TUIChat/video-play`,
		});
	}
	watch(
	  () => [props.content.snapshotUrl],
	  (newVal: any, oldVal: any) => {
	    if (newVal !== oldVal && props.content.snapshotUrl) {
			if(props.content.snapshotUrl){
				secondSnapUrl.value = props.content.snapshotUrl
				// getSnapshotUrl()
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
	.message-video {
		position: relative;

		&-box {
			// width: 250px;
			// max-width: 250px;
			// background-color: rgba(#000000, 0.3);
			// height: 250px;
			// border-radius: 6px;
			will-change: transform;
			// height: 200px; // todo 优化高度动态获取
			// font-size: 0;
		}

		.video-play {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
		.text-box {
		  white-space: pre-wrap;
		  font-size: inherit;
		  word-break: break-word;
		  font-size: 32rpx;
		  text-size-adjust: none;
		}

	}

	.file-video {
		background: #C2E8FF;
		// padding: 0 10rpx;
		// box-sizing: border-box;
	}

	.time {
		position: absolute;
		left: 4px;
		bottom: 4px;
		color: #fff;
		text-align: right;
		font-size: 12px;
		text-shadow: 1px 1px 2px #000;
	}

	.mr-img {
		margin-bottom: 25rpx;
	}

	.imgBack {
		width: 100%;
		background: linear-gradient(to bottom, #fff, #000);
	}

	.textClass {
		width: 100%;
	}
</style>