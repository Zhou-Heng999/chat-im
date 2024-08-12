<template>
	<ql-page>
		<u-navbar placeholder border autoBack :title="$tc('关于')" @clickLeft="BackPage"></u-navbar>
		<view class="flex-center" style="height: 25vh;">
			<view class="">
				<image style="height: 180rpx; width: 180rpx;" src="@/static/images/logo2.png" mode=""></image>
				<view class="flex-center font-blod font-40">
					{{appName}}
				</view>
			</view>
		</view>
		<view class="font-30">
			<view v-for="option in configOptions" :key="option.path"
				class="pd-lr-30 flex-between h114 has-border bg-color-f" @click="clickItem(option)">
				{{ $tc(option.name) }}
				<view class="flex-wrap flex-center">
					<view class="mr-10" v-if="option.path=='language'">
						{{nowLanguage}}
					</view>
					<imageIcon width="20rpx" height="20rpx" :src="`/static/images/an_jty.png`" />
				</view>
			</view>
		</view>
		<view class="flex-center">
			<text class="ss">Copyright © 2024</text>
		</view>
	</ql-page>
</template>

<script>
	export default {
		data() {
			return {
				configOptions: [
					// { name: '隐私协议', path: 'protocol' },
					 ],
			};
		},
		methods: {
			clickItem(option) {
				console.log(option);
				uni.navigateTo({
					url: `/pages/my/views/general/views/protocol/index`
				})
			},
		}
	};
</script>
<style scoped lang="scss">
	.ss {
		font-size: 25rpx;
		position: fixed;
		bottom: 50rpx;
		color: #c2c2c2
	}
</style>