<template>
	<ql-page class="group-page">
		<u-navbar placeholder border autoBack :title="$tc('群聊')" @clickLeft="BackPage" >
			<view slot="left" class="flex-align">
				<view class="m-20">
					<imageIcon width="18rpx" height="35rpx" name="back"></imageIcon>
				</view>
			</view>
		</u-navbar>
		<view ref="search-modal" class="pd-box">
			<u-search :placeholder="$tc('搜索')" v-model="searchWord" :showAction="false"></u-search>
		</view>
		<view class="flex-center">
			<u-tabs :list="tabsList" class="tabs" :activeStyle="{
				fontWeight: 'bold',
			}" @click="clickTabs">
			</u-tabs>
		</view>
		<scroll-view v-if="tabType==='create' && groupListCreate.length > 0" scroll-y="true" class="group-list">
			<infoOption	
				v-for="group in groupListCreate"
				:key="group.groupID"
				:info="group"
				:type="infoOptionType"
				class="info-option"
				@click="clickGroup(group)"
			/>
		</scroll-view>
		<scroll-view v-else-if="tabType==='join' && groupListJoin.length > 0" scroll-y="true" class="group-list">
			<infoOption	
				v-for="group in groupListJoin"
				:key="group.groupID"
				:info="group"
				:type="infoOptionType"
				class="info-option"
				@click="clickGroup(group)"
			/>
		</scroll-view>
		<view v-else class="no-group">
			<imageIcon width="217rpx" height="181rpx" :src="`/static/images/tb_cjql.png`" />
			<text class="tip">{{ tabType === 'create' ? $tc('暂未创建群聊') : $tc('暂未加入群聊') }}</text>
		</view>
	</ql-page>
</template>

<script>
import infoOption from '@/components/info-option'
export default {
	components: { infoOption },
	data() {
		return {
			searchWord: '',
			infoOptionType: uni.$chatKit.TUIChatEngine.TYPES.CONV_GROUP,
			tabsList: [
				{ name: this.$tc('我创建的群'), type: 'create' },
				{ name: this.$tc('我加入的群'), type: 'join' },
			],
			tabType: 'create',
			groupList: [],
		};
	},
	computed: {
		groupListCreate() {
			const listCreate = this.groupList.filter(group => group.selfInfo.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER)
			return this.searchWord ? listCreate.filter(group => group.name.includes(this.searchWord)) : listCreate
		},
		groupListJoin() {
			const listJoni = this.groupList.filter(group => group.selfInfo.role !== uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER)
			return this.searchWord ? listJoni.filter(group => group.name.includes(this.searchWord)) : listJoni
		},
	},
	onShow() {
		uni.$chatKit?.chat?.getGroupList().then(result => {
			this.groupList = result.data.groupList || []
			console.log('群组 =', this.groupList)
		})
	},
	methods: {
		clickTabs({ type }) {
			this.tabType = type
		},
		clickGroup(group) {
      this.toChat(group.groupID, uni.$chatKit.TUIChatEngine.TYPES.CONV_GROUP)
		},
	}
};
</script>
<style scoped lang="scss">
.group-page {
	height: 100vh;
	.tabs {
		background-color: $colorF;
		::v-deep {
			.u-tabs__wrapper__nav {
			}
		}
	}
	.group-list {
		background: #fff;
		overflow: scroll;
		.info-option {
			height: 142rpx;
		}
	}
	.no-group {
		flex: 1;
		display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
		.tip {
			color: rgba(212, 212, 212, 1);
			font-size: 28rpx;
		}
	}
}
</style>