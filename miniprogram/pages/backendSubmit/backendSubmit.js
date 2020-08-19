const regeneratorRuntime = require("../../lib/runtime");
const app = getApp();

// pages/backendSubmit/backendSubmit.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addProduct: {},
    // 缓存的webInfo数据
    webInfo: {},
    // 用户是否授权
    hasAuthorized: false,
    // 用户信息
    userInfo: {},
    // 检查是否可用getUserInfo
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    // 缓存标签数据
    // 默认显示一个
    array: [0], 
    // 所有input的内容
    inputVal: [], 

    // 照片相关数据
    currentPhoto: false,
    // 新主图照片缓存
    photosNewProfile: [],
    // 新详情图照片缓存
    photosNewDetail: [],
    // 新照片路径缓存
    newphotos_url: [],
    // 缓存产品数据
    productData: null,
    // 索引缓存
    index: '',
    // 产品id缓存
    id: '',
    // 产品缓存Data
    product: {},
    // 新的产品列表
    newProducts: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.updateHomePage()
    // this.checkUser()


    // 测试上传图片功能
    // this.formSubmitTest()

    // 测试选择照片功能
    // this.chooseImage();

    
    // // 如果globalData内有userInfo信息
    // if (app.globalData.userInfo) {
    //   // 缓存用户信息
    //   this.setData({
    //     userInfo: app.globalData.userInfo,
    //     hasUserInfo: true
    //   })
    //   // 添加用户
    //   // console.log(this.data.userInfo)
    //   this.addUser(app.globalData.userInfo)
    // } else if (this.data.canIUse) {
    //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //   // 所以此处加入 callback 以防止这种情况
    //   app.userInfoReadyCallback = res => {
    //     this.setData({
    //       userInfo: res.userInfo,
    //       hasUserInfo: true
    //     })

    //     this.addUser(res.userInfo)
    //   }
    // } else {
    //   // 在没有 open-type=getUserInfo 版本的兼容处理
    //   wx.getUserInfo({
    //     success: res => {
    //       app.globalData.userInfo = res.userInfo

    //       this.setData({
    //         userInfo: res.userInfo,
    //         hasUserInfo: true
    //       })
    //       this.addUser(app.globalData.userInfo)
    //     }
    //   })
    // }
  },
  
  /**多词添加标签的方法 */
  //获取input的值
  getInputVal: function (e) {
    // 获取当前索引
    var nowIdx = e.currentTarget.dataset.idx;
    // 获取输入的值
    var val = e.detail.value;
    var oldVal = this.data.inputVal;
    // 修改对应索引值的内容
    oldVal[nowIdx] = val;
    this.setData({
      inputVal: oldVal
    })
  },
  //添加input
  addInput: function () {
    var old = this.data.array;
    // 这里不管push什么，只要数组长度增加1就行
    old.push(1);
    this.setData({
      array: old
    })
  },
  // 删除input
  delInput: function (e) {
    // 当前索引
    var nowidx = e.currentTarget.dataset.idx;
    // 所有的input值
    var oldInputVal = this.data.inputVal;
    // 循环内容
    var oldarr = this.data.array;
    // 删除当前索引的内容，这样就能删除view了
    oldarr.splice(nowidx, 1);    
    // view删除了对应的input值也要删掉
    oldInputVal.splice(nowidx, 1);
    
    if (oldarr.length < 1) {
      // 如果循环内容长度为0即删完了，必须要留一个默认的。这里oldarr只要是数组并且长度为1，里面的值随便是什么
      oldarr = [0]  
    }
    this.setData({
      array: oldarr,
      inputVal: oldInputVal
    })
  },



  // 发布商品
  async updateHomePage(){
    const db = wx.cloud.database();

    let id = this.data.id

    // 查询数据库，取出商品数据
    await db.collection('products').where({id: id}).get({
      // 成狗后，结构data
      success: async ({data}) => {
        // 缓存数据
        this.setData({product: data[0]})
        // 查询数据库，读取主页数据
        await db.collection('webData').doc('homePage').get({
          success: async ({ data }) => {
            // 缓存主页中的商品数据
            let oldProducts = data.products
            // 缓存新商品数据
            let newProductBuffer = this.data.product
            // 删除newProduct中的用户信息
            delete data._id
            delete data._openid
            // 修改新商品数据中的产品数组为第一条数据
            newProductBuffer.productImageUrl = newProductBuffer.productImageUrl[0]
            // 插入产品数据并缓存
            let newProducts = oldProducts[2].data.unshift(newProductBuffer)
            // 缓存新商品数据
            this.setData({ newProducts: data })
            // 更新主页数据
            await db.collection('webData').doc('homePage').update({
              data: this.data.newProducts,
              success: res => (console.log(res)),
              fail: res => (console.log(res))
            })
          }
        })
      }
    })

    


    
  },

  // 选择图片
  async chooseImage(e){

    let items = null;
    let photosType = e.currentTarget.dataset.type
    // 取出缓存中数据
    if (photosType == 'photosNewProfile'){
      items = this.data.photosNewProfile;
    } else {
      items = this.data.photosNewDetail;
    }

    
    // 调用微信选择图片模块
    await wx.chooseImage({
      // 最大可选择几张照片
      count: 9,
      // 照片的大小，原图和压缩图
      sizeType: ['original', 'compressed'],
      // 从相册和相机里拿到照片
      sourceType: ['album', 'camera'],
      success: async res => {
        // 存储临时路径,返回值为一个带有临时路径的数组
        let tempFilePaths = res.tempFilePaths
        // 将数组变成一个有src对象的数组
        for (const tempFilePath of tempFilePaths) {
          await items.push({
            src: tempFilePath
          })
        }
        // 更新数据
        if (photosType == 'photosNewProfile') {
          this.setData({ photosNewProfile: items})
        } else {
          this.setData({ photosNewDetail: items})
        }
      }
    })
  },

  // 上传表单
  async formSubmitTest(e){
    wx.showLoading({
      title: '正在上传',
      icon: 'loading'
    })
    let formData = e.detail.value
    
    formData.badge = this.data.inputVal
    this.setData({id: formData.id})
    // 并发上传图片
    // 创建一个上传任务
    // 取出缓存中已经上传照片的临时路径
    // 传入uploadPhoto中处理
    // 传入三个参数用于文件名命名
    const uploadTasksProfile = this.data.photosNewProfile.map((item, index) => this.uploadPhoto(item.src, index + 1, 'profile', formData.productType, formData.id))
    
    const uploadTasksDetail = this.data.photosNewDetail.map((item, index) => this.uploadPhoto(item.src, index + 1, 'detail', formData.productType, formData.id))

    // 主图上传，等待主图上传后再上传详情图
    await Promise.all(uploadTasksProfile).then(result => {
      wx.hideLoading()
      wx.showToast({
        title: '上传照片成功',
        icon: 'success'
      })
      this.addProduct(result, 'productImageUrl',null)
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '更新产品错误', icon: 'none' })
    })
  
    // 详情图上传
    Promise.all(uploadTasksDetail).then(result => {
      wx.hideLoading()
      wx.showToast({
        title: '上传详情成功',
        icon: 'success'
      })
      this.addProduct(result, 'detailImageUrl', e.detail.value)
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '更新产品错误', icon: 'none' })
    })
  },

  // 将商品数据写入数据库
  // @param 传入的产品数据
  async addProduct(photos, type, productData){
    wx.showLoading({
      title: '正在更新产品',
      icon: 'loading'
    })



    // 取出photoId的链接
    let photoId = await photos.map(photo => {
      return photo.fileID
    })

    // 申明产品数据，该数据包含所有产品信息,用于更新
    let productDataUrl = {};
    
    // 产品图和详情图分开上传
    // 则判断,如果传入的是产品图
    if (type == 'productImageUrl'){
      // 将产品图数组闪频数据中
      productDataUrl[type] = photoId
      // 先缓存产品数据
      this.setData({productData: productDataUrl})
    // 由于详情图后上传
    } else {

      // 先将传入的表单中用户输入的数据存放在产品数据中
      productDataUrl = productData
      
      // 插入初始数据
      productDataUrl['qtySold'] = 0
      productDataUrl['properties'] = {}
      
      // 插入详情图的照片链接
      productDataUrl[type] = photoId
      // 创建数据库实例
      const db = wx.cloud.database();
      // 插入缓存中的产品图链接
      productDataUrl['productImageUrl'] = this.data.productData.productImageUrl
      // 更新数据
      let result = await db.collection('products').add({
        data: productDataUrl
      })
      wx.hideLoading()
      // 返回数据库更新结果
      return result
    }

    wx.hideLoading()
    return
  },

  // 上传图片
  // @filePath 临时路径
  // @index 图片索引
  // @type 图片类型
  // @productType 产品类型
  // @productNum 产品编号
  uploadPhoto(filePath, index, type, productType, id) {

    // 调⽤用wx.cloud.uploadFile 上传⽂文件
    return wx.cloud.uploadFile({
      // 文件名
      cloudPath: `products/${productType}/${id}/images/${type}${index}.png`,
      filePath,
    })
  },

  // 预览图片
  // ######需要让e里携带tphotosType信息
  previewImage(e) {
    const current = e.target.dataset.src
    let photos = null;
    // 如果传回的信息是photosNewProfile里的，则给photo赋值
    if (e.currentTarget.dataset.type == 'photosNewProfile'){
      photos = this.data.photosNewProfile.map(photo => photo.src)
    } else {
      photos = this.data.photosNewDetail.map(photo => photo.src)
    }
    // 调用微信previewImage方法
    wx.previewImage({
      current: current.src,
      urls: photos,
    })
  },

  // 删除图片
  // ###########需要让e里携带photosType信息
  cancel(e) {
    // 找到当前点击下的索引
    const index = e.currentTarget.dataset.index
    // 筛选出选中的元素，创建一个新数组
    // 当前元素的索引值不等于选中的索引，
    let photos = null
    if (e.currentTarget.dataset.type == 'photosNewProfile') {
      photos = this.data.photosNewProfile.filter((p, idx) => idx !== index)
    } else {
      photos = this.data.photosNewDetail.filter((p, idx) => idx !== index)
    }

    // 更新数据
    if (e.currentTarget.dataset.type == 'photosNewProfile') {
      this.setData({
        photosNewProfile: photos
      })
    } else {
      this.setData({
        photosNewDetail: photos
      })
    }   
  },



  // 如果数据库没有此用户，则添加
  async addUser(user) {
    // 如果有用户，则跳出方法
    if (app.globalData.hasUser) {
      return
    }

    // 获取数据库实例例
    const db = wx.cloud.database({})
    // 插⼊入⽤用户信息
    let result = await db.collection('user').add({
      data: {
        nickName: user.nickName,
        albums: []
      }
    })

    app.globalData.nickName = user.nickName
    app.globalData.id = result._id
  },


  // 获取用户信息
  getUserInfo(e) {
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo

      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })

      this.addUser(app.globalData.userInfo)
      // wx.switchTab({ url: '/pages/index/index' })
    }
  },

  // 检查是否有用户
  async checkUser() {
    const db = wx.cloud.database({})

    // user collection 设置权限为仅创建者及管理员可读写
    // 这样除了管理员之外，其它用户只能读取到自己的用户信息
    const user = await db.collection('user').get()

    // 如果没有用户
    if (!user.data.length) {
      app.globalData.hasUser = false
      // 返回false用于判断
      return false
    }

    const userinfo = user.data[0]
    app.globalData.hasUser = true
    app.globalData.id = userinfo._id
    app.globalData.nickName = userinfo.nickName
    // 返回true
    return true
  },



  // 上传产品数据
  async submitData(){
    
    // 产品数据
    let id = '100003';
    let badge = ["包邮"]
    let brand = 'Regalia'
    let name = "蜗牛全效修复面膜"
    let intro = "蜗牛精华面膜 一包五片 滋润美白 全面呵护肌肤健康"
    let price = 15000
    let properties = {}
    let productImageUrl = ['cloud://bajunstore-fe5e52.6261-bajunstore-fe5e52-1258801581/products/Regalia/100003/images/scene1.jpg',
      // 'cloud://bajunstore-fe5e52.6261-bajunstore-fe5e52/products/skincare/300004/images/scene2.jpg',
    // "cloud://bajunstore-fe5e52.6261-bajunstore-fe5e52/products/skincare/300004/images/scene3.jpg",
      "cloud://bajunstore-fe5e52.6261-bajunstore-fe5e52-1258801581/products/Regalia/100003/images/white1.jpg",
      "cloud://bajunstore-fe5e52.6261-bajunstore-fe5e52-1258801581/products/Regalia/100003/images/white2.jpg"
      ]
    let detailImageUrl = ['cloud://bajunstore-fe5e52.6261-bajunstore-fe5e52-1258801581/products/Regalia/100003/images/detail1.jpg',
      // 'cloud://bajunstore-fe5e52.6261-bajunstore-fe5e52-1258801581/products/Regalia/100003/images/detail2.jpg'
      // 'cloud://bajunstore-fe5e52.6261-bajunstore-fe5e52/products/skincare/300004/images/detail2.jpg',
      // 'cloud://bajunstore-fe5e52.6261-bajunstore-fe5e52/products/skincare/300004/images/detail3.jpg',
      // 'cloud://bajunstore-fe5e52.6261-bajunstore-fe5e52/products/skincare/300004/images/detail4.jpg',
      // 'cloud://bajunstore-fe5e52.6261-bajunstore-fe5e52/products/skincare/300004/images/detail5.jpg',
      // 'cloud://bajunstore-fe5e52.6261-bajunstore-fe5e52/products/skincare/300004/images/detail6.jpg',
      // 'cloud://bajunstore-fe5e52.6261-bajunstore-fe5e52/products/skincare/300004/images/detail7.jpg',
      // 'cloud://bajunstore-fe5e52.6261-bajunstore-fe5e52/products/skincare/300004/images/detail8.jpg',
      // 'cloud://bajunstore-fe5e52.6261-bajunstore-fe5e52/products/skincare/300004/images/detail9.jpg',
      // 'cloud://bajunstore-fe5e52.6261-bajunstore-fe5e52/products/skincare/300004/images/detail10.jpg',
      ]
    let time = Date.parse(new Date())
    let inventory = 4
    let type = 0

    // 增加商品数据
    let addData= {
      id,
      badge,
      brand,
      name,
      intro,
      price,
      productImageUrl,
      detailImageUrl,
      time,
      properties,
      inventory
    }

    // 更新主页数据
    let updateHome = {
      id,
      name,
      price,
      productImageUrl: productImageUrl[0]
    }


    // 访问数据库
    let db = wx.cloud.database();

    // 在products集合中插入数据
    db.collection('products').add({
      data: addData,
    })

    // 获取数据库中主页的信息
    await db.collection('webData').doc('homePage').get({
      // 完成后解构data
      complete: async ({ data }) => {
        // 在得到的数据中，在产品里插入数据
        data.products[2].data.unshift(updateHome)
        // 缓存数据
        await this.setData({ webInfo: data })
        // 在数据库中更新数据
        db.collection('webData').doc('homePage').update({
          // data 传入需要局部更新的数据
          data: {
            products: this.data.webInfo.products
          }
        })
      }
    })
  },



  // 临时方法
  goHome(){
    wx.switchTab({
      url: '/pages/index/index',
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