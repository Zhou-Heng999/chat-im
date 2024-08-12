<template>
	<ql-page class="f5-bg edit-page">
    <u-navbar placeholder border autoBack :title="$tc('编辑资料')" @clickLeft="BackPage" ></u-navbar>
		<view class="pd-lr-30 font-30 edit-info">
			<view class="flex-between h134 has-border" @click="clickHead">
				<view class="label">{{$tc('头像')}}</view>
				<avatar :info="info"/>
			</view>
			<view class="flex-between h134 has-border" @click="openInputPopup('nick')">
				<view class="label">{{$tc('昵称')}}</view>
				<view class="value ellipsis1">{{ info.nick || '-' }}</view>
			</view>
			<view class="flex-between h134 has-border" @click="openInputPopup('selfSignature')">
				<view class="label">{{$tc('个性签名')}}</view>
				<view class="value ellipsis1">{{ info.selfSignature || '-' }}</view>
			</view>
			<view class="flex-between h134 has-border" @click="clickGender">
				<view class="label">{{$tc('性别')}}</view>
				<view class="value">{{ $tc(genderShowText[info.gender]) || $tc('未知') }}</view>
			</view>
		</view>
    <u-picker :show="showGender" keyName="label" :columns="columnsGender" @cancel="cancelGender" @confirm="confirmGender"
	 :cancelText="$tc('取消')" :confirmText="$tc('确认')"></u-picker>
		<loading :loading="loading" :message="$tc('正在保存')" />
		<inputPopup
			:show.sync="showInputPopup"
			:value="$tc(valueInputPopup)"
			:title="$tc(titleInputPopup)"
			@confirm="confirmInputPopup"
			:maxlength="20"
		/>
		<updateImagePopup :show.sync="showUpdateImagePopup" @change="changeUpdateImagePopup" @close="showUpdateImagePopup=false"/>
	</ql-page>
</template>

<script>
import avatar from '@/components/avatar'
import loading from '@/components/loading'
import inputPopup from '@/components/input-popup'
import updateImagePopup from '@/components/update-image-popup'
export default {
	components: { avatar, loading, inputPopup, updateImagePopup },
	data() {
		return {
			showUpdateImagePopup: false,
      showGender: false,
			showInputPopup: false,
			valueInputPopup: '',
			titleInputPopup: '',
			actionCode: '',
			loading: false,
			genderShowText: {
        [uni.$chatKit.TUIChatEngine.TYPES.GENDER_UNKNOWN]: '不显示', // 
        [uni.$chatKit.TUIChatEngine.TYPES.GENDER_FEMALE]: '女', // 女性
        [uni.$chatKit.TUIChatEngine.TYPES.GENDER_MALE]: '男', // 男性
      },
			info: {},
		};
	},
	computed: {
		columnsGender() {
			return [
        [
					{
						value: uni.$chatKit.TUIChatEngine.TYPES.GENDER_UNKNOWN,
						label: this.$tc(this.genderShowText[uni.$chatKit.TUIChatEngine.TYPES.GENDER_UNKNOWN])
					},
        	{
						value: uni.$chatKit.TUIChatEngine.TYPES.GENDER_FEMALE,
						label: this.$tc(this.genderShowText[uni.$chatKit.TUIChatEngine.TYPES.GENDER_FEMALE])
					},
					{
						value: uni.$chatKit.TUIChatEngine.TYPES.GENDER_MALE,
						label: this.$tc(this.genderShowText[uni.$chatKit.TUIChatEngine.TYPES.GENDER_MALE])
					},
				]
      ]
		}
	},
	created() {
		this.getInfo()
	},
	methods: {
		getInfo() {
			uni.$chatKit?.chat?.getMyProfile().then(result => {
				this.info = result.data
			})
		},
		updateInfo(params) {
			const allParams = {
				...this.info,
				...params
			}
			this.loading = true
			const newParams ={	
				nick: allParams.nick,
  			avatar: allParams.avatar,
  			gender: allParams.gender || uni.$chatKit.TUIChatEngine.TYPES.GENDER_UNKNOWN,
  			selfSignature: allParams.selfSignature,
  			allowType: allParams.allowType,
			}
			uni.$chatKit?.chat?.updateMyProfile(newParams).then(result => {
				this.getInfo()
			}).finally(() => {
				this.loading = false
			})
		},
		clickHead() {
			this.showUpdateImagePopup = true
		},
		changeUpdateImagePopup(avatar) {
			this.showUpdateImagePopup = false
			this.updateInfo({ avatar })
		},
		openInputPopup(code) {
			this.actionCode = code
			switch(code) {
				case 'nick':
					this.titleInputPopup = '修改昵称'
					this.valueInputPopup = this.info[this.actionCode]
					break;
				case 'selfSignature':
					this.titleInputPopup = '修改个性签名'
					this.valueInputPopup = this.info[this.actionCode]
					break;
			}
			this.showInputPopup = true
		},
		confirmInputPopup(value) {
			this.showInputPopup = false
			this.updateInfo({
				[this.actionCode]: value
			})
		},
		clickGender() {
			this.showGender = true
		},
		cancelGender() {
			this.showGender = false
		},
		confirmGender(item) {
			this.showGender = false
			this.updateInfo({
				gender: item.value[0].value
			})
		}
	}
};
</script>
<style scoped lang="scss">
.edit-page {
background-color: $colorF;
.edit-info {
	.label {
	}
	.value {
		flex: 1;
		text-align: right;
		padding-left: 20rpx;
		color: rgba(173, 181, 189, 1);
	}
}
}
</style>