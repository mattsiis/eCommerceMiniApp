// pages/saveLesson/saveLesson.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: [],
    // 是否显示提示文案
    showTips: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.update()
  },

  update(){
    // 如果收藏的数据放在服务器端，我们需要发送请求
    // 如果是客户端，我们直接读取本地存储
    // 通过本地存储获取数据
    wx.getStorage({
      key: 'saveProduct',
      complete: ({ data }) => {
        if (data[0]) {
          // 有数据
          this.setData({
            data,
            showTips: false
          })
        } else {
          // 没有数据
          this.setData({ showTips: true })
        }
      },
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.update()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      data: this.data.data
    })
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

  chooseItem(e) {
    // console.log(e)
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + e.detail.id,
    })
  }
})