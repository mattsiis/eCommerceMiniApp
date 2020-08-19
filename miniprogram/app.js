//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        } else {
          // 跳转登录页面让用户登录
          wx.switchTab({ url: 'pages/backendSubmit/backendSubmit' })
        }
      }
    })

    this.globalData = {
      // 数据库中是否有用户
      hasUser: false, 
      // 小程序的userInfo是否有获取
      hasUserInfo: false,
      // 缓存userInfo
      userInfo: null,
      // 用户昵称
      nickName: '',
      // 用户的openid
      openid: "",
      //  用户的id
      id: null
    }
  }
})
