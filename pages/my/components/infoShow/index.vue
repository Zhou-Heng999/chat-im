<template>
  <view class="flex-col-center info-show">
    <view class="flex-center head-gender" @click="$emit('clickHead')">
			<avatar :info="info" w="190" h="190" :badgeBottom="-4" :badgeRight="-4">
        <image slot="badge" class="gender" :src="`/static/images/${genderIcon[info.gender] || 'tb_xbxz'}.png`" />
      </avatar>
    </view>
    <view class="mt-20 name" @click="$emit('clickTitle')">{{ info.nick }}</view>
    <view class="mt-4 id" @click="copyText($setUserID(info.userID))">
		<view>ID: {{$setUserID(info.userID)}}</view>
		<imageIcon src="/static/images/tb_fz2.png" class="ml-10" width="24rpx" height="24rpx"></imageIcon>
	</view>
  </view>
</template>

<script>
import avatar from '@/components/avatar'
export default {
	components: { avatar },
  props: {
    info: {
      type: Object,
      required: false
    }
  },
	data() {
		return {
			defaultHeadPath: '/static/images/tb_jtx.png',
      genderIcon: {
        [uni.$chatKit.TUIChatEngine.TYPES.GENDER_UNKNOWN]: 'tb_xbxz', // 未设置性别
        [uni.$chatKit.TUIChatEngine.TYPES.GENDER_FEMALE]: 'tb_nv2', // 女性
        [uni.$chatKit.TUIChatEngine.TYPES.GENDER_MALE]: 'tb_nan2', // 男性
      }
		};
	},
  computed: {

  },
	methods: {
	}
};
</script>
<style scoped lang="scss">
	.info-show {
    width: 100%;
    height: 344rpx;
    .head-gender {
      position: relative;
      box-sizing: border-box;
      width: 220rpx;
      height: 220rpx;
      border-radius: 110rpx;
      border: 16rpx solid rgba(255, 255, 255, 0.5);
      overflow: visible;
      .gender {
        width: 48rpx;
        height: 48rpx;
      }
    }
    .name {
      height: 60rpx;
      line-height: 60rpx;
      text-align: center;
      font-size: 40rpx;
      color: $colorF;
    }
    .id {
	  display: flex;
	  align-items: center;
      height: 40rpx;
      line-height: 40rpx;
      text-align: center;
      font-size: 24rpx;
      color: $colorF;
    }
    
  }
</style>