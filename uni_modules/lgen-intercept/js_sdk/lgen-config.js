export default {
    // 黑白名单只能二选一，可配置页面路径 或 正则表达式规则。使用 '/' 和 '页面路径'同时配置应用首页
    // 黑名单，需要登录的页面路径
    // setStorageSync 设置本地存储的用户登录标识
    uInfo:'tmi',
    // 登录页面地址，用于未登录时跳转
    loginPath:'/pages/index/index',
    // 点击跳转到需要登录的页面时，未登录状态下是否跳转到登录页面，true | false
    toLogin:true
}