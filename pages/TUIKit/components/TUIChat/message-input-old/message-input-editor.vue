<template>
  <div
    :class="['message-input-container', !isPC && 'message-input-container-h5']"
  >
    <div class="message-input-mute" v-if="props.isMuted">
      {{ $tc(props.muteText) }}
    </div>
    <textarea
    :adjust-position='true'
	:style="{'height': `${areaHeight}rpx`}"
      v-model="inputText"
      :cursor-spacing="20"
      :confirm-type="null"
      :confirm-hold="true"
      maxlength="200"
      placeholder-class="input-placeholder"
      id="editor"
      class="message-input-area"
      :placeholder="props.placeholder"
	  :focus='isFocus'
	  :fixed='false'
      auto-blur
      @confirm="handleSendMessage"
	  @linechange='onLinechange'
      @input="onInput"
      @blur="onBlur"
      @focus="onFocus"
      ref="inputRef"
    >
	</textarea>
  </div>
</template>
<script lang="ts" setup>
import { ref, nextTick, watch, onMounted, onUnmounted } from "../../../adapter-vue";
import { ISendMessagePayload } from "../../../interface";
import { isPC } from "../../../utils/env";
import { TUIGlobal } from "../../../utils/universal-api/index";
import TUIChatEngine,{
		TUIStore,
		StoreName,
		IMessageModel,
	} from "@tencentcloud/chat-uikit-engine";
	
import i18n from '@/i18n/index.js'
import lan from '@/i18n/lan.json'
import emoji from '@/i18n/emoji.json'
import {removeTip} from '@/utils/util'
import store from '@/store/index.js'

const props = defineProps({
  placeholder: {
    type: String,
    default: "this is placeholder",
  },
  replayOrReferenceMessage: {
    type: Object,
    default: () => ({}),
    required: false,
  },
  isMuted: {
    type: Boolean,
    default: true,
  },
  muteText: {
    type: String,
    default: "",
  },
  enableInput: {
    type: Boolean,
    default: true,
  },
  enableAt: {
    type: Boolean,
    default: true,
  },
  enableTyping: {
    type: Boolean,
    default: true,
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
  isOnFocus: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(["sendMessage", "onTyping", "onFocus", "onAt", "sendEditMessage"]);
const areaHeight=ref('35')
const inputText = ref("");
const inputRef = ref();
const inputBlur = ref(true);
const inputContentEmpty = ref(true);
const allInsertedAtInfo = new Map();
const lineCount=ref(1)
const handleSendMessage = (e) => {
	console.log(e)
	//发送编辑
	if(store.state.editMsgContent){
		sendEditMessage()
		emits("onAt", false);
		return
	}
  emits("sendMessage", e);
  emits("onAt", false);
};
const onLinechange=(val)=>{
	let {lineCount,heightRpx}=val.target
	if(lineCount<=4){
		areaHeight.value=val.target.heightRpx
	}else{
		let lineH=heightRpx/lineCount
		areaHeight.value=lineH*4
	}
	// lineCount.value=
}

const addEmoji = (emoji: any) => {
  nextTick(() => {
    inputText.value += emoji?.name;
  });
};

const deleteEmoji = () => {
    // nextTick(() => {
	    if(inputText.value) {
			let arr = inputText.value.split('')
			arr = arr.splice(0, arr.length-1)
			inputText.value = arr.join('')
	    }
    // });
}

let deleteTimer = ref(null)
const longpressToDelete = () => {
	longpressStop()
	deleteTimer.value = setInterval(() => {
		deleteEmoji()
	}, 120)
}

const longpressStop = () => {
	clearInterval(deleteTimer.value)
	deleteTimer.value = null
}

const isFocus=ref(false)
const insertAt = (atInfo: any) => {
  if (!allInsertedAtInfo?.has(atInfo?.id)) {
    allInsertedAtInfo?.set(atInfo?.id, atInfo?.label);
  }
  inputText.value += atInfo?.label+' ';
  // let str = inputText.value
  // let atIndex = inputText.value.indexOf("@​"); // 找到 "@" 符号的位置
  // inputText.value = str.substring(0, atIndex + 2) + `${atInfo?.label+' '}` + str.substring(atIndex + 2);
  isFocus.value=true
  // setTimeout(()=>{
	 //  isFocus.value=false
  // },500)
};

const getEditorContent = () => {
  // const text = inputText.value;
  const text = handleEmojiTransition(inputText.value)
  const atUserList: Array<string> = [];
  allInsertedAtInfo?.forEach((value: string, key: string) => {
    if (text?.includes("@" + value)) {
      atUserList.push(key);
    }
  });
  const payload: ISendMessagePayload = {
    text,
  };
  if (atUserList?.length) {
    payload.atUserList = atUserList;
  }
  return [
    {
      type: "text",
      payload,
    },
  ];
};

// 处理输入框表情转换成中文
const handleEmojiTransition = (content) => {
	let emojiObj = emoji.Language
	
	const arr = content.split('[')
	for(const item of arr) {
		const ind = item.lastIndexOf(']')
		if(ind >= 0) {
			let str = item.substring(0, ind)
			if(str) {
				str = `[${str}]`
				const targetSws = Object.keys(emojiObj).find(code => {
				  const translation = emojiObj[code]
				  for(const k in translation) {
					  if(translation[k] == str) {
						  content = content.replace(str, translation.name_zh)
						  break
					  }
				  }
				  return
				})
			}
		}
	}
	return content
}

const resetEditor = () => {
  inputText.value = "";
  inputContentEmpty.value = true;
  store.commit('setEditMsgContent',null)
  allInsertedAtInfo?.clear();
};

const setEditorContent = (content: any) => {
  inputText.value = content;
};

const onBlur = () => {
  inputBlur.value = true;
  isFocus.value=false
};

const onFocus = (e: any) => {
	// console.log(e)
  inputBlur.value = false;
  emits("onFocus", e?.target?.height);
};

const isEditorContentEmpty = () => {
  inputContentEmpty.value = inputText?.value?.length ? false : true;
};

const onInput = (e: any) => {
  // uniapp 识别 @ 消息
  const text = e.target.value;
  isEditorContentEmpty();
  if (props.isGroup && (text.endsWith("@") || text.endsWith("@\n"))) {
    // TUIGlobal?.hideKeyboard();
	if(!store.state.editMsgContent){
		emits("onAt", true);
	}
  }
};

//发送编辑消息
const sendEditMessage = () => {
	emits("sendEditMessage")
};

watch(
  () => [inputContentEmpty.value, inputBlur.value, props.isOnFocus,inputText.value],
  (newVal: any, oldVal: any) => {
    if (newVal !== oldVal) {
		// console.log(isFocus.value)
      emits("onTyping", inputContentEmpty.value, inputBlur.value);
	  isFocus.value = props.isOnFocus
	  // 删除文本关闭@
	  
	  if(newVal[3] && oldVal[3] && newVal[3].length<oldVal[3].length||newVal[3].length<oldVal[3]?.length){
		  emits("onAt", false)
	  }
    }
  },
  {
    immediate: true,
    deep: true,
  }
)

onMounted(() => {
	uni.$on('editMsg',function(data){
		console.log(data)
		if(!data){
			inputText.value = ''
			return
		}else if(data.cloudCustomData && !data.payload.text){
			//带有文字的非文本消息
			let j_data = JSON.parse(data.cloudCustomData);
			if(j_data.txt){
				inputText.value = removeTip(j_data.txt)
			}
		}else {
			inputText.value = removeTip(data.payload.text);
		}
  	})
});

onUnmounted(() => {
	store.commit('setEditMsgContent', null)
	uni.$off('editMsg')
});

defineExpose({
  getEditorContent,
  addEmoji,
  insertAt,
  resetEditor,
  setEditorContent,
  deleteEmoji,
  longpressToDelete,
  longpressStop
});
</script>
<style lang="scss" scoped>
@import url("../../../assets/styles/common.scss");
 ::v-deep uni-textarea{
	width: calc(100% - 15rpx) !important;
}
.u-textarea{
	background: transparent !important;
	padding: 0;
}
.message-input {
  &-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: calc(100% - 13px);
    // width: calc(100% - 20px);
    padding: 3px 10px 10px 10px;
    // overflow: hidden;
	position: relative;
  }
  &-area {
    // flex: 1;
    display: flex;
    overflow-y: hidden;
    min-height: 20px;
  }
  &-mute {
    flex: 1;
    display: flex;
    color: #999999;
    font-size: 14px;
    justify-content: center;
    align-items: center;
  }
}
.message-input-container-h5 {
  flex: 1;
  height: auto;
  background: #f3f3f3;
  border-radius: 9.4px;
  padding: 8px 8px 8px 10px;
  font-size: 16px !important;
      white-space: pre-wrap;
  // max-height: 86px;
}
.ql-container {
  ::v-deep .ql-blank:before {
    font-style: initial;
  }
}
</style>
