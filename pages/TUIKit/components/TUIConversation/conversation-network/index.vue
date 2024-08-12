<template>
	<div class="network flex-align " v-if="isNotNetwork">
		<!-- <i class=" icon-error">!</i> -->
		<p class=" h60 font-28 flex-align ">
			{{$tc("正在连接")}}....
			<!-- {{
        TUITranslateService.t("TUIConversation.网络异常，请您检查网络设置")
      }} -->
		</p>
	</div>
</template>
<script lang="ts" setup>
	import TUIChatEngine, {
		TUIStore,
		StoreName,
		TUITranslateService,
	} from "@tencentcloud/chat-uikit-engine";
	import {
		ref,
		getCurrentInstance
	} from "../../../adapter-vue";
const thisInstance = getCurrentInstance()?.proxy || getCurrentInstance();
	const isNotNetwork = ref(false);

	TUIStore.watch(StoreName.USER, {
		netStateChange: (value : string) => {
			const disconnected = value === TUIChatEngine.TYPES.NET_STATE_DISCONNECTED;
			const connecting = value === TUIChatEngine.TYPES.NET_STATE_CONNECTING;
			isNotNetwork.value = disconnected || connecting;
			thisInstance.$store.commit('setNetwork',isNotNetwork.value)
		},
	});
</script>

<style lang="scss" scoped src="../style/index.scss"></style>