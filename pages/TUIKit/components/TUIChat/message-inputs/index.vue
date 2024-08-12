<template>
  <div  :class="['message-input',!isFocusTextarea?'has_safe_bottom':''] " @click.stop='onStop' >
    <div v-if="!showAudio" class="header-content">
      <MessageQuote />
      <MessageEdit v-if="editMsgContent" />
      <MessageInputAt
        ref="messageInputAtRef"
        class="message_input_at"
        @insertAt="insertAt"
        @onAtListOpen="onAtListOpen"
      />
    </div>

    <div class="content">
      <MessageInputAudio
        :isAudioMainShow="showAudio"
        @switchAudio="switchAudio"
      />
      <textarea
        v-show="!showAudio"
        ref="textarea"
        class="uni-input"
        :value="inputValue"
		:maxlength='500'
        :placeholder="placeholder"
        :focus="isFocusTextarea"
        :adjust-position="false"
        :style="{ height: areaHeight + 'rpx' } "
        @input="inputInput"
        @focus="focusInput"
        @blur="blurTextarea"
        @linechange='linechangeTextarea'
      />
      <imageIcon v-show="showEmojiList && !isFocusTextarea" :size="54" class="icon_tool" name="tb_bj" @click="clickTbBj" />
      <imageIcon v-show="!(showEmojiList && !isFocusTextarea)" :size="54" class="icon_tool" name="sticker2" @click="clickEmoji" />
      <imageIcon  v-show="inputValue.length === 0" :size="54" class="icon_tool" name="adds" @click="clickOutlinedAdd" />
      <button
        v-if="!editMsgContent"
        @touchend.prevent="clickSend"
        :class="{ 'primary-btn': true, 'btn-hidden': inputValue.length === 0 }"
      >
        {{ $tc('发送') }}
      </button>
      <button
        v-else
        @touchend.prevent="clickEdit"
        :class="{ 'primary-btn': true, 'btn-hidden': inputValue.length === 0 }"
      >
        {{ $tc('编辑') }}
      </button>
    </div>

    <div v-show="showFootContent" class="foot-content" :style="{ height: keyboardHeight_ ? (keyboardHeight_ + 'px') : 'auto' }">
      <EmojiList v-if="showEmojiList" :show="showEmojiList" @change="changeEmojiList" />
      <MessageInputToolbar
        v-if="showToolbar"
				class="TUI-chat-message-input-toolbar TUI-chat-h5-message-input-toolbar margin_top_0"
				@insertEmoji="insertEmoji"
        @sendFile='sendFile'
      />
    </div>
  </div>
</template>
<script>
import store from '@/store/index.js'
import EmojiList from './components/emojiList'
import MessageQuote from "../message-input/message-input-quote";
import MessageEdit from "../message-input/message-input-edit";
import MessageInputAudio from '../message-input/message-input-audio.vue'
import MessageInputToolbar from '../message-input-toolbar'
import MessageInputAt from "../message-input/message-input-at/index.vue";
import { sendMessages, sendTyping } from "../utils/sendMessage";
export default {
  components: {
    MessageQuote,
    MessageEdit,
    MessageInputAt,
    MessageInputAudio,
    EmojiList,
    MessageInputToolbar
  },
  props: {
    conversation: {
      type: Object,
      required: true,
    },
    placeholder: {
      type: String,
      required: false,
      default: ''
    },
  },
  data() {
    return {
      keyboardHeight_: 0,
      inputValue: '',
      areaHeight: 60,
      showAudio: false,
      isFocusTextarea: false,
      allInsertedAtInfo: new Map(),
      atInfoList: [],
      showEmojiList: false,
      showToolbar: false,
    }
  },
  computed: {
    editMsgContent() {
      return store.state.editMsgContent
    },
    showFootContent() {
      return !this.showAudio && (this.showEmojiList || this.showToolbar || this.keyboardHeight_)
    }
  },
  mounted() {
    uni.onKeyboardHeightChange(this.onKeyboardHeightChange)
  },
  beforeDestroy() {
    uni.offKeyboardHeightChange(this.onKeyboardHeightChange)
  },
  methods: {
    onKeyboardHeightChange(options) {
      // if (!this.keyboardHeight_) {
      //   if (this.showToolbar) this.showToolbar = false
      //   if (this.showEmojiList) this.showEmojiList = false
      // }
      this.keyboardHeight_ = options.height
    },
	onStop() {
		uni.$emit('closeMessageTool', {
			show: false
		})
	},
    switchAudio(value) {
      this.showAudio = value
    },
	clickInput(){
		// this.$emit('closeToolbar')
	},
		onAt(show) {
			this.$refs.messageInputAtRef.toggleAtList(show)
		},
    getEditorContent() {
      const text = this.inputValue
			const atUserList = [];
			this.allInsertedAtInfo.forEach((value, key) => {
				if (text.includes("@" + value)) {
					atUserList.push(key);
				}
			});
			const payload = {
				text,
			}
			if (atUserList.length) {
				payload.atUserList = atUserList
			}
			return {
				type: "text",
				payload,
			}
    },
    insertAt(atInfo) {
			this.atInfoList = [...this.atInfoList, atInfo]
      if (!this.allInsertedAtInfo.has(atInfo.id)) {
				this.allInsertedAtInfo.set(atInfo.id, atInfo.label);
			}
			this.inputValue += atInfo.label + ' '
			this.isFocusTextarea = true
    },
    onAtListOpen() {
      this.isFocusTextarea = false
    },
    inputInput(e) {
      this.inputValue = e.detail.value
      if (this.conversation.groupProfile && (this.inputValue.endsWith("@") || this.inputValue.endsWith("@\n"))) {
				if (!store.state.editMsgContent) {
					this.onAt(true);
				}
			}
    },
    focusInput(e) {
      this.isFocusTextarea = true
    },
    blurTextarea() {
      this.keyboardHeight_ = 0
      this.isFocusTextarea = false
    },
    linechangeTextarea(e) {
      const { lineCount, heightRpx } = e.target
			if (lineCount <= 4) {
				this.areaHeight = heightRpx
			} else {
				const lineH = heightRpx / lineCount
				this.areaHeight = lineH * 4
			}
    },
    clickTbBj() {
		this.showAudio=false
      this.isFocusTextarea = true
    },
    clickEmoji() {
	  this.showAudio=false
      if (this.showEmojiList) {
        if (this.keyboardHeight_) {
          this.keyboardHeight_ = 0
        } else {
          this.showEmojiList = false
        }
      } else {
        this.showEmojiList = true
        if (this.showToolbar) {
          this.showToolbar = false
        }
      }
    },
    insertEmoji() {},
    clickOutlinedAdd() {
		this.showAudio=false
      if (this.showToolbar) {
        if (this.keyboardHeight_) {
          this.keyboardHeight_ = 0
        } else {
          this.showToolbar = false
        }
      } else {
        this.showToolbar = true
        if (this.showEmojiList) {
          this.showEmojiList = false
        }
      }
    },
    sendFile(e) {
      this.$emit('sendFile', e)
    },
    clickSend() {
      const message = this.getEditorContent()
      if (message.payload.atUserList) {
				let atList = [...new Map(this.atInfoList.map(item => [item.id, item])).values()]
				let oldText = message.payload.text
				atList.forEach(item => {
					if (oldText.indexOf(`@${item.label}`) != -1) {
						let regex = new RegExp(`@${item.label}`, 'g');
						if (item.id != '__kImSDK_MesssageAtALL__') {
							oldText = oldText.replace(regex, `@${item.label}_{${item.id}}`)
						}

					}
				})
				message.payload.text = oldText
				this.atInfoList = []
			}
      const messageList = [message]
      this.inputValue = ''
      sendMessages(
		  	messageList,
		  	this.conversation
		  ).then(() => {
        // this.$emit('sendMessage');
      })
    },
    clickEdit() {
			let sendContent = store.state.editMsgContent;
			// 判断非文本
			if (sendContent.cloudCustomData) {
				let j_data = JSON.parse(sendContent.cloudCustomData);
				j_data.txt = this.inputValue
				sendContent.cloudCustomData = JSON.stringify(j_data)
			} else {
				sendContent.payload.text = this.inputValue;
			}

			if (sendContent.atUserList.length > 0) {
				let atList = sendContent.atUserList
				let oldText = sendContent.payload.text
				atList.forEach(item => {
					if (oldText.indexOf(`@${this.deleteChannel(item)}`) != -1) {
						let regex = new RegExp(`@${this.deleteChannel(item)}`, 'g');
						oldText = oldText.replace(regex, `@${this.deleteChannel(item)}_{${item}}`)
					}
				})
				sendContent.payload.text = oldText
			}
      this.inputValue = ''
			store.commit('setEditMsgContent', null)
			TUIChatEngine.chat.modifyMessage(sendContent).then(res => {
				// console.log('编辑成功', res)
			})
    },
    changeEmojiList(item) {
      this.inputValue = this.inputValue + item
    },
    getName() {},
    toggleBox() {},
    hideBox() {
      this.showEmojiList = false
      this.showToolbar = false
      this.isFocusTextarea = false
      this.keyboardHeight_ = 0
    }
  }
}
</script>
<style scoped lang="scss">
@import url("../../../assets/styles/common.scss");
.has_safe_bottom{
	padding-bottom: env(safe-area-inset-bottom);
}
.message-input {
  border-top: 1px solid #eeeeee;
  // position: fixed;
  // z-index: 999;
  // left: 0;
  // right: 0;
  // bottom: 0;
  .header-content {
    position: relative;
    .message_input_at {
      bottom: 0px !important;
    }
  }

  .content {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding: 15rpx;
    min-height: 90rpx;
    background-color: #f9f9f9;
    .uni-input {
      box-sizing: border-box;
      margin: 0rpx 15rpx;
      padding: 0rpx 15rpx;
      flex: 1;
      line-height: 60rpx;
      height: 100%;
      background-color: #fff;
      border-radius: 12rpx;
    }

    .icon_tool {
      margin: 0px 10rpx;
    }

    .primary-btn {
      margin-left: 20rpx;
      width: 120rpx;
		  height: 60rpx;
		  line-height: 60rpx;
		  text-align: center;
		  color: #fff;
		  border-radius: 12rpx;
		  background-color: #07c160;
      font-size: 28rpx;
      transition: 0.2s;
      opacity: 1;
      &:active {
        opacity: 0.6;
      }
    }

    .btn-hidden {
      margin-left: 0px;
      padding: 0px;
      width: 0px;
      overflow: hidden;
      opacity: 0;
    }

  }

  .foot-content {
    .margin_top_0 {
      margin-top: 0px;
    }
  }
}
</style>