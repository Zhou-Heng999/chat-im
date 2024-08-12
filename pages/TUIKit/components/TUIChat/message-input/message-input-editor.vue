<template>
	<div :class="['message-input-container', 'message-input-container-h5']">
		<div class="message-input-mute" v-if="isMuted">
			{{ $tc(muteText) }}
		</div>
		<textarea :adjust-position="false" :style="{'height': `${areaHeight}rpx`}" v-model="inputText"
			:cursor-spacing="20" :confirm-type="null" :confirm-hold="true" maxlength="200"
			placeholder-class="input-placeholder" id="editor" class="message-input-area"
			:placeholder="placeholder" :focus='isFocus' :fixed='false' auto-blur @confirm="handleSendMessage"
			@linechange='onLinechange' @input="onInput" @blur="onBlur" @focus="onFocus" ref="inputRef">
	</textarea>
	</div>
</template>

<script>

	import i18n from '@/i18n/index.js'
	import lan from '@/i18n/lan.json'
	import emoji from '@/i18n/emoji.json'
	import {
		removeTip
	} from '@/utils/util'
	import store from '@/store/index.js'

	export default {
		data() {
			return {
				areaHeight: '35',
				inputText: '',
				inputBlur: true,
				inputContentEmpty: true,
				allInsertedAtInfo: new Map(),
				lineCount: 1,
				deleteTimer: null,
				isFocus: false,

			}
		},
		props: {
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
		},
		computed: {
			// 模拟vue3的watch多个变量
			listen() {
				const {
					inputContentEmpty,
					inputBlur,
					isOnFocus,
					inputText
				} = this
				return [
					inputContentEmpty,
					inputBlur,
					isOnFocus,
					inputText
				]
			},
			editMsgContent() {
				return store.state.editMsgContent
			}
		},
		watch: {
			listen: {
				handler(newVal, oldVal) {
					if (oldVal && newVal !== oldVal) {
						this.$emit("onTyping", this.inputContentEmpty, this.inputBlur);
						this.isFocus = this.isOnFocus
						// 删除文本关闭@

						if (newVal[3] && oldVal[3] && newVal[3].length < oldVal[3].length || newVal[3].length < oldVal[3]
							?.length) {
							this.$emit("onAt", false)
						}
					}
				},
				immediate: true,
				deep: true,
			},
			editMsgContent(data) {
				console.log('watch...')
				if (!data) {
					this.inputText = ''
					return
				} else if (data.cloudCustomData && !data.payload.text) {
					//带有文字的非文本消息
					let j_data = JSON.parse(data.cloudCustomData);
					if (j_data.txt) {
						this.inputText = removeTip(j_data.txt)
					}
				} else {
					const t = removeTip(data.payload.text)
					console.log('removeTip...', t)
					this.inputText = removeTip(data.payload.text)
				}
			}
		},
		mounted() {
			// 改为vue2后，这段代码没有效果，用watch代替了
			// uni.$on('editMsg', function(data) {
			// 	console.log('%c editMsg...', 'color: red', data)
			// 	if (!data) {
			// 		this.inputText = ''
			// 		return
			// 	} else if (data.cloudCustomData && !data.payload.text) {
			// 		//带有文字的非文本消息
			// 		let j_data = JSON.parse(data.cloudCustomData);
			// 		if (j_data.txt) {
			// 			this.inputText = removeTip(j_data.txt)
			// 		}
			// 	} else {
			// 		const t = removeTip(data.payload.text)
			// 		this.inputText = removeTip(data.payload.text)
			// 	}
			// })
		},
		beforeDestory() {
			this.inputText = ''
			store.commit('setEditMsgContent', null)
			uni.$off('editMsg')
		},
		methods: {
			handleSendMessage(e) {
				//发送编辑
				if (store.state.editMsgContent) {
					this.sendEditMessage()
					this.$emit("onAt", false)
					return
				}
				this.$emit("sendMessage", e)
				this.$emit("onAt", false)
			},
			onLinechange(val) {
				let {
					lineCount,
					heightRpx
				} = val.target
				if (lineCount <= 4) {
					this.areaHeight = val.target.heightRpx
				} else {
					let lineH = heightRpx / lineCount
					this.areaHeight = lineH * 4
				}
			},
			addEmoji(emoji) {
				// this.$nextTick(() => {
					this.inputText += emoji.name
				// })
			},
			deleteEmoji() {
				if (this.inputText) {
					let arr = this.inputText.split('')
					arr = arr.splice(0, arr.length - 1)
					this.inputText = arr.join('')
				}
			},
			longpressToDelete() {
				this.longpressStop()
				this.deleteTimer = setInterval(() => {
					this.deleteEmoji()
				}, 120)
			},
			longpressStop() {
				clearInterval(this.deleteTimer)
				this.deleteTimer = null
			},
			insertAt(atInfo) {
				if (!this.allInsertedAtInfo.has(atInfo.id)) {
					this.allInsertedAtInfo.set(atInfo.id, atInfo.label);
				}
				this.inputText += atInfo.label + ' '
				this.isFocus = true
			},
			getEditorContent() {
				const text = this.inputText
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
				return [
					{
						type: "text",
						payload,
					}
				]
			},
			// 处理输入框表情转换成中文
			handleEmojiTransition(content) {
				let emojiObj = emoji.Language

				const arr = content.split('[')
				for (const item of arr) {
					const ind = item.lastIndexOf(']')
					if (ind >= 0) {
						let str = item.substring(0, ind)
						if (str) {
							str = `[${str}]`
							const targetSws = Object.keys(emojiObj).find(code => {
								const translation = emojiObj[code]
								for (const k in translation) {
									if (translation[k] == str) {
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
			},
			resetEditor() {
				this.inputText = ""
				this.inputContentEmpty = true
				store.commit('setEditMsgContent', null)
				this.allInsertedAtInfo.clear()
			},
			setEditorContent (content) {
				this.inputText = content
			},
			onBlur() {
				this.inputBlur = true
				this.isFocus = false
				this.$emit("onBlur")
			},
			onFocus(e) {
				this.inputBlur = false
				this.$emit("onFocus", e.target.height)
			},
			isEditorContentEmpty() {
				this.inputContentEmpty = this.inputText.length ? false : true
			},
			onInput(e) {
				// uniapp 识别 @ 消息
				const text = e.target.value;
				this.isEditorContentEmpty();
				if (this.isGroup && (text.endsWith("@") || text.endsWith("@\n"))) {
					if (!store.state.editMsgContent) {
						this.$emit("onAt", true);
					}
				}
			},
			//发送编辑消息
			sendEditMessage() {
				this.$emit("sendEditMessage")
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import url("../../../assets/styles/common.scss");

	::v-deep uni-textarea {
		width: calc(100% - 15rpx) !important;
	}

	.u-textarea {
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