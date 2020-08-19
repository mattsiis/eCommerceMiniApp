// 订单详情

const app = getApp();
const regeneratorRuntime  =  require("../../lib/runtime");

Page({
  data: {
    // 订单数据
    order: {},
    // 地址数据
    address: {},
    // 默认没有地址,要求用户添加地址
    hasAddress: false,
    // 运费
    shippingFee: 0,
    // 是否为立刻购买
    buyNow: false
  },

  onLoad(options) {
    
    wx.showLoading({
      title: '正在加载',
    });
    // id = 产品编号
    let id = options.id;
    // 如果是从立即购买的页面进入该页面，则添加flag
    if(options.buynow){
      this.setData({buyNow: true})
    }
    // 更新数据
    this.setData({
      out_trade_no: id
    }, async () => {
      // 获取地址
      await this.getAddress();
      // 获取订单详情
      await this.getOrder();
      // console.log(this.data.order)
      wx.hideLoading();
    });
  },

  /**
   * 拿到地址信息
   */
  async getAddress(){
    // 拿到openid的用户数据
    let {data} = await wx.cloud.database().collection('user').doc(app.globalData.openid).get();   
    // 如果用户保存了地址，则使用第一个默认地址，可以选择地址
    if(data.address[0]) {
      this.setData({
        address: data.address[0],
        hasAddress: true,
      })
    }
    // console.log(this.data.address)
  },

  /**
   * 绑定选择地址事件
   */
  chooseAddress(){
    wx.navigateTo({
      url: '/pages/myAddress/myAddress?id=choose'
    })
  },

  /**
   *  绑定添加地址事件
   */
  addAddress() {
    wx.navigateTo({
      url: '/pages/createAddress/createAddress?id=add'
    })
  },

  /**
   * 发起支付
   */
  pay() {
    let orderQuery = this.data.order;
    let out_trade_no = this.data.out_trade_no;
    let _this = this;

    let address= this.data.address
    // let address = this.

    // console.log(orderQuery)
    const {
      time_stamp,
      nonce_str,
      sign,
      sign_type,
      prepay_id,
      body,
      total_fee
    } = orderQuery;



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
            if(!_this.data.buyNow){
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
              url: `/pages/paymentResult/paymentResult?res=SUCCESS&id=${_this.data.out_trade_no}`,
            })
            wx.hideLoading();
          }
        });
      },
      fail: async function (res) {
        wx.showToast({
          title: '支付失败',
          icon: 'loading',
          duration: 1000,
          async success() {
            await wx.cloud.callFunction({
              name: 'pay',
              data: {
                type: 'payorder',
                data: {
                  address,
                  out_trade_no
                }
              }
            });
            wx.redirectTo({
              url: `/pages/paymentResult/paymentResult?res=FAILED&id=${_this.data.out_trade_no}`,
            })
          }
        })
       }
    })
    // // 如果不是从立即购买页面进入该页面的话
    // if (!_this.data.buyNow) {
    //   // 读取缓存，如果支付成功，则将购物车内已经选区的数据删除
    //   wx.getStorage({
    //     key: 'product',
    //     success: ({ data }) => {
    //       // 建立没选取的空数组
    //       let notSelected = [];
    //       // 遍历已经选取的数组
    //       for (let i = 0; i < data.length; i++) {
    //         // 如果属性中被标注已经选取
    //         if (!data[i].properties.isSelected) {
    //           // 将数据推入未选取
    //           notSelected.push(data[i])
    //         }
    //       }
    //       // 重新设置缓存
    //       wx.setStorage({
    //         key: 'product',
    //         data: notSelected,
    //       })
    //     },
    //   })
    // }
  },

  /**
   * 关闭订单
   */
  async close() {

    wx.showLoading({
      title: '正在关闭',
    });

    let out_trade_no = this.data.out_trade_no;

    let result = await wx.cloud.callFunction({
      name: 'pay',
      data: {
        type: 'closeorder',
        data: {
          out_trade_no
        }
      }
    });

    // console.log(result);

    // 无需再该页面再次获取订单详情
    // this.getOrder();

    wx.hideLoading();
  },

  /**
   * 获取订单详情
   */
  getOrder: async function() {
    
    const { result } = await wx.cloud.callFunction({
      name: 'pay',
      data: {
        type: 'orderquery',
        data: {
          out_trade_no: this.data.out_trade_no
        }
      }
    });

    let data = result.data || {};

    // console.log(data);

    this.setData({
      order: data
    });
  },

  onShow: function(){
    
    // Ob
    if (Object.keys(this.data.address).length) {
      this.setData({
        hasAddress: true,
      })
    }
  }
})
