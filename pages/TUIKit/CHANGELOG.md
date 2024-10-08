## [2.0.0] (2023-12-21)

### Features

- 全面支持 uniapp Vue2 & uniapp Vue3，包括以下主体功能：
  - TUIChat: 负责消息界面展示，包括多类型消息收发，消息引用/删除/撤回/转发、查询消息已读回执详情等功能。
  - TUIConversation: 负责会话列表的展示和编辑，包括会话置顶、会话消息免打扰、会话删除等功能.
  - TUIGroup: 负责群聊的创建以及群资料、群成员、群组权限、群公告、群禁言的管理。
  - TUIContact: 负责联系人与群组展示，添加好友，移入黑名单，好友备注，信息展示等功能。
- 同时，我们还提供了功能丰富的插件系统：
  - TUICustomerService: 在线客服插件，支持灵活的路由排队、客服接待、智能机器人功能，配合功能丰富的管理端与数据分析能力，支持客服多终端办公，免费试用请点击 https://cloud.tencent.com/document/product/269/92648#ae4e3f5c-94db-4df3-8a49-65d23ce417b8 开通。
  - TUICallKit: 音视频通话 UI 组件，支持两人或多人进行音视频通话，覆盖游戏社交、在线客服、视频客服、在线问诊、保险咨询等场景，免费试用请点击 https://cloud.tencent.com/document/product/269/79861#step1 开通。
