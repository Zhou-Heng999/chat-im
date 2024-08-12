<template>
	<div v-if="quoteContent" class="def-quote" :class="[ message.flow === 'out' ? 'out' : 'in' ]"
		@click="scrollToOriginalMessage">
		<div class="def-quote--sender">{{quoteContent.messageSender}}: </div>
		<div class="def-quote--text" v-if="getFileInfo(message)" > 
		<imageIcon class="" width="80rpx" height="80rpx" :src="fileData">
		</imageIcon></div>
		<div class="def-quote--text" v-else >
			{{handleQuote(quoteContent.messageAbstract)}}
		<!-- {{removeTip(quoteContent.messageAbstract==''?chatHisTitle:quoteContent.messageAbstract=='[自定义消息]'?'[个人名片]':quoteContent.messageAbstract)}} -->
		</div>
		<!-- {{quoteContent}} -->
	</div>
</template>

<script lang="ts" setup>
	import TUIChatEngine,{
		TUIStore,
		StoreName,
		IMessageModel,
		TUITranslateService
	} from "@tencentcloud/chat-uikit-engine";
	import { computed,ref,onMounted } from "../../../../../adapter-vue";
	import { isUniFrameWork } from "../../../../../utils/env";
	import { getBoundingClientRect, getScrollInfo } from "../../../../../utils/universal-api/domOperation";
	import { Toast, TOAST_TYPE } from "../../../../../components/common/Toast/index";
	import type { ICloudCustomData, IQuoteContent } from "./interface.d.ts";
	import { tc } from '@/utils/util';
	import { ListMixin } from '@/mixin/list';

	export interface IProps {
		message : IMessageModel;
	}

	export interface IEmits {
		(e : "scrollTo", scrollHeight : number) : void;
		(e : "blinkMessage", messageID : string | undefined) : void;
		(e : "scrollToOriginalMessage", messageID : string | undefined) : void;
		
	}

	const emits = defineEmits<IEmits>();
	const props = withDefaults(defineProps<IProps>(), {
		message: () => ({} as IMessageModel),
	});

	let selfAddValue = 0;
	let messageList : IMessageModel[] = [];

	// TUIStore.watch(StoreName.CHAT, {
	// 	messageList(list : IMessageModel[]) {
	// 		console.log('def-message=============',)
	// 		messageList = list;
	// 	},
	// });
	
	const currentConversationID=ref(null)
	TUIStore.watch(StoreName.CONV, {
		currentConversationID: (conversationID : string) => {
		currentConversationID.value = conversationID;
		},
		})
		const fileData=ref('')
		const chatHisTitle=ref('')
		const getHis=()=>{
			TUIChatEngine.chat.getMessageListHopping({ conversationID: currentConversationID.value, sequence:quoteContent.value.messageSequence, count:1, direction:0 }).then(res=>{
				console.log('res',res.data.messageList)
				chatHisTitle.value=res.data.messageList[0].payload.title
			})
		}
	const getFileInfo=(msg)=>{
		try{
			let t=JSON.parse(msg.cloudCustomData)
			
			if(t.messageReply&&t.messageReply.messageType){
				let {messageType}=t.messageReply
				if(messageType==5||messageType==3){
					TUIChatEngine.chat.getMessageListHopping({ conversationID: currentConversationID.value, sequence:t.messageReply.messageSequence, count:1, direction:0 }).then(res=>{
						fileData.value=messageType==5?res.data.messageList[0].payload.thumbUrl:messageType==3?res.data.messageList[0].payload.imageInfoArray[1].imageUrl:''
					});
				}
				 
				return messageType==5||messageType==3
			}
		}catch(e){
			return ''
			//TODO handle the exception
		}
	}
	const quoteContent = computed<IQuoteContent | undefined>(() => {
		try {
			const cloudCustomData : ICloudCustomData = JSON.parse(props.message?.cloudCustomData || "{}");
			return cloudCustomData.messageReply;
		} catch (error) {
			return undefined;
		}
	});
	
	const getFileData = () => {
		if(props.message && props.message.cloudCustomData) {
			const c = JSON.parse(props.message.cloudCustomData)
			if(c.messageReply && [3,5].includes(c.messageReply.messageType)) {
				const msgType = c.messageReply.messageType
				for(const item of messageList) {
					if(item.ID == c.messageReply.messageID) {
						if(msgType == 3) {
							fileData.value = item.payload.imageInfoArray[1].imageUrl || ''
						}
						if(msgType == 5) {
							fileData.value = item.payload.thumbUrl || ''
						}
						break
					}
				}
			}
		}
	}
	
	onMounted(()=>{
		if(quoteContent.value&&quoteContent.value.messageAbstract==''){
			getHis()
		}
		getFileData()
	})

	async function scrollToOriginalMessage() {
		// let originMessageID = quoteContent.value?.messageID;
		console.log('quoteContent.value',quoteContent.value)
		emits('blinkMessage', quoteContent.value);
	}
	
	const handleQuote = (quoteText) => {
		quoteText==''? chatHisTitle : quoteText=='[自定义消息]' ? '[个人名片]' : quoteText;
		let newText = tc(quoteText);
		return ListMixin.methods.removeTip(newText)
	}
</script>

<style lang="scss" scoped>
	.def-quote {
		overflow: hidden;
		display: flex;
		flex-direction: column;
		justify-content: center;
		position: relative;
		height: 46px;
		padding: 0 8px;
		margin-bottom: 8px;
		border-radius: 0 12px 12px 0;

		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			width: 2px;
			height: 100%;
			background: #4BABE1;
		}

		&.out {
			background: #B0DAFE;
		}

		&.in {
			background: #E7F4FB;
		}

		&--sender {
			color: #4285F6;
			font-size: 14px;
		}

		&--text{
			word-break: break-all;
			overflow: hidden;
			display: -webkit-box;
			-webkit-line-clamp: 1;
			-webkit-box-orient: vertical;
		}
	}
</style>