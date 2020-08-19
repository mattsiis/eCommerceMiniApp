// components/orderCube/orderCube.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data:{
      type: Object,
      value: {},
      observer(newValue){
        let orderStatus = ''
        // 显示订单状态
        switch (newValue.status){
          case 0: {
            orderStatus = '订单已关闭'
            break
          }
          case 1: {
            orderStatus = '订单已支付' 
            break
          }
          case 2: {
            orderStatus = '订单待支付'
            break
          }
          case 11: {
            orderStatus = '订单待发货'
            break
          }
          case 12: {
            orderStatus = '订单待收货'
            break
          }
          case 13: {
            orderStatus = '订单已签收'
            break
          }
          case 10: {
            orderStatus = '订单已完成'
            break
          }
          default:{
            orderStatus = '未知订单状态，请联系客服'
          }
        }
        // 计算商品总数量
        let quantity = 0
        for (let i = 0; i < newValue.products.length; i++){
          quantity += newValue.products[i].properties.quantity;
        }
        let shipping = newValue.shippingFee || 0;
        let totalCost = newValue.total_fee
        // 更新数据
        this.setData({
          // 订单状态
          orderStatus: orderStatus,       
          // 商品数量
          quantity: quantity,       
          // 运费
          shippingFee: shipping,
          // 总价
          total: totalCost,
          // out_trade_no
          out_trade_no: newValue.out_trade_no,
          // status
          status: newValue.status
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 触发事件，传出out_trade_no

    orderDetail(e){
      let isPaid = 'FAILED'
      if(!(this.data.status == 0 || this.data.status == 2)){
        isPaid = 'SUCCESS'
      }
      let data = {  'id': this.data.out_trade_no,
                    'res': isPaid}
      this.triggerEvent('orderdetailtap', data)
    }
  }
})
