<template>
	<ql-page>
		<u-navbar placeholder border autoBack :title="$tc('反馈')" @clickLeft="BackPage"></u-navbar>
		<view class=" pd-lr-30 pd-tb-20 mt-30">
			<view class="mb-30">
				<view>
					<text style="color: red;" class=" font-blod">*</text>
					<text style="font-size: 38rpx;">{{$tc('反馈内容')}}</text>
				</view>
				<view class="mt-30">
					<u--textarea count class="textarea-bg" height="100" v-model="problem"
						:placeholder="$tc('请尽量详细描述你要反馈的问题，以便我们尽快为你解决（必填）')"></u--textarea>
				</view>
			</view>
			<view class="mb-30">
				<text style="font-size: 38rpx;">{{$tc('图片（选填，提供问题的截图）')}}</text>
				<view class="flex-wrap mt-30">
					<view v-for="(item, index) in imgArr" :key="index">
						<view class="tupian mr-10 mb-10">
							<image style="height: 165rpx; width: 165rpx;" :src="item" mode="aspectFill">
								<u-icon @click="chanshu(item)" class="shanchu" name="minus-circle-fill" color="#ff0509"
									size="20"></u-icon>
								<!-- <image @click="chanshu(item)" style="height: 40rpx; width: 40rpx;"
									src="@/static/images/tb_gb1.png" mode=""></image> -->
							</image>
						</view>
					</view>
					<view v-if="imgArr.length<8" class="flex-center up-view mb-10" @click="chooseImage"><u-icon
							name="plus" size="60rpx"></u-icon></view>
				</view>
			</view>
			<view class="mb-30">
				<text style="font-size: 38rpx;">{{$tc('联系方式（选填）')}}</text>
				<u--input class="textarea1-bg mt-30" :placeholder="$tc('请输入联系方式')" border="surround"
					v-model="contactWay"></u--input>
			</view>
			<view class="flex-center">
				<u-button class="announce-button" color="#22a6f2" :text="$tc('提交')" @click="announce"></u-button>
			</view>
		</view>
		<updateImagePopup :show="showUpdateImagePopup" @change="changeUpdateImagePopup"
			@close="showUpdateImagePopup=false" />
	</ql-page>
</template>

<script>
	import updateImagePopup from '@/components/update-image-popup/index.vue'
	export default {
		data() {
			return {
				showUpdateImagePopup: false,

				imgArr: [], // 在 data 中初始化 imgArr 为一个空数组
				problem: '',
				contactWay: ''
			};
		},
		components: {
			updateImagePopup
		},
		methods: {
			chanshu(item) {
				let index = this.imgArr.indexOf(item)
				if (index !== -1) {
					this.imgArr.splice(index, 1);
				}
			},
			announce() {
				if (this.problem == '') {
					uni.showToast({
						title: this.$tc('必填反馈内容!'),
						duration: 2000,
						icon: 'none',
					});
					return
				}
				let imgs = this.imgArr.join(";");
				this.$http.app_feedback.appFeedback({
					title: '',
					content: this.problem,
					imgs: imgs,
					contact: this.contactWay,
				}).then(res => {
					console.log('res。。。', res);
					uni.showToast({
						title: this.$tc('提交成功'),
						duration: 2000,
						icon: 'none',
					});
				}).catch(err => {
					console.log('失败', err);
					uni.showToast({
						title: this.$tc('提交失败'),
						duration: 2000,
						icon: 'none',
					});
				})
				setTimeout(() => {
					uni.navigateBack(() => {
						delta: 1
					})
				}, 500)
			},


			changeUpdateImagePopup(avatar) {
				// console.log('avatar', avatar);
				this.showUpdateImagePopup = false
				this.imgArr.push(avatar)
			},	
			chooseImage() {
				this.showUpdateImagePopup = true
			},

		}
	};
</script>
<style scoped lang="scss">
	.textarea-bg {
		background-color: #f5f5f5;
		border-radius: 20rpx;
	}

	.textarea1-bg {
		background-color: #f5f5f5;
		border-radius: 20rpx;
		height: 80rpx;
	}

	.up-view {
		width: 160rpx;
		height: 160rpx;
		border: 2rpx dotted #606266;
	}

	.announce-button {
		border-radius: 50rpx;
		width: 80%;
		position: fixed;
		bottom: 80rpx;
	}

	.tupian {
		position: relative;
		white-space: nowrap;

		// height: 160rpx;
		// width: 160rpx;
		.shanchu {
			position: absolute;
			z-index: 99;
			left: 140rpx;
			bottom: 150rpx;
		}
	}
</style>