<template>

	<view class="user-avatar flex-center" :style="`width:${w}rpx;height:${h}rpx`" @click="$emit('click')">
		<ImageCache :style="{'width': `${w}rpx`,'height': `${h}rpx`}" :src="info.avatar+'?imageMogr2/thumbnail/100x/'" class="radius-_50" />
		<view class="badge" :style="{ bottom: badgeBottom + 'rpx', right: badgeRight + 'rpx' }">
			<slot name="badge" />
		</view>
	</view>
</template>

<script>
	import ImageCache from '@/components/image-cache';
	export default {
		components: { ImageCache },
		props: {
			info: {
				type: Object || null,
				default: null
			},
			badgeBottom: {
				type: Number,
				required: false,
				default: 10
			},
			badgeRight: {
				type: Number,
				required: false,
				default: 24
			},
			w: {
				type: String,
				required: false,
				default: '96'
			},
			h: {
				type: String,
				required: false,
				default: '96'
			}
		}
	};
</script>
<style scoped lang="scss">
	.power-icon{
		position: absolute;
		right: 5rpx;
		bottom: 0rpx;
	}
	.user-avatar {
		position: relative;

		.badge {
			position: absolute;
			// bottom: 10rpx;
			// right: 24rpx;
			border-radius: 50%;
			z-index: 10;
		}

		img {
			border-radius: 50%;
		}
	}
</style>