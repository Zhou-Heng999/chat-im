<template>
	<div class="merger-box flex-column flex-between" @click='downloadMergerMessage(messageItem)'>
		<view class="flex-align fon-28 mb-10 max-width">
			<!-- {{ messageItem.payload.title}} -->
			{{$tc('聊天记录')}}
		</view>
		<view class="flex top-box max-width less-black flex-column u-line-1">
			<view class="mb-10 font-24 u-line-1" v-for="(item,index) in messageItem.payload.abstractList" v-if="index<3" >{{ handleItem(item)}}</view>
		</view>
		<!-- <view class="bottom-box flex-align less-black max-width">
			{{$tc('聊天记录')}}
		</view> -->
	</div>
</template>

<script lang="ts" setup>
	import TUIChatEngine, {
		IMessageModel,
		TUIStore,
		StoreName,
		TUITranslateService,
		TUIChatService,
		TUIGroupService,
	} from "@tencentcloud/chat-uikit-engine";
	import { watchEffect, ref } from "../../../../adapter-vue";
	import { tc } from '@/utils/util';
	import { ListMixin } from '@/mixin/list';
	const props = defineProps({
		content: {
			type: Object,
			default: () => ({}),
		},
		messageItem: {
			type: Object,
			default: () => ({}),
		}
	});
	const data = ref();
	watchEffect(() => {
		data.value = props.content;
	});
	const downloadMergerMessage = async (messageItem) => {
		let messageList = null
		if (messageItem.payload.downloadKey != '') {
			await TUIChatEngine.chat.downloadMergerMessage(messageItem).then(res => {
				console.log('res',res)
				messageList = res.payload.messageList
			})
		} else {
			messageList = messageItem.payload.messageList
		}

		console.log('messageItem',messageItem)

		// console.log('messageItem',messageItem)
		// return
		getApp().globalData.mergerTitle=messageItem.payload.title
		getApp().globalData.mergerAllList = messageItem
		getApp().globalData.mergerList = messageList
		uni.navigateTo({
			url: '/pages/home/views/merger/index',
		})

	}
	
	const handleItem = (item) => {
		let msg = ListMixin.methods.removeTip(item);
		let newContent = msg.replace(/\[消息\]/g, tc('[消息]'))
		                .replace(/\[图片\]/g, tc('[图片]'))
		                .replace(/\[语音\]/g, tc('[语音]'))
		                .replace(/\[视频\]/g, tc('[视频]'))
		                .replace(/\[文件\]/g, tc('[文件]'))
		                .replace(/\[文本\]/g, tc('[文本]'))
						.replace(/\[个人名片\]/g, tc('[个人名片]'))
		                .replace(/\[聊天记录\]/g, tc('[聊天记录]'));
		return newContent;
	}
	
</script>
<style lang="scss" scoped>
	@import "../../../../assets/styles/common.scss";

	.merger-box {
		width: 350rpx;
	}

	.top-box {
		height: 140rpx;
	}

	.bottom-box {
		height: 60rpx;
		border-top: 1rpx solid #efefef;

	}
</style>