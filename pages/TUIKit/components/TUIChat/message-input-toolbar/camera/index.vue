<template>
	<view>
		<ToolbarItemContainer iconUrl='tb_wjj' :title="$tc('相机')" :needDialog="false" @onIconClick="onIconClick">
		</ToolbarItemContainer>
	</view>
</template>

<script setup>
	import {
		TUIChatService,
		TUIStore,
		StoreName,
		IConversationModel,
		SendMessageParams,
	} from "@tencentcloud/chat-uikit-engine"
	import ToolbarItemContainer from "../toolbar-item-container/index.vue";
	import {
		TUIGlobal
	} from "../../../../utils/universal-api/index";
	import {
		isEnabledMessageReadReceiptGlobal
	} from "../../utils/utils";

	import {
		ref,
		computed,
		onMounted,
		onUnmounted
	} from "../../../../adapter-vue";
	
	const emits = defineEmits(["sendFile"])

	const currentConversation = ref(null)

	const onCurrentConversation=(conversation) => {
				currentConversation.value = conversation
			}
	
	onMounted(()=>{
		TUIStore.watch(StoreName.CONV, {
			currentConversation:onCurrentConversation
		})
	})
	onUnmounted(()=>{
		TUIStore.unwatch(StoreName.CONV, {
			currentConversation:onCurrentConversation
		})
	})

	const onIconClick = () => {
		uni.navigateTo({
			url: '/pages/TUIKit/components/TUIChat/message-input-toolbar/camera/camera',
			events: {
				someEvent(data) {
					console.log('someEvent...', data)
					if (data.source === 'picture') {
						sendImageMessage(data)
					}else {
						sendVideoMessage(data)
					}
				}
			}
		})
	}

	const sendImageMessage = async (file) => {
		if (!file) return
		
		console.log('发送图片', file)
		const options = {
			to: currentConversation.value?.groupProfile?.groupID ||
				currentConversation.value?.userProfile?.userID,
			conversationType: currentConversation.value?.type,
			payload: {
				file,
			},
			needReadReceipt: isEnabledMessageReadReceiptGlobal(),
		}
		
		options.fileFun='sendImageMessage'
		console.log('options...', options)
		emits('sendFile',options)
		return
		
		// todo: 需要处理uniapp文件没有宽高的变形问题，需要linda看看
		TUIChatService.sendImageMessage(options)
		uni.navigateBack()
	}
	
	const sendVideoMessage = (file) => {
	  if (!file) return
	  const options = {
	    to:
	      currentConversation?.value?.groupProfile?.groupID ||
	      currentConversation?.value?.userProfile?.userID,
	    conversationType: currentConversation?.value?.type,
	    payload: {
	      file,
	    },
	    needReadReceipt: isEnabledMessageReadReceiptGlobal(),
	  }
	  options.fileFun='sendVideoMessage'
	  console.log('options...', options)
	  emits('sendFile',options)
	  return
	  TUIChatService.sendVideoMessage(options)
	  uni.navigateBack()
	}
</script>

<style lang="scss" scoped>
	.camera {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 100;
	}
</style>