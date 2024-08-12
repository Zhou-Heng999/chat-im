<template>
	<ql-page class="bg-color-f5">
		<u-navbar placeholder border autoBack :title="$tc('通知设置')" @clickLeft="BackPage" ></u-navbar>		
		<view class="font-30">
			<!-- <view class="pd-lr-30 flex-between h64 has-border font-24 gray-color2" >
				{{$tc('应用未打开时')}}
			</view>
			<view class="pd-lr-30 flex-between h114 has-border white-bg" >
				{{$tc('新消息通知')}}
        <u-switch v-model="valueNewMsgInform" :disabled="!isApp" @change="changeNewMsgInform"></u-switch>
			</view>
			<view class="pd-lr-30 flex-between h114 has-border white-bg" >
				{{$tc('语音和视频通话邀请提醒')}}
        <u-switch v-model="valueMultimediaInform" @change="changeMultimediaInform"></u-switch>
			</view> -->
			<view class="pd-lr-30 flex-between h64 has-border font-24 gray-color2" >
				{{$tc('应用打开时')}}
			</view>
			<view class="pd-lr-30 flex-between h114 has-border white-bg" >
				{{$tc('声音')}}
        <u-switch v-model="valueSoundInform" @change="changeSoundInform"></u-switch>
			</view>
			<view class="pd-lr-30 flex-between h114 has-border white-bg" >
				{{$tc('震动')}}
        <u-switch v-model="valueShakeInform" @change="changeShakeInform"></u-switch>
			</view>
		</view>
		<confirmModal
			:show.sync="showConfirmModal"
			:title="$tc('开启通知')"
			:content="$tc('打开系统通知权限，不错过任何消息')"
			confirmColor="rgba(53, 173, 252, 1)"
			@confirm="confirmConfirmModal"
		/>
	</ql-page>
</template>

<script>
import confirmModal from '@/components/confirm-modal/index'

const authorizeType = {
	['已授权']: 'authorized',
	['已拒绝']: 'denied',
	['未确定']: 'not determined',
	['配置错误']: 'config error',
}

export default {
	components: { confirmModal },
	data() {
		return {
			systemInfo: {},
			showConfirmModal: false,
      valueNewMsgInform: false,
      valueMultimediaInform: false,
      valueSoundInform: false,
      valueShakeInform: false,
		};
	},
	computed: {
		isAndroid() {
			return this.systemInfo.osName === 'android'
		},
		isIos() {
			return this.systemInfo.osName === 'ios'
		},
		isApp() {
			return ['android', 'ios'].includes(this.systemInfo.osName)
		},
		isVibrate() {
			return this.$store.state.isVibrate;
		},
		isBell() {
			return this.$store.state.isBell;
		}
	},
	created() {
		this.systemInfo = uni.getSystemInfoSync()
		this.$nextTick(() => {
			this.getNewMsgInform()
			this.getMultimediaInform()
			this.getSoundInform()
			this.getShakeInform()
		})
	},
	methods: {
		getNewMsgInform() {
			// if (this.isApp) {
			// 	const appAuthorizeSetting = uni.getAppAuthorizeSetting()
			// 	this.valueNewMsgInform = appAuthorizeSetting.notificationAuthorized === authorizeType['已授权']
			// } else {
			// 	this.valueNewMsgInform = false
			// }
			this.valueNewMsgInform = true
		},
		getMultimediaInform() {
			this.valueMultimediaInform = true
		},
		getSoundInform() {
			// this.valueSoundInform = true
			this.valueSoundInform =this.$store.state.isBell;
		},
		getShakeInform() {
			// this.valueShakeInform = true
			this.valueShakeInform =this.$store.state.isVibrate;
		},
		changeNewMsgInform() {
			this.showConfirmModal = true
		},
		confirmConfirmModal() {
			this.showConfirmModal = false
		},
		changeMultimediaInform() {},
		changeSoundInform() {
			console.log(this.valueSoundInform)
			this.$store.commit('setIsBell',this.valueSoundInform)
			// this.valueSoundInform = !this.valueSoundInform
		},
		changeShakeInform() {
			console.log(this.valueShakeInform)
			this.$store.commit('setIsVibrate',this.valueShakeInform)
			// this.valueShakeInform = !this.valueShakeInform
		},
	}
};
</script>
<style scoped lang="scss">
.bg-color-f5 {
	height: 100%;
	background-color: #f5f5f5;
}
</style>