<template>
	<ql-page>
		<u-navbar placeholder border autoBack title="设置语言" @clickLeft="BackPage" ></u-navbar>		
		<view class="pd-lr-30 font-30">
			<scroll-view :scroll-y="true" class="">
				<view
					v-for="option in configOptions"
					:key="option.value"
					class="pd-lr-30 flex-between h114 has-border white-bg" 
					@click="clickOption(option)"
				>
					{{ option.name }}
					<u--image width="40rpx" height="40rpx" src="/static/images/check.png" />
				</view>
			</scroll-view>
		</view>
	</ql-page>
</template>

<script>
export default {
	data() {
		return {
			configOptions: [
				{ name: '中文', value: 'cn' },
				{ name: '英文', value: 'en' },
				{ name: '中文1', value: 'cn1' },
				{ name: '中文2', value: 'cn2' },
				{ name: '中文3', value: 'cn3' },
				{ name: '中文4', value: 'cn4' },
				{ name: '中文5', value: 'cn5' },
				{ name: '中文6', value: 'cn6' },
				{ name: '中文7', value: 'cn7' },
				{ name: '中文8', value: 'cn8' },
				{ name: '中文9', value: 'cn9' },
				{ name: '英文1', value: 'en1' },
				{ name: '英文2', value: 'en2' },
				{ name: '英文3', value: 'en3' },
				{ name: '英文4', value: 'en4' },
				{ name: '英文5', value: 'en5' },
				{ name: '英文6', value: 'en6' },
				{ name: '英文7', value: 'en7' },
				{ name: '英文8', value: 'en8' },
				{ name: '英文9', value: 'en9' },
			]
		};
	},
	methods: {
		clickOption(option) {
			console.log(option)
		}
	}
};
</script>
<style scoped lang="scss">
	.scroll-Y {
		height: 300rpx;
	}
</style>