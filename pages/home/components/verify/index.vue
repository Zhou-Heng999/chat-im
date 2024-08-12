<template>
	<u-modal showCancelButton confirmColor='#ff4545' @cancel="close" @confirm="confirmData" :show="isShow" :title="$tc(title)"
	 :confirmText="$tc('确认')" :cancelText="$tc('取消')">
		<view class="flex-align max-width">
			<view class="input-view">
				<u--input
				    :placeholder="$tc(placeholder)"
				    border="surround"
					v-model="val"
						:maxlength="maxLength"
				  ></u--input>
			</view>
		</view>
	</u-modal>
</template>

<script>
	import { ListMixin } from '@/mixin/list';
	import store from "@/store/index.js"
export default {
	props: { 
		isShow: {
			type: Boolean,
			default: false
		},
		title:{
			type: String,
			default: '验证申请'
		},
		maxLength: {
			type: Number,
			default: -1
		},
		placeholder:{
			type: String,
			default: '请输入内容'
		},
		defaultVal:{
			type: String,
			default: ''
		}
	},
	data() {
		return {
			val:''
		};
	},
	watch:{
		defaultVal: {
			handler(val) {
				if(val){
					this.val=val;
				}
			},
			immediate: true
		},
	},
	methods: {
		confirmData(e){
			let {val}=this
			console.log(val);
			val=ListMixin.methods.maskSensitiveInfo(val,store.state.sensitiveData)
			this.$emit('confirm',val);
			this.close()
		},
		close() {
			this.$emit('closeModal');
		}
	}
};
</script>
<style scoped lang="scss">
.option-view {
	width: 600rpx;
	height: 380rpx;
	border-radius: 40rpx;
	background: rgba(255, 255, 255, 1);

}
.title{
	height: 100rpx;
}
</style>