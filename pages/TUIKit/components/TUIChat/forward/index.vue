<template>
	<Overlay >
		<Transfer :title="TUITranslateService.t('TUIChat.转发')" :isSearch="false" :isCustomItem="false"
			:list="customConversationList" :isHiddenBackIcon="isUniFrameWork" @cancel="closeForwardPanel"
			@submit="onSubmit"></Transfer>
	</Overlay>
</template>

<script lang="ts" setup>
	import { onUnmounted, ref,onMounted } from "../../../adapter-vue";
	import TUIChatEngine,{
		TUIStore,
		StoreName,
		TUIChatService,
		TUITranslateService,
		IConversationModel,
	} from "@tencentcloud/chat-uikit-engine";
	import Overlay from "../../common/Overlay/index.vue";
	import Transfer from "../../common/Transfer/index.vue";
	import { Toast, TOAST_TYPE } from "../../../components/common/Toast";
	import { isPC, isUniFrameWork } from "../../../utils/env";
	import { isEnabledMessageReadReceiptGlobal } from "../utils/utils";
	import {tc} from '@/utils/util'
	const emits = defineEmits(["closeForwardPanel"]);
	const customConversationList = ref();
	const onConversationList=(list)=>{
		customConversationList.value = list.map((conversation) => {
			console.log('customConversationList==forward')
			return {
				// 为了实现Transfer的复用，这里用userID代替ConversationID
				conversationID: conversation.conversationID,
				userID: conversation.conversationID.indexOf('C2C') != -1 ? conversation.userProfile.userID : conversation.groupProfile.groupID,
				nick: conversation.getShowName(),
				avatar: conversation.conversationID.indexOf('C2C') != -1 ? conversation.userProfile.avatar : conversation.groupProfile.avatar,
			};
		});
	}
	onMounted(()=>{
		TUIChatEngine.chat.getConversationList().then(res=>{
			let list=res.data.conversationList
			customConversationList.value = list.map((conversation) => {
				return {
					// 为了实现Transfer的复用，这里用userID代替ConversationID
					conversationID: conversation.conversationID,
					userID: conversation.conversationID.indexOf('C2C') != -1 ? conversation.userProfile.userID : conversation.groupProfile.groupID,
					nick: conversation.groupProfile?.name||conversation.userProfile?.nick,
					avatar: conversation.conversationID.indexOf('C2C') != -1 ? conversation.userProfile.avatar : conversation.groupProfile.avatar,
				};
			});
		})
	})
	

	// TUIStore.watch(StoreName.CUSTOM, {
	// 	singleForwardMessageID: onSingleForwardMessageIDUpdated
	// });

	onUnmounted(() => {
		// 组件卸载时需要清掉数据 否则小程序会自动打开
		TUIStore.update(StoreName.CUSTOM, 'singleForwardMessageID', undefined);

		TUIStore.unwatch(StoreName.CUSTOM, {
			singleForwardMessageID: onSingleForwardMessageIDUpdated
		});
		// TUIStore.unwatch(StoreName.CONV, {
		// 	conversationList: onConversationList,
		// });
	});

	function onSingleForwardMessageIDUpdated(messageID : string) {
		if (typeof messageID !== 'undefined') {
			openForwardPanel();
		}
	}

	defineExpose({
		closeForwardPanel,
	});
	function closeForwardPanel() : void {
		// ! 必须通过close函数关闭转发面板 singleForwardMessage必须清掉
		TUIStore.update(StoreName.CUSTOM, 'singleForwardMessageID', undefined);
		// isShowForwardPanel.value = false;
		emits('closeForwardPanel')
		
	}

	function openForwardPanel() : void {
		// isShowForwardPanel.value = true;
	}

	function finishSelected(selectedConvIDWrapperList : Array<{ userID : string }>) : void {
		/**
		 * 这里传递的是 coversationID
		 * 但为了实现 Transfer 的复用 这里用 userID 代替 ConversationID
		 */


		const selectedConversationList = selectedConvIDWrapperList.map((convIDWrapper) => {
			const { userID: conversationID } = convIDWrapper;
			return TUIStore.getConversationModel(conversationID);
		});
		const singleForwardMessageID : string = TUIStore.getData(StoreName.CUSTOM, "singleForwardMessageID");

		const message = TUIStore.getMessageModel(singleForwardMessageID);
		let userInfoData = uni.getStorageSync('userInfo')
		let cData = {}
		let t = {
			from: userInfoData.account,
			userID: userInfoData.userID
		}
		if (message._message.cloudCustomData) {
			let j = JSON.parse(message._message.cloudCustomData)
			let oldCloudData = {}
			if (j.from) {
				oldCloudData = {
					from: j.from,
					userID: j.userID
				}
			} else {
				oldCloudData = t
			}
			if (j.txt) {
				cData = { txt: j.txt, ...oldCloudData }
			} else {
				cData = oldCloudData
			}

		} else {
			cData = t
		}
		let cloudCustomData = JSON.stringify(cData)
		// return
		TUIChatService.sendForwardMessage(selectedConversationList, [message], {
			needReadReceipt: isEnabledMessageReadReceiptGlobal(),
			params: {
				cloudCustomData,
			}
		} as any).then(res => {
			console.log('转发。。。', res);
			Toast({
				message: tc(TUITranslateService.t("转发成功")),
				type: TOAST_TYPE.NORMAL,
			});
		}).catch((error : { message : string; code : number }) => {
			console.log('转发失败。。。。。。。', error,error.message,error.code);
			if (error.code === 80001) {
				Toast({
					message:tc(TUITranslateService.t("内容包含敏感词汇")) ,
					type: TOAST_TYPE.ERROR,
				});
			} else {
				Toast({
					// message: error.message as string,
					message:tc('部分转发失败'),
					type: TOAST_TYPE.ERROR,
				});
			}
		});
		closeForwardPanel();
	}

	function onSubmit(convIDWrapperList : Array<{ userID : string }>) {
		if (convIDWrapperList?.length === 0) return;
		let newList = convIDWrapperList.map(item => {
			return { avatar: item.avatar, nick: item.nick, userID: item.conversationID }
		})
		finishSelected(newList);
	}
</script>