<template>
  <ToolbarItemContainer
    :iconFile="wordsIcon"
    title="常用语"
    :needBottomPopup="true"
    :iconWidth="isUniFrameWork ? '26px' : '20px'"
    :iconHeight="isUniFrameWork ? '26px' : '20px'"
    ref="container"
  >
    <div :class="['words', !isPC && 'words-h5']">
      <div :class="['words-header', !isPC && 'words-h5-header']">
        <span :class="['words-header-title', !isPC && 'words-h5-header-title']">
          {{ TUITranslateService.t("Words.常用语-快捷回复工具") }}
        </span>
        <span
          v-if="!isPC"
          :class="['words-header-close', !isPC && 'words-h5-header-close']"
          @click="closeDialog"
        >
          关闭
        </span>
      </div>
      <ul :class="['words-list', !isPC && 'words-h5-list']">
        <li
          :class="['words-list-item', !isPC && 'words-h5-list-item']"
          v-for="(item, index) in wordsList"
          :key="index"
          @click="selectWord(item)"
        >
          {{ TUITranslateService.t(`Words.${item.value}`) }}
        </li>
      </ul>
    </div>
  </ToolbarItemContainer>
</template>
<script setup lang="ts">
import {
  TUITranslateService,
  TUIStore,
  StoreName,
  IConversationModel,
  SendMessageParams,
  TUIChatService,
} from "@tencentcloud/chat-uikit-engine";
import { ref,onMounted,onUnmounted } from "../../../../adapter-vue";
import ToolbarItemContainer from "../toolbar-item-container/index.vue";
import wordsIcon from "../../../../assets/icon/words.svg";
import { wordsList } from "../../utils/wordsList";
import { isEnabledMessageReadReceiptGlobal } from "../../utils/utils";
import { isPC, isUniFrameWork } from "../../../../utils/env";

const currentConversation = ref<IConversationModel>();
const container = ref();



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

const selectWord = (item: any) => {
  const options = {
    to:
      currentConversation?.value?.groupProfile?.groupID ||
      currentConversation?.value?.userProfile?.userID,
    conversationType: currentConversation?.value?.type,
    payload: {
      text: TUITranslateService.t(`Words.${item.value}`),
    },
    needReadReceipt: isEnabledMessageReadReceiptGlobal(),
  } as SendMessageParams;
  TUIChatService.sendTextMessage(options);
  // 提交后关闭 dialog
  // close dialog after submit evaluate
  container?.value?.toggleDialogDisplay(false);
};

const closeDialog = () => {
  container?.value?.toggleDialogDisplay(false);
};
</script>
<style scoped lang="scss" src="./style/index.scss"></style>
