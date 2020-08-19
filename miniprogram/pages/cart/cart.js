const app = getApp()
const regeneratorRuntime = require("../../lib/runtime");
// 购买商品

// pages/cart/cart.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 购物车内的产品
    product: [],
    // 购物车内选择的商品
    selectedProducts: [],
    // 总价格
    price: 0,
    // 是否全选
    selectAllStatus: false,
    // 开始作标
    startX: 0,
    startY: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 如果没有openid，则检查是否存在用户，如果不存在，则添加用户
    if (!app.globalData.openid){
      await wx.cloud.callFunction({
        name: 'login',
        complete: async ({ result }) => {
          app.globalData.openid = await result.openid;
          // 提取数据库信息
          const db = wx.cloud.database();
          // 寻找user数据库
          let { data } = await db.collection('user').where({ _openid: app.globalData.openid }).get();
          // 如果没有数据，则添加用户
          if(!data.length){ this.addUser() }
        }
      })
    }
      
    this.update();
  },


  // 如果数据库没有此用户，则添加
  async addUser() {
    // 获取数据库实例
    const db = wx.cloud.database({})

    // 插入用户信息
    let result = await db.collection('user').add({
      data: {
        '_id': app.globalData.openid,
        'describtion': '从购物车添加'
      }
    })
  },

  // 重设所有右滑的方法
  initTouchMove(){
    let cart = this.data.product;
    for (let i = 0; i<cart.length; i++){
      cart[i].properties.isTouchMove = false
    }
    return cart
  },

  // 设定初始数据
  touchStart(e){
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      product: this.initTouchMove()
    })
  },  

  // 手指移动的交互方法
  touchMove(e){
    var that = this;
    // 定义起始数据
    let index = e.currentTarget.dataset.index;
    let startX = that.data.startX;
    let startY = that.data.startY;
    // 定义手指移动的数据
    let touchMoveX = e.changedTouches[0].clientX;
    let touchMoveY = e.changedTouches[0].clientY;
    // 获取滑动角度
    let angle = that.angle({x:startX, y: startY}, {x:touchMoveX, y:touchMoveY})
    // 滑动超过30度 return
    if(Math.abs(angle)>30) return;
    // 假定永远没有右滑
    let cart = that.initTouchMove()
    // 如果X移动大于起始 则是右滑
    if(touchMoveX < startX && startX - touchMoveX > 10) {
      cart[index].properties.isTouchMove = true;
    }
    // console.log(cart)
    // 更新数据
    this.setData({
      product: cart
    })
  },

  // 角度计算
  angle(start, end) {
    var diff_x = end.x - start.x,
      diff_y = end.y - start.y;
    //返回角度,不是弧度
    return 360 * Math.atan(diff_y / diff_x) / (2 * Math.PI);
  },

  // 删除商品
  delItem(e){
    // 取出data中的购物车数据
    let cart = this.data.product;
    cart.splice(e.currentTarget.dataset.index, 1)
    // 更新修改后的数据
    this.setData({
      product: cart,
      price: this.totalPrice(cart),
    })
  },

  // 从storage里取出数据并更新数据
  update(){
    // 获取本地存储中的数据
    wx.getStorage({
      key: 'product',
      success: async (res) => {
        // 默认值 
        const data = res.data || []; // 给data默认值 es6语法
        await this.setData({ product: data })
        // console.log(data)
        // 数据不存在
        if ( data.length == 0) {
          // 提醒用户，并且进入首页
          wx.showModal({
            title: "购物车空空如也",
            confirmText: "进入首页",
            showCancel: false,
            success() {
              wx.switchTab({
                url: '/pages/index/index'
              })
            }
          })
          return;
        }
        // 如果数据存在
        this.setData({
          price: this.totalPrice(data)
        })
      }
    })
    // 判断是否全选
    this.isSelectAll();
  },

  // 选择一个商品
  selectList(e){
    // console.log(this.data.product)
    // 获取data- 传进来的index  
    const index = e.currentTarget.dataset.index; 
    // 获取购物车列表
    let carts = this.data.product

    // 获取当前商品的选中状态
    const selected = carts[index].properties.isSelected;
    // 改变状态
    carts[index].properties.isSelected = !carts[index].properties.isSelected; 
    // 判断是否全选
    this.isSelectAll();
    // 选择后更新数据
    this.setData({
      product: carts,
      price: this.totalPrice(carts)
    })
  },
  
  // 点击全选后，若已经全选，则取消所有选择状态，否则全选
  selectAll(e) {
    // 是否全选状态   
    let selectAllStatus = this.data.selectAllStatus;
    // 点击后转换为非全选状态/全选状态
    selectAllStatus = !selectAllStatus;    
    let carts = this.data.product;    
    // 遍历购物车
    for (let i = 0; i < carts.length; i++) { 
      // 改变所有商品状态
      carts[i].properties.isSelected = selectAllStatus;      
    }
    // 更新数据
    this.setData({
      selectAllStatus: selectAllStatus,
      product: carts,
      price: this.totalPrice(carts)
    }); 
  },

  // 获取选择后的价格的方法
  totalPrice(products){
    // console.log('1')
    // 如果isSelected为true，则返回该产品数组
    let selectedProducts = products.filter(item => {
      // 如果属性里isSelected为true则返回元素
      if(item.properties.isSelected)  return item; 
    })

    
    // 如果产品数组里面有被选择的项目
    if (selectedProducts.length) {
      // 储存被选中的产品列表
      this.setData({ selectedProducts: selectedProducts})
      
      // 遍历价格并相加并返回
      return selectedProducts.map(item => item.price * item.properties.quantity).reduce((res, item) => +res + +item)
    } else return 0
    
  },

  // 判断是否全选的方法
  isSelectAll() {
    // 获取所有产品
    let carts = this.data.product;
    
    //获取全选状态 
    let selectAllStatus = this.data.selectAllStatus;
    //判断有一个没有选中，全选取消   
    let j = 0;
    for (let i = 0; i < carts.length; i++) {
      if (carts[i].properties.isSelected == true) {
        j++;
        continue;
      } else {
        selectAllStatus = false;
      }
    }
    //如果都选中，全选也选中实现
    if (j == carts.length) {
      selectAllStatus = true;
    }
    // 更新数据
    this.setData({
      selectAllStatus: selectAllStatus
    });
  },
 
  // 更新更改数字后的总价
  calcTotalPrice(e){
    // console.log(e)
    let cart = this.data.product;
    // 找到点击的数量并重新设置
    cart[e.currentTarget.dataset.index].properties.quantity = e.detail.num
    // 重设product,并保留数字信息
    wx.setStorage({
      key: 'product',
      data: cart,
    })
    // 重新计算总价
    this.setData({ price: this.totalPrice(cart)})
  },

  // 进入详情页的方法
  showDetailPage(e) {
    // console.log(e)
    // 进入详情页
    wx.navigateTo({
      url: '/pages/detail/detail?id=' +
        e.detail.id
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.isSelectAll();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.update();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    wx.setStorage({
      key: 'product',
      data: this.data.product,
    })
  },

  // 发起购买请求
  async makeOrder() {
    // console.log(this.data.product.map(item => item[1]).join('|'))
    // 弹出“正在下单”提示
    wx.showLoading({
      title: '正在下单',
    });
    // console.log(this.data.product)

    // // 利用云开发接口，调用云函数发起订单
    // let id = this.data.product.map(item => item[0]).join("|")

    // 传入产品和价格进入云服务器生成订单
    const { result } = await wx.cloud.callFunction({
      name: 'pay',
      data: {
        type: 'unifiedorder',
        data: {
          products: this.data.selectedProducts,
          price: this.data.price
        }
      }
    });

    const data = result.data;
    // console.log(data)
    wx.hideLoading();

    wx.navigateTo({
      url: `/pages/result/index?id=${data.out_trade_no}`
    });
  },
})