<template>
  <view class="mg-lr-30 pd-tb-40 has-border apply">
    <view class="left" @click="$emit('clickInfo')">
      <avatar :info="info" w="96" h="96" class="head-border" />
    </view>
    <view class="center" @click="$emit('clickInfo')">
      <view class="c1 u-line-1">{{ info.nick }}</view>
      <view class="c2 u-line-1">{{$tc('申请加入：')}}{{ application.groupName }}</view>
      <view class="c3 u-line-1">{{$tc('来自：')}}{{ c3Text }}</view>
      <view class="c4 u-line-1">{{$tc('请求信息：')}}{{ application.note }}</view>
    </view>
    <view class="right">
      <btn w='150' h='60' shape='square' :text="$tc('同意')" class="mb-20" @click="$emit('clickAgree')" />
      <btn w='150' h='60' btnType="error" shape='square' :text="$tc('拒绝')" @click="$emit('clickReject')" />
    </view>
  </view>
</template>

<script>
import avatar from '@/components/avatar'
export default {
  components: { avatar },
  props: {
    application: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      info: {},
    }
  },
  computed: {
    c3Text() {
      let text = ''
      switch (this.application.applicationType) {
        case 0:
          text = this.$tc('加群申请')
          break;
        case 2:
          text = `${this.$tc('成员')}[${this.application.applicantNick}]${this.$tc('的邀请')}`
          break;
      }
      return text
    },
  },
  watch: {
    application: {
      immediate: true,
      handler(newV, oldV) {
        const idCode = newV.applicationType === 0 ? 'applicant' : 'userID'

        if (newV[idCode] && newV[idCode] !== oldV?.[idCode]) {
          uni.$chatKit?.chat?.getUserProfile({
            userIDList: [newV[idCode]]
          }).then(result => {
            if (result.data?.length > 0) {
              this.info = result.data[0]
            }
          })
        }
      }
    }
  },
  methods: {

  },
}
</script>

<style scoped lang="scss">
.apply {
  display: flex;
  min-height: 244rpx;
  .left {
    width: 96rpx;
  }
  .center {
    margin: 0rpx 24rpx;
    flex: 1;
    .c1 {
      height: 50rpx;
      font-weight: 500;
	  width: 380rpx;
    }
    .c2 {
      font-size: 28rpx;
	  width: 380rpx;
    }
    .c3, .c4 {
      color: $grayFont;
      font-size: 28rpx;
	  width: 380rpx;
    }
  }
  .right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 150rpx;
  }
}
</style>