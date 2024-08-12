<template>
	<ql-page>
		<u-navbar placeholder border autoBack :title="$tc('切换账号')" @clickLeft="BackPage"></u-navbar>
		<view class="flex-column">
			<scroll-view style="height: 100vh;margin-bottom: 130rpx;box-sizing: border-box;" scroll-y="true"
			 :scroll-anchoring="true">
			<view v-for="(item,index) in accountList" :key="item.userID" class="flex-between h134 pd-lr-30"
				@click="choseAccount(index)">
				<view class="flex-center">
					<avatarModal :info="item" class="mr-30"></avatarModal>
					<view class="flex-column">
						<view class="font-32">
							{{item.nick}}
						</view>
						<view class="font-28 less-black">
							{{item.account}}
						</view>
					</view>
				</view>
				<view class="flex-wrap">
					<view v-if="userInfo.userID==item.userID" class="flex-center pd-lr-20">
						<imageIcon width="36rpx" height="36rpx" name="g_2"/>
					</view>
					<view v-if="userInfo.userID!=item.userID" class="flex-center pd-lr-20">
						<imageIcon @tap.native.stop="delAccount(index)" name="close" width="40rpx"
							height="40rpx"></imageIcon>
					</view>
				</view>
			</view>
			<view class="flex-align h134 pd-lr-30 ml-10" @click="addAccount">
				<imageIcon name="tb_jia1"width="70rpx" height="70rpx"></imageIcon>
				<view class="ml-40">
					{{$tc('添加账号')}}
				</view>
			</view>
			<view class="h120" ></view>
			</scroll-view>
		</view>
		<confirmModal :show.sync="showConfirmModal" :title="$tc('删除账号')" :content="$tc('删除账号将无法恢复，确定删除账号？')"
			@confirm="confirmConfirmModal" />
	</ql-page>
</template>

<script>
	import confirmModal from '@/components/confirm-modal/index'
	import  TUIChatEngine,{
		TUIStore,
		StoreName,
	} from "@tencentcloud/chat-uikit-engine";
	import CryptoJS from 'crypto-js';
	export default {
		components: {
			confirmModal
		},
		data() {
			return {
				showConfirmModal: false,
				selectIdx: -1,
				secret: '459af084b5e042dd080fa147857dac66',
				deviceId:''
			};
		},
		computed: {
			accountList() {
				return this.$store.state.accountList;
			},
			userInfo() {
				return this.$store.state.userInfo;
			}
		},
		mounted() {

		},
		methods: {
			watchChat(){
				TUIStore.watch(StoreName.CONV, {
					conversationList: this.toHomePage,
				});
			},
			toHomePage(list){
				uni.switchTab({
					url:'/pages/home/index'
				})
				uni.hideLoading()
				TUIStore.unwatch(StoreName.CONV, {
					conversationList: this.toHomePage,
				});
					
			},
			choseAccount(idx) {
				let data = uni.getSystemInfoSync();
				this.deviceId = data.deviceId
				// let userInfoData=uni.getStorageSync('userInfo')
				let info = this.accountList[idx]
				if (this.userInfo.userID == info.userID) return
				// console.log(this.accountList[idx])
				// uni.clearStorageSync()
				let {
					osName,
					model,
					appVersion
				} = this.$store.state.platform
				uni.showLoading({
					mark: true,
					title: this.$tc("正在加载")
				})
				uni.$emit('deleGroup')
				let timestamp = Math.floor(Date.now() / 1000); // 获取当前时间戳（单位：秒
				let random = Math.floor(Math.random() * 10000) + 1; // 生成一个 1 到 10000 之间的随机整数
				let a = {
					account: info.account,
					password: info.password,
					channel: this.channel,
					os: osName,
					model: model,
					imei:this.deviceId,
					version: appVersion,
					secret: this.secret,
					timestamp: timestamp,
					random: random,
				}
				let sortedKeys = Object.keys(a).filter(key => key !== 'secret').sort();
				let sortedKeyValuePairs = sortedKeys.map(key => `${key}=${a[key]}`);
				sortedKeyValuePairs.push(`secret=${a['secret']}`);
				let result = sortedKeyValuePairs.join('&');
				let sign = CryptoJS.MD5(result).toString();
				a.sign = sign
				console.log(sign,random);
				uni.$chatKit.chat.logout().then(res => {
					uni.setStorageSync('sdkappid',res.data.appid)
					this.$http.app_user.login2({
						account: a.account,
						password: a.password,
						channel: a.channel,
						os: a.os,
						model: a.model,
						imei:a.imei,
						version: a.version,
						timestamp: a.timestamp,
						sign: a.sign,
						random: a.random
					}).then(res => {
						let userInfo = res.data
						this.$store.commit('setUserInfo', userInfo);
						uni.setStorageSync('token', userInfo.token)
						this.loginTX(userInfo, () => {
							this.saveAccount({
								account: info.account,
								password: info.password,
								userID: userInfo.userID
							});
							this.$store.commit('setNowLoginInfo',{account:info.account, password: info.password})
							this.watchChat()
						})
					}).catch(err => {
						console.log('切换失败')
						uni.hideLoading();
					})

				}).catch(err => {
					console.log('切换失败')
					uni.hideLoading();
				})
			},
			setAvararInfo(item) {
				item.profile.remark = item.remark
				return item.profile
			},
			addAccount() {
				uni.navigateTo({
					url: `/pages/login/index`
				})
			},
			delAccount(idx) {
				this.selectIdx = idx;
				this.showConfirmModal = true;
			},
			confirmConfirmModal() {
				this.showConfirmModal = false
				let dataList = this.accountList;
				dataList.splice(this.selectIdx, 1)
				this.$store.commit('setAccountList', dataList)
			}
		}
	};
</script>
<style scoped lang="scss">

</style>