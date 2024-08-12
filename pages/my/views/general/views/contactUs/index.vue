<template>
	<ql-page>
		<u-navbar placeholder border autoBack :title="$tc('联系我们')" @clickLeft="BackPage"></u-navbar>
		<view class="mt-100 flex-center font-36">
			{{tips}}
		</view>
	</ql-page>
</template>

<script>
	export default {
		data() {
			return {
				appSettingList:[],
				tips:'',
				getTipsTime: 0
			};
		},
		onShow() {
			this.getAppSettingList()
		},
		computed:{
			userInfo() {
				return this.$store.state.userInfo;
			}
		},
		methods:{
			getAppSettingList(){
				let {userInfo}=this
				if(!userInfo){
					console.log('没有用户信息')
					return
				}
				this.$http.app_user.app_setting_list().then(res=>{
					this.getTipsTime = 0;
					console.log('app_setting_list...', res)
					this.appSettingList = res.data.list
					this.appSettingList.forEach(item =>{
						console.log(item);
						if(item.key == "contact_us"){
							this.tips = item.val
						}
					})
					
				}).catch(err=>{
					this.getTipsTime += 1;
					if(this.getTipsTime<3){
						this.getAppSettingList();
					}else{
						this.getTipsTime = 0;
					}
				})
			},
		}
		
	}
</script>

<style lang="scss">

</style>
