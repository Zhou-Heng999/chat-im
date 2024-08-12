<template>
	<div class="transfer" style="width: 100vw; "
		:style="$tc(transferTitle) == $tc('转发') ? 'position:fixed; height: 90vh; right: 0; bottom: 0;' : 'z-index: 99; height: 90vh; position: absolute;  bottom: 0rpx;' "
		:class="[!isPC ? 'transfer-h5' : '', isWeChat ? 'transfer-h5-wechat' : '']">
		<header class="transfer-header transfer-h5-header" v-if="!isPC">
			<div v-if="!props.isHiddenBackIcon" @click="cancel">
				<Icon class="icon" :file="backIcon" :width="'18px'" :height="'18px'" />
			</div>
			<span class="title">{{ $tc(transferTitle) }}</span>
			<span class="space"></span>
		</header>
		<main class="main" style="position: relative;z-index: 888;">
			<div class="left">

				<main class="transfer-left-main">

					<scroll-view style="height: 70vh;" scroll-y="true">
						<ul class="transfer-list">
							<li class="transfer-list-item"  v-if="optional.length > 1 && !isRadio">
								<template  v-if="$tc(transferTitle) == $tc('转发')">
									<view @click="selectedAll" v-if="transferSelectedList.length === optional.length" >
										<Icon :file="selectedIcon"
											:width="'18px'" :height="'18px'"></Icon>
									</view>
									<i @click="selectedAll" v-else class="icon-unselected"></i>
									<span @click="selectedAll" class="select-all">{{
										$tc('全选')
									  }}</span>
								</template>
							</li>
							<li class="transfer-list-item" v-for="(item, index) in transferList" :key="item.userID"
								@click="selected(item)">
								<Icon v-if="transferSelectedList.indexOf(item) > -1" :file="selectedIcon"
									:class="[item.isDisabled && 'disabled']" :width="'18px'" :height="'18px'"></Icon>
								<i v-else :class="[item.isDisabled && 'disabled', 'icon-unselected','']"></i>
								<template v-if="!isTransferCustomItem">
									<avatarModal :info='item' class="ml-10 mr-30"></avatarModal>
									<span class="name">{{ item.nick || item.userID }}</span>
									<span v-if="item.isDisabled">
										（{{ $tc(TUITranslateService.t("component.已在群中")) }}）
									</span>
								</template>
								<template v-else>
									<slot name="left" :data="item" />
								</template>
							</li>
							<li class="transfer-list-item more" @click="getMore"
								v-if="transferTotal > transferList.length">
								{{ $tc(TUITranslateService.t("component.查看更多")) }}
							</li>
						</ul>
					</scroll-view>
				</main>
			</div>
			<div class="right">
				<header class="transfer-header" v-if="isPC">{{ transferTitle }}</header>
				<!-- <scroll-view style="height: 82vh;"  > -->
				<ul class="transfer-list" v-if="resultShow">
					<p class="transfer-text" v-if="transferSelectedList.length > 0 && isPC">
						{{ $tc("已选中")
            }}{{ transferSelectedList.length
            }}{{ $tc("人") }}
					</p>
					<li class="transfer-list-item space-between" v-for="(item, index) in transferSelectedList"
						:key="index">
						<aside class="transfer-list-item-content">
							<template v-if="!isTransferCustomItem">

								<avatarModal w='60' h='60' :info='item' class="mr-10"></avatarModal>
								<span v-if="isPC" class="name">{{ item.nick || item.userID }}</span>
							</template>
							<template v-else>
								<slot name="right" :data="item" />
							</template>
						</aside>
						<span @click="selected(item)" v-if="isPC">
							<Icon :file="cancelIcon" :width="'18px'" :height="'18px'"></Icon>
						</span>
					</li>
				</ul>
				<!-- </scroll-view> -->
				<footer class="transfer-right-footer" style="font-size: 22rpx;">
					<btn :text="$tc('取消')" w='150' h='65' class="mr-30" btnType='error' @click="cancel"
						shape='square'></btn>
					<!-- <button class="btn btn-cancel" @click="cancel">
            {{ TUITranslateService.t("component.取消") }}
          </button> -->
					<!--  <button
            v-if="transferSelectedList.length > 0"
            class="btn"
            @click="submit"
          >
            {{ TUITranslateService.t("component.完成") }}
          </button> -->
					<btn :text="$tc('完成')+'('+transferSelectedList.length+')' " w='150' h='65'
						:btnType='transferSelectedList.length > 0?"primary":"disabled"'
						:disabled='transferSelectedList.length == 0' @click="submit" shape='square'></btn>
					<!-- <button v-else class="btn btn-no" @click="submit">
            {{ TUITranslateService.t("component.完成") }}
          </button> -->
				</footer>
			</div>
		</main>
	</div>
</template>

<script lang="ts" setup>
	import { ref, watchEffect, computed, getCurrentInstance } from "../../../adapter-vue";
	import { TUITranslateService } from "@tencentcloud/chat-uikit-engine";
	import { ITransferListItem } from "../../../interface";
	import Icon from "../Icon.vue";
	import selectedIcon from "../../../assets/icon/selected.svg";
	import backIcon from "../../../assets/icon/back.svg";
	import cancelIcon from "../../../assets/icon/cancel.svg";
	import { isPC, isWeChat, isUniFrameWork } from "../../../utils/env";

	const props = defineProps({
		list: {
			type: Array,
			default: () => [],
		},
		selectedList: {
			type: Array,
			default: () => [],
		},
		isSearch: {
			type: Boolean,
			default: true,
		},
		isRadio: {
			type: Boolean,
			default: false,
		},
		isCustomItem: {
			type: Boolean,
			default: false,
		},
		title: {
			type: String,
			default: "",
		},
		type: {
			type: String,
			default: "",
		},
		resultShow: {
			type: Boolean,
			default: true,
		},
		total: {
			type: Number,
			default: 0,
		},
		isHiddenBackIcon: {
			type: Boolean,
			default: false,
		}
	});

	const type = ref("");
	const transferList = ref<Array<ITransferListItem>>([]);
	const transferTotal = ref<Number>(0);
	const transferSelectedList = ref<Array<ITransferListItem>>([]);
	const isTransferSearch = ref(true);
	const isTransferCustomItem = ref(false);
	const transferTitle = ref("");
	const searchValue = ref("");
	const thisInstance = getCurrentInstance()?.proxy || getCurrentInstance();
	watchEffect(() => {
		if (props.isCustomItem) {
			for (let index = 0; index < props.list.length; index++) {
				if (
					(props.list[index] as any).conversationID.indexOf("@TIM#SYSTEM") > -1
				) {
					props.list.splice(index, 1);
				}
				transferList.value = props.list as Array<ITransferListItem>;
			}
		} else {
			transferList.value = props.list as Array<ITransferListItem>;
		}
		transferTotal.value = props.total ? props.total : props.list.length;
		transferSelectedList.value = (props.selectedList && props.selectedList.length > 0 ? props.selectedList : transferSelectedList.value) as any;
		isTransferSearch.value = props.isSearch;
		isTransferCustomItem.value = props.isCustomItem;
		transferTitle.value = props.title;
		type.value = props.type;
	});

	const emit = defineEmits(["search", "submit", "cancel", 'getMore']);

	// 可选项
	const optional = computed(() =>
		transferList.value.filter((item : any) => !item.isDisabled)
	);

	const handleInput = (e : any) => {
		searchValue.value = e.target.value;
		emit("search", e.target.value);
	};
	const selected = (item : any) => {

		if (item.isDisabled) {
			return;
		}
		let list : Array<ITransferListItem> = transferSelectedList.value;
		const index : number = list.indexOf(item);
		if (index > -1) {
			return transferSelectedList.value.splice(index, 1);
		}
		if (props.isRadio) {
			list = [];
		}
		if (thisInstance.$tc(transferTitle.value) != thisInstance.$tc('转发')) {
			if (transferSelectedList.value.length < 9) {
				list.push(item);
			} else {
				uni.showToast({
					title: thisInstance.$tc('最多同时与9人通话'),
					icon: 'none',
				})
			}
		} else {
			list.push(item);
		}

		transferSelectedList.value = list;
	};

	const selectedAll = () => {
		if (transferSelectedList.value.length === optional.value.length) {
			transferSelectedList.value = [];
		} else {
			transferSelectedList.value = [...optional.value];
		}
	};

	const submit = () => {
		emit("submit", transferSelectedList.value);
		// 针对小程序做的数据清空
		searchValue.value = "";
	};

	const cancel = () => {
		emit("cancel");
		// 针对小程序做的数据清空
		searchValue.value = "";
	};

	const getMore = () => {
		emit("getMore");
	}
</script>

<style lang="scss" scoped src="./style/transfer.scss"></style>