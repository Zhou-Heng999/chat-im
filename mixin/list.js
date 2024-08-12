 import {
	formatDate,
	decimal_place,
	loginTX
} from '@/utils/util.js';
import env from '@/utils/env.js'
import uniCopy from '@/utils/uni-copy.js'
// import {
// 	TUIChatKit,
// 	genTestUserSig
// } from "@/pages/TUIKit";
import {
	TUILogin
} from "@tencentcloud/tui-core";
 // import COS from 'cos-nodejs-sdk-v5';
  // const COS = require('cos-nodejs-sdk-v5');
  // import COS from 'cos-js-sdk-v5';
import TUIChatEngine,{
	TUITranslateService,
	TUIConversationService,
	TUIStore,
	StoreName,
	TUIChatService
} from "@tencentcloud/chat-uikit-engine";
let cosInfo=null
import {
	config
} from '@/const'
import appData from '@/const/app.json'
console.log('appData',appData)
import Vue from "vue";
export const ListMixin = {
	data() {
		return {
			redColor: '#E55A60',
			greenColor: '#30AD83',
			blueColor: '#3DBDFE',
			yellowColor: "#ffab2a",
			titleColor: '#15132b',
			channel: appData.channel,
			appName:appData.appName,
			powerUserList: [],
			appSettingList: [],
			powerGetTimes: 0,
			getAppSettingTimes: 0,
			getSensitiveTimes: 0
		}
	},
	computed: {
		userInfo() {
			return this.$store.state.userInfo;
		},
		isPc() {
			const systemInfo = uni.getSystemInfoSync();
			return systemInfo.platform == 'windows';
		},
		ossClient() {
			return this.$store.state.ossClient;
		},
		ossInfo() {
			return this.$store.state.ossInfo;
		},
		platform(){
			return this.$store.state.platform;
		},
		isPowerUser(){
			return this.$store.state.isPower;
		},
		keyboardHeight(){
			return this.$store.state.keyboardHeight;
		},
		editMsgContent(){
			return this.$store.state.editMsgContent;
		}
	},
	onShow(){
		// #ifdef H5
		let page = uni?.$u?.pages()||''
		if(page&&page.length>1){
			let {query}=this.$route
			let pageRoute=`/${page[page.length-1].route}`
			if(pageRoute=='/pages/index/index')return
			let params  =new URLSearchParams(query)
			if(params.toString()){
				pageRoute+=`?${params.toString()}`
			}
			uni.setStorageSync('lastPage',pageRoute)
		}
		// #endif
		
	},
	onUnload() {},

	methods: {
		sendFirstMsg(userID) {
			let isAllowAny = false
			uni.$chatKit.chat.getUserProfile({
			  userIDList: [`${userID}`]
			}).then(function(res) {
				let type = res.data[0].allowType;
				isAllowAny = type == 'AllowType_Type_AllowAny'
				if(isAllowAny){
					let message =TUIChatEngine.chat.createCustomMessage({
						to:userID,
						conversationType:'C2C',
						payload:{
							data: '我们是朋友了', 
							description: 'newFriends', 
							extension: 'newFriends'
						},
					})
					TUIChatService.sendCustomMessage(message)
				}
			})
		},
		unWatchStore(){
			this.$store.commit('setUnWatch',true)
			setTimeout(()=>{
				this.$store.commit('setUnWatch',false)
			},1000)
			console.log(9999)
		},
		filterSearch(substring, array) {
		  return array.filter(item => {
		    const nick = item.nick ? item.nick.toLowerCase() : item.profile?.nick? item.profile.nick.toLowerCase(): "";
		    const userID = item.userID ? item.userID.toLowerCase() : "";
		    const remark = item.remark ? item.remark.toLowerCase() : "";
			const name = item.name ? item.name.toLowerCase() : "";
		    const lowerCaseSubstring = substring.toLowerCase();
		    return nick.includes(lowerCaseSubstring) ||
		           userID.includes(lowerCaseSubstring) ||
		           remark.includes(lowerCaseSubstring) ||
				   name.includes(lowerCaseSubstring);
		  });
		},
		getRequest() {
		         var url = decodeURIComponent(location.search);
		
		         var theRequest = new Object();
		          if (url.indexOf("?") != -1) {
		            var str = url.substr(1);
		            var strs = str.split("&");
		            for(var i = 0; i < strs.length; i ++) {
		                theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
		            }
		           }
		          return theRequest;
		    },
		BackPage() {
			let page = uni.$u.pages()
			if (page.length == 1) {
				history.back()
			} else {
				uni.navigateBack()
			}
		},
		sendMsgError(obj){
				this.$http.app_user.errlog({
					log:JSON.stringify(obj)
				}).then(res=>{
					console.log('onSendMsgError===',res)
				})
		},
		toPage(url) {
			if (url) {
				uni.navigateTo({
					url
				})
			} else {
				uni.showToast({
					icon: 'none',
					title: '敬请期待'
				})
			}
		},
		setUserMsg(conversationID,list){
			let {userID}=this.userInfo
			uni.setStorageSync(`${userID}_${conversationID}`,list)
			
		},
		getUserMsg(conversationID,userID){
			
			return uni.getStorageSync(`${userID}_${conversationID}`)
		},
		saveHttpImage(invitImageUrl){
			let that = this;
					uni.downloadFile({
						url: invitImageUrl,
						success(res) {
							var tempFilePath = res.tempFilePath;
							
							// #ifdef APP-PLUS
							 uni.saveImageToPhotosAlbum({
							 	filePath : tempFilePath ,
							 	success: function (res3) {
							 		uni.showModal({
							 			title: that.$tc('提示'),
							 			content: that.$tc('保存成功'),
							 			confirmText: that.$tc('确定'),
							 			showCancel: false,
							 			confirmColor: '#33CCCC',
							 			success(res4) {
							 				
							 			}
							 		}) 
							 	},
							 });
							
							// #endif
							 // #ifdef H5
							var oA = document.createElement("a");
											oA.download = ''; // 设置下载的文件名，默认是'下载'
											oA.href = tempFilePath;
											document.body.appendChild(oA);
											oA.click();
											oA.remove();
							// #endif
						}
					})
				},
		getOss() {
			this.$http.app_user.costoken().then(res => {
				let credentials=res.data
				cosInfo=credentials
				let ossClient = new COS({
					getAuthorization: function(options, callback) {
						callback({
							TmpSecretId: credentials.tmpSecretID,
							TmpSecretKey: credentials.tmpSecretKey,
							SecurityToken: credentials.sessionToken,
							StartTime: credentials.startTime,
							ExpiredTime: credentials.expireTime,
						}); 
					}
				})
				this.$store.commit('setOssInfo', credentials)
				this.$store.commit('setOssClient', ossClient)
			}).catch(err=>{
				console.log('err8888',err)
			})
		},
		
		camSafeUrlEncode(str) {
			return encodeURIComponent(str)
				.replace(/!/g, '%21')
				.replace(/'/g, '%27')
				.replace(/\(/g, '%28')
				.replace(/\)/g, '%29')
				.replace(/\*/g, '%2A');
		},
		
		getUploadInfo(extName, callback) {
			// 传入文件后缀，让后端生成随机的 COS 对象路径，并返回上传域名、PostObject 接口要用的 policy 签名
			// 参考服务端示例：https://github.com/tencentyun/cos-demo/tree/main/server/post-policy
			uni.request({
			   // url: `http://192.168.3.170:9926/app_user/post-policy?ext=` + extName,
			   url: `${env.baseUrl}/app_user/post-policy?ext=` + extName,
			   method: 'GET',
			   header: {
			   	'content-type': 'application/x-www-form-urlencoded',
			   	'token': uni.getStorageSync('token') || ''
			   },
			   success: (res) => {
				   uni.showLoading({
				   	title: 'Uploading...',
					mark: true
				   })
				  callback && callback(null, res.data.data);
			   },
			   error(err) {
				  callback && callback(err);
			   },
			});
		 },
		async  uploadImage(sourceType){
			try {
				let imgUrl = ''
				const result = await this.chooseImage(sourceType);
				// 获取后缀
				const file = result.tempFiles[0];
				if (!file) return;
				// 获取要上传的本地文件路径
				var filePath = result.tempFilePaths[0];
				// 获取上传的文件后缀，然后后端生成随机 COS 路径地址
				var fileName = file.name||file.path;
				console.log('fileName',file)
				var lastIndex = fileName.lastIndexOf('.');
				var extName = lastIndex > -1 ? fileName.slice(lastIndex + 1) : '';
				let that = this;
				const uploadFilePromise = new Promise((resolve, reject) => {
				    this.getUploadInfo(extName, (err, info) => {
				        if (err) {
							uni.hideLoading()
							reject(err);
							return;
				        }
				        info.filePath = filePath;
				        this.uploadFile(info, (err, fileUrl) => {
							if (err) {
								uni.hideLoading()
								reject(err);
								return;
							}
							uni.hideLoading()
							resolve(fileUrl);
				        });
				      });
				    });
				imgUrl = await uploadFilePromise;
				return imgUrl;
			} catch (error) {
				console.error('uploadImage error', error);
				throw error;
			}
		},
		
		
		// 特权用户列表
		getPowerUser(){
			let {userInfo}=this
			if(!userInfo){
				console.log('没有用户信息')
				return
			}
			this.$http.app_user.privilege_list().then(res=>{
				this.powerGetTimes = 0;
				this.powerUserList = res.data.list
				// console.log(666)
				let c = res.data.list.includes(userInfo.userID)
				let t={
					isPower:c,
					list:res.data.list
				}
				this.$store.commit('setPower', t)
			}).catch(err=>{
				this.powerGetTimes +=1;
				if(this.powerGetTimes<3){
					this.getPowerUser()
				}else{
					this.powerGetTimes = 0;
				}
			})
		},
		checkToken(callback){
			this.$http.app_user.privilege_list().then(res=>{
				console.log('校验')
				if(callback)callback()
			}).catch((err)=>{
				console.log('err',err)
				uni.reLaunch({
					url:'/pages/login/index'
				})
			})
		},
		// 渠道限制配置
		getAppSettingList(){
			let {userInfo}=this
			if(!userInfo){
				console.log('没有用户信息')
				return
			}
			this.$http.app_user.app_setting_list().then(res=>{
				this.getAppSettingTimes = 0
				// console.log('app_setting_list...', res)
				this.appSettingList = res.data.list
			}).catch(err=>{
				this.getAppSettingTimes += 1;
				if(this.getAppSettingTimes<3){
					this.getAppSettingList();
				}else{
					this.getAppSettingTimes = 0;
				}
			})
		},
		
		// 添加好友权限
		canAddUser() {
			const settingList = this.appSettingList
			const supermanList = this.powerUserList
			const imSuperman = this.isPowerUser
			
			let forbid_normal_user_friend_each_other = false;   //禁止普通用户添加普通用户
			let forbid_normal_user_friend_privilege = false;    //禁止普通用户添加特权用户
			let forbid_privilege_user_friend_privilege = false; //禁止特权用户添加特权用户
			
			for(let i = 0; i < settingList.length; i++){
				const item = settingList[i];
			
				if(item.key == "forbid_normal_user_friend_each_other"){
				  if(item.val == "on"){
					forbid_normal_user_friend_each_other = true;
				  }
				}
				else if(item.key == "forbid_normal_user_friend_privilege"){
				  if(item.val == "on"){
					forbid_normal_user_friend_privilege = true;
				  }
				}
				else if(item.key == "forbid_privilege_user_friend_privilege"){
				  if(item.val == "on"){
					forbid_privilege_user_friend_privilege = true;
				  }
				}
				else if(item.key == "forbid_create_group"){
				  if(item.val == "on"){
					forbid_create_group = true;
				  }
				}
			}
			
			let userIsSuperman = false;
			if(supermanList.indexOf(this.userInfo.userID) >= 0){
				userIsSuperman = true
			}
			
			//双方均为普通用户
			if(!imSuperman && !userIsSuperman && forbid_normal_user_friend_each_other){
				return false
			}
			
			//自己为普通用户,对方为特权用户
			if(!imSuperman && userIsSuperman && forbid_normal_user_friend_privilege){
				return false
			}
			
			//双方均为特权用户
			if(imSuperman && userIsSuperman && forbid_privilege_user_friend_privilege){
				return false;
			}
			  
			return true
		},
		
		// 创建群聊权限
		canCreateGroup() {
			const imSuperman = this.isPowerUser
			if(imSuperman){
				return false
			}
			
			const settingList = this.powerUserList
			
			let forbid_create_group = true               //禁止用户建群
			
			for(let i = 0; i < settingList.length; i++){
				const item = settingList[i]
			
				if(item.key == "forbid_create_group"){
			
				  if(item.val == "off"){
					forbid_create_group = false
					break
				  }
				}
			}
			
			return forbid_create_group
		},
		
		
		uploadFile(opt, callback) {
			var formData = {
			   key: opt.cosKey,
			   policy: opt.policy, // 这个传 policy 的 base64 字符串
			   success_action_status: 200,
			   'q-sign-algorithm': opt.qSignAlgorithm,
			   'q-ak': opt.qAk,
			   'q-key-time': opt.qKeyTime,
			   'q-signature': opt.qSignature,
			};
			// 如果服务端用了临时密钥计算，需要传 x-cos-security-token
			if (opt.securityToken) formData['x-cos-security-token'] = opt.securityToken;
			uni.uploadFile({
			   url: opt.cosHost, //仅为示例，非真实的接口地址
			   filePath: opt.filePath,
			   name: 'file',
			   formData: formData,
			   success: (res) => {
				  if (![200, 204].includes(res.statusCode)) return callback && callback(res);
				  var fileUrl = opt.cosHost + '/' + this.camSafeUrlEncode(opt.cosKey).replace(/%2F/g, '/');
				  callback && callback(null, fileUrl);
			   },
			   error(err) {
				  callback && callback(err);
			   },
			});
		 },
		
		//  async  uploadImage(sourceType){
		// 	 try {
		// 	        const result = await this.chooseImage(sourceType);
		// 	        const file = result.tempFiles[0];
		// 	        const uploadResult = await this.uploadFile(file);
		// 			let imageUrl=`https://${uploadResult.Location}`
		// 	        return imageUrl; 
		// 	    } catch (error) {
		// 	        console.error('uploadImage error', error);
		// 	        throw error;
		// 	    }
		// },
		chooseImage(sourceType) {
			let that = this
		    return new Promise((resolve, reject) => {
		        uni.chooseImage({
		            count: 1,
					sourceType,
		            success(result) {
						let resSize = result.tempFiles[0].size;
						if (resSize > 1048576) {
							uni.showToast({
								title: that.$tc("图片不能超过1MB"),
								icon: 'none',
							});
							reject('overSize!');
							return
						}
		                resolve(result);
		            },
		            fail(error) {
		                reject(error);
		            }
		        });
		    });
		},
		sumArr(arr){
			if(!arr)return
			let newArr=arr.split(/[.]/)
			let k=parseInt(newArr[0])*100+parseInt(newArr[1])*10+parseInt(newArr[2])
			return k
		},
		updateApp(){
			// 热更新
			// #ifdef APP-PLUS  
			let timestamp = new Date().getTime();
			let {userInfo,appName}=this
			let that=this
			// if(!userInfo)return
			console.log('1111',`${env.hotUpdate}/${appName}/config.json?t=${timestamp}`)
			plus.runtime.getProperty(plus.runtime.appid, function(widgetInfo) {
			    uni.request({  
			        url: `${env.hotUpdate}/${appName}/config.json?t=${timestamp}`,
					header: {
						'content-type': 'application/x-www-form-urlencoded'
					},
			        success: (result) => {
						// let platformName=that.$store.state.platform=='android'?'/android':''
						let {urlType,version,name}=result.data
						console.log('aaa1',result.data)
						let {platform}=uni.getSystemInfoSync()
						let widgetVer=that.sumArr(widgetInfo.version)
						let upVersion=that.sumArr(version)
						console.log('aaa2',widgetVer,upVersion)
						if(widgetVer!=upVersion){
							let url =`${env.hotUpdate}/${appName}/${urlType}/${version}.${urlType}`
							console.log('aaa3',url)
							uni.downloadFile({
							        url: url,  
							        success: (downloadResult) => {  
							            if (downloadResult.statusCode === 200) {  
											console.log('下载')
							                plus.runtime.install(downloadResult.tempFilePath, {  
							                    force: true  //是否校验版本 true不校验
							                }, function() {
												console.log('下载完成')
												uni.showModal({
													title: '提示',
													content: '版本内容有更新，是否更新并重启应用',
													confirmText: '确定',
													showCancel: false,
													confirmColor: '#33CCCC',
													success:function(res){
														if (res.confirm) {
														plus.runtime.restart();
														}
													}
												}) 
							                      //热更新要重新启动才能生效
							                }, function(e) {  
												console.log('install fail...',e)
							                });  
							            } else{
											console.log('downloadResult',downloadResult)
										}
							        },
									error:(err)=>{
										console.log('err',err)
									}
							    });
						}
			        }  
			    });  
			});  
			// #endif
		},
		// uploadFile(file){
		// 	let {apRegion,bucket,uploadDir}=this.ossInfo
		// 	const currentTimestamp = new Date().getTime();
		// 	return new Promise((reslove,reject)=>{
		// 		this.ossClient.uploadFile({
		// 			Bucket:bucket,
		// 			Region:apRegion,
		// 			Body:file,
		// 			Key: `${uploadDir}/${currentTimestamp}_${file.name}`,

		// 		}).then(reslove).catch(reject)
		// 	})
			
		// },
		
		async setCardInfo(userID, currentConversationInfo, callback){
			const userProfile=uni.getStorageSync('userInfo')
			
			console.log('currentConversationInfo',currentConversationInfo,userID)
			// if(userProfile.userID==userID){
			// 	return
			// }
			let imResponse= await TUIChatEngine.chat.checkFriend({
			  userIDList: [userProfile.userID,userID],
			})
				const { successUserIDList, failureUserIDList } = imResponse.data;
				if(successUserIDList&&successUserIDList.length!=0){
					let k=successUserIDList.findIndex(item=>item.userID==userID&&item.relation==TUIChatEngine.TYPES.SNS_TYPE_BOTH_WAY)
					// 已经是好友
					if(k!=-1){
						let chatType=currentConversationInfo.userProfile?'C2C':'GROUP'
						uni.navigateTo({
							url:`/pages/address/views/user/index?userID=${this.$setUserID(userID)}&chatType=${chatType}`
						})
					}else{
						// 不是好友
						let canAdd=false
						if(currentConversationInfo&&currentConversationInfo.groupProfile){
						 let groupInfo= await	TUIChatEngine.chat.getGroupProfile({
								groupID:currentConversationInfo.groupProfile.groupID
							})
							let {groupCustomField}=groupInfo.data.group
							if(groupCustomField&&groupCustomField.length!=0){
								let canAddInfo=groupCustomField.find(item=>item.key=='canAddFriend')
								if(canAddInfo.value){
									canAdd=JSON.parse(canAddInfo.value)
									// return
								}
							}
						}
						TUIChatEngine.chat.getUserProfile({
						  userIDList: [userID]
						}).then(res=>{
							if (callback) {
								callback({...res.data[0],canAdd})
							}
						})
					}
				}
		},
		setTabNum(){
			// 获取会话消息未读
			let totalText=''
			let totalUnreadCount = uni.$chatKit?.chat?.getTotalUnreadMessageCount()
			console.log('setTabBarBadge',totalUnreadCount)
			if(totalUnreadCount == '0'){
				uni.removeTabBarBadge({
					index:0,
				})
			}else if(totalUnreadCount>0){
				if(totalUnreadCount<99){
					totalText=totalUnreadCount
					uni.setTabBarBadge({
						index:0,
						text:`${totalUnreadCount}`
					})
				}else{
					// if(totalText!='99+'){
						uni.setTabBarBadge({
							index:0,
							text:'99+'
						})
					// }
					// totalText='99+'
					
				}
				
			}
			// console.log('a',a)
			// 获取好友申请
			uni.$chatKit?.chat?.getFriendApplicationList().then(res=>{
				let {unreadCount} = res.data
				if(unreadCount!='0'){
					uni.setTabBarBadge({
						index:1,
						text:`${unreadCount}`
					})
				}else{
					uni.removeTabBarBadge({
						index:1,
					})
				}
			})
		},
		// 复制文本
		copyText(content) {
			uniCopy({
				content,
				success: (res) => {
					uni.showToast({
						title: this.$tc('复制成功'),
						icon: 'none'
					})
				},
				error: (e) => {
					uni.showToast({
						title: e,
						icon: 'none',
						duration: 3000,
					})
				}
			})
		},
		setTextStyle(text, messageItem){
			let t=null
			if(this.isHasUrl(text)){
				t= this.setUrlText(text,messageItem)
			}else{
				t=text
			}
			t=this.onEtText(t,messageItem)
			return t
		},
		removeMentionInfo(text) {
		  const mentionPattern = /@(\w+)_{[^}]+}/g;
		  const newText = text.replace(mentionPattern, '$1');
		  return newText;
		},
		removeTip(text){
			let regex = /_{(.*?)}/g;
			text = text.replace(regex, '');
			return text
		},
		//设置@字体
		onEtText(text, messageItem) {
			let {flow}=messageItem
			// let color = flow == 'out' ? '#fff' : '#2763cc';
			let color = flow == 'out' ? '#4285F6' : '#4285F6';
			 let pat = /@([^_\s]+)_{([^#]+#[^}]+)}/g;
			
			  let replaceText = `<uni-text data-mention="$2" style="color:${color}; cursor: pointer;">@$1</uni-text>`;
			  text =text? text.replace(pat, replaceText):'';
			return text
		},

		setUrlText(url, messageItem) {
			// let flow = 'out';
			let flow = messageItem? messageItem.flow : 'out'
			// let color = flow == 'out' ? '#fff' : '#2763cc';
			let color = flow == 'out' ? '#4285F6' : '#4285F6';
			var pattern = /(https?:\/\/[^\s]+)/g;
			// var replacement = `<a href="$1" target="_blank" style="color: ${color};text-decoration: underline;">$1</a >`;
			// url = url.replace(pattern, replacement)
			url = url.replace(pattern, (match) => {
				return `<uni-text style="color: ${color};text-decoration: underline;" data-url="${match}">${match}</uni-text>`;
			});
			return url
		},
		
		jumpUrl(url){
			// #ifdef H5
				window.open(url)
			// #endif
			
			// #ifdef APP-PLUS
				plus.runtime.openURL(url)
			// #endif
		},
		
		isHasUrl(text) {
			let pattern = /(https?:\/\/[^\s]+)/g;
			return pattern.test(text)
		},

		// 前往私聊
		async toChat(userID, type = 'C2C') {
			let allPage=uni.$u.pages()
			// if(allPage.length>2){
			// 	let beforePage=allPage[allPage.length-2].route
			// 	if(beforePage=='pages/TUIKit/components/TUIChat/index'){
			// 		if(type=='C2C'){
			// 			uni.navigateBack()
			// 			return
			// 		}
					
			// 		type='C2C'
			// 	}
			// }
			// type='C2C'
			await this.generateConversation(`${type}${userID}`);
			this.routerForward(`${type}${userID}`);
		},
		uploadScreenshot(callBack) {
			let that = this
			// #ifdef H5
			document.addEventListener('paste', (pe) => {
				if (pe.clipboardData.files.length != 0) {
					pe.preventDefault()
					pe.stopPropagation()
					var data = pe.clipboardData?.files[0]
					let t = new Date(new Date()).getTime()
					var imgBlob = URL.createObjectURL(data)
					if (callBack) callBack(imgBlob, data)

				}
			});
			// #endif

		},

		routerForward(conversationID) {
			if (conversationID) {
				uni.redirectTo({
					url: '/pages/TUIKit/components/TUIChat/index'
				})
			}
		},
		generateConversation(conversationID) {
			console.log('conversationID',conversationID)
			TUIConversationService.switchConversation(conversationID).then((res) => {
				console.warn("打开会话成功===========",res);
			}).catch((err) => {
				console.warn("打开会话失败", err.code, err.msg);
			});
		},
		getChatInfo(fnName, data) {
			let promise = uni.$chatKit?.chat?.[fnName](data)
			return promise
		},
		toastText(message, type = 'success', call) {
			this.$refs.qlPage.toast({
				type,
				message: this.$tc(message),
				duration: 1000,
				complete: () => {
					if (call) call()

				}
			})
		},
		toastBox() {
			// console.log('this---',)
			// this.$options.render()
			// return this.$createElement('div', {
			//       class: ['toast-box'],
			//     }, '哈哈哈哈')
		},
		loginTX(opt, callback) {
			let that = this
			return loginTX(opt, () => {

				callback()
			})
		},
		async getUserInfo() {
			let {
				flist
			} = this
			let data = await this.$http.account.getUserInfo()
			let user_info = {
				...this.userInfo,
				...data.data
			}
			uni.setStorageSync('userInfo', JSON.stringify(user_info))
			this.$store.commit('setUserInfo', user_info)
			return new Promise((resolve, reject) => {
				resolve(user_info)
			})
		},
		//切换语言
		changeLanguage(name = this.$store.state.lan) {
			// console.log('name', name)
			this.$i18n.locale = name;
			uni.setStorageSync('lang', this.$i18n.locale)
			this.$store.commit('setLan', this.$i18n.locale)
		},
		setTabbar(){
			const tabbarList = ['1', '2', '3', '4']
			tabbarList.forEach((item, index) => {
				uni.setTabBarItem({
					index,
					text: this.$t(item),
				})
			})
		},
		saveAccount(info) {
			let accountList = this.$store.state.accountList;
			uni.$chatKit?.chat?.getUserProfile({
				userIDList:[info.userID]
			}).then(res=>{
				let data=res.data[0]
				let userInfo = {
					...info,
					avatar: data.avatar,
					nick: data.nick
				}
				if(accountList.length==0){
					let list = [];
					list.push(userInfo)
					this.$store.commit('setAccountList',list)
				}else {
					let idx = accountList.findIndex(item=>item.userID==userInfo.userID);
					if(idx<0){
						accountList.push(userInfo);
						this.$store.commit('setAccountList',accountList)
					}else {
						accountList[idx] = userInfo;
						this.$store.commit('setAccountList',accountList)
					}
				}
			})
		},
		// 敏感词
		maskSensitiveInfo(inputString,sensitiveArr) {
			let contentText = inputString;
			sensitiveArr.forEach(item=>{
				const regexPattern = item
					.split('')
					.map(char => `${char}\\s*`)
					.join('');
				// 使用正则表达式创建匹配敏感关键词的模式
				const regex = new RegExp(regexPattern, 'gi');
				// 将匹配到的敏感关键词替换成相应长度的 *
				contentText = contentText?.replace(regex, '*'.repeat(item.length));
			})
			return contentText;
		},
		getSensitiveWord() {
			this.$http.app_user.words_url().then(res=>{
				this.getSensitiveTimes = 0
				let dataUrl = res.data.url
				uni.request({
					url: dataUrl,
					success: res => {
						this.$store.commit('setSensitiveData',res.data)
					},
					fail: err => {
						console.error(`Failed to download data from ${dataUrl}:`, err)
					}
				})
			}).catch(err=>{
				this.getSensitiveTimes += 1
				if(this.getSensitiveTimes<3){
					this.getSensitiveWord();
				}else{
					this.getSensitiveTimes = 0;
				}
			})
		},
		accredit() {
			let that = this;
			let system = uni.getSystemInfoSync()
			//ios端
			if (system.platform === 'ios') {
				var avaudiosession = plus.ios.import("AVAudioSession");
				var avaudio = avaudiosession.sharedInstance();
				avaudio.requestRecordPermission(()=>{
					console.log('ios申请麦克风权限');  
				});
				var permissionStatus = avaudio.recordPermission();
				
				var AVCaptureDevice = plus.ios.import("AVCaptureDevice");
				var authStatus = AVCaptureDevice.authorizationStatusForMediaType('vide');
				// console.log("authStatus:" + authStatus);
				if (authStatus == 3 || authStatus == 0) {
					//authStatus == 0 时为初次打开相机  ios系统有默认授权弹窗
				} else {
					uni.showModal({
						title: that.$tc('提示'),
						// content: that.$tc('请打开手机相机功能（点击确定后在权限中授权相机功能）'),
						content: that.$tc('应用想访问您的相机，请点击“确定”以允许访问，若不允许，你将无法使用拍照、扫一扫等功能。'),
						confirmText:  that.$tc('确定'),
						cancelText:  that.$tc('取消'),
						success(res) {
							if (res.confirm) {
								var UIApplication = plus.ios.import("UIApplication");
								var application2 = UIApplication.sharedApplication();
								var NSURL2 = plus.ios.import("NSURL");
								var setting2 = NSURL2.URLWithString("app-settings:");
								application2.openURL(setting2);
								plus.ios.deleteObject(setting2);
								plus.ios.deleteObject(NSURL2);
								plus.ios.deleteObject(application2);
							}
						}
					});
				}
				plus.ios.deleteObject(AVCaptureDevice)
				
				if (permissionStatus==1684369017) { //永久拒绝
					uni.showModal({
						title: that.$tc('提示'),
						// content: that.$tc('请打开手机录音相关功能（点击确定后在权限中授权录音相关功能）'),
						content: that.$tc('应用想访问您的麦克风，请点击“确定”以允许访问，若不允许，你将无法使用录音、通话等功能。'),
						confirmText:  that.$tc('确定'),
						cancelText:  that.$tc('取消'),
						// showCancel: false, // 不显示取消按钮
						success(res) {
							if (res.confirm) {
								uni.openAppAuthorizeSetting()
							}
						}
					});
				} else if (permissionStatus == 1970168948) { //权限被临时拒绝  
					// 弹出提示框解释为何需要权限，可再次调用plus.android.requestPermissions申请权限  
					uni.showModal({
						title: that.$tc('提示'),
						// content: that.$tc('请打开手机录音相关功能（点击确定后在权限中授权录音相关功能）'),
						content: that.$tc('应用想访问您的麦克风，请点击“确定”以允许访问，若不允许，你将无法使用录音、通话等功能。'),
						confirmText:  that.$tc('确定'),
						cancelText:  that.$tc('取消'),
						// showCancel: false, // 不显示取消按钮
						success(res) {
							if (res.confirm) {
								uni.openAppAuthorizeSetting()
							}
						}
					});
				} else if (permissionStatus == 1735552628){ // 被允许
					
				}
				
			}else{
				//安卓端
				//获取录音权限
				plus.android.requestPermissions(['android.permission.RECORD_AUDIO'],
					(e) => {
						if (e.deniedAlways.length > 0) { //永久拒绝
							uni.showModal({
								title: that.$tc('提示'),
								content: that.$tc('请打开手机录音相关功能（点击确定后在权限中授权录音相关功能）'),
								confirmText:  that.$tc('确定'),
								cancelText:  that.$tc('取消'),
								// showCancel: false, // 不显示取消按钮
								success(res) {
									if (res.confirm) {
										uni.openAppAuthorizeSetting()
									}
								}
							});
						} else if (e.deniedPresent.length > 0) { //权限被临时拒绝  
							// 弹出提示框解释为何需要权限，可再次调用plus.android.requestPermissions申请权限  
							uni.showModal({
								title: that.$tc('提示'),
								content: that.$tc('请打开手机录音相关功能（点击确定后在权限中授权录音相关功能）'),
								confirmText:  that.$tc('确定'),
								cancelText:  that.$tc('取消'),
								// showCancel: false, // 不显示取消按钮
								success(res) {
									if (res.confirm) {
										uni.openAppAuthorizeSetting()
									}
								}
							});
						} else if (e.granted.length > 0){ // 被允许
							
						}
					})
				//获取相机和存储权限
				plus.android.requestPermissions(['android.permission.CAMERA'],
					(e) => {
					if (e.deniedAlways.length > 0) {
						// 弹出提示框解释为何需要权限，引导用户打开设置页面开启  
						uni.showModal({
							title: that.$tc('提示'),
							content: that.$tc('请打开手机相机相册功能（点击确定后在权限中授权相机相册功能）'),
							confirmText:  that.$tc('确定'),
							cancelText:  that.$tc('取消'),
							// showCancel: false, // 不显示取消按钮
							success(res) {
								if (res.confirm) {
									var Intent = plus.android.importClass("android.content.Intent");
									var Settings = plus.android.importClass(
										"android.provider.Settings");
									var Uri = plus.android.importClass("android.net.Uri");
									var mainActivity = plus.android.runtimeMainActivity();
									var intent = new Intent();
									intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
									var uri = Uri.fromParts("package", mainActivity.getPackageName(),
										null);
									intent.setData(uri);
									mainActivity.startActivity(intent);
								}
							}
						});
					} else if (e.deniedPresent.length > 0) { //权限被临时拒绝  
						// 弹出提示框解释为何需要权限，可再次调用plus.android.requestPermissions申请权限  
						uni.showModal({
							title: that.$tc('提示'),
							content: that.$tc('请打开手机相机功能（点击确定后在权限中授权相机功能）'),
							confirmText:  that.$tc('确定'),
							cancelText:  that.$tc('取消'),
							// showCancel: false, // 不显示取消按钮
							success(res) {
								if (res.confirm) {
									var Intent = plus.android.importClass("android.content.Intent");
									var Settings = plus.android.importClass(
										"android.provider.Settings");
									var Uri = plus.android.importClass("android.net.Uri");
									var mainActivity = plus.android.runtimeMainActivity();
									var intent = new Intent();
									intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
									var uri = Uri.fromParts("package", mainActivity.getPackageName(),
										null);
									intent.setData(uri);
									mainActivity.startActivity(intent);
								}
							}
						});
					} else {
						plus.android.requestPermissions(['android.permission.READ_EXTERNAL_STORAGE'], (e) => {
							if (e.deniedAlways.length > 0) { //权限被永久拒绝  
								// 弹出提示框解释为何需要权限，引导用户打开设置页面开启  
								uni.showModal({
									title: that.$tc('提示'),
									content: that.$tc('请打开相册存储功能（点击确定后在权限中授权相册存储功能）'),
									confirmText:  that.$tc('确定'),
									cancelText:  that.$tc('取消'),
									// showCancel: false, // 不显示取消按钮
									success(res) {
										if (res.confirm) {
											var Intent = plus.android.importClass(
												"android.content.Intent");
											var Settings = plus.android.importClass(
												"android.provider.Settings");
											var Uri = plus.android.importClass("android.net.Uri");
											var mainActivity = plus.android.runtimeMainActivity();
											var intent = new Intent();
											intent.setAction(Settings
												.ACTION_APPLICATION_DETAILS_SETTINGS);
											var uri = Uri.fromParts("package", mainActivity
												.getPackageName(),
												null);
											intent.setData(uri);
											mainActivity.startActivity(intent);
										}
									}
								});
							} else if (e.deniedPresent.length > 0) { //权限被临时拒绝  
								// 弹出提示框解释为何需要权限，可再次调用plus.android.requestPermissions申请权限  
								uni.showModal({
									title: that.$tc('提示'),
									content: that.$tc('请打开相册存储功能（点击确定后在权限中授权相册存储功能）'),
									confirmText:  that.$tc('确定'),
									cancelText:  that.$tc('取消'),
									// showCancel: false, // 不显示取消按钮
									success(res) {
										if (res.confirm) {
											var Intent = plus.android.importClass(
												"android.content.Intent");
											var Settings = plus.android.importClass(
												"android.provider.Settings");
											var Uri = plus.android.importClass("android.net.Uri");
											var mainActivity = plus.android.runtimeMainActivity();
											var intent = new Intent();
											intent.setAction(Settings
												.ACTION_APPLICATION_DETAILS_SETTINGS);
											var uri = Uri.fromParts("package", mainActivity
												.getPackageName(),
												null);
											intent.setData(uri);
											mainActivity.startActivity(intent);
										}
									}
								});
							} else {
								//在此处可以进行操作可以使用uni.chooseImage()

							}
						})
					}
				})
			}
		},
		// 去除渠道号
		deleteChannel(str) {
			const variable = appData.channel;
			const pattern = new RegExp(`^${variable}#`); // 使用变量构建正则表达式
			return str.replace(pattern, ''); // 使用动态构建的正则表达式进行替换
		}

	}
}