<template>
	<u-popup :show="isShow"  :round="10" mode="center" @close="close" bgColor='transparent'  >
		<view class="shot-box">
			
		<view class="">
		<view class="option-view pd-box flex-column" v-if="screenInfo"  >
				
			<view class="title font-32 flex-center">
				{{$tc(title)}}
			</view>


			<!-- 视频容器 -->
			<view class="max-width pos-relative" v-if="screenInfo.imgBlob&&screenInfo.info.fileFun=='sendVideoMessage'" @click="handlerVideoPlay(screenInfo.imgBlob)" >
				<image class="mb-20" style="width: 100%; height: 400rpx;" :src="videoImageUrl" />
				<Icon height='50px'
		width='50px'
        class="video-play"
        :file="playIcon" ></Icon>
			</view>
			

			<!-- <video class="mb-20" style="width: 100%;height: 400rpx;"
				
				:src="screenInfo.imgBlob"></video> -->
			<view v-else-if="screenInfo.info.fileFun=='sendFileMessage'" class="flex-align mb-20">
				<imageIcon size='150' :name="getIconByExtension(screenInfo.info.payload
.file.name)" />
				<view class=" flex-column ml-20 ">
					<text class="mb-10">{{screenInfo.info.payload
	.file.name}}</text>
					<text class="blue-color">{{formatFileSize(screenInfo.info.payload
	.file.size)}}</text>
				</view>

			</view>
			<image v-else class="mb-20" style="width: 100%;height: 400rpx;" :src="screenInfo.imgBlob" />
			<text class=" font-32 mb-20 pd-lr-20">{{$tc('说明')}}</text>
			<view class="pd-tb-20 has-border">
				<u--textarea :placeholder="$tc('请输入内容')" border='bottom' v-model="value" :focus='isFocus'
					@linechange='onLinechange' :adjustPosition='false' maxlength='-1' :height='areaHeight+"rpx"'></u--textarea>
			</view>

			<view class="flex-justify-end mt-30">
				<btn :text="$tc('取消')" btnType='disabled' shape='square' w='120' h='70' @click="close" class="mr-30"></btn>
				<btn :text="$tc('发送')" shape='square' w='120' h='70' @click="submit"></btn>
			</view>
		</view>
		</view>
		</view>
	</u-popup>
</template>

<script>
	import {
		fileType
	} from "@/const";
	import { ListMixin } from '@/mixin/list';
	import store from "@/store/index.js"
	import Icon from "@/pages/TUIKit/components/common/Icon.vue";
	import playIcon from "@/pages/TUIKit/assets/icon/video-play.png";
	import {
		formatFileSize
	} from '@/utils/util'
	import TUIChatEngine, {
		TUIStore,
		StoreName,
		TUITranslateService,
		IMessageModel,
	} from "@tencentcloud/chat-uikit-engine";
	let plugin=null
	// #ifdef APP
	 plugin=uni.requireNativePlugin('neoceansoft-videoThumbnail')
	// #endif
	export default {
		components:{
			Icon
		},
		props: {
			isShow: {
				type: Boolean,
				default: false
			},
			screenInfo: {
				type: Object || null,
				default: null
			},
			title: {
				type: String,
				default: '发送截图'
			}
		},
		data() {
			return {
				value: '',
				isFocus: false,
				formatFileSize,
				lineCount: 1,
				areaHeight: 35,
				isQuote: false,
				playIcon,
				quoteMessage: null,
				videoImageUrl:''
			};
		},
		watch:{
			isShow(newVal,oldVal){
				if(newVal){
					let {screenInfo}=this
					if(screenInfo.info.fileFun=='sendVideoMessage'){
						console.log('screenInfo',screenInfo)
						let frameUrl=screenInfo.imgBlob
						// #ifdef APP
						frameUrl=plus.io.convertLocalFileSystemURL(frameUrl)
						// #endif
						plugin.getFrame(frameUrl,1,(res)=>{
							getApp().globalData.videoInfo=res.imagePath
							this.videoImageUrl=res.imagePath
						})
					}
					this.$nextTick(()=>{
						this.isFocus=true
					})
				}
			}
		},
		mounted() {
			TUIStore.watch(StoreName.CHAT, {
				quoteMessage: (options) => {
					this.isQuote = options?.message && options?.type === "quote" || false
					if (options?.message && options?.type === "quote") {
						console.log('options.message', options.message)
						let {
							message
						} = options
						let messageAbstract=[
							
						]
						let reply = {
							messageReply: {
								"messageAbstract": this.quoteContentText(message)._quoteContentText,
								"messageSender": message.nick,
								"messageID": message.ID,
								"messageType": this.quoteContentText(message)._type,
								"messageTime": message.time,
								"messageSequence": message.sequence,
								"version": 1
							}
						}

						console.log('messageReply', reply)
						this.quoteMessage = reply;
					} else {
						this.quoteMessage = {};
					}
				},
			});
		},
		methods: {
			close() {
				this.$emit('closeModal');
				this.value = ''
			},
			quoteContentText(quoteMessage) {
				let robj = {
					_quoteContentText: "",
					_type: -1
				}

				switch (quoteMessage.type) {
					case TUIChatEngine.TYPES.MSG_MERGER:
						robj._type = 0;
						robj._quoteContentText='[聊天记录]'
						break;
					case TUIChatEngine.TYPES.MSG_TEXT:
						robj._type = 1;
						robj._quoteContentText=quoteMessage.payload?.text
						break;
					case TUIChatEngine.TYPES.MSG_IMAGE:
						robj._type = 3;
						robj._quoteContentText='[图片]'
						break;
					case TUIChatEngine.TYPES.MSG_AUDIO:
						robj._type = 4;
						robj._quoteContentText='[语音]'
						break;
					case TUIChatEngine.TYPES.MSG_VIDEO:
						robj._type = 5;
						robj._quoteContentText='[视频]'
						break;
					case TUIChatEngine.TYPES.MSG_FILE:
						robj._type = 6;
						robj._quoteContentText='[文件]'
						break;
					case TUIChatEngine.TYPES.MSG_CUSTOM:
						robj._type = 2;
						if(quoteMessage.payload.description == "business" && quoteMessage.payload.extension == "business"){
						        robj._quoteContentText = "[个人名片]";
						      }
						      else{
						        robj._quoteContentText ='[自定义]';
						      }
						break;
					default:
					robj._quoteContentText='[消息]'
						robj._type = -1;
						break;
				}
				return robj;
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

			getFileExtension(filePath) {
				if(!filePath)return filePath
				const parts = filePath.split('.');
				return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
			},
			onLinechange(val) {
				let {
					lineCount,
					heightRpx
				} = val.detail
				if (lineCount <= 5) {
					this.areaHeight = val.detail.heightRpx
				} else {
					let lineH = heightRpx / lineCount
					this.areaHeight = lineH * 5
				}
			},
			handlerVideoPlay(videoUrl)  {
				getApp().globalData.videoUrl=videoUrl
			  uni.navigateTo({
			    url: `/pages/TUIKit/components/TUIChat/video-play`,
			  });
			},
			submit() {
				let {
					value,
					screenInfo,
					quoteMessage
				} = this
				let newValue=ListMixin.methods.maskSensitiveInfo(value,store.state.sensitiveData)
				this.$emit('submit', {
					text: newValue,
					screenInfo,
					quoteMessage
				});
				this.close()
			}
		}
	};
</script>
<style scoped lang="scss">
	.option-view {
		width: 90vw;
	}
	.shot-box{
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		padding-top: 150rpx;
	}
	.video-play{
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%,-50%);
	}
	.title {
		height: 100rpx;
	}
</style>