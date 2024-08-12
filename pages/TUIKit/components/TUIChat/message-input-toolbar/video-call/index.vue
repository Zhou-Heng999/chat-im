<template>
  <ToolbarItemContainer
    :iconFile="fileIcon"
	iconUrl='tb_sp'
    :title="$tc('视频通话')"
    :iconWidth="isUniFrameWork ? '32px' : '21px'"
    :iconHeight="isUniFrameWork ? '25px' : '18px'"
    :needDialog="false"
    @onIconClick="onIconClick"
  >
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
import ToolbarItemContainer from "../toolbar-item-container/index.vue";
import searchFriends from "@/components/search-friends/index.vue";
import fileIcon from "../../../../assets/icon/files.png";
import { isPC, isUniFrameWork } from "../../../../utils/env";
import { isEnabledMessageReadReceiptGlobal } from "../../utils/utils";

const emits = defineEmits(["close",'openSearch']);

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

const onIconClick = () => {
	emits('openSearch')
};

const sendFileMessage = (e: any) => {
  if (e?.target?.files?.length <= 0) {
    return;
  }
  const options = {
    to:
      currentConversation?.value?.groupProfile?.groupID ||
      currentConversation?.value?.userProfile?.userID,
    conversationType: currentConversation?.value?.type,
    payload: {
      file: e?.target,
    },
    needReadReceipt: isEnabledMessageReadReceiptGlobal(),
  } as SendMessageParams;
  TUIChatService.sendFileMessage(options);
  e.target.value = "";
};
</script>
<style lang="scss" scoped>
@import url(../../../../assets/styles/common.scss);
</style>
