Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object,
      value: {},
      observer(){
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
    //点击课程卡片选中产品
    chooseProduct() {
      //发布消息
      // console.log(this.data)
      this.triggerEvent('producttap', this.data.data)
    }
  }
})
