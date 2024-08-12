<template>
	<view class="pos-relative" style="max-width: 500rpx;">
		<view class="icon-btn ssss" @click.stop="clickAdd">
			<imageIcon v-if="iconName=='tb_qt'" :size='54' :name="iconName" />
			<imageIcon v-else :size='iconSize' :name="iconName" />
		</view>
		<view class="add-boxx">
			<view class="add-box" v-if="isCreateShow">
				<view v-for="item in list" @click="onClickItem(item)">
					<view class="lie" :class="['flex-align h80 flex-between',item.cls]">
						<imageIcon class="mr-10" :size="40" :name="item.imageUrl" />
						<view class="flex1 font-30">{{$tc(item.title)}}</view>
					</view>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	import imageIcon from '@/components/image-icon'
	export default {
		components: {
			imageIcon
		},
		props: {
			list: {
				type: Array,
				default: () => []
			},
			iconSize: {
				type: String | Number,
				default: '40'
			},
			iconName: {
				type: String,
				// default: 'tb_jh'
				default: 'adds'
			}
		},
		data() {
			return {
				keyword: '',
				isCreateShow: false
			};
		},
		methods: {
			onClose() {
				this.isCreateShow = false
			},
			onClickItem(item) {
				this.$emit('clickItem', item)
				// this.toPage(url)
				this.onClose()
			},
			clickAdd() {
				this.isCreateShow = !this.isCreateShow
			},
			onChange() {
				uni.$chatKit.chat.getUserProfile({
					userIDList: [this.keyword]
				}).then(res => {
					this.$emit('onHanlderSearch', res.data)
				})
			},

		}
	};
</script>
<style scoped lang="scss">
	.ssss{
		position: absolute;
		right: 0;
		bottom: -40rpx;
	}
	.lie {
		padding: 10rpx 0;
		width: 100%;
	}
	.add-boxx {
		width: 100vw;
	}
	.add-box {
		position: absolute;
		min-width: 281rpx;
		border-radius: 20rpx;
		padding: 20rpx 40rpx;
		box-sizing: border-box;
		background: #17212b;
		right: 5rpx;
		top: 70rpx;
		color: #fff;
		box-shadow: 0px 6rpx 10rpx rgba(0, 0, 0, 0.14);
		z-index: 23;
	}

	.add-box::before {
		content: "";
		position: absolute;
		top: -19rpx;
		right: 20rpx;
		width: 0;
		height: 0;
		border-left: 10rpx solid transparent;
		border-right: 10rpx solid transparent;
		border-bottom: 20rpx solid #17212b;
	}
</style>