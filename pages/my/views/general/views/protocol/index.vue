<template>
	<view>
		<u-navbar placeholder border autoBack :title="$tc('隐私协议')" @clickLeft="BackPage"></u-navbar>
		<view>
			<u-list class="pd-lr-20">
				<u-list-item v-for="(section, title) in text" :key="title">
					<view class="">
						<p>{{ title }}</p>
						<view class="" style="height: 30rpx;">
						</view>
					</view>
				</u-list-item>
			</u-list>
		</view>
	</view>
</template>

<script>
	import privacy_zh from '@/i18n/agreement/privacy_zh.json';
	import privacy_zh_tw from '@/i18n/agreement/privacy_zh_tw.json';
	import privacy_hin from '@/i18n/agreement/privacy_hin.json';
	import privacy_esp from '@/i18n/agreement/privacy_esp.json';
	import privacy_pt from '@/i18n/agreement/privacy_pt.json';
	import privacy_vi from '@/i18n/agreement/privacy_vi.json';
	import privacy_en from '@/i18n/agreement/privacy_en.json';
	export default {
		data() {
			return {
				text: null
			};
		},
		onShow() {
			const value = uni.getStorageSync('lan') || 'zh';
			console.log(value);
			if (value === 'zh') {
				this.text = privacy_zh;
			} else if (value === 'zh_tw') {
				this.text = privacy_zh_tw;
			} else if (value === 'hin') {
				this.text = privacy_hin;
			} else if (value === 'esp') {
				this.text = privacy_esp;
			} else if (value === 'pt') {
				this.text = privacy_pt;
			} else if (value === 'vi') {
				this.text = privacy_vi;
			} else if (value === 'en') {
				this.text = privacy_en;
			} 



		},
		methods: {

		}
	}
</script>

<style lang="scss">

</style>