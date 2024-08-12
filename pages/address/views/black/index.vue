<template>
	<ql-page ref="qlPage" class="pd-box" >
		<u-navbar placeholder border autoBack :title="$tc('黑名单')" @clickLeft="BackPage" >
			
		</u-navbar>
		<view v-if="blackList.length > 0">
			<view class="flex-between max-width pd-tb-20 pd-lr-20" v-for="item in blackList" >
				<view class="flex-align">
					<avatarModal :info='item' class="mr-10" ></avatarModal>
					<view class="flex-column flex-around-x" >
						<text>{{item.nick}}</text>

					</view>
				</view>

				<btn shape='square' :text="$tc('移除')" w='130' h='70' @click="onBlackRemove(item)" ></btn>
			</view>
		</view>
		<noData v-else />
	</ql-page>
</template>

<script>
import noData from '@/components/noData'
	import rightSelect from '@/components/right-select/index'
	import {
	  TUIStore,
	  StoreName,
	  IConversationModel,
	  TUITranslateService,
	} from "@tencentcloud/chat-uikit-engine";
export default {
	components: {
		rightSelect,
		noData
	},
	data() {
		return {
			blackList:[],
		};
	},
	onShow() {
		this.getBlackList()
	},
	methods: {
		onBlackRemove(e){
			let {userID}=e
			uni.$chatKit.chat.removeFromBlacklist({
				userIDList: [userID]
			}).then(res=>{
				this.toastText(this.$tc('已移除'))
			})
		},
		getBlackList(){
			console.log('11',uni.$chatKit)
			TUIStore.watch(StoreName.USER, {
			  userBlacklist: (userBlacklist) => {
				  console.log('userBlacklist',userBlacklist)
				  this.blackList=userBlacklist
			  },
			});
		},
	}
};
</script>
<style scoped lang="scss">
	
</style>