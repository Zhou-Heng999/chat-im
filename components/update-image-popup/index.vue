<template>
	<u-popup :show="show" round="40rpx" zIndex="996" class="update-image-popup" :overlayStyle="{ zIndex: 995 }" @close="close">
		<view ref='test'>
			<button class="flex-center h130 has-border mg-lr-30 btn" @click="clickPhotograph">
				{{$tc('拍照')}}
			</button>
			<button class="flex-center h130 has-border mg-lr-30 btn" @click="clickSelectPicture">
				{{$tc('从相册选择')}}
			</button>
			<view class="item-margin"></view>
			<button class="flex-center h130 has-border mg-lr-30 btn" @click="$emit('update:show', false)">
				{{$tc('取消')}}
			</button>
		</view>
	</u-popup>
</template>

<script>
	export default {
		props: {
			show: {
				type: Boolean,
				required: false,
				default: false
			},
		},
		model: {
			prop: 'checked',
			event: 'change'
		},
		data() {
			return {
				_value: '',
			};
		},
		watch: {
			value: {
				immediate: true,
				handler(newV) {
					this._value = newV
				},
			},
		},
		methods: {
			async clickPhotograph() {
				this.$emit('close')
				this.uploadImage(['camera']).then(res => {
					this.$emit('change', res)
				})
			},
			async clickSelectPicture() {
				let that = this
				this.$emit('close')
				this.uploadImage(['album']).then(res => {
					this.$emit('change', res)
				}).catch(err => {
					this.$emit('close')
					uni.showToast({
						title: that.$tc('上传失败')
					})
				})
			},
			close() {
				this.$emit('close')
			}
		},
	}
</script>

<style scoped lang="scss">
	.update-image-popup {
		flex: none;
	}

	.item-margin {
		height: 18rpx;
		background-color: rgba(245, 248, 247, 1);
	}

	.btn {
		background-color: #ffffff;
		font-size: 30rpx;

		&:after {
			border: 0px;
		}
	}
</style>