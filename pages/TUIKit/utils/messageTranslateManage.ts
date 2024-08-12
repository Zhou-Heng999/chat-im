import store from "@/store/index.js"
import { text as api } from '@/api/translate.js'
import translateLangManage from './translateLangManage'

const langCodeEnum = {
  'zh': 'zh',
  'en': 'en',
  'zh_tw': 'zh-TW',
  'pt': 'pt-PT',
  'esp': 'es',
  'hin': 'hi',
  'vi': 'vi',
}

// export const translateText = async (text: string) => {
//   const language = translateLangManage.getItem(store.state.userInfo.userID) as 'zh' | 'zh_tw'
//   const targetLang = langCodeEnum[language] || language || 'en'

//   return await api({
//     targetLang,
//     text
//   })
// }

export const translateText = async (messageContent: any) => {
  const language = translateLangManage.getItem(store.state.userInfo.userID) as 'zh' | 'zh_tw'
  const targetLang = langCodeEnum[language] || language || 'en'
  const _messageContent = JSON.parse(JSON.stringify(messageContent))
  
  const indexList = [];
  const strList = [];
  for(let i = 0; i < _messageContent.text.length; i++){
    const item = _messageContent.text[i];
    if(item.name === "text"){
      indexList.push(i);
      strList.push(item.text);
    }
  }

  if(strList.length > 0){
    const t_str = strList.join('|');

    const t_data = await api({
      targetLang,
      text:t_str
    })
    if(t_data.result){
      const t_list = t_data.data.split('|');

      for(let i = 0; i < indexList.length; i++){
        _messageContent.text[indexList[i]].text = t_list[i];
      }

    }
    
  }

  return _messageContent;

}

const localStorageKey = 'messageTranslateManage'

interface MessageTranslateType {
  [userID: string]: {
    [messageID: string]: string | null
  }
}

export function getMessageTranslates() {
  return uni.getStorageSync(localStorageKey) || {} as MessageTranslateType
}

export function getItem(userID: string) {
  const messageTranslateManage = getMessageTranslates()

  return messageTranslateManage[userID] || null
}

export function setItem(option: { userID: string, messageID: string, text: string }) {
  const messageTranslateManage = getMessageTranslates()

  const { userID, messageID, text } = option

  messageTranslateManage[userID] = {
    ...messageTranslateManage[userID],
    [messageID]: text
  }

  store.commit('setMessageTranslates', messageTranslateManage)

  uni.setStorage({
    key: localStorageKey,
    data: messageTranslateManage
  })
}

export function removeItem(option: { userID: string, messageID: string }) {
  const messageTranslateManage = getMessageTranslates()

  const { userID, messageID } = option

  messageTranslateManage[userID] = {
    ...messageTranslateManage[userID]
  }

  delete messageTranslateManage[userID][messageID]

  store.commit('setMessageTranslates', messageTranslateManage)

  uni.setStorage({
    key: localStorageKey,
    data: messageTranslateManage
  })
}

export default { getMessageTranslates, getItem, setItem, removeItem }

