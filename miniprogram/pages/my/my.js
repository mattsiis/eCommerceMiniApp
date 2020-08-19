// pages/my/my.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list1: [{ img: '/images/icons/my/my_icon_order.png', title: '我的订单', callback: 'myOrderPage'}],
    list2: [{ img: '/images/icons/my/my_icon_address.png', title: '地址管理', callback: 'myAddressPage', style: 'border-bottom: 1px solid #f5f5f5'},
      { img: '/images/icons/my/my_icon_collection.png ', title: '我的收藏', callback: 'showSaveProductPage'}],
    list3: [{ img: '/images/icons/my/my_icon_help.png', title: '联系客服', callback: 'servicePage'}],
    
  },

  // 我的订单页面
  myOrderPage(){
    wx.navigateTo({
      url: "/pages/myOrder/myOrder"
    })
  },

  // 我的地址页面
  myAddressPage() {
    wx.navigateTo({
      url: '/pages/myAddress/myAddress',
    })
  },

  // 分享有奖
  showSharePricePage() {
    wx.navigateTo({
      url: '/pages/sharePrize/sharePrize',
    })
  },

  // 我的收藏
  showSaveProductPage() {
    wx.navigateTo({
      url: '/pages/savedProduct/savedProduct',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  }
})