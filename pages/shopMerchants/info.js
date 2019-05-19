// pages/shopMerchants/info.js

var WxParse = require('../../wxParse/wxParse.js');
var {
  countdown
} = require('../../utils/countdown.js');
const {
  $Toast, $Message
} = require('../../dist/base/index');


var App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shoppText:'成功开店',
    step: 0, // 招商步骤
    currentIndex: 0, // 店铺等级索引
    isShow: true, // 是否同意阅读
    selectCityData: "", // 选择的城市数据
    disabled: false, // 是否点击验证码
    shopType: [],
    data: {}, // 要提交的数据
    citysadd: '',
    citysIndex: [0, 0, 0],
    agreementName: '',
    uid: 0,
    pid: 0,
    region: [],
    stype: 0,
    sr_info: '',
    isOn: true,
    pgrade: 0,
    user: '',
    isShowPl: true, // 是否显示重新申请按钮
    clickNum:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let t = this
    /* let sr_info={}
    if(options.srinfo){
      sr_info = JSON.parse(options.srinfo)
    } */

    App.Util.request({
      url: App.Api.getShopRightsUrl,
      success(res) {
        t.setData({
          shopType: res.data.list
        })
      },
      fail(res) {
        console.log('fail', res)
        $Toast({
          content: res.data.msg || '获取店铺等级数据失败'
        })
      }
    })
    /* if(options.status>0){
    	this.setData({
    		step:1
    	})
    } */

    let pid = options && options.pid || 0
    var u_id = wx.getStorageSync('globalData') && wx.getStorageSync('globalData').userInfo.u_id;
    this.setData({
      u_id: u_id,
      //stype:options.status,
      //sr_info:sr_info,
      pid: pid,
      //pgrade:options.grade
    })
  },
  onShow() {
    this.ShareShop()
  },
  onbtn(){
    this.ShareShop()
  },
  ShareShop() {
    let t = this
    let userinfo = wx.getStorageSync('globalData') && wx.getStorageSync('globalData').userInfo
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.getShare,
      data: {
        id: t.data.pid
      },
      success(res) {
        if (res && res.data) {
          if (res.data.sr_status > 0) {
            t.setData({
              step: 1
            })
          }
          t.setData({
            user: res.data,
            stype: res.data.sr_status,
            sr_info: res.data.sr_info,
            pgrade: res.data.grade || 0
          })
        }
        $Toast.hide()
      },
      fail(res) {
        if (res.data.msg == -1) {
          wx.clearStorageSync()
          wx.reLaunch({
            url: "/pages/index/index"
          })
        } else if (res.data.msg == -2) {
          console.log('用户不存在', res.data.msg)
          $Toast({
            content: '用户不存在',
          });
        } else if (res.data.msg == -3) {
          setTimeout(() => {
            $Toast({
              content: '您未绑定上级经销商',
            });

            t.setData({
              step: 1,
              stype: 5,
              'sr_info.r_type': 3,
              'sr_info.reason': '您未绑定上级经销商',
              isShowPl: false,
              shoppText:'成功绑定上级'
            })
            //未绑定上级
            wx.reLaunch({
              url: '/expandPage/bindingParentId/index',
            })
          }, 500)
          wx.setNavigationBarTitle({ title: '绑定上级供应商' })
        }else if (res.data.msg == -5){
          $Toast({
            content: '申请绑定供货商失效',
          });
          t.setData({
            step: 1,
            stype: 5,
            'sr_info.r_type': 3,
            'sr_info.reason': '申请绑定供货商失效',
            isShowPl: false,
            shoppText: '成功绑定上级'
          })
          wx.reLaunch({
            url: '/expandPage/bindingParentId/index',
          })
          wx.setNavigationBarTitle({ title: '绑定上级供应商' })
        } else if (res.data.msg == -6){
          $Toast({
            content: '申请绑定供货商审核中',
          });
          t.setData({
            step: 1,
            stype: 1,
            'sr_info.r_type': 2,
            'sr_info.reason': '申请绑定供货商审核中',
            isShowPl: false,
            shoppText: '成功绑定上级'
          })
          wx.setNavigationBarTitle({ title: '绑定上级供应商' })
        }
      },
      complete() {

      }
    })
  },

  onBacktap: function() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 点击显示地址选择框
  clickVisiableAddress() {
    this.setData({
      visiableAddress: true
    })
  },
  // 确认所选地址
  _cityChangeConfirm(e) {
    let {
      region
    } = e.detail
    this.setData({
      region
    })
  },


  // 选择店铺等级
  onSelect: function(e) {
    let shopType = this.data.shopType
    let index = parseInt(e.currentTarget.dataset.index)

    if (this.data.pgrade) {
      let level = this.data.pgrade

      if (index > (level)) {
        $Toast({
          content: '店铺等级不能大于上级店铺等级'
        })
        return
      }
    }
    let item = shopType[index - 1]
    this.setData({
      'data.shopname': item.name,
      'data.shopmoney': item.money,
      currentIndex: index - 1
    })
  },
  getName: function(e) {
    var name = e.detail.value;
    this.setData({
      'data.name': name
    })
  },
  getId: function(e) {
    var idcard = e.detail.value;
    this.setData({
      'data.idcard': idcard
    })
  },
  getPhone: function(e) {
    var phone = e.detail.value;
    console.log(e)
    this.setData({
      'data.phone': phone
    })
  },
  getCode: function(e) {
    var code = e.detail.value;
    // this.data.data.code = code
    this.setData({
      'data.code': code
    })
    // console.log(this.data.data.code)
  },
  getAddress: function(e) {
    var address = e.detail.value;
    // this.data.data.address = address
    this.setData({
      'data.address': address
    })
  },
  // 获取验证码
  getVerificationCode() {
    
    var phone = this.data.data.phone
    var that = this
    console.log('验证码', this.data.data.phone)
    if (!App.Util.checkPhone(phone)) {
      $Message({
        content: '请输入正确手机号码！',
        type: 'warning'
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
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.mobileCaptchaUrl,
      data: {
        mobi: phone,
        type: 1
      },
      method: 'POST',
      success(res) {
        $Toast.hide()
        countdown.MIN(that, 60, (time) => {
          setTimeout(() => {
            that.setData({
              'countdownData.MIN': 0,
               clickNum: false
            })
          }, 1000)
        })
      },
      fail(res) {
        $Toast({
          content: res.data.msg || '验证码发送失败!'
        });
        that.setData({
          clickNum: false
        })
      }
    })

  },
  // 阅读协议
  oncurrentType: function() {
    let isShow = this.data.isShow
    if (isShow == true) {
      this.data.isShow = false
    } else {
      this.data.isShow = true
    }
    this.setData({
      isShow: this.data.isShow
    })
  },
  // 获取协议协议
  agreement(e) {
    var that = this
    var agmt = e.target.dataset.agreement
    var agreementName = e.target.dataset.name
    this.setData({
      agreementName
    })
    App.Util.request({
      url: App.Api.getAgreementUrl,
      data: {
        name: agmt
      },
      success(res) {
        console.log('success', res)
        var article = res.data
        WxParse.wxParse('article', 'html', article, that, 5);
      },
      fail(res) {
        console.log('fail', res)
      }
    })
  },
  closeAgreement() {
    this.setData({
      agreementName: ''
    })
  },
  onPaytap: function(e) {
    // console.log(this.data.data)
    var value = e.detail.value
    let t = this
    let sr_info = t.data.sr_info
    let ptype = 1
    let citysadd = this.data.region
    let data = this.data.data

    if (!value.name) {
      $Toast({
        content: '请输入真实姓名'
      });
      return
    }
    if (!value.idcard) {
      $Toast({
        content: '请输入身份证号码并确认无误！'
      });
      return
    }
    if (!value.phone) {
      $Toast({
        content: '请输入正确手机号码！'
      });
      return
    }
    if (!(/^1[34578]\d{9}$/.test(value.phone))) {
      $Toast({
        content: '请输入正确手机号码！'
      });
      return
    }
    if (!value.code) {
       $Toast({
         content: '请输入验证码'
       });
       return
    }
    if (citysadd.length <= 0) {
      $Toast({
        content: '请选择地区信息！'
      });
      return
    }
    if (!value.address) {
      $Toast({
        content: '请输入详细地址！'
      });
      return
    }

    if (this.data.isShow == false) {
      $Toast({
        content: '请认真阅读协议并同意！'
      });
      return
    }
    $Toast({
      content: '正在提交数据...'
    });

        if (sr_info.statue == 1) {
     
          App.Util.request({
            url: App.Api.sellerUp,
            data: {
              name: value.name,
              idcard: value.idcard,
              address: value.address,
              province: citysadd[0],
              city: citysadd[1],
              dis: citysadd[2],
              mobi: value.phone,
              id: sr_info.id,
              smscode: value.code
            },
            method: 'POST',
            success(res) {
              t.setData({
                step: 1
              })
            },
            fail(res) {
              $Toast({
                content: res.data.msg || '提交数据失败'
              });
            }
          })


        } else {
          console.log('2')
          App.Util.request({
            url: App.Api.shenSubmit,
            data: {
              name: value.name,
              idcard: value.idcard,
              address: value.address,
              province: citysadd[0],
              city: citysadd[1],
              dis: citysadd[2],
              mobi: value.phone,
              parentid: t.data.pid,
              type: 1,
              shoptype: t.data.currentIndex + 1,
              smscode: value.code,

            },
            method: 'POST',
            success(res) {
              t.paywei(res.data, ptype)
            },
            fail(res) {
              $Toast({
                content: res.data.msg || '提交数据失败'
              });
            }
          })

        }
  
  },
  //重新付款
  repayTap() {
    $Toast({
      content: '正在创建订单...'
    });
    let t = this
    let ptype = 2
    console.log(this.data.sr_info, 222)
    let sr_info = this.data.sr_info
    App.Util.request({
      url: App.Api.rePay,
      data: {
        id: sr_info.id,
        type: 1,
        shop_type: sr_info.type
      },
      method: 'POST',
      success(res) {
        t.paywei(res.data, ptype)
      },
      fail(res) {
        $Toast({
          content: res.data.msg || '创建订单失败'
        });
      }
    })
  },
  //重新申请
  resetTap(e) {
    let set = e.currentTarget.dataset.set
    let sr_info = this.data.sr_info
    let isOn = true
    if (sr_info.statue == 1) {
      isOn = false
    }
    this.setData({
      step: 0,
      currentIndex: sr_info.type - 1, //店铺等级
      isOn: isOn
    })

  },
  //微信支付窗
  paywei(info, ptype) {

    let t = this
    wx.requestPayment({
      'timeStamp': info.timeStamp,
      'nonceStr': info.nonceStr,
      'package': info.package,
      'signType': 'MD5',
      'paySign': info.paySign,
      'success': function(res) {
        $Toast({
          content: '支付成功'
        });
        t.setData({
          step: 1,
          stype: 3
        })
      },
      'fail': function(res) {
        if (res.errMsg == 'requestPayment:fail cancel') {
          $Toast({
            content: '取消支付'
          });
        }
        $Toast({
          content: '支付失败'
        });
        if (ptype == 1) {
          t.setData({
            step: 0
          })
        } else {
          t.setData({
            step: 1
          })
        }

      }
    })

  },
  // 关闭支付弹框
  _closePopUp(e) {

  },
  //返回首页
  onResetTap() {
    wx.navigateTo({
      url: "/pages/shopMerchants/index"
    })

  },




})