<template>
	<ql-page class="flex-column create-chat-page">
		<u-navbar ref="u-navbar" placeholder border autoBack :title="title">
			<view class="font-24" slot="right" v-if="allSelector" @click="selectAll">
				{{isSelectAll? $tc('取消') : $tc('全选')}}
			</view>
		</u-navbar>
		<view ref="search-modal" class="pd-box">
			<u-search :placeholder="$tc('搜索')" v-model="searchWord" :showAction="false"></u-search>
		</view>
    
		<!-- 选择结果 -->
		<view :class="`max-width flex-align choose-box`" style="height: 160rpx" >
			<scroll-view scroll-x="true"  class="scroll-view_H ">
				<view style="display: inline-block;">
					<view class="flex-align">
						<view  v-for="user in chooseList">
							<view class="flex-column flex-center " >
								<avatar
									:key="user.userID"
									:info="user"
									w="96"
									h="96"
									:badgeBottom="0"
									:badgeRight="0"
									class="mg-lr-30 scroll-view-item_H"
									@click="clickAvatar(user)"
								>
									<imageIcon v-if="user.role && user.role !== memberRole" slot="badge" :name="user.role === ownerRole ? 'tb_qz' : 'tb_gly'" :size="30" />
								</avatar>
								<text class="font-22 u-line-1" style="max-width: 100rpx;" >{{user.remark||user.nick}}</text>
							</view>
							
						</view>
					</view>
				</view>
				
				
			</scroll-view>
		</view>
		
		<scroll-view scroll-y="true" style="height: 69vh;" class="user-list">
			<userOption
				v-for="user in filterUserList"
				:key="user.userID"
				:info="user"
				:selected="chooseList.find(choose => choose.userID === user.userID) ? true : false"
				class="mb-30"
				@clickRadio="clickRadio(user)"
			/>
		</scroll-view>

		<view class="craate-bottm max-width font-30 pd-lr-20 flex-justify-end flex-align">
			<btn btnType="error" w='200' h='80' shape='square' class="mr-12" :text="$tc('取消')" @click="clickCancel" />
			<btn w='200' h='80' shape='square' :disabled="chooseList.length===0" :text="submitBtnText" @click="clickSubmit" />
		</view>
	</ql-page>
</template>

<script>
	import avatar from '@/components/avatar'
	import imageIcon from '@/components/image-icon'
	import userOption from './components/userOption'
	import confirmModal from '@/components/confirm-modal'
	export default {
		components: { avatar, userOption, imageIcon, confirmModal },
    props: {
			title: {
				type: String,
				required: true,
			},
			userList: {
				type: Array,
				required: true,
			},
			submitBtnText: {
				type: String,
				required: true,
			},
			allSelector: {
				type: Boolean,
				default: false,
			},
    },
		data() {
			return {
			  showConfirmModal: false,
				ownerRole: uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER,
				memberRole: uni.$chatKit.TUIChatEngine.TYPES.GRP_MBR_ROLE_MEMBER,
				searchWord: '',
				chooseList:[],
				isSelectAll: false
			};
		},
		computed: {
			filterUserList() {
				let {searchWord,userList}=this
				if(!searchWord){
					return userList
				}else{
					return this.filterSearch(searchWord, userList)
				}
				// return this.userList.filter(user =>{
				// 	let t=user.remark||user.nick||user.userID
				// 	let isHas=t.indexOf(searchWord)!=-1
				// 	if(user.nick&&!isHas)isHas=user.nick.indexOf(searchWord)!=-1
				// 	if(user.userID&&!isHas)isHas=user.userID.indexOf(searchWord)!=-1
				// 	return isHas
				// })
			},
		},
		methods: {
			clickAvatar(user) {
				this.clickRadio(user)
			},
			clickRadio(user){
				if (this.chooseList.find(choose => choose.userID === user.userID)) {
					this.chooseList = this.chooseList.filter(choose => choose.userID !== user.userID)
				} else {
					this.chooseList = [...this.chooseList, user]
				}
				this.$emit('change', this.chooseList)
			},
			clickSubmit() {
				this.$emit('clickSubmit')
			},
			clickCancel(){
				this.$emit('clickCancel')
			},
			selectAll(){
				if(this.isSelectAll){
					this.chooseList = [];
				}else{
					this.chooseList = this.userList;
				}
				this.$emit('change', this.chooseList);
				this.isSelectAll = !this.isSelectAll;
			}
		},
		watch: {
			chooseList(newValue, oldValue) {
				if(newValue!=this.userList){
					this.isSelectAll = false;
				}
			}
		},
	};
</script>
<style scoped lang="scss">
.create-chat-page {
	height: 100vh;

	.choose-box {
		background: #f7f7fc;
		box-sizing: border-box;
		overflow-x: scroll;
		transition: 0.1s;
		display: block;
		white-space: nowrap;
		.scroll-view_H {
			white-space: nowrap;
			width: 100%;
			height: 100%;
			::v-deep {
				.uni-scroll-view {
					display: flex;
					align-items: center;
					.uni-scroll-view-content {
						height: max-content;
					}
				}
			}
			.scroll-view-item_H {
				overflow: hidden;
				display: inline-block;
			}
		}
	}

	.user-list {
		// flex: 1;
		overflow: scroll;
		background-color: #fff;
	}

	.craate-bottm {
		height: 220rpx;
		background: rgba(255, 255, 255, 1);
		box-shadow: 0px -2rpx 48rpx rgba(0, 0, 0, 0.04);
	}

}
</style>