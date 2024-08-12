//vue.config.js
const TransformPages = require('uni-read-pages')
const ScriptSetup = require('unplugin-vue2-script-setup/webpack').default;
const {webpack} = new TransformPages()
module.exports = {
	parallel: false,
	configureWebpack: {
		plugins: [
			ScriptSetup()
		]
	},
	 chainWebpack(config) {
	    // disable type check and let `vue-tsc` handles it
	    config.plugins.delete('fork-ts-checker');
		
	  },
	devServer: {
	    overlay: false,
	  },

}
