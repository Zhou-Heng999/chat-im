<template>
	<u-popup :show="isShow" @close="close" mode="right" bgColor="transparent" closeable duration="0">
		<view class="pop-box flex-column pd-tb-10">
			<text class="font-20 pd-tb-10 flex-center">{{$t('114')}}</text>
			<u-cell-group :border="false" v-if="USER_INFO_TYPE&&userInfo">
				<u-cell :border="false" v-for='(item,index) in listData' :title="$t(item.title)" isLink
					:value="item.type=='level'?$t(USER_LV[userInfo.user_info[item.type]].lan):item.type=='vip_type'?$t(USER_INFO_TYPE[userInfo.user_info.vip_type].lan):userInfo.user_info[item.type]">
				</u-cell>
				<u-cell :border="false" :title="$t('119')" isLink @click="isShowQrcode=true">

				</u-cell>
			</u-cell-group>
		</view>
		<qrcode-modal :isShow="isShowQrcode" @closeModal='isShowQrcode=false'></qrcode-modal>
	</u-popup>
</template>

<script>
	import {
		USER_LV,
		VIP_TY
	} from '@/const/index.js'
	import qrcodeModal from './qrcode.vue'
	export default {
		props: {
			isShow: {
				type: Boolean,
				default: false
			}
		},
		components: {
			qrcodeModal
		},
		data() {
			return {
				isShowQrcode: false,
				USER_INFO_TYPE: '',
				VIP_TY,
				codeUrl: '',
				listData: [{
						title: '150',
						val: '',
						type: 'account'
					},
					{
						title: '116',
						val: '',
						type: 'user_id'
					},
					{
						title: '118',
						val: '',
						type: 'vip_type'
					},
				]
			};
		},
		mounted() {
			this.getQrcode()
			let {
				USER_INFO_TYPE
			} = this.$store.state.typeList
			this.USER_INFO_TYPE = USER_INFO_TYPE
			// console.log(this.userInfo.user_info.vip_type);
			// console.log(this.$store.state.typeList)
		},
		methods: {
			getQrcode() {
				this.$http.account.getQRCode().then(res => {
					console.log(res)
					this.codeUrl = res.data
				})
			},
			close() {
				this.$emit('close')
			}
		}
	};
</script>
<style scoped lang="scss">
	.pop-box {
		width: 400rpx;
		min-height: 200rpx;
		// background: #1C1A32;
		border-radius: 20rpx;
	}
	.pop-title{
		height: 30rpx;
	}
	::v-deep .u-popup__content{
		position: absolute;
		right: 10rpx;
		top: 60rpx;
	}
</style>