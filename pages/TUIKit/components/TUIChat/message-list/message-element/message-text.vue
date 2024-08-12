<template>
	<view class="message-text">
		<view class="default_text text-box" v-html="formatText(messageItem.payload.text)" @click="clickItem" />
		
		<view
			v-if="hasTranslates || loadingTranslate"
			:class="['translate_text', `translate_text_${messageItem.flow}`]"
		>
			<u-loading-icon
				v-if="loadingTranslate"
				:style="{ width: 'fit-content' }"
			/>
			<view v-else-if="hasTranslates" class="default_text text-box" v-html="formatText(hasTranslates.text[0].text)" ></view>
		</view>
	</view>
</template>

<script>
import store from '@/store/index.js'
import { TUIStore } from "@tencentcloud/chat-uikit-engine";
export default {
  props: {
    messageItem: {
      type: Object,
      required: true,
    },
  },
	data() {
		return {
		};
	},
	computed: {
		hasTranslates() {
			return store.getters.myMessageTranslates?.[this.messageItem.ID]
		},
		loadingTranslate() {
			return store.state.loadingTranslates[this.messageItem.ID]
		}
	},
	methods: {
    hasUrl(text) {
			let pattern = /(https?:\/\/[^\s]+)/g;
			return pattern.test(text)
		},
    replaceUrlText(url, flow) {
			let color = flow == 'out' ? '#4285F6' : '#4285F6';
			var pattern = /(https?:\/\/[^\s]+)/g;
			url = url.replace(pattern, (match) => {
				return `<uni-text style="color: ${color};text-decoration: underline;" data-url="${match}">${match}</uni-text>`;
			});
			return url
		},
    replaceAtText(text, flow) {
			let color = flow == 'out' ? '#4285F6' : '#4285F6';
			let pat = /@([^_\s]+)_{([^#]+#[^}]+)}/g;
		
			let replaceText = `<uni-text data-mention="$2" style="color:${color}; cursor: pointer;">@$1</uni-text>`;
			text =text? text.replace(pat, replaceText):'';
			
			let replaceText2 = `<uni-text style="color:${color};">${this.$tc('@所有人')}</uni-text>`;
			text =text? text.replace('@所有人', replaceText2):'';
			
			return text
		},
    formatText(text){
			let t = null
			if (this.hasUrl(text)){
				t = this.replaceUrlText(text, this.messageItem.flow)
			} else {
				t=text
			}
			t = this.replaceAtText(t, this.messageItem.flow)
			return t
		},
		clickItem(event) {
			const dataset = event.target.dataset
			if (dataset.mention) { // @行为
				const conversationModel = TUIStore.getConversationModel(this.messageItem.conversationID);
				this.setCardInfo(
					dataset.mention,
					conversationModel, 
					(options) => {
						this.$emit('seeCardInfo', options)
					}
				)
			} else if (dataset.url) { //url
				this.jumpUrl(dataset.url)
			}
		},
	}
};
</script>
<style scoped lang="scss">
.message-text {
  .default_text {}
	.translate_text {
  	margin-top: 6rpx;
  	padding-top: 6rpx;
		&.translate_text_in {
			border-top: 1rpx solid #dadee6;
		}
		&.translate_text_out {
			border-top: 1rpx solid #b1d1e3;
		}
	}
}
.text-box {
  white-space: pre-wrap;
  font-size: inherit;
  word-break: break-word;
  text-size-adjust: none;
}
</style>