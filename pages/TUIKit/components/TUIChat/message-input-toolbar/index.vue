<template>
  <div
    :class="[
      'message-input-toolbar',
      !isPC && 'message-input-toolbar-h5',
      isUniFrameWork && 'message-input-toolbar-uni',
    ]"
	:style="{height: keyboardHeight?keyboardHeight+'px':'250px'}"
  >
    <div
      :class="[
        'message-input-toolbar-list',
        !isPC && 'message-input-toolbar-h5-list',
        isUniFrameWork && 'message-input-toolbar-uni-list',
      ]"
    >
      <EmojiPicker
        v-if="!isUniFrameWork"
        @insertEmoji="insertEmoji"
        @dialogShowInH5="dialogShowInH5"
        @dialogCloseInH5="dialogCloseInH5"
      ></EmojiPicker>
      <!-- <ImageUpload v-if="isUniFrameWork" imageSourceType="camera"></ImageUpload> -->
	  
      <ImageUpload imageSourceType="album" @sendFile='sendFile' ></ImageUpload>
	  <!-- <ImageUpload imageSourceType="camera" @sendFile='sendFile'></ImageUpload> -->
      <VideoUpload videoSourceType="album" @sendFile='sendFile'></VideoUpload>
	  <!-- v-if="!isUniFrameWork" -->
	  <FileUpload @sendFile='sendFile' ></FileUpload>
      <!-- <VideoUpload v-if="isUniFrameWork" videoSourceType="camera"></VideoUpload> -->
	  <businessCard @openSearch='openSearch' ></businessCard>
	 <!-- <voiceCall></voiceCall>
	  <videoCall></videoCall> -->
     <!-- <Evaluate></Evaluate>
      <Words></Words> -->
	  <!-- <Camera @sendFile="sendFile"></Camera> -->
      <template v-if="extensionListShowInStart[0]">
		  <!-- {{extensionListShowInStart}} -->
        <ToolbarItemContainer
          v-for="extension in extensionListShowInStart"
          :iconUrl="extension.data.name=='voiceCall'?'tb_yy':'tb_sp'"
          :title="genExtensionText(extension)"
          :iconWidth="isUniFrameWork ? '25px' : '20px'"
          :iconHeight="isUniFrameWork ? '25px' : '20px'"
          :needDialog="false"
          @onIconClick="onExtensionClick(extension)"
        />
      </template>
    </div>
    <div v-if="extensionListShowInEnd[0] && isPC" :class="['message-input-toolbar-list-end']">
      <ToolbarItemContainer
        v-for="extension in extensionListShowInEnd"
        :iconFile="genExtensionIcon(extension)"
        :title="genExtensionText(extension)"
        :iconWidth="isUniFrameWork ? '25px' : '20px'"
        :iconHeight="isUniFrameWork ? '25px' : '20px'"
        :needDialog="false"
        @onIconClick="onExtensionClick(extension)"
      />
    </div>
    <UserSelector
      ref="userSelectorRef"
      :type="selectorShowType"
      :currentConversation="currentConversation"
      :isGroup="isGroup"
      @submit="onUserSelectorSubmit"
      @cancel="onUserSelectorCancel"
    />
	<!-- 朋友搜索 -->
	<searchFriends :isShow='isSearchShow' :heigth="'90'" @closeModal='isSearchShow=false' @chooseItem='chooseItem' ></searchFriends>
    <div v-if="isH5" :class="['message-input-toolbar-h5-dialog']" ref="h5Dialog"></div>
	
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onUnmounted,onMounted } from "../../../adapter-vue";
import TUIChatEngine, {
  IConversationModel,
  TUIStore,
  StoreName,
  TUIChatService
} from "@tencentcloud/chat-uikit-engine";
import TUICore, { ExtensionInfo, TUIConstants } from "@tencentcloud/tui-core";
import EmojiPicker from "./emoji-picker/index.vue";
import ImageUpload from "./image-upload/index.vue";
import FileUpload from "./file-upload/index.vue";
import VideoUpload from "./video-upload/index.vue";
import businessCard from "./business-card/index.vue";
import videoCall from "./video-call/index.vue";
import voiceCall from "./voice-call/index.vue";
import Evaluate from "./evaluate/index.vue";
import Words from "./words/index.vue";
import Camera from "./camera/index.vue";
import ToolbarItemContainer from "./toolbar-item-container/index.vue";
import UserSelector from "./user-selector/index.vue";
import { Toast, TOAST_TYPE } from "../../common/Toast/index";
import { isPC, isH5, isApp, isUniFrameWork } from "../../../utils/env";
import TUIChatConfig from "../config";
import { enableSampleTaskStatus } from "../../../utils/enableSampleTaskStatus";
import searchFriends from "@/components/search-friends/index.vue";
import {tc} from '@/utils/util'
const emits = defineEmits(["insertEmoji",'sendFile']);
const h5Dialog = ref();
const currentConversation = ref<IConversationModel>();
const isGroup = ref<boolean>(false);
const selectorShowType = ref<string>("");
const userSelectorRef = ref();
const currentUserSelectorExtension = ref<ExtensionInfo>();
const currentExtensionList = ref<ExtensionInfo>([]);
console.log('TUIChatEngine',TUIChatEngine)
const getExtensionList = (conversationID:string) => {
  if (!conversationID) {
    return currentExtensionList.value = extensionList;
  }
  const chatType = TUIChatConfig.getChatType();
  const options:any = {
    chatType,
  }
  // 向下兼容，callkit 没有chatType 判断时，使用 filterVoice、filterVideo 过滤
  if (chatType === "customerService") {
    options.filterVoice = true;
    options.filterVideo = true;
    enableSampleTaskStatus("customerService");
  }
  currentExtensionList.value = [
    ...TUICore.getExtensionList(TUIConstants.TUIChat.EXTENSION.INPUT_MORE.EXT_ID, options),
  ];
}
const sendFile=(e)=>{
	emits('sendFile',e)
}
const isSearchShow=ref(false)
const openSearch=()=>{
	isSearchShow.value=true
}
const onCurrentConversationUpdate = (conversation: IConversationModel) => {
  if (conversation?.conversationID && currentConversation.value?.conversationID !== conversation?.conversationID) {
      getExtensionList(conversation?.conversationID);
    }
    currentConversation.value = conversation;
    if (currentConversation?.value?.type === TUIChatEngine.TYPES.CONV_GROUP) {
      isGroup.value = true;
    } else {
      isGroup.value = false;
    }
}

const chooseItem=(item)=>{
	let info=currentConversation.value
	let userID=info.type=='C2C'?info.userProfile.userID:info.groupProfile.groupID
	let message =TUIChatEngine.chat.createCustomMessage({
		to:userID,
		conversationType:TUIChatEngine.TYPES[`CONV_${info.type}`],
		payload:{
			data: JSON.stringify(item.profile), 
			description: 'business', 
			extension: 'business'
		},
	})
	TUIChatService.sendCustomMessage(message)
	// TUIChatEngine.chat.sendMessage(message)
}
onMounted(()=>{
	TUIStore.watch(StoreName.CONV, {
	  currentConversation: onCurrentConversationUpdate,
	});
})



onUnmounted(() => {
  TUIStore.unwatch(StoreName.CONV,{
    currentConversation: onCurrentConversationUpdate,
  });
});

// extensions
const extensionList: Array<ExtensionInfo> = [
  ...TUICore.getExtensionList(TUIConstants.TUIChat.EXTENSION.INPUT_MORE.EXT_ID),
];

// 按展示位置分类 extensionList （注意：仅 web 端 区分展示位置在 从 start 开始和 从 end 开始，在移动端不生效）
// const extensionListShowInStart = computed(
//   (): Array<ExtensionInfo> =>
//     isPC ? currentExtensionList.value.filter((extension: ExtensionInfo) => extension?.data?.name !== "search") : currentExtensionList.value
// );
const extensionListShowInStart = computed(() => {
  const uniqueIcons = new Set(); // 创建一个空的 Set 来存储已经出现过的图标
  
  // 使用 Array.prototype.filter 方法过滤掉重复的元素
  let a  = currentExtensionList.value.filter(item => {
	  if(item?.icon){
		  if (uniqueIcons.has(item.icon)) {
		      return false; // 如果图标已经存在于 Set 中，则过滤掉该元素
		  } else {
		      uniqueIcons.add(item.icon); // 否则将图标添加到 Set 中
		      return true; // 并保留该元素
		  }
	  }
      
  });
  currentExtensionList.value = [...a]
  if (isPC) {
    return currentExtensionList.value.filter((extension: ExtensionInfo) => extension?.data?.name !== "search");
  } else {
    return currentExtensionList.value;
  }
});

const extensionListShowInEnd = computed(
  (): Array<ExtensionInfo> =>
    isPC ? [currentExtensionList.value.find((extension: ExtensionInfo) => extension?.data?.name === "search")] : []
);

// handle extensions onclick
const onExtensionClick = (extension: ExtensionInfo) => {
  switch (extension?.data?.name) {
    case "voiceCall":
      onCallExtensionClicked(extension, 1);
      break;
    case "videoCall":
      onCallExtensionClicked(extension, 2);
      break;
    case "search":
      extension?.listener?.onClicked();
      break;
    default:
      break;
  }
};

const onCallExtensionClicked = (extension: ExtensionInfo, callType: number) => {
  selectorShowType.value = extension?.data?.name;
  if (currentConversation?.value?.type === TUIChatEngine.TYPES.CONV_C2C) {
    extension?.listener?.onClicked({
      userIDList: [currentConversation?.value?.conversationID?.slice(3)],
      type: callType,
    });
  } else if (isGroup.value) {
    currentUserSelectorExtension.value = extension;
    userSelectorRef?.value?.toggleShow && userSelectorRef.value.toggleShow(true);
  }
};

const genExtensionIcon = (extension: any) => {
  return extension?.icon;
};
const genExtensionText = (extension: any) => {
  return tc(extension?.text);
};

const onUserSelectorSubmit = (selectedInfo: any) => {
	console.warn(999)
  currentUserSelectorExtension.value?.listener?.onClicked(selectedInfo);
  currentUserSelectorExtension.value = null;
};

const onUserSelectorCancel = () => {
  currentUserSelectorExtension.value = null;
};

const insertEmoji = (emojiObj: object) => {
  emits("insertEmoji", emojiObj);
};

const dialogShowInH5 = (dialogDom: any) => {
  if (!isH5) {
    return;
  }
  h5Dialog?.value?.appendChild && h5Dialog?.value?.appendChild(dialogDom);
};

const dialogCloseInH5 = (dialogDom: any) => {
  if (!isH5) {
    return;
  }
  h5Dialog?.value?.removeChild && h5Dialog?.value?.removeChild(dialogDom);
};
</script>
<style lang="scss" scoped>
@import "../../../assets/styles/common.scss";
.message-input-toolbar {
  border-top: 1px solid #ebebeb;
  // background: #f5f5f5;
  width: 100%;
  max-width: 100%;
  margin-top: 40rpx;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  &-list {
    display: flex;
    flex-direction: row;
    align-items: center;
    .extension-list {
      list-style: none;
      display: flex;
      &-item {
        width: 20px;
        height: 20px;
        padding: 12px 10px 1px;
        cursor: pointer;
      }
    }
  }
}
.message-input-toolbar-h5 {
  padding: 5px 10px 5px;
  box-sizing: border-box;
  flex-direction: column;
}

.message-input-toolbar-uni {
  // background-color: #f6f6f6;
  min-height: 500rpx;
  flex-direction: column;
  &-list {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(4, 25%);
    grid-template-rows: repeat(2, 100px);
  }
}
</style>
