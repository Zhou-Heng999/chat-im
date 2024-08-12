<template>
	<view class="max-width">
		<u-search :placeholder="$tc('搜索')" @change="$u.debounce(onChange, 1000)" v-model="keyword" :showAction='false' ></u-search>
		
	</view>
</template>

<script>
export default {
	data() {
		return {
			keyword:''
		};
	},
	methods: {
		onChange(){
			uni.$chatKit.chat.getUserProfile({
				userIDList:[this.keyword]
			}).then(res=>{
				this.$emit('onHanlderSearch',res.data)
			})
		},
		
	}
};
</script>
<style scoped lang="scss">
	
</style>