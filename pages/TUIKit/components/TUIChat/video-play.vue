<template>
  <div class="dialog-video" style="height: 100vh;">
	<u-navbar style="height: 10%" placeholder border autoBack title="视频">
	  </u-navbar>
    <div style="height: 90%">
		<video
		  v-if="show"
		  class="video-box"
		  :src="videoData"
		  x5-video-player-type="h5-fullscreen" 
		  id="videoEle"
		  controls
		  autoplay
		></video>
	</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "../../adapter-vue";
import { TUIGlobal } from "../../utils/universal-api/index";
import { onLoad, onReady } from "@dcloudio/uni-app";
const props = defineProps({
  data: {
    type: String,
    default: () => "",
  },
});

const videoData = ref();
const show = ref(false);
const videoContext = ref();
onLoad((option: any) => {
  videoData.value = getApp().globalData.videoUrl;
  show.value = true;
});

onReady(() => {
  show.value = true;
  videoContext.value = TUIGlobal.createVideoContext("videoEle");
});
</script>
<style lang="scss" scoped>
.dialog-video {
  position: fixed;
  z-index: 999;
  // width: 100vw;
  background:#000000;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  .video-box {
    position: absolute;
    width: 100vw;
    height: 90%;
    // top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
.edit-box{
		position: absolute;
		bottom: 50rpx;
		right:0;
		height: 80rpx;
		background-color: transparent;
	}
</style>
