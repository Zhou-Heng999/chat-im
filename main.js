// import TencentCloudChat  from "@tencentcloud/chat";
// import TUICore from "@tencentcloud/tui-core";


import App from './App'

// #ifndef VUE3
import VueCompositionAPI from "@vue/composition-api";
import Vue from 'vue'
import uView from '@/uni_modules/uview-ui'
import i18n from '@/i18n/index.js'
import store from "@/store/index.js"
import {
	ListMixin
} from '@/mixin/list';
import btn from '@/components/btn/index.vue';
import qlPage from '@/components/page/index.vue'
import avatarModal from '@/components/avatar/index.vue'
import searchModal from '@/components/search/index.vue'
import api from '@/api/index.js'
import {
	setUserID,
	getAvatarInfo,
	tc
} from '@/utils/util'
// import './uni.promisify.adaptor'
// import message from '@/components/message/message.js'
import imageIcon from '@/components/image-icon/index.vue'
Vue.config.productionTip = false
Vue.prototype.requestTask = uni.request()
Vue.prototype.$http = api
Vue.prototype.$store = store
Vue.prototype.$tc = tc
Vue.prototype.$setUserID = setUserID
// Vue.prototype.$message = message;
Vue.prototype.$getAvatarInfo = getAvatarInfo
Vue.use(VueCompositionAPI);
Vue.mixin(ListMixin)
if (process.env.NODE_ENV == 'production') {
console.log = () => {}
console.warn = () => {}
console.info = () => {}
console.dir = () => {}
console.error = () => {}
console.assert = () => {}
}
// Vue.use(router)
Vue.use(uView)
uni.$u.setConfig({
	// 修改$u.config对象的属性
	// config: {
	// 	// 修改默认单位为rpx，相当于执行 uni.$u.config.unit = 'rpx'
	// 	unit: 'rpx'
	// },
	// 修改$u.props对象的属性
	props: {
		// 修改radio组件的size参数的默认值，相当于执行 uni.$u.props.radio.size = 30
		// radio: {
		// 	size: 15
		// }
		switch: {
			activeColor: '#00d491'
		}
	}
})
Vue.component('btn', btn)
Vue.component('qlPage', qlPage)
Vue.component('imageIcon', imageIcon)

Vue.component('avatarModal', avatarModal)
Vue.component('searchModal', searchModal)
App.mpType = 'app'
const app = new Vue({
	i18n,
	...App
})
app.$mount();
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	return {
		app
	}
}
// #endif