// utils/ui.js
import Vue from 'vue'
const systemInfo = uni.getSystemInfoSync();
console.log('systemInfo.platform', systemInfo.platform)
// 根据设备类型判断
let importPromise;
if (systemInfo.platform === 'windows') {
	importPromise = import('./element')
} else {
	importPromise = import('./uview')
}

// 使用动态导入的UI框架
importPromise.then(installUI => {
	console.log('installUI', installUI)
	installUI.default(Vue);
});
