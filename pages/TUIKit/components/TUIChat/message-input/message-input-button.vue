<template>
  <div :class="['message-input-button', !isPC && 'message-input-button-h5']">
    <button
      v-if="props.enableSend"
      class="message-input-button-cont"
      data-type="text"
      :disabled="false"
      @click="sendMessage"
    >
      <p class="message-input-button-hover">
        {{ TUITranslateService.t("TUIChat.按Enter发送，Ctrl+Enter换行") }}
      </p>
      {{ TUITranslateService.t("发送") }}
    </button>
  </div>
</template>

<script>
	import { TUITranslateService } from "@tencentcloud/chat-uikit-engine";
	import { ref } from "../../../adapter-vue";
	import { isPC } from "../../../utils/env";
	
	export default {
		props: {
			enableSend: {
			  type: Boolean,
			  default: true,
			}
		},
		data() {
			return {
				isPC,
				TUITranslateService
			}
		},
		methods: {
			sendMessage() {
				this.$emit("sendMessage")
			}
		}
	}
</script>

<style scoped lang="scss">
@import url("../../../assets/styles/common.scss");
.message-input-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
  &-h5 {
    position: static;
  }
  &-cont {
    padding: 8px 20px;
    border-radius: 4px;
    border: none;
    font-size: 14px;
    text-align: center;
    line-height: 20px;
    font-weight: 400;
    background: #006eff;
    color: #ffffff;
    letter-spacing: 0;
    cursor: pointer;
  }
  &:hover {
    .message-input-button-hover {
      display: flex;
    }
  }
  &-hover {
    display: none;
    justify-content: center;
    align-items: center;
    position: absolute;
    right: 120%;
    word-break: keep-all;
    height: 30px;
    white-space: nowrap;
    top: 0;
    bottom: 0;
    margin: auto 0;
    padding: 5px 10px;
    border-radius: 3px;
    background: #000000;
    color: #ffffff;
    opacity: 0.3;

    &::before {
      content: "";
      position: absolute;
      width: 0;
      height: 0;
      right: -20px;
      border: 10px solid transparent;
      border-left: 10px solid #000000;
    }
  }
}
</style>
