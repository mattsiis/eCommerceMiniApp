const app = getApp();
const regeneratorRuntime = require("../../lib/runtime");
// pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 产品数据
    product: [],
    // 是否加入收藏
    hasSave: false,
    // 商品是否在购物车内
    inCart: false,
    // 需要多少个
    quantity: 1,
    // 产品id
    productId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    // options.id=100001;
    // console.log(options);
    // 模拟id
    // options.id = 100001

    // 将int转换成String
    const ids = options.id + '';
    // this.setData({productId: ids})
    // 创建数据库实例
    const db = wx.cloud.database();

    // 从服务端请求数据
    db.collection('products').where({
      id: ids
    }).get({
      success: ({ data }) => {
        // console.log(data)
        // 取出data中的数据
        let productInfo = data[0];

        // 存储数据
        this.setData({
          product: productInfo,
          productId: ids
        })
        // console.log(this.data.product)
      }
    })

    // 读取本地存储，查看是否收藏过产品
    wx.getStorage({
      key: 'saveProduct',
      complete: ({ data }) => {
        if (data) {
          // 如果有数据并且存在该id对应的课程
          if (data && data.find(item => item.id == options.id)) {
            // 产品是收藏过的
            this.setData({
              hasSave: true
            })
          }
        }
      },
    })
  },

  // 加入购物车按钮
  async addCart() {
    let properties = this.data.product.properties;
    // 点击加入购物车后为自动选择购买状态
    properties['isSelected'] = true;
    // 是否删除为否
    properties['isTouchMove'] = false;
    // 添加数量的默认值
    properties['quantity'] = this.data.quantity
  
    
    // console.log(product)
    // 将商品加入本地存储
    // 从本地存储中，获取所有加入购物车的课程
    wx.getStorage({
      key: 'product',
      complete: ({ data }) => {
        // 外面判断过是否购买，里面可以直接存储
        data = data || [];
        // console.log(data)
        // 如果已经购买过
        let foundInCart = data.find(item => item.id == this.data.productId)
        if (data && foundInCart) {
          foundInCart.properties.quantity = foundInCart.properties.quantity + this.data.quantity;          
        } else {
            // 添加该产品
          data.push(this.data.product);
        }
          // 更新本地存储
        // this.setData({
        //   hasBuy: !this.data.hasBuy
        // })
        wx.setStorage({
          key: 'product',
          data,
          // 存储成功后，进入购物车页面
          complete: () => {
          // console.log(data)
            wx.switchTab({
              url: '/pages/cart/cart',
            })
          }
        })
      }
    })
    // wx.setStorage({
    //   key: 'product',
    //   data: this.data.product,
    // })
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

  // 发起购买请求
  async makeOrder() {
    // console.log(this.data.product.map(item => item[1]).join('|'))
    // 弹出“正在下单”提示
    wx.showLoading({
      title: '正在下单',
    });

    // 如果没有openid，则检查是否存在用户，如果不存在，则添加用户
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

    // // 利用云开发接口，调用云函数发起订单
    // let id = this.data.product.map(item => item[0]).join("|")
    
    //生成长度为1的数组 
    let order = [];
    let product = this.data.product;
    product.properties['quantity'] = 1
    await order.push(product)

    // 传入产品和价格进入云服务器生成订单
    const { result } = await wx.cloud.callFunction({
      name: 'pay',
      data: {
        type: 'unifiedorder',
        data: {
          products: order,
          price: this.data.product.price
        }
      }
    });

    const data = result.data;
    wx.hideLoading();

    wx.navigateTo({
      url: `/pages/result/index?buynow=true&id=${data.out_trade_no}`
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
 
  },

  // 收藏课程
  saveProduct() {
    // 将课程存储再本地
    // 从本地存储中读取所有已经收藏的课程
    wx.getStorage({
      key: 'saveProduct',
      complete: ({
        data
      }) => {
        // 没有数据，适配空数组
        data = data || [];
        // 如果收藏过了，点击按钮，取消收藏
        if (this.data.hasSave) {
          data = data.filter(item => item.id != this.data.product.id)
        } else {
          // 否则，没有收藏过，要加入收藏
          data.push(this.data.product)
        }
        // 最终更新数据
        this.setData({
          hasSave: !this.data.hasSave
        })
        // 更新本地存储
        wx.setStorage({
          key: 'saveProduct',
          data
        })
      }
    })
  }
})