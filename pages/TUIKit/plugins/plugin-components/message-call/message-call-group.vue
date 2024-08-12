<template>
  <div
    v-if="isCallMessage && conversationType === TYPES.CONV_GROUP"
    :class="{ blinkText: isBlink }"
  >
    {{ custom }}
  </div>
</template>

<script setup lang="ts">
import { computed } from "../../../adapter-vue";
import TUIChatEngine, { IMessageModel } from "@tencentcloud/chat-uikit-engine";
import { tc } from '@/utils/util'

interface IProps {
  message: IMessageModel;
  signalingInfo: any;
  customContent: any;
  blinkMessageIDList?: string[];
}

const props = withDefaults(defineProps<IProps>(), {
  message: () => ({}),
  signalingInfo: () => ({}),
  customContent: () => ({}),
  blinkMessageIDList: () => [],
});

const TYPES = TUIChatEngine.TYPES;
const isCallMessage = computed(() => !!props.signalingInfo);
const conversationType = computed(() => props.message?.conversationType);
const custom = computed(() => {
	let content = props.customContent?.custom.replace(/[^#]+\#/g, "")
	content = content.replace('发起通话', tc('发起通话'))
	content = content.replace('发起通话', tc('发起通话'))
	content = content.replace('拒绝通话', tc('拒绝通话'))
	content = content.replace('取消通话', tc('取消通话'))
	content = content.replace('无应答', tc('无应答'))
	content = content.replace('结束群聊', tc('结束群聊'))
	return content
})

const isBlink = computed(() => {
  if (props.message?.ID) {
    return props.blinkMessageIDList?.includes(props.message.ID);
  }
  return false;
});


</script>

<style scoped lang="scss">
@keyframes blinkText {
  50% {
    color: #ff9c19;
  }
}
.blinkText {
  animation: blinkText 1s linear 3;
}
</style>
