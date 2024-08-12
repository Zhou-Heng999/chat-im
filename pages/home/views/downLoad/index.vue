<template>
	<ql-page class="pd-box" ref="qlPage">
		<u-navbar placeholder border autoBack>
			<view slot="left" class="mr-20">
				<imageIcon width="18rpx" height="35rpx" name="back"></imageIcon>
			</view>
		</u-navbar>
		<view class="max-width flex-column flex-center mt-80">
			<imageBox size='120' class="mr-10" :name='getIconByExtension(fileInfo.content.url)'></imageBox>
			<view class="mt-60 font-40" style="max-width: 600rpx;">{{ fileInfo.content.name }}</view>
			<view class="flex-wrap flex-center mt-40">
				<text>{{$tc('文件大小：')}}</text>
				<text>{{ fileInfo.content.size }}</text>
			</view>

			<view class="mt-100">
				<!-- <view v-if="loading" :style="{height:90+'rpx',width:500+'rpx'}" class="mt-60 mb-30 btn-primary flex-center radius-100">
					<u-loading-icon mode="semicircle" color="#fff"></u-loading-icon>
				</view > -->
				<btn v-if="!loading" w="500" class="mt-60 mb-30" :text="$tc('接收文件')" @click="goDownLoad"></btn>
				
				<view v-else style="width: 500rpx;">
					<progress class="mb-30" :percent="progressPercent" activeColor="#46aef7" stroke-width="4" />
					<btn v-if="loading" w="500" class="mt-60 mb-30" :text="$tc('取消')" @click="isShowCancel=true"></btn>
				</view>
			</view>
			
			<btn btnType="info" w="500" class="mt-20" :text="$tc('转发给朋友')" @click="forwardFile"></btn>
			
		</view>
		<confirmModal :show.sync="isShowCancel" :content="$tc('确认取消下载吗？')" @confirm="cancelDownload"></confirmModal>
		<Forward v-if="isShowForwardPanel" @closeForwardPanel='closeForwardPanel' ref="forwardModule"></Forward>
	</ql-page>
</template>

<script>
	import TUIChatEngine, {
	  TUITranslateService,
	  TUIConversationService,
	  TUIStore,
	  StoreName,
	  IMessageModel,
	  IConversationModel,
	  TUIUserService,
	  SendMessageParams
	} from "@tencentcloud/chat-uikit-engine";
	import imageBox from "@/components/image-icon/index.vue";
	import confirmModal from '@/components/confirm-modal'
	import {
		fileType
	} from "@/const";
	import Forward from "@/pages/TUIKit/components/TUIChat/forward/index.vue";
	export default {
		components: {
			imageBox,
			confirmModal,
			Forward
		},
		data() {
			return {
				fileInfo: '',
				loading: false,
				progressPercent: 0,
				dtask: null,
				isShowCancel: false,
				isShowForwardPanel:false,
			};
		},
		onLoad() {
			this.getData()
		},
		onShow() {
			
		},
		onUnload() {
			// 触发 'pages/TUIKit/components/TUIChat/index.vue' 监听的事件，关闭转发面板
			uni.$emit('closeSinForWard');
			// if(!this.dtask){
			// 	this.dtask.abort();
			// 	this.dtask = null;
			// }
		},
		methods: {
			getFileExtension(filePath) {
				const parts = filePath.split('.');
				return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
			},
			getIconByExtension(filePath) {
				const fileExtension = this.getFileExtension(filePath);

				const mappings = fileType;

				for (const mapping of mappings) {
					if (mapping.arr.includes(fileExtension)) {
						return mapping.icon;
					}
				}

				return 'tb_others';
			},
			getData() {
				this.fileInfo = uni.getStorageSync('files')
				// console.log(this.fileInfo)
			},
			goDownLoad(){
				// #ifdef APP
				this.loading = true
				this.downloadFile();
				// #endif
				
				// #ifndef APP
				this.download();
				// #endif
			},
			download() {
				console.log('download...', this.fileInfo)
				let data = this.fileInfo
				if (data.messageItem.hasRiskContent) {
					return;
				}
				
				// this.loading = true
				
				const option = {
				  mode: "cors",
				  headers: new Headers({
				    "Content-Type": "application/x-www-form-urlencoded",
				  }),
				};
				
				if (typeof window.fetch !== 'undefined') {
				  // 浏览器支持 Fetch API
				  fetch(data.content.url, option)
				    .then((res) => res.blob())
				    .then((blob) => {
				      const a = document.createElement("a");
				      const url = window.URL.createObjectURL(blob);
				      a.href = url;
				      a.download = data.content.name;
				      a.click();
					  // this.loading = false
				    });
				} else {
				  // 浏览器不支持 Fetch API
				  const a = document.createElement("a");
				  a.href = data.content.url;
				  a.target = "_blank";
				  a.download = data.content.name;
				  a.click();
				  // this.loading = false
				}
			},
			downloadFile(){
				let that = this;
				let data = this.fileInfo
				var url = data.content.url;
				this.dtask = plus.downloader.createDownload(url, {
					filename: "file://storage/emulated/0/I-talk/" + data.content.name //利用保存路径，实现下载文件的重命名
				},(d, status)=> {
					//d为下载的文件对象
					if (status == 200) {
						this.loading = false
						uni.hideLoading();
						uni.showToast({
							icon: 'none',
							title: `${that.$tc('已保存到文件夹：')}/I-talk/` + data.content.name, //保存路径
							duration: 3000,
						});
						//下载成功,d.filename是文件在保存在本地的相对路径，使用下面的API可转为平台绝对路径
						// let fileSaveUrl = plus.io.convertLocalFileSystemURL(d.filename);
						// setTimeout(()=>{
						// 	plus.runtime.openFile(d.filename); //选择软件打开文件
						// },1500)
					} else {
						//下载失败
						this.loading = false
						uni.hideLoading();
						plus.downloader.clear(); //清除下载任务
						uni.showToast({
							icon:'none',
							title: that.$tc('下载失败，请稍后重试'),
						});
					}
				})
				this.dtask.addEventListener("statechanged", (task, status) => {
					switch (task.state) {
						case 1: // 开始  
							break;
						case 2: //已连接到服务器  
							break;
						case 3: // 已接收到数据  
							let hasProgress = task.totalSize && task.totalSize > 0 //是否能获取到App大小
							if (hasProgress) {
								let current = parseInt(100 * task.downloadedSize / task.totalSize); //获取下载进度百分比
								// progressCallBack(current)
								this.progressPercent = current;
							}
							break;
						case 4: // 下载完成    
							// console.log("下载完成")
							break;
					}
				});
				this.dtask.start();
			},
			cancelDownload() {
				this.dtask.abort();
				this.loading = false;
				this.isShowCancel = false;
				uni.showToast({
					icon:'none',
					title: this.$tc('已取消'),
				});
			},
			forwardFile() {
				this.isShowForwardPanel=true
				TUIStore.update(StoreName.CUSTOM, "singleForwardMessageID", this.fileInfo.messageItem.ID);
			},
			closeForwardPanel(){
				this.isShowForwardPanel=false
			}
		},
	}
</script>

<style lang="scss">
.btn-primary{
	background:  linear-gradient(127.68deg, rgba(22, 163, 240, 1) 0%, rgba(70, 174, 247, 1) 100%);
	color:#fff;
}
.radius-100{
	border-radius: 100rpx;
}
</style>