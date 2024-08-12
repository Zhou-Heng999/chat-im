<template>
	<view v-show="show" class="con">
		<view class="con"  >
			<view class="list-box">
				<view class="list" v-for="(itemc, indexc) in emojiList[0]" :key="indexc" @click="select(itemc)">
					{{ itemc }}
				</view>
			</view>
		</view>
		<!-- <view class="send" @click="clickSend">{{ $tc('发送') }}</view> -->
	</view>
</template>

<script>
import TUIChatEngine, {
	TUITranslateService,
	TUIConversationService,
	TUIStore,
	StoreName,
	IMessageModel,
	IConversationModel,
	TUIUserService,
	SendMessageParams,
	TUIChatService
} from "@tencentcloud/chat-uikit-engine";
	export default {
		data() {
			return {
				index: 0,
				chunkSize: 58, //ÿҳ���58������
				data: [
					"😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰",
					"😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏",
					"😒", "😞", "😔", "😟", "😕", "🙁", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡",
					"🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓"
				]
			};
		},
		props: {
			show: {//��ʾ����
				type: Boolean,
				default: false
			}
		},
		computed: {
			emojiList() { //��ά���� ÿҳ58��
				let result = [];
				for (let i = 0; i < this.data.length; i += this.chunkSize) {
					let chunk = this.data.slice(i, i + this.chunkSize);
					result.push(chunk);
				}
				return result;
			},
		},
		methods: {
			select(item) {
				this.$emit('change', item);
			},
			change(e) {
				this.index = e.detail.current;
			},
			delMsg() {
				this.$emit('delMsg');
			},
			clickSend() {
				this.$emit('sendMessage');
			}
		}
	}
</script>

<style>
	.con {
		height: 550rpx;
		background: #EDEDED;
		position: relative;
		overflow-x: hidden;
	}

	.list-box {
		display: flex;
		flex-wrap: wrap;
		height: 100%;
	}

	.list {
		height: 75rpx;
		width: 10%;
		text-align: center;
		line-height: 75rpx;
		font-size: 50rpx;
	}

	.send {
		width: 16%;
		height: 60rpx;
		line-height: 60rpx;
		text-align: center;
		position: absolute;
		color: #fff;
		border-radius: 12rpx;
		background-color: #07c160;
		right: 2%;
		top: 468rpx;
	}

	.del {
		width: 120rpx;
		height: 75rpx;
		background: #fff;
		position: absolute;
		right: 10rpx;
		bottom: 40rpx;
		border-radius: 10rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.del-img {
		width: 60rpx;
	}
</style>