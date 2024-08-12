<template>
	<ql-page class="f5-bg">
		<u-navbar placeholder border autoBack :title="type=='GROUP'?$tc('群二维码'):$tc('我的二维码')" @clickLeft="BackPage">
			<imageIcon slot="right" name="tb_qt" width="54rpx" height="54rpx"
				@click="showAction = true"></imageIcon>
		</u-navbar>
		<view class="radius-60 pd-40 content">
			<avatar :info="info" :infoType="type" w="180" h="180" class="avatar" />
			<view class="ellipsis3 nick">{{type=='GROUP'? $tc('群聊:'):''}}{{ info.nick || info.name || '-' }}</view>
			<view ref="qr-code-box" id="code" class="radius-20 mt-40 code">
				<qrCode v-if="showQrCode" ref="qrCode" :size="qrCodeBoxW" :text="info.qrCodeText" />
			</view>
			<view class="remark">{{`${$tc('该二维码7天内有效（')}${timeoutDay}${$tc('前）')}${$tc('，重新进入将更新')}`}}</view>
		</view>
		<button class="text-btn" @click="clickSave">{{$tc('保存到手机')}}</button>

		<u-popup :show="showAction" round="40rpx" class="action-popup" @close="showAction = false">
			<view ref='test'>
				<button class="flex-center h130 has-border btn" @click="clickRepost">
					{{$tc('转发给朋友')}}
				</button>
				<button class="flex-center h130 has-border btn" @click="clickSave">
					{{$tc('保存图片')}}
				</button>
				<view class="item-margin"></view>
				<button class="flex-center h130 has-border btn" :style="{ color: 'rgba(173, 181, 189, 1)' }"
					@click="showAction = false">
					{{$tc('取消')}}
				</button>
			</view>
		</u-popup>
	</ql-page>
</template>

<script>
	import avatar from '@/components/avatar'
	import qrCode from '@/components/qr-code'
	export default {
		components: {
			avatar,
			qrCode
		},
		data() {
			return {
				info: {},
				showQrCode: false,
				showAction: false,
				qrCodeBoxW: 0,
				type: '',
				timeoutDay: ''
			};
		},
		mounted() {
			const {
				type,
				info
			} = uni.getStorageSync('qr_code_info')
			this.type = type
			let qrcodeData = {
				type,
				id: type === uni.$chatKit.TUIChatEngine.TYPES.CONV_C2C ? info.userID : info.groupID,
				timestamp:Date.now()
			}
			this.info = {
				...info,
				qrCodeText: JSON.stringify(qrcodeData)
			}
			//获取节点信息
			const query = uni.createSelectorQuery().in(this);
			query
				.select("#code")
				.boundingClientRect((data) => {
					this.qrCodeBoxW = data.width;
				})
				.exec();
			// this.qrCodeBoxW = this.$refs['qr-code-box'].$el.offsetWidth
			this.showQrCode = true
			this.getSevenTime();
		},
		methods: {
			clickSave() {
				this.$refs['qrCode'].uploadQrCode()
			},
			async clickRepost() {
				const url = await this.$refs['qrCode'].getUrl()
				uni.setStorage({
					key: 'repost_qr_code',
					data: {
						url
					}
				})
				this.showAction = false
				uni.navigateTo({
					url: `/pages/repost/index`
				})
			},
			getSevenTime() {
				let today = new Date();
				let sevenDaysLater = new Date();
				sevenDaysLater.setDate(today.getDate() + 7);
				let sevenDaysLaterMonth = sevenDaysLater.getMonth() + 1;
				let sevenDaysLaterDay = sevenDaysLater.getDate();
				console.log()
				this.timeoutDay = `${sevenDaysLaterMonth}/${sevenDaysLaterDay}`
			}
		}
	};
</script>
<style scoped lang="scss">
	.f5-bg {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		background: $colorF !important;

		.content {
			margin: 0rpx auto;
			width: 500rpx;
			background-color: #fff;


			.avatar {
				margin: auto;
			}

			.nick {
				margin-top: 50rpx;
				line-height: 60rpx;
				font-size: 40rpx;
				text-align: center;
			}

			.code {
				padding-bottom: 100%;
				width: 100%;
				height: 0;
			}

			.remark {
				width: 100%;
				height: 60rpx;
				line-height: 60rpx;
				text-align: center;
				color: $grayFont;
			}
		}

		.text-btn {
			color: #4b7bbf;
			font-size: 40rpx;
		}

		.action-popup {
			flex: none;

			.btn {
				background-color: #ffffff;
				font-size: 30rpx;

				&:after {
					border: 0px;
				}

				&:active {
					background-color: #f3f4f6;
				}
			}
		}
	}

	.image-tb_sys3 {
		width: 46rpx;
		height: 46rpx;
	}
</style>