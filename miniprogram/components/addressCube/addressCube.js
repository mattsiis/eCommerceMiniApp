const regeneratorRuntime = require("../../lib/runtime");

// components/addressCube/addressCube.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 从视图传入的数据
    data: {
      type: Object,
      value: {},
      observer() {
        // console.log(a)
      },
    },
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
    
    // 修改地址
    changeAddress(e){
      // 传入type为‘编辑’
      this.triggerEvent('editaddresstap', e.currentTarget.dataset.type)
    },

    deleteAddress(e){
      wx.showModal({
        title: '确认删除',
        content: '是否删除这条地址信息？',
        complete: (res) =>{
          // 如果确认删除，传出数据给页面处理删除
          if(res.confirm){
            // 传入方法为删除
            this.triggerEvent('editaddresstap', e.currentTarget.dataset.type)
          }
        } 
      })
    },

    setDefault(e){
      // console.log(e)
      this.triggerEvent('editaddresstap', e.currentTarget.dataset.type)
    }
  }
})
