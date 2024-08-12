<template>
	<ql-page ref="qlPage" class="main-class">
		<u-navbar bgColor="rgba(250, 250, 250, 0.8)" placeholder border autoBack :title="mergerTitle" @clickLeft="BackPage" ></u-navbar>
		<mergerModal style="background: #F3F3F3;" :messageList='mergerList' ></mergerModal>
	</ql-page>
</template>

<script>
	import mergerModal from '@/pages/TUIKit/components/TUIChat/message-list/merger';
	import TUIChatEngine, {
		TUIFUN
	} from "@tencentcloud/chat-uikit-engine";
export default {
	components:{
		mergerModal
	},
	data() {
		return {
			mergerList:[],
			mergerTitle:''
			
		};
	},
	onLoad(option) {
		let mergerList=getApp().globalData.mergerList
		let mergerAllList=getApp().globalData.mergerAllList
		this.mergerTitle=getApp().globalData.mergerTitle
		if(mergerList&&mergerList.length!=0){
			mergerList.forEach(item=>{
				item.payload=item.messageBody[0].payload
				item.type=item.messageBody[0].type
				item.status='success'
				item.flow='in'
				if(item.type=='TIMVideoFileElem'){
					item.payload.snapshotUrl=item.payload.thumbUrl
					item.payload.snapshotWidth=item.payload.thumbWidth
					item.payload.snapshotWidth=item.payload.thumbHeight
				}
			})
			let newList=mergerList.map(item=>new TUIFUN(item))
			this.mergerList=newList
		}
		
	},
	methods: {
	}
};
</script>
<style scoped lang="scss">
	.main-class {
		 background: #F3F3F3;
	}
</style>