const localStorageKey = 'translateLangManage'

export function getTranslateLangs() {
  return uni.getStorageSync(localStorageKey) || {}
}

export function getItem(userID: string) {
  const translateLangManage = getTranslateLangs()

  return translateLangManage[userID] || 'en'
}

export function setItem(userID: string, lang: string) {
  const translateLangManage = getTranslateLangs()

  translateLangManage[userID] = lang

  uni.setStorage({
    key: localStorageKey,
    data: translateLangManage
  })
}

export function removeItem(userID: string) {
  const translateLangManage = getTranslateLangs()

  translateLangManage[userID] = null

  uni.setStorage({
    key: localStorageKey,
    data: translateLangManage
  })
}

export default { getItem, setItem, removeItem }
