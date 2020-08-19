// components/itemCounter/itemCounter.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object,
      value: {},
      observer(newValue){
        if(newValue){
          this.setData({quantity: newValue.quantity})
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    quantity: 1
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 按减少按钮的方法
    minusCount(e){
      // 拿到点击时按钮的数据
      let num = this.data.quantity;
      
      // console.log(this.data)
      // 如果大于1，则自减并更新数据
      if (num > 1 ) {
        num--
        this.setData({ quantity: num})
        this.triggerEvent('counttotaltap', num)
      }
    },
    // 按增加按钮的方法
    addCount(e){
      
      let num = this.data.quantity;
      if(num<99) {
        num++
        this.setData({ quantity: num})
        this.triggerEvent('counttotaltap', num)
      }
    }
  }
})
