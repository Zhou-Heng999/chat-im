<template>
  <view class="no-data">
		<imageIcon width="154rpx" height="154rpx" :name="image"/>
		<text class="tip">{{ $tc(text) }}</text>
	</view>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: false,
      default: '暂无联系人'
    },
    image: {
      type: String,
      required: false,
      default: 'tb_zwlxr'
    }
  }
}
</script>

<style scoped lang="scss">
.no-data {
	flex: 1;
	display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  // background-color: $colorF;
	.tip {
    margin-top: 14rpx;
		color: rgba(212, 212, 212, 1);
		font-size: 28rpx;
	}
}
</style>