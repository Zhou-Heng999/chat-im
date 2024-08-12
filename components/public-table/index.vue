<template>
	<view class="table-box" :style="{height: `${tableHeight}rpx`}">
		<!-- <uni-table class="table-box" :style="{maxHeight: `${tableHeight}rpx`}" border emptyText="暂无更多数据"> -->
		<uni-table :style="{maxHeight: `${tableHeight}rpx`}" border :emptyText="$tc('暂无数据')" :loading="loading">
			<!-- 表头 -->
			<uni-tr>
				<uni-th v-for="(item,index) in tableConfig" :width="item.width" :align="item.align"
					:key="index">
					{{ item.label }}
				</uni-th>
			</uni-tr>
			<!-- 表体 -->
			<uni-tr v-for="(item, index) in tableData" :key="index">
				<uni-td v-for="(p, pindex) in tableConfig" :key="pindex" align="center">
					<template v-if="p.isNeddtemplate">
						<slot :row="{ ...item, ...p,index }"></slot>
					</template>
					<text v-else>{{ item[p.prop] }}</text>
				</uni-td>
			</uni-tr>
		</uni-table>
	</view>
</template>

<script>
	export default {
		props: {
			tableConfig: {
				type: Array,
				default: []
			},
			tableData: {
				type: Array,
				default: []
			},
			tableHeight:{
				type: Number,
				default: 700
			},
			loading:{
				type: Boolean,
				default: false
			}
		},
		data() {
			return {

			}
		},
	}
</script>

<style lang="scss" scoped>
	::v-deep.uni-table-tr {
		background-color: #16142A;
	}

	::v-deep.uni-table-th {
		background-color: #2E2C45;
	}

	::v-deep.table--border {
		border: 1rpx solid #2E2C45;
	}
	::v-deep .empty-border {
		background: #16142A;
		border: none;
	}
	.table-box {
		// border-radius: 20rpx 20rpx 0rpx 0rpx;
		margin-top: 20rpx;
		// height: 700rpx;
	}

	// .btn1 {
	// 	width: 66rpx;
	// 	height: 27rpx;
	// 	border-radius: 14rpx;
	// 	background: linear-gradient(112deg, #3bacca 0%, #39e9bb 100%);
	// 	color: #ffffff;
	// }
</style>