<template>
	<view class="">
		<u-tag shape="circle" v-if="tagType=='all'"  :text="$t(typeList[type][status].lan)" size="medium" :type="typeList[type][status].color==''?'primary':typeList[type][status].color"></u-tag>
		<text class="text-color"v-else >{{$t(typeList[type][status].lan)}}</text>
	</view>
</template>

<script>
export default {
	props: {
		type: {
			type: String|Number,
			default: 'OPEN_WORKING_TYPE'
		},
		status:{
			type: String|Number,
			default: '1'
		},
		tagType:{
			type: String,
			default: 'all'
		}
	},
	data() {
		return {
		};
	},
	computed:{
		typeList: function (){
			return this.$store.state.typeList
		}
	},
	methods: {
		close() {
			this.$emit('closeModal');
		}
	}
};
</script>
<style scoped lang="scss">
.lv-btn{
	width: 120rpx;
	border-radius: 20rpx;
	padding: 10rpx 0;
	color: #fff;
}
.u-tag--square{
	background: transparent !important;
}
</style>