const regeneratorRuntime = require("../../lib/runtime");

// pages/productList/productList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 产品数据
    productListData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
      
    
  },

  // 得到产品数据
  async getProductList(){
    wx.showLoading({ title: '数据获取中...' });

    const db = wx.cloud.database();
    let result = await db.collection('products').get();
    let data = result.data || [];
    this.setData({
      productListData: data
    });
    wx.hideLoading();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: async function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 
    this.getProductList()

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