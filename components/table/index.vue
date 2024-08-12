<template>
	<view class="page-box  less-text">
		<view class="flex-align title-bg h64">
			<view :style="{width:item.width}" :class="['flex-align  ',item.width?'':`table-item${index}`,direction=='center'?'flex-center':'' ]" v-for="(item, index) in tableHeader" :key="index">
				<text>{{$t(item.label)  }}</text>
			</view>
		</view>
		<u-list :height='listHeight' v-if="tableList!=0" >
			<u-list-item  v-for="(item, index) in tableList" :key="index" >
				<view class="flex max-width min-bg">
					<view :style="{width:p.width}" :class="['flex-align  table-list-item ',p.width?'':`table-item${pindex}`,direction=='center'?'flex-center':'' ]" v-for="(p, pindex) in tableHeader" :key="pindex">
						<template v-if="p.isNeddtemplate">
							<slot :row="{ ...item, ...p,index }"></slot>
						</template>
						<text v-else>{{ item[p.prop] }}</text>
					</view>
				</view>
				
				
			</u-list-item>
			
		</u-list>
		
		<u-empty
			marginTop="100rpx"
			v-else
			mode="history"
		></u-empty>
	</view>
</template>

<script>
export default {
	props: {
		tableHeader: {
			type: Array,
			default: []
		},
		tableList: {
			type: Array,
			default: []
		},
		direction:{
			type: String,
			default: "left"
		},
		listHeight:{
			type: String,
			default: "500rpx"
		},
	},
	data() {
		return {};
	},
	methods: {}
};
</script>
<style scoped lang="scss">
.table-list-item {
	padding:  14rpx 0;
	box-sizing: border-box;
	// border-bottom: 2rpx solid $colorF1;
}
.table-item {
	height: 80rpx;
}
.table-item0 {
	flex: 1.5;
}
.table-item1 {
	flex: 1.5;
}
.table-item2 {
	flex: 1.2;
}

.table-item3 {
	flex: 1.1;
}

.table-item4 {
	flex: 1.1;
}
</style>
