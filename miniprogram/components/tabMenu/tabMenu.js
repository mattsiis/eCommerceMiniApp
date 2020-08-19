// components/tabMenu/tabMenu.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data:{
      type: Array,
      value: [],
      observer(newValue){
        this.setData({title: newValue})
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    title:[]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 切换产品的方法
    toggleProduct(e) {
      // console.log(e)
      // console.log(e)
      // 获取id
      let id = e.currentTarget.dataset.id;
      // // 更新title数据
      let title = this.data.title.map(item => {
        item.cls = item.name == id ? 'choose' : '';
        return item;
      })

      // // 更新数据
      // this.setData({
      //   title: title,
      // })
      // 事件冒泡
      this.triggerEvent('changetabtap', title)
    },
  }
})
