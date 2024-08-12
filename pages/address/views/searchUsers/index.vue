<template>
	<ql-page class="search-users-page ">
		<view class="top-view" ></view>
		<view class="pd-lr-20 white-bg pd-tb-20">
			<u-search :placeholder="$tc('搜索')" focus v-model="searchWord" :actionText="$tc('取消')" @custom='BackPage' ></u-search>
		</view>
		<u-empty
		v-if="filterFriendList.length==0&&filterGroupList.length==0"
		        icon='/static/images/tb_sslxr.png'
				:text="$tc('没有找到相关联系人或信息')"
				width='80'
				height='80'
				marginTop='180'
		>
		</u-empty>
		<scroll-view scroll-y="true" class="list">
      <view class="h60 pd-lr-30 flex-align padding" v-if="filterFriendList.length!=0">{{$tc('联系人')}}</view>
			<infoOption	
				v-for="friend in filterFriendList"
				:key="friend.userID"
				:info="friend.profile"
        class="info-option"
				:isFriend="true"
				@click="clickOption(friend, 'userID', friendType)"
			/>
      <view class="h60 pd-lr-30 flex-align padding" v-if="filterGroupList.length!=0" >{{$tc('群聊')}}</view>
      
			<infoOption	
				v-for="group in filterGroupList"
				:key="group.groupID"
				:info="group"
				:type="groupType"
				class="info-option"
				@click="clickOption(group, 'groupID', groupType)"
			/>
		</scroll-view>
	</ql-page>
</template>

<script>
import infoOption from '@/components/info-option'
import {
  TUIStore,
  StoreName,
  IConversationModel,
  TUITranslateService,
} from "@tencentcloud/chat-uikit-engine"
export default {
	components: { infoOption },
	data() {
		return {
		    searchWord: '',
		    friendType: uni.$chatKit.TUIChatEngine.TYPES.CONV_C2C,
		    groupType: uni.$chatKit.TUIChatEngine.TYPES.CONV_GROUP,
		    friendList: [],
		    groupList: [],
			blackList: []
		};
	},
  computed: {
    filterFriendList() {
		let {friendList,searchWord,groupList}=this
		let a = []
		if(searchWord){
			let list = friendList
			// console.log('listlist', list);
			// const result = list.filter(item => {
			// 	if(!item.profile.remark){
			// 		item.profile.remark = item.remark
			// 	}
			//   return item.profile.nick.includes(searchWord) || (item.remark && item.remark.includes(searchWord));
			// });
			// console.log('result', result);
			const result = this.filterSearch(searchWord,list)
			  a = result;
		}else{
			a = this.friendList.filter(item => item.searchWord.includes(this.searchWord))
		}
		return a
    },
    filterGroupList() {
		return this.filterSearch(this.searchWord,this.groupList)
      // return this.groupList.filter(item => item.searchWord.includes(this.searchWord))
    },
  },
  onShow() {
    this.getList()
  },
	methods: {
    getList() {
      // this.getFriendList()
	  this.getBlackList()
      this.getGroupList()
    },
    getFriendList(){
		uni.$chatKit?.chat?.getFriendList().then(result => {
			const list = [...result.data, ...this.blackList]
			this.friendList = (list || []).map(item => ({
			  ...item,
			  searchWord: item.profile.nick
			}))
			console.log('好友列表 =', this.friendList)
		})
	},
	// 获取黑名单
	getBlackList(){
		TUIStore.watch(StoreName.USER, {
		  userBlacklist: (userBlacklist) => {
			  console.log('userBlacklist', userBlacklist)
			  const list = []
			  if(userBlacklist && userBlacklist.length > 0) {
				  for(const item of userBlacklist) {
					  list.push({
						  ...item,
						  profile: {
							  ...item
						  }
					  })
				  }
			  }
			  this.blackList = list
			  this.getFriendList()
		  },
		});
	},
    getGroupList(){
		uni.$chatKit?.chat?.getGroupList().then(result => {
		this.groupList = (result.data.groupList || []).map(item => ({
	  ...item,
	  searchWord: item.name
	}))
		console.log('群组 =', this.groupList)
	  })
	},
    clickOption(item, code, type) {
      this.toChat(item[code], type)
    },
    clickCancel() {
      uni.navigateBack({
		    delta: 1,
	    })
    }
	}
};
</script>
<style scoped lang="scss">
	.top-view{
		height: var(--status-bar-height);
	}
.search-users-page {
  height: 100vh;
	background-color: $colorF5;
  .navbar {
    // display: flex;
    .search-input {
      margin-right: calc(120rpx + 40rpx) !important;
    }
    // .test {
    //   height: 30rpx;
    //   background: red;
    // }
    .btn {
      width: 120rpx;
      background-color: #ffffff;
      font-size: 30rpx;
      &:after {
        border: 0px;
      }
    }
  }
  .list {
    flex: 1;
  	overflow: scroll;
    .info-option {
      height: 140rpx;
    }
    .padding {
      font-size: 28rpx;
      color: $grayFont;
    }
  }
}
</style>