var api = require("./api.js"),
  //  login = require("./login.js"),
  CountUp = require("../dist/w-count-up/index.js"),
  App = getApp();
const formatTime = (date, options) => {
  options = options || {}
  let sym = options.sym || '/' // 符号
  let precise = options.precise // 精确 s

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  let str = ''
  if (precise == 'min') {
    str = [year, month, day].map(formatNumber).join(sym) + ' ' + [hour, minute].map(formatNumber).join(':')
  } else {
    str = [year, month, day].map(formatNumber).join(sym) + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }

  return str
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
// 停止加载
function stopShowLoad(showLoading) {
  if (showLoading) wx.hideLoading()
  wx.stopPullDownRefresh()
  wx.hideNavigationBarLoading()
}
var util = {
  showToast: function(title, complete) {
    wx.showToast({
      title: title,
      icon: 'none',
      image: '',
      duration: 1500,
      mask: true,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {
        setTimeout(() => {
          complete && complete()
        }, 1000)
      },
    })
  },
  hideToast: function() {
    wx.hideToast()
  },
  jump401: false,
  request: function(options) {
    var that = this
    options = options || {}
    var url = options.url || ''
    var data = options.data || {}
    var header = options.header || ''
    var method = options.method || 'GET'
    var success = options.success || function() {}
    var fail = options.fail || function() {}
    var complete = options.complete || function() {}

    var self = options.self || function() {}
    
    var showLoading = options.showLoading || false
    var loadTitle = options.loadTitle || '加载中'
    if (showLoading) {
      wx.showLoading({
        title: loadTitle,
        mask: true
      })
    }
    var sessionid = wx.getStorageSync('sessionid')
    var urlStr = ''
    if (sessionid && sessionid != '') urlStr = '?token=' + sessionid
    wx.request({
      url: url + urlStr,
      data: data,
      header: {
        'content-type': header == 'json' ? 'application/json' : 'application/x-www-form-urlencoded'
      },
      method: method,
      dataType: 'json',
      responseType: 'text',
      success: function(res) {
        // console.log("原始res=",res)
        stopShowLoad(showLoading)
        // res.data.code = 401 // 测试
        if (res.statusCode == 200) {

          if (res.data.code == 200 || res.data.error_code == 0) {
            success && success(res.data)
          } else if (res.data.code == 401) {
            // fail && fail(res)
            if (!that.jump401) {
              that.jump401 = true
              that.showToast(res.data.msg || '登录超时', () => {
                wx.reLaunch({
                  url: '/pages/auth/auth?isShow=hide',
                })
              })
            }
            return false
          } else if (res.data && !res.data.code && res.errMsg == "request:ok") {
            success && success(res.data)
          } else {
            fail && fail(res)
            // that.showToast((res.data.error_code && !Number(res.data.error_code)) ? res.data.error_code : (res.data.msg || '数据获取失败'))
            return false
          }

        } else if (res.statusCode == 500) {
          fail && fail(res)
          that.showToast('服务器连接失败')
          return false

        } else {
          fail && fail(res)
          that.showToast(res.data.msg || res.errMsg || '数据获取失败')
          return false

        }

      },
      fail: function(res) {
        fail && fail(res)
        stopShowLoad(showLoading)
      },
      complete: function(res) {
        complete && complete(res)
        // stopShowLoad(showLoading)
      },
    })
  },
  getCurrentPage() {
    var pages = getCurrentPages()
    var currentPage = pages[pages.length - 1] //获取当前页面的对象
    var url = "pages/index/index" //当前页面url
    if (currentPage && currentPage.route) {
      url = currentPage.route
    }
    return url
  },
  // 检测单张图片路径
  buildImageUrl(path) {
    if (String(path).indexOf("http://") >= 0 || String(path).indexOf("https://") >= 0) {
      return path
    }
    return api.imghost + path
  },
  // 检测数据图片路径
  changeImgUrl(list, imgKey) {
    for (var index in list) {
      list[index][imgKey] = this.buildImageUrl(list[index][imgKey])
    }
    return list
  },
  // 上拉加载
  loadMore(that, options) {
    // 1.start: 起始条数 nums:每页加载多少条数据
    // 2.start: 起始页数（应设置默认值为1）nums: 每次增加1页（应设置默认值为1）接口的num(加载条数另外写)
    var self = this
    var type = options.type || 'refresh'
    var currentPageListName = options.currentPageListName || '' // 当前页面保存列表的名称
    var dealWithData = options.dealWithData // 处理数据
    // var dealWithData = {
    //   convertImgMode,// '转换图片方式：标签tag/http'
    //   convertImgKey,// '图片转换关键字 img'
    //   dataArrMode// '数据数组形式：普通(不处理)common/二维数组twoDimensional'
    // }
    var load_params = that.data.load_params
    // 是否加载完成
    if (!load_params.loadend) {

      if (type == 'pull') {
        that.setData({
          'load_params.loadmore': true
        })
      }

      that._getList.then((res) => {

        var data = res // 目前加载数据
        var list = that.data[currentPageListName] // 获取之前保存的数据
        if (list.length <= 0 && (!data || data.length == 0)) {
          that.setData({
            'load_params.empty': true
          })
          return false
        } else if (list.length > 0 && !data) {
          // 之前有数据 上拉加载后无数据
          that.setData({
            'load_params.loadmore': false,
            'load_params.loadend': true
          })
          return false
        } else if (data && data.length < load_params.nums) {
          // (list.length > 0 &&之前有数据) 上拉加载后数据数量小于加载目标 说明已全部加载完
          that.setData({
            'load_params.loadend': true
          })
        }
        // 处理加载出来的数据
        if (dealWithData) data = dealWithData(data)
        // if (dealWithData.dataArrMode == 'common') {
        // 不处理
        // }
        // if (dealWithData.dataArrMode == 'twoDimensional') {

        // }
        // if (dealWithData.convertImgMode == 'tag') {

        // }
        // if (dealWithData.convertImgMode == 'http') {

        // }

        if (type == 'refresh') { // 刷新
          list = data
        } else if (type == 'pull') { // 上拉
          list = list.concat(data)
        }

        that.setData({
          [currentPageListName]: list,
          'load_params.start': load_params.start += load_params.nums,
          'load_params.loadmore': false
        })
        options.callback && options.callback(list)

        self.wxStop()
      })
    }
  },
  wxStop: function() {
    wx.stopPullDownRefresh()
    wx.hideNavigationBarLoading()
    wx.hideLoading()
  },
  // 将数组数据存储为二维数组
  changeArrForTwoDim: function(list, rowNum) {
    var res = list
    var datas = []
    var data = []
    var oldIndex = 0
    // 向上取整 获得组（rowNum一组）
    var group = Math.ceil(res.length / rowNum)
    for (var i = 1; i <= group; i++) {
      var idx = 0
      res.forEach((item, index) => {
        // 如果当前索引小于一组展示商品数量 && 索引加一 大于之前保存的组
        // group:1 
        if (index < i * rowNum && index + 1 > oldIndex) {
          item.self_group = i - 1 // 该商品所在的分组
          item.self_index = idx // 该商品所在的分组的索引
          item.self_showBtn = false // 该商品是否显示按钮
          data.push(item)
          idx++
        }
      })
      datas.push(data)
      data = []
      oldIndex = i * rowNum
    }
    return datas
  },
  // 转换图片路径
  switchImg: function(data, imgKey) {
    if (data) {
      data.map((item, index) => {
        var imgTag = this.datailshtml(item[imgKey])
        // 还原img标签
        var reg = imgTag.match(/src="(\S*)(?=" )/)[1];
        // 判断http并设置内容
        item[imgKey] = this.buildImageUrl(reg)
      })
    }
    return data
  },
  datailshtml: function(html) {

    var regs = {
      'lt': '<',
      'gt': '>',
      'nbsp': ' ',
      'amp': '&',
      'quot': '"'
    };
    var desc = html.replace(/&(lt|gt|nbsp|amp|quot);/ig, function(all, t) {
      return regs[t];
    });

    desc = desc.replace(/src="\/images/g, 'src="' + api.imghost)
    return desc;

  },
  // 获取节点高度或者页面高度
  getNodeHeight: function(str, node) {
    var height = 0
    if (str == 'window') {
      height = wx.getSystemInfoSync().windowHeight * 2 // rpx
    } else if (str == 'node') {

    }
    return height
  },
  // 获取系统信息
  getSystemInfoSync() {
    const systemInfo = wx.getSystemInfoSync()
    return systemInfo
  },
  countUp: function(options) {
    var startVal = options.startVal || 0 //开始值
    var endVal = parseFloat(options.count) || 0 //结束值
    var decimals = options.decimals || 2 //小数点位数
    var duration = options.duration || 1 //过渡时间
    var count = parseFloat(options.count) || 0 // 当前需要变动的数据
    var callback = options.callback || '' // 回调

    new CountUp(startVal, endVal, decimals, duration, function(count) {
      callback && callback(count)
    }).start()
  },
  // 兼容iphoneX tabBar
  checkPhoneType(that) {
    // 获取手机型号兼容iphoneX
    let systemInfo = this.getSystemInfoSync()
    // console.log('systemInfo',systemInfo, systemInfo.model.indexOf("iPhone X") ,systemInfo.model.indexOf("iPhone X") != -1)
    // 单位px
    let height = 50
    if (systemInfo.model.indexOf("iPhone X") != -1) {
      height = 82
    }
    return height
  },
  // 获取通知数量
  getNoticeCount: function(options) {
    options = options || {}
    let that = this
    this.request({
      url: api.noticeMsgCount,
      data: {},
      success(res) {
        if(res && !res.data) {
          that.showToast(res.msg || '获取消息数量失败')
          return 
        }
        if (Number(res.data.dot_count) > 0 && res.data && res.data.dot_count) {
          options.success && options.success(res.data.dot_count)
          wx.setTabBarBadge({
            index: 3,
            text: Number(res.data.dot_count) > 99 ? '99+' : res.data.dot_count + '',
          })
        } else {
          wx.removeTabBarBadge({
            index: 3,
          })
        }

      },
      fail(e) {

      }
    })
  },
  // 校验手机号
  checkPhone(phone) {
    return (/^1[34578]\d{9}$/.test(phone))
  },
  //减法 
  Subtr(arg1, arg2) {
    var r1, r2, m, n;
    try {
      r1 = arg1.toString().split(".")[1].length
    } catch (e) {
      r1 = 0
    }
    try {
      r2 = arg2.toString().split(".")[1].length
    } catch (e) {
      r2 = 0
    }
    m = Math.pow(10, Math.max(r1, r2));
    n = (r1 >= r2) ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(n);
  },
  //加法函数
  accAdd: function(arg1, arg2) {
    var r1, r2, m;
    try {
      r1 = arg1.toString().split(".")[1].length;
    } catch (e) {
      r1 = 0;
    }
    try {
      r2 = arg2.toString().split(".")[1].length;
    } catch (e) {
      r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));
    return (arg1 * m + arg2 * m) / m;
  },
  // 创建订单
  creatOrder(options) {
    options = options || {}
    var addressId = options.addressId || '' // 地址id
    var ids = options.ids || [] // 商品id
    var props = options.props || [] // 商品属性id
    var buytype = options.buytype || 1
    var shiptype = options.shiptype || 3
    var devtype = options.devtype || 0
    var cash = options.cash || 0
    var mark = options.mark || '' //备注
    var extractTime = options.extractTime || '' //自提时间戳 （传入的值要除以1000）
    var gift = options.gift || []
    var subtype = options.subtype || '' // 复制订单
    var nums = options.nums || [] // 复制订单
    var p_shop_id = wx.getStorageSync('globalData').userInfo.p_shop_id // 上级店铺id （0为直属）
    var that = this
    // this.showToast('正在创建订单...')
    
    this.request({
      url: api.sellerCreateOrder,
      data: {
        shopid: p_shop_id,
        ids: JSON.stringify(ids),
        props: JSON.stringify(props),
        buytype: buytype,
        address: addressId,
        extractTime,
        shiptype,
        cash, // 
        devtype,
        gift,
        mark,
        subtype,
        nums: JSON.stringify(nums)
      },
      method: 'POST',
      success(res) {

        // 订单信息
        options.success && options.success(res)
        wx.hideToast()
      },
      fail(res) {
        wx.hideToast()
        that.showToast(res.data.msg || '创建订单失败！')
        options.fail && options.fail(res)
      },
      complete() {
        options.complete && options.complete()
      }
    })
  },
  // 支付总接口
  orderPay(options) {
    this.showToast('正在提交订单...')
    var that = this
    this.request({
      url: api.sellerOrderPay,
      data: {
        order_sn: options.order_sn,
        type: options.type, // 1 微信支付 、2 余额或提现
        baltype: options.baltype ? JSON.stringify(options.baltype) : '', // 1:余额,2:提现 数组类型
        paytype: 1
      },
      method: 'POST',
      success(res) {
        wx.hideToast()
        if(res && res.code == 200) {
          options.success && options.success(res.data)
        }else {
          options.fail && options.fail(res)
        }
      },
      fail(res) {
        wx.hideToast()
        if (!options.fail) that.showToast(res.data.msg || '订单提交失败！')
        options.fail && options.fail(res)

      },
      complete() {
        options.complete && options.complete()
      },
    })
  },
  // 微信支付
  wechatPay(options) {
    console.log('wechatPay', options)
    options = options || {}

    wx.requestPayment({
      'timeStamp': options.timeStamp,
      'nonceStr': options.nonceStr,
      'signType': options.signType || "MD5",
      'package': options.package,
      'paySign': options.paySign,
      success(res) {
        console.log("wechatPay", res)
        options.success && options.success(res)
        // $Message({
        //   content: '支付成功！',
        //   type: 'default',
        //   callback() {
        //     wx.switchTab({
        //       url: '/pages/inventory/inventory',
        //       success(e) {
        //         // var page = getCurrentPages().pop();
        //         // console.log(e, page,1, page.onLoad, 2,page.getInventoryList)
        //         // if (page == undefined || page == null) return;
        //         // page.onLoad();
        //         // page.getInventoryList('refresh');
        //       }
        //     })
        //   }
        // });
      },
      fail(res) {
        console.log(res, res.errMsg, res.errMsg === "requestPayment:fail cancel")
        options.fail && options.fail(res)
        // if (res.errMsg === "requestPayment:fail cancel") {
        //   $Message({
        //     content: '取消支付',
        //     type: 'default',
        //   })
        // } else {
        //   $Message({
        //     content: res.data.msg || '支付失败！',
        //     type: 'error',
        //     // duration: 1.5,
        //     callback() {
        //       wx.switchTab({
        //         url: '/pages/home/home',
        //       })
        //     }
        //   });
        // }
      }
    })
  },
  // 获取用户基础信息（手机号）
  getUserCenter(options) {
    options = options || {}
    var that = this
    this.request({
      url: api.getUserCenter,
      data: {},
      success(res) {
        options.success && options.success(res)
        // that.setData({
        //   userBaseInfo: res.data
        // })
      },
      fail(res) {
        let msg = res.data && res.data.msg ? res.data.msg : '获取用户基础信息失败！'
        that.showToast(msg)
        options.fail && options.fail(res)
      },
      complete(res) {
        options.complete && options.complete(res)
      }
    })
  },
  //查询用户余额  
  sellerBalance(options) {
    options = options || {}
    var that = this
    this.request({
      url: api.sellerBalance,
      data:{
        type: 0
      },
      success(res) {
        // if (res && res.data) {
        //   var data = res.data
        //   that.setData({
        //     balance: data.balance,
        //     dealer: data.dealer // 可提现金额
        //   })
        // }
        options.success && options.success(res)
      },
      fail() {
        options.fail && options.fail(res)
      }
    })
  },
  //查询用户余额  
  wallet(options) {
    options = options || {}
    var that = this
    this.request({
      url: api.wallet,
      success(res) {
        // if (res && res.data) {
        //   var data = res.data
        //   that.setData({
        //     balance: data.balance,
        //     dealer: data.dealer // 可提现金额
        //   })
        // }
        options.success && options.success(res)
      },
      fail() {
        options.fail && options.fail(res)
      },
      complete() {
        options.complete && options.complete()
      },
    })
  },
  // 完善跳转路徑
  perfectUrl(jumpUrl) {
    jumpUrl = jumpUrl || ''
    if (jumpUrl.substr(1) != '/') {
      jumpUrl = '/' + jumpUrl
    }
    return jumpUrl
  },
  // 重新拼接参数
  jointParams(options) {
    let params = ''
    for (var i in options) {
      params += ('&' + i + '=' + options[i])
    }
    params = "?" + params.substr(1)
    console.log('重新拼接参数',params)
    return params
  },
  // 分享
  share: function(options) {
    options = options || {}
    let shareUrl = this.getCurrentPage()
    console.log(shareUrl)
    let userInfo = wx.getStorageSync('globalData').userInfo
    let currUrl = options.currUrl || '/pages/index/index' // 默认到首页授權
    let jumpUrl = options.jumpUrl || shareUrl // 默认即將跳转到当前页面
    let pageType = options.pageType || 'reLaunch' // navigateTo/reLaunch:非tabBar頁面 / switchTab:tabBar頁面
    let shareId = options.shareId || 1 // 分享id
    let uId = options.uId || userInfo.u_id // 默认分享自己的店铺
    let shopId = options.shopId || userInfo.shopId // 默认分享自己的店铺
    var url = currUrl + "?jumpUrl=" + jumpUrl + "&shareId=" + shareId + "&uId=" + uId + "&shopId=" + shopId + "&pageType=" + pageType
    console.log(url)
    return url
  }
}

module.exports = {
  formatTime: formatTime,
  util
  
}

var login = {
  getCurrentPageUrlWithArgs: function () {
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
              // if (this.globalData) this.globalData.userInfo = res.userInfo

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

// ,
// "tabBar": {
//   "color": "#222222",
//   "selectedColor": "#4DA1FF",
//   "backgroundColor": "#ffffff",
//   "list": [{
//     "pagePath": "pages/home/home",
//     "text": "首页",
//     "iconPath": "./images/home.png",
//     "selectedIconPath": "./images/home-action.png"
//   }, {
//     "pagePath": "pages/inventory/inventory",
//     "text": "库存",
//     "iconPath": "./images/inventory.png",
//     "selectedIconPath": "./images/inventory-action.png"
//   }, {
//     "pagePath": "pages/team/team",
//     "text": "团队",
//     "iconPath": "./images/team.png",
//     "selectedIconPath": "./images/team-action.png"
//   }, {
//     "pagePath": "pages/notice/notice",
//     "text": "通知",
//     "iconPath": "./images/notice.png",
//     "selectedIconPath": "./images/notice-action.png"
//   }, {
//     "pagePath": "pages/mine/mine",
//     "text": "我的",
//     "iconPath": "./images/mine.png",
//     "selectedIconPath": "./images/mine-action.png"
//   }]
// }