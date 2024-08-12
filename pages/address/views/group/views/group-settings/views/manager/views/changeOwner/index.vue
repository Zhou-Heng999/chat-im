<template>
	<ql-page class="change-owner-page">
		<u-navbar placeholder border autoBack :title="$tc('转让群聊')" @clickLeft="BackPage" ></u-navbar>		
    <view class="pd-box">
			<u-search :placeholder="$tc('搜索')" v-model="searchWord" :showAction="false"></u-search>
		</view>
    <scroll-view scroll-y="true" class="list">
      <infoOption	
				v-for="member in showMemberList"
				:key="member.userID"
				:info="member"
        class="info-option"
				@click="clickOption(member)"
			/>
    </scroll-view>
    <confirmModal
			:show.sync="showConfirmModal"
      :title="$tc('转让群聊')"
			:content="`${$tc('确认转让群给')} ${currentMember.nick} ${$tc('吗？')}`"
			@confirm="confirmConfirmModal"
		/>
	</ql-page>
</template>

<script>
import infoOption from '@/components/info-option'
import confirmModal from '@/components/confirm-modal'
export default {
  components: { infoOption, confirmModal },
	data() {
		return {
      groupID: '',	
      showConfirmModal: false,
      searchWord: '',
      memberList: [],
      currentMember: {},
		};
	},
  computed: {
    showMemberList() {
		let {searchWord,memberList} = this
		const searchList = this.filterSearch(searchWord,memberList)
      return this.searchWord ? searchList : this.memberList
    }
  },
  onLoad(opt){
  	let {groupID}=opt
  	this.groupID=groupID
  },
  onShow() {
    this.getGroupMember()
  },
	methods: {
    getGroupMember(offset=0) {
      uni.$chatKit?.chat?.getGroupMemberList({
        groupID: this.groupID,
        offset,
      }).then(result => {
		  let list = result.data.memberList.filter(item=> item.role!='Owner')
		  if(result.data.offset!=0){
		  	this.getGroupMember(result.data.offset)
		  }
        this.memberList =[...this.memberList,...list]
      })
    },
    clickOption(member) {
      this.currentMember = member
      this.showConfirmModal = true
    },
    confirmConfirmModal() {
      const params = {
        groupID: this.groupID,
        newOwnerID: this.currentMember.userID
      }
      uni.$chatKit?.chat?.changeGroupOwner(params).then(result => {
        this.showConfirmModal = false
        uni.navigateBack({
		  	  delta: 2,
	    	})
      })
    }
	}
};
</script>
<style scoped lang="scss">
.change-owner-page {
  height: 100vh;
	.list {
		flex: 1;
		overflow: scroll;
		background-color: #fff;
    .info-option {
      height: 142rpx;
    }
	}
}
</style>