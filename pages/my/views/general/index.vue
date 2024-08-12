<template>
	<ql-page class="bg-color-f5">
		<u-navbar placeholder border autoBack :title="$tc('通用')" @clickLeft="BackPage" ></u-navbar>
		<view class="font-30">
			<view
				v-for="option in configOptions"
				:key="option.path"
				class="pd-lr-30 flex-between h114 has-border bg-color-f"
				@click="clickItem(option)"
			>
				{{ $tc(option.name) }}
				<view class="flex-wrap flex-center">
					<view class="mr-10" v-if="option.path=='language'">
						{{nowLanguage}}
					</view>
					<view class="mr-10" v-if="option.path=='translate'">
						{{nowTranslate}}
					</view>
					<imageIcon width="20rpx" height="20rpx" :src="`/static/images/an_jty.png`" />
				</view>
			</view>
		</view>
		
    <u-picker
			:show="showLanguage"
			keyName="name"
			:columns="columnsLanguage"
			@cancel="showLanguage = false"
			@confirm="confirmLanguage"
			closeOnClickOverlay
			@close="showLanguage = false"
			:defaultIndex="defaultIndex"
			:cancelText="$tc('取消')"
			:confirmText="$tc('确认')"
		/>
    <u-picker
			:show="showTranslate"
			keyName="name"
			:columns="columnsLanguage"
			@cancel="showTranslate = false"
			@confirm="confirmTranslate"
			closeOnClickOverlay
			@close="showTranslate = false"
			:defaultIndex="defaultTranIdx"
			:cancelText="$tc('取消')"
			:confirmText="$tc('确认')"
		/>
	</ql-page>
</template>

<script>
import store from '@/store/index.js'
import TranslateLangManage from '@/pages/TUIKit/utils/translateLangManage'
export default {
	components: {  },
	data() {
		return {
			columnsLanguage: [
				[
					{ name: '简体中文', value: 'zh' },
					{ name: '繁体中文', value: 'zh_tw' },
					{ name: 'English', value: 'en' },
					{ name: 'हिन्दी', value: 'hin' },
					{ name: 'Español', value: 'esp' },
					{ name: 'Português', value: 'pt' },
					{ name: 'Tiếng Việt', value: 'vi' },
				]
			],
			showLanguage: false,
			showTranslate: false,
			nowLanguage: '',
			nowTranslate: '',
			defaultIndex: [0],
			defaultTranIdx: [0]
		};
	},
	computed: {
		configOptions() {
			return [
				{ name: this.$tc('新消息通知'), path: 'notification' },
				{ name: this.$tc('语言'), path: 'language' },
				{ name: this.$tc('隐私协议'), path: 'protocol' },
				{ name: this.$tc('联系我们'), path: 'contactUs' },
				{ name: this.$tc('消息翻译'), path: 'translate' },
				// { name: '关于', path: 'about' },
			]
		}
	},
	mounted() {
		this.defaultLan();
		this.defaultTranslate();
	},
	methods: {
		defaultLan() {
			this.columnsLanguage[0].forEach((item,index)=>{
				if(item.value == this.$store.state.lan){
					this.nowLanguage = item.name;
					let defaultIdx = [];
					defaultIdx.push(index);
					this.defaultIndex = defaultIdx;
				}
			})
		},
		defaultTranslate() {
			this.columnsLanguage[0].forEach((item,index)=>{
				if(item.value == TranslateLangManage.getItem(store.state.userInfo.userID)){
					this.nowTranslate = item.name;
					let defaultIdx = [];
					defaultIdx.push(index);
					this.defaultTranIdx = defaultIdx;
				}
			})
		},
		clickItem(option) {
			if (option.path === 'language') {
				this.showLanguage = true
			} else if (option.path === 'translate') {
				this.showTranslate = true
			}  else {
				uni.navigateTo({
					url:`/pages/my/views/general/views/${option.path}/index`
				})
			}
		},
		confirmLanguage(value) {
			let target = value.value[0];
			this.nowLanguage = target.name;
			let type = target.value;
			this.changeLanguage(type);
			this.showLanguage = false
		},
		confirmTranslate(value) {
			let target = value.value[0];
			this.nowTranslate = target.name;
			let type = target.value;
			TranslateLangManage.setItem(store.state.userInfo.userID, type)
			this.showTranslate = false
		},
	}
};
</script>
<style scoped lang="scss">
.bg-color-f5 {
	height: 100%;
	background-color: #f5f5f5;
}
.bg-color-f {
	background-color: #fff;
}
</style>