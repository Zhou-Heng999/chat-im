<template>
	<ql-page class=' flex-column flex-between pos-relative' ref="qlPage">
		<u-navbar v-if="isShowNav" :height="isShowNav ? '':'10px'" placeholder border autoBack title="" @clickLeft="BackPage" ></u-navbar>
		<scroll-view style="height: 96vh;" scroll-y="true" :show-scrollbar="false">
			<view style="position: relative;" class="top-box" >
			<view style="position: absolute; top: 0;left: 0; width: 100%; z-index: 1;">
				<imageIcon width="100%" height="520rpx" mode="aspectFit" name="login_top"></imageIcon>
				<!-- <image width="100%" mode="widthFix" src="/static/images/login_top.png"></u-image> -->
			</view>
			
			<view class="flex-column max-width" style="position: relative; z-index: 2;">
				<view class="flex-center flex-justify-end mb-80 mt-30" :class="isShowNav ? '' : 'h60'">
					<view class='flex-center lan-box radius-30 font-22' v-if="!isShowNav" @click="changLan">
						<imageIcon class="mr-10" width="30rpx" height="30rpx" name="tb_dyy"></imageIcon>
						<text>{{$tc('语言')}}</text>
						<imageIcon class="mr-10" width="30rpx" height="30rpx" name="an_jty1"></imageIcon>
						<!-- <u-icon name="arrow-right" ></u-icon> -->
					</view>
				</view>
				<view class="max-width flex-center mb-60 flex-column">
					<imageIcon class="mb-60" width="160rpx" height="160rpx" name="logo2"></imageIcon>

					<view class="flex-end">
						<text class="font-64 mr-10 font-blod">HI</text>
						<text class="font-30">{{$tc('欢迎使用')}}{{appName}}</text>
					</view>
				</view>
				<view v-if="mode === 'login'" class='login-pd' >
					<view class="inputs mt-40 ">
						<u--form labelPosition="top" :model="form" :rules="rules" :borderBottom='false' ref="uForm" :labelStyle="{
							color:'#fff'
						}">
						<view style="height: 150rpx;" class='mb-30' >
							<u-form-item :borderBottom='false' :label="$tc('账户')" prop="account">
								<view class="input-box max-width flex-center pd-lr-20">
									<u-input color='#fff' v-model="form.account" placeholderStyle='color:#fff;font-size:30rpx;'
										:placeholder="$tc('账号 (6-12位字母数字组合)')" border="none">
										<view class="pd-lr-10" slot="prefix">
											<imageIcon width="36rpx" height="36rpx" mode="aspectFit" name="tb_zh"></imageIcon>	
										</view>
									</u-input>
								</view>
							</u-form-item>
						</view>
						<view style="height: 150rpx;">
							<u-form-item :label="$tc('密码')" :borderBottom='false' prop="password">
								<view class="input-box max-width flex-center pd-lr-20 ">
									<u-input color='#fff'  v-show="!isSeePsw" v-model="form.password" type="password"
										placeholderStyle='color:#fff;font-size:30rpx;'
										:placeholder="$tc('密码(8-20位字母数字组合)')" border="none">
										<view class="pd-lr-10" slot="prefix">
											<imageIcon width="36rpx" height="36rpx" mode="aspectFit" name="tb_mm"></imageIcon>	
										</view>
										<view class="pd-lr-10" slot="suffix">
											<imageIcon @click="isSeePsw = !isSeePsw" width="36rpx" height="36rpx" mode="aspectFit" name="tb_yj2"></imageIcon>	
										</view>
									</u-input>
									
									<u-input v-show="isSeePsw" color='#fff'  v-model="form.password"
										placeholderStyle='color:#fff;font-size:30rpx;'
										:placeholder="$tc('密码(8-20位字母数字组合)')" border="none">
										<view class="pd-lr-10" slot="prefix">
											<imageIcon width="36rpx" height="36rpx" mode="aspectFit" name="tb_mm"></imageIcon>	
										</view>
										<view class="pd-lr-10" slot="suffix">
											<imageIcon @click="isSeePsw = !isSeePsw" width="36rpx" height="36rpx" mode="aspectFit" name="tb_yj1"></imageIcon>	
										</view>
									</u-input>
								</view>
							</u-form-item>
						</view>
						</u--form>
					</view>
					
					<view class="max-width flex-center pd-lr-40">
						<btn :loading="isLoading" w="660" class="mt-60 mb-30" :text="$tc('登录')" @click="onSubmit"></btn>
					</view>
					<view class="flex-between pd-lr-30 flex-wrap font-28 dust-color w660">
						<text class="mb-20" @click="mode = 'forget'">{{$tc('忘记密码')}}</text>
						<view class="flex-wrap mb-20">
							{{$tc('账号首次登录即自动注册')}}		
						</view>
					</view>
				</view>
				<!-- {{forgetRules}} -->
				<template v-if="mode === 'forget'">
					<view class="inputs mt-40">
						<u--form labelPosition="top" :model="forgetForm" :rules="forgetRules" :borderBottom='false' ref="forgetForm" :labelStyle="{
							color:'#fff'
						}">
							<view style="height: 150rpx;">
								<u-form-item :borderBottom='false' :label="$tc('账户')" prop="userID">
									<view class="input-box max-width flex-center pd-lr-20">
										<u-input v-model="forgetForm.userID" placeholderStyle='color:#ADB5BD;font-size:30rpx;'
											:placeholder="$tc('账号 (6-12位字母数字组合)')" border="none">
											<view class="pd-lr-10" slot="prefix">
												<imageIcon width="36rpx" height="36rpx" mode="aspectFit" name="tb_zh"></imageIcon>	
											</view>
										</u-input>
									</view>
								</u-form-item>
							</view>
							<u-form-item :borderBottom='false' :label="$tc('问题')" prop="question">
								<view class="input-box max-width flex-center pd-lr-20">
									<u-input v-model="forgetForm.question" readonly placeholderStyle='color:#ADB5BD;font-size:30rpx;'
										:placeholder="$tc('请选择密保问题')" border="none">
										<view class="pd-lr-10" slot="prefix">
											<imageIcon width="36rpx" height="36rpx" mode="aspectFit" name="tb_zh"></imageIcon>	
										</view>
									</u-input>
									<view class="trigger" @click="issueVisible = true"></view>
								</view>
							</u-form-item>
							<view style="height: 150rpx;">
							<u-form-item :borderBottom='false' :label="$tc('答案')" prop="answer">
								<view class="input-box max-width flex-center pd-lr-20">
									<u-input v-model="forgetForm.answer" placeholderStyle='color:#ADB5BD;font-size:30rpx;'
										:placeholder="$tc('请输入密保答案')" border="none">
										<view class="pd-lr-10" slot="prefix">
											<imageIcon width="36rpx" height="36rpx" mode="aspectFit" name="tb_zh"></imageIcon>	
										</view>
									</u-input>
								</view>
							</u-form-item>
							</view>
							<view style="height: 150rpx;">
							<u-form-item label="666" :borderBottom='false' prop="new_password">
								<view class="input-box max-width flex-center pd-lr-20">
									<u-input v-show="!isSeePsw" v-model="forgetForm.new_password" type="password"
										placeholderStyle='color:#ADB5BD;font-size:30rpx;'
										:placeholder="$tc('新密码(8-20位字母数字组合)')" border="none">
										<view class="pd-lr-10" slot="prefix">
											<imageIcon width="36rpx" height="36rpx" mode="aspectFit" name="tb_mm"></imageIcon>	
										</view>
										<view class="pd-lr-10" slot="suffix">
											<imageIcon @click="isSeePsw = !isSeePsw" width="36rpx" height="36rpx" mode="aspectFit" name="tb_yj2"></imageIcon>
										</view>
									</u-input>
									<u-input v-show="isSeePsw" v-model="forgetForm.new_password" type="text"
										placeholderStyle='color:#ADB5BD;font-size:30rpx;'
										:placeholder="$tc('新密码(8-20位字母数字组合)')" border="none">
										<view class="pd-lr-10" slot="prefix">
											<imageIcon width="36rpx" height="36rpx" mode="aspectFit" name="tb_mm"></imageIcon>	
										</view>
										<view class="pd-lr-10" slot="suffix">
											<imageIcon @click="isSeePsw = !isSeePsw" width="36rpx" height="36rpx" mode="aspectFit" name="tb_yj1"></imageIcon>
										</view>
									</u-input>
								</view>
							</u-form-item>
							</view>
						</u--form>
					</view>
					
					<view class="max-width flex-center">
						<btn :loading="isLoading" w="660" class="mt-60 mb-30" :text="$tc('确定')" @click="onForget"></btn>
					</view>
					<view class="flex-between pd-lr-30 flex-wrap font-28 dust-color w660">
						<text class="mb-20" @click="mode = 'login'">{{$tc('立即登录')}}</text>
					</view>
				</template>
			</view>
			
			<view v-if="mode === 'login'" class="flex-center flex-wrap font-22 flex-align dust-color">
				<imageIcon class="mr-10" width="30rpx" height="30rpx" @click="isCheckServer=!isCheckServer"
					:name="`an_g${isCheckServer?2:1}`"></imageIcon>
				<text>{{$tc('您已阅读并同意')}}</text>
				<!-- <text class="b-color" @click="toPage('fuwu')">{{$tc('《服务协议》')}}</text> -->
				<!-- <text>{{$tc('和')}}</text> -->
				<text class="b-color" @click="toPage('yinsi')">{{$tc('《隐私协议》')}}</text>
			</view>
			</view>
		</scroll-view>
			
			<u-picker
				:show="showLanguage"
				keyName="name"
				:columns="columnsLanguage"
				@cancel="showLanguage = false"
				@confirm="confirmLanguage"
				closeOnClickOverlay
				@close="showLanguage = false"
				:confirmText="$tc('确认')"
				:cancelText="$tc('取消')"
			/>
			
			<u-picker 
				:show="issueVisible" 
				keyName="name" 
				:columns="columnsIssue" 
				@cancel="issueVisible = false"
				@confirm="issueConfirm" 
				closeOnClickOverlay 
				@close="issueVisible = false" 
				:cancelText="$tc('取消')"
				:confirmText="$tc('确认')" />
		
	</ql-page>
</template>

<script>
	let stime=null
	import  TUIChatEngine,{
		TUIStore,
		StoreName,
	} from "@tencentcloud/chat-uikit-engine";
	import CryptoJS from 'crypto-js';
	// import imei from '@/uni_modules/uni-imei/js_sdk/uni-imei.js';
	export default {
		data() {
			return {
				deviceId:'',
				issueVisible: false,
				columnsIssue: [
					[{
							name: this.$tc('我的生日'),
							value: '1'
						},
						{
							name: this.$tc('我的学校'),
							value: '2'
						}
					]
				],
				
				isCheckServer: false,
				isInit:true,
				form: {
					account: '',
					password: '',
				},
				rules: {
					account: [{
							type: 'string',
							required: true,
							message: this.$tc('账号 (6-12位字母数字组合)'),
							trigger: ['blur', 'change']
						},
						{
							// 自定义验证函数，见上说明
							validator: (rule, value, callback) => {
								var pattern = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9a-zA-Z]{6,12}$/;
								// 上面有说，返回true表示校验通过，返回false表示不通过
								// uni.$u.test.mobile()就是返回true或者false的
								return pattern.test(value);
							},
							message: this.$tc('账号格式为6-12位字母数字组合'),
							// 触发器可以同时用blur和change
							trigger: ['change', 'blur'],
						}
					],
					password: {
						type: 'string',
						required: true,
						message: this.$tc('请填写密码'),
						trigger: ['blur', 'change']
					}
				},
				forgetForm: {
					userID: '',
					question: '',
					answer: '',
					new_password: ''
				},
				questionIndex: '',
				forgetRules: {
					userID: [{
							type: 'string',
							required: true,
							message: this.$tc('账号 (6-12位字母数字组合)'),
							trigger: ['blur', 'change']
						},
						{
							// 自定义验证函数，见上说明
							validator: (rule, value, callback) => {
								var pattern = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9a-zA-Z]{6,12}$/;
								// 上面有说，返回true表示校验通过，返回false表示不通过
								// uni.$u.test.mobile()就是返回true或者false的
								return pattern.test(value);
							},
							message: this.$tc('账号格式为6-12位字母数字组合'),
							// 触发器可以同时用blur和change
							trigger: ['change', 'blur'],
						}
					],
					// question: {
					// 	type: 'string',
					// 	required: true,
					// 	message: this.$tc('请选择密保问题'),
					// 	trigger: ['blur', 'change']
					// },
					answer: {
						type: 'string',
						required: true,
						message: this.$tc('请输入密保答案'),
						trigger: ['blur', 'change']
					},
					new_password: {
						type: 'string',
						required: true,
						message: this.$tc('请填写新密码'),
						trigger: ['blur', 'change']
					}
				},
				isSeePsw: false,
				isLoading: false,
				columnsLanguage: [
					[
						{ name: '简体中文', value: 'zh' },
						{ name: '繁体中文', value: 'zh_tw' },
						{ name: 'English', value: 'en' },
						{ name: 'हिन्दी', value: 'hin' },
						{ name: 'Español', value: 'esp' },
						{ name: 'Português', value: 'pt' },
						{ name: 'Tiếng Việt', value: 'vi' },
					]
				],
				showLanguage: false,
				mode: 'login',
				isShowNav:false,
				secret:'459af084b5e042dd080fa147857dac66'
			};
		},
		onShow() {
			let pgaeRoute=uni.$u.pages()
			if(pgaeRoute.length>1){
				let isShowNav=pgaeRoute[pgaeRoute.length-2].route=='pages/my/views/switch/index'
				this.isShowNav=isShowNav
			}
			let nowLoginInfo=this.$store.state.nowLoginInfo;
			//判断是否将上次登录的账号密码填入框中
			if(nowLoginInfo?.account && !this.isShowNav){
				this.form.account = nowLoginInfo.account;
				this.form.password = nowLoginInfo.password;
			}
		},
		onUnload() {
			TUIStore.unwatch(StoreName.CONV, {
				conversationList: this.toHomePage,
			});
		},
		methods: {
			toPage(name) {
				let url = ''
				if(name === 'yinsi') {
					url = '/pages/my/views/general/views/protocol/index'
				}
				uni.navigateTo({
					url,
				})
			},
			changLan() {
				this.showLanguage = true
			},
			confirmLanguage(value) {
				let type = value.value[0].value;
				this.changeLanguage(type);
				this.showLanguage = false
				uni.redirectTo({
					url: '/pages/login/index'
				})
			},
			onSubmit() {
                this.$refs.uForm.validate().then(res => {
                    if(!this.isCheckServer){
                        this.toastText('请先勾选并同意协议','error')
                        return
                    }
					let data = uni.getSystemInfoSync();
					console.log('getDeviceInfo success:', data[0]);
					this.deviceId = data.deviceId
					console.log('this.deviceId',this.deviceId);
						this.login()
                }).catch(err => {
                    this.toastText('校验失败','error')
                    // uni.$u.toast('校验失败')
                })
				// 获取设备信息
				
			},
			toHomePage(list){
				console.log('会话列表end====',Date.now())
				console.log('获取会话列表总耗时====',Date.now()-stime)
				uni.switchTab({
					url:'/pages/home/index'
				})
					setTimeout(()=>{
						this.getPowerUser()
						this.getAppSettingList()
						this.getSensitiveWord()
					},1500)
					
			},
			watchChat(){
				console.log('会话列表star====',Date.now())
				stime=Date.now()
				TUIStore.watch(StoreName.CONV, {
					conversationList: this.toHomePage,
				});
			},
			
			async login() {
				
				//判断是否有登录，有就先退出
				try{
					console.log('进入登录');
					console.log('请求接口========',Date.now())
					let nowLogin = false;
					this.isLoading = true;
					if(this.isShowNav){
						this.unWatchStore()
						await uni.$chatKit.chat.logout().then(res=>{
							console.log("退出成功",res)
						}).catch(err=>{
							this.isLoading = false;
						})
					}
					this.unWatchStore()
					let {osName, model, appVersion} = this.$store.state.platform
					let timestamp = Math.floor(Date.now() / 1000); // 获取当前时间戳（单位：秒
					let random = Math.floor(Math.random() * 10000) + 1;// 生成一个 1 到 10000 之间的随机整数
					let a = {
						...this.form,
						channel: this.channel,
						os: osName,
						model: model,
						version: appVersion,
						imei:this.deviceId,
						secret:this.secret,
						timestamp:timestamp,
						random:random,
					}
					let sortedKeys = Object.keys(a).filter(key => key !== 'secret').sort();
					let sortedKeyValuePairs = sortedKeys.map(key => `${key}=${a[key]}`);
					sortedKeyValuePairs.push(`secret=${a['secret']}`);
					let result = sortedKeyValuePairs.join('&');
					let sign = CryptoJS.MD5(result).toString();
					a.sign = sign
					this.$http.app_user.login2({
						account: a.account,
						password: a.password,
						channel: a.channel,
						os: a.os,
						model: a.model,
						version: a.version,
						imei:a.imei,
						timestamp:a.timestamp,
						sign:a.sign,
						random:a.random
					}).then(res => {
						uni.setStorageSync('sdkappid',res.data.appid)
						let {userID,userSig,appid}=res.data
						console.warn('login========',appid,userID,userSig)
						let userInfo=res.data
						console.log('登录成功',userInfo.token);
						this.$store.commit('setUserInfo',userInfo);
						this.$store.commit('setToken',userInfo.token)
						// console.log('1',userInfo.token)
						uni.setStorageSync('token',userInfo.token)
						
						this.loginTX(userInfo,()=>{
							this.saveAccount({
								...this.form,
								userID: userInfo.userID
							});
							this.$store.commit('setNowLoginInfo',this.form)
							// setTimeout(()=>{
								this.watchChat()
							// },500)
						})
						
					}).catch(err=>{
						console.log('登录失败',err);
						this.isLoading = false;
						if(err?.data?.msg == "设备数量已达上限"){
							      uni.showToast({
							          title: thisInstance.$tc('设备数量已达上限'),
							        icon: 'none',
							      })
						}
					})
					
				}catch(e){
					this.sendMsgError({errorData:`${e}`})
					console.log('e',e)
					//TODO handle the exception
				}
				
			},
			
			issueConfirm(value) {
				console.log('issueConfirm...', value)
				this.forgetForm.question = value.value[0].name
				this.questionIndex = value.value[0].value
				this.issueVisible = false
			},
			onForget() {
				this.$refs.forgetForm.validate().then(res => {
					this.handleForget()
				}).catch(err => {
					console.log('validate...', err)
					this.toastText('校验失败','error')
				})
			},
			handleForget() {
				this.isLoading = true
				this.$http.app_user.reset_question({
					...this.forgetForm,
					question: this.questionIndex
				}).then(res => {
					uni.showToast({
						title: this.$tc('找回成功')
					})
					this.isLoading = false
					this.mode = 'login'
				}).catch(err=>{
					this.isLoading = false;
				})
			}
		}
	};
</script>
<style scoped lang="scss">
	.page-box {
		// background: linear-gradient(330deg, rgba(61, 156, 245, 1) 0%, rgba(158, 255, 224, 1) 100%);
		background:  rgba(0, 19, 48, 1);
		color:#fff
	}

	.lan-box {
		min-width: 184rpx;
		height: 58rpx;
		border-radius: 100rpx;
		font-size: 24rpx;
		background: rgba(237, 237, 237, .4);
		color:rgba(0, 10, 20, 1)
	}

	.b-color {
		color: #0084FF;
	}
	
	.dust-color {
		color: #ADB5BD;
	}
	
	.w660 {
		width: 660rpx;
	}
	.top-box{
		margin-top: var(--status-bar-height);
	}
	
	.inputs {
		width: 660rpx;
		// height: 400rpx;
		margin: 0 auto;
		border-radius: 40rpx;
		box-sizing: border-box;
		padding: 50rpx 30rpx 0 30rpx;
		// background: rgba(255, 255, 255, 0.2);
		// backdrop-filter: blur(4rpx);
	}

	.input-box {
		position: relative;
		border-radius: 100rpx;
		background: rgba(240, 240, 240, 0.4);
		// backdrop-filter: blur(4rpx);
		height: 94rpx;
	}

	.login-pd {
		padding: 40rpx 50rpx;
		height: 100%;
		box-sizing: border-box;
	}
	
	.trigger {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
	::v-deep .u-form-item__body__right__message{
		z-index: 99;
	}
</style>