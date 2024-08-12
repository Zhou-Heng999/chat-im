<template>
  <canvas ref="qrcode" id="qrcode" canvas-id="qrcode" :style="{ width: size + 'px', height: size + 'px' }"></canvas>
</template>

<script>
import UQRCode from '@/utils/uqrcode.js'
export default {
  components: { UQRCode },
  props: {
    text: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      tempFilePath: '',
    }
  },
  watch: {
    text: {
      deep: true,
      handler(newV) {
        this.init()
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      var qr = new UQRCode()
      qr.data = this.text
      qr.size = this.size
      qr.foregroundImageSrc = '/static/images/logo2.png'
      qr.make()
      var canvasContext = uni.createCanvasContext('qrcode', this)
      qr.canvasContext = canvasContext
      qr.drawCanvas()
    },
    getUrl() {
      return new Promise(resolve => {
        uni.canvasToTempFilePath({
	      	x: 0,
	      	y: 0,
	      	width: this.size * 2,
	      	height: this.size * 2,
	      	destWidth: this.size * 2,
	      	destHeight: this.size * 2,
	      	quality: 1,
	      	canvasId: 'qrcode',
	      	success: (res) => {
            this.tempFilePath = res.tempFilePath
            resolve(this.tempFilePath)
	      	} 
	      })
      })
    },
    uploadQrCode() {
		let that = this;
      uni.canvasToTempFilePath({
	    	x: 0,
	    	y: 0,
	    	width: this.size * 2,
	    	height: this.size * 2,
	    	destWidth: this.size * 2,
	    	destHeight: this.size * 2,
	    	quality: 1,
	    	canvasId: 'qrcode',
	    	success: (res) => {
				// #ifdef APP
				var b = new plus.nativeObj.Bitmap('bitblmap');
				                        /*这里一定要是_doc目录*/  
				                        b.save(res.tempFilePath, {overwrite: true}, function (object) {  
				                            //保存到相册  
				                            plus.gallery.save(res.tempFilePath, function () {  
				                                uni.showModal({
				                                	title: that.$tc('提示'),
				                                	content:  that.$tc('保存成功'),
				                                	confirmText:  that.$tc('确定'),
				                                	showCancel: false,
				                                	confirmColor: '#33CCCC',
				                                }) 
												b.clear()
				                            }, function () {  
				                               console.log('保存失败')  
											   b.clear()
				                            });  
				                        }, function () {  
				                            console.log('保存失败')
											//ios端似乎不支持plus.nativeObj.Bitmap.save，所以用以下方法
											uni.saveImageToPhotosAlbum({
												filePath: res.tempFilePath,
												success: function() {
													uni.showModal({
														title: that.$tc('提示'),
														content:  that.$tc('保存成功'),
														confirmText:  that.$tc('确定'),
														showCancel: false,
														confirmColor: '#33CCCC',
													}) 
												},
												fail: function() {
													console.log('保存失败2')
												}
											});
											b.clear()
				                        });  
				// #endif
				
				// #ifndef APP
				this.saveHttpImage(res.tempFilePath)
				// #endif
				                     
				 
	    	} 
	    })
    },
  },
}
</script>

<style scoped lang="scss">

</style>