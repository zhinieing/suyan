

App({
    
  onLaunch: function () {
    var self = this;
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init();
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          if (res.result) {
            self.globalData.openid = res.result.openid
          }
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
        }
      });
    }
    
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  globalData:{
    openid: null
  }
})