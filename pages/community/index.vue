<template>
	<ql-page>
		<u-navbar placeholder border :title="$tc('社区')" leftIcon=''>
		</u-navbar>
		<view class="flex-column" v-for="group in comList">
			<view :class="['max-width pd-lr-20 h120 flex-between white-bg', index==group.length-1? 'mb-20': '']"
			 v-for="(item,index) in group" :key="item.id" @click="jumpPage(item)" >
				<view class="flex-align font-32" >
					<view class="pd-lr-10 mr-10 flex-center">
						<image style="width:46rpx; height:46rpx;" :src="item.icon"></image>
					</view>
					<text>{{$tc(item.name)}}</text>
				</view>
				
				<iconImage size='20' name='an_jty'></iconImage>
				
			</view>			
		</view>
	</ql-page>
</template>

<script>
	import iconImage from '@/components/image-icon/index'
export default {
	components:{
		iconImage
	},
	data() {
		return {
			// comList:[
			// 	{name:'朋友圈',cls:'mb-20',type:'',url:'',icon:'tb_pyq'},
			// 	{name:'短视频',cls:'',type:'',url:'',icon:'tb_dsp'},
			// 	{name:'直播',cls:'',type:'',url:'',icon:'tb_zb'},
			// 	{name:'游戏',cls:'mb-20',type:'',url:'',icon:'tb_yx'},
			// 	{name:'附近的人',cls:'mb-20',type:'',url:'',icon:'tb_fjdr'},
			// 	{name:'购物',cls:'',type:'',url:'',icon:'tb_sd'},
			// 	{name:'服务',cls:'',type:'',url:'',icon:'tb_fw'},
			// ]
			comList:[],
			getComListTimes: 0
		};
	},
	onShow() {
		this.getComList();
		this.setTabbar();
	},
	methods: {
		jumpPage(item) {
			let {link,name} = item
			if(!link) return
			uni.navigateTo({
				url: `/pages/community/views/webview?url=${link}&&name=${this.$tc(name)}`
			})
		},
		// 数组分组
		abilitySort(arr, property) {
		  let map = {};
		  for (let i = 0; i < arr.length; i++) {
		    const ai = arr[i];
		    if (!map[ai[property]]) map[ai[property]] = [ai];
		    else map[ai[property]].push(ai);
		  }
		  let res = [];
		  Object.keys(map).forEach((key) => {
		    res.push({ [property]: key, data: map[key] });
		  });
		  return res;
		},
		getComList(){
			this.$http.app_discovery.list({
				page: 1,
				size: 100,
				channel: this.channel
			}).then(res=>{
				this.getComListTimes = 0;
				let dataList = []
				let data = res.data.list.filter(itm=>itm.status==1)
				const sortList = this.abilitySort(data,'type')
				sortList.forEach(item=>{
					let newList = item.data.sort((a,b)=>{
						return a.order - b.order
					})
					dataList.push(newList)
				})
				this.comList = dataList;
			}).catch(err=>{
				this.getComListTimes += 1;
				if(this.getComListTimes<3){
					this.getComList();
				}else{
					this.getComListTimes = 0;
				}
			})
		}
	}
};
</script>
<style scoped lang="scss">
	.page-box{
		background: #f5f5f5;
	}
</style>