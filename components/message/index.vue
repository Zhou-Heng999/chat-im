<template>
  <u-toast ref="uToast"></u-toast>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    default(options) {
      this.$refs.uToast.show({
				...options
			})
    }
  }
}
</script>

<style scoped lang="scss">
	
</style>