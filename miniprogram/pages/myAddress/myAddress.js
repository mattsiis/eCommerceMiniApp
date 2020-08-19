const app = getApp()
const regeneratorRuntime = require("../../lib/runtime");
// pages/myAddress/myAddress.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: [],
    isChoose: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 如果是从选择地址界面传来id为choose的数据
    if(options.id == 'choose'){
      // 改变导航文字
      wx.setNavigationBarTitle({
        title: '选择地址',
      })
      // 设置flag为iscChoose
      this.setData({isChoose: true})
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
        'describtion': '从我的地址添加'
      }
    })
  },

  /**
   * 绑定的选择地址方法
   */
  chooseAddress(e){
    let choosedAddress = this.data.address[e.currentTarget.dataset.index]
    
    // 拿到上一个页面的路由
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    //调用上一个页面的setData()方法，把该页面的数据存到上一个页面中去
    prevPage.setData({
      address: choosedAddress
    })
    
    // 返回上一个页面
    wx.navigateBack({})
  },


  /**
   * 通过openid拿到用户数据
   */
  async getData(openid){
    const db = wx.cloud.database();
    await db.collection('user').doc(openid).get({
      success: ({data})=>{
        // 插入index并传给组件，用于设置默认地址时需要使用的索引
        for (let i = 0; i < data.address.length; i++) {
          data.address[i]['index'] = i
        }
        // 更新数据
        this.setData({ address: data.address })
      },
      fail: ()=>{
        // console.log('user not registered')
      }
    })
    // console.log(data)
    // ({
      // success: ({ data }) => {
      //   this.setData({ address: data.address })
      // }
    // })
    // console.log(data.address)
  },

  

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 如果拿到openid则刷新界面
    if(app.globalData.openid){
      this.getData(app.globalData.openid)
    }
    // console.log(app.globalData.openid)
  },

  // 按新建地址后，进入新建地址页面
  createNewAddress(){
    wx.navigateTo({
      url: '/pages/createAddress/createAddress',
    })
  },

  // 点击后更新数据
  updatePage(e){
    // console.log(e)
    // 如果回传的数据为delete
    if(e.detail == "delete"){
      // 拿到现在渲染的所有地址
      let address = this.data.address
      // 重建地址数组
      let newAddress = address.filter(function(element, index) {
        // 如果索引不等于事件返回的id
        if(index != e.target.id){
          // 返回该元素
          return element
        } 
      })
      // 重新渲染视图
      this.setData({
        address: newAddress
      })
      // 同步数据库
      wx.cloud.database().collection('user').doc(app.globalData.openid).update({
        data:{
          address: this.data.address
        }, success (res) {
          // console.log(res)
        }
      }) 
      // 如果组件回传的数据为change
    } else if (e.detail == "change"){
      // 拿到点击的数据
      let thisAddress = this.data.address[e.target.id]
      // 暂时存到storange里面方便另一个页面取用
      wx.setStorage({
        key: 'temp',
        data: thisAddress,
      })
      // 跳转到另一个页面，并携带传入的数组索引用于修改
      wx.navigateTo({
        url: '/pages/editAddress/editAddress?id=' + e.target.id,
      })
    } else if (e.detail == 'default'){
      // 取出地址数据
      let address = this.data.address;
      // 重新排列
      // 将address中点击的文件元素，并保存被删除的元素
      let unshiftedItem = address.splice(e.currentTarget.id, 1)
      // 将元素插入第一格
      address.unshift(unshiftedItem[0])
      // 重设index
      // 修改address内index的值
      for (let i = 0; i < address.length; i++) {
        address[i]['index'] = i
      }
      // 更新address
      this.setData({address: address})
      
      
  
    }
  },

  // 卸载页面时向数据库提交数据
  onUnload: function () {
    // console.log("hide")
    wx.cloud.database().collection('user').doc(app.globalData.openid).update({
      data: {
        address: this.data.address
      }, success(res) {
        // console.log(res)
      }
    })
  },
})