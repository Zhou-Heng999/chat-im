<template>
	<image :src="cacheSrc" @click="$emit('click')" mode="aspectFill" />
</template>
<script>
	import ImageCacheManage from './imageCacheManage.js'
	export default {
		props: {
			src: {
				type: String,
				required: true,
			}
		},
		data() {
			return {
				cacheData: {},
				cacheSrc: '',
			}
		},
		watch: {
			src: {
				immediate: true,
				handler(url) {
					if (url) {
						// #ifdef H5
						this.cacheSrc = url
						// #endif
						// #ifdef APP
						this.cacheData = ImageCacheManage.getItem(url)

						if (this.cacheData) {
							if (this.cacheData.status === 'success') {
								this.cacheSrc = this.cacheData.savedFilePath
							} else {
								this.cacheSrc = url
								if (this.$store.state.imageRequestCache.includes(url)) {
									// 若是之前pending状态的请求出现意外中断，打开aapp时需要重新请求
									return
								}
								this.downloadFile()
							}
						} else {
							this.cacheSrc = url
							this.downloadFile()
						}
						// #endif

					}
				}
			}
		},
		created() {
			this.cacheData = ImageCacheManage.getItem(this.src)
		},
		methods: {
			downloadFile() {
				const url = this.src
				ImageCacheManage.setItem({
					url
				})
				this.$store.commit('setImageRequestCache', [...this.$store.state.imageRequestCache, url])
				uni.downloadFile({
					url
				}).then(resultDownloadFile => {
					if (resultDownloadFile[1].statusCode === 200) {
						uni.saveFile({
							tempFilePath: resultDownloadFile[1].tempFilePath,
							success: (resultSaveFile) => {
								ImageCacheManage.setItem({
									url,
									savedFilePath: resultSaveFile.savedFilePath
								})
							}
						})
					}
				})
			},
		}
	}
</script>
<style lang="scss" scoped>

</style>