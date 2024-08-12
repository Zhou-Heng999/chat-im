<template>
	<!-- 多选 -->
	<u-popup :show="isShow" @close="$emit('closeModal')">
		<view :style=" 'height: var(--status-bar-height);'">

		</view>
		<view class="zf-box">
			<view class="h100 flex" :style="'margin-top:'+heigth+'rpx'">
				<view class="flex-center" style="width: 100vw;">
					<text class="">{{$tc('选择朋友')}}</text>
				</view>
				<u-icon style="" @click="$emit('closeModal')" class="mr-10" name="close" color="#737373"
					size="28"></u-icon>
			</view>

			<view class="max-width pd-lr-20">
				<u-search :placeholder="$tc('搜索')" v-model="searchWord" :actionText="$tc('搜索')" :actionStyle="{fontSize: '22rpx'}" @custom='BackPage'></u-search>
			</view>
			<u-list height="80vh" style="margin-top: 20rpx;">
				<u-list-item>
					<view class="flex-column max-width pd-lr-20" v-for="(item,index) in searchList"
						@click="onChooseItem(index)">
						<view class="pd-tb-20 flex-align">
							<avatarModal class="mr-10" :info="item.profile"></avatarModal>
							<view class="flex-column">
								<text class="font-32 mb-10">{{item.profile.nick}}</text>
								<text class="font-28">{{item.remark}}</text>
							</view>

						</view>
					</view>
				</u-list-item>
			</u-list>
			<!-- <scroll-view style="height: 80vh;" scroll-y>
				<view class="flex-column max-width pd-lr-20" v-for="(item,index) in searchList"
					@click="onChooseItem(index)">
					<view class="pd-tb-20 flex-align">
						<avatarModal class="mr-10" :info="item.profile"></avatarModal>
						<view class="flex-column">
							<text class="font-32 mb-10">{{item.profile.nick}}</text>
							<text class="font-28">{{item.remark}}</text>
						</view>
				
					</view>
				</view>
			</scroll-view> -->

		</view>
	</u-popup>
</template>

<script>
	export default {
		props: {
			isShow: {
				type: Boolean,
				default: false
			},
			heigth: {
				type: String,
				default: '0'
			}
		},
		data() {
			return {
				isCheckMore: false,
				conversationList: [],
				searchWord: ''
			};
		},
		computed: {
			searchList() {
				let {
					conversationList,
					searchWord
				} = this
				let sList = []
				if (searchWord && conversationList.length != 0) {
					sList = conversationList.filter(item => item.profile?.nick?.indexOf(searchWord) != -1 || item.remark
						?.indexOf(searchWord) != -1)
				}
				let list = searchWord ? sList : conversationList
				return list
			}
		},
		mounted() {
			this.openPeoPleList()
		},
		methods: {
			close() {
				this.$emit('closeModal');
			},
			openPeoPleList() {
				uni.$chatKit?.chat?.getFriendList().then(res => {
					let list = res.data
					list.forEach(item => {
						item.profile.remark = item.remark
					})
					this.conversationList = list
				})
			},
			onConfrimSend() {
				let list = this.conversationList.filter(item => item.isCheck)
				this.onClickSendData(list)
			},
			onClickSendData(arr) {
				this.$emit('chooseSend', arr)
			},
			onChooseItem(index) {
				let {
					conversationList
				} = this
				this.$emit('chooseItem', conversationList[index])
				this.close()
			},
		}
	};
</script>
<style scoped lang="scss">
	.edit-chat {
		position: absolute;
		top: 86rpx;
		left: 0;
		height: 160rpx;
		width: 100%;
		opacity: 1;
		background: rgba(245, 245, 245, 1);
		z-index: 8;

	}

	.url-box {
		height: 90rpx;
		width: 90rpx;
		background: #fff;
		border-radius: 50%;
	}

	.zf-box {
		height: 95vh;
		width: 100%;
	}

	.box-tip {
		height: 60rpx;
		opacity: 1;
		background: rgba(245, 245, 245, 1);

	}
</style>