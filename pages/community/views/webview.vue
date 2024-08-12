<template>
	<ql-page>
		<u-navbar placeholder border autoBack :title="title">
		</u-navbar>
		<view class="container">
			<iframe class="web-style"  :src="externalUrl"></iframe>
			<!-- :webview-styles="{width: '100vw', height: '90vh'}" -->
			<!-- :webview-styles="webStyle" -->
		</view>
	</ql-page>
</template>

<script>
	export default {
		data() {
			return {
				title: '',
				externalUrl: '',
				webStyle: {
					width: '750rpx',
					height: '1334rpx',
				}
			};
		},
		onLoad(opt) {
			this.externalUrl = opt.url;
			console.log(opt.url)
			this.title = opt.name;
		}
	}
</script>

<style lang="scss">
	.container {
		width: 750rpx;
		height: 1300rpx;
	}
	.web-style {
		width: 750rpx;
		height: 1334rpx;
	}
</style>