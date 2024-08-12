<template>
  <view :class="`${padding ? 'pd-lr-30' : ''} option-avatar-title`" @click="$emit('click')">
    <avatar :info="info" :w="headSize + ''" :h="headSize + ''" class="mr-30" :infoType="type" :badgeBottom="0" :badgeRight="0">
      <imageIcon v-if="info.role && info.role !== memberRole" slot="badge" :name="info.role === ownerRole ? 'tb_qz' : 'tb_gly'" :size="30" />
    </avatar>
    <view class="option-avatar-title-right">
      <view class="top-text">
		  <!-- {{info}} -->
        <view  class="left">{{ info.remark ||info.nick||info.name }}</view>
		<!-- <view v-else class="left">{{info.remark ? info.remark : info.nick }}</view> -->
        <view class="right">
         <slot v-if="$slots.tr" name="tr" />
          <template v-else>{{ trText }}</template>
        </view>
      </view>
      <!-- <view class="bottom-text">
        <view class="left">
          <slot v-if="$slots.bl" name="bl" />
          <template v-else>{{ blText }}</template>
        </view>
        <view class="right">
          <slot v-if="$slots.br" name="br" />
          <template v-else>{{ brText }}</template>
        </view>
      </view> -->
    </view>
  </view>
</template>

<script>
import avatar from '@/components/avatar'
import imageIcon from '@/components/image-icon'
import TUIChatEngine,{
	TUITranslateService,
	TUIConversationService,
	TUIStore,
	StoreName,
} from "@tencentcloud/chat-uikit-engine";
export default {
  components: { avatar, imageIcon },
  props: {
    headSize: {
      type: Number,
      required: false,
      default: 96,
    },
    type: {
      required: false,
      default: TUIChatEngine.TYPES.CONV_C2C,
    },
    padding: {
      type: Boolean,
      required: false,
      default: true,
    },
    info: {
      type: Object,
      required: true,
      default() {
        return {}
      }
    },
    trText: {
      type: [String, Number],
      required: false,
      default: ''
    },
    brText: {
      type: String,
      required: false,
      default: ''
    },
    blText: {
      type: String,
      required: false,
      default: ''
    },
	isFriend:{
		type: Boolean,
		required: false,
		default: false
	}
  },
  data() {
    return {
			ownerRole: uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER,
			memberRole: uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_MEMBER,
      // convType: {
      //   ['端到端会话']: uni.$chatKit.TUIChatEngine.TYPES.CONV_C2C,
      //   ['群组会话']: uni.$chatKit.TUIChatEngine.TYPES.CONV_GROUP,
      // },
    }
  },
  computed: {
    title() {
      return {
        [uni.$chatKit.TUIChatEngine.TYPES.CONV_C2C]: 'nick',
        [uni.$chatKit.TUIChatEngine.TYPES.CONV_GROUP]: 'name',
      }[this.type]
    },
  },
  methods: {}
}
</script>

<style scoped lang="scss">
.option-avatar-title {
  display: flex;
  align-items: center;
  overflow: hidden;
  height: 112rpx;
  background: #fff;
  .option-avatar-title-right {
    flex: 1;
    overflow: hidden;
    .top-text {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .left {
        flex: 1;
        font-size: 32rpx;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .right {
        font-size: 28rpx;
        color: rgba(173, 181, 189, 1);
      }
    }
    .bottom-text {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .left {
        font-size: 28rpx;
        color: rgba(173, 181, 189, 1);
      }
      .right {
        font-size: 28rpx;
        color: rgba(173, 181, 189, 1);
      }
    }
  }
}
</style>