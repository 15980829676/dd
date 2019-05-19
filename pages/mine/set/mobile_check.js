// pages/mine/set/mobile_check.js
var App = getApp();
var { countdown } = require('../../../utils/countdown.js');
const { $Message, $Toast } = require('../../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {},
    options: {},
    MinTimer: '',// 验证码计时器id
    clickNum:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options: phone / orderInfo
    console.log("手机验证",options)
    let userInfo = wx.getStorageSync('globalData').userInfo
    this.setData({
      userInfo,
      options,
      'info.phone': options.phone
    })
  },
  // 发送验证码
  sendCode() {
    var options = this.data.options
    if (this.data.clickNum){
      $Message({
        content:"验证码已发送,请勿重复点击",
        type: 'default'
      });
      return
    }
    this.setData({
      clickNum:true
    })
    var phone = this.data.info.phone,
    that =this
    $Toast({
      content: '提交中...',
      duration: 0,
      type: 'loading'
    });
    if (options.pageType == 'orderPay' || options.pageType == 'recharge') {
      App.Util.request({
        url: App.Api.mobileCaptchaUrl,
        data: {
          type: 3
        },
        method: 'POST',
        success(res) {
          // MinTimer
          $Toast.hide()
          countdown.MIN(that, 60, () => {
            that.setData({
              'countdownData.MIN': 0,
              clickNum: false
            })
          })
          console.log(res)
        },
        fail(res) {
          $Toast.hide()
          $Message({
            content: res.data.msg || '验证码获取失败！',
            type: 'default'
          });
          that.setData({
            clickNum: false
          })
        }
      })

    }else{
    App.Util.request({
      url: App.Api.mobileCaptchaUrl,
      data: {
        type: 1
      },
      method: 'POST',
      success(res) {
        // MinTimer
        $Toast.hide()
        countdown.MIN(that, 60, () => {
          that.setData({
            'countdownData.MIN': 0,
             clickNum: false
          })
        })
        console.log(res)
      },
      fail(res) {
        $Toast.hide()
        $Message({
          content: res.data.msg || '验证码获取失败！',
          type: 'default'
        });
        that.setData({
          clickNum: false
        })
      }
    })
  }
  },
  // 输入验证码
  getCode(e) {
    this.setData({
      'info.code': e.detail.value
    })
  },
  // 确定
  btnConfirm(e) {
    var value = e.detail.value
    var options = this.data.options
    // var orderInfo = JSON.parse(options.orderInfo)
    var that = this
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    if (!value.code) {
      $Message({
        content: '验证码不能为空！',
        type: 'default'
      });
      $Toast.hide()
      return 
    }
 
    // 结算页面支付
    if (options.pageType == 'orderPay') {
      // 检验验证码
      App.Util.request({
        url: App.Api.mobileCaptchaUrl,
        data: {
          type: 3,
          captcha: that.data.info.code
        },
        method: 'POST',
        success(res) {
          // 支付
          var payData = that.switchPayType(options.payType)
          console.log("payData",payData)
          App.Util.orderPay({
            order_sn: options.order_sn,
            type: payData.type,
            baltype: payData.baltype,
            success(res) {
              App.Util.showToast('支付成功！', () => {
                // wx.redirectTo({
                //   url: '/pages/inventory/inventory',
                //   success(e) {
                //     // var page = getCurrentPages().pop();
                //     // console.log(e, page,1, page.onLoad, 2,page.getInventoryList)
                //     // if (page == undefined || page == null) return;
                //     // page.onLoad();
                //     // page.getInventoryList('refresh');
                //   }
                // })
                let userInfo = that.data.userInfo
                console.log(userInfo, options)
                wx.reLaunch({
                  url: "/pages/team/orderInformation?userId=" + userInfo.u_id + "&shopId=" + userInfo.shopId + "&orderId=" + options.order_id + '&orderType=stock&opid=' + userInfo.u_id
                })
              })
              // $Message({
              //   content: '支付成功！',
              //   type: 'default',
              //   // duration: 1.5,
              //   callback() {
              //     wx.switchTab({
              //       url: '/pages/inventory/inventory',
              //       success (e) {
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
              console.log(res)
              var msg = res && res.data && res.data.msg ? res.data.msg : '支付失败！'
              // $Message({
              //   content: msg ,
              //   type: 'error',
              //   // duration: 1.5,
              //   callback() {
              //     wx.switchTab({
              //       url: '/pages/home/home',
              //     })
              //   }
              // });
              App.Util.showToast(msg, () => {
                wx.switchTab({
                  url: '/pages/home/home',
                })
              })
            }
          })
        },
        fail(res) {
          App.Util.showToast(res.data.msg || '验证码错误！')
        },
        complete() {
          $Toast.hide()
        }
      })
    } else if (options.pageType == 'recharge') { // 使用可提现金额充值
      App.Util.request({
        url: App.Api.mobileCaptchaUrl,
        data: {
          type: 3,
          captcha: that.data.info.code
        },
        method: 'POST',
        success(res1){
          App.Util.request({
            url: App.Api.balanceRecharge,
            data: {
              order_sn: options.order_sn
            },
            method: 'POST',
            success(res) {
              console.log(res)
              if (res.code == 200) {
                App.Util.showToast('充值成功！', () => {
                  wx.redirectTo({
                    url: '/pages/mine/wallet/recharge/rechargeResult?money=' + options.money + '&result=success',
                  })
                })
              }else {
                App.Util.showToast('充值失败！', () => {
                  wx.redirectTo({
                    url: '/pages/mine/wallet/recharge/rechargeResult?money=' + options.money + '&result=fail',
                  })
                })
              }
              
            },
            fail(res) {
              App.Util.showToast('充值失败！', () => {
                wx.redirectTo({
                  url: '/pages/mine/wallet/recharge/rechargeResult?money=' + options.money + '&result=fail',
                })
              })
            },
            complete() {
              $Toast.hide()
            }
          })
        },
        fail(res) {
          App.Util.showToast(res.data.msg || '验证码错误！')
        },
        complete() {
          $Toast.hide()
        }
      })
    }else {
      App.Util.request({
        url: App.Api.mobileCaptchaUrl,
        data: {
          type: 1,
          captcha: that.data.info.code
        },
        method: 'POST',
        success(res) {
          wx.redirectTo({
            url: './set_mobile',
          })
        }, 
        fail(res) {
          App.Util.showToast(res.data.msg || '验证码错误！')
        },
        complete() {
          $Toast.hide()
        }
      })
    }
  },
  switchPayType(str) {
    switch (str) {
      case 'balance': return { type: 2,baltype: [1]}
        break
      case 'dealer': return { type: 2, baltype: [2] }
        break
      case 'balanceAndDealer': return { type: 2, baltype: [1,2] }
        break
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.MinTimer)
    this.setData({
      'countdownData.MIN': 0
    })
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