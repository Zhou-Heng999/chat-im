<template>
	<u-popup :show="isShow" @close="close" mode="center" closeable>
		<view class="qrcode-box radius-10 flex-column flex-center">
			<image v-if="qrCodeInfo" :src="qrCodeInfo.url" style="width: 200px; height: 200px;"></image>
			<u-loading-icon v-else></u-loading-icon>
			<text class="mt-30 mb-15">{{ userInfo.user_info.account }}</text>
			<text class="">{{ userInfo.user_info.user_id }}</text>
		</view>
	</u-popup>
</template>

<script>
export default {
	props: {
		isShow: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			qrCodeInfo:null
		};
	},
	created() {
		// console.log(this.userInfo)
	},
	watch: {
		isShow(val) {
			if (val) {
				this.getQRCode()
				// this.getTypeMoney()
			}
		},},
	methods: {
		close() {
			this.$emit('closeModal');
		},
		getQRCode(){
			// uni.showLoading()
			this.$http.account.getQRCode().then(res => {
				this.qrCodeInfo = res.data;
				this.isQrcodeShow = true;
				// uni.hideLoading()
			});
		}
	}
};
</script>
<style scoped lang="scss">
.option-view {
	height: 600rpx;
}
.title{
	height: 100rpx;
}
.qrcode-box{
	width: 400rpx;
	padding-top: 100rpx;
	padding-bottom: 20rpx;
}
</style>