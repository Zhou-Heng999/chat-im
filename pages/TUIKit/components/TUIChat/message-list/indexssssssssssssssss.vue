<template>
  <div class="TUIChat" :class="[!isPC ? 'TUIChat-H5' : '']">
    <button class="btn-test" @click="clickTest">{{ scrollIntoView }}</button>
    <div class="TUIChat-main">
      <div
        class="TUIChat-application-tips"
        v-if="isGroup && groupApplicationCount > 0"
        @click="toggleApplicationList()"
      >
        <span
          >{{ groupApplicationCount }}
          {{ TUITranslateService.t("TUIChat.条入群申请") }}
          <span class="application-tips-btn">{{
            TUITranslateService.t("TUIChat.点击处理")
          }}</span>
        </span>
      </div>
      <scroll-view
        id="messageScrollList"
        class="TUI-message-list"
        :show-scrollbar="false"
        :scroll-y="true"
        :scroll-top="scrollTop"
      >

        <p
          v-if="!isCompleted"
          class="message-more"
          @click="getHistoryMessageList"
        >
          {{ TUITranslateService.t("TUIChat.查看更多") }}
        </p>
        <li
          v-for="(item, index) in messageList"
          :id="`tui-${item.ID}`"
          :key="item.vueForRenderKey"
          :class="'message-li ' + item.flow"
        >
          <MessageTimestamp
            :currTime="item.time"
            :prevTime="index > 0 ? messageList[index - 1].time : 0"
          ></MessageTimestamp>
          <div
            class="message-item"
            @click.stop="toggleID = ''"
          >
            <MessageTip
              v-if="
                item.type === TYPES.MSG_GRP_TIP ||
                isCreateGroupCustomMessage(item)
              "
              :content="item.getMessageContent()"
            />
            <div
              v-else-if="!item.isRevoked && !isPluginMessage(item)"
              :id="`msg-bubble-${item.ID}`"
              class="message-bubble-container"
              @longpress="handleToggleMessageItem($event, item, index, true)"
              @touchstart="handleH5LongPress($event, item, index, 'touchstart')"
              @touchend="handleH5LongPress($event, item, index, 'touchend')"
              @mouseover="handleH5LongPress($event, item, index, 'touchend')"
            >
              <MessageBubble
                :messageItem="item"
                :content="item.getMessageContent()"
                :blinkMessageIDList="blinkMessageIDList"
                @resendMessage="resendMessage(item)"
                @blinkMessage="blinkMessage"
                @scrollTo="scrollTo"
                @setReadReciptPanelVisible="setReadReciptPanelVisible"
              >
                <MessageText
                  v-if="item.type === TYPES.MSG_TEXT"
                  :content="item.getMessageContent()"
                />
                <ProgressMessage
                  v-if="item.type === TYPES.MSG_IMAGE"
                  :content="item.getMessageContent()"
                  :messageItem="item"
                >
                  <MessageImage
                    :content="item.getMessageContent()"
                    :messageItem="item"
                    @previewImage="handleImagePreview"
                  />
                </ProgressMessage>
                <ProgressMessage
                  v-if="item.type === TYPES.MSG_VIDEO"
                  :content="item.getMessageContent()"
                  :messageItem="item"
                >
                  <MessageVideo
                    :content="item.getMessageContent()"
                    :messageItem="item"
                  />
                </ProgressMessage>
                <MessageAudio
                  v-if="item.type === TYPES.MSG_AUDIO"
                  :content="item.getMessageContent()"
                  :messageItem="item"
                />
                <MessageFile
                  v-if="item.type === TYPES.MSG_FILE"
                  :content="item.getMessageContent()"
                />
                <MessageFace
                  v-if="item.type === TYPES.MSG_FACE"
                  :content="item.getMessageContent()"
                  :isPC="isPC"
                />
                <MessageLocation
                  v-if="item.type === TYPES.MSG_LOCATION"
                  :content="item.getMessageContent()"
                />
                <MessageCustom
                  v-if="item.type === TYPES.MSG_CUSTOM"
                  :content="item.getMessageContent()"
                  :messageItem="item"
                />
              </MessageBubble>
            </div>
            <MessagePlugin
              v-else-if="!item.isRevoked && isPluginMessage(item)"
              :message="item"
              @resendMessage="resendMessage"
              @handleToggleMessageItem="handleToggleMessageItem"
              @handleH5LongPress="handleH5LongPress"
            />
            <MessageRevoked
              v-else
              :isEdit="item.type === TYPES.MSG_TEXT"
              :messageItem="item"
              @messageEdit="handleEdit(item)"
            />
          </div>
        </li>
      </scroll-view>
      <Dialog
        v-if="reSendDialogShow"
        :show="reSendDialogShow"
        :isH5="!isPC"
        :center="true"
        :isHeaderShow="isPC"
        @submit="resendMessageConfirm()"
        @update:show="(e) => (reSendDialogShow = e)"
      >
        <p class="delDialog-title">
          {{ TUITranslateService.t("TUIChat.确认重发该消息？") }}
        </p>
      </Dialog>
      <ImagePreviewer
        v-if="showImagePreview"
        :currentImage="currentImagePreview"
        :imageList="imageMessageList"
        @close="onImagePreviewerClose"
      ></ImagePreviewer>
      <MessageGroupSystem
        v-if="showGroupApplication"
        :groupID="groupID"
        @toggleApplicationList="toggleApplicationList"
        @handleGroupApplication="handleGroupApplication"
      ></MessageGroupSystem>
      <!-- 已读回执用户列表面板 -->
      <ReadReciptPanel
        v-if="isShowReadUserStatusPanel"
        :message="Object.assign({}, readStatusMessage)"
        @setReadReciptPanelVisible="setReadReciptPanelVisible"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  ref,
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  getCurrentInstance,
} from "../../../adapter-vue";

import TUIChatEngine, {
  IMessageModel,
  TUIStore,
  StoreName,
  TUITranslateService,
  TUIChatService,
  TUIGroupService,
} from "@tencentcloud/chat-uikit-engine";

import Link from "./link";
import MessageText from "./message-elements/message-text.vue";
import ProgressMessage from "../../common/ProgressMessage/index.vue";
import MessageImage from "./message-elements/message-image.vue";
import MessageAudio from "./message-elements/message-audio.vue";
import MessageFile from "./message-elements/message-file.vue";
import MessageFace from "./message-elements/message-face.vue";
import MessageCustom from "./message-elements/message-custom.vue";
import MessageTip from "./message-elements/message-tip.vue";
import MessageBubble from "./message-elements/message-bubble.vue";
import MessageLocation from "./message-elements/message-location.vue";
import MessageTimestamp from "./message-elements/message-timestamp.vue";
import MessageVideo from "./message-elements/message-video.vue";
import MessageTool from "./message-tool/index.vue";
import MessageRevoked from "./message-tool/message-revoked.vue";
import MessageGroupSystem from "./message-elements/message-group-system.vue";
import MessagePlugin from "../../../plugins/plugin-components/message-plugin.vue";
import ReadReciptPanel from "./read-receipt-panel/index.vue";
import { isPluginMessage } from "../../../plugins/plugin-components/index";
import Dialog from "../../common/Dialog/index.vue";
import ImagePreviewer from "../../common/ImagePreviewer/index.vue";
import { isCreateGroupCustomMessage } from "../utils/utils";
import { getBoundingClientRect, getScrollInfo, instanceMapping } from "../../../utils/universal-api/domOperation";
import { isEnabledMessageReadReceiptGlobal } from "../utils/utils";
import { isPC, isH5 } from "../../../utils/env";

const props = defineProps({
  groupID: {
    type: String,
    default: "",
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
});

let observer: any = null;
let groupType: string | undefined;
const sentReceiptMessageID = new Set<string>();
const thisInstance = getCurrentInstance()?.proxy || getCurrentInstance();
const messageList = ref([]);
const isCompleted = ref(false);
const currentConversationID = ref("");
const nextReqMessageID = ref();
const toggleID = ref("");
const scrollTop = ref(5000); // 首次是 15 条消息，最大消息高度为300
const TYPES = ref(TUIChatEngine.TYPES);
const isLoadMessage = ref(false);
const isLongpressing = ref(false);
const blinkMessageIDList = ref<string[]>([]);
// 阅读回执状态message
const readStatusMessage = ref<IMessageModel>();
const isShowReadUserStatusPanel = ref<boolean>(false);

// 加群申请系统消息
const groupApplicationCount = ref(0);
const showGroupApplication = ref(false);
const applicationUserIDList = ref([]);

// 消息重发 Dialog
const reSendDialogShow = ref(false);
const resendMessageData = ref();
const emits = defineEmits(["handleEditor"]);

const lastMessageID = ref<string>('');

// 图片预览相关
const showImagePreview = ref(false);
const currentImagePreview = ref<IMessageModel>();
const imageMessageList = computed(() =>
  messageList?.value?.filter((item: IMessageModel) => {
    return !item.isRevoked && !item.hasRiskContent && item.type === TYPES.value.MSG_IMAGE;
  })
);

const scrollIntoView = computed(() => {
  if (lastMessageID.value) {
    return 'tui-' + lastMessageID.value
  } else {
    return ''
  }
})

async function scrollToOriginalMessage(originMessageID: string) {
  nextTick(async () => {
    const sasscrollInfo = await getScrollInfo('#messageScrollList', 'messageList');
    const boundingClientRect = await getBoundingClientRect('#messageScrollList', 'messageList');
    const originalMessageRect = await getBoundingClientRect('#tui-' + originMessageID, 'messageList');
    console.log(sasscrollInfo, boundingClientRect, originalMessageRect, originalMessageRect.top)
    const { top, bottom, height } = originalMessageRect
    const newScrollTop = top > 0 ? (top + height) : Math.abs(bottom)
    scrollTop.value = newScrollTop
  })
}


// 消息滑动到底部，建议搭配 nextTick 使用
const scrollToBottom = () => {
  // 文本消息高度：60, 最大消息高度 280
  scrollTop.value += 300;
  // 解决 uniapp 打包到 app 首次进入滑动到底部，300 可设置
  const timer = setTimeout(() => {
    scrollTop.value += 1;
    clearTimeout(timer);
  }, 300);
};

// 监听回调函数
const onCurrentConversationIDUpdated = (conversationID: string) => {
  currentConversationID.value = conversationID;
  TUIGroupService.getGroupApplicationList().then((res: any) => {
    const applicationList = res.data.applicationList.filter(
      (application: any) => application.groupID === props.groupID
    );
    applicationUserIDList.value = applicationList.map((application: any) => {
      return application.applicationType === 0
        ? application.applicant
        : application.userID;
    });
    TUIStore.update(
      StoreName.CUSTOM,
      "groupApplicationCount",
      applicationList.length
    );
  });

  // 开启已读回执的状态 群聊缓存群类型
  if (isEnabledMessageReadReceiptGlobal()) {
    const { groupProfile } = TUIStore.getConversationModel(conversationID) || {};
    groupType = groupProfile?.type;
  }
};

// operationType 操作类型 1: 有用户申请加群   23: 普通群成员邀请用户进群
const onGroupSystemNoticeList = (list: Array<IMessageModel>) => {
  const systemNoticeList = list.filter((message) => {
    const { operationType } = message.payload;
    return (
      (operationType === 1 || operationType === 23) &&
      message.to === props.groupID
    );
  });

  systemNoticeList.forEach((systemNotice) => {
    const { operationType } = systemNotice.payload;
    if (operationType === 1) {
      const { operatorID } = systemNotice.payload;
      if (!applicationUserIDList.value.includes(operatorID)) {
        applicationUserIDList.value.push(operatorID);
      }
    }
    if (operationType === 23) {
      const { inviteeList } = systemNotice.payload;
      inviteeList.forEach((invitee) => {
        if (!applicationUserIDList.value.includes(invitee)) {
          applicationUserIDList.value.push(invitee);
        }
      });
    }
  });
  const applicationCount = applicationUserIDList.value.length;
  TUIStore.update(StoreName.CUSTOM, "groupApplicationCount", applicationCount);
};

function onMessageListUpdated(list: IMessageModel[]) {
  observer?.disconnect();
  messageList.value = list
    .filter(message => !message.isDeleted)
    .map((message) => {
      message.vueForRenderKey = `${message.ID}`;
      return message;
    });
  // 点击加载更多的消息不需要滑动到底部
  if (!isLoadMessage.value) {
    scrollToBottom();
  }

  if (lastMessageID.value) {
    setTimeout(() => {
      lastMessageID.value = ''
    }, 3000)
  }

  // if (isEnabledMessageReadReceiptGlobal()) {
  //   nextTick(() => bindIntersectionObserver());
  // }
}

function onChatCompletedUpdated(flag: boolean) {
  isCompleted.value = flag;
}

function onGroupApplicationCountUpdated (count: number) {
  groupApplicationCount.value = count;
}

// 获取历史消息
const getHistoryMessageList = () => {
  isLoadMessage.value = true;
  lastMessageID.value = messageList.value[0].ID
  TUIChatService.getMessageList().then((res: any) => {
    const { nextReqMessageID: ID } = res.data;
    nextReqMessageID.value = ID;
    isLoadMessage.value = false;
  });
};

const toggleApplicationList = () => {
  showGroupApplication.value = !showGroupApplication.value;
};

const handleGroupApplication = (userID: string) => {
  const index = applicationUserIDList.value.indexOf(userID);
  if (index !== -1) {
    applicationUserIDList.value.splice(index, 1);
  }
};

// 消息操作
const handleToggleMessageItem = (
  e: any,
  message: IMessageModel,
  index: number,
  isLongpress = false
) => {
  if (isLongpress) {
    isLongpressing.value = true;
  }
  toggleID.value = message.ID;
};

// h5 long press
let timer: number;
const handleH5LongPress = (
  e: any,
  message: IMessageModel,
  index: number,
  type: string
) => {
  if (!isH5) return;
  function longPressHandler() {
    clearTimeout(timer);
    handleToggleMessageItem(e, message, index, true);
  }
  function touchStartHandler() {
    timer = setTimeout(longPressHandler, 500);
  }
  function touchEndHandler() {
    clearTimeout(timer);
  }
  switch (type) {
    case "touchstart":
      touchStartHandler();
      break;
    case "touchend":
      touchEndHandler();
      setTimeout(() => {
        isLongpressing.value = false;
      }, 200);
      break;
  }
};

// 消息撤回后，编辑消息
const handleEdit = (message: IMessageModel) => {
  emits("handleEditor", message, "reedit");
};

// 重发消息
const resendMessage = (message: IMessageModel) => {
  reSendDialogShow.value = true;
  resendMessageData.value = message;
};

// 图片预览
// 开启图片预览
const handleImagePreview = (message: IMessageModel) => {
  if (
    showImagePreview.value ||
    currentImagePreview.value ||
    isLongpressing.value
  ) {
    return;
  }
  showImagePreview.value = true;
  currentImagePreview.value = message;
};
// 关闭图片预览
const onImagePreviewerClose = () => {
  showImagePreview.value = false;
  setTimeout(() => {
    currentImagePreview.value = null;
  }, 50);
};

const resendMessageConfirm = () => {
  reSendDialogShow.value = !reSendDialogShow.value;
  const messageModel = resendMessageData.value;
  messageModel.resendMessage();
};

function blinkMessage(messageID: string): Promise<void> {
  return new Promise((resolve) => {
    const index = blinkMessageIDList.value.indexOf(messageID);
    if (index < 0) {
      blinkMessageIDList.value.push(messageID);
      const timer = setTimeout(() => {
        blinkMessageIDList.value.splice(blinkMessageIDList.value.indexOf(messageID), 1);
        clearTimeout(timer);
        resolve();
      }, 3000);
    }
  });
}

// 滚动到最新消息
async function scrollToLatestMessage() {
  const { scrollHeight } = await getScrollInfo('#messageScrollList', 'messageList');
  const { height } = await getBoundingClientRect('#messageScrollList', 'messageList');
  scrollTop.value = scrollHeight - height;
}

async function bindIntersectionObserver() {
  if (messageList.value.length === 0) {
    return;
  }

  if (groupType === TYPES.value.GRP_AVCHATROOM || groupType === TYPES.value.GRP_COMMUNITY) {
    // 直播群以及社群不进行消息的已读回执监听
    return;
  }

  observer?.disconnect();
  observer = uni.createIntersectionObserver(thisInstance, {
    threshold: [0.7],
    observeAll: true,
    // uni 下会把 safetip 也算进去 需要负 margin 来排除
  }).relativeTo('#messageScrollList', { top: -70 });

  observer?.observe('.message-li.in .message-bubble-container', (res: any) => {
    if (sentReceiptMessageID.has(res.id)) {
      return;
    }
    const matchingMessage = messageList.value.find((message: IMessageModel) => {
      return res.id.indexOf(message.ID) > -1;
    });
    if (
      matchingMessage &&
      matchingMessage.needReadReceipt &&
      matchingMessage.flow === 'in' &&
      !matchingMessage.readReceiptInfo?.isPeerRead
    ) {
      TUIChatService.sendMessageReadReceipt([matchingMessage]);
      sentReceiptMessageID.add(res.id);
    }
  });
}

function setReadReciptPanelVisible(visible: boolean, message?: IMessageModel) {
  if (!visible) {
    readStatusMessage.value = undefined;
  } else {
    readStatusMessage.value = message;
  }
  isShowReadUserStatusPanel.value = visible;
}

function scrollMessageList() {
  // console.log("scrollMessageList =============")
}

function watchMessageListScroll() {
  let query = uni.createSelectorQuery().in(thisInstance);
  console.log('aaaaaaaaaaaaaaaaaa=====================', query.select('#messageScrollList'))
  query.select('#messageScrollList').boundingClientRect(data => {
  	console.log("scrollMessageList =============", data)
  }).exec();
}

async function clickTest() {
  const originalMessageRect = await getBoundingClientRect('#tui-' + lastMessageID.value, 'messageList');
  console.log(originalMessageRect)
}

function TUIStoreWatchStart() {
  // 消息列表监听
  TUIStore.watch(StoreName.CHAT, {
    messageList: onMessageListUpdated,
    isCompleted: onChatCompletedUpdated,
  });

  TUIStore.watch(StoreName.CONV, {
    currentConversationID: onCurrentConversationIDUpdated,
  });

  // 群系统消息
  TUIStore.watch(StoreName.GRP, {
    groupSystemNoticeList: onGroupSystemNoticeList,
  });

  // 群系统消息数量
  TUIStore.watch(StoreName.CUSTOM, {
    groupApplicationCount: onGroupApplicationCountUpdated,
  });
}

function TUIStoreWatchEnd() {
  // 消息列表监听
  TUIStore.unwatch(StoreName.CHAT, {
    messageList: onMessageListUpdated,
    isCompleted: onChatCompletedUpdated,
  });

  TUIStore.unwatch(StoreName.CONV, {
    currentConversationID: onCurrentConversationIDUpdated,
  });

  // 群系统消息
  TUIStore.unwatch(StoreName.GRP, {
    groupSystemNoticeList: onGroupSystemNoticeList,
  });

  // 群系统消息数量
  TUIStore.unwatch(StoreName.CUSTOM, {
    groupApplicationCount: onGroupApplicationCountUpdated,
  });
}

onMounted(() => {
  instanceMapping.set('messageList', thisInstance);
  TUIStoreWatchStart()
  watchMessageListScroll()
});

// 取消监听
onUnmounted(() => {
  TUIStoreWatchEnd()

  observer?.disconnect();
  observer = null;
});

</script>
<style lang="scss" scoped src="./style/index.scss"></style>
