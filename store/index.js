import Vue from "vue"
import Vuex from 'vuex'
import { getMessageTranslates } from '@/pages/TUIKit/utils/messageTranslateManage'
Vue.use(Vuex)
 const store = new Vuex.Store({
	state: {
		userInfo:uni.getStorageSync('userInfo')?uni.getStorageSync('userInfo'):null,
		themModel:'light-theme',
		platform:'',
		lan:uni.getStorageSync('lan')||'zh',
		tableList:uni.getStorageSync('tableList')?JSON.parse(uni.getStorageSync('tableList')):[],
		typeList:uni.getStorageSync('typeList')?JSON.parse(uni.getStorageSync('typeList')):[],
		isShowPass:false,
		passInfo:null,
		isShowSwiper:true,
		nowPage: '',
		isShowMenu: true,
		messageTranslates: getMessageTranslates(),
		loadingTranslates: {},
		ossClient:null,
		ossInfo:null,
		accountList: uni.getStorageSync('accountList')?JSON.parse(uni.getStorageSync('accountList')):[],
		toTop:false,
		isPower:false,
		powerList:[],
		sensitiveData: [],
		keyboardHeight:null,
		isVibrate: uni.getStorageSync('isVibrate')?JSON.parse(uni.getStorageSync('isVibrate')):false,
		isBell: uni.getStorageSync('isBell')?JSON.parse(uni.getStorageSync('isBell')):false,
		friendType:true,
		editMsgContent: null,
		totalUnreadCount:0,
		isUnWatch:false,
		conversation:null,
		imageRequestCache: [],
		allConversation: [],
		nowConId: '',
		isNetworkError:false,
		pageToken:null,
		
		nowLoginInfo: uni.getStorageSync('nowLoginInfo')?JSON.parse(uni.getStorageSync('nowLoginInfo')):null
	},
	mutations: {
		setIsShowMenu(state,value){
			state.isShowMenu = value
		},
		setImageRequestCache(state, value) {
			state.imageRequestCache = value
		},
		setToken(state, value) {
			state.pageToken = value
		},
		setNetwork(state, value) {
			state.isNetworkError = value
		},
		setUnWatch(state,value){
			state.isUnWatch = value
		},
		setConversation(state,value){
			state.conversation = value
		},
		setTotalUnreadCount(state,value){
			state.totalUnreadCount = value
		},
		setKeyboardHeight(state,value){
			state.keyboardHeight = value
		},
		setNowPage(state,value){
			state.nowPage = value
		},
		setIsShowSwiper(state,value){
			state.isShowSwiper = value
		},
		setFriendType(state,value){
			state.friendType = value
		},
		setPower(state,value){
			state.isPower = value.isPower
			state.powerList=value.list
		},
		setUserInfo(state,value){
			state.userInfo = value
			uni.setStorageSync('userInfo',JSON.stringify(value))
		},
		setOssClient(state, value){
			state.ossClient = value
		},
		setOssInfo(state, value){
			state.ossInfo = value
		},
		setPlatform(state,value){
			state.platform = value
		},
		setLan(state,value){
			state.lan=value
			uni.setStorageSync('lan',value)
		},
		setTable(state,value){
			state.tableList = value
			uni.setStorageSync('tableList',JSON.stringify(value))
		},
		setHall(state,value){
			state.hallInfo=value
			uni.setStorageSync('hallInfo',JSON.stringify(value))
		},
		setPass(state,value){
			state.passInfo=value
			state.isShowPass=value.auth_id!='0'
		},
		setList(state,value){
			let { type, list } = value;
			console.log('type',type)
			uni.setStorageSync(type,JSON.stringify(list))
			    state[type] = list;
		},
    setMessageTranslates(state, data) {
      state.messageTranslates = data;
    },
    setLoadingTranslates(state, data) {
      state.loadingTranslates = data;
    },
		setDictionary(state,list){
			const colorInfo={
				"":'#409eff',
				"success":'#67c23a',
				"warning":'#e6a23c',
				"danger":'#f56c6c',
				"error":'#f56c6c',
				"info":'#909399',
			}
			let info = {};
			    list.forEach((item) => {
			      info[item.type] = {};
			      item.itemList.forEach((p) => {
			        info[item.type][p.key] = p;
			      });
			    });
			state.typeList=info
			uni.setStorageSync('typeList',JSON.stringify(info))
		},
		setAccountList(state,value){
			state.accountList = value;
			uni.setStorageSync('accountList',JSON.stringify(value));
		},
		setToTop(state,value){
			state.toTop = value
		},
		setSensitiveData(state,value){
			state.sensitiveData = value
		},
		setIsVibrate(state,value){
			state.isVibrate = value
			uni.setStorageSync('isVibrate',JSON.stringify(value))
		},
		setIsBell(state,value){
			state.isBell = value
			uni.setStorageSync('isBell',JSON.stringify(value))
		},
		setEditMsgContent(state,value){
			state.editMsgContent = value
		},
		setAllConversation(state,value){
			state.allConversation = value
		},
		setNowConId(state,value){
			state.nowConId = value
		},
		setNowLoginInfo(state,value){
			state.nowLoginInfo = value
			uni.setStorageSync('nowLoginInfo',JSON.stringify(value))
		}
	},
	actions: {
	},
	getters: {
    myMessageTranslates: state => state.messageTranslates[state.userInfo?.userID],
	}
})

export default store

