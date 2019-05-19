// pages/auth/auth.js
var App = getApp(), { $Toast } = require('../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shareInfo: {},
    userStatus: -1,// 新老用户 -1：new,1:old (由app.js设置)
    teptoken: '', // 用于注册新用户的临时token (由app.js设置)
    visibleModal1: false,
    visibleModal2: false,
    isShow: 'show',
    modalData1: [ // 
      {
        name: '新用户',
        color: '#8B8B8B',
        fontSize: '24rpx'
      },
      {
        name: '老用户',
        color: '#4DA1FF',
        fontSize: '24rpx'
      }
    ],
    modalData2: [
      {
        name: '取消',
        color: '#8B8B8B',
        fontSize: '24rpx'
      },
      {
        name: '确定',
        color: '#4DA1FF',
        fontSize: '24rpx'
      }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(App.globalData.shareInfo)
    // 接口请求401处理
    let isShow = 'show'
    if (options.isShow) {
      isShow = options.isShow
    }
    console.log(isShow)
    this.setData({
      isShow,
      shareInfo: App.globalData.shareInfo
    })
  },

  getUserInfo(e) {
    var that = this;
    console.log("buttonUserInfo",e)
    console.log("从首页传入的shareInfo=", this.data.shareInfo)
    if (e.detail.userInfo) {
      // let op = {}
      // console.log(JSON.stringify(this.data.shareInfo))
      // if (JSON.stringify(this.data.shareInfo) != '{}') {
      //   let str = this.data.shareInfo
      //   console.log(str)
      //   op = JSON.parse(str)
      // }
      App._xcxLogin('', this.data.shareInfo)
      
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告通知',
        content: '您点击了拒绝授权,将无法正常显示个人信息。',
        showCancel: false,
        success: function (res) {
          // if (res.confirm) {
          //   wx.openSetting({
          //     success: (res) => {
                
          //     }
          //   })
          // }
        }
      });
    }
  },
  // 新老用户选择
  handleModal1(e) {
    console.log('handleModal1', e)
    // let userStatus = App.globalData.userStatus
    let { userStatus, teptoken } = this.data
    if (e.detail.index == 0) {// 新用户(不能点击老用户)
      // if (userStatus == 1) {// 老用户点击新用户时
      //   this.setData({
      //     visibleModal2: true
      //   })
      //   return
      // }
      // App.newUserReg(teptoken)
      this.setData({
        visibleModal2: true
      })
    } else if (e.detail.index == 1) { // 老用户 （能点击新用户，但是需要再次确认）
      // if (userStatus == -1) {// 新用户点击老用户时
      //   App.Util.showToast('您还未有账号')
      //   return
      // }
      wx.navigateTo({
        url: '/pages/mine/set/set_mobile?type=oldUser&teptoken=' + teptoken,
      })
    }
  },
  // 老用户点击新用户提示
  handleModal2(e) {
    let { teptoken } = this.data
    if (e.detail.index == 0) {
      this.setData({
        visibleModal2: false
      })
    } else {
      App.newUserReg(teptoken)
    }
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
    let { isShow, shareInfo} = this.data
    if (isShow == 'hide') {
      $Toast({
        content: '登录中',
        duration: 0,
        type: 'loading'
      });
      App._xcxLogin('', shareInfo)
    }
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
  // onShareAppMessage: function () {

  // }
})