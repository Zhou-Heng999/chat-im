<template>
  <div class="revoke">
    <span v-if="message.flow === 'in'">{{
      message.nick || message.from
    }}</span>
    <span v-else-if="message.from === message.revoker">{{
      TUITranslateService.t("TUIChat.您")
    }}</span>
    <span v-else>{{ message.revoker }}</span>
    <span>{{ TUITranslateService.t("TUIChat.撤回了一条消息") }}</span>
    <span
      class="edit"
      v-if="message.flow === 'out' && isEditMsg"
      @click="messageEdit"
      >{{ TUITranslateService.t("TUIChat.重新编辑") }}</span
    >
  </div>
</template>

<script lang="ts" setup>
import { watchEffect, ref } from "../../../../adapter-vue";
import { TUITranslateService, IMessageModel } from "@tencentcloud/chat-uikit-engine";
const props = defineProps({
  isEdit: {
    type: Boolean,
    default: () => false,
  },
  messageItem: {
    type: Object,
    default: () => ({}),
  },
});

const message = ref<IMessageModel>();
const isEditMsg = ref(false);
const emits = defineEmits(["messageEdit"]);
watchEffect(() => {
  message.value = props.messageItem;
  isEditMsg.value = props.isEdit;
});
const messageEdit = () => {
  emits("messageEdit");
};
</script>
<style lang="scss" scoped>
@import "../../../../assets/styles/common.scss";
.revoke {
  display: flex;
  justify-content: center;
  color: #999999;
  align-items: center;
  width: 100%;
  font-size: 12px;
  margin-bottom: 10px;
  .edit {
    padding: 0 5px;
    color: #006eff;
  }
}
</style>
