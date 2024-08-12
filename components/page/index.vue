<template>
	
	<view class="page-box" :style="lightStyle" @click="$emit('click')" >
		<view class="top-view" ></view>
		<slot></slot>

		<u-toast ref="uToast"></u-toast>
		<!-- 无网络提示 -->
		<!-- <u-no-network @disconnected="disconnected" @connected="connected" @retry="retry"></u-no-network> -->
	</view>
</template>

<script  >

	export default {
		data() {
			return {
				lightStyle: {
					'--main-bg': '#fff',
					'--less-bg': '#f1f1f2',
					'--main-text': '#0f1828',
					'--main-black': '#28303f',
					'--less-black': '#adb5bd',
					'--border-bg':'#f0f0f0',
					'--navbar-bg': '#F8F8F8',
					'--input-bg': '#fff',
					'--border-b-color': 'rgba(0, 0, 0, 0.06)',
					'--from-mess-bg': '#95ec69',
					'--to-mess-bg': '#fff',
					'--row-bg': '#fff',
					'--switch-bg': '#e6e6e6',
					'--panel-bg': '#eaeaea',
					'--button-bg': '#d7d7d7',
					'--red-white-color': 'red',
					'--calendar-month': '#303133',
					'--calendar-disable': '#cacbcd',
					'--index-title-bg': '#E9E9E9'
				},
				darkStyle: {
					'--main-bg': '#111',
					'--less-bg': '#1a2b3e',
					'--main-text': '#fff',
					'--main-black': '#fff',
					'--less-black': '#efefef',
					'--border-bg':'#f0f0f0',
					'--navbar-bg': '#111',
					'--input-bg': '#2C2C2C',
					'--border-b-color': 'rgba(255, 255, 255, 0.05)',
					'--from-mess-bg': '#3EB575',
					'--to-mess-bg': '#2C2C2C',
					'--row-bg': '#191919',
					'--switch-bg': '#3b3b3b',
					'--panel-bg': '#1e1e1e',
					'--button-bg': '#353535',
					'--calendar-month': '#7f7f7f',
					'--calendar-disable': '#5f5f5f',
					'--index-title-bg': '#1D1D1D'
				},
			};
		},
		computed: {
			themeModel() {
				return this.$store.state.themeModel;
			},
		},
		watch: {},
		created() {
		},
		methods: {
			disconnected() {
				console.log('disconnected');
			},
			connected() {
				// console.log('connected');
			},
			toast(config) {
				this.$refs.uToast.show(config);
			}
		}
	};
</script>
<style scoped lang="scss">
	.page-box {
		// margin-top:  var(--status-bar-height) ;
		background: var(--main-bg);
		color: var(--main-text);
		min-height: 100%;
	}
	
	.top-view{
		// position: fixed;
		// top: 0;
		// left: 0;
		// height: var(--status-bar-height);
		// background: red;
		// width: 750rpx;
		// z-index: 10000;
	}
	uni-app,
	uni-page-head {
		background-color: var(--main-bg) !important;
	}
</style>