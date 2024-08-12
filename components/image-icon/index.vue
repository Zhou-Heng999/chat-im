<template>
  <image  :mode="mode" :style="{'width':`${width==0? `${size}rpx` : width}`,'height':`${height==0?`${size}rpx`:height}`}" :src="name?`/static/images/${name}.png`:src" @click="$emit('click')" />
</template>

<script>
export default {
  props: {
	width:{
      type: Number|String,
      default: 0
    },
	height:{
	  type: Number|String,
	  default: 0
	},
    size: {
      type: Number|String,
      default: 46
    },
    name: {
      type: String,
      required: false
    },
	mode: {
      type: String,
      default: 'aspectFill'
    },
	src: {
	  type: String,
	  default: ''
	},
  }
}
</script>

<style>

</style>