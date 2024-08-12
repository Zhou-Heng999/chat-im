<template>
  <u-popup :show="show" round="40rpx" class="input-popup">
    <view class="input-top">
      <view class="flex-center h100 has-border mg-lr-30 top">
        {{ $tc(title) }}
        <imageIcon width="36rpx" height="36rpx" name="close" class="btn-close" @click="clickClose" />
      </view>
      <u--form
		  	:model="form"
		  	:rules="rules"
		  	ref="uForm"
		  >
		  	<u-form-item prop="value">
		  		<u--input
            v-model="form.value"
            border="surround"
            class="control-input"
			:maxlength="maxlength"
          />
		  	</u-form-item>
		  </u--form>
      <!-- <u--input
        v-model="form.value"
        border="surround"
        class="control-input"
      /> -->
      <btn :text="$tc('保存')" class="btn-save" @click="onClick"/>
    </view>
	</u-popup>
</template>

<script>
import btn from '@/components/btn'
import { ListMixin } from '@/mixin/list';
import store from "@/store/index.js"
export default {
  components: { btn },
  props: {
    show: {
      type: Boolean,
      required: false,
      default: false
    },
    title: {
      type: String,
      required: false,
      default: ''
    },
    value: {
      type: String,
      default: '',
    },
    rule: {
      type: Array,
      required: false,
      default() {
        return []
      } 
    },
	maxlength: {
      type: Number,
      default: -1,
    },
  },
  model: {
    prop: 'checked',
    event: 'change',
  },
  data() {
    return {
      form: {
        value: ''
      },
      rules: {
        value: []
      },
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(newV) {
        this.form.value = newV
      },
    },
    rule: {
      immediate: true,
      handler(newV) {
        this.rules.value = newV || []
      }
    }
  },
  methods: {
    onClick() {
		this.form.value=ListMixin.methods.maskSensitiveInfo(this.form.value,store.state.sensitiveData)
      this.$emit('confirm', this.form.value)
    },
    clickClose() {
      this.$emit('update:show', false)
    },
  },
}
</script>

<style scoped lang="scss">
.input-popup {
  flex: none;
}
.input-top {
  .top {
    position: relative;
    .btn-close {
      position: absolute;
      right: 0rpx;
    }
  }
  .control-input {
    margin: 22rpx 30rpx;
    background-color: rgba(245, 248, 247, 1);
    border-radius: 20rpx;
  }
  .btn-save {
    margin: 22rpx auto;
  }
}
</style>