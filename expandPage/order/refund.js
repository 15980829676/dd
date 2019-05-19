const App = getApp();
const {
  $Toast, 
  $Message
} = require('../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId:'', // 订单id（上个）
    orderInfo: {},// 订单信息
    userInfo: {}, // 用户信息
    formInfo: {}, // 表单信息
    visibleModal: false,// 退款提示弹框
    modalData: [ // 退款提示弹框
      {
        name: '取消',
        color: '#333',
        fontSize: '24rpx'
      },
      {
        name: '确定',
        color: '#4da1ff',
        fontSize: '24rpx'
      }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = wx.getStorageSync('globalData').userInfo
    this.setData({
      options,
      userInfo
    })
    this.getOrderInfo()
  },
  // 获取订单详情
  getOrderInfo() {
    let { userInfo, options } = this.data, that = this
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.odsOrderInfo,
      data: {
        id: options.id, 
        shopid: userInfo.shopId, 
      },
      method: "POST",
      success(res) {
        $Toast.hide()
        if (res && res.data) {
          res.data.brief = App.Util.changeImgUrl(res.data.brief,'img')
          res.data.brief.forEach((item,index) => {
            if (item.img) {
              item.img = App.Util.buildImageUrl(item.img)
            }
            if (item.pic) {
              item.pic = App.Util.buildImageUrl(item.pic)
            }
          })
          that.setData({
            orderInfo: res.data
          })
        }
        
      },
      fail(res) {
        $Toast.hide()
        App.Util.showToast(res.data.msg || '获取订单详情失败！')
      }
    })
  },
  // 输入信息
  inputMessage(e) {
    this.setData({
      'formInfo.msg': e.detail.value
    })
  },
  // 确定退款按钮
  confimRefund() {
    this.setData({
      visibleModal: true
    })
  },
  handleClose(e) {
    this.setData({
      visibleModal: false
    })
    if (e.detail.index == 1) {
      this.userRefund()
    }
  },
  // 退款
  userRefund() {
    let {id} = this.data.options,
      { msg } = this.data.formInfo
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.lingsOrderSellerrefund,
      method: "POST",
      data: {
        id, // 订单ID
        reason: 3, // 退款类型
        msg: msg || '', // 退款原因
      },
      success(res) {
        // console.log(res)
        $Toast.hide()
        $Message({
          content: '退款成功！',
          callback() {
            wx.navigateBack({
              delta: 1
            })
          }
        });
      },
      fail(res) {
        $Toast.hide()
        let msg = (res && res.data) ? res.data.msg : '退款失败！'
        $Message({
          content: msg,
          callback() {
            
          }
        });
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