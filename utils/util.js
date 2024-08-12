let BigNumber=null
import env from '@/utils/env.js'
import { TUIChatKit, genTestUserSig } from "@/pages/TUIKit";
import TUIChatEngine, {
  TUIUserService,
	TUIChatService,
  TUIConversationService
} from "@tencentcloud/chat-uikit-engine";
import { TUILogin } from "@tencentcloud/tui-core";
import {config} from '@/const'
import { formatDate } from './filter.js'
import md5 from './md5.js'
import i18n from '@/i18n/index.js'
import lan from '@/i18n/lan.json'
import emoji from '@/i18n/emoji.json'
import {ListMixin} from '@/mixin/list'
import store from "@/store/index.js"
import { TUIGlobal } from "@/pages/TUIKit/utils/universal-api/index";
const audio = TUIGlobal?.createInnerAudioContext();

// 保留小数位
export function decimal_place(value, num=4) {
  if (!value) return
  let v = value
  if (Object.prototype.toString.call(value) === '[object String]') {
    v = v * 1
  }
  return v.toFixed(num)
}
export function setUserID(id){
	let {channel}=config
	if(!id)return id
	let t=id.indexOf(channel)==-1?channel+'#'+id:id.substring(channel.length+1,id.length)
	return t
}

export function formatFileSize(fileSizeInBytes) {
  // 将文件大小转换为KB
  let fileSizeInKB = fileSizeInBytes / 1024;

  // 如果文件大小超过1MB，则将其转换为MB
  if (fileSizeInKB >= 1024) {
    let fileSizeInMB = fileSizeInKB / 1024;
    return fileSizeInMB.toFixed(2) + ' MB';
  } else {
    return fileSizeInKB.toFixed(2) + ' KB';
  }
}

export function getAvatarInfo (info){
	let newInfo=null
	if(info.type=='C2C'&&info.userProfile){
		newInfo=info?.userProfile
		newInfo.remark=info?.remark||''
	}else{
		newInfo=info?.groupProfile||''
	}
	return  newInfo
}
export function removeTip(text){
			let regex = /(@\w+)_\{[^}]+\}/g;
			text = text.replace(regex, '$1');
			return text
		}
		
		var isPlay = false;
		const innerAudioContext = uni.createInnerAudioContext();
		innerAudioContext.src = '/static/bell.mp3';
		innerAudioContext.onPlay(() => {
			isPlay = true;
		});
		innerAudioContext.onError((res) => {
			isPlay = false;
		});
		innerAudioContext.onStop((res) => {
			isPlay = false;
		});
		innerAudioContext.onEnded((res) => {
			isPlay = false;
		});
		function onWatchTips(){
			// #ifdef H5
			notification()
			// #endif
			//会话列表更新
			// console.log('TUI登陆成功',TUIChatKit)
			// TUIChatKit.chat.on(TUIChatKit.TUIChatEngine
			// .EVENT.CONVERSATION_LIST_UPDATED,(res)=>{
				// console.log('未读消息条数',res)
				// ListMixin.methods.setTabNum()
			// })
			TUIChatKit.chat.on(TUIChatKit.TUIChatEngine
			.EVENT.TOTAL_UNREAD_MESSAGE_COUNT_UPDATED,(res)=>{
				// notificationMsg(res.data)
				store.commit('setTotalUnreadCount',res.data)
				getApp().globalData.noRead=res.data
				if(uni.$u.page()!='/pages/TUIKit/components/TUIChat/index'){
					if(res.data==0){
						// uni.$emit('onDele')
					}else{
						uni.setTabBarBadge({
							index:0,
							text:`${res.data>99?'99+':res.data}`
						})
					}
				}
				
				
			})
			TUIChatKit.chat.on(TUIChatKit.TUIChatEngine
			.EVENT.MESSAGE_RECEIVED,(res)=>{
				let data = res.data;
				//防止频繁触发、以音效播放结束为准进行节流
				if(!isPlay){
					let target = store.state.allConversation.find(item=>item.conversationID === data[0].conversationID)
					if(target!=-1 && target.messageRemindType=="AcceptAndNotify"){
						if(store.state.isVibrate) uni.vibrateLong();
						if(store.state.isBell) innerAudioContext.play();
					}					
				}
				//不存在的话说明有新会话，直接消息提示？
				
				// #ifdef H5
				notificationMsg(res.data)
				// #endif
			})
			// 好友申请更新
			TUIChatKit.chat.on(TUIChatKit.TUIChatEngine
			.EVENT.FRIEND_APPLICATION_LIST_UPDATED,(event)=>{
				const { friendApplicationList, unreadCount } = event.data;
				const applicationSentToMe = friendApplicationList.filter((friendApplication) => friendApplication.type == TUIChatKit.TUIChatEngine.TYPES.SNS_APPLICATION_SENT_TO_ME);
				let applicationSentToMeLen=applicationSentToMe.length
				if(applicationSentToMeLen==0){
					uni.removeTabBarBadge({
						index:0,
					})
					uni.$emit('updateUnread',{ unread:0 })
				}else{
					//触发通讯录页面监听
					uni.$emit('updateUnread',{ unread:applicationSentToMeLen })
					uni.setTabBarBadge({
						index:1,
						text:`${applicationSentToMeLen}`,
						success: (res) => {
						
							console.log('res',res)
						
						},
						fail: (err) => {
						
							console.log('err',err)
						
						}
					})
				}
			})
		}
export function loginTX(opt,callback){
			let userInfo=opt?opt:uni.getStorageSync('userInfo')
			if(!userInfo){
				uni.reLaunch({
					url:'/pages/login/index'
				})
				throw new Error('userID不存在或用户未登录')
				return
			} 
			uni.setStorageSync('userInfo',userInfo)
			// console.log('userInfo',userInfo)
			// uni.setStorageSync('腾讯云开始登陆',Date.now())
			let stime=Date.now()
			console.log('腾讯云开始登陆',Date.now())
			let newConfig=userInfo
			newConfig.appid=Number(newConfig.appid)
			uni.$chat_userID = newConfig.userID;
			uni.$chat_SDKAppID = newConfig.appid;
			uni.$chat_userSig = newConfig.userSig;
			console.log('userInfo',userInfo)
			// TUIChatKit 初始化0
			TUIChatKit.init();
			let promise=TUILogin.login({
			  SDKAppID: uni.$chat_SDKAppID,
			  userID: uni.$chat_userID,
			  // UserSig 是用户登录即时通信 IM 的密码，其本质是对 UserID 等信息加密后得到的密文。
			  // 该方法仅适合本地跑通 Demo 和功能调试，详情请参见 https://cloud.tencent.com/document/product/269/32688     
			  userSig: uni.$chat_userSig, 
			  // 如果您需要发送图片、语音、视频、文件等富媒体消息，请设置为 true
			  useUploadPlugin: true, 
			  // 本地审核可识别、处理不安全、不适宜的内容，为您的产品体验和业务安全保驾护航
			  // 此功能为增值服务，请参考：https://cloud.tencent.com/document/product/269/79139
			  // 如果您已购买内容审核服务，开启此功能请设置为 true
			  useProfanityFilterPlugin: false,
			  framework: `vue2` // 当前开发使用框架 vue2 / vue3
			});
			uni.$chatKit = TUIChatKit;
			promise.then((imResponse)=>{
				
				if(callback)callback()
				TUILogin.setLogLevel(4)
				TUIUserService.switchMessageReadStatus(true);
				onWatchTips()
				
			}).catch(err=>{
				uni.clearStorageSync()
				// uni.$chatKit?.chat.destroy()
				uni.navigateTo({
					url:`/pages/login/index`
				})
			})
			
		}
		
 function notification(){
      let that=this;
      if (!("Notification" in window)) {
        console.log("浏览器不支持消息通知");
        return;
      }
      Notification.requestPermission(function (permission) {
		  console.log('permission',permission)
	  });
}
let timer=null
function notificationMsg(list){
	let msgInfo=list[0]
	let that=this
	if(document.hidden){
		let {conversationType}=msgInfo
	        var options = {
	          body: `${msgInfo.nick}: ${removeTip(msgInfo.payload.text)}`,
	          silent: true
	        }
	        var notification = new Notification('消息通知', options);
	      }
}

export async function uploadImage({ sourceType }) {
	const userID = store.state.userInfo.userID
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      sourceType,
      success(result) {
				TUIChatService.sendImageMessage({
					to: userID,
          conversationType: uni.$chatKit.TUIChatEngine.TYPES.CONV_C2C,
          payload: { file: result },
				}).then((imResponse) => {
					if (imResponse.code === 0) {
						// 1：原图、2：大图、3：缩略图
						const defaultImageInfo = imResponse.data.message.payload.imageInfoArray.find(imageInfo => imageInfo.type === 0)
				 
						if (defaultImageInfo) {
							resolve(defaultImageInfo)
						} else {
							reject('获取url失败')
						}
					} else {
						reject('上传图片失败')
					}
				}).catch((imError) => {
					reject(imError)
				});
      },
      fail(err) {
        reject(err)
      }
    })
  })
}


function textNumber(num) {
  return num * 100
}
function timestampToTime(timestamp) {
  var date = new Date(timestamp * 1000) //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var Y = date.getFullYear() + '-'
  var M = changeDateNumber(date.getMonth() + 1) + '-'
  var D = changeDateNumber(date.getDate()) + ' '
  var h = changeDateNumber(date.getHours()) + ':'
  var m = changeDateNumber(date.getMinutes()) + ':'
  var s = changeDateNumber(date.getSeconds())
  return Y + M + D + h + m + s
}
function changeDateNumber(num) {
  num = parseInt(num)
  return num < 10 ? `0${num}` : num
}

function priceInit(price, len = 18, isString = true) {
  let pow = Math.pow(10, len)
  let num = new Number(price / pow)
  return isString ? num.toLocaleString() : num.toFixed()
}
function numberSring(num) {
  return new Number(num).toLocaleString()
}
function sringNumber(num) {
  if (!num) return ''

  if (`${Number(num)}`.indexOf('e') == -1) return `${num}`
  return transferToNumber(num, false)
}
function isp(inputNumber) {
  if (!inputNumber) return inputNumber

  if (isNaN(inputNumber)) {
    return inputNumber
  }
  inputNumber = '' + inputNumber
  inputNumber = parseFloat(inputNumber)
  let eformat = inputNumber.toExponential() // 转换为标准的科学计数法形式（字符串）
  let tmpArray = eformat.match(/\d(?:\.(\d*))?e([+-]\d+)/) // 分离出小数值和指数值
}
function transferToNumber(inputNumber, isSub = true) {
  if (!inputNumber) return inputNumber

  if (isNaN(inputNumber)) {
    return inputNumber
  }
  let number = BigNumber(inputNumber)
  number = number.toFixed()
  let len = number.length
  if (number.indexOf('.') == -1 || len <= 4) return number
  if (isSub) {
    let i = number.indexOf('.')
    let k = zeroNumber(number)
    number =
      number.substring(0, i + 2) +
      `${`{${k}}`}` +
      number.substring(k + i + 2, k + i + 2 + 3)
  }
  return number
}
function zeroNumber(z) {
  let zArr = z.split('')
  let k = 0
  zArr.reduce((pre, cur) => {
    if (pre == '0' && cur == '0') k += 1
    return cur
  })
  return k
}

 export function toFormat(num, decimal = 4) {
  let x = BigNumber(num)
  let n = decimal == 0 || x.isInteger() ? x.toFormat() : x.toFormat(decimal)

  return n
}

export function setKeyLink(sid){
	let md5_sid = md5.hex_md5(sid)
	let key = '',
		iv = ''
	for (let i in md5_sid) {
		if (i % 2 == 1) key += md5_sid[i]
		if (i % 2 == 0) iv += md5_sid[i]
	
	}
	return {
		key,
		iv
	}
}

export function getmm(num=16){
	let chars = [0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
	let nums="";
	for(let i=0;i<num;i++){//这里是几位就要在这里不改变
	let id = parseInt(Math.random()*61);
	nums+=chars[id];
	}
	return nums;
}

function decimalPlaces(num, decimal = 4) {
  let x = BigNumber(num)
  return x.decimalPlaces(decimal)
}

const formatNumber = (n) => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function formatTimetimestamp(timestamp, format) {
  const formateArr = ['Y', 'M', 'D', 'h', 'm', 's']
  let returnArr = []
  let date = new Date(timestamp) //13位的时间戳,    如果不是13位的,  就要乘1000,就像这样 let date = new Date(timestamp*1000)
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds()
  returnArr.push(year, month, day, hour, minute, second)
  returnArr = returnArr.map(formatNumber)
  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i])
  }
  return format
}

function getShortText(data, direction = 'center', l = 5, r = 4) {
  if (!data || data.length <= 9) return data
  if (typeof data != 'string') return data
  let text = ''
  if (direction == 'center') {
    text = `${data.substring(0, l)}...${data.substring(
      data.length - r,
      data.length
    )}`
  } else if (direction == 'left') {
    text = `.....${data.substring(data.length - 10, data.length)}`
  }
  return text
}
function getFirstName(text) {
  let t = text.substring(0, 1)
  return t.toUpperCase()
}
 export function formatData(num, decimal = 4) {
  num = num.toString()
  let dIndex = num.indexOf('.')
  let str = num.substring(dIndex + 1, num.length)
  // console.log('dIndex',dIndex)
  if (dIndex !== -1 && str > 4) {
    num = num.substring(0, decimal + dIndex + 1)
  } else {
    num = num.substring(0)
  }
  return num
}

//  export function formatData(ndata, l = 4, r, direction) {
//   if (!ndata) return ndata
//   var regu = /^[+-]?([0-9]*\.?[0-9]+|[0-9]+\.?[0-9]*)([eE][+-]?[0-9]+)?$/
//   if (regu.test(ndata)) {
//     let ndataSring = ndata.toString()
//     let dIndex = ndataSring.indexOf('.')
//     if (dIndex != -1) {
//       if (`${Number(ndata)}`.indexOf('e') == -1) {
//         if (isLastZero(ndataSring, dIndex).type) {
//           return isLastZero(ndataSring, dIndex).numberText
//         }
//         return formatDecimal(ndata, l)
//       } else {
//         return transferToNumber(ndata)
//       }
//     } else {
//       return parseFloat(ndata)
//     }
//   } else {
//     return getShortText(ndata, direction, l, r)
//   }
// }
function isLastZero(ndataSring, dIndex) {
  let info = {
    type: false,
    numberText: '',
  }
  let t = ndataSring.substring(dIndex + 1, ndataSring.length)
  if (Number(t) == 0)
    return (info = { type: true, numberText: parseInt(ndataSring) })
  let aLen = dIndex + 5
  let bLen = dIndex + 6

  let aStr = ndataSring.substring(dIndex + 1, aLen)
  let bStr = ndataSring.substring(dIndex + 1, bLen)

  if (Number(aStr) == 0) {
    info.type = true
    info.numberText =
      ndataSring.substring(0, dIndex + 2) +
      '..' +
      ndataSring.substring(aLen - 1, aLen + 3)
  }
  if (Number(bStr) == 0) {
    info.type = true
    info.numberText =
      ndataSring.substring(0, dIndex + 2) +
      '..' +
      ndataSring.substring(bLen - 1, bLen + 3)
  }
  return info
}

// 是否在同一个周
export function isSameWeek(old,now){
	let day = 60*60*24
	let old_count = parseInt(old / day)
	let now_other = parseInt(now / day)
	return parseInt((old_count+4)/7) == parseInt((now_other+4)/7)
}

// 防抖
export function debounce(fn, delay) {
	let timer = null
	return () => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			fn.apply(this, arguments)
		}, delay)
	}
}

export function tc(name){
	let lanObj = { ...lan.Language, ...emoji.Language }
	const targetSws = Object.keys(lanObj).find(code => {
	  const translation = lanObj[code];
	  return translation.name_zh === name;
	})
	return targetSws?i18n.t(targetSws):name
}


export function checkFileType(url) {
	
	try{
		let type = null
		// 创建URL对象
		var link = new URL(url);
		 
		// 获取路径部分（去除参数）
		var path = link.pathname;
		
		// 获取路径的最后一个点之后的内容作为文件扩展名
		var extension = path.split('.').pop().toLowerCase();
		
		// 声明支持的图片和视频文件扩展名
		var imageExtensions = ['jpg', 'jpeg', 'gif', 'png'];	
		var videoExtensions = ['mp4', 'wmv', 'avi', 'mov'];	
		
		// 判断文件扩展名是否在图片扩展名数组中
		if (imageExtensions.includes(extension)) {
			type = 'image'
		}
		
		// 判断文件扩展名是否在视频扩展名数组中
		if (videoExtensions.includes(extension)) {
			type = 'video'
		}
		
		// console.log('type...', type)
		// 扩展名不在图片或视频数组中，返回null表示无法确定媒体类型
		return type
	}catch(e){
		//TODO handle the exception
		// console.log('catch...', url)
		return false
	}
}


// 处理表情转换对应语言
export const handleEmojiToLanguage = (content) => {
	
	let emojiObj = emoji.Language
	const arr = content.split('[')
	for(const item of arr) {
		const ind = item.lastIndexOf(']')
		if(ind >= 0) {
			let str = item.substring(0, ind)
			if(str) {
				str = `[${str}]`
				const targetSws = Object.keys(emojiObj).find(code => {
				  const translation = emojiObj[code]
				  for(const k in translation) {
					  if(translation[k] == str) {
						  content = content.replace(str, translation['name_'+i18n.locale])
						  break
					  }
				  }
				  return
				})
			}
		}
	}
	return content
}