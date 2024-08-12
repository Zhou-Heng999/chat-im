<template>
  <ToolbarItemContainer
    iconUrl='tb_xp'
    :title="$tc(imageToolbarForShow.title)"
    :iconWidth="isUniFrameWork ? '32px' : '21px'"
    :iconHeight="isUniFrameWork ? '25px' : '18px'"
    :needDialog="false"
    @onIconClick="onIconClick"
  >
    <div
      :class="['image-upload', !isPC && 'image-upload-h5']"
      v-if="!isUniFrameWork"
    >
      <input
        title="图片"
        type="file"
        data-type="image"
        accept="image/gif,image/jpeg,image/jpg,image/png,image/bmp,image/webp"
        @change="sendImageInWeb"
        ref="inputRef"
      />
    </div>
  </ToolbarItemContainer>
</template>
<script lang="ts" setup>
import {
  TUIChatService,
  TUIStore,
  StoreName,
  IConversationModel,
  SendMessageParams,
} from "@tencentcloud/chat-uikit-engine";
import { ref, computed,onMounted,onUnmounted } from "../../../../adapter-vue";
import { isPC, isWeChat, isUniFrameWork } from "../../../../utils/env";
import { TUIGlobal } from "../../../../utils/universal-api/index";
import ToolbarItemContainer from "../toolbar-item-container/index.vue";
import imageIcon from "../../../../assets/icon/image.png";
import imageUniIcon from "../../../../assets/icon/image-uni.png";
import cameraUniIcon from "../../../../assets/icon/camera-uni.png";
import { isEnabledMessageReadReceiptGlobal } from "../../utils/utils";

const props = defineProps({
  // 图片源, 仅uniapp版本有效, web版本仅支持从相册中选择图片
  // album: 从相册中选择
  // camera: 使用相机拍摄
  imageSourceType: {
    type: String,
    default: "album",
  },
});

const emits = defineEmits(["close",'sendFile']);

const inputRef = ref();
const currentConversation = ref<IConversationModel>();
const IMAGE_TOOLBAR_SHOW_MAP = {
  web_album: {
    icon: imageIcon,
    title: "图片",
  },
  uni_album: {
    icon: imageUniIcon,
    title: "图片",
  },
  uni_camera: {
    icon: cameraUniIcon,
    title: "拍照",
  },
};

const onCurrentConversation=(conversation: IConversationModel) => {
	    currentConversation.value = conversation;
	  }
onMounted(()=>{
	TUIStore.watch(StoreName.CONV, {
	  currentConversation: onCurrentConversation,
	});
})

onUnmounted(()=>{
	TUIStore.unwatch(StoreName.CONV, {
	  currentConversation: onCurrentConversation,
	});
})


const imageToolbarForShow = computed((): { icon: string; title: string } => {
  if (isUniFrameWork) {
    return props.imageSourceType === "camera"
      ? IMAGE_TOOLBAR_SHOW_MAP["uni_camera"]
      : IMAGE_TOOLBAR_SHOW_MAP["uni_album"];
  } else {
    return IMAGE_TOOLBAR_SHOW_MAP["web_album"];
  }
});

let chooseCount = 0
const onIconClick = () => {
  // uniapp 环境 发送图片
  if (isUniFrameWork) {
    // 增加 TUIGlobal.chooseMedia 条件限制，防御 uni 打包其他平台小程序时由于打包问题导致 isWeChat 为 true 出现运行时报错
    if (isWeChat && TUIGlobal?.chooseMedia) {
      // 微信小程序从基础库 2.21.0 开始， wx.chooseImage 停止维护，请使用 uni.chooseMedia 代替
      TUIGlobal?.chooseMedia({
        count: 1,
        mediaType: ["image"], // 图片
        sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: [props.imageSourceType], // 从相册选择或使用相机拍摄
        success: function (res: any) {
          sendImageMessage(res);
        },
      });
    } else {
      // uniapp h5/app 发送图片
      TUIGlobal?.chooseImage({
        count: 9,
        sourceType: [props.imageSourceType], // 从相册选择或使用相机拍摄
        success: function (res: any) {
			let list=res.tempFilePaths
			chooseCount = list.length
			list.forEach( async(item,index)=>{
				TUIGlobal?.getImageInfo({
				  src: item,
				  success: function (image: any) {
				    sendImageMessage({errMsg:res.errMsg,tempFilePaths:[item],tempFiles
:[res.tempFiles[index]]}, image.width, image.height);
				  },
				});
			})
          
        },
      });
    }
  } else {
    if (inputRef.value?.click) {
      inputRef.value.click();
    }
  }
};

const sendImageInWeb = (e: any) => {
  if (e?.target?.files?.length <= 0) {
    return;
  }
  sendImageMessage(e?.target);
  e.target.value = "";
};

const sendImageMessage = (files: any, width?: string, height?: string) => {
  if (!files) {
    return;
  }
  console.log('发送图片',files)
  const options = {
    to:
      currentConversation?.value?.groupProfile?.groupID ||
      currentConversation?.value?.userProfile?.userID,
    conversationType: currentConversation?.value?.type,
    payload: {
      file: files,
    },
    needReadReceipt: isEnabledMessageReadReceiptGlobal(),
  } as SendMessageParams;
  options.fileFun='sendImageMessage'
  if(chooseCount == 1) {
	  emits('sendFile',options)
  }else {
	  // todo: 需要处理uniapp文件没有宽高的变形问题，需要linda看看
	  TUIChatService.sendImageMessage(options);
  }
};
</script>
<style lang="scss" scoped>
@import url(../../../../assets/styles/common.scss);
</style>
