<template>
  <div
    v-if="!isAllActionItemInvalid && !messageItem.hasRiskContent"
    class="dialog-item"
    :class="!isPC ? 'dialog-item-h5' : 'dialog-item-web'"
  >
    <div
      class="dialog-item-list"
      :class="!isPC ? 'dialog-item-list-h5' : 'dialog-item-list-web'"
    >
	
	<!-- 全部已读列表人数 -->
	<u-transition :show="isShowRead" mode="slide-left">
		<view class="all-read-box"  >
			<scroll-view style="height: 100%;" scroll-y >
				<view class="flex-align pd-lr-10 pd-tb-10" v-for="(item,pindex) in readPeopleList">
					<avatarModal class="mr-10" :info='item' w='40' h='40'  ></avatarModal>
					<view class="flex-column max-height flex1">
						<text class="font-24" >{{item.nick}}</text>
					</view>
				</view>
				
			</scroll-view>
			
		</view>
		
	</u-transition>
	
      <template v-for="(item, index) in actionItems">
        <div
          v-if="item.renderCondition()"
          class="list-item pd-lr-20"
          @click="getFunction(index)"
        >
		<view class="flex-align">
			<imageIcon  class="mr-10" width='40rpx'  height='40rpx'  :src="`/static/images/${item.iconUrl}.png`"></imageIcon>
			<span class="list-item-text">{{ item.text }}</span>
		</view>
		<view class="flex-align">
			<!-- 头像 -->
			<view class="avatar-box" :style="{zIndex:readPeopleList.length-pindex}" v-if="item.type=='read'&&pindex<3" v-for="(p,pindex) in readPeopleList" >
				<avatarModal :info='p' w='40' h='40'  ></avatarModal>
				
			</view>
		</view>
          <!-- <Icon :file="item.iconUrl" width="15px" height="15px"></Icon> -->
		  
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import TUIChatEngine, {
  TUIStore,
  StoreName,
  TUITranslateService,
  IMessageModel,
} from "@tencentcloud/chat-uikit-engine";
import { ref, watchEffect, computed,getCurrentInstance } from "../../../../adapter-vue";
import { isPC, isUniFrameWork } from "../../../../utils/env";
import { TUIGlobal } from "../../../../utils/universal-api/index";
import messageTranslateManage, { translateText } from "../../../../utils/messageTranslateManage";
import Icon from "../../../common/Icon.vue";
import { Toast, TOAST_TYPE } from "../../../common/Toast/index";
import delIcon from "../../../../assets/icon/msg-del.svg";
import copyIcon from "../../../../assets/icon/msg-copy.svg";
import quoteIcon from "../../../../assets/icon/msg-quote.svg";
import revokeIcon from "../../../../assets/icon/msg-revoke.svg";
import forwardIcon from "../../../../assets/icon/msg-forward.svg";
import getContent from "../../utils/getContent";
import { enableSampleTaskStatus } from "../../../../utils/enableSampleTaskStatus";
import {tc} from '@/utils/util'
import store from '@/store/index.js'
const emits=defineEmits(["onChangeMsg","clearID","deleMsg","onChangeMsgPinned"])
const thisInstance = getCurrentInstance()?.proxy || getCurrentInstance();
const props = defineProps({
  messageItem: {
    type: Object,
    default: () => ({}),
  },
  isShowTool: {
    type: Boolean,
    default: false,
  },
  isPower: {
    type: Boolean,
    default: true,
  },
});
const hasTranslates = computed(() => {
  return store.getters.myMessageTranslates?.[props.messageItem.ID]
})

// 获取已读的人的头像
const currentConversation=ref(null)
TUIStore.watch(StoreName.CONV, {
  currentConversation: (conversation: IConversationModel) => {
    currentConversation.value = conversation;
  },
});
const readPeopleList=ref([])
const getReadPeople=()=>{
	TUIChatEngine.chat.getGroupMessageReadMemberList({
		message:props.messageItem,
		filter:0,
		cursor:'',
		count:100
	}).then(imResponse=>{
		const { isCompleted, cursor, messageID, readUserIDList } = imResponse.data;
		TUIChatEngine.chat.getGroupMemberProfile({
			groupID:currentConversation?.value?.groupProfile?.groupID,
			userIDList:readUserIDList
		}).then(res=>{
			console.log('res.data.memberList',res.data.memberList)
			readPeopleList.value=res.data.memberList
		})
	})
}
const TYPES = TUIChatEngine.TYPES;
const actionItems = [
	{
	  text:`${props.messageItem.readReceiptInfo?.readCount?props.messageItem.readReceiptInfo?.readCount+tc('人已读'):tc('未读')}`,
	  iconUrl: 'g_1_edit',
	  type:'read',
	  renderCondition() {
	    if (!message.value||message.value.conversationType!='GROUP'||message.value.readReceiptInfo.readCount==undefined||message.value.readReceiptInfo.readCount==0) return false;
		if(readPeopleList.value.length==0){
			getReadPeople()
		}
	    return message.value?.status === "success";
	  },
	  clickEvent: checkRead,
	},
  {
    // text: TUITranslateService.t("TUIChat.打开"),
	text:tc('打开'),
    iconUrl: copyIcon,
    renderCondition() {
      if (!message.value) return false;
      return isPC && (message.value?.type === TYPES.MSG_FILE ||
        message.value?.type === TYPES.MSG_VIDEO ||
        message.value?.type === TYPES.MSG_IMAGE);
    },
    clickEvent: openMessage,
  },
  {
    // text: TUITranslateService.t("TUIChat.复制"),
	text:tc('复制'),
    iconUrl: 'tb_fz',
	
    renderCondition() {
      if (!message.value) return false;
      return isUniFrameWork && message.value?.type === TYPES.MSG_TEXT;
      // return isUniFrameWork && [TYPES.MSG_TEXT, TYPES.MSG_IMAGE].includes(message.value?.type)
    },
    clickEvent: copyMessage,
  },
  // ty 撤回改名为删除，原删除按钮去掉
  // {
  //   text: TUITranslateService.t("TUIChat.撤回"),
  //   iconUrl: 'tb_ch',
  //   renderCondition() {
  //     if (!message.value) return false;
  //     return message.value?.flow === "out" && message.value?.status === "success";
  //   },
  //   clickEvent: revokeMessage,
  // },
  {
    // text: TUITranslateService.t("TUIChat.删除"),
	text:tc('删除'),
    iconUrl: 'tb_sc',
	renderCondition(){
		if (!message.value) return false;
		let currentConversation = TUIStore.getData(StoreName.CONV, "currentConversation");
		if(currentConversation.type === TUIChatEngine.TYPES.CONV_GROUP){
			if(
			  message.value?.status === "success" && 
			    currentConversation.groupProfile.selfInfo.role == TUIChatEngine.TYPES.GRP_MBR_ROLE_MEMBER
			)
			{
			  return true;
			}else{
				return false
			}
		}
		
		return false;
	},
	clickEvent: deleteMessage,
	},
  {
    // text: TUITranslateService.t("TUIChat.删除"),
	text:tc('删除'),
    iconUrl: 'tb_sc',
    // renderCondition() {
    //   if (!message.value) return false;
    //   return message.value?.status === "success";
    // },
    // clickEvent: deleteMessage,
	renderCondition() {
	  if (!message.value) return false;

    let currentConversation = TUIStore.getData(StoreName.CONV, "currentConversation");

    if(currentConversation.type === TUIChatEngine.TYPES.CONV_GROUP){
		
      if(
        message.value?.status === "success" && 
        (
          currentConversation.groupProfile.selfInfo.role === TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER || 
          currentConversation.groupProfile.selfInfo.role === TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN
        )
      )
      {
        return true;
      }

      else if(
        message.value?.status === "success" && message.value?.flow === "out"&&(
          currentConversation.groupProfile.selfInfo.role === TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER || 
          currentConversation.groupProfile.selfInfo.role === TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN
        )
      )
      {
        return true;
      }

      else{
        return false;
      }

    }


	  // return message.value?.flow === "out" && message.value?.status === "success";
	  return message.value?.status === "success";
	},
	clickEvent: revokeMessage,
  },
  {
    text: tc("翻译"),
    iconUrl: 'tb_fy',
    renderCondition() {
      if (!message.value) return false;
      const falg2 = [TYPES.MSG_IMAGE, TYPES.MSG_VIDEO, TYPES.MSG_FILE].includes(message.value?.type) && getContent(message.value) && getContent(message.value).txt
      console.log('falg2 ===', getContent(message.value))
      return (message.value?.type === TYPES.MSG_TEXT || falg2) && !hasTranslates.value;
    },
    clickEvent: translateMessage,
  },
  {
    text: tc("原文"),
    iconUrl: 'tb_fy',
    renderCondition() {
      if (!message.value) return false;
      const falg2 = [TYPES.MSG_IMAGE, TYPES.MSG_VIDEO, TYPES.MSG_FILE].includes(message.value?.type) && getContent(message.value) && getContent(message.value).txt
      return (message.value?.type === TYPES.MSG_TEXT || falg2) && hasTranslates.value;
    },
    clickEvent: translateMessage,
  },
  {
    // text: TUITranslateService.t("TUIChat.转发"),
	text:tc('转发'),
    iconUrl: 'tb_zf',
    renderCondition() {
      if (!message.value) return false;
      return message.value?.status === "success";
    },
    clickEvent: forwardSingleMessage,
  },
  {
    text: tc("回复"),
    iconUrl: 'tb_hf',
    renderCondition() {
      if (!message.value) return false;
      const _message = TUIStore.getMessageModel(message.value.ID);
      return message.value?.status === "success" && !_message.getSignalingInfo();
    },
    clickEvent: quoteMessage,
  },
  {
    text: tc('多选'),
    iconUrl: 'tb_dx',
    renderCondition() {
      if (!message.value) return false;
      return message.value?.status === "success";
    },
    clickEvent: checkMore,
  },
  {
    text: tc('编辑'),
    iconUrl: 'tb_bj2',
    renderCondition() {
		const falg2 = [TYPES.MSG_IMAGE, TYPES.MSG_VIDEO, TYPES.MSG_FILE].includes(message.value?.type) && getContent(message.value) && getContent(message.value).txt
		return (message.value?.type === TYPES.MSG_TEXT || falg2) && message.value?.flow == "out" && !getContent(message.value).from
    },
    clickEvent: editMsg,
  },
  {
    text: tc('置顶'),
    iconUrl: 'tb_zd',
	type:'top',
    renderCondition() {
      if (!message.value) return false;
	    if(!props.isPower) return false;

      
      if(currentConversation.value.type === TUIChatEngine.TYPES.CONV_GROUP){

        if(

          message.value?.status === "success" && 
          (
            currentConversation.value.groupProfile.selfInfo.role === TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER || 
            currentConversation.value.groupProfile.selfInfo.role === TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN
          )
          
        )
        {
          return true;
        }

      }
      else{
        return true;
      }
      

      // return message.value?.status === "success";
    },
    clickEvent: checkPinned,
  },
  
];

const message = ref<IMessageModel>();

watchEffect(() => {
  message.value = TUIStore.getMessageModel(props.messageItem.ID);
  
});

const isAllActionItemInvalid = computed(() => {
  for (let i = 0; i < actionItems.length; ++i) {
    if (actionItems[i].renderCondition()) {
      return false;
    }
  }
  return true;
});

function getFunction(index) {
	
  // 兼容 vue2 小程序的写法 不允许动态绑定
  actionItems[index].clickEvent();
  if(actionItems[index].type=='read'){
  	event.stopPropagation()
  }else{
	  setTimeout(()=>{
		  emits('clearID')
	  },300)
  }
}

// 查看已读
const isShowRead=ref(false)
function checkRead(){
	// isShowRead.value=!isShowRead.value
	emits('clearID')
	uni.navigateTo({
		url: `/pages/TUIKit/components/TUIChat/message-list/message-tool/views/reader-list/index`,
		success: function(res) {
			// 通过eventChannel向被打开页面传送数据
			res.eventChannel.emit('acceptDataFromOpenerPage', { message: message.value, currentConversation: currentConversation.value })
		}
	})
}

function openMessage() {
  let url = "";
  switch (message.value?.type) {
    case TUIChatEngine.TYPES.MSG_FILE:
      url = message.value.payload.fileUrl;
      break;
    case TUIChatEngine.TYPES.MSG_VIDEO:
      url = message.value.payload.remoteVideoUrl;
      break;
    case TUIChatEngine.TYPES.MSG_IMAGE:
      url = message.value.payload.imageInfoArray[0].url;
      break;
  }
  window?.open(url, "_blank");
}

function revokeMessage() {
  if (!message.value) return;
	console.log('1111111111111deleteMessage')
  if(message.value.conversationType === TUIChatEngine.TYPES.CONV_C2C){
    //私聊消息走自定义消息
    let to;

    if(message.value.flow == "out"){
      to = message.value.to;
    }
    else if(message.value.flow == "in"){
      to = message.value.from;
    }

    let data = {
      code:"delete_message",
      value:{
        idList:[message.value.ID]
      },
    }

    let payload = {
      data: JSON.stringify(data), 
      description: 'GM_ORDER', 
      extension: 'GM_ORDER'
    }


    let sendMessage =TUIChatEngine.chat.createCustomMessage({
      to:to,
      conversationType:TUIChatEngine.TYPES.CONV_C2C,
      payload:payload,
    })

    TUIChatEngine.chat.sendMessage(sendMessage)
    .then( (res:any) => {
		console.log('deleteMessage77777777777')
      // let messageModel = TUIStore.getMessageModel(message.value.ID);
	  deleteMessage()
      // messageModel.deleteMessage();
    } )
    .catch( (error:any) => {
        Toast({
          message: error?.message,
          type: TOAST_TYPE.ERROR,
        });
    } )
    

  }
  else if(message.value.conversationType === TUIChatEngine.TYPES.CONV_GROUP){
    // 获取 messageModel
    const messageModel = TUIStore.getMessageModel(message.value.ID);
    messageModel
      .revokeMessage()
      .then(() => {
        enableSampleTaskStatus('revokeMessage');
      })
      .catch((error: any) => {
      // 调用异常时业务侧可以通过 promise.catch 捕获异常进行错误处理
      if ((error.code = 20016)) {
		const message = tc("只能删除最近7天内的消息");
        Toast({
          message,
          type: TOAST_TYPE.ERROR,
        });
      }
    });
  }

  
}

function deleteMessage() {
  if (!message.value) return;
  console.log('message.value.ID',message.value.ID)
  const messageModel = TUIStore.getMessageModel(message.value.ID);
  messageModel.deleteMessage();
  console.log('messageModel',messageModel)
  emits('deleMsg',message.value.ID)
}

function translateMessage() {
  if (message?.value) {
    const userID = store.state.userInfo.userID
    const messageID = message.value.ID

    if (hasTranslates.value) {
      messageTranslateManage.removeItem({ userID, messageID })
    } else {
      let translateObj;

      let tmp = message.value.getMessageContent();

      let showName = tmp.showName;

      if(message.value.type === TUIChatEngine.TYPES.MSG_TEXT){
        translateObj = message.value.getMessageContent();
      } else if(
        message.value.type === TUIChatEngine.TYPES.MSG_IMAGE || 
        message.value.type === TUIChatEngine.TYPES.MSG_FILE || 
        message.value.type === TUIChatEngine.TYPES.MSG_VIDEO
      ) {
        let cloudCustomData = message.value.cloudCustomData;

        if(cloudCustomData){
          let j_data = JSON.parse(cloudCustomData);

          if(j_data.txt){
            translateObj = {
              text: [
                {name: 'text', text: j_data.txt}
              ], 
              showName: showName
            }
          }

        }

      }
      if (translateObj) {
		  	store.commit('setLoadingTranslates', { ...store.state.loadingTranslates, [messageID]: true })
		  	emits('clearID')
		  	translateText(translateObj).then(result => {
		  		if (result) {
		  			messageTranslateManage.setItem({
		  				userID,
		  				messageID,
		  				text: result
		  			})
		  		} else {
		  			const message = tc("翻译失败");
		  			Toast({
		  				message,
		  				type: TOAST_TYPE.ERROR,
		  			});
		  		}
		  	}).finally(() => {
		  		store.commit('setLoadingTranslates', { ...store.state.loadingTranslates, [messageID]: false })
		  	})
		  } else {
		  	const message = tc("翻译失败");
		  	Toast({
		  		message,
		  		type: TOAST_TYPE.ERROR,
		  	});
		  }
    }

  }
}

function copyMessage() {
  if (isUniFrameWork) {
	console.log('message...', message.value)
	let value = message.value?.payload?.text
	
	if(message.value.type === TYPES.MSG_IMAGE) {
		value = message.value?.payload?.imageInfoArray[0]?.url
	}else {
		value = message.value?.payload?.text
	}
    TUIGlobal?.setClipboardData({
      data: value,
    });
  }
}

function forwardSingleMessage() {
  if (!message.value) return;
  TUIStore.update(StoreName.CUSTOM, "singleForwardMessageID", message.value.ID);
}
function checkMore(num){
	emits('onChangeMsg')
}
//编辑消息
function editMsg() {
	store.commit('setEditMsgContent',message.value)
	uni.$emit('editMsg', message.value)
}
function checkPinned(){
	emits('onChangeMsgPinned', message.value)
}
function quoteMessage() {
  if (!message.value) return;
  message.value.quoteMessage();
}

</script>

<style lang="scss" scoped>
@import "../../../../assets/styles/common.scss";
.avatar-box{
	margin-right: -15rpx;
	position: relative;
}
.all-read-box{
	position: absolute;
	width: 60%;
	height: 60%;
	left: 100%;
	top: 0;
	background: rgba(23, 33, 43, 1);
	border-radius: 8px;
	color:#fff;
	display: flex;
}
.dialog-item-web {
  background: rgba(23, 33, 43, 1);
  border-radius: 8px;
  color:#fff;
  display: flex;
  // border: 1px solid #e0e0e0;
  padding: 12px 0;
	width: 100%;
  .dialog-item-list {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    // justify-content: space-around;
    width: 100%;

    .list-item {
      display: flex;
	  height: 90rpx;
	  width: 100%;
      display: flex;
	  justify-content: space-between;
      align-items: center;
      .list-item-text {
        padding-left: 4px;
        font-size: 24rpx;
        line-height: 17px;
      }
    }
  }
}

.dialog-item-h5 {
  @extend .dialog-item-web;
  padding: 0;
  .dialog-item-list {
    // flex-wrap: wrap;
	display: flex;
	flex-direction: column;
    // margin: 10px;
    .list-item {
      // padding: 0 8px;
      display: flex;
      // flex-direction: column;
      // align-items: center;
      .list-item-text {
        padding-left: 0;
      }
    }
  }
}
</style>
