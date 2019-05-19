var login = {
  // getCurrentPage() {
  //   var pages = getCurrentPages()
  //   var currentPage = pages[pages.length - 1] //获取当前页面的对象
  //   var url = "pages/index/index" //当前页面url
  //   if (currentPage && currentPage.route) {
  //     url = currentPage.route
  //   }
  //   return url
  // },
  getCurrentPageUrlWithArgs:function () {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const url = currentPage.route
    const options = currentPage.options
    let urlWithArgs = `/${url}?`
    for (let key in options) {
      const value = options[key]
      urlWithArgs += `${key}=${value}&`
    }
    urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1)
    return {
      urlWithArgs,
      url,
      options
    }
  },
  _checkSession: function (options) {
    options = options || {}
    options.uId = options.uId || 0
    let that = this
    console.log('options=', options)
    var currPageData = this.getCurrentPageUrlWithArgs()
    console.log('currPageData=', currPageData)
    this.logined = new Promise((resolve, reject) => {
      //登录过期检测
      wx.checkSession({
        success: (res) => {
          // console.log('checkSession')
          // console.log('sessionid=', wx.getStorageSync('sessionid'))
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
                console.log()
                var url = util.getCurrentPage()
                console.log("url=", url, options)

                if (options.jumpUrl) {
                  console.log('进入分享页面', util.perfectUrl(options.jumpUrl), util.jointParams(options))
                  wx[options.pageType]({
                    url: util.perfectUrl(options.jumpUrl) + util.jointParams(options) // 跳到分享頁面
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
    resolve = resolve || function () { }
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
      showLoading: true,
      success(res) {
        console.log("_userLogin", res)
        that.globalData.shareInfo = options
        // res.error_code = 1 // 测试
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
            var url = util.getCurrentPage()
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

        } else {
          that.globalData.shareInfo = options
          wx.redirectTo({
            url: '/pages/auth/auth', // 到授权页
          })
        }

      },
      fail(res) {
        console.log('getSteingfail4=', options, JSON.stringify(options))
        wx.showToast({
          icon: 'none',
          title: res.data.error_code || "登录失败",
          complete() {
            that.globalData.shareInfo = options
            setTimeout(() => {
              wx.redirectTo({
                url: '/pages/auth/auth',
              })
            }, 1000)
          }
        })
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
        } else {
          util.showToast(res.data.error_code || res.data.msg || '加载失败！')
        }
      },
      fail(res) {
        wx.hideLoading()
        util.showToast(res.data.error_code || res.data.msg || '加载失败，请重新授权', () => {
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
}

module.exports = login