// //初始化群属性,配置一个key为nt的属性,用于标识公告是否置顶
// let promise = TUIChatEngine.chat.initGroupAttributes({
//   groupID: group.groupID,
//   groupAttributes: { "nt" : "false" }
// });
// promise.then( (res) => { // 初始化成功
//   console.log(res.data.groupAttributes); // 初始化成功的群属性

//   TUIStore.update(StoreName.GRP, "isShowCreateComponent", false);
//   const callback = TUIGroupServer.getOnCallCallback(TUIConstants.TUIGroup.SERVICE.METHOD.CREATE_GROUP);
//   callback && callback(group);

// })
// .catch( (res) => { // 初始化失败
//   console.log('initGroupAttributes error:', res); // 初始化群属性失败的相关信息
// });

// //改变公告置顶属性数据
// //notificationToTop.value为字符串  "true" 或者 "false"
// let groupID = groupProfile.value.groupID;

//   let promise = TUIChatEngine.chat.setGroupAttributes({
//     groupID: groupID,
//     groupAttributes: { "nt": notificationToTop.value}
//   });
//   promise.then( (res) => { // 设置成功
//     console.log(res.data.groupAttributes); // 设置成功的群属性
//     emits("update", { key: "notification", value: input.value });
//     nextTick(() => {
//       input.value = "";
//     });

//   })
//   .catch( (res) => { // 设置失败
//     console.log('setGroupAttributes error:', res); // 设置群属性失败的相关信息
//   });