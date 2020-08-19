const regeneratorRuntime = require("../../lib/runtime");
const app = getApp()
// pages/createAddress/createAddress.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 所在地区信息
    region: [],
    options: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    if(options.id){
      this.setData({options: options.id})
    }
    // 拿用户openid并创建用户
    if (!app.globalData.openid) {
      await wx.cloud.callFunction({
        name: 'login',
        complete: async ({ result }) => {
          app.globalData.openid = await result.openid;
          // 提取数据库信息
          const db = wx.cloud.database();
          // 寻找user数据库
          let { data } = await db.collection('user').where({ _openid: app.globalData.openid }).get();
          // 如果没有数据，则添加用户
          if (!data.length) { this.addUser() }
        }
      })
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

  // 点击保存按钮提交数据
  async formSubmit (e) {
    // 如果有一行信息没有填写，则弹框提示
    if (!(e.detail.value.userName && e.detail.value.telNumber && e.detail.value.region.length && e.detail.value.detailInfo)){
      // 弹框提示用户信息不完整
      wx.showModal({
        title: '',
        content: '请输入完整信息',
        confirmText:'我知道了',
        showCancel: false
      }) 
    } else {
      
      // 提取数据库信息
      const db = wx.cloud.database();
      // 寻找user数据库
      let {data} = await db.collection('user').where({_openid: app.globalData.openid}).get();
      // console.log(data)
      // 创建地址信息集合
      let addressInfo = e.detail.value
      // 讲region中的数组转化成object
      addressInfo.region = {
        'provinceName': this.data.region[0],
        'cityName': this.data.region[1],
        'countyName': this.data.region[2]
      }

      // 如果不存在地址信息
      if(!data[0].address[0]) {
        // 则添加地址信息
        await db.collection('user').doc(app.globalData.openid).update({
          data: {
            // 地址信息
            address: [addressInfo]
          },
          complete: () => {  } 
        })
      // 如果存在该user的数据，则更新地址
      } else {
        // 需要使用push推数据
        const _ = db.command
        // 查找用户，并更新数据
        await db.collection('user').doc(app.globalData.openid).update({
          data:{
            // 添加数据
            address: _.push(addressInfo)
          },
          complete () {}
        })
      }
      // console.log(this.data.options)
      // 如果页面是从支付的地方转过来的，则需要直接将输入的信息设置到支付页面中
      if (this.data.options == 'add'){
        // 拿到上一个页面的路由
        let pages = getCurrentPages();
        let currPage = pages[pages.length - 1];   //当前页面
        let prevPage = pages[pages.length - 2];  //上一个页面

        //调用上一个页面的setData()方法，把该页面的数据存到上一个页面中去
        await prevPage.setData({
          address: addressInfo
        })

      }
      wx.navigateBack({})
    }
  },

  // 储存所在地信息用于页面渲染
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  }
})