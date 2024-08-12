<template>
	<div
		:class="['imageContainer flex-column flex-center',getContent(props.messageItem)&&getContent(props.messageItem).txt&&props.messageItem.flow!='in'?'out-box':'']">
		<div :style="fixedSize"
			:class="['imgBack flex-center',getContent(props.messageItem)&&getContent(props.messageItem).txt?'':'pd-img']"
			@click="handleImagePreview">
			<image :class="['messageImage']" mode="aspectFit"
				:src="props.messageItem.payload.imageInfoArray[1].imageUrl||props.messageItem.payload.imageInfoArray[1].url" @load="imageLoad" :style="fixedSize">
			</image>
		</div>
		<span @click="handleUrlClick"
			:class="`${props.myMessageTranslates[props.messageItem.ID] ? '' : 'mb-20'} pd-lr-10 textClass`"
			v-if="getContent(props.messageItem)&&getContent(props.messageItem).txt"
			v-html="setTextStyle(getContent(props.messageItem).txt,props.messageItem)"></span>
		<div v-if="props.myMessageTranslates[props.messageItem.ID] || props.loadingTranslate[props.messageItem.ID]"
			:class="`line_translates_${props.messageItem.flow}`"></div>
		<div v-if="props.loadingTranslate[props.messageItem.ID]" class="max-width"><u-loading-icon
				:style="{ width: 'fit-content' }"></u-loading-icon></div>
		<span v-if="props.myMessageTranslates[props.messageItem.ID]" @click="handleUrlClick"
			class="mb-20 pd-lr-10 textClass">
			<span v-for="(t_item, t_index) in props.myMessageTranslates[props.messageItem.ID].text" :key="t_index">
				<span v-if="t_item.name === 'text' && t_item.text" class="text-box"
					v-html="setTextStyle(t_item.text, props.messageItem)">
				</span>
				<image class="text-img" v-else :src="t_item.src" />
			</span>
		</span>
	</div>
</template>

<script lang="ts" setup>
	import { watchEffect, ref, computed } from "../../../../adapter-vue";
	import type { IMessageModel } from "@tencentcloud/chat-uikit-engine";
	import type { IImageMessageContent } from "../../../../interface";
	import { ListMixin } from '@/mixin/list';
	import getContentFn from "../../utils/getContent";
	import store from '@/store/index.js'
	const DEFAULT_MAX_SIZE = 300;
	const props = withDefaults(
		defineProps<{
			content : IImageMessageContent,
			messageItem : IMessageModel,
			loadingTranslate : any,
			myMessageTranslates : any,
		}>(),
		{
			content: () => ({}),
			messageItem: () => ({} as IMessageModel),
			myMessageTranslates: {
				type: Object,
				default: () => {
					return {}
				},
			},
			loadingTranslate: {
				type: Object,
				default: () => {
					return {}
				},
			},
		}
	);

	const emits = defineEmits(["uploading", "previewImage"]);
	const imageStyles = ref({ width: "auto", height: "auto" });
	function getContent(msg) {
		return getContentFn(msg)
	}

	const fixedSize = computed<{ width : number | string; height : number | string }>(() => {
		const maxH = 300
		const maxW = 300
		const { height, width } = props.content
		let newW : number | string = 300
		let newH : number | string = 300

		if (width && height) {
			if (width > height) {
				if (width > maxW) {
					newW = maxW
					newH = Math.floor(maxW / width * height)
				} else {
					newW = width
					newH = height
				}
			} else {
				if (height > maxH) {
					newW = Math.floor(maxH / height * width)
					newH = maxH
				} else {
					newW = width
					newH = height
				}
			}
		}

		return {
			width: newW + 'px',
			height: newH + 'px'
		}
	})
	const getMinImage = (list) => {
		if (!list) return
		console.log('list',list)
		let minInfo = list.find(item => item.type == 1)
		return minInfo.imageUrl || minInfo.url
	}
	const genImageStyles = (value : { width ?: any; height ?: any }) => {
		const { width, height } = value;
		if (width === 0 || height === 0) {
			return;
		}

		let imageWidth = 0;
		let imageHeight = 0;
		if (width >= height) {
			imageWidth = DEFAULT_MAX_SIZE;
			imageHeight = (DEFAULT_MAX_SIZE * height) / width;
		} else {
			imageWidth = (DEFAULT_MAX_SIZE * width) / height;
			imageHeight = DEFAULT_MAX_SIZE;
		}
		imageStyles.value.width = imageWidth + "px";
		imageStyles.value.height = imageHeight + "px";
	};

	watchEffect(() => {
		genImageStyles(props.content);
	});

	const handleUrlClick = (event) => {
		if (event.target.dataset.url) {
			ListMixin.methods.jumpUrl(event.target.dataset.url)
		}
	}

	const imageLoad = (event : any) => {
		console.log('图片加载完毕')
		genImageStyles(event.detail);
	};

	// 预览
	const handleImagePreview = () => {
		if (props.messageItem?.status === 'success' || props.messageItem.progress === 1) {
			emits("previewImage", props.messageItem);
		}
	};
</script>
<style lang="scss" scoped>
	.imageContainer {
		position: relative;

		// background-color: #f4f4f4;
		// 防止div被撑高
		// font-size: 0;
		.messageImage {
			// max-width: 150px;
			will-change: transform;
		}

		.text-box {
			white-space: pre-wrap;
			font-size: inherit;
			word-break: break-word;
			font-size: 32rpx;
			text-size-adjust: none;
		}
	}

	.pd-img {
		margin-bottom: 25rpx;
	}

	.out-box {
		background: #C2E8FF;
	}

	.imgBack {
		width: 100%;
		background: linear-gradient(to bottom, #fff, #000);
		min-height: 300rpx;
	}

	.textClass {
		width: 100%;
	}
</style>