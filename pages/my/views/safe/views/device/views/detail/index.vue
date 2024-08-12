<template>
	<ql-page>
		<u-navbar placeholder border autoBack :title="$tc('DESKTOP-123456')" @clickLeft="BackPage"></u-navbar>

		<view class="flex-col-center">
			<view class="mt-100 mb-60">
				<imageIcon width="140rpx" height="140rpx" class="radius-_50" src="/static/images/sticker2.png" />
			</view>
			<view class="content flex-col-center flex1 mb-60">
				<view class="title flex-align pd-b-10 font-36 font-blod">
					<view>DESKTOP-123456</view>
				</view>
				<view class="bind mg-tb-20 font-24 font-blod">已绑定</view>
				<view class="subtitle font-24 gray-color">最近登录时间: 2024/01/21 00:00</view>
			</view>
			<view class="btns">
				<view class="btn del">删除该设备</view>
				<view class="btn logout">退出登录</view>
			</view>
		</view>
		
		<!-- <view v-if="systemInfo" class="pd-lr-20 font-28">系统信息：{{systemInfo}}</view>
		<view class="pd-tb-20"></view>
		<view v-if="deviceInfo" class="pd-lr-20 font-28">设备信息：{{deviceInfo}}</view> -->
	</ql-page>
</template>

<script>
	export default {
		components: {},
		data() {
			return {
				deviceInfo: null,
				systemInfo: null,
			}
		},
		onReady() {},
		onShow() {
			const systemInfo = uni.getSystemInfoSync()
			console.log('systemInfo...', systemInfo)
			this.systemInfo = systemInfo
			
			const deviceInfo = uni.getDeviceInfo()
			console.log('deviceInfo...', deviceInfo)
			this.deviceInfo = deviceInfo
		},
		onHide() {},
		computed: {},
		methods: {},
	}
</script>

<style lang="scss" scoped>
	.content {
		.bind {
			display: inline-block;
			color: #12D794;
			padding: 4rpx 8rpx;
			background: #E5FBF4;
		}
	}

	.btns {
		.btn {
			padding: 24rpx 160rpx;
			margin-bottom: 40rpx;
			text-align: center;
			font-size: 28rpx;
			border-width: 1px;
			border-style: solid;
			border-radius: 9999px;
			&.del {
				color: red;
				border-color: red;
			}
			&.logout {
				color: $grayColor;
				border-color: $grayColor;
			}
		}
	}
</style>