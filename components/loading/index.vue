<template>
	<u-toast v-if="loading" ref="uToast"></u-toast>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: false,
      default: '正在加载'
    },
    loading: {
      type: Boolean,
      required: false,
      default: false
    }
  },
	data() {
		return {
		};
	},
  watch: {
    loading: {
      immediate: true,
      handler(newV) {
        this.updateToast(newV)
      }
    }
  },
  onLoad() {
    this.updateToast(this.loading)
  },
	methods: {
    updateToast(loading) {
      const config = {
				type: 'loading',
				message: this.$tc(this.message),
        duration: 200000,
				iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/loading.png'
			}
      if (loading) {
        this.$nextTick(() => {
          this.$refs.uToast.show({
			    	...config
			    })
        })
      }
    }
	}
};
</script>
<style scoped lang="scss">
	
</style>