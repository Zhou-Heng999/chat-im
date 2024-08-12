import {
  TUIChatService,
  TUIStore,
  StoreName,
  TUITranslateService,
  IConversationModel,
  SendMessageParams,
} from "@tencentcloud/chat-uikit-engine";
import { Toast, TOAST_TYPE } from "../../common/Toast/index";
import { isEnabledMessageReadReceiptGlobal } from "../utils/utils";
import { ITipTapEditorContent } from "../../../interface";
import { enableSampleTaskStatus } from "../../../utils/enableSampleTaskStatus";
import {tc} from '@/utils/util'
import { ListMixin } from '@/mixin/list';
import store from "@/store/index.js"
import {
		getCurrentInstance,
	} from "../../../adapter-vue";
export const sendMessageErrorCodeMap: Map<number, string> = new Map([
  [3123, "文本包含本地审核拦截词"],
  [4004, "图片消息失败,无效的图片格式"],
  [4005, "文件消息失败,禁止发送违规封禁的文件"],
  [7004, "文件不存在,请检查文件路径是否正确"],
  [7005, "文件大小超出了限制,如果上传文件,最大限制是100MB"],
  [8001, "消息长度超出限制,消息长度不要超过12K"],
  [80001, "消息或者资料中文本存在敏感内容,发送失败"],
  [80004, "消息中图片存在敏感内容,发送失败"],
  [10010, "该群聊已被解散"],
  [10017, "您已被禁言"],
  [20009, "您已不是对方的好友,无法发信息给对方"],
  [2404,"文件大小超出了限制,如果上传文件,最大限制是100MB"],
  [10007,"您已不在该群组"],
  [20010,'您已不是对方的好友,无法发信息给对方'],
  [20011,'您已不是对方的好友,无法发信息给对方'],
  [20012,'你已被禁言']
]);

/**
 * 该函数仅处理 Text TextAt Image Video File 五种消息类型
 * @param messageList
 * @param currentConversation
 */
export const sendMessages = async (
  messageList: ITipTapEditorContent[],
  currentConversation: IConversationModel
) => {
  // 有 messageJumping 的情况下，发送消息自动清空，回到底部
  if (TUIStore.getData(StoreName.CHAT, "messageSource")) {
    TUIStore.update(StoreName.CHAT, "messageSource", undefined);
  }
  messageList?.forEach(async (content: ITipTapEditorContent) => {
    try {
      const options: SendMessageParams = {
        to: currentConversation?.groupProfile?.groupID || currentConversation?.userProfile?.userID,
        conversationType: currentConversation?.type as any,
        payload: {},
        needReadReceipt: isEnabledMessageReadReceiptGlobal(),
      };
      // handle message typing
      switch (content?.type) {
        case "text":
          // const textMessageContent = JSON.parse(JSON.stringify(content?.payload?.text));
		  let contentText = JSON.parse(JSON.stringify(content?.payload?.text));
		  let textMessageContent = ListMixin.methods.maskSensitiveInfo(contentText,store.state.sensitiveData)
          // 禁止发送空消息
          if (!textMessageContent) {
            break;
          }
          if (content?.payload?.atUserList) {
            options.payload = {
              text: textMessageContent,
              atUserList: content?.payload?.atUserList,
            };
            await TUIChatService?.sendTextAtMessage(options);
          } else {
            options.payload = {
              text: textMessageContent,
            };
            await TUIChatService?.sendTextMessage(options);
          }
          break;
        case "image":
          options.payload = {
            file: content?.payload?.file,
          };
          await TUIChatService?.sendImageMessage(options);
          break;
        case "video":
          options.payload = {
            file: content?.payload?.file,
          };
          await TUIChatService?.sendVideoMessage(options);
          break;
        case "file":
          options.payload = {
            file: content?.payload?.file,
          };
          await TUIChatService?.sendFileMessage(options);
          break;
        default:
          break;
      }
      enableSampleTaskStatus("sendMessage");
    } catch (error: any) {
		console.log('error?.code',error?.code)
		if(error?.code==20010||error?.code==20009||error?.code==20011){
			uni.$emit('setFriendType',{isFriend:false})
		}else{
			Toast({
			  message: sendMessageErrorCodeMap.get(error?.code)
			    ? tc(sendMessageErrorCodeMap.get(error.code) as string)
			    : error?.message,
			  type: TOAST_TYPE.ERROR,
			
			});
		}
      
      // 如果消息发送失败，且该消息为引用消息，清除引用消息信息
      if (TUIStore.getData(StoreName.CHAT, "quoteMessage")) {
        TUIStore.update(StoreName.CHAT, "quoteMessage", {});
      }
    }
  });
};

export const handleMessageWithTyping = (cloudCustomData: any) => {
  if (!cloudCustomData) {
    cloudCustomData = {};
  }
  cloudCustomData.messageFeature = {
    needTyping: 1,
    version: 1,
  };
  return cloudCustomData;
};

export const sendTyping = (inputContentEmpty: boolean, inputBlur: boolean) => {
  if (!inputContentEmpty && !inputBlur) {
    TUIChatService.enterTypingState();
  } else {
    TUIChatService.leaveTypingState();
  }
};
