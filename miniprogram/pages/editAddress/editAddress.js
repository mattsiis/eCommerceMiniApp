const regeneratorRuntime = require("../../lib/runtime");
const app = getApp();
// pages/editAddress/editAddress.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pressed: false,
    index: '',
    address: {},
    region: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options.id = 1
    wx.getStorage({
      key: 'temp',
      success: ({data}) => {
        console.log(data)
        let region = [
          data.region.provinceName, data.region.cityName, data.region.countyName 
        ]
        this.setData({
          address: data,
          region: region,
          index: options.id
        })
        // console.log(this.data.region)
      }, 
    })
    // console.log(this.data.address)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // 储存所在地信息用于页面渲染
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },

  // 按保存按钮以后的事件
  async formSubmit(e) {
    // console.log(e)
    this.setData({pressed: true})
    console.log(this.data)
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('user').doc(app.globalData.openid).update({
      data:{
         address: _.push(e.detail.value)
      },
     complete: () => {
        wx.navigateBack({})
    }
    })
  }
})