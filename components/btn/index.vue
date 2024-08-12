<template>
	
	<view :style="{height:h+'rpx',width:w+'rpx'}" @click="onClick" :class='[btnClass,"flex-center",shape=="circle"?"radius-100":"radius-10"]'  >
		<text style="white-space: nowrap;" v-if="!loading">{{text}}</text>
		<u-loading-icon v-else mode="semicircle" color="#fff"></u-loading-icon>
	</view  >
</template>

<script>
export default {
	props: {
		text: {
			type: String,
			default: '按钮'
		},
		h:{
			type: String|Number,
			default: '90'
		},
		w:{
			type: String,
			default: '540'
		},
		btnType:{
			type: String,
			default: 'primary'
		},
		shape:{
			type: String,
			default: 'circle'
		},
		disabled: {
			type: Boolean,
			required: false,
			default: false,
		},
		loading: {
			type: Boolean,
			default: false
		}
	},
	computed:{
		btnClass(){
			let {btnType,btnClassList,disabled}=this

			return disabled ? btnClassList['disabled'] : btnClassList[btnType]
		}
	},
	data() {
		return {
			btnClassList:{
				'primary':'btn-primary',
				'info':'btn-info',
				'error': 'btn-error',
				'disabled': 'btn-disabled',
			}
		};
	},
	methods: {
		onClick(){
			if (this.disabled||this.loading) {
				return
			}
			this.$emit('click');
		},
		close() {
			this.$emit('closeModal');
		}
	}
};
</script>
<style scoped lang="scss">
	.btn-primary{
		background:  linear-gradient(127.68deg, rgba(22, 163, 240, 1) 0%, rgba(70, 174, 247, 1) 100%);
		color:#fff;
	}
	.radius-100{
		border-radius: 100rpx;
	}
	.btn-info{
		border: 2rpx solid rgba(224, 224, 224, 1);
		color: #949494;
	}
	.btn-error{
		background: rgba(249, 117, 144, 1);
		color:#fff;
	}
	.btn-disabled {
		background: rgba(240, 240, 240, 1);
		color: rgba(184, 184, 184, 1);
		cursor: not-allowed
	}
</style>