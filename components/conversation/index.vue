<template>
	<!-- 多选 -->
	<u-popup :show="isShow" >
	            <view class="zf-box" >
					<view class="h80 flex-between pd-lr-20">
						<text v-if="!isCheckMore" @click="close" >{{$tc('关闭')}}</text>
						<text v-else @click="isCheckMore=false" >{{$tc('取消')}}</text>
						<text>{{$tc('请选择一个聊天')}}</text>
						<text v-if="!isCheckMore" @click="isCheckMore=!isCheckMore" >{{$tc('多选')}}</text>
						<text v-else @click="onConfrimSend" >{{$tc('完成')}}</text>
						<!-- <text @click="isCheckMore=!isCheckMore" >{{isCheckMore?'完成':'多选'}}</text> -->
					</view>
					<view class="box-tip pd-lr-20 max-width font-28 flex-align">
						{{$tc('最近聊天')}}
					</view>
					<scroll-view scroll-y style="height: 80vh;" >
						
						<view class="flex-column max-width pd-lr-20" v-for="(item,index) in conversationList" @click="onChooseItem(index)" >
							<view class="pd-tb-20 flex-align">
								<imageIcon class="mr-10" v-if="isCheckMore" width="30rpx" height="30rpx" :name="`an_g${item.isCheck?'2':'1'}`"></imageIcon>
								<avatarModal class="mr-10" :infoType='item.type' :info="item.type!='C2C'?item.groupProfile:item.userProfile" ></avatarModal>
								<text class="font-32" >{{item.type!='C2C'?item.groupProfile.name: item.userProfile.nick}}</text>
							</view>
						</view>
					</scroll-view>
	            </view>
			</u-popup>
</template>

<script>
export default {
	props: {
		isShow: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			isCheckMore:false,
			conversationList:[]
		};
	},
	mounted() {
		this.openPeoPleList()
		
		// this.$message({ message: '转发成功' })
	},
	methods: {
		close() {
			this.$emit('closeModal');
		},
		openPeoPleList(){
			uni.$chatKit.chat.getConversationList().then(res=>{
				let list=res.data.conversationList
				console.log('res.data.conversationList...',list);
				let a =[]
				list.forEach(item=>{
					item.isCheck=false
					console.log(item.groupProfile,item.userProfile);
					  if ((item.groupProfile && item.groupProfile.name !== '') || (item.userProfile && item.userProfile.nick !== '')) {
					        a.push(item);
					    }
				})
				this.conversationList=a
			})
		},
		onConfrimSend(){
			this.close()
			let list=this.conversationList.filter(item=>item.isCheck)
			this.onClickSendData(list)
		},
		onClickSendData(arr){
			console.log('chooseSend传值',arr);
			uni.showToast({
				title: this.$tc('转发成功'),
				icon: 'none',
			});
			this.$emit('chooseSend',arr)
		},
		onChooseItem(index){ 
			let {isCheckMore}=this
			if(isCheckMore){
				this.conversationList[index].isCheck=!this.conversationList[index].isCheck
				this.$forceUpdate(this.conversationList)
			}else{
				this.onClickSendData([this.conversationList[index]])
			}
			
		},
	}
};
</script>
<style scoped lang="scss">
.edit-chat{
		position: absolute;
		top: 86rpx;
		left: 0;
		height: 160rpx;
		width: 100%;
		opacity: 1;
		background: rgba(245, 245, 245, 1);
		z-index: 8;

	}
	.url-box{
		height: 90rpx;
		width: 90rpx;
		background: #fff;
		border-radius: 50%;
	}
	.zf-box{
		height: 95vh;
		width: 100%;
	}
	.box-tip{
		height: 60rpx;
		opacity: 1;
		background: rgba(245, 245, 245, 1);

	}
</style>