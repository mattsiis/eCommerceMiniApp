const app = getApp();
const regeneratorRuntime = require("../../lib/runtime");

// pages/myOrder/myOrder.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 标题
    title: [],
    // 订单
    order: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {

    this.setData({ title: this.titleName() })
    // 拿用户openid并创建用户
    if (!app.globalData.openid) {
      await wx.cloud.callFunction({
        name: 'login',
        success: async ({ result }) => {
          app.globalData.openid = await result.openid;
          // 提取数据库信息
          const db = wx.cloud.database();
          // 寻找user数据库
          let { data } = await db.collection('user').where({ _openid: app.globalData.openid }).get();
          // 如果没有数据，则添加用户
          if (!data.length) { this.addUser() }
          // 查找数据库、重新排序并渲染
          let historyOrder = await this.getHistoryOrder()
          this.sortOrder(historyOrder)
        }
      })
    } else {
      // 否则直接查找数据库、重新排序并渲染
      let historyOrder = await this.getHistoryOrder()
      this.sortOrder(historyOrder)
    }
  },

    
  // 如果数据库没有此用户，则添加
  async addUser() {
    // 获取数据库实例
    const db = wx.cloud.database({})

    // 插入用户信息
    let result = await db.collection('user').add({
      data: {
        '_id': app.globalData.openid,
        'describtion': '从添加地址添加'
      }
    })
  },

  /**
   * 设定名字
   */
  titleName() {
    return [{ name: '全部', cls: 'choose' },
    { name: '待支付', cls: '' },
    { name: '待发货', cls: '' },
    { name: '待收货', cls: '' },
    { name: '已完成', cls: '' }]
  },

  /**
     * 查询订单，跳转至订单详情
     */
  async queryorder(e) {
    wx.navigateTo({
      url: `/pages/paymentResult/paymentResult?id=${e.detail.id}&res=${e.detail.res}`
    });
  },

  /**
   *  因为传入的数组是以时间戳从小到大排序，
   *  所以至需要将其颠倒就可以从大到小排序
   */
  sortOrder(data){
    // 颠倒传入的数组
    data.reverse(data)
    // 更新order数据
    this.setData({order: data})
    wx.hideLoading();
  },
  /**
   * 获取历史的所有订单
   * 返回拿到的数据
   */
  getHistoryOrder: async function (status) {
    wx.showLoading({ title: '数据获取中...' });
    const db = wx.cloud.database();
    const _ = db.command
    let result = await db.collection('order').where({
      status: status || _.neq(0),
      _openid: app.globalData.openid}).get();
    let data = result.data || [];
    return data;
  },

  // 更改标题和渲染内容
  async changetap(e) {
    // 将组件传出的数据更新并渲染
    this.setData({title: e.detail});
    // 找到点击的索引
    let titleIndex = e.detail.findIndex(item => item.cls == 'choose')
    // 状态码初始值
    let status = 0
    // 点击索引后，绑定索引的状态码，
    switch(titleIndex) {
      case 0 :{
        status = 0
        break;
      }
      case 1: {
        status = 2
        break;
      }
      case 2: {
        status = 1
        break;
      }
      case 3: {
        status= 11
        break;
      }
      case 4: {
        status= 10
        break;
      }
      default:{
        getHistoryOrder: 0;
        break;
      }
    }
    // 并将状态码传入数据库中查询
    // 暂存，排序和更新数据
    let statusOrder = await this.getHistoryOrder(status)
    this.sortOrder(statusOrder)
  },
})