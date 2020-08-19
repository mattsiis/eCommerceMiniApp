//index.js
const app = getApp()
const regeneratorRuntime = require("../../lib/runtime");

Page({
  data: { 
    // 搜索框绑定的数据
    searchValue: '123',
    // banner数据
    banner: [],
    // 滚动视图的高度
    // height: 0,
    // 新品速递数据
    newArrival: [],
    // 课程标题
    productTitle: [],
    // 每一类课程主体，切换tab，将更新该数据，默认显示为第一类
  },

  // 进入搜索界面
  showSearchPage(e) {
    // console.log(e)
    // 清空输入框的值
    this.setData({ serchValue: '' })
    // 导航
    wx.navigateTo({
      url: '/pages/search/search?value=' + e.detail.value,
    })
  },

  
  onLoad: async function() {
    // 获取滚动视图页面高度
    // var height = wx.getSystemInfoSync().windowHeight
    /* 从云数据中抓取文件 */
    // 创建数据库实例
    // const db = await wx.cloud.database().collection('webData');
    const db = await wx.cloud.database().collection('webData').doc('homePage');
    
    
    db.get({
      complete: ({data}) => {
        // 从data的product里取出数据，并重新建立一个数组。
        // 该数组仅包含id和title
        let productTitle = data.products.map(({ id, title }) => ({ id, title }))
        // 第一个title默认选中
        productTitle[0].cls = 'choose';
        
        this.setData({
          // banner 数据
          banner: data.banner,
          // 新品速递数据
          newArrival: data.newArrival,
          // 产品标题
          productTitle,
          // 产品数据
          products: data.products[0].data,
          // 所有产品数据，为了渲染单个类别的产品
          allProducts: data.products
        })
      }
    })
  },

  // 切换产品的方法
  toggleProduct(e) {
    // console.log(e)
    // 获取id
    let id = e.target.dataset.id;
    // 更新title数据
    let productTitle = this.data.productTitle.map(item => {
      item.cls = item.id == id ? 'choose' : '';
      return item;
    })
    // console.log(productTitle)
    // 课程主体
    // let lessons = this.data.allLesson.filter(item => item.id == id)[0].data
    // find 方法更方便
    let products = this.data.allProducts.find(item => item.id == id).data
    // 更新数据
    this.setData({
      productTitle,
      products
    })
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

  
  onGetUserInfo: function(e) {

  },

  onGetOpenid: function() {
   
  },
})
