// components/productCube/productCube.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object,
      value: {},
      observer(newValue) {
        // 更新组件数据
        this.setData({
          num: newValue.properties.quantity,
          price: newValue.properties.quantity * newValue.price
        })
        
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    num: 1,
    price: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    chooseProduct() {
      //发布消息
      // console.log(this.data)
      this.triggerEvent('producttap', this.data.data)
    },


    // 计算单品总价
    countTotalPrice(e){
     
      // 从缓存中查找有多少个商品
      let num = e.detail

      // 定义商品单价
      let price = this.data.data.price;
      price = price * num;
      
      // console.log(price)
      // 更新数据
      this.setData({price: price})
      let info = {'price': price, 'num': num}
      // 事件冒泡
      this.triggerEvent('totalpricetap', info)
    }
  }
})
