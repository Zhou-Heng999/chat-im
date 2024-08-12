<template>
	<ql-page class="my-page">
		<!-- <scroll-view style="height: 94vh;" scroll-y="true"> -->
		<view class="pd-tb-30 flex-column info">
			<view class="top-view" ></view>
			<view class="max-width flex-between pd-lr-30 mb-20">
				<view class="flex-center white-color ">
					{{appVersionName}}
				</view>
				<image
					class="image-tb_ewm"
					src="/static/images/tb_ewm1.png"
					@click="clickTbEwm"
				/>				
			</view>
			
			<infoShow :info="info" class="info-show" @clickTitle="clickInfoShow" @clickHead="clickInfoShow" />
		</view>
		
		
		<view class="options">
			<view class="pd-lr-55 bg-color-f">
				<view
					v-for="(option, optionIndex) in configOptions"
					:key="option.name"
					class="flex-between h134"
					:class="{ 'has-border': optionIndex != configOptions.length-1 }"
					@click="clickOption(option)"
				>
					<view class="flex-center">
						<imageIcon class="mr-30" width="46rpx" height="46rpx" :src="`/static/images/${option.icon}.png`" />
						{{ $tc(option.name) }}
					</view>
					<imageIcon width="20rpx" height="20rpx" :src="`/static/images/an_jty.png`" />
				</view>				
			</view>
			<view class="flex-column">
				<view class="">
					<u-button type="error" class="mt-20 h100 bg-color-f switch-btn main-black" @click="switchAccount">{{$tc('切换账号')}}</u-button>
				</view>
				<view class="">
					<u-button type="error" class="mt-20 h100 bg-color-f quit-btn" @click="clickQuit">{{$tc('退出登录')}}</u-button>
				</view>
			</view>
		</view>
		
		<confirmModal
			:show.sync="showConfirmModal"
			:title="$tc('退出登录')"
			:content="$tc('退出登录后本设备将无法收到新消息提醒，确定退出登录？')"
			@confirm="confirmConfirmModal"
		/>
		<!-- </scroll-view> -->
	</ql-page>
</template>

<script>
import infoShow from './components/infoShow/index'
import confirmModal from '@/components/confirm-modal/index'
export default {
	components: { infoShow,confirmModal },
	data() {
		return {
			info: {},
			configOptions: [
				{ name: '安全', path: 'safe', icon: 'tb_aq' },
				// { name: '隐私', path: 'privacy', icon: 'tb_ys' },
				{ name: '通用', path: 'general', icon: 'tb_ty' },
				{ name: '反馈', path: 'feekback', icon: 'tb_fk' },
			],
			showConfirmModal: false,
			appVersionName:''
		};
	},
	onShow() {
		const currentTimestamp = new Date().getTime();
		console.log('currentTimestamp',currentTimestamp)
		uni.$chatKit?.chat?.getMyProfile().then(result => {
			this.info = result.data
		})
		this.setTabbar();
		// #ifdef APP-PLUS
		let that = this;
		plus.runtime.getProperty(plus.runtime.appid, function(widgetInfo) {
			that.appVersionName=widgetInfo.version
		})
		// #endif
	},
	methods: {
		
		switchAccount() {
			uni.navigateTo({
				url: `/pages/my/views/switch/index`
			})
		},
		clickQuit() {
			this.showConfirmModal = true
		},
		clickOption(option) {
			uni.navigateTo({
				url:`/pages/my/views/${option.path}/index`
			})
		},
		clickInfoShow() {
			uni.navigateTo({
				url:`/pages/my/views/edit/index`
			})
		},
		clickTbEwm() {
			console.log("112233")
			uni.setStorage({
				key: 'qr_code_info',
				data: {
          type: uni.$chatKit.TUIChatEngine.TYPES.CONV_C2C,
          info: this.info,
        }
			})
			uni.navigateTo({
				url:`/pages/my/views/code/index`
			})
			console.log("000000")
		},
		confirmConfirmModal() {
			this.showConfirmModal = false
			uni.clearStorageSync()
			this.unWatchStore()
			// return
			uni.$chatKit.chat.logout().then(res=>{
				uni.reLaunch({
					url:`/pages/login/index`
				})
			})
			// uni.$chatKit?.chat.destroy()
			
		}
	}
};
</script>
<style scoped lang="scss">
	.top-view{
		height: var(--status-bar-height);
	}
.my-page {
	// background-image: linear-gradient(to right, #49a8f4, #5ed3f3);
	.info {
		min-height: 500rpx;
		position: relative;
		background-image:  radial-gradient(43.07% 45.75% at 52% 50%, rgba(30, 16, 85, 1) 0%, rgba(27, 14, 80, 0) 100%), linear-gradient(105.17deg, rgba(22, 11, 37, 1) 0%, rgba(49, 23, 101, 1) 100%);
		.image-tb_ewm {
			// position: absolute;
			// right: 46rpx;
			// top: 46rpx;
			width: 46rpx;
			height: 46rpx;
			z-index: 99;
		}
		.info-show {
			// position: absolute;
			// bottom: 56rpx;
		}
	}
	.fixed-cls{
		position: absolute;
		left: 50rpx;
		top: 50rpx;
		
	}
	.options {
		// flex: 1;
		min-height: calc(100vh - 500rpx);
		// background-color: $colorF;
		background: #F5F5F5;
		border-radius: 60rpx 60rpx 0rpx 0rpx;
	}
	.bg-color-f {
		background-color: #fff;
	}
	.quit-btn {
		font-size: 30rpx;
		color: rgba(255, 69, 69, 1);
		border: 0px;
		border-radius: 0rpx;
		&::after {
			border: 0px;
			border-radius: 0rpx;
		}
	}
	.switch-btn {
		font-size: 30rpx;
		// color: rgba(255, 69, 69, 1);
		border: 0px;
		border-radius: 0rpx;
		&::after {
			border: 0px;
			border-radius: 0rpx;
		}
	}
}
.border-top{
	border-top: 15rpx solid rgba(245, 245, 245, 1);
}
</style>