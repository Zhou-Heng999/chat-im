<template>
	<ToolbarItemContainer iconUrl='tb_wjj' :title="$tc('文件')" :iconWidth="isUniFrameWork ? '32px' : '21px'"
		:iconHeight="isUniFrameWork ? '25px' : '18px'" :needDialog="false" 
		@onIconClick="handleUploadClick"
		>
		<!-- @onIconClick="onTextUpload" -->
		<div :class="['file-upload', !isPC && 'file-upload-h5']">
			<!-- <input
        title="文件"
        type="file"
        data-type="file"
        accept="*"
        @change="sendFileMessage"
        ref="inputRef"
      /> -->
			<xe-upload ref="xeRef" :options="uploadOptions" @callback="handleUploadCallback"></xe-upload>
		</div>
	</ToolbarItemContainer>
</template>
<script lang="ts" setup>
	import TUIChatEngine,{
		TUIChatService,
		TUIStore,
		StoreName,
		IConversationModel,
		SendMessageParams,
	} from "@tencentcloud/chat-uikit-engine";
	import { ref,onMounted,onUnmounted } from "../../../../adapter-vue";
	import ToolbarItemContainer from "../toolbar-item-container/index.vue";
	import fileIcon from "../../../../assets/icon/files.png";
	import { isPC, isUniFrameWork } from "../../../../utils/env";
	import { isEnabledMessageReadReceiptGlobal } from "../../utils/utils";
	import xeUpload from '@/uni_modules/xe-upload/components/xe-upload/xe-upload.vue'
	const emits = defineEmits(["close",'sendFile']);

	const inputRef = ref();
	const currentConversation = ref<IConversationModel>();

	
	const onCurrentConversation=(conversation : IConversationModel) => {
			currentConversation.value = conversation;
		}
	onMounted(()=>{
		TUIStore.watch(StoreName.CONV, {
			currentConversation: onCurrentConversation,
		});
	})
	onUnmounted(()=>{
		TUIStore.unwatch(StoreName.CONV, {
			currentConversation: onCurrentConversation,
		});
	})
	// 上传附件
	const uploadOptions = ref({})
	const xeRef = ref(null)
	const handleUploadClick = () => {
		// 使用默认配置则不需要传入第二个参数
		// type: ['image', 'video', 'file'];
		xeRef.value.upload('file');
	}
	const handleUploadCallback = (e) => {
		console.log(666,e)
		let info=e.data[0]
		let tempFile=info.tempFile?info.tempFile:info
		if(!tempFile.path)tempFile.path=info.tempFilePath
		info.tempFilePaths=[info.tempFilePath]
		info.tempFiles=[tempFile]
		
		sendFileMessage(info)
		// e.type: ['choose', 'success', 'warning']
		// choose 是options没有传入url，返回临时链接时触发
		// success 是上传成功返回对应的数据时触发
		// warning 上传或者选择文件失败触发
		// ......
	}
	const onIconClick = () => {
		if (isUniFrameWork) {
			// uniapp app 不支持选择文件发送
			return;
		} else {
			inputRef?.value?.click && inputRef?.value?.click();
		}
	};
	const onTextUpload=()=>{
		uni.chooseFile({
		  count: 1,
		  success: function(res) {
			  console.log(111,res)
			  const options = {
			  	to:
			  		currentConversation?.value?.groupProfile?.groupID ||
			  		currentConversation?.value?.userProfile?.userID,
			  	conversationType: currentConversation?.value?.type,
			  	payload: {
			  		file:res,
			  	},
			  	// needReadReceipt: isEnabledMessageReadReceiptGlobal(),
			  }
			  // TUIChatService.sendFileMessage(options);
			  
		  }})
	}

	const sendFileMessage = (file) => {
		if (!file) {
			return;
		}
		console.log('file',file)
		const options = {
			to:
				currentConversation?.value?.groupProfile?.groupID ||
				currentConversation?.value?.userProfile?.userID,
			conversationType: currentConversation?.value?.type,
			payload: {
				file:file,
			},
			// needReadReceipt: isEnabledMessageReadReceiptGlobal(),
		}
		options.fileFun='sendFileMessage'
		emits('sendFile',options)
		return
		console.log('options',options)
		TUIChatService.sendFileMessage(options).then(res => {
			console.log('sendFileMessage success...', res)
		}).catch(err => {
			console.log('sendFileMessage error...', err)
		})
		// uni.chooseFile({
		//   count: 1,
		//   success(){
			  
		//   }})
		console.log('file',file)
		
	// let message=TUIChatEngine.chat.createFileMessage(options)
	// TUIChatEngine.chat.sendMessage(message)
		console.log('options',TUIChatService)
		// e.target.value = "";
	};
</script>
<style lang="scss" scoped>
	@import url(../../../../assets/styles/common.scss);
</style>