<template>
  <div
    :class="[
      'input-quote-container',
      !isPC && 'input-quote-container-h5',
      isUniFrameWork && 'input-quote-container-uni'
    ]"
  >
    <div class="input-quote-content flex-between">
      <div class="def-quote">
		  <div class="def-quote--sender">{{ $tc('编辑消息') }}</div>
		  <div class="def-quote--text pd-tb-10" style="height: 40rpx;">{{ editContentText }}</div>
      </div>
      <Icon class="input-quote-close-icon" :file="closeIcon" width="11px" height="11px" @onClick="cancelEdit" />
    </div>
  </div>
</template>
  
<script setup lang="ts">
import { ref, computed } from "../../../../adapter-vue";
import TUIChatEngine, {
  TUIStore,
  StoreName,
  TUITranslateService,
  IMessageModel,
} from "@tencentcloud/chat-uikit-engine";
import Icon from "../../../common/Icon.vue";
import closeIcon from "../../../../assets/icon/icon-close.svg";
import { isPC, isUniFrameWork } from "../../../../utils/env";
import {tc,removeTip} from '@/utils/util'
import store from '@/store/index.js'

const props = defineProps(["currentFunction"]);

const TYPES = TUIChatEngine.TYPES;
const quoteMessage = ref<IMessageModel>();

const editContentText = computed(() => {
	let message = store.state.editMsgContent;
	//带有文字的非文本消息
	let cloudCustomData = message.cloudCustomData
	if(cloudCustomData){
	  let j_data = JSON.parse(cloudCustomData);
	  if(j_data.txt){
	    return removeTip(j_data.txt)
	  }
	}
	
	return removeTip(message.payload.text)
});

function cancelEdit() {
  store.commit('setEditMsgContent', null)
  uni.$emit('editMsg', null)
}

</script>
  
<style lang="scss" scoped>
.input-quote-container {
  // margin: 5px 100px 5px 8px;
  margin: 0 !important;
  display: flex;
  flex: 0 1 auto;
  position: absolute;
  top: -100rpx;
  left: 0;
  .input-quote-content {
	position: relative;
    display: flex;
    flex: 0 1 auto;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 14px;
    align-items: center;
    line-height: 16px;
    width: 750rpx;
    box-sizing: border-box;
    min-width: 0;
	background: #FCFCFC;
	box-shadow: 0px -1px 1px #e9e9e9;
	&::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 6px;
		transform: translateY(-50%);
		width: 2px;
		height: 68%;
		background: #4285F6;
	}

    .max-one-line {
      flex: 0 1 auto;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
	
	.def-quote {
		display: flex;
		flex-direction: column;
		justify-content: center;
		.def-quote--sender {
			color: #4285F6;
		}
		.def-quote--text {
			word-break: break-all;
			overflow: hidden;
			display: -webkit-box;
			-webkit-line-clamp: 1;
			-webkit-box-orient: vertical;
		}
	}
  }

  .input-quote-close-icon {
    margin-left: 5px;
    padding: 5px;
  }
}

.input-quote-container-h5 {
  @extend .input-quote-container;
  margin: 5px 0 0;
}

.input-quote-container-uni {
  @extend .input-quote-container;
  margin: 5px 60px 0 30px;
}
</style>