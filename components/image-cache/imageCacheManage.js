const localStorageKey = 'imageCacheManage'


export function getImageCaches() {
  return uni.getStorageSync(localStorageKey) || {}
}

export function getItem(url) {
  const imageCacheManage = getImageCaches()

  return imageCacheManage[url] || null
}

export function setItem(option) {
  const imageCacheManage = getImageCaches()

  const { url, savedFilePath } = option

  imageCacheManage[url] = {
    savedFilePath,
    status: savedFilePath ? 'success' : 'pending'
  }

  uni.setStorage({
    key: localStorageKey,
    data: imageCacheManage
  })
}

export function removeItem(url) {
  const imageCacheManage = getImageCaches()

  imageCacheManage[url] = null

  uni.setStorage({
    key: localStorageKey,
    data: imageCacheManage
  })
}

export default { getImageCaches, getItem, setItem, removeItem }

