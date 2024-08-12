


module.exports = {
    productionSourceMap: false, // 生产打包时不输出map文件，增加打包速度
    configureWebpack: config => {
        if (process.env.NODE_ENV === 'production') {
            config.optimization.minimizer[0].options.terserOptions.compress.warnings = false
            config.optimization.minimizer[0].options.terserOptions.compress.drop_console = false
            config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = false
            config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = ['console.log']
			
        }
		// console.log('config112',config.optimization.minimizer[0].options.terserOptions.compress)
    }
}
