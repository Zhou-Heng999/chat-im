<template>
	<ql-page>
		<u-navbar placeholder border autoBack :title="$tc('编辑资料')" @clickLeft="BackPage"></u-navbar>
		<view class="h130 flex-between pd-lr-20 has-border option" @click="showUpdateImagePopup = true">
			<view class="left">{{$tc('群头像')}}</view>
			<view class="right">
				<avatar :info="group" w="96" h="96" class="mr-30" />
				<imageIcon name="an_jty" class="ml-10" size="20" />
			</view>
		</view>
		<view class="h100 flex-between pd-lr-20 has-border option" @click="clickName">
			<view class="left">{{$tc('群名')}}</view>
			<view class="ellipsis1 right">
				{{ group.name || '-' }}
				<imageIcon name="an_jty" class="ml-10" size="20" />
			</view>
		</view>

		<inputPopup :show.sync="showInputPopup" :value="valueInputPopup" :title="$tc('修改群聊名称')" :maxlength="20"
			@confirm="confirmInputPopup" />

		<updateImagePopup :show.sync="showUpdateImagePopup" @change="changeUpdateImagePopup"
			@close="showUpdateImagePopup=false" />
	</ql-page>
</template>

<script>
	import avatar from '@/components/avatar'
	import imageIcon from '@/components/image-icon'
	import inputPopup from '@/components/input-popup'
	import updateImagePopup from '@/components/update-image-popup'
	export default {
		components: {
			avatar,
			inputPopup,
			imageIcon,
			updateImagePopup
		},
		data() {
			return {
				groupID: '',
				group: {},
				showInputPopup: false,
				valueInputPopup: '',
				showUpdateImagePopup: false,
			};
		},
		onShow() {
			this.getGroup()
		},
		onLoad(opt) {
			this.groupID = this.$setUserID(opt.groupID)
		},
		methods: {
			getGroup() {
				uni.$chatKit?.chat?.getGroupProfile({
					groupID: this.groupID
				}).then(result => {
					this.group = result.data.group
					console.log('group ====', this.group)
				})
			},
			updateGroup(params) {
				const newParams = {
					groupID: this.groupID,
					...params,
				}
				uni.$chatKit?.chat?.updateGroupProfile(newParams).then(result => {
					this.getGroup()
				})
			},
			clickName() {
				this.showInputPopup = true
				this.valueInputPopup = this.group.name
			},
			confirmInputPopup(name) {
				this.showInputPopup = false
				this.updateGroup({
					name
				})
			},
			changeUpdateImagePopup(avatar) {
				console.log('changeUpdateImagePopup...', avatar)
				uni.showToast({
					title: this.$tc('修改成功'),
					icon: 'none'
				})
				this.showUpdateImagePopup = false
				this.updateGroup({
					avatar
				})
			},
		}
	};
</script>
<style scoped lang="scss">
	.option {
		background-color: $colorF;

		.right {
			display: flex;
			align-items: center;
			font-size: 32rpx;
			color: $grayFont;
		}
	}
</style>