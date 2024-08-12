<template>
	<view class="preview" :style="{ width: '750rpx', height: (Number(cameraHeight) + Number(sheetHeight))+'px' }">

		<!-- #ifndef H5 -->
		<video v-if="source === 'video'" autoplay loop :controls="false" :show-loading="false" object-fit="cover"
			:style="{ width: '100%', height: cameraHeight+'px' }" :src="previewSrc"></video>
			
		<imageIcon v-if="source === 'picture'" width="750rpx" :height="cameraHeight+'px'" :src="previewSrc"></imageIcon>
		<view class="sheet" :style="{ height:sheetHeight+'px' }">
			<!-- 411 - 914 -->
			<!-- 666.6 - 247.3 -->
			<!-- <text style="color: #fff">{{windowWidth}}</text>
			<text style="color: #fff">{{windowHeight}}</text>
			<text>----</text>
			<text style="color: #fff">{{cameraHeight}}</text>
			<text style="color: #fff">{{sheetHeight}}</text> -->
			
			<view class="flex-box" :style="{ height: sheetHeight + 'px' }">
				<view class="event" @click="del">
					<imageIcon width="80rpx" height="80rpx" src="/static/images/previous2.png"></imageIcon>
				</view>
				<view class="event" @click="complete">
					<text class="complete">完成</text>
				</view>
			</view>
			
		</view>
		<!-- #endif -->

		<!-- 测试代码 -->
		<!-- #ifdef H5 -->
		<imageIcon width="100%" :height="'650px'" :src="testSrc"></imageIcon>
		<!-- <u--image v-if="source === 'picture'" width="100%" :height="cameraHeight+'px'" :src="previewSrc"></u--image> -->
		<video v-if="source === 'video'" autoplay loop :controls="false" :show-loading="false" object-fit="cover"
			:style="{ width: '100%', height: cameraHeight+'px' }" :src="previewSrc"></video>
		<view class="sheet" :style="{ height: '162px' }">
			<view class="flex-box" :style="{ height: '162px' }">
				<view class="event" @click="del">
					<imageIcon width="80rpx" height="80rpx" src="/static/images/previous2.png"></imageIcon>
				</view>
				<view class="event" @click="complete">
					<view class="complete">完成</view>
				</view>
			</view>
		</view>
		<!-- #endif -->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				testSrc: 'https://t7.baidu.com/it/u=2084624597,235761712&fm=193&f=GIF',
				windowHeight: 0,
				windowWidth: 0,
			}
		},
		props: {
			previewSrc: {
				type: String,
				default: ''
			},
			source: {
				type: String,
				default: ''
			},
			cameraHeight: {
				type: [String, Number],
				default: ''
			},
			sheetHeight: {
				type: [String, Number],
				default: ''
			},
		},
		mounted() {
			const that = this
			uni.getSystemInfo({
				success(res) {
					that.windowWidth = res.windowWidth
					that.windowHeight = res.windowHeight
				}
			})
		},
		methods: {
			del() {
				this.$emit('close')
			},
			complete() {
				if (this.source === 'picture') {
					this.sendImage()
				}else {
					this.sendVideo()
				}
			},
			sendImage() {
				const that = this
				uni.getImageInfo({
					src: that.previewSrc,
					success(res) {
						console.log('getImageInfo...', res)
						// 压缩
						uni.compressImage({
							src: that.previewSrc,
							success(compress) {
								console.log('compressImage...', compress)
								that.$emit('sendFile', {
									source: that.source,
									tempFilePaths: [compress.tempFilePath],
									tempFiles: [{
										path: compress.tempFilePath,
									}]
								})
							}
						})
					}
				})
			},
			sendVideo() {
				const that = this
				uni.getVideoInfo({
					src: that.previewSrc,
					success(res) {
						console.log('getVideoInfo...', res)
						/**
						 * duration: 持续时间
						 * fps: 帧数
						 * bitrate: 比特率
						 */
						const { width, height, duration, fps, bitrate } = res
						
						uni.getSavedFileInfo({
							filePath: that.previewSrc,
							success(info) {
								console.log('getSavedFileInfo...', info)
								that.$emit('sendFile', {
									source: that.source,
									tempFilePath: that.previewSrc,
									size: info.size,
									width,
									height,
									duration,
								})
							}
						})
						
						// 压缩
						// uni.compressVideo({
						// 	src: that.previewSrc,
						// 	success(compress) {
						// 		console.log('compressVideo...', compress)
						// 		that.$emit('sendFile', {
						// 			source: that.source,
						// 			tempFilePath: compress.tempFilePath,
						// 			size: compress.size,
						// 			width,
						// 			height,
						// 			duration,
						// 		})
						// 	}
						// })
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.preview {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 2024;
	}

	.sheet {
		background: #000;
	}

	.flex-box {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		width: 750rpx;
	}

	.complete {
		padding: 12rpx 20rpx;
		color: #fff;
		font-size: 30rpx;
		border-radius: 4px;
		background: #16A3F0;
	}
</style>