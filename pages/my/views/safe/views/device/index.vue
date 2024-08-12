<template>
	<ql-page>
		<u-navbar placeholder border autoBack :title="$tc('登录设备管理')" @clickLeft="BackPage"></u-navbar>

		<view class="pd-lr-30 mt-20">
			<view class="userinfo">
				<view class="content pd-tb-30 pd-lr-30 flex-align">
					<imageIcon class="mr-30" width="80rpx" height="80rpx" shape="circle" :src="userProfile.avatar" />
					<view class="info">
						<view class="title font-blod">{{userProfile.nick}}</view>
						<view class="subtitle font-24 gray-color">ID:{{userProfile.userID}}</view>
					</view>
				</view>
			</view>

			<view class="device">
				<view class="label pd-t-50 pd-b-20 font-24 gray-color2">已绑定设备</view>
				<view class="list">
					<view class="item mb-40" v-for="item in 3" :key="item" @click="toDetail(item)">
						<view class="flex-between pd-tb-40 pd-lr-40">
							<imageIcon class="mr-30" width="80rpx" height="80rpx" src="/static/images/sticker2.png" />
							<view class="content flex1 mr-20">
								<view class="title flex-align pd-b-10 font-28 font-blod">
									<view>DESKTOP-123456</view>
									<view class="bind ml-20 font-24">已绑定</view>
								</view>
								<view class="subtitle font-24 gray-color">2024/01/21 00:00</view>
							</view>
							
							<imageIcon width="20rpx" height="20rpx" :src="`/static/images/an_jty.png`" />
						</view>
					</view>
				</view>
			</view>
		</view>
	</ql-page>
</template>

<script>
	export default {
		data() {
			return {
				userProfile: null
			}
		},
		onShow() {
			uni.$chatKit?.chat?.getMyProfile().then(res => {
				this.userProfile = res.data
			})
		},
		methods: {
			toDetail() {
				uni.navigateTo({
					url: '/pages/my/views/safe/views/device/views/detail/index'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.userinfo {
		.content {
			background: #f5f5f5;
		}
	}
	
	.device {
		.item {
			border-radius: 8rpx;
			border: 1px solid var(--border-bg);
		}
		.content {
			.bind {
				color: #12D794;
				padding: 4rpx 8rpx;
				background: #E5FBF4;
			}
		}
	}
</style>