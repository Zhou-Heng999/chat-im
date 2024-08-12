<template>
	<ql-page class="all-member-page">
		<u-navbar placeholder border autoBack :title="`${$tc('聊天成员')}(${memberCount})`" @clickLeft="BackPage" ></u-navbar>		
		<u-search :placeholder="$tc('搜索')" v-model="searchWord" :showAction="false" class="search-input"></u-search>
		<view class="h120 flex-center " v-if="ownerAdminList.length==0&&memberMemberList.length==0&&searchWord!=''" >
			<text>{{$tc('没有找到')}}</text>
			<text class="green-color" >“{{searchWord}}”</text>
			<text>{{$tc('相关成员')}}</text>
		</view>
    <scroll-view scroll-y="true" class="pd-lr-40 scroll-list">
      <view class="role-title" v-if="ownerAdminList.length!=0"  >{{$tc('群主，管理员')}}（{{ownerAdminList.length}}人）</view>
      <view class="member-list">
        <view v-for="member in ownerAdminList" :key="member.userID" class="constraint">
          <view class="member" @click="clickMember(member)">
            <avatar :info="member" w="96" h="96" class="avatar" :badgeBottom="0" :badgeRight="0">
				<imageIcon v-if="member.role === 'Owner'" slot="badge" name="tb_qz" :size="30" />
				<imageIcon v-if="member.role === 'Admin'" slot="badge" name="tb_gly" :size="30" />
			</avatar>
            <view class="ellipsis1 nick">{{ member.remark||member.nick }}</view>
          </view>
        </view>
      </view>
      
      <view class="role-title" v-if="memberMemberList.length!=0" :style="{ marginTop: '30rpx' }">{{$tc('普通成员')}}（{{memberCount-ownerAdminList.length}}{{$tc('人')}}）</view>
      <view class="member-list">
        <view v-for="member in memberMemberList" :key="member.userID" class="constraint">
          <view class="member" @click="clickMember(member)">
            <avatar :info="member" w="96" h="96" class="avatar" />
            <view class="ellipsis1 nick">{{ member.remark||member.nick }}</view>
          </view>
        </view>
      </view>
    </scroll-view>
	</ql-page>
</template>

<script>
import avatar from '@/components/avatar'
export default {
  components: { avatar },
	data() {
		return {
      groupID: '',
      memberList: [],
      searchWord: '',
      viewDetail: '',
	  memberCount:'',
	  offset:0
		};
	},
  computed: {
    showMemberList() {
		let { searchWord } = this;
		let list = this.filterSearch(searchWord,this.memberList)
	  // let list = searchWord ? this.memberList.filter(member => member.nick.includes(searchWord)) : this.memberList
	  uni.$chatKit?.chat?.getFriendList().then(res=>{
	  	let friendlist=res.data
	  	list.forEach(item=>{
	  		let target = friendlist.find(member=>member.userID==item.userID)
	  		if(target){
	  			item.remark = target.remark
	  		}
	  	})
	  })
	  return list
    },
    ownerAdminList() {
      const ownerList = []
      const adminList = []
      this.showMemberList.forEach(member => {
        if (member.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN) {
          adminList.push(member)
        }
        if (member.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER) {
          ownerList.push(member)
        }
      })
      return [...ownerList, ...adminList]
    },
    memberMemberList() {
      return this.showMemberList.filter(member => member.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_MEMBER)
    }
  },
  onLoad(opt) {
  	this.groupID=this.$setUserID(opt.groupID)
	this.viewDetail = JSON.parse(opt.viewDetail)
	this.getMemberList()
	this.getGroup()
  },
  onShow() {
    
  },
	methods: {
		getGroup(){
			uni.$chatKit?.chat?.getGroupProfile({ groupID: this.groupID }).then(result => {
				this.memberCount=result.data.group.memberCount
				console.log('res',result)
			})
		},
		getMemberList(){
			let {offset,memberList}=this
			uni.$chatKit?.chat?.getGroupMemberList({
			  groupID: this.groupID,
			  offset,
			  count: 100
			}).then(result => {
				let resOffset=result.data.offset
				let resMemberList=result.data.memberList
				if(resOffset!=0){
					this.offset=resOffset
					this.getMemberList()
				}
			  this.memberList = [...this.memberList,...resMemberList]
			})
		},
    clickMember(member) {
      if (this.viewDetail) {
        const userID = this.$setUserID(member.userID)
        uni.navigateTo({
			  	url:`/pages/address/views/user/index?userID=${userID}`
			  })
      }
    },
	}
};
</script>
<style scoped lang="scss">
.all-member-page {
  height: 100vh;
  background: $colorF;
  .search-input {
    padding: 20rpx;
    background: $colorF;
    flex: none;
  }
  .role-title {
    height: 34rpx;
    line-height: 34rpx;
    font-size: 34rpx;
    color: $grayFont;
  }
  .scroll-list {
    overflow: scroll;
    // ::v-deep {
    //   .uni-scroll-view-content {
    //     display: flex;
    //     flex-wrap: wrap;
    //   }
    // }
    .member-list {
      
      display: flex;
      flex-wrap: wrap;
      .constraint {
        margin-right: calc(25% - 121rpx);
        width: 96rpx;

        &:nth-child(5n + 0) {
          margin-right: 0rpx;
        }
        .member {
          margin-top: 20rpx;
          .avatar {
            margin: 0rpx auto 6rpx auto;
          }
          .nick {
            height: 48rpx;
            line-height: 48rpx;
            font-size: 28rpx;
            text-align: center;
          }
        }
        .icon-btn {
          height: 96rpx;
          margin-top: 20rpx;
          margin-bottom: 48rpx;
        }
      }
    }
  }
}
</style>