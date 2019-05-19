//index.js
//获取应用实例
const App = getApp()
const { $Toast } = require('../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: {}, // 可能是分享传入的值
    userStatus: -1,// 新老用户 -1：new,1:old (由app.js设置)
    teptoken: '', // 用于注册新用户的临时token (由app.js设置)
    visibleModal1: false,
    visibleModal2: false,
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
    // var url = App.Util.getCurrentPage()
    // // console.log('indexloadurl=', url)
    // // console.log("options",options)
    // // console.log('sessionid', wx.getStorageSync('sessionid'), url == "pages/index/index", url === "pages/index/index")
    
    // $Toast({
    //   content: '加载中',
    //   duration: 0,
    //   type: 'loading'
    // });
    // if (wx.getStorageSync('sessionid') && url == "pages/index/index") {
    //   wx.switchTab({
    //     url: '/pages/home/home',
    //   })
    // }
    this.setData({
      options
    })
    console.log('index页面',options)
    
    
  },
  // 新老用户选择
  handleModal1(e) {
    console.log('handleModal1',e)
    // let userStatus = App.globalData.userStatus
    let { userStatus, teptoken } = this.data
    if (e.detail.index == 0) {// 新用户(不能点击老用户)
      // if (userStatus == 1) {// 老用户点击新用户时
      //   this.setData({
      //     visibleModal2: true
      //   })
      //   return
      // }
      this.setData({
        visibleModal2: true
      })
      // App.newUserReg(teptoken)
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
    let { teptoken} = this.data
    if (e.detail.index == 0) {
      this.setData({
        visibleModal2: false
      })
    }else {
      App.newUserReg(teptoken)
    }
  },
  // _checkSession: function (options) {
  //   this.logined = new Promise((resolve, reject) => {
  //     //登录过期检测
  //     wx.checkSession({
  //       success: (res) => {
  //         console.log('checkSession')
  //         if (!wx.getStorageSync('sessionid')) {
  //           this._xcxLogin(resolve)
  //           console.log('checkSession 1')
  //         } else { // 未过期
  //           console.log('checkSession 2')
  //           let userInfo = wx.getStorageSync('globalData').userInfo
  //           // 已经登录过的，重新更新用户信息
  //            if(options != {} && options.shareId && options.shareId>=0 && (!userInfo.shopId || userInfo.shopId <= 0)) {
  //             wx.redirectTo({
  //               url: options.jumpUrl+'?parentUId='+options.uId+'&parentShopId='+options.shopId
  //             })
              
  //            }else {
  //             setTimeout(() => {
  //               var url = App.Util.getCurrentPage()
  //               console.log("url=", url)
  //               if ((url == 'pages/index/index') || (url == 'pages/auth/auth')) {
  //                 wx.switchTab({
  //                   url: '/pages/home/home', // 回首页
  //                 })
  //               }
  //             }, 500)
  //            }
            
  //           resolve()
  //         }
  //       },
  //       fail: (res) => {
  //         console.log('fail1')
  //         //登录态过期
  //         this._xcxLogin(resolve)
  //       }
  //     })
  //   })
  // },
  // // 1小程序登录
  // _xcxLogin(resolve) {
  //   console.log('_xcxLogin')
  //   var that = this
  //   wx.login({
  //     success: result => {
  //       if (result.code) {
  //         this.getUserInfo(result.code, resolve)
  //       }
  //       // 发送 res.code 到后台换取 openId, sessionKey, unionId
  //     },
  //     fail(res) {
  //       if (res.code == 401) {
  //         wx.showToast({
  //           icon: 'none',
  //           title: '授权超时',
  //         })
  //       } else {
  //         wx.showToast({
  //           icon: 'none',
  //           title: res.data && res.data.error_code ? res.data.error_code : res.errMsg,
  //         })
  //       }
  //     }
  //   })
  // },
  // // 2获取用户信息
  // getUserInfo(code, resolve) {
  //   console.log('getUserInfo')
  //   let pageOptions = this.data.options
  //   wx.getSetting({
  //     success: res => {
  //       console.log("getSetting", res)
  //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
  //       if (res.authSetting['scope.userInfo']) {
  //         wx.getUserInfo({
  //           success: res => {
  //             console.log("getUserInfo", res)
  //             // 合并用户信息
  //             this.assignUserInfo(res.userInfo)
  //             if (App.globalData) App.globalData.userInfo = res.userInfo

  //             // 可以将 res 发送给后台解码出 unionId
  //             this._userLogin({
  //               iv: res.iv,
  //               code: code,
  //               encryptedData: res.encryptedData
  //             })

  //             // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
  //             // 所以此处加入 callback 以防止这种情况
  //             if (this.userInfoReadyCallback) {
  //               this.userInfoReadyCallback(res) 

  //             }

  //             resolve && resolve()

  //           },
  //           fail: res => {
  //             wx.redirectTo({
  //               url: '/pages/auth/auth?data=' + JSON.stringify(pageOptions),
  //             })
  //           }
  //         })
  //       } else {
  //         wx.redirectTo({
  //           url: '/pages/auth/auth?data=' + JSON.stringify(pageOptions),
  //         })
  //       }
  //     }
  //   })
  // },
  // // 3用户登录
  // _userLogin(options, callback) {
  //   // console.log('getUserInfo')
  //   // console.log(options)
  //   var that = this
  //   let pageOptions = this.data.options
  //   App.Util.request({
  //     url: App.Api.loginUrl,
  //     data: {
  //       code: options.code || '',
  //       iv: options.iv || '',
  //       encryptedData: options.encryptedData || ''
  //     },
  //     showLoading: true,
  //     success(res) {
  //       console.log("_userLogin222222222222222222222", res)
  //       if (res.error_code == 0) {
  //         wx.setStorageSync('sessionid', res.sessionid)
  //         if (res.userInfo) {

  //           // res.userInfo.u_id = 1 // 测试时使用

  //           // 合并用户信息
  //           that.assignUserInfo(res.userInfo)
  //           if (App.globalData) App.globalData.userInfo = Object.assign(res.userInfo, App.globalData.userInfo)
  //         }

  //         callback && callback(res)
  //         // 如果onLoad有参数，且有shareId是分享进入的
  //         /**
  //          * 进入招商注册页可能的情况
  //          * 1
  //          * 2
  //          * 3
  //          */
          
  //         if (pageOptions != {} && pageOptions.shareId && pageOptions.shareId>=0 && (!res.userInfo.shopId || res.userInfo.shopId <= 0)) {
  //           wx.redirectTo({
  //             url: pageOptions.jumpUrl+'?parentUId='+pageOptions.uId+'&parentShopId='+pageOptions.shopId
  //           })
  //         }else { // 如果没有参数，就正常登录
  //           var url = App.Util.getCurrentPage()
  //           console.log("url", url)
  //           if ((url == 'pages/index/index') || (url == 'pages/auth/auth')) {
  //             wx.switchTab({
  //               url: '/pages/home/home', // 回首页
  //             })
  //           }
  //         }

  //       } else {
  //         wx.redirectTo({
  //           url: '/pages/auth/auth?data=' + JSON.stringify(pageOptions), // 到授权页
  //         })
  //       }

  //     },
  //     fail(res) {
  //       wx.showToast({
  //         icon: 'none',
  //         title: res.data.error_code || "登录失败",
  //         complete() {
  //           setTimeout(() => {
  //             wx.redirectTo({
  //               url: '/pages/auth/auth?data=' + JSON.stringify(pageOptions),
  //             })
  //           }, 1000)
  //         }
  //       })
  //     }
  //   })
  // },
  // //合并Storage用户信息
  // assignUserInfo(resUserInfo) {
  //   var userInfo = wx.getStorageSync('globalData').userInfo || {}
  //   wx.setStorageSync('globalData', { userInfo: Object.assign(resUserInfo, userInfo) })
  //   return Object.assign(resUserInfo, userInfo)
  // },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    App._checkSession(this.data.options)
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