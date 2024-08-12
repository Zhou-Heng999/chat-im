<template>
	<showGroupText pageType="welcome" :groupID="groupID" />
</template>

<script>
import showGroupText from '../../components/show-group-text'
export default {
  components: { showGroupText },
	data() {
		return {
      groupID: '',
		};
	},
	onLoad(opt){
		let {groupID}=opt
		this.groupID=groupID
	},
	methods: {
	}
};
</script>
<style scoped lang="scss">

</style>