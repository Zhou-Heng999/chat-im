<template>
    <view>
        <canvas ref="cameraCanvas"  id="cameraCanvas"></canvas>
    </view>
</template>

<script>
export default {
    data() {
        return {
            camera: null, // 摄像头对象
            context: null, // Canvas 上下文
            interval: null // 定时器
        };
    },
    mounted() {
        this.initCamera();
    },
    methods: {
        initCamera() {
            // 获取摄像头对象
			console.log(666)
            plus.camera.getCamera({
                index: 0, // 0 表示后置摄像头，1 表示前置摄像头
                success: camera => {
					console.log('camera',camera)
                    this.camera = camera;
                    // 创建 Canvas 上下文
                    this.context = uni.createCanvasContext('cameraCanvas');
                    // 开始预览
                    this.camera.startPreview();
                    // 定时器更新画面
                    this.interval = setInterval(this.updateCameraPreview, 1000 / 30);
                },
                fail: err => {
                    console.error('获取摄像头对象失败', err);
                }
            });
        },
        updateCameraPreview() {
            if (this.camera && this.context) {
                // 获取摄像头预览画面
                this.camera.getImageData({
                    format: 'rgba8888',
                    success: imageData => {
                        // 将预览画面渲染到 Canvas 上
                        this.context.drawImage(imageData, 0, 0, imageData.width, imageData.height);
                        this.context.draw();
                    },
                    fail: err => {
                        console.error('获取摄像头预览画面失败', err);
                    }
                });
            }
        }
    },
    beforeDestroy() {
        // 停止预览和清除定时器
        if (this.camera) {
            this.camera.stopPreview();
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
};
</script>

<style>
	#cameraCanvas{
		height: 100vh;
		width: 100vw;
	}
/* 样式自行添加 */
</style>
