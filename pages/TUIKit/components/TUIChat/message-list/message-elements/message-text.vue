<template>
  <div>
    <div>
      <span v-for="(item, index) in data.text" :key="index">
		    <span v-if="item.name === 'text'">
		    	<span @click="handleAtClick" class="text-box" v-html="setTextStyle(item.text,props.messageItem)" ></span>
		    </span>
			<!-- {{item.src}} -->
	      <image class="text-img" v-if="item.name=='img'" :src="getIconLast(item.src)" />
      </span>
    </div>
		<div v-if="hasTranslates || props.loadingTranslate[props.messageItem.ID]" :class="`line_translates_${props.messageItem.flow}`"></div>
    <div v-if="props.loadingTranslate[props.messageItem.ID]" class="max-width"><u-loading-icon :style="{ width: 'fit-content' }"></u-loading-icon></div>
    <div v-if="hasTranslates">
      <span v-for="(t_item, t_index) in hasTranslates.text" :key="t_index">
        <span 
          v-if="t_item.name === 'text' && t_item.text"
          class="text-box" 
          :class="[props.messageItem.flow == 'in' ? '' : '' ]" 
          v-html="setTextStyle(t_item.text, props.messageItem)"
        >
        </span>
        <image class="text-img" v-else :src="getIconLast(t_item.src)" />
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watchEffect, ref,getCurrentInstance, computed } from "../../../../adapter-vue";
import store from '@/store/index.js'
import { ListMixin } from '@/mixin/list';
const thisInstance = getCurrentInstance()?.proxy || getCurrentInstance();
const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
  loadingTranslate: {
    type: Object,
    default: () => {
      return {}
    },
  },
  messageItem:{
	  type: Object,
	  default: () => ({}),
  },
  myMessageTranslates:{
	  type: Object,
	  default: () => {
      return {}
    },
  },
  currentConversationInfo:{
	  type: Object|null,
	  default: () => ({}),
  }
});
const hasTranslates = computed(() => {
  return props.myMessageTranslates?.[props.messageItem.ID]
})
const getIconLast=(url)=>{
	let t=url.substring(url.lastIndexOf('/') + 1)
	return `/static/emoji/${t}`
}
const emits=defineEmits('seeCardInfo')
const data = ref();
const handleAtClick=(event)=>{
	if(event.target.dataset.mention){
		thisInstance.setCardInfo(event.target.dataset.mention,emits,props.currentConversationInfo)
	}
	if(event.target.dataset.url){
		ListMixin.methods.jumpUrl(event.target.dataset.url)
	}
}
const handleUrl = (event) => {
	console.log(event)
}
watchEffect(() => {
  data.value = props.content;
});
</script>
<style lang="scss" scoped>
.text-img {
  width: 20px;
  height: 20px;
}

.text-box {
  white-space: pre-wrap;
  font-size: inherit;
  word-break: break-word;
  font-size: 32rpx;
  text-size-adjust: none;
}
</style>
