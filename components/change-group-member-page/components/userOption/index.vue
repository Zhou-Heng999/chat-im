<template>
  <view class="pd-lr-30 user-option">
    <imageIcon class="mr-30" width="46rpx" height="46rpx" :name="`an_g${selected?2:1}`" @click="$emit('clickRadio')" />
    <infoOption :padding="false" :info="info" :title="info.nick" class="info-option" @click="$emit('clickRadio')" />
    <imageIcon name="tb_gthxx" @click="clickView(info)" />
  </view>
</template>

<script>
import imageIcon from '@/components/image-icon'
import infoOption from '@/components/info-option'
export default {
  components: { infoOption, imageIcon },
  props: {
    info: {
      type: Object,
      required: false,
      default() {
        return {}
      }
    },
    selected: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {}
  },
  methods: {
    clickView(info) {
      const userID = this.$setUserID(info.userID)
      if (info.conversationType === uni.$chatKit.TUIChatEngine.TYPES.CONV_GROUP) {
        uni.navigateTo({
			  	url:`/pages/address/views/group/views/group-settings/index?groupID=${userID}`
			  })
      } else {
        uni.navigateTo({
			  	url:`/pages/address/views/user/index?userID=${userID}`
			  })
      }
    },
  }
}
</script>

<style scoped lang="scss">
.user-option {
  display: flex;
  align-items: center;
  height: 112rpx;
  background: #fff;
  .info-option {
    flex: 1;
  }
}
</style>