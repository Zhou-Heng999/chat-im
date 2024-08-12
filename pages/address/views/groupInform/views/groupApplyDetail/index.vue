<template>
	<ql-page class="group-apply-detail-page">
		<u-navbar placeholder border autoBack title="" @clickLeft="BackPage" ></u-navbar>		
		<avatar :info="info" w="190" h="190" class="head">
			<imageIcon slot="badge" :name="genderIcon[info.gender] || ''" />
		</avatar>
		<view class="c1">{{ info.nick }}</view>
		<view class="c2">{{ application.groupName }}</view>
		<view class="c3">{{$tc('请求信息：')}}{{ application.note }}</view>
		<view class="pd-lr-50 c4">
			<view class="left">{{$tc('来源')}}</view>
			<view class="right">{{ c4Text }}</view>
		</view>

		<view class="pd-lr-40 btns">
			<btn w='300' h='98' shape='square' :text="$tc('同意')" @click="clickAgree" />
      <btn w='300' h='98' btnType="error" shape='square' :text="$tc('拒绝')" @click="clickReject" />
		</view>
	</ql-page>
</template>

<script>
import avatar from '@/components/avatar'
import imageIcon from '@/components/image-icon'
export default {
  components: { avatar, imageIcon },
	data() {
		return {
			info: {},
			application: {},
			genderIcon: {
        [uni.$chatKit.TUIChatEngine.TYPES.GENDER_UNKNOWN]: 'tb_xbxz', // 未设置性别
        [uni.$chatKit.TUIChatEngine.TYPES.GENDER_FEMALE]: 'tb_nv2', // 女性
        [uni.$chatKit.TUIChatEngine.TYPES.GENDER_MALE]: 'tb_nan2', // 男性
      }
		};
	},
  computed: {
    c4Text() {
      let text = ''
      switch (this.application.applicationType) {
        case 0:
          text = this.$tc('加群申请')
          break;
        case 2:
          text = `${this.$tc('成员')}[${this.application.applicantNick}]${this.$tc('的邀请')}`
          break;
      }
      return text
    },
  },
	onShow() {
		const { application } = uni.getStorageSync('group_application')
		this.application = application
		this.getInfo()
	},
	methods: {
		getInfo() {
			const idCode = this.application.applicationType === 0 ? 'applicant' : 'userID'

      if (this.application[idCode]) {
        uni.$chatKit?.chat?.getUserProfile({
          userIDList: [this.application[idCode]]
        }).then(result => {
          if (result.data?.length > 0) {
            this.info = result.data[0]
          }
        })
      }
		},

		clickAgree() {
			const params = {
				handleAction: 'Agree',
				application: this.application,
			}
			uni.$chatKit?.chat?.handleGroupApplication(params).then(result => {
				uni.navigateBack({
		  	  delta: 1,
	    	})
		  })
		},
		clickReject() {
			const params = {
				handleAction: 'Reject',
				application: this.application,
			}
			uni.$chatKit?.chat?.handleGroupApplication(params).then(result => {
				uni.navigateBack({
		  	  delta: 1,
	    	})
		  })
		},
	}
};
</script>
<style scoped lang="scss">
.group-apply-detail-page {
	.head {
		margin: 30rpx auto 40rpx auto;
	}
	.c1 {
		height: 60rpx;
		text-align: center;
		font-size: 40rpx;
		font-weight: 500;
	}
	.c2 {
		margin-bottom: 44rpx;
		height: 40rpx;
		font-size: 28rpx;
		text-align: center;
		color: $grayFont;
	}
	.c3 {
		margin: 0rpx 35rpx 28rpx 35rpx;
		padding: 18rpx;
		box-sizing: border-box;
		min-height: 100rpx;
		line-height: 64rpx;
		background-color: $colorF5;
		border-radius: 20rpx;
	}
	.c4 {
		display: flex;
		min-height: 80rpx;
		.right {
			margin-left: 50rpx;
			flex: 1;
			color: $grayFont;
		}
	}
	.btns {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
}
</style>