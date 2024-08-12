<template>
  <div class="message-audio flex-center" :class="[message.flow === 'out' && 'reserve']" @click="handlePlay">
    <!-- <Icon class="icon" :file="audioIcon"></Icon> -->
	<view class="mr-10">
		<audioAnm :isPlay="isPlay" :size="24" :direction="message.flow === 'out'? 'left':'right'"></audioAnm>
	</view>
    <label class="time" :style="{ width: `${data.second * 10 + 20}px` }">
      {{ data.second || 1 }} "
    </label>
  </div>
</template>

<script lang="ts" setup>
import { watchEffect, ref, onMounted, onUnmounted } from "../../../../adapter-vue";
import { TUIGlobal } from "../../../../utils/universal-api/index";
// import Icon from "../../../common/Icon.vue";
// import audioIcon from "../../../../assets/icon/msg-audio.svg";
import audioAnm from "@/components/audioAnm/index"
const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
  messageItem: {
    type: Object,
    default: () => ({}),
  },
});

const data = ref();
const message = ref();
const show = ref();
const isPlay = ref(false);
const audio = TUIGlobal?.createInnerAudioContext();
watchEffect(() => {
  data.value = props.content;
  message.value = props.messageItem;
});

onMounted(() => {
  audio.onPlay(() => {
    console.log("开始播放");
  });
  audio.onEnded(() => {
    console.log("停止播放");
	isPlay.value = false;
  });
  audio.onError((err) => {
	  isPlay.value = false;
	  console.log("报错了",err)
    // ios 音频播放无声，可能是因为系统开启了静音模式
    TUIGlobal?.showToast({
      icon: "none",
      title: "该音频暂不支持播放",
    });
  });
  audio.onPause(() => {
	isPlay.value = false;
  });
  
  // 监听一个关闭播放
  uni.$on('stopAudioPlay',function(data){
  	audio.stop();
  	isPlay.value = false;
  })
});

onUnmounted(()=>{
	audio.stop();
	audio.destroy();
})

const handlePlay = () => {
  if (message.value.hasRiskContent) {
    return;
  }
  
  if(isPlay.value==true) {
	  audio.stop();
	  isPlay.value = false;
	  return
  }
  if (data.value.url) {
	  if (data.value.url.includes("_doc")) {
	      audio.src = data.value.url;
	      audio.play();
	  }else {
		  uni.downloadFile({
		  	url: data.value.url,
		  	success: (res) => {
		  		if (res.statusCode === 200) {
		  			audio.src = res.tempFilePath;
		  			audio.play();
		  		}
		  	}
		  });
	  }
  }
  isPlay.value = true;
};
</script>
<style lang="scss" scoped>
@import "../../../../assets/styles/common.scss";
.message-audio {
  display: flex;
  box-sizing: border-box;
  flex: 0 0 auto;
  cursor: pointer;
  overflow: hidden;
  .icon {
    margin-right: 7px;
    margin-left: 0px;
  }
  .time {
    max-width: 200px;
    text-align: start;
  }
}
.reserve {
  flex-direction: row-reverse;
  .time {
    text-align: end;
  }
  .icon {
    margin-right: 0px;
    margin-left: 7px;
    transform: rotate(180deg);
  }
}
</style>
