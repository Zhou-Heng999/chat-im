<template>
	<ql-page>
		<u-modal :show="show" :confirmText="$tc('确认')" :cancelText="$tc('取消')" showCancelButton @confirm="questionConfirm" @cancel="questionCancel"
			:title="$tc('设置密保')">
			<view class="slot-content">
				<view class="main">
					<view class="row ">
						<view class="label mb-20">{{$tc('问题:')}}</view>
						<view class="input">
							<u--input :placeholder="$tc('请选择密保问题')" border="surround" readonly v-model="issueText"></u--input>
							<view class="trigger" @click="issueVisible = true"></view>
						</view>
					</view>
					<view class="row  mt-20">
						<view class="label mb-20">{{$tc('答案:')}}</view>
						<view class="input" @click="issueVisible = false">
							<u--input :placeholder="$tc('请输入密保答案')" border="surround" v-model="answerValue"></u--input>
						</view>
					</view>
				</view>
				<view class="tips flex-justify-end pd-tb-10 red-color font-24">{{$tc('设置后不可更改')}}</view>
			</view>
		</u-modal>

		<u-picker :show="issueVisible" keyName="name" :columns="columns" @cancel="issueVisible = false"
			@confirm="issueConfirm" closeOnClickOverlay @close="issueVisible = false" :cancelText="$tc('取消')"
			:confirmText="$tc('确认')" />
	</ql-page>
</template>

<script>
	export default {
		data() {
			return {
				show: false,
				issueVisible: false,
				issueText: '',
				issueValue: '',
				answerValue: '',
				columns: [
					[{
							name: this.$tc('我的生日'),
							value: '1'
						},
						{
							name: this.$tc('我的学校'),
							value: '2'
						}
					]
				],
			}
		},
		props: {
			visible: {
				type: Boolean,
				default: false,
			}
		},
		computed: {
			userInfo() {
				return this.$store.state.userInfo
			}
		},
		methods: {
			questionConfirm() {
				this.$http.app_user.set_question({
					userID: this.userInfo.userID,
					question: this.issueValue,
					answer: this.answerValue
				}).then(res => {
					this.issueText = ''
					this.issueValue = ''
					this.answerValue = ''
					this.$store.commit('setUserInfo', {
						...this.userInfo,
						has_question: true
					})
					uni.showToast({
						title: this.$tc('设置成功')
					})
					this.$emit('close')
				}).catch(err => {
					uni.showToast({
						title: this.$tc('设置失败')
					})
					console.log('error...', err)
				})
			},
			questionCancel() {
				this.issueText = ''
				this.issueValue = ''
				this.answerValue = ''
				this.$emit('close')
			},
			issueConfirm(value) {
				console.log('issueConfirm...', value)
				this.issueText = value.value[0].name
				this.issueValue = value.value[0].value
				this.issueVisible = false
			}
		},
		watch: {
			visible(val) {
				this.show = val
			}
		}
	}
</script>

<style scoped lang="scss">
	.row {
		.input {
			position: relative;
			border-radius: 8rpx;
			border: 1px solid #eee;
	
			.trigger {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
			}
		}
	}
</style>