// pages/mine/set/set_mobile.js
var App = getApp();
var { countdown } = require('../../../utils/countdown.js');
const { $Message ,$Toast} = require('../../../dist/base/index.js');
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
    // type: oldUser(老用户登录手机校验)
    this.setData({
      options
    })
    let title = '绑定手机'
    if (options != {} && options.type && options.type == 'oldUser') {
      title = '账户绑定'
    }
    wx.setNavigationBarTitle({
      title,
    })
  },
  // 清除手机号
  clearNumber({currentTarget: {dataset}}) {
    if (dataset.clear == "idcard") {
      this.setData({
        'info.idcard': ''
      })
    } else if (dataset.clear == "phone"){
      this.setData({
        'info.phone': ''
      })
    }
   
  },
  // 拨打客服电话
  makePhoneCall({currentTarget:{dataset}}) {
    wx.makePhoneCall({
      phoneNumber: dataset.phone,
      success() {

      }
    })
  },
  // 发送验证码
  sendCode() {
    var phone = this.data.info.phone
    var that = this,
      options = this.data.options

    if (!phone) {
      $Message({
        content: '请输入正确的手机号！',
        type: 'default'
      });
      return
    }
    if (this.data.clickNum) {
      $Message({
        content: "验证码已发送,请勿重复点击",
        type: 'default'
      });
      return
    }
    this.setData({
      clickNum: true
    })
    $Toast({
      content: '提交中...',
      duration: 0,
      type: 'loading'
    });
    // 老用户注册使用
    if (options && options.type && options.type == 'oldUser') {
      App.Util.request({
        url: App.Api.oldUserCaptcha,
        data: {
          teptoken: options.teptoken,
          mobi: phone
        },
        method: 'POST',
        success(res) {
          // console.log(res)
          $Toast.hide()
          // MinTimer
          countdown.MIN(that, 60, () => {
            that.setData({
              'countdownData.MIN': 0,
               clickNum: false
            })
          })
        },
        fail(res) {
          $Toast.hide()
          $Message({
            content: res.data.msg || '验证码发送失败！',
            type: 'default'
          });
          that.setData({
            clickNum: false
          })
        }
      })
      return
    }//
    
    App.Util.request({
      url: App.Api.mobileCaptchaUrl,
      data: {
        type: 1,
        mobi: phone
      },
      method: 'POST',
      success(res) {
        console.log(res)
        $Toast.hide()
        // MinTimer
        countdown.MIN(that, 60, () => {
          that.setData({
            'countdownData.MIN': 0
          })
        })
      },
      fail(res) {
        $Toast.hide()
        $Message({
          content: res.data.msg || '验证码发送失败！',
          type: 'default'
        });
      }
    })
  },
  // 输入手机号
  // 输入验证码
  // 输入身份证
  input(e) {
    var type = e.currentTarget.dataset.type
    var info = this.data.info
    info[type] = e.detail.value
    this.setData({
      info
    })
  },
  
  // 确定
  btnConfirm(e) {
    var value = e.detail.value
    var info = this.data.info,
      options = this.data.options
    // if (!value.idcard) {
    //   $Message({
    //     content: '请输入正确的身份证号！',
    //     type: 'default'
    //   });
    //   return
    // }
    if (!value.phone) {
      $Message({
        content: '手机号不能为空！',
        type: 'default'
      });
      return
    }
    if (!App.Util.checkPhone(value.phone)) {
      $Message({
        content: '请输入正确手机号码！',
        type: 'default'
      });
      return
    }
    if (!value.code) {
      $Message({
        content: '验证码不能为空！',
        type: 'default'
      });
      return
    }
    $Toast({
      content: '处理中',
      duration: 0,
      type: 'loading'
    });
    if (options && options.type && options.type == 'oldUser') {
      // 老用户验证码验证
      App.Util.request({
        url: App.Api.oldUserCaptcha,
        data: {
          captcha: info.code,
          mobi: info.phone,
          teptoken: options.teptoken
          // type:9
        },
        method: 'POST',
        success(res) {
          // 老用户手机绑定
          App.Util.request({
            url: App.Api.oldUserBind,
            data: {
              captcha: info.code,
              mobi: info.phone,
              teptoken: options.teptoken
            },
            method: 'POST',
            success(r) {
              console.log(r)
              $Toast.hide()
              if (r && r.data) {
                if (r.data.error_code ==1) {
                  wx.setStorageSync('sessionid', r.data.sessionid)
                  App.assignUserInfo(r.data.userInfo)
                  $Message({
                    content: '绑定手机号成功！',
                    type: 'default',
                    callback() {
                      wx.switchTab({
                        url: '/pages/home/home',
                      })
                    }
                  });
                } else if (r.data.error_code == 0){
                  $Message({
                    content: r.data.msg || '绑定手机号失败！',
                    type: 'default'
                  });
                }
              }

            },
            fail(r) {
              $Toast.hide()
              $Message({
                content: r.data.msg.msg || '绑定手机号失败！',
                type: 'default'
              });
            }
          })
        },
        fail(res) {
          $Toast.hide()
          $Message({
            content: res.data.msg || '验证码校验失败！',
            type: 'default'
          });
        }
      }) 
      return
    }
    // 校验验证码
    // App.Util.request({
    //   url: App.Api.mobileCaptchaUrl,
    //   data: {
    //     captcha: info.code,
    //     mobi: info.phone,
    //     type:1
    //   },
    //   method: 'POST',
    //   success(res) {
    //   },
    //   fail(res) {
    //     $Toast.hide()
    //     $Message({
    //       content: res.data.msg || '验证码校验失败！',
    //       type: 'default'
    //     });
    //   }
    // }) 
        // 验证码校验成功后更新数据
        App.Util.request({
          url: App.Api.userBindmobiUrl,
          data: {
            captcha: info.code,
            mobi: info.phone
            
          },
          method: 'POST',
          success(r) {
            $Toast.hide()
            $Message({
              content: '绑定手机号成功！',
              type: 'default',
              callback() {
                wx.navigateBack({
                  delta: 1
                })
              }
            });
            
          },
          fail(r) {
            $Toast.hide()
            $Message({
              content: r.data.msg || '绑定手机号失败！',
              type: 'default'
            });
          }
        })
    

    // wx.setStorageSync('mobile', value.phone)
    // wx.redirectTo({
    //   url: './show_personalInfo?phone=' + value.phone
    // })
    // wx.navigateBack({
    //   delta: 2,
    //   success(res) {
    //     console.log(res,'11')
    //     var pages = getCurrentPages()
    //     // 前两页
    //     var page = pages[pages.length - 1]
    //     console.log(page)
    //     page.data.info.phone = value.phone
    //     page.data.info.c_phone = value.phone
    //   }
    // })
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