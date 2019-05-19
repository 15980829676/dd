// pages/mine/wallet/recharge/recharge.js
const {
  $Toast,
  $Message
} = require('../../../../dist/base/index.js'), App = getApp(), WxParse = require('../../../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    balance: '', // 金额
    adsList: [], // 活动列表
    wallet: {}, // 钱包
    visibleModal: false, // 是否显示提示弹框
    modalData: [ // 提示弹框信息
      {
        name: '取消',
        color: '#333',
        fontSize: '24rpx'
      },
      {
        name: '提交',
        color: '#4da1ff',
        fontSize: '24rpx'
      }
    ],
    isShowCheckstand: false, // 是否显示收银台
    agreeAgreemant: true, // 是否同意充值协议，默认同意
    showAgreement: false, // 是否显示充值协议
    // startPors: false // 是否有充值活动
    tabBarh:50,
    selPayData: {}, // 支付方式数据 支付方式类型 手机号(组件中传出)
    creatOrderInfo: {}, // 创建订单后的信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    this.setData({
      tabBarh: App.Util.checkPhoneType()
    })
    App.Util.request({
      url: App.Api.rechargeHtml,
      success(res) {
        WxParse.wxParse('article', 'html', res, that, 5);
      }
    })
    
  },
  focus({
    detail: {
      value
    }
  }) {

  },
  input({
    detail: {
      value
    }
  }) {
    this.setData({
      balance: value,
    })
  },
  blur({
    detail: {
      value
    }
  }) {
    let balance = value ? parseFloat(value).toFixed(2) : ''
    this.setData({
      balance,
    })
  },
  // 同意阅读协议
  selcetAgreeAgr() {
    this.setData({
      agreeAgreemant: !this.data.agreeAgreemant
    })
  },
  // 点击查看协议
  viewAgreement() {
    this.setData({
      showAgreement: true
    })
  },
  // 关闭查看协议
  closeAgreement() {
    this.setData({
      showAgreement: false
    })
  },
  // 充值按钮
  recharge() {
    let balance = parseFloat(this.data.balance),
      agreeAgreemant = this.data.agreeAgreemant,
      minMoney = 1,
      maxMoney = 1000000
    if (!balance || isNaN(balance) || balance < minMoney) {
      $Message({
        content: '充值的金额不能小于' + minMoney + '元',
        type: 'default'
      });
      return
    }
    if (balance > maxMoney) {
      $Message({
        content: '充值的金额不能大于' + maxMoney + '元，请重新输入',
        type: 'default'
      });
      return
    }
    if (!agreeAgreemant) {
      $Message({
        content: '请认真阅读协议并同意！',
        type: 'default'
      });
      return
    }
    $Toast({
      content: '正在创建订单',
      duration: 0,
      type: 'loading'
    });
    this.createBlanOrder() // 创建订单
    this._getWallet()// 每次点击更新可提现金额 并弹出收银台
    Promise.all([this._createBlanOrder, this._wallet]).then((res) => {
      console.log(res)
      $Toast.hide()
      this.setData({
        creatOrderInfo: res[0],
        isShowCheckstand: true // 显示收银台
      })
    },() =>{})
  
  },
  // 确定支付方式，显示提示框
  _submit(e) {
    // let { payMethod, payType } = e.detail
    this.setData({
        selPayData: e.detail,
      // currSelPayMet: payMethod, //支付方式数据
      // currSelPayType: payType, // 当前选择的支付类型
      visibleModal: true
    })
  },
  // 弹框 取消或 创建订单、提交订单
  handleClick(e) {
    this.setData({
      isShowCheckstand: false,
      visibleModal: false
    })
    let { selPayData, creatOrderInfo,balance} = this.data
    console.log(selPayData)
    // 确定充值
    if (e.detail.index == 1) { 
      if (selPayData.payType == 'wechat') { // 微信
        this.selrechargepay(creatOrderInfo)// 提交
      } else if (selPayData.payType == 'alipay') { // 支付宝
        wx.navigateTo({
          url: '/pages/offlinePay/index?payType=Alipay' + '&order_id=' + creatOrderInfo.id + '&order_sn=' + creatOrderInfo.sn + '&money=' + balance + '&baltype=' + '&pageType=recharge',
        })
      } else if (selPayData.payType == 'linePay') { // 线下支付
        wx.navigateTo({
          url: '/pages/offlinePay/index?payType=linePay' + '&order_id=' + creatOrderInfo.id + '&order_sn=' + creatOrderInfo.sn + '&money=' + balance + '&baltype=' + '&pageType=recharge',
        })
      } else if (selPayData.payType == 'dealer') { // 可提现金额
        wx.navigateTo({
          url: '/pages/mine/set/mobile_check?phone=' + selPayData.mobil + '&pageType=recharge' + '&order_sn=' + creatOrderInfo.sn + '&money=' + balance,
        })
      }
      
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    this._getWallet()
    // this.getAdsList()
    this.getRechargeAction()
    Promise.all([this._wallet,this._getRechargeAction]).then(() => {
      $Toast.hide()
    })
  },
  // 获取商品活动
  getAdsList() {
    var that = this
    this._getAdsList = new Promise((resolve) => {
      App.Util.request({
        url: App.Api.selactive,
        data: {},
        success(res) {
          if (res && res.data) {
            that.setData({
              adsList: res.data
            })
          }
          resolve()
        },
        fail() {},
        complete() {

        }
      })
    })
  },
  // 获取余额
  _getWallet() {
    // $Toast({
    //   content: '加载中',
    //   duration: 0,
    //   type: 'loading'
    // });
    var that = this
    this._wallet = new Promise((resolve, reject) => {
      App.Util.request({
        url: App.Api.wallet,
        data: {},
        success(res) {
          if (res && res.data && res.data != {}) {
            that.setData({
              wallet: res.data
            })
          }
          resolve()
        },
        fail() {
          reject()
        },
        complete() {
          // $Toast.hide()
        }
      })
    })
  },
  // 获取充值活动
  getRechargeAction() {
    let that = this, 
    adsList = this.data.adsList
    this._getRechargeAction = new Promise((resolve, reject) => {
      // 0是没有活动或者已结束
      App.Util.request({
        url: App.Api.act,
        success(res) {
          if (res && res.data && res.data.state == 1){
            adsList.push({ title: res.data.rule.descript})
            that.setData({
              rechargeAction: res.data,
              adsList
            })
          }
          resolve()
        },
        fail() {
          reject()
        }
      })

    })
  },
  // 创建余额订单
  createBlanOrder() {
    var that = this
    this._createBlanOrder = new Promise((resolve, reject) => {
      App.Util.request({
        url: App.Api.createBalanceOrder,
        data: {
          money: this.data.balance
        },
        method: 'POST',
        success(res) {
          console.log('创建订单成功', res)
          resolve(res.data)
        },
        fail(res) {
          $Toast.hide()
          App.Util.showToast(res.data.msg || "创建订单失败")
          reject()
        },
        complete() {
          
        }
      })
    })
  },
  // 提交订单
  selrechargepay(params) {
    $Toast({
      content: '正在提交订单',
      duration: 0,
      type: 'loading'
    });
    var that = this

    this._submitOrder = new Promise((resolve, reject) => {
      App.Util.request({
        url: App.Api.selrechargepay,
        data: {
          sn: params.sn,
          type: 1 // 默认微信支付
        },
        method: 'POST',
        success(res) {
          console.log('订单提交成功', res)
          if (res && res.data && res.data.return_code && res.data.return_code === 'FAIL' && res.data.return_msg) {
            App.Util.showToast(res.data.return_msg)
            $Toast.hide()
            return
          }
          App.Util.wechatPay(Object.assign(res.data, {
            success(res) {
              console.log('suc', res)
              // $Message({
              //   content: '充值成功',
              //   type: 'default',
              //   callback() {

              //   }
              // });
              resolve()
              wx.redirectTo({
                url: './rechargeResult?money=' + that.data.balance + '&result=success',
              })
              $Toast.hide()
            },
            fail(res) {
              console.log('fail', res)
              $Toast.hide()
              if (res.errMsg && res.errMsg == "requestPayment:fail cancel") {
                $Message({
                  content: '取消充值',
                  type: 'default'
                });
                return
              }else {
                reject()
              }
              wx.navigateTo({
                url: './rechargeResult?money=' + that.data.balance + '&result=fail',
              })
            }
          }))
        },
        fail(res) {
          reject()
          console.log("订单提交失败", res)
          $Toast.hide()
          App.Util.showToast(res.data.msg || "订单提交失败")
        },
        complete() {
          
        }
      })
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.setData({
      balance: ''
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function() {

  // }
})