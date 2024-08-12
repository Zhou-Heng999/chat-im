<template>
  <view>
	  <ChangeGroupMemberPage
      :title="$tc('选择联系人')"
	  	:userList="userList"
	  	:submitBtnText="`${$tc('发送')}(${chooseList.length})`"
	  	@change="changeChooseList"
	  	@clickCancel="clickCancel"
	  	@clickSubmit="clickSubmit"
	  />
    <ModalRepostMessage
      :show.sync="showModalRepostMessage"
      :userList="chooseList"
      :url="qrCodeUrl"
      @clickSend="clickSend"
    />
  </view>
</template>

<script>
import ChangeGroupMemberPage from '@/components/change-group-member-page'
import ModalRepostMessage from './components/ModalRepostMessage'
import { TUIStore, StoreName, TUIChatService } from "@tencentcloud/chat-uikit-engine";
export default {
  components: { ChangeGroupMemberPage, ModalRepostMessage },
	data() {
		return {
			userList:[],
			chooseList:[],
      qrCodeUrl: '',
      loading: false,
      showModalRepostMessage: false,
		};
	},
	created() {
    this.qrCodeUrl = uni.getStorageSync('repost_qr_code').url
	},
  mounted() {
    uni.$chatKit?.chat?.getFriendList().then(result => {
      console.log('result.data ===', result.data)
      const friendList = result.data.map((item) => ({
        ...item.profile,
        nick: item.remark || item.profile.nick,
        conversationType: uni.$chatKit.TUIChatEngine.TYPES.CONV_C2C
      }))
      uni.$chatKit?.chat?.getGroupList().then(result => {
        const groupList = result.data.groupList.map(item => ({
          ...item,
          conversationType: uni.$chatKit.TUIChatEngine.TYPES.CONV_GROUP,
          userID: item.groupID,
          nick: item.name
        }))
        this.userList = [...friendList, ...groupList]
      })
    })
  },
	methods: {
		changeChooseList(list) {
			this.chooseList = list
		},
		clickSubmit() {
			this.showModalRepostMessage = true
		},
		clickCancel(){
			uni.navigateBack({
			  delta: 1,
	  	})
		},
    async clickSend(remark) {
      if (this.loading) {
        return
      }
	    const path = plus.io.convertLocalFileSystemURL(this.qrCodeUrl);
      plus.io.resolveLocalFileSystemURL(path, entry => {
        this.loading = true
        entry.file((file) => {
          const newF = {
            tempFilePaths: [this.qrCodeUrl],
            tempFiles: [{
              path: this.qrCodeUrl,
              size: file.size
            }]
          }
          Promise.all(this.chooseList.map(async user => {
            await TUIChatService.sendImageMessage({
              to: user.userID,
              payload: {
                file: newF,
              },
              conversationType: user.conversationType
            })

            if (remark) {
              await TUIChatService.sendTextMessage({
                to: user.userID,
                payload: {
                  text: remark,
                },
                conversationType: user.conversationType
              })
            }
            
          })).then(result => {
            console.log('result ===', result)
		        this.showModalRepostMessage = false
            this.loading = false
		        uni.showToast({
		        	title: this.$tc('发送成功'),
		        	icon: 'none',
			        mask: true
		        })
            // this.$message({ message: '发送成功' })
		        setTimeout(()=>{
		        	uni.navigateBack({
		        			delta: 1,
		        	  })			
		        },1500)
          }).catch(error => {
            this.loading = false
            this.showModalRepostMessage = false
            uni.showToast({
		        	title: this.$tc('二维码部分发送失败'),
		        	icon: 'none',
			        mask: true
		        })
            console.log('error ===', error)
          })
		    });
      })

      
    },
	}
};
</script>
<style scoped lang="scss">
	
</style>