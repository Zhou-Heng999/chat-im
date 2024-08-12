<template>
	<view class="flex-align top flex-between">
		<view class="flex-wrap flex-center">
			<!-- <u-image class="mr-20" width="27rpx" height="23rpx" @click="showMenu" src="@/static/images/home/more.png"></u-image> -->
			<imageIcon width="35rpx" height="35rpx" name="logo"></imageIcon>
			<text class="font-20 white-color font-blod ml-10">V9</text>
		</view>
		<view class="user-img" @click="touchAva">
			<u-avatar :text="avatarTxt" fontSize="18" size="40rpx" bg-color="#c0c4cc"></u-avatar>
			<!-- <u-image width="61rpx" height="61rpx" src="@/static/images/home/sxs.png"></u-image> -->
		</view>
		<view class="pos-absolute">
			<infoModule :isShow="isShowInfo" @close="isShowInfo = false"></infoModule>
		</view>
			
	</view>
</template>

<script>
	import infoModule from './modules/information.vue'
	export default {
		components:{
			infoModule
		},
		data(){
			return{
				isShowInfo:false
			}
		},
		computed:{
			avatarTxt(){
				return (this.userInfo.user_info.account).slice(0,1)
			}
		},
		methods:{
			touchAva(){
				this.isShowInfo = !this.isShowInfo;
			},
			showMenu(){
				let isShow = this.$store.state.isShowMenu;
				this.$store.commit('setIsShowMenu',!isShow)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.top{
		height: 50rpx;
		padding: 0rpx 20rpx 0rpx 20rpx;
	}
	.user-img{
		border: 3rpx solid rgba(255,255,255,0.25);
		border-radius: 50%;
	}
</style>