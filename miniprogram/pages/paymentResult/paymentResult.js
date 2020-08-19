const regeneratorRuntime = require("../../lib/runtime");

// pages/paymentResult/paymentResult.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 支付状态
    isPaid: 'FAILED',
    // 支付编号
    out_trade_no: '',
    // 运费
    shippingFee: 0,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    
    // 更新数据用于渲染
    this.setData({
      // isPaid: 'FAILED',
      // out_trade_no: '5839574-1555061630086',

      // 是否支付flag
      isPaid: options.res,
      // 从别的页面传入的订单号
      out_trade_no: options.id
    });
    // 根据订单号拿到拿到订单信息
    await this.getOrder();
  },

  /**
   * 获取订单详情
   */
  getOrder: async function () {
    // 访问云函数
    const { result } = await wx.cloud.callFunction({
      name: 'pay',
      data: {
        type: 'orderquery',
        data: {
          // 传入现在的订单号并寻找订单
          out_trade_no: this.data.out_trade_no
        }
      }
    });

    let data = result.data || {};
    // console.log(data)

    // console.log(data);
    // 储存从云函数传回的订单信息
    this.setData({
      order: data
    });
  },

  /**
   * 去主页逛逛
   */
  goHomePage(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

  /**
    * 发起支付
    */
  async pay() {
    wx.showLoading({
      title: '正在下单',
    })
    // 拿到当前订单信息
    let orderQuery = this.data.order;
    // 拿到当前订单号
    let out_trade_no = this.data.out_trade_no;
    // 绑定this
    let _this = this;
    // console.log(orderQuery)
    let address = orderQuery.address
    // console.log(address)

    // 传入产品和价格进入云服务器重新生成订单
    const newOrder = await wx.cloud.callFunction({
      name: 'pay',
      data: {
        type: 'unifiedorder',
        data: {
          address: address,
          products: orderQuery.products,
          price: orderQuery.total_fee
        }
      }
    });

    // console.log(newOrder)
    // 从服务器拿到订单信息
    const { result } = await wx.cloud.callFunction({
      name: 'pay',
      data: {
        type: 'orderquery',
        data: {
          out_trade_no: newOrder.result.data.out_trade_no
        }
      }
    });
    // 储存新订单
    let data = result.data || {};
    // 解构新订单
    const {
      time_stamp,
      nonce_str,
      sign,
      sign_type,
      prepay_id,
      body,
      total_fee
    } = data;

    // 发起支付
    wx.requestPayment({
      timeStamp: time_stamp,
      nonceStr: nonce_str,
      package: `prepay_id=${prepay_id}`,
      signType: 'MD5',
      paySign: sign,
      async success(res) {
        wx.showLoading({
          title: '正在支付',
        });

        wx.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 1500,
          async success() {
            // _this.getOrder();

            await wx.cloud.callFunction({
              name: 'pay',
              data: {
                type: 'payorder',
                data: {
                  address,
                  body,
                  prepay_id,
                  out_trade_no,
                  total_fee
                }
              }
            });
            
            // 如果不是从立即购买页面进入该页面的话
            if (!_this.data.buyNow) {
              // 读取缓存，如果支付成功，则将购物车内已经选区的数据删除
              wx.getStorage({
                key: 'product',
                success: ({ data }) => {
                  // 建立没选取的空数组
                  let notSelected = [];
                  // 遍历已经选取的数组
                  for (let i = 0; i < data.length; i++) {
                    // 如果属性中被标注已经选取
                    if (!data[i].properties.isSelected) {
                      // 将数据推入未选取
                      notSelected.push(data[i])
                    }
                  }
                  // 重新设置缓存
                  wx.setStorage({
                    key: 'product',
                    data: notSelected,
                  })
                },
              })
            }

            wx.redirectTo({
              url: `/pages/paymentResult/paymentResult?res=SUCCESS&id=${data.out_trade_no}`,
            })
            wx.hideLoading();
          }
        });
      },
      // 如果支付失败
      fail: async function (res) {
        wx.showToast({
          title: '支付失败',
          icon: 'loading',
          duration: 1000,
          async success() {
            // 储存地址
            await wx.cloud.callFunction({
              name: 'pay',
              data: {
                type: 'payorder',
                data: {
                  address,
                }
              }
            });
            wx.redirectTo({
              url: `/pages/paymentResult/paymentResult?res=FAILED&id=${data.out_trade_no}`,
            })
          }
        })
      }
    })
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