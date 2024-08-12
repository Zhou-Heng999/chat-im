<template>
  <BottomPopup :show="showAtList" @onClose="closeAt">
    <div
      :class="[isPC ? 'message-input-at' : 'message-input-at-h5']"
      ref="MessageInputAt"
    >
      <div class="memberList" ref="dialog">
        <header class="memberList-title" v-if="!isPC">
          <span class="title">{{
            $tc("选择提醒的人")
          }}</span>
        </header>
		<view class='max-width mb-10 pd-lr-20' >
			<u-search v-model="keyWord" @change='changeKeyWord'  :placeholder="$tc('搜索')" :showAction='false'></u-search>
		</view>
		
		
        <ul class="memberList-box">
          <li
            class="memberList-box-body"
            :class="[index === selectedIndex && 'selected']"
            v-for="(item, index) in (keyWord?searchList:showMemberList)"
            :key="index"
            @touchend.prevent="selectItem(index)"
            ref="memberListItems"
          >
		  <avatarModal :info='item' class="mr-30" ></avatarModal>
           <!-- <img
              class="memberList-box-body-avatar"
              :src="handleMemberAvatar(item)"
            /> -->
            <span class="memberList-box-body-name">{{
              handleMemberName(item)
            }}</span>
          </li>
        </ul>
      </div>
    </div>
  </BottomPopup>
</template>
<script lang="ts" setup>
import TUIChatEngine, {
  TUIStore,
  StoreName,
  TUIGroupService,
  TUITranslateService,
} from "@tencentcloud/chat-uikit-engine";
import { ref, watch,onMounted,onUnmounted } from "../../../../adapter-vue";
import { isPC, isH5 } from "../../../../utils/env";
import { TUIGlobal } from "../../../../utils/universal-api/index";
import BottomPopup from "../../../common/BottomPopup/index.vue";
import store from "@/store/index.js"

const emits = defineEmits(["onAtListOpen", "insertAt"]);

const myId = TUIChatEngine.getMyUserID();

const MessageInputAt = ref();
const memberListItems = ref();
const showAtList = ref(false);
const memberList = ref<Array<any>>();
const allMemberList = ref<Array<any>>();
const showMemberList = ref<Array<any>>();
const isGroup = ref(false);
const position = ref({
  left: 0,
  top: 0,
});
const selectedIndex = ref(0);
const currentConversationID = ref("");

// 搜索
const keyWord=ref('')
const searchList=ref([])
const changeKeyWord=(val)=>{
	 const regex = new RegExp(val, 'i'); // 使用正则表达式匹配子串，不区分大小写
	let list = showMemberList.value.filter(item => regex.test(item.nick));
	searchList.value = list;
	// searchList.value=showMemberList.value.filter(item=>item.nick.indexOf(val)!=-1)
}
const all = {
  userID: TUIChatEngine.TYPES.MSG_AT_ALL,
  nick: "所有人",
  isAll: true,
  avatar: "https://web.sdk.qcloud.com/im/assets/images/at.svg",
};
const userData=ref('')
onMounted(()=>{
	onWatchStore()
})
const onCurrentConversationID=(id: string) => {
	    if (id !== currentConversationID.value) {
	      currentConversationID.value = id;
	      memberList.value = [];
	      allMemberList.value = [];
	      showMemberList.value = [];
	      isGroup.value = false;
	      TUIStore.update(StoreName.CUSTOM, "memberList", memberList.value);
	      if (currentConversationID?.value?.startsWith("GROUP")) {
	        isGroup.value = true;
	        const groupID = currentConversationID?.value?.substring(5);
	        TUIGroupService.switchGroup(groupID);
	      }
	    }
	  }
	  const onUserProfile=(user)=>{
			userData.value = user
		}
		const onCurrentGroupMemberList=(list: Array<any>) => {
		let isCanAtAll = list.some(item=>item.userID == myId&&(item.role=="Owner"||item.role=='Admin'))
		list=list.filter(item=>item.userID!=userData.value.userID)
	    memberList.value = list;
		let AtList=[all, ...memberList.value]
		if(!isCanAtAll){
			AtList.shift()
		}
	    allMemberList.value = AtList;
	    showMemberList.value = allMemberList.value.filter(item=> item.userID != store.state.userInfo.userID);
	    TUIStore.update(StoreName.CUSTOM, "memberList", memberList.value);
	  }
function onWatchStore(){
	TUIStore.watch(StoreName.CONV, {
	  currentConversationID:onCurrentConversationID ,
	});
	TUIStore.watch(StoreName.USER,{
		userProfile:onUserProfile
	})
	TUIStore.watch(StoreName.GRP, {
	  currentGroupMemberList: onCurrentGroupMemberList,
	});
}
function onUnWatchStore(){
	TUIStore.unwatch(StoreName.CONV, {
	  currentConversationID:onCurrentConversationID ,
	});
	TUIStore.unwatch(StoreName.USER,{
		userProfile:onUserProfile
	})
	TUIStore.unwatch(StoreName.GRP, {
	  currentGroupMemberList: onCurrentGroupMemberList,
	});
}

onUnmounted(()=>{
	onUnWatchStore()
})







const toggleAtList = (show: boolean) => {
  if (!isGroup.value) {
    return;
  }
  showAtList.value = show;
  if (showAtList.value) {
    emits("onAtListOpen");
  }
};
const handleAtListPosition = (positionData: { top: number; left: number }) => {
  position.value = positionData;
};
const setCurrentSelectIndex = (index: any) => {
  selectedIndex.value = index;
  memberListItems?.value[selectedIndex.value]?.scrollIntoView(false);
};
const setShowMemberList = (list: any) => {
  showMemberList.value = list;
};

TUIGlobal.toggleAtList = toggleAtList;
TUIGlobal.handleAtListPosition = handleAtListPosition;
TUIGlobal.setCurrentSelectIndex = setCurrentSelectIndex;
TUIGlobal.setShowMemberList = setShowMemberList;

defineExpose({
  toggleAtList,
});

watch(
  () => [position.value, MessageInputAt?.value],
  () => {
    if (isH5 || !MessageInputAt?.value || !MessageInputAt?.value?.style) {
      return;
    }
    MessageInputAt.value.style.left = position.value.left + "px";
    MessageInputAt.value.style.top =
      position.value.top - MessageInputAt.value.clientHeight + "px";
  }
);

const closeAt = () => {
  showAtList.value = false;
  keyWord.value = ''
  showMemberList.value = allMemberList.value.filter(item=> item.userID != store.state.userInfo.userID);
  position.value = {
    left: 0,
    top: 0,
  };
};

const selectItem = (index: number) => {
  if (TUIGlobal.selectItem) {
    TUIGlobal.selectItem(index);
  } else {
	  //判断是否有搜索关键词查询不同的列表
	  if(keyWord.value){
		  const item = searchList?.value[index];
		  emits("insertAt", {
		    id: (item as any)?.userID,
		    label: (item as any)?.nick || (item as any)?.userID,
		  });
	  }else if (showMemberList?.value?.length) {
      const item = showMemberList?.value[index];
      emits("insertAt", {
        id: (item as any)?.userID,
        label: (item as any)?.nick || (item as any)?.userID,
      });
    }
  }
  closeAt();
};

const handleMemberAvatar = (item: any) => {
  return (
    (item as any)?.avatar ||
    "https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png"
  );
};

const handleMemberName = (item: any) => {
  return (item as any)?.nick ? (item as any)?.nick : (item as any)?.userID;
};
</script>
<style scoped lang="scss">
@import url("../../../../assets/styles/common.scss");
.message-input-at {
  position: fixed;
	width: 100%;
  height: 500rpx;
  overflow-x: hidden;
  overflow-y: scroll;
  background: #ffffff;
  box-shadow: 0 0.06rem 0.63rem 0 rgba(2, 16, 43, 0.15);
  border-radius: 0.13rem;
}
.memberList-box {
  &-header {
    height: 2.5rem;
    padding-top: 5px;
    cursor: pointer;

    &:hover {
      background: rgba(0, 110, 255, 0.1);
    }
  }
  span {
    font-family: PingFangSC-Regular;
    font-weight: 400;
    font-size: 12px;
    color: #000000;
    letter-spacing: 0;
    padding: 5px;
  }
  &-body {
	  padding: 10rpx 30rpx;
	  box-sizing: border-box;
    cursor: pointer;
    display: flex;
    align-items: center;
    .selected,
    &:hover {
      background: rgba(0, 110, 255, 0.1);
    }
    &-name {
      overflow: hidden;
      white-space: nowrap;
      word-wrap: break-word;
      word-break: break-all;
      text-overflow: ellipsis;
    }
    &-avatar {
      width: 20px;
      height: 20px;
      padding-left: 10px;
    }
  }
  .selected {
    background: rgba(0, 110, 255, 0.1);
  }
}

.message-input-at-h5 {
  .memberList {
    height: auto;
    height: 700rpx;
    width: 100%;
    max-width: 100%;
    background: white;
    border-radius: 12px 12px 0 0;
    display: flex;
    flex-direction: column;
    overflow: scroll;
	padding-bottom: 30rpx;
    &-title {
      height: fit-content;
      width: calc(100% - 30px);
      text-align: center;
      vertical-align: middle;
      padding: 15px;
      .title {
        vertical-align: middle;
        display: inline-block;
        font-size: 16px;
      }
      .close {
        vertical-align: middle;
        position: absolute;
        right: 10px;
        display: inline-block;
      }
    }
    &-box {
      flex: 1;
      overflow-y: scroll;
      &-body {
        padding: 10px;
        img {
          width: 26px;
          height: 26px;
        }
        span {
          font-size: 14px;
        }
      }
    }
  }
}
</style>
