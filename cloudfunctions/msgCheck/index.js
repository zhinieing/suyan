// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let msgR = false;
    //  检查文本内容是否违规
    if (event.msg) {
      msgR = await cloud.openapi.security.msgSecCheck({
        content: event.msg
      })
    }
    
    return msgR;
  } catch (e) {
    return e
  }
}