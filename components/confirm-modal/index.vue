<template>
  <u-modal
    :show="show"
    :title="title"
    :content="$tc(content)"
    :showCancelButton="showCancelButton"
    :confirmText="$tc(confirmText)"
	:cancelText="$tc('取消')"
    :confirmColor="confirmColor"
    class="confirm-modal"
    @confirm="$emit('confirm')"
    @cancel="$emit('update:show', false)"
  />
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: false,
      default: false
    },
    confirmColor: {
      type: String,
      required: false,
      default: 'rgba(255, 69, 69, 1)'
    },
    confirmText: {
      type: String,
      required: false,
      default: '确认',
    },
    title: {
      type: String,
      required: false,
      default: ''
    },
    content: {
      type: String,
      required: true
    },
	showCancelButton: {
		type: Boolean,
		default: true,
	}
  },
	data() {
		return {
		};
	},
	methods: {
	}
};
</script>
<style scoped lang="scss">
.confirm-modal {
  flex: none;
  ::v-deep {
    .u-modal__content__text {
      color: rgba(176, 183, 191, 1);
    }
  }
}
</style>