// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let { postId } = event
  return await db.collection('likes').where({
    postId: postId
  }).orderBy('date', 'desc').limit(100).field({
    avatarUrl: true,
    nickName: true
  }).get()
}