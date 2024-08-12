<template>
	<ql-page>
		<u-navbar placeholder border autoBack :title="$tc('隐私')" @clickLeft="BackPage"></u-navbar>
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
	</ql-page>
</template>

<script>
	export default {
		data() {
			return {
				configOptions: [{
					name: '黑名单',
					path: 'black'
				}, ],
			};
		},
		methods: {
			clickItem(option) {
				console.log(option);
				uni.navigateTo({
					url: `/pages/address/views/${option.path}/index`
					// url:'/pages/address/views/black/index'
				})
			},
		}
	};
</script>
<style scoped lang="scss">
	.options {
		// flex: 1;
		min-height: calc(100vh - 500rpx);
		// background-color: $colorF;
		background: #F5F5F5;
		border-radius: 60rpx 60rpx 0rpx 0rpx;
	}
</style>