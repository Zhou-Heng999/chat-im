<template>
	<ql-page class="group-settings-page" ref="qlPage">
		<u-navbar placeholder border autoBack :title="$tc('群聊设置')" @clickLeft="BackPage" ></u-navbar>		
    <scroll-view scroll-y="true" class="list">

      <infoOption
        :info="group"
		:type="infoOptionType"
        :headSize="110"
        class="mb-10 info-option"
        @click="clickInfoOption"
      >
        <imageIcon v-if="isOwner || isAdmin" slot="tr" name="an_jty" size="20" />
      </infoOption>

      <memberList 
        ref="memberListRef"
        class="mb-10"
        :group="group"
		:memberList="memberListData"
        :viewDetail="isOwner || isAdmin || group.canAddFriend"
        :showJia="isOwner || isAdmin || group.memberCanAudit"
        :showJian="isOwner || isAdmin"
      />

      <view class="h100 flex-between pd-lr-20 option" @click="clickTbEwm">
        <view class="left">{{$tc('群二维码')}}</view>
        <view class="right">
			<imageIcon name="tb_ewm" />
          <imageIcon name="an_jty" class="ml-10" size="20" />
        </view>
      </view>
      <view class="h100 flex-between pd-lr-20 option" @click="clickNotification">
        <view class="left">{{$tc('群公告')}}</view>
        <view class="right">
			<view class="ellipsis1 text" style="width: 200rpx;">{{ group.notification }}</view>
          <imageIcon name="an_jty" class="ml-10" size="20" />
        </view>
      </view>
      <view v-if="isOwner || isAdmin" class="h100 flex-between pd-lr-20 option" @click="clickGroupManger">
        <view class="left">{{$tc('群管理')}}</view>
        <view class="right">
			<image style="width: 20rpx; height: 30rpx;" src="/static/images/an_jty.png" mode=""></image>
		</view>
      </view>
      <view class="h100 flex-between pd-lr-20 option" @click="clickSearchRecord">
        <view class="left">{{$tc('查找聊天记录')}}</view>
        <view class="right">
			<imageIcon width="20rpx" height="20rpx" src="/static/images/an_jty.png" ></imageIcon>
		</view>
      </view>
      <view class="h100 flex-between pd-lr-20 option" @click="clickNameCard">
        <view class="left">{{$tc('我在本群的昵称')}}</view>
        <view class="right">
          <view class="ellipsis1 text" style="width: 200rpx;">{{ group.selfInfo.nameCard }}</view>
          <imageIcon name="an_jty" class="ml-10" size="20" />
        </view>
      </view>
      <view v-if="isOwner || isAdmin" class="h100 flex-between pd-lr-20 option">
        <view class="left">{{$tc('全体禁言')}}</view>
        <view class="right">
          <u-switch v-model="group.muteAllMembers" @change="changeMuteAllMembers" />
        </view>
      </view>
      <view class="h100 flex-between pd-lr-20 option">
        <view class="left">{{$tc('免打扰')}}</view>
        <view class="right">
          <u-switch
            v-model="isDisturb"
            @change="changeMsgRemindDiscard"
          />
        </view>
      </view>
      <view class="h100 flex-between pd-lr-20 mb-10 option">
        <view class="left">{{$tc('置顶')}}</view>
        <view class="right">
          <u-switch v-model="conversation.isPinned" @change="changeIsPinned" />
        </view>
      </view>

      <button class="mb-10 text-btn" @click="clickClearRecord">{{$tc('清空聊天记录')}}</button>
      <button class="mb-10 text-btn" @click="clickExitGroup">{{$tc('退出群聊')}}</button>
		</scroll-view>

    <inputPopup
      :show.sync="showInputPopup"
			:value="valueInputPopup"
			:title="titleInputPopup"
			:maxlength="20"
			@confirm="confirmInputPopup"
    />

    <confirmModal
			:show.sync="showConfirmModal"
      :confirmText="confirmText"
			:content="contentConfirmModal"
			@confirm="confirmConfirmModal"
		/>
	</ql-page>
</template>

<script>
import imageIcon from '@/components/image-icon'
import infoOption from '@/components/info-option'
import inputPopup from '@/components/input-popup'
import memberList from './components/memberList'
import confirmModal from '@/components/confirm-modal/index'

import {
  TUIStore,
  StoreName,
} from "@tencentcloud/chat-uikit-engine";

// const MessageRemindTypes = {
//   ['在线正常接收消息，离线时会有厂商的离线推送通知（Web 和小程序端无离线推送）']: uni.$chatKit.TUIChatEngine.TYPES.MSG_REMIND_ACPT_AND_NOTE ,
//   ['在线和离线都拒收消息']: uni.$chatKit.TUIChatEngine.TYPES.MSG_REMIND_ACPT_NOT_NOTE,
//   ['在线正常接收消息，离线不会有推送通知（消息免打扰）']: uni.$chatKit.TUIChatEngine.TYPES.MSG_REMIND_ACPT_NOT_NOTE ,
// }

export default {
  components: { infoOption, imageIcon, inputPopup, confirmModal, memberList },
	data() {
		return {
      groupID: '',
			infoOptionType: uni.$chatKit.TUIChatEngine.TYPES.CONV_GROUP,
      group: {
        selfInfo: {}
      },
      conversation: {},
      operatorAction: '', // 用来记录当前操作的 行为/字段
      value: '',
      showConfirmModal: false,
      showInputPopup: false,
      memberCanAudit: false,
      valueInputPopup: '',
      titleInputPopup: '',
      isDisturb:false,
	  memberListData: []
		};
	},
	onLoad(opt) {
		this.groupID = opt.groupID;
	},
  onShow() {
    this.getGroup()
    this.getConversation()
    // this.getGroupAttributes()
  },
  computed: {
    isOwner() {
      return this.group.selfInfo.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER
    },
    isAdmin() {
      return this.group.selfInfo.role === uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN
    },
    confirmText() {
      let content = '确认'
      switch(this.operatorAction) {
        case 'record':
          content = '确认'
          break
        case 'exit':
          content = this.isOwner ? '去转让' : '确认'
          break
      }
      return content
    },
    contentConfirmModal() {
      let content = ''
      switch(this.operatorAction) {
        case 'record':
          content = '清除当前对话的聊天记录？'
          break
        case 'exit':
          content = this.isOwner ? '你是群主，退出群聊且删除此群的聊天记录前需要先转让群聊？' : '确认要退出群聊，且删除此群的聊天记录？'
          break
      }
      return content
    }
  },
	methods: {
		getGroupAttributes() {
			uni.$chatKit?.chat?.getGroupAttributes({ groupID: this.groupID, keyList: ['key1'] }).then(result => {
        console.log('========================================================', result.data?.groupAttributes?.key1)
				this.memberCanAudit = JSON.parse(result.data?.groupAttributes?.key1 || 'false')
		  })
		},
    getConversation() {
      uni.$chatKit?.chat?.getConversationProfile('GROUP' + this.groupID).then(result => {

        this.conversation = result.data.conversation;


        if(this.conversation.messageRemindType === uni.$chatKit?.TUIChatEngine.TYPES.MSG_REMIND_ACPT_NOT_NOTE){
          this.isDisturb = true;
        }
        else if(this.conversation.messageRemindType === uni.$chatKit?.TUIChatEngine.TYPES.MSG_REMIND_ACPT_AND_NOTE){
          this.isDisturb = false;
        }


        // this.conversation = {
        //   ...result.data.conversation,
        //   msgRemindDiscard: result.data?.conversation?.messageRemindType === MessageRemindTypes['在线和离线都拒收消息']
        // }
        // console.log('this.conversation ====', this.conversation)
		  })
    },
	getMemberList() {
		uni.$chatKit?.chat?.getGroupMemberList({
			groupID: this.groupID,
			offset: 0,
		}).then(result => {
			console.log('mebmers.result =', result.data)
			let list = result.data.memberList;
			uni.$chatKit?.chat?.getFriendList().then(res=>{
				let friendlist=res.data
				list.forEach(item=>{
					let target = friendlist.find(member=>member.userID==item.userID)
					if(target){
						item.remark = target.remark
					}
				})
				this.memberListData = list
			})
		})
	},
    getGroup() {
		this.getMemberList()
		console.log('获取群员')
		const eventChannel = this.getOpenerEventChannel();
      uni.$chatKit?.chat?.getGroupProfile({ groupID: this.groupID }).then(result => {
		  console.log('获取群员1')
				const memberCanAudit = result.data.group.groupCustomField.find(field => field.key === 'memberCanAudit')?.value
				const canAddFriend = result.data.group.groupCustomField.find(field => field.key === 'canAddFriend')?.value
				let t={
          ...result.data.group,
					canAddFriend: canAddFriend ? JSON.parse(canAddFriend) : false,
					memberCanAudit: memberCanAudit ? JSON.parse(memberCanAudit) : false,
        }
		console.log('t',t)
		eventChannel.emit('getNewGroup', t);
		  	this.group = t
		  }).catch(err=>{
			  console.log('err',err)
		  })
    },
    updateGroup(params) {
      const newParams = {
        groupID: this.groupID,
        ...params,
      }
      uni.$chatKit?.chat?.updateGroupProfile(newParams).then(result => {
		  	this.getGroup()
		  })
    },
    clickInfoOption() {
      if (this.isOwner || this.isAdmin) {
		    let groupID=this.$setUserID(this.groupID)
        uni.navigateTo({
			  	url: `/pages/address/views/group/views/group-settings/views/avatarName/index?groupID=${groupID}`
			  })
      }
    },
    clickTbEwm() {
      uni.setStorage({
				key: 'qr_code_info',
				data: {
          type: uni.$chatKit.TUIChatEngine.TYPES.CONV_GROUP,
          info: this.group,
        }
			})
      uni.navigateTo({
				url:`/pages/my/views/code/index`
			})
    },
    clickNotification() {
      uni.navigateTo({
				url: `/pages/address/views/group/views/group-settings/views/notification/index?groupID=${this.groupID}`
			})
    },
    clickGroupManger() {
      uni.navigateTo({
				url: `/pages/address/views/group/views/group-settings/views/manager/index?groupID=${this.groupID}`
			})
    },
    clickSearchRecord() {
		this.toastText('敬请期待')
      // this.$message({ message: '敬请期待' })
      // uni.$chatKit?.chat?.searchCloudMessages({
      //   keywordList: ['123']
      // }).then(result => {
      //   console.log('云端消息搜索 =', result)
      // })
    },
    clickNameCard() {
      this.showInputPopup = true
      this.titleInputPopup = '修改群昵称'
      this.valueInputPopup = this.group.selfInfo.nameCard
      this.operatorAction = 'nameCard'
    },
    confirmInputPopup(value) {
      this.showInputPopup = false
      if (this.operatorAction === 'nameCard') {
        const params = {
          groupID: this.groupID,
          userID: this.group.selfInfo.userID,
          nameCard: value
        }
        uni.$chatKit?.chat?.setGroupMemberNameCard(params).then(result => {
          this.getGroup()
        })
      } else {
        this.updateGroup({
          [this.operatorAction]: value
        })
      }
    },
    changeMuteAllMembers() {
      this.updateGroup({
        muteAllMembers: this.group.muteAllMembers
      })
    },
    changeMsgRemindDiscard() {

      let messageRemindType = uni.$chatKit?.TUIChatEngine.TYPES.MSG_REMIND_ACPT_AND_NOTE;

      if(this.isDisturb){
        messageRemindType = uni.$chatKit?.TUIChatEngine.TYPES.MSG_REMIND_ACPT_NOT_NOTE;
      }

      
      console.log(messageRemindType)

      const params = {
        groupID: this.groupID, 
        messageRemindType: messageRemindType,
      }
      uni.$chatKit?.chat?.setMessageRemindType(params).then(result => {
		  	// this.getConversation()
		  }).catch(err => {
        console.log('setMessageRemindType.err =', err)
        // this.conversation.messageRemindType = this.conversation.messageRemindType === MessageRemindTypes['在线和离线都拒收消息']
      })
    },
    changeIsPinned() {
      const params = {
        conversationID: this.conversation.conversationID, 
        isPinned: this.conversation.isPinned,
      }
      uni.$chatKit?.chat?.pinConversation(params).then(result => {
		  	this.getConversation()
		  }).catch(err => {
        console.log('pinConversation.err =', err)
        this.conversation.isPinned = !this.conversation.isPinned
      })
    },
    clickClearRecord() {
      this.operatorAction = 'record'
      this.showConfirmModal = true
    },
    clickExitGroup() {
      this.operatorAction = 'exit'
      this.showConfirmModal = true
    },
    confirmConfirmModal() {
      switch(this.operatorAction) {
        case 'record':
          this.showConfirmModal = false
		  if(this.isOwner || this.isAdmin) {
			  this.$http.groupmsg.delete_all({ groupId: this.groupID }).then(res => {
				  this.toastText('删除成功')
				  uni.$emit('resetMessage')
				  uni.navigateBack({
					delta: 1,
				  })
			  })
		  }else {
			  uni.$chatKit?.chat?.clearHistoryMessage(this.conversation.conversationID).then(res=>{
				  this.toastText('删除成功')
				  uni.$emit('resetMessage')
				  uni.navigateBack({
					delta: 1,
				  })
			  })
		  }
		  
		  
         
          break
        case 'exit':
          if (this.isOwner) {
            this.showConfirmModal = false
            uni.navigateTo({
			      	url: `/pages/address/views/group/views/group-settings/views/manager/views/changeOwner/index?groupID=${this.groupID}`
			      })
          } else {
            this.showConfirmModal = false
            uni.$chatKit?.chat?.quitGroup(this.groupID).then(result => {
				TUIStore.watch(StoreName.CONV, {
					conversationList: (list) => {
						const i = list.find(item => item.type === 'GROUP' && item.groupProfile.groupID === this.groupID)
						i.deleteConversation()
					}
				})
				uni.switchTab({
					url: '/pages/home/index'
				})
				// uni.navigateBack({
				// 	delta: 2,
				// })
            })
          }
          break
        default:
          this.showConfirmModal = false
      }
    },
    test() {},
	}
};
</script>
<style scoped lang="scss">
.group-settings-page {
  height: 100vh;
  background-color: $colorF5;
  .list {
		flex: 1;
		overflow: scroll;
	  .info-option {
      height: 150rpx;
    }
    .option {
      background-color: $colorF;
      .left {
        margin-right: 30rpx;
		font-size: 32rpx;
      }
      .right {
        // flex: 1;
        display: flex;
        // flex-direction: row-reverse;
        align-items: center;
        color: $grayFont;
        // overflow: hidden;

      }
    }
  }
}
</style>