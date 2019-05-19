//app.js
var mta = require('./utils/mta_analysis.js')
App({
  Util: require("./utils/util.js").util,
  Api: require("./utils/api.js"),
  logined: null,
  onLaunch: function(options) {
    var that = this
    console.log('onLaunch1', options)
    //  this._checkSession()
    console.log('onLaunch2', options)
    //腾讯统计代码
    mta.App.init({
      "appID": "500678798",
      "eventID": "500678802",
      "statShareApp": true
    });
   // mta.Data.userInfo = { 'open_id': 'oiDJkdkfek-dkwien', 'phone': 18718600001 };  用户画像

    
  },
  onShow() {
    // if (wx.canIUse("getUpdateManager")) {
    //   let updateManager = wx.getUpdateManager();
    //   updateManager.onCheckForUpdate((res) => {
    //     // 请求完新版本信息的回调
    //     console.log(res.hasUpdate);
    //   })
    //   updateManager.onUpdateReady(() => {
    //     wx.showModal({
    //       title: '更新提示',
    //       content: '新版本已经准备好，是否重启应用？',
    //       success: (res) => {
    //         if (res.confirm) {
    //           // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
    //           updateManager.applyUpdate();
    //         } else if (res.cancel) {
    //           return false;
    //         }
    //       }
    //     })
    //   })
    //   updateManager.onUpdateFailed(() => {
    //     // 新的版本下载失败
    //     wx.hideLoading();
    //     wx.showModal({
    //       title: '升级失败',
    //       content: '新版本下载失败，请检查网络！',
    //       showCancel: false
    //     });
    //   });
    // }  


  },

  _checkSession: function(options) {
    options = options || {}
    options.uId = options.uId || 0
    let that = this
    console.log('options=', options)
    this.logined = new Promise((resolve, reject) => {
      //登录过期检测
      wx.checkSession({
        success: (res) => {
          console.log('checkSession')
          console.log('sessionid=', wx.getStorageSync('sessionid'))
          if (!wx.getStorageSync('sessionid')) {
            this._xcxLogin(resolve, options)
            console.log('checkSession 1')
          } else {
            console.log('checkSession 2')

            let userInfo = wx.getStorageSync('globalData').userInfo
            
            // 没有店铺 或 者有店铺且未绑定上级，跳到经销商页面
            if ((!userInfo.shopId || userInfo.shopId <= 0) || (userInfo.seltype == 0 && userInfo.parentId == 0)) {
              console.log('进入招商页', userInfo, options)
              wx.redirectTo({
                url: '/pages/shopMerchants/index?parentUId=' + options.uId
              })

            } else {

              setTimeout(() => {
                var url = that.Util.getCurrentPage()
                console.log("url=", url, options)

                if (options.jumpUrl) {
                  console.log('进入分享页面', that.Util.perfectUrl(options.jumpUrl), that.Util.jointParams(options))
                  wx[options.pageType]({
                    url: that.Util.perfectUrl(options.jumpUrl) + that.Util.jointParams(options) // 跳到分享頁面
                  })
                } else if ((url == 'pages/index/index') || (url == 'pages/auth/auth')) {
                  console.log('进入首页')
                  wx.switchTab({
                    url: '/pages/home/home', // 回首页
                  })
                }
              }, 500)
            }

            resolve()

          }
        },
        fail: (res) => {
          console.log('fail1')
          //登录态过期
          this._xcxLogin(resolve, options)
        }
      })
    })
  },
  // 1小程序登录
  _xcxLogin(resolve, options) {
    console.log('_xcxLogin')
    options = options || {}
    options.uId = options.uId || 0
    resolve = resolve || function() {}
    var that = this
    wx.login({
      success: result => {
        if (result.code) {
          options.code = result.code
          this.getUserInfo(resolve, options)
        }
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
      fail(res) {
        if (res.code == 401) {
          wx.showToast({
            icon: 'none',
            title: '授权超时',
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: res.data && res.data.error_code ? res.data.error_code : res.errMsg,
          })
        }
      }
    })
  },
  // 2获取用户信息
  getUserInfo(resolve, options) {
    let that = this
    resolve = resolve || function() {}
    console.log('getUserInfo')
    wx.getSetting({
      success: res => {
        console.log("getSetting", res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log("getUserInfo", res)
              // 合并用户信息
              this.assignUserInfo(res.userInfo)
              if (this.globalData) this.globalData.userInfo = res.userInfo

              // 可以将 res 发送给后台解码出 unionId
              options.iv = res.iv
              options.encryptedData = res.encryptedData
              this._userLogin(options)

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }

              resolve && resolve()

            },
            fail: res => {
              that.globalData.shareInfo = options
              wx.redirectTo({
                url: '/pages/auth/auth',
              })
            }
          })
        } else {
          that.globalData.shareInfo = options
          wx.redirectTo({
            url: '/pages/auth/auth',
          })
        }
      }
    })
  },
  // 3用户登录
  _userLogin(options, callback) {
    // console.log('getUserInfo')
    // console.log(options)
    
    var that = this
    this.Util.request({
      url: this.Api.loginUrl,
      data: {
        code: options.code || '',
        iv: options.iv || '',
        encryptedData: options.encryptedData || ''
      },
      showLoading: this.Util.jump401? false : true,
      success(res) {
        console.log("_userLogin", res)
        that.globalData.shareInfo = options
        // res.error_code = '登录失败' // 测试
        if (res.error_code == 0) {
          wx.setStorageSync('sessionid', res.sessionid)
          if (res.userInfo) {

            // res.userInfo.u_id = 1 // 测试时使用

            // 合并用户信息
            that.assignUserInfo(res.userInfo)
            if (that.globalData) that.globalData.userInfo = Object.assign(res.userInfo, that.globalData.userInfo)
          }

          callback && callback(res)

          // 是否进入招商页
          if ((!res.userInfo.shopId || res.userInfo.shopId <= 0) || (res.userInfo.seltype == 0 && res.userInfo.parentId == 0)) {
            console.log('登录成功，进入经销商页面')
            wx.redirectTo({
              url: '/pages/shopMerchants/index?parentUId=' + options.uId
            })
          } else { // 如果没有参数，就正常登录
            console.log('登录成功，回到首页')
            var url = that.Util.getCurrentPage()
            console.log("url", url)
            if ((url == 'pages/index/index') || (url == 'pages/auth/auth')) {
              wx.switchTab({
                url: '/pages/home/home', // 回首页
              })
            }
          }

        } else if (res.error_code == -1) { // 新老用户第一次登录小程序，身份选择
          // res.error_code == 1 h5有账号（旧用户）
          // res.error_code == -1 新用户
          let curPage = getCurrentPages()
          curPage = curPage.pop()
          curPage.setData({
            visibleModal1: true, // 打开新老用户选择弹框
            userStatus: res.error_code, // 新老用户的状态
            teptoken: res.teptoken || '', // 临时token
          })

        } else{
          if (res && isNaN(res.error_code)) that.Util.showToast(res.error_code)
          let currPage = getCurrentPages()
          if (currPage && currPage == 'pages/auth/auth') {
            return
          }
          that.globalData.shareInfo = options
          wx.redirectTo({
            url: '/pages/auth/auth', // 到授权页
          })
        }

      },
      fail(res) {
        let title = (res && res.data && res.data.error_code) ? res.data.error_code : (res && res.errMsg ? res.errMsg : "登录失败")
        console.log('getSteingfail4=', options, JSON.stringify(options))
        wx.showToast({
          icon: 'none',
          title,
          complete() {
            that.globalData.shareInfo = options
            setTimeout(() => {
              wx.redirectTo({
                url: '/pages/auth/auth',
              })
            }, 1000)
          }
        })
      },
      complete() {
        that.Util.jump401 = false
      }
    })
  },
  // 新用户注册
  newUserReg(teptoken) {
    wx.showLoading({
      title: '加载中',
    })
    let that = this,
      shareInfo = that.globalData.shareInfo
    wx.request({
      url: that.Api.newUserReg,
      data: {
        teptoken
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success(res) {
        console.log('newUserReg=', res)
        if (res.data.error_code == 1) {
          that.assignUserInfo(res.data.userInfo)
          wx.setStorageSync('sessionid', res.data.sessionid)
          wx.redirectTo({
            url: '/pages/shopMerchants/index?parentUId=' + shareInfo.uId
          })
          wx.hideLoading()
        }else {
          that.Util.showToast(res.data.error_code  || res.data.msg || '加载失败！')
        }
      },
      fail(res) {
        wx.hideLoading()
        that.Util.showToast(res.data.error_code  || res.data.msg || '加载失败，请重新授权', () => {
          wx.redirectTo({
            url: '/pages/auth/auth',
          })
        })
        
      }
    })
  },
  //合并用户信息
  assignUserInfo(resUserInfo) {
    var userInfo = wx.getStorageSync('globalData').userInfo || {}
    wx.setStorageSync('globalData', {
      userInfo: Object.assign(resUserInfo, userInfo)
    })
  },
  globalData: {
    userInfo: null,
    carousel: [], //首页轮播图 营销组件里暂时用
    shareInfo: {},
    version:'',  //版本日记
    goodid:'',   //再来一单的订单id 标识
    pageThis: {} // 保存结算页的实例，方便使用该页面实例
  }
})
// 停止加载
function stopShowLoad(showLoading) {
  if (showLoading) wx.hideLoading()
  wx.stopPullDownRefresh()
  wx.hideNavigationBarLoading()
}