<template>
	<u-modal showCancelButton confirmColor='#ff4545' @cancel="close" @confirm="confirmData" :show="isShow" :title="$tc(title)"
	 :confirmText="$tc('确认')" :cancelText="$tc('取消')">
		<view class="flex-align max-width">
			<view class="input-view">
				<u--input
				    :placeholder="$tc('请输入内容')"
				    border="surround"
					v-model="val"
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
			default: '标题'
		}
	},
	data() {
		return {
			val:''
		};
	},
	methods: {
		confirmData(e){
			let {val}=this
			val=ListMixin.methods.maskSensitiveInfo(val,store.state.sensitiveData)
			this.$emit('confirm',val);
			this.close()
			console.log(e)
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