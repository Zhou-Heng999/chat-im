<template>
	<view class="flex-column pos-fixed box" style="top: 200rpx;">
		<view class="flex-wrap flex-align mb-40 item_box" v-for="(item, index) in menuList" :key="index" @click="toPage(item)">
			<u-image v-show="nowPage!=item.pagePath" width="32rpx" height="32rpx" :src="item.image" mode=""></u-image>
			<u-image v-show="nowPage==item.pagePath" width="32rpx" height="32rpx" :src="item.imageActive" mode=""></u-image>
			<text v-if="$store.state.isShowMenu" class="ml-10">{{$t(item.title)}}</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				menuList:[
					{
						title:'13',
						image:'../../static/images/tabbar/tb_home_off.png',
						imageActive:'../../static/images/tabbar/tb_home_on.png',
						pagePath : "/pages/home/index",
					},
					{
						title:'15',
						image:'../../static/images/tabbar/tb_ms_off.png',
						imageActive:'../../static/images/tabbar/tb_ms_on.png',
						pagePath : "/pages/message/index",
					},
					{
						title:'16',
						image:'../../static/images/tabbar/tb_m_off.png',
						imageActive:'../../static/images/tabbar/tb_m_on.png',
						pagePath : "/pages/user/index",
					}
				],
			}
		},
		computed: {
			nowPage() {
				let url = `/${this.$store.state.nowPage}`
				return url;
			}
		},
		methods:{
			toPage(item){
				// console.log(item)
				uni.switchTab({
					url:item.pagePath
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.box{
		// background: #0d1226;
	}
	.item_box{
		padding: 5rpx 10rpx 5rpx 10rpx;
		border-radius: 0 5rpx 5rpx 0;
	}
	.item_box:hover{
		background: rgba(28, 26, 50, 0.70);
	}
</style>