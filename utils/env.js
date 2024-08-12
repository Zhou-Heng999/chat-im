
const env = {
	development: {
		baseUrl: '/api',
		hotUpdate:'https://im.2024go.xyz/h5/download'
	},
	production: {
		baseUrl:'https://api.metagod.world/webapp',
		hotUpdate:'https://im.2024go.xyz/h5/download'
	}
}
  // export default env[process.env.NODE_ENV]
  export default env['production']
