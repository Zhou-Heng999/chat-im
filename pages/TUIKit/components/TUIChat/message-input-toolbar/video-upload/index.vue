<template>
  <ToolbarItemContainer
    iconUrl='tb_sp'
    :title="$tc(handleTitle())"
    :needDialog="false"
    :iconWidth="isUniFrameWork ? '32px' : '21px'"
    :iconHeight="
      isUniFrameWork
        ? props.videoSourceType === 'album'
          ? '20px'
          : '25px'
        : '18px'
    "
    @onIconClick="onIconClick"
  >
    <div :class="['video-upload', !isPC && 'video-upload-h5']">
      <input
        title="视频"
        type="file"
        data-type="video"
        accept="video/*"
        @change="sendVideoInWeb"
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
import { ref,onMounted,onUnmounted } from "../../../../adapter-vue";
import { isPC, isWeChat, isUniFrameWork } from "../../../../utils/env";
import { TUIGlobal } from "../../../../utils/universal-api/index";
import ToolbarItemContainer from "../toolbar-item-container/index.vue";
import videoIcon from "../../../../assets/icon/video.png";
import videoUniIcon from "../../../../assets/icon/video-uni.png";
import cameraUniIcon from "../../../../assets/icon/camera-uni.png";
import { isEnabledMessageReadReceiptGlobal } from "../../utils/utils";

const props = defineProps({
  // 视频源, 仅uniapp版本有效, web版本仅支持从文件中选择视频
  // album: 从文件中选择
  // camera: 使用相机拍摄
  videoSourceType: {
    type: String,
    default: "album",
  },
});

const emits = defineEmits(["close",'sendFile']);

const inputRef = ref();
const currentConversation = ref<IConversationModel>();



onMounted(()=>{
	TUIStore.watch(StoreName.CONV, {
	  currentConversation: (conversation: IConversationModel) => {
	    currentConversation.value = conversation;
	  },
	});
})
onUnmounted(()=>{
	TUIStore.unwatch(StoreName.CONV, {
	  currentConversation: (conversation: IConversationModel) => {
	    currentConversation.value = conversation;
	  },
	});
})

const handleIcon = (): string => {
  if (isUniFrameWork) {
    switch (props.videoSourceType) {
      case "album":
        return videoUniIcon;
      case "camera":
        return cameraUniIcon;
      default:
        return videoUniIcon;
    }
  } else {
    return videoIcon;
  }
};

const handleTitle = (): string => {
  if (isUniFrameWork && props.videoSourceType === "camera") {
    return "录制";
  } else {
    return "视频";
  }
};

const onIconClick = () => {
  // uniapp环境发送视频
  if (isUniFrameWork) {
    // 增加 TUIGlobal.chooseMedia 条件限制，防御 uni 打包其他平台小程序时由于打包问题导致 isWeChat 为 true 出现运行时报错
    if (isWeChat && TUIGlobal?.chooseMedia) {
      // 微信小程序从基础库 2.21.0 开始， wx.chooseVideo 停止维护，请使用 uni.chooseMedia 代替
      TUIGlobal?.chooseMedia({
        mediaType: ["video"], // 视频
        count: 1,
        sourceType: [props.videoSourceType], // album 从相册选视频，camera 使用相机拍摄
        maxDuration: 60, // 设置最长时间60s
        success: function (res: any) {
          sendVideoMessage(res);
        },
      });
    } else {
      // uniapp h5/app 发送图片
      uni.chooseVideo({
        count: 1,
		compressed:false,
        sourceType: [props.videoSourceType], // 从相册选择或使用相机拍摄
        success: function (res: any) {
			console.log('res')
          sendVideoMessage(res);
        },
      });
    }
  } else {
    inputRef?.value?.click && inputRef?.value?.click();
  }
};

const sendVideoInWeb = (e: any) => {
  if (e?.target?.files?.length <= 0) {
    return;
  }
  sendVideoMessage(e?.target);
  e.target.value = "";
};

const sendVideoMessage = (file: any) => {
  if (!file) {
    return;
  }
  const options = {
    to:
      currentConversation?.value?.groupProfile?.groupID ||
      currentConversation?.value?.userProfile?.userID,
    conversationType: currentConversation?.value?.type,
    payload: {
      file,
    },
    needReadReceipt: isEnabledMessageReadReceiptGlobal(),
  } as SendMessageParams;
  options.fileFun='sendVideoMessage'
  emits('sendFile',options)
  return
  TUIChatService.sendVideoMessage(options);
};
</script>
<style lang="scss" scoped>
@import url(../../../../assets/styles/common.scss);
</style>
