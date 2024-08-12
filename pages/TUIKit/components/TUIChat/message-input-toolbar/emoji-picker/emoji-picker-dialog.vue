<template>
  <div
    :class="['emoji-picker', !isPC && 'emoji-picker-h5']"
    ref="emojiPickerDialog"
	:style="{height: keyboardHeight?keyboardHeight+'px':'250px'}"
  >
    <ul
      :class="['emoji-picker-list', !isPC && 'emoji-picker-h5-list']"
      ref="emojiPickerListRef"
    >
      <li
        class="emoji-picker-list-item"
        v-for="(childrenItem, childrenIndex) in currentEmojiList"
        :key="childrenIndex"
        @click="select(childrenItem, childrenIndex)"
      >
        <image
          v-if="currentTabItem.type === EMOJI_TYPE.BASIC"
          class="emoji"
          :src="'/static/emoji/' + basicEmojiMap[childrenItem]"
        />
      </li>
    </ul>
    <ul class="emoji-picker-tab">
      <li
        class="emoji-picker-tab-item"
        v-for="(item, index) in list"
        :key="index"
        @click="toggleEmojiTab(index)"
      >
        <Icon
          v-if="item.type === EMOJI_TYPE.BASIC"
          class="icon"
          :file="faceIcon"
        ></Icon>
      </li>
      <li class="send-btn send" v-if="isUniFrameWork" @click="sendMessage">{{$tc('发送')}}</li>
      <li class="send-btn clear" v-if="isUniFrameWork" @click="eventClick" @longpress="eventLongTap" @touchstart='touchstart'
					@touchend='touchend'>
		  <image src="/static/images/tb_gb.png" style="width: 60%; height: 60%;"></image>
	  </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import {
  TUIChatService,
  TUIStore,
  StoreName,
  IConversationModel,
  SendMessageParams,
} from "@tencentcloud/chat-uikit-engine";
import { ref, getCurrentInstance,onMounted,onUnmounted } from "../../../../adapter-vue";
import { emojiList, basicEmojiMap } from "../../utils/emojiList";
import { IEmojiList, IEmojiListItem } from "../../../../interface";
import { EMOJI_TYPE } from ".././../../../constant";
import Icon from "../../../common/Icon.vue";
import faceIcon from "../../../../assets/icon/face.png";
import { isPC, isUniFrameWork } from "../../../../utils/env";
import { isEnabledMessageReadReceiptGlobal } from "../../utils/utils";

const emits = defineEmits(["insertEmoji", "onClose", "sendMessage", 'deleteEmoji', 'longpressToDelete', 'longpressStop']);
const thisInstance = getCurrentInstance()?.proxy || getCurrentInstance();
const list = ref<IEmojiList>(emojiList);
const currentTabIndex = ref<number>(0);
const currentTabItem = ref<IEmojiListItem>(list?.value[0]);
const currentEmojiList = ref<Array<string>>(list?.value[0]?.list);
const currentConversation = ref();
const emojiPickerDialog = ref();
const emojiPickerListRef = ref();

const onCurrentConversation=(conversation: IConversationModel) => {
	    currentConversation.value = conversation;
	  }

onMounted(()=>{
	TUIStore.watch(StoreName.CONV, {
	  currentConversation:onCurrentConversation,
	});
})
onUnmounted(()=>{
	TUIStore.unwatch(StoreName.CONV, {
	  currentConversation:onCurrentConversation,
	});
})

const toggleEmojiTab = (index: number) => {
  currentTabIndex.value = index;
  currentTabItem.value = list?.value[index];
  currentEmojiList.value = list?.value[index]?.list;
  // 滚动条回滚到顶部
  // 原生 web & h5
  if (!isUniFrameWork) {
    emojiPickerListRef?.value && (emojiPickerListRef.value.scrollTop = 0);
  }
};

const select = (item: any, index: number) => {
  const options: any = {
    name: item,
    type: currentTabItem?.value?.type,
  };
  switch (currentTabItem?.value?.type) {
    case EMOJI_TYPE.BASIC:
      options.url = currentTabItem?.value?.url + basicEmojiMap[item];
	  const name = thisInstance.$tc(options.name)
	  options.name = name || options.name
      emits("insertEmoji", options);
      break;
    case EMOJI_TYPE.BIG:
      sendFaceMessage(index, currentTabItem.value);
      break;
    case EMOJI_TYPE.CUSTOM:
      sendFaceMessage(index, currentTabItem.value);
      break;
    default:
      break;
  }
  isPC && emits("onClose");
};

let touchT = 0, touchE = 0
const touchstart = () => {
	// console.log('touchstart...')
	touchT = new Date().getTime()
}
const touchend = () => {
	// console.log('touchend...')
	touchE = new Date().getTime()
	emits('longpressStop')
}
const eventClick = () => {
	if (touchE - touchT < 300) {
		// console.log('click...')
		emits('deleteEmoji')
	}
}

const eventLongTap = () => {
	// console.log('longpress...')
	emits('longpressToDelete')
}

const sendFaceMessage = (index: number, listItem: IEmojiListItem) => {
  const options = {
    to:
      currentConversation?.value?.groupProfile?.groupID ||
      currentConversation?.value?.userProfile?.userID,
    conversationType: currentConversation?.value?.type,
    payload: {
      index: listItem.index,
      data: listItem.list[index],
    },
    needReadReceipt: isEnabledMessageReadReceiptGlobal(),
  } as SendMessageParams;
  TUIChatService.sendFaceMessage(options);
};

const sendMessage = () => {
  emits("sendMessage");
};
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
