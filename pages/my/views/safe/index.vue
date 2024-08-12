<template>
	<ql-page>
		<u-navbar placeholder border autoBack :title="$tc('安全')" @clickLeft="BackPage"></u-navbar>

		<view class="font-30">
			<view v-for="option in configOptions" :key="option.path"
				class="pd-lr-30 flex-between h114 has-border bg-color-f" @click="clickItem(option)">
				{{ $tc(option.name) }}
				<view class="flex-wrap flex-center">
					<text style="color: #6a6a6a; margin-right: 20rpx;">{{$tc(option.tips)}}</text>
					<imageIcon width="20rpx" height="20rpx" :src="`/static/images/an_jty.png`" />
				</view>
			</view>
		</view>
		
		<Question :visible="questionVisible" @close="questionVisible = false" />
	</ql-page>
</template>

<script>
	import Question from './views/question/index.vue'
	export default {
		components: {
			Question
		},
		data() {
			return {
				configOptions: [
					{
						name: '设置密保',
						path: 'question',
						tips:''
					},
					// {
					// 	name: '登录设备管理',
					// 	path: 'device'
					// }, 
				],
				questionVisible: false,
				columns: [
					[{
							name: this.$tc('我的生日'),
							value: '1'
						},
						{
							name: this.$tc('我的学校'),
							value: '2'
						}
					]
				],
			};
		},
		onShow() {
			this.configOptions.forEach(item =>{
				if(item.path == 'question'){
					if(this.userInfo.has_question){
						this.configOptions[0].tips = this.$tc('已设置')
					}else{
						this.configOptions[0].tips = this.$tc('未设置')
					}
				}
			})
			
		},
		computed: {
			userInfo() {
				return this.$store.state.userInfo
			}
		},
		methods: {
			clickItem(option) {
				console.log('clickItem...', option)
				// 设置密保
				if (option.path === 'question') {
					if(this.userInfo.has_question) {
						return uni.showToast({
							title: this.$tc('已设置密保'),
							icon: 'none',
						})
					}
					
					this.questionVisible = true
				}else {
					uni.navigateTo({
						url: `/pages/my/views/safe/views/${option.path}/index`
					})
				}
			}
		}
	};
</script>
<style scoped lang="scss">
	
</style>