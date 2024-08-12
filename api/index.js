const requireModule = require.context('./', false, /\.js$/)
const apis = {}
requireModule.keys().forEach(fileName => {
  if (fileName === './index.js') return
  const moduleName = fileName.replace(/(\.\/|\.js)/g, '')
  apis[moduleName] = requireModule(fileName).default || requireModule(fileName)
})

export default apis