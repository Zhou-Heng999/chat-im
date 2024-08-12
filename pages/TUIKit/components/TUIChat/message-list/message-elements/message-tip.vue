<template>
  <div class="message-tip" v-if='tipContent' >
    <span>{{ tipContent }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "../../../../adapter-vue";
import {tc} from '@/utils/util'
import { ListMixin } from '@/mixin/list';
import TUIChatEngine from "@tencentcloud/chat-uikit-engine";
const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
  item: {
    type: Object,
    default: () => ({}),
  },
});
const tipContent = computed(() => {


  if(props.item.payload.description == "GM_ORDER"){
    let data = JSON.parse(props.item.payload.data);

    if(data.code){
      if(data.code == "delete_message"){
        return false;
      }
    }
    else{
      return false;
    }

  }
  
  else if(props.item.type === TUIChatEngine.TYPES.MSG_GRP_TIP){
    if(props.item.payload.operationType == 1){
      if( props.item.payload.memberList[0] ){
        return ListMixin.methods.deleteChannel(props.item.payload.memberList[0].userID) + " " + tc("加入群聊");
      }
      else{
        return false;
      }
    }


    else if( props.item.payload.operationType == 4 ){

      let tips = props.item.payload.memberList[0].nick + " " + tc('成为管理员');

      return tips;
    }
    else if( props.item.payload.operationType == 5 ){

      let tips = props.item.payload.memberList[0].nick + " " + tc('被撤销管理员');

      return tips;
    }



    else if(props.item.payload.operationType == 6){

      let op_name = props.item.nick;

      if(props.item.payload.newGroupProfile.ownerID){
        return props.item.payload.memberList[0].nick + " " + tc("成为新的群主");
      }

      else if(props.item.payload.newGroupProfile.notification != undefined){
        if(props.item.payload.newGroupProfile.notification.length > 0){
          return op_name + " " + tc("发布新公告");
        }
        else{
          return op_name + " " + tc("删除公告");
        }
      }
      
      else{

        return tc('群资料更新');
      }

    }

  }

  
  
  else if(props.item.payload.description == "delete_message"){
    return false;
  }

  else if(props.item.payload.description == "add_pinned_msgs"){
    return props.item.nick + ' ' + tc("置顶了一条消息");
  }

  else if(props.item.payload.description == "remove_pinned_msgs"){
    return props.item.nick + ' ' + tc("取消了一条置顶消息");
  }


  else if(props.item.payload.description == "group_delete"){
    return props.item.nick + ' ' + tc("解散群聊");
  }

  else if(props.item.payload.description == "add_pinned_msgs"){
    return props.item.nick + ' ' + tc("置顶了一条消息");
  }

  else if(props.item.payload.description == "remove_pinned_msgs"){
    return props.item.nick + ' ' + tc("取消了一条置顶消息");
  }

  else if(props.content?.custom){

    if(props.content?.custom.indexOf('Create Group') >= 0){
      return props.content?.custom.replace('Create Group',tc("创建群聊"));
    }

    else{
      return "";
    }
    
  }
  else{
    return props.content?.text || props.content?.custom || ""
  }

});

</script>
<style lang="scss" scoped>
@import "../../../../assets/styles/common.scss";
.message-tip {
  margin: 0 auto;
  color: #999999;
  font-size: 12px;
  width: -webkit-fill-available;
  overflow-wrap: anywhere;
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  text-align: center;
  margin-bottom: 10px;
  &-highlight {
    animation: highlight 1000ms infinite;
    @-webkit-keyframes highlight {
      50% {
        color: #ff9c19;
      }
    }
    @keyframes highlight {
      50% {
        color: #ff9c19;
      }
    }
  }
}
</style>
