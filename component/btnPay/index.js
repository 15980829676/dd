// component/btnPay/index.js
var App = getApp();
const {
  $Message,
  $Toast
} = require('../../dist/base/index.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShowPayPopUp: { // 是否显示支付弹框
      type: Boolean,
      value: false
    },
    total: { // 需支付商品总金额
      type: String,
      value: 0,
      observer(n, o) {
        n = parseFloat(n)
        this.setData({
          total: n.toFixed(2)
        })
        this.setRadio()
      }
    },
    disable: { // 是否禁止点击
      type: Boolean,
      value: false
    },
    orderInfo: { // 订单信息
      type: Object,
      // value: {
      //   ids: [],
      //   props: [],
      //   addressId: '',
      // }
    },
    currType: {
      type: String,
      value: 'logistics', // logistics: 物流配送，selfExtract:自提，用来判断如果是物流配送，点击支付时要先选邮寄方式
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    payMethod: { // 支付弹框数据
      balance: { // 余额
        money: 0,
        select: false, // 选中
        select1: false, // 禁用
      },
      dealer: { // 可提现金额
        money: 0,
        select: false,
        select1: false,
      },
      back: { // 返利金额
        money: 0,
        select: false,
        select1: false,
      },
      wechat: { // 微信
        selectType: false,
        select: false,
        select1: false,
      },
      alipay: { // 支付宝
        selectType: false,
        select: false,
        select1: false,
      },
      bankCard: { // 银联
        selectType: false,
        select: false,
        select1: false,
      },
      linePay: { // 线下 （非直属经销商才有显示）
        selectType: false, 
        select: false,
        select1: false,
      }
    },
    tabBarH: 50,
    userBaseInfo: {},
    userInfo: {},
    btnLoading: false, // 按钮显示加载loading
    modalData: [ //
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
    modalData1: [ // 非直属线下支付提示框
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
    visibleModal: false, // 是否绑定手机号弹框
    payBtnLock: false, // 确认支付按钮锁
    visibleModal1: false, // 是否显示非直属线下支付提示框
  },
  attached() {
    let userInfo = wx.getStorageSync('globalData').userInfo
    this.setData({
      userInfo,
	    tabBarH: App.Util.checkPhoneType()
    })
  },
  pageLifetimes: {
    show() {
      // console.log('show')
      this.setData({
        payBtnLock: false
      })
    },
    hide() {
      // console.log('hide')
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    move() {},
    // 关闭支付方式弹框显示
    closePopUp(e) {
      this.setData({
        isShowPayPopUp: false
      })
      this.triggerEvent('_closePopUp', {
        isShowPayPopUp: false
      })
    },
    // 打开支付方式弹框显示
    openPopUp() {
      if (this.data.disable) return false
      if (this.data.payBtnLock) return false
      console.log(this.data.orderInfo)
      let { orderInfo, userInfo, payMethod} = this.data
      // if (orderInfo) {
      // 如果是物流配送，点击支付时要先选邮寄方式(直属) （非直属可以直接购买，只有到付和自提，是由上级发货）线上的商品都是有重量的
      orderInfo && orderInfo.sn ? orderInfo.order_sn = orderInfo.sn : ''
      var isNotHasOrderSn = (!orderInfo || JSON.stringify(orderInfo) === "{}") ? true : !orderInfo.order_sn ? true : false

      if (isNotHasOrderSn && orderInfo && parseFloat(orderInfo.weight) > 0 && this.data.currType == 'logistics' && !orderInfo.shiptype && parseInt(userInfo.seltype) > 0) {
        App.Util.showToast('请选择邮寄方式！')
        return
      }
      if (isNotHasOrderSn && orderInfo && parseFloat(orderInfo.weight) <= 0 && !orderInfo.shiptype && parseInt(userInfo.seltype) > 0) {
        // $Message({
        //   content: '当前收货地址没有符合条件的邮寄方式!',
        //   type: 'warning'
        // });
        App.Util.showToast('当前数据不合法!')
        return
      }
      // }
      // 确认支付按钮锁
      this.setData({
        payBtnLock: true
      })
      var that = this
      if (!this.data.isShowPayPopUp) {
        // App.Util.sellerBalance()
        that.setData({
          btnLoading: true,
        })
        // 获取用户余额
        this.getSellerBalance({
          success() {
            // 设置默认勾选
            that.setRadio({
              success() {

                // 获取用户手机号
                that.getUserBaseInfo({
                  success() {

                    that.setData({
                      // btnLoading: false,
                      isShowPayPopUp: true,
                      // payBtnLock: false // 确认支付按钮锁
                    })
                    that.triggerEvent('_openPopUp', {
                      type: 'open'
                    })

                  },
                  fail() {
                    that.unlockPayBtn()
                  },
                  complete() {
                    that.setData({
                      btnLoading: false,
                      payBtnLock: false // 确认支付按钮锁
                    })
                  }
                })
                
              }
            })
          },
          fail(res) {
            let msg = (res && res.data && res.data.msg) ? res.data.msg : '获取金额数据失败！'
            App.Util.showToast(msg)
            that.unlockPayBtn()
            that.setData({
              btnLoading: false,
            })
          }
        })
      } else {
        // 非直属，如果点击支付，是线下支付，弹出提示
        if (userInfo.seltype == 0 && payMethod.linePay.select) {
          this.setData({
            visibleModal1: true
          })
        }else {
          this.triggerEvent('_openPopUp', {
            type: 'pay'
          })
        }
      }
    },
    // 获取用户余额
    getSellerBalance(options) {
      var that = this
      options = options || {}
      var payMethod = this.data.payMethod
      App.Util.wallet({
        success(res) {
          // console.log(res)
          if (res && res.data) {
            var data = res.data
            payMethod.balance.money =  data.a_money
            payMethod.dealer.money =  data.df_money // 可提现金额
            payMethod.back.money = data.re_money //返利
            that.setData({
              payMethod
            }, () => {
              // setTimeout(() => {

              // }, 500)
            })
            options.success && options.success()
          }else {
            options.fail && options.fail(res)
          }
        },
        fail(res) {
          options.fail && options.fail(res)
        },
        complete() {
          options.complete && options.complete()
        }
      })
    },
    // 设置按钮默认勾选
    setRadio(options) {
      options = options || {}
      var payMethodData = this.data.payMethod
      var total = parseFloat(this.data.total)
      var balance = parseFloat(payMethodData.balance.money)
      var dealer = parseFloat(payMethodData.dealer.money)
      // console.log(total, balance, dealer)
      if (balance >= total && dealer == 0) { // 余额大于total，提现金额为 0 时，余额勾选，其他禁用
        payMethodData.balance.select = true
        payMethodData.balance.select1 = false

        payMethodData.dealer.select = false
        payMethodData.dealer.select1 = true

        payMethodData.wechat.select = false
        payMethodData.wechat.select1 = true

        payMethodData.alipay.select = false
        payMethodData.alipay.select1 = true

        payMethodData.bankCard.select = false
        payMethodData.bankCard.select1 = true

        payMethodData.linePay.select = false
        payMethodData.linePay.select1 = true
      } else if (balance >= total && (dealer > 0 && dealer < total)) { // 余额大于total，提现金额大于0且小于total，余额勾选，提现金额可选，其他禁用
        payMethodData.balance.select = true
        payMethodData.balance.select1 = false

        payMethodData.dealer.select = false
        payMethodData.dealer.select1 = false

        payMethodData.wechat.select = false
        payMethodData.wechat.select1 = true

        payMethodData.alipay.select = false
        payMethodData.alipay.select1 = true

        payMethodData.bankCard.select = false
        payMethodData.bankCard.select1 = true

        payMethodData.linePay.select = false
        payMethodData.linePay.select1 = true
      } else if (balance >= total && dealer >= total) { // 余额大于total，提现金额大于total时，余额勾选，提现金额可选，其他禁用
        payMethodData.balance.select = true
        payMethodData.balance.select1 = false

        payMethodData.dealer.select = false
        payMethodData.dealer.select1 = false

        payMethodData.wechat.select = false
        payMethodData.wechat.select1 = true

        payMethodData.alipay.select = false
        payMethodData.alipay.select1 = true

        payMethodData.bankCard.select = false
        payMethodData.bankCard.select1 = true

        payMethodData.linePay.select = false
        payMethodData.linePay.select1 = true

      }
      // 余额小于total 且大于0
      else if ((0 < balance && balance < total) && dealer == 0) { // 余额小于total 且大于0， 提现金额为 0 时，余额默认勾选，提现金额禁用，其他可选
        payMethodData.balance.select = true
        payMethodData.balance.select1 = false

        payMethodData.dealer.select = false
        payMethodData.dealer.select1 = true

        payMethodData.wechat.select = true
        payMethodData.wechat.select1 = false

        payMethodData.alipay.select = false
        payMethodData.alipay.select1 = false

        payMethodData.bankCard.select = false
        payMethodData.bankCard.select1 = false

        payMethodData.linePay.select = false
        payMethodData.linePay.select1 = false
      } else if ((0 < balance && balance < total) && (0 < dealer && dealer < total)) { // 余额和提现金额都在0~total范围内
        // 余额+提现金额大于total 勾选两个 其他不勾选
        if (App.Util.accAdd(balance, dealer) >= total) {
          payMethodData.balance.select = true
          payMethodData.balance.select1 = false

          payMethodData.dealer.select = true
          payMethodData.dealer.select1 = false

          payMethodData.wechat.select = false
          payMethodData.wechat.select1 = true

          payMethodData.alipay.select = false
          payMethodData.alipay.select1 = true

          payMethodData.bankCard.select = false
          payMethodData.bankCard.select1 = true

          payMethodData.linePay.select = false
          payMethodData.linePay.select1 = true
        } else { // 余额+提现金额小于total 勾选两个 其他可选
          payMethodData.balance.select = true
          payMethodData.balance.select1 = false

          payMethodData.dealer.select = true
          payMethodData.dealer.select1 = false

          payMethodData.wechat.select = true
          payMethodData.wechat.select1 = false

          payMethodData.alipay.select = false
          payMethodData.alipay.select1 = false

          payMethodData.bankCard.select = false
          payMethodData.bankCard.select1 = false

          payMethodData.linePay.select = false
          payMethodData.linePay.select1 = false
        }

      } else if ((0 < balance && balance < total) && (dealer >= total)) { // 余额小于total 且大于0，提现金额大于total ，余额和提现金额可选 ，提现金额默认选上，其他禁用
        payMethodData.balance.select = true // 2版
        payMethodData.balance.select1 = false

        payMethodData.dealer.select = true
        payMethodData.dealer.select1 = false

        payMethodData.wechat.select = false
        payMethodData.wechat.select1 = true

        payMethodData.alipay.select = false
        payMethodData.alipay.select1 = true

        payMethodData.bankCard.select = false
        payMethodData.bankCard.select1 = true

        payMethodData.linePay.select = false
        payMethodData.linePay.select1 = true
      } else if (balance == 0 && dealer == 0) { // 余额和提现金额禁用 ，其他可选
        payMethodData.balance.select = false
        payMethodData.balance.select1 = true

        payMethodData.dealer.select = false
        payMethodData.dealer.select1 = true

        payMethodData.wechat.select = true
        payMethodData.wechat.select1 = false

        payMethodData.alipay.select = false
        payMethodData.alipay.select1 = false

        payMethodData.bankCard.select = false
        payMethodData.bankCard.select1 = false

        payMethodData.linePay.select = false
        payMethodData.linePay.select1 = false

      } else if (balance == 0 && (0 < dealer && dealer < total)) { // 余额为 0 ，余额禁用 ，提现金额默认选上，其他可选
        payMethodData.balance.select = false
        payMethodData.balance.select1 = true

        payMethodData.dealer.select = true
        payMethodData.dealer.select1 = false

        payMethodData.wechat.select = true
        payMethodData.wechat.select1 = false

        payMethodData.alipay.select = false
        payMethodData.alipay.select1 = false

        payMethodData.bankCard.select = false
        payMethodData.bankCard.select1 = false

        payMethodData.linePay.select = false
        payMethodData.linePay.select1 = false

      } else if (balance == 0 && dealer >= total) { //余额为0，余额禁用，提现金额大于total，勾选提现金额，其他都不勾选
        payMethodData.balance.select = false
        payMethodData.balance.select1 = true

        payMethodData.dealer.select = true
        payMethodData.dealer.select1 = false

        payMethodData.wechat.select = false
        payMethodData.wechat.select1 = true

        payMethodData.alipay.select = false
        payMethodData.alipay.select1 = true

        payMethodData.bankCard.select = false
        payMethodData.bankCard.select1 = true

        payMethodData.linePay.select = false
        payMethodData.linePay.select1 = true
      }
      this.setData({
        payMethod: payMethodData
      }, () => {

        // console.log(payMethodData)
        options.success && options.success()
      })
    },
    // 直属选择方式
    selSelectPayMethod({
      currentTarget: {
        dataset
      }
    }) {

      var payMethod = this.data.payMethod
      var methodData = payMethod[dataset.type]
      var total = parseFloat(this.data.total)
      var balance = parseFloat(payMethod.balance.money)
      var dealer = parseFloat(payMethod.dealer.money)
      // console.log(total, balance, dealer)
      // 该支付方式为禁止点击 || 已经是点击状态 ： methodData.select
      if (methodData.select1) {
        return false
      }

      // if (dataset.type == 'linePay') {
      //   if (balance == 0 ) {
      //     payMethod.balance.select = false
      //     payMethod.balance.select1 = true
      //   }else {
      //     payMethod.balance.select = false
      //     payMethod.balance.select1 = false
      //   }
      //   if (dealer == 0) {
      //     payMethod.dealer.select = false
      //     payMethod.dealer.select1 = true
      //   } else {
      //     payMethod.dealer.select = false
      //     payMethod.dealer.select1 = false
      //   }

      //   payMethod.wechat.select = false
      //   payMethod.wechat.select1 = false

      //   payMethod.alipay.select = false
      //   payMethod.alipay.select1 = false

      //   payMethod.bankCard.select = false
      //   payMethod.bankCard.select1 = false

      //   payMethod.linePay.select = true
      //   payMethod.linePay.select1 = false
      // }else 
      if (dataset.type == 'balance' || dataset.type == 'dealer') {

        if (balance >= total && dealer >= total) {

          if (dataset.type == 'balance') {
            payMethod.balance.select = !payMethod.balance.select
            if (payMethod.balance.select) { // 选中
              payMethod.balance.select = true
              payMethod.balance.select1 = false

              payMethod.dealer.select = false
              payMethod.dealer.select1 = false

              payMethod.wechat.select = false
              payMethod.wechat.select1 = true

              payMethod.alipay.select = false
              payMethod.alipay.select1 = true

              payMethod.bankCard.select = false
              payMethod.bankCard.select1 = true

              payMethod.linePay.select = false
              payMethod.linePay.select1 = true
            } else { // 取消选中
              payMethod.balance.select = false
              payMethod.balance.select1 = false

              payMethod.dealer.select = false
              payMethod.dealer.select1 = false

              payMethod.wechat.select = true
              payMethod.wechat.select1 = false

              payMethod.alipay.select = false
              payMethod.alipay.select1 = false

              payMethod.bankCard.select = false
              payMethod.bankCard.select1 = false

              payMethod.linePay.select = false
              payMethod.linePay.select1 = false
            }
          } else if (dataset.type == 'dealer') {
            payMethod.dealer.select = !payMethod.dealer.select
            if (payMethod.dealer.select) { // 选中
              payMethod.balance.select = false
              payMethod.balance.select1 = false

              payMethod.dealer.select = true
              payMethod.dealer.select1 = false

              payMethod.wechat.select = false
              payMethod.wechat.select1 = true

              payMethod.alipay.select = false
              payMethod.alipay.select1 = true

              payMethod.bankCard.select = false
              payMethod.bankCard.select1 = true

              payMethod.linePay.select = false
              payMethod.linePay.select1 = true
            } else { // 取消选中
              payMethod.balance.select = false
              payMethod.balance.select1 = false

              payMethod.dealer.select = false
              payMethod.dealer.select1 = false

              payMethod.wechat.select = true
              payMethod.wechat.select1 = false

              payMethod.alipay.select = false
              payMethod.alipay.select1 = false

              payMethod.bankCard.select = false
              payMethod.bankCard.select1 = false

              payMethod.linePay.select = false
              payMethod.linePay.select1 = false
            }
          }

        } else if (balance >= total && (dealer > 0 && dealer < total)) { // 只能选中其中一个，其中选择dealer，需要默认选择其他一种方式

          if (dataset.type == 'balance') {
            payMethod.balance.select = !payMethod.balance.select
            // 勾选余额
            if (payMethod.balance.select) { // 选中
              payMethod.balance.select = true
              payMethod.balance.select1 = false

              payMethod.dealer.select = false
              payMethod.dealer.select1 = false

              payMethod.wechat.select = false
              payMethod.wechat.select1 = true

              payMethod.alipay.select = false
              payMethod.alipay.select1 = true

              payMethod.bankCard.select = false
              payMethod.bankCard.select1 = true

              payMethod.linePay.select = false
              payMethod.linePay.select1 = true
            } else { // 未选中
              payMethod.balance.select = false
              payMethod.balance.select1 = false

              payMethod.dealer.select = true
              payMethod.dealer.select1 = false

              payMethod.wechat.select = true
              payMethod.wechat.select1 = false

              payMethod.alipay.select = false
              payMethod.alipay.select1 = false

              payMethod.bankCard.select = false
              payMethod.bankCard.select1 = false

              payMethod.linePay.select = false
              payMethod.linePay.select1 = false
            }
          } else if (dataset.type == 'dealer') { // 可提现

            payMethod.dealer.select = !payMethod.dealer.select
            if (payMethod.dealer.select) { // 选中
              payMethod.balance.select = false
              payMethod.balance.select1 = false

              payMethod.dealer.select = true
              payMethod.dealer.select1 = false
              // 如果原先有一个已点击了下面的支付方式，点击余额或提现时，该支付方式不变
              if (!payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select) {
                payMethod.wechat.select = true
                payMethod.wechat.select1 = false

                payMethod.alipay.select = false
                payMethod.alipay.select1 = false

                payMethod.bankCard.select = false
                payMethod.bankCard.select1 = false

                payMethod.linePay.select = false
                payMethod.linePay.select1 = false
              }
            } else { // 取消选中
              payMethod.balance.select = false

            }
          }
        } else if (balance >= total && dealer == 0) {
          payMethod.balance.select = !payMethod.balance.select
          if (payMethod.balance.select) { // 选中余额
            payMethod.wechat.select = false
            payMethod.wechat.select1 = true

            payMethod.alipay.select = false
            payMethod.alipay.select1 = true

            payMethod.bankCard.select = false
            payMethod.bankCard.select1 = true

            payMethod.linePay.select = false
            payMethod.linePay.select1 = true
          } else {
            payMethod.wechat.select = true
            payMethod.wechat.select1 = false

            payMethod.alipay.select = false
            payMethod.alipay.select1 = false

            payMethod.bankCard.select = false
            payMethod.bankCard.select1 = false

            payMethod.linePay.select = false
            payMethod.linePay.select1 = false
          }
        } else if ((balance > 0 && balance < total) && (dealer > 0 && dealer < total)) {

          if (dataset.type == 'balance') {
            payMethod.balance.select = !payMethod.balance.select
            if (payMethod.balance.select) { // 余额选中
              payMethod.balance.select = true

              if (payMethod.dealer.select) { // 提现金额选中
                if (App.Util.accAdd(balance, dealer) >= total) {
                  payMethod.wechat.select = false
                  payMethod.wechat.select1 = true

                  payMethod.alipay.select = false
                  payMethod.alipay.select1 = true

                  payMethod.bankCard.select = false
                  payMethod.bankCard.select1 = true

                  payMethod.linePay.select = false
                  payMethod.linePay.select1 = true
                }
              }
              // else if (payMethod.linePay.select) {
              //   payMethod.wechat.select = true
              //   payMethod.wechat.select1 = false

              //   payMethod.alipay.select = false
              //   payMethod.alipay.select1 = false

              //   payMethod.bankCard.select = false
              //   payMethod.bankCard.select1 = false

              //   payMethod.linePay.select = false
              //   payMethod.linePay.select1 = false
              // }
            } else { // 取消选中
              payMethod.balance.select = false

              if (!payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select && !payMethod.linePay.select) {
                payMethod.wechat.select = true
                payMethod.wechat.select1 = false

                payMethod.alipay.select = false
                payMethod.alipay.select1 = false

                payMethod.bankCard.select = false
                payMethod.bankCard.select1 = false

                payMethod.linePay.select = false
                payMethod.linePay.select1 = false
              }
            }
          } else if (dataset.type == 'dealer') {
            payMethod.dealer.select = !payMethod.dealer.select
            if (payMethod.dealer.select) { // 余额选中
              payMethod.dealer.select = true

              if (payMethod.balance.select) { // 提现金额选中
                if (App.Util.accAdd(balance, dealer) >= total) {
                  payMethod.wechat.select = false
                  payMethod.wechat.select1 = true

                  payMethod.alipay.select = false
                  payMethod.alipay.select1 = true

                  payMethod.bankCard.select = false
                  payMethod.bankCard.select1 = true

                  payMethod.linePay.select = false
                  payMethod.linePay.select1 = true
                }
              }
              // else if (payMethod.linePay.select) {
              //   payMethod.wechat.select = true
              //   payMethod.wechat.select1 = false

              //   payMethod.alipay.select = false
              //   payMethod.alipay.select1 = false

              //   payMethod.bankCard.select = false
              //   payMethod.bankCard.select1 = false

              //   payMethod.linePay.select = false
              //   payMethod.linePay.select1 = false
              // }
            } else { // 取消选中
              payMethod.dealer.select = false

              if (!payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select && !payMethod.linePay.select) {
                payMethod.wechat.select = true
                payMethod.wechat.select1 = false

                payMethod.alipay.select = false
                payMethod.alipay.select1 = false

                payMethod.bankCard.select = false
                payMethod.bankCard.select1 = false

                payMethod.linePay.select = false
                payMethod.linePay.select1 = false
              }

            }
          }

        } else if ((balance > 0 && balance < total) && dealer >= total) {
          if (dataset.type == 'balance') {
            payMethod.balance.select = !payMethod.balance.select
            if (payMethod.balance.select) { // 选中
              payMethod.balance.select = true
              payMethod.balance.select1 = false

              payMethod.dealer.select = true  // 2版
              payMethod.dealer.select1 = false

              // if (!payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select) {// 2版
              payMethod.wechat.select = false
              payMethod.wechat.select1 = true// 2版

              payMethod.alipay.select = false
              payMethod.alipay.select1 = true// 2版

              payMethod.bankCard.select = false
              payMethod.bankCard.select1 = true// 2版

              payMethod.linePay.select = false
              payMethod.linePay.select1 = true// 2版
              // }
            } else { //取消选中
              payMethod.balance.select = false
            }
          } else if (dataset.type == 'dealer') {
            payMethod.dealer.select = !payMethod.dealer.select
            if (payMethod.dealer.select) { // 选中
              payMethod.balance.select = false
              payMethod.balance.select1 = false

              payMethod.dealer.select = true
              payMethod.dealer.select1 = false

              payMethod.wechat.select = false
              payMethod.wechat.select1 = true

              payMethod.alipay.select = false
              payMethod.alipay.select1 = true

              payMethod.bankCard.select = false
              payMethod.bankCard.select1 = true

              payMethod.linePay.select = false
              payMethod.linePay.select1 = true
            } else { //取消选中
              payMethod.balance.select = true
              payMethod.balance.select1 = false

              payMethod.dealer.select = false
              payMethod.dealer.select1 = false

              payMethod.wechat.select = true
              payMethod.wechat.select1 = false

              payMethod.alipay.select = false
              payMethod.alipay.select1 = false

              payMethod.bankCard.select = false
              payMethod.bankCard.select1 = false

              payMethod.linePay.select = false
              payMethod.linePay.select1 = false
            }
          }
        } else if ((balance > 0 && balance < total) && dealer == 0) {
          payMethod.balance.select = !payMethod.balance.select
          // 如果余额选中，且可选的支付方式是线下支付，则默认是微信支付
          if (payMethod.balance.select && payMethod.linePay.select) {
            payMethod.wechat.select = true
            payMethod.wechat.select1 = false

            payMethod.alipay.select = false
            payMethod.alipay.select1 = false

            payMethod.bankCard.select = false
            payMethod.bankCard.select1 = false

            payMethod.linePay.select = false
            payMethod.linePay.select1 = false
          }
        } else if (balance == 0 && (dealer > 0 && dealer < total)) {
          payMethod.dealer.select = !payMethod.dealer.select
          // 同上
          if (payMethod.dealer.select && payMethod.linePay.select) {
            payMethod.wechat.select = true
            payMethod.wechat.select1 = false

            payMethod.alipay.select = false
            payMethod.alipay.select1 = false

            payMethod.bankCard.select = false
            payMethod.bankCard.select1 = false

            payMethod.linePay.select = false
            payMethod.linePay.select1 = false
          }
        } else if (balance == 0 && dealer >= total) {
          payMethod.dealer.select = !payMethod.dealer.select
          if (payMethod.dealer.select) { // 选中
            payMethod.wechat.select = false
            payMethod.wechat.select1 = true

            payMethod.alipay.select = false
            payMethod.alipay.select1 = true

            payMethod.bankCard.select = false
            payMethod.bankCard.select1 = true

            payMethod.linePay.select = false
            payMethod.linePay.select1 = true
          } else {
            payMethod.wechat.select = true
            payMethod.wechat.select1 = false

            payMethod.alipay.select = false
            payMethod.alipay.select1 = false

            payMethod.bankCard.select = false
            payMethod.bankCard.select1 = false

            payMethod.linePay.select = false
            payMethod.linePay.select1 = false
          }
        }
      } else
        if (dataset.type == 'wechat' && !methodData.select) {
          payMethod.wechat.select = true
          payMethod.wechat.select1 = false

          payMethod.alipay.select = false
          payMethod.alipay.select1 = false

          payMethod.bankCard.select = false
          payMethod.bankCard.select1 = false

          payMethod.linePay.select = false
          payMethod.linePay.select1 = false
        } else if (dataset.type == 'alipay' && !methodData.select) {
          payMethod.wechat.select = false
          payMethod.wechat.select1 = false

          payMethod.alipay.select = true
          payMethod.alipay.select1 = false

          payMethod.bankCard.select = false
          payMethod.bankCard.select1 = false

          payMethod.linePay.select = false
          payMethod.linePay.select1 = false
        } else if (dataset.type == 'bankCard' && !methodData.select) {
          payMethod.wechat.select = false
          payMethod.wechat.select1 = false

          payMethod.alipay.select = false
          payMethod.alipay.select1 = false

          payMethod.bankCard.select = true
          payMethod.bankCard.select1 = false

          payMethod.linePay.select = false
          payMethod.linePay.select1 = false
        } else if (dataset.type == 'linePay' && !methodData.select) {
          payMethod.wechat.select = false
          payMethod.wechat.select1 = false

          payMethod.alipay.select = false
          payMethod.alipay.select1 = false

          payMethod.bankCard.select = false
          payMethod.bankCard.select1 = false

          payMethod.linePay.select = true
          payMethod.linePay.select1 = false
        }
      this.setData({
        payMethod
      })
    },
    // 非直属选择支付方式
    selectPayMethod({
      currentTarget: {
        dataset
      }
    }) {

      var payMethod = this.data.payMethod
      var methodData = payMethod[dataset.type]
      var total = parseFloat(this.data.total)
      var balance = parseFloat(payMethod.balance.money)
      var dealer = parseFloat(payMethod.dealer.money)
      // console.log(total, balance, dealer)
      // 该支付方式为禁止点击 || 已经是点击状态 ： methodData.select
      if (methodData.select1) {
        return false
      }

      if (dataset.type == 'linePay') {
        if (balance == 0 ) {
          payMethod.balance.select = false
          payMethod.balance.select1 = true
        }else {
          payMethod.balance.select = false
          payMethod.balance.select1 = false
        }
        if (dealer == 0) {
          payMethod.dealer.select = false
          payMethod.dealer.select1 = true
        } else {
          payMethod.dealer.select = false
          payMethod.dealer.select1 = false
        }

        payMethod.wechat.select = false
        payMethod.wechat.select1 = false

        payMethod.alipay.select = false
        payMethod.alipay.select1 = false

        payMethod.bankCard.select = false
        payMethod.bankCard.select1 = false

        payMethod.linePay.select = true
        payMethod.linePay.select1 = false
      }else 
      if (dataset.type == 'balance' || dataset.type == 'dealer') {

        if (balance >= total && dealer >= total) {

          if (dataset.type == 'balance') {
            payMethod.balance.select = !payMethod.balance.select
            if (payMethod.balance.select) { // 选中
              payMethod.balance.select = true
              payMethod.balance.select1 = false

              payMethod.dealer.select = false
              payMethod.dealer.select1 = false

              payMethod.wechat.select = false
              payMethod.wechat.select1 = true

              payMethod.alipay.select = false
              payMethod.alipay.select1 = true

              payMethod.bankCard.select = false
              payMethod.bankCard.select1 = true

              payMethod.linePay.select = false
              payMethod.linePay.select1 = true
            } else { // 取消选中
              payMethod.balance.select = false
              payMethod.balance.select1 = false

              payMethod.dealer.select = false
              payMethod.dealer.select1 = false

              payMethod.wechat.select = true
              payMethod.wechat.select1 = false

              payMethod.alipay.select = false
              payMethod.alipay.select1 = false

              payMethod.bankCard.select = false
              payMethod.bankCard.select1 = false

              payMethod.linePay.select = false
              payMethod.linePay.select1 = false
            }
          } else if (dataset.type == 'dealer') {
            payMethod.dealer.select = !payMethod.dealer.select
            if (payMethod.dealer.select) { // 选中
              payMethod.balance.select = false
              payMethod.balance.select1 = false

              payMethod.dealer.select = true
              payMethod.dealer.select1 = false

              payMethod.wechat.select = false
              payMethod.wechat.select1 = true

              payMethod.alipay.select = false
              payMethod.alipay.select1 = true

              payMethod.bankCard.select = false
              payMethod.bankCard.select1 = true

              payMethod.linePay.select = false
              payMethod.linePay.select1 = true
            } else { // 取消选中
              payMethod.balance.select = false
              payMethod.balance.select1 = false

              payMethod.dealer.select = false
              payMethod.dealer.select1 = false

              payMethod.wechat.select = true
              payMethod.wechat.select1 = false

              payMethod.alipay.select = false
              payMethod.alipay.select1 = false

              payMethod.bankCard.select = false
              payMethod.bankCard.select1 = false

              payMethod.linePay.select = false
              payMethod.linePay.select1 = false
            }
          }

        } else if (balance >= total && (dealer > 0 && dealer < total)) { // 只能选中其中一个，其中选择dealer，需要默认选择其他一种方式

          if (dataset.type == 'balance') {
            payMethod.balance.select = !payMethod.balance.select
            // 勾选余额
            if (payMethod.balance.select) { // 选中
              payMethod.balance.select = true
              payMethod.balance.select1 = false

              payMethod.dealer.select = false
              payMethod.dealer.select1 = false

              payMethod.wechat.select = false
              payMethod.wechat.select1 = true

              payMethod.alipay.select = false
              payMethod.alipay.select1 = true

              payMethod.bankCard.select = false
              payMethod.bankCard.select1 = true

              payMethod.linePay.select = false
              payMethod.linePay.select1 = true
            } else { // 未选中
              payMethod.balance.select = false
              payMethod.balance.select1 = false

              payMethod.dealer.select = true
              payMethod.dealer.select1 = false

              payMethod.wechat.select = true
              payMethod.wechat.select1 = false

              payMethod.alipay.select = false
              payMethod.alipay.select1 = false

              payMethod.bankCard.select = false
              payMethod.bankCard.select1 = false

              payMethod.linePay.select = false
              payMethod.linePay.select1 = false
            }
          } else if (dataset.type == 'dealer') { // 可提现
          
            payMethod.dealer.select = !payMethod.dealer.select
            if (payMethod.dealer.select) { // 选中
              payMethod.balance.select = false
              payMethod.balance.select1 = false

              payMethod.dealer.select = true
              payMethod.dealer.select1 = false
              // 如果原先有一个已点击了下面的支付方式，点击余额或提现时，该支付方式不变
              if (!payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select ) {
                payMethod.wechat.select = true
                payMethod.wechat.select1 = false

                payMethod.alipay.select = false
                payMethod.alipay.select1 = false

                payMethod.bankCard.select = false
                payMethod.bankCard.select1 = false

                payMethod.linePay.select = false
                payMethod.linePay.select1 = false
              }
            } else { // 取消选中
              payMethod.balance.select = false

            }
          }
        } else if (balance >= total && dealer == 0) {
          payMethod.balance.select = !payMethod.balance.select
          if (payMethod.balance.select) { // 选中余额
            payMethod.wechat.select = false
            payMethod.wechat.select1 = true

            payMethod.alipay.select = false
            payMethod.alipay.select1 = true

            payMethod.bankCard.select = false
            payMethod.bankCard.select1 = true

            payMethod.linePay.select = false
            payMethod.linePay.select1 = true
          } else {
            payMethod.wechat.select = true
            payMethod.wechat.select1 = false

            payMethod.alipay.select = false
            payMethod.alipay.select1 = false

            payMethod.bankCard.select = false
            payMethod.bankCard.select1 = false

            payMethod.linePay.select = false
            payMethod.linePay.select1 = false
          }
        } else if ((balance > 0 && balance < total) && (dealer > 0 && dealer < total)) {

          if (dataset.type == 'balance') {
            payMethod.balance.select = !payMethod.balance.select
            if (payMethod.balance.select) { // 余额选中
              payMethod.balance.select = true

              if (payMethod.dealer.select) { // 提现金额选中
                if (App.Util.accAdd(balance, dealer) >= total) {
                  payMethod.wechat.select = false
                  payMethod.wechat.select1 = true

                  payMethod.alipay.select = false
                  payMethod.alipay.select1 = true

                  payMethod.bankCard.select = false
                  payMethod.bankCard.select1 = true

                  payMethod.linePay.select = false
                  payMethod.linePay.select1 = true
                }
              } 
              else if (payMethod.linePay.select) {
                payMethod.wechat.select = true
                payMethod.wechat.select1 = false

                payMethod.alipay.select = false
                payMethod.alipay.select1 = false

                payMethod.bankCard.select = false
                payMethod.bankCard.select1 = false

                payMethod.linePay.select = false
                payMethod.linePay.select1 = false
              }
            } else { // 取消选中
              payMethod.balance.select = false

              if (!payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select && !payMethod.linePay.select) {
                payMethod.wechat.select = true
                payMethod.wechat.select1 = false

                payMethod.alipay.select = false
                payMethod.alipay.select1 = false

                payMethod.bankCard.select = false
                payMethod.bankCard.select1 = false

                payMethod.linePay.select = false
                payMethod.linePay.select1 = false
              }
            }
          } else if (dataset.type == 'dealer') {
            payMethod.dealer.select = !payMethod.dealer.select
            if (payMethod.dealer.select) { // 余额选中
              payMethod.dealer.select = true

              if (payMethod.balance.select) { // 提现金额选中
                if (App.Util.accAdd(balance, dealer) >= total) {
                  payMethod.wechat.select = false
                  payMethod.wechat.select1 = true

                  payMethod.alipay.select = false
                  payMethod.alipay.select1 = true

                  payMethod.bankCard.select = false
                  payMethod.bankCard.select1 = true

                  payMethod.linePay.select = false
                  payMethod.linePay.select1 = true
                }
              } 
              else if (payMethod.linePay.select) {
                payMethod.wechat.select = true
                payMethod.wechat.select1 = false

                payMethod.alipay.select = false
                payMethod.alipay.select1 = false

                payMethod.bankCard.select = false
                payMethod.bankCard.select1 = false

                payMethod.linePay.select = false
                payMethod.linePay.select1 = false
              }
            } else { // 取消选中
              payMethod.dealer.select = false

              if (!payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select && !payMethod.linePay.select) {
                payMethod.wechat.select = true
                payMethod.wechat.select1 = false

                payMethod.alipay.select = false
                payMethod.alipay.select1 = false

                payMethod.bankCard.select = false
                payMethod.bankCard.select1 = false

                payMethod.linePay.select = false
                payMethod.linePay.select1 = false
              }

            }
          }

        } else if ((balance > 0 && balance < total) && dealer >= total) {
          if (dataset.type == 'balance') {
            payMethod.balance.select = !payMethod.balance.select
            if (payMethod.balance.select) { // 选中
              payMethod.balance.select = true
              payMethod.balance.select1 = false

              payMethod.dealer.select = true  // 2版
              payMethod.dealer.select1 = false

              // if (!payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select) {// 2版
                payMethod.wechat.select = false
              payMethod.wechat.select1 = true// 2版

                payMethod.alipay.select = false
              payMethod.alipay.select1 = true// 2版

                payMethod.bankCard.select = false
              payMethod.bankCard.select1 = true// 2版

                payMethod.linePay.select = false
              payMethod.linePay.select1 = true// 2版
              // }
            } else { //取消选中
              payMethod.balance.select = false
            }
          } else if (dataset.type == 'dealer') {
            payMethod.dealer.select = !payMethod.dealer.select
            if (payMethod.dealer.select) { // 选中
              payMethod.balance.select = false
              payMethod.balance.select1 = false

              payMethod.dealer.select = true
              payMethod.dealer.select1 = false

              payMethod.wechat.select = false
              payMethod.wechat.select1 = true

              payMethod.alipay.select = false
              payMethod.alipay.select1 = true

              payMethod.bankCard.select = false
              payMethod.bankCard.select1 = true

              payMethod.linePay.select = false
              payMethod.linePay.select1 = true
            } else { //取消选中
              payMethod.balance.select = true
              payMethod.balance.select1 = false

              payMethod.dealer.select = false
              payMethod.dealer.select1 = false

              payMethod.wechat.select = true
              payMethod.wechat.select1 = false

              payMethod.alipay.select = false
              payMethod.alipay.select1 = false

              payMethod.bankCard.select = false
              payMethod.bankCard.select1 = false

              payMethod.linePay.select = false
              payMethod.linePay.select1 = false
            }
          }
        } else if ((balance > 0 && balance < total) && dealer == 0) {
          payMethod.balance.select = !payMethod.balance.select
          // 如果余额选中，且可选的支付方式是线下支付，则默认是微信支付
          if (payMethod.balance.select && payMethod.linePay.select) {
            payMethod.wechat.select = true
            payMethod.wechat.select1 = false

            payMethod.alipay.select = false
            payMethod.alipay.select1 = false

            payMethod.bankCard.select = false
            payMethod.bankCard.select1 = false

            payMethod.linePay.select = false
            payMethod.linePay.select1 = false
          }
        } else if (balance == 0 && (dealer > 0 && dealer < total)) {
          payMethod.dealer.select = !payMethod.dealer.select
          // 同上
          if (payMethod.dealer.select && payMethod.linePay.select) {
            payMethod.wechat.select = true
            payMethod.wechat.select1 = false

            payMethod.alipay.select = false
            payMethod.alipay.select1 = false

            payMethod.bankCard.select = false
            payMethod.bankCard.select1 = false

            payMethod.linePay.select = false
            payMethod.linePay.select1 = false
          }
        } else if (balance == 0 && dealer >= total) {
          payMethod.dealer.select = !payMethod.dealer.select
          if (payMethod.dealer.select) { // 选中
            payMethod.wechat.select = false
            payMethod.wechat.select1 = true

            payMethod.alipay.select = false
            payMethod.alipay.select1 = true

            payMethod.bankCard.select = false
            payMethod.bankCard.select1 = true

            payMethod.linePay.select = false
            payMethod.linePay.select1 = true
          } else {
            payMethod.wechat.select = true
            payMethod.wechat.select1 = false

            payMethod.alipay.select = false
            payMethod.alipay.select1 = false

            payMethod.bankCard.select = false
            payMethod.bankCard.select1 = false

            payMethod.linePay.select = false
            payMethod.linePay.select1 = false
          }
        }
      } else
      if (dataset.type == 'wechat' && !methodData.select) {
        payMethod.wechat.select = true
        payMethod.wechat.select1 = false

        payMethod.alipay.select = false
        payMethod.alipay.select1 = false

        payMethod.bankCard.select = false
        payMethod.bankCard.select1 = false

        payMethod.linePay.select = false
        payMethod.linePay.select1 = false
      } else if (dataset.type == 'alipay' && !methodData.select) {
        payMethod.wechat.select = false
        payMethod.wechat.select1 = false

        payMethod.alipay.select = true
        payMethod.alipay.select1 = false

        payMethod.bankCard.select = false
        payMethod.bankCard.select1 = false

        payMethod.linePay.select = false
        payMethod.linePay.select1 = false
      } else if (dataset.type == 'bankCard' && !methodData.select) {
        payMethod.wechat.select = false
        payMethod.wechat.select1 = false

        payMethod.alipay.select = false
        payMethod.alipay.select1 = false

        payMethod.bankCard.select = true
        payMethod.bankCard.select1 = false

        payMethod.linePay.select = false
        payMethod.linePay.select1 = false
      } else if (dataset.type == 'linePay' && !methodData.select) {
        payMethod.wechat.select = false
        payMethod.wechat.select1 = false

        payMethod.alipay.select = false
        payMethod.alipay.select1 = false

        payMethod.bankCard.select = false
        payMethod.bankCard.select1 = false

        payMethod.linePay.select = true
        payMethod.linePay.select1 = false
      }
      this.setData({
        payMethod
      })
    },
    // 获取用户基础信息（手机号）
    getUserBaseInfo(options) {
      var that = this
      App.Util.getUserCenter({
        success(res) {
          console.log('获取用户基础信息（手机号）', res)
          that.setData({
            userBaseInfo: res.data
          })
          options.success && options.success()
        },fail() {
          options.fail && options.fail()
        },complete() {
          options.complete && options.complete()
        }
      })
    },
    // 前往绑定手机号
    handleModal({
      detail: {
        index
      }
    }) {
      console.log(index)
      if (index == 1) {
        wx.navigateTo({
          url: '/pages/mine/set/set_mobile',
        })
      }
      this.setData({
        visibleModal: false
      })
      this.unlockPayBtn()
    },
    // 线下支付提示框
    handleModal1({
      detail: {
        index
      }
    }) {
      if (index == 1) {
        this.triggerEvent('_openPopUp', {
          type: 'pay'
        })
      }
      this.setData({
        visibleModal1: false
      })
      this.unlockPayBtn()
    },
    // 解锁确认支付按钮
    unlockPayBtn() {
      this.setData({
        payBtnLock: false
      })
    },
    // 支付（组件外通过查询组件id，调用该方法）
    pay(options) {
     
      options = options || {}
      var orderInfo = options.orderInfo || {} // 订单信息
      var orderInfoKey = options.orderInfoKey || 'orderInfo' // 存放订单信息关键字
      options.that = options.that || {} // 主页面实例
      var payMethod = this.data.payMethod
      var userBaseInfo = this.data.userBaseInfo
      var total = parseFloat(this.data.total)
      // var switchWay = options.switchWay // 物流配送(logistics)或自提(selfExtract)
      var extractTime = options.extractTime || '' //自提时间戳 （传入的值要除以1000）
      var that = this

      var copyOrder = options.copyOrder || {} // 复制订单信息

      console.log('pay', orderInfo, options)
      // 手机号为空或者为0时，前往绑定手机号
      // userBaseInfo.u_mobi = 0
      if (!userBaseInfo.u_mobi || userBaseInfo.u_mobi == 0) {
        this.setData({
          visibleModal: true
        })
        return
      }
      new Promise((resolve) => {
        // 未创建订单时
        orderInfo.sn ? orderInfo.order_sn = orderInfo.sn : ''
        var isNotHasOrderSn = (!orderInfo || JSON.stringify(orderInfo) === "{}") ? true : !orderInfo.order_sn ? true : false
        console.log(isNotHasOrderSn)
        console.log('shipdev=', orderInfo.shipdev)
        if (isNotHasOrderSn) {
          if (!orderInfo.ids) console.error('当前页面未处理ids!')
          if (!orderInfo.props) console.error('当前页面未处理props!')
          if (!orderInfo.addressId) console.error('当前页面未处理addressId!')
          $Toast({
            content: '正在创建订单...',
            duration: 0,
          });
          App.Util.creatOrder({
            ids: orderInfo.ids,
            props: orderInfo.props,
            addressId: orderInfo.addressId,
            shiptype: orderInfo.shiptype, // 物流 || 自提：4
            devtype: Number(orderInfo.shipdev), // 寄付到付 || 自提：0
            cash: orderInfo.cash || 0,
            extractTime, // 自提时间
            mark: orderInfo.mark,
            gift: JSON.stringify(orderInfo.gift),//赠品id
            subtype: copyOrder.subtype || '', // 复制订单
            nums: copyOrder.nums || [], // 复制订单
            success(res) {
              console.log('creatOrderSuccess', res)
              if (res && res.data) {
                if (!options.that) console.warn('The current page instance was not found!')
                // 更新当前页面订单信息
                options.that.setData({
                  [orderInfoKey]: Object.assign(orderInfo, res.data)
                })
                that.triggerEvent('_creatOrder', res.data)
              }
              resolve(res.data)
            },
            fail(res) {
              $Toast.hide()
              console.log('creatOrderFail', res)
              that.unlockPayBtn()
            },
            complete() {
              options.complete && options.complete()
            }
          })
        } else { // 已有订单

          resolve(orderInfo)
        }
      }).then((res) => {
        // console.log('then', res)
        // $Toast({
        //   content: '处理中，请稍后...',
        //   duration: 0,
        // });
        console.log('orderInfo=',res)
        let id = res.order_id || res.id
        that.setData({
          order_sn: res.order_sn,
          order_id: id,
        })
        
        // 1余额支付
        if (payMethod.balance.select && !payMethod.dealer.select && !payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select && !payMethod.linePay.select) {
          // console.log('余额',res)
          wx.navigateTo({
            url: '/pages/mine/set/mobile_check?phone=' + userBaseInfo.u_mobi + '&pageType=orderPay' + '&order_sn=' + res.order_sn + '&payType=balance&order_id=' + id,
          })
          that.unlockPayBtn()
          $Toast.hide()
          return
        }
        // 2提现金额支付
        if (!payMethod.balance.select && payMethod.dealer.select && !payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select && !payMethod.linePay.select) {
          wx.navigateTo({
            url: '/pages/mine/set/mobile_check?phone=' + userBaseInfo.u_mobi + '&pageType=orderPay' + '&order_sn=' + res.order_sn + '&payType=dealer&order_id=' + id,
          })
          that.unlockPayBtn()
          $Toast.hide()
          return
        }
        // 3余额+提现金额支付
        if (payMethod.balance.select && payMethod.dealer.select && !payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select && !payMethod.linePay.select) {
          wx.navigateTo({
            url: '/pages/mine/set/mobile_check?phone=' + userBaseInfo.u_mobi + '&pageType=orderPay' + '&order_sn=' + res.order_sn + '&payType=balanceAndDealer&order_id=' + id,
          })
          that.unlockPayBtn()
          $Toast.hide()
          return
        }
        // 4余额+微信支付
        if (payMethod.balance.select && !payMethod.dealer.select && payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select && !payMethod.linePay.select) {
          // 获取支付信息
          App.Util.orderPay({
            order_sn: res.order_sn,
            baltype: [1],
            type: 1, // 微信支付
            success(r) {
              $Toast({
                type: 'loading',
                content: '加载中...',
                duration: 0,
              });
              App.Util.wechatPay(Object.assign(r, {
                success(res) {
                  that.paySuccess(res)
                },
                fail(res) {
                  that.wechatPayFail(res)
                }
              }))
            },
            fail(res) {
              $Toast.hide()
              that.unlockPayBtn()
              App.Util.showToast(res.data.msg || '订单提交失败！')
            },
            complete() {
              
            }
          })
          return
        }
        // 5提现金额+微信支付
        if (!payMethod.balance.select && payMethod.dealer.select && payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select && !payMethod.linePay.select) {
          // 获取支付信息
          App.Util.orderPay({
            order_sn: res.order_sn,
            baltype: [2],
            type: 1, // 微信支付
            success(r) {
              $Toast({
                type: 'loading',
                content: '加载中...',
                duration: 0,
              });
              App.Util.wechatPay(Object.assign(r, {
                success(res) {
                  that.paySuccess(res)
                },
                fail(res) {
                  that.wechatPayFail(res)
                }
              }))
            },
            fail(res) {
              $Toast.hide()
              that.unlockPayBtn()
              App.Util.showToast(res.data.msg || '订单提交失败！')
            },
            complete() {
              
            }
          })
          return
        }

        // 6余额+提现金额+微信支付
        if (payMethod.balance.select && payMethod.dealer.select && payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select && !payMethod.linePay.select) {
          // 获取支付信息
          App.Util.orderPay({
            order_sn: res.order_sn,
            baltype: [1, 2],
            type: 1, // 微信支付
            success(r) {
              $Toast({
                type: 'loading',
                content: '加载中...',
                duration: 0,
              });
              App.Util.wechatPay(Object.assign(r, {
                success(res) {
                  that.paySuccess(res)
                },
                fail(res) {
                  that.wechatPayFail(res)
                }
              }))
            },
            fail(res) {
              $Toast.hide()
              that.unlockPayBtn()
              App.Util.showToast(res.data.msg || '订单提交失败！')
            },
            complete() {
              
            }
          })
          return
        }

        // 7微信支付
        if (!payMethod.balance.select && !payMethod.dealer.select && payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select && !payMethod.linePay.select) {
          // 获取支付信息
          App.Util.orderPay({
            order_sn: res.order_sn,
            type: 1, // 微信支付
            success(r) {
              $Toast({
                type: 'loading',
                content: '加载中...',
                duration: 0,
              });
              App.Util.wechatPay(Object.assign(r, {
                success(res) {
                  that.paySuccess(res)
                },
                fail(res) {
                  that.wechatPayFail(res)
                }
              }))
            },
            fail(res) {
              $Toast.hide()
              that.unlockPayBtn()
              App.Util.showToast(res.data.msg || '订单提交失败！')
            },
            complete() {
              
            }
          })
          return
        } //
        // 8 线下支付
        if (!payMethod.balance.select && !payMethod.dealer.select && !payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select && payMethod.linePay.select) {
          // let id = res.order_id || res.id
          // 直属
          if(that.data.userInfo.seltype == 1) {
            wx.navigateTo({
              url: '/pages/offlinePay/index?payType=linePay' + '&order_id=' + id + '&order_sn=' + res.order_sn + '&money=' + total + '&baltype=',
            })
            that.unlockPayBtn()
            $Toast.hide()
          }else { // 非直属
            that.unlockPayBtn()
            $Toast.hide()
            $Toast({
              type: 'loading',
              content: '正在提交...',
            })
            App.Util.request({
              url: App.Api.linePay,
              data: {
                sn: id
              },
              method: 'POST',
              success(res) {
                console.log()
                $Toast.hide()
                $Message({
                  content: '提交成功',
                  type: 'default',
                  callback() {
                    let { userInfo, order_id } = that.data
                    wx.redirectTo({
                      url: "/pages/team/orderInformation?userId=" + userInfo.u_id + "&shopId=" + userInfo.shopId + "&orderId=" + order_id + '&orderType=stock&opid=' + userInfo.u_id
                    })
                  }
                });
              },
              fail(res) {
                $Toast.hide()
                let msg = res && res.data ? res.data.msg : '提交失败！'
                $Message({
                  content: msg ,
                  type: 'default',
                  callback() {
                    let { userInfo, order_id } = that.data
                    wx.redirectTo({
                      url: "/pages/team/orderInformation?userId=" + userInfo.u_id + "&shopId=" + userInfo.shopId + "&orderId=" + order_id + '&orderType=stock&opid=' + userInfo.u_id
                    })
                  }
                });
              },
              complete() {}
            })
          }
          
          return
        }
        // 9 余额+线下支付
        if (payMethod.balance.select && !payMethod.dealer.select && !payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select && payMethod.linePay.select) {
          let m = parseFloat(total) - parseFloat(payMethod.balance.money)
          // let id = res.order_id || res.id
          wx.navigateTo({
            url: '/pages/offlinePay/index?payType=linePay' + '&order_id=' + id + '&order_sn=' + res.order_sn + '&money=' + m +'&baltype=1',
          })
          that.unlockPayBtn()
          $Toast.hide()
          return
        }
        // 10 提现+线下支付
        if (!payMethod.balance.select && payMethod.dealer.select && !payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select && payMethod.linePay.select) {
          let m = parseFloat(total) - parseFloat(payMethod.dealer.money)
          // let id = res.order_id || res.id
          wx.navigateTo({
            url: '/pages/offlinePay/index?payType=linePay' + '&order_id=' + id + '&order_sn=' + res.order_sn + '&money=' + m + '&baltype=2',
          })
          that.unlockPayBtn()
          $Toast.hide()
          return
        }
        // 11 余额+提现+线下支付
        if (payMethod.balance.select && payMethod.dealer.select && !payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select && payMethod.linePay.select) {
          let m = parseFloat(total) - parseFloat(payMethod.balance.money) - parseFloat(payMethod.dealer.money)
          // let id = res.order_id || res.id
          wx.navigateTo({
            url: '/pages/offlinePay/index?payType=linePay' + '&order_id=' + id + '&order_sn=' + res.order_sn + '&money=' + total + '&baltype=1,2',
          })
          that.unlockPayBtn()
          $Toast.hide()
          return
        }
        // 12 支付宝支付
        if (!payMethod.balance.select && !payMethod.dealer.select && !payMethod.wechat.select && payMethod.alipay.select && !payMethod.bankCard.select && !payMethod.linePay.select) {
          // let id = res.order_id || res.id
          wx.navigateTo({
            url: '/pages/offlinePay/index?payType=Alipay' + '&order_id=' + id + '&order_sn=' + res.order_sn + '&money=' + total + '&baltype=',
          })
          that.unlockPayBtn()
          $Toast.hide()
          return
        }
        // 13 余额+支付宝支付
        if (payMethod.balance.select && !payMethod.dealer.select && !payMethod.wechat.select && payMethod.alipay.select && !payMethod.bankCard.select && !payMethod.linePay.select) {
          let m = parseFloat(total) - parseFloat(payMethod.balance.money)
          // let id = res.order_id || res.id
          wx.navigateTo({
            url: '/pages/offlinePay/index?payType=Alipay' + '&order_id=' + id + '&order_sn=' + res.order_sn + '&money=' + m + '&baltype=1',
          })
          that.unlockPayBtn()
          $Toast.hide()
          return
        }
        // 14 提现+支付宝支付
        if (!payMethod.balance.select && payMethod.dealer.select && !payMethod.wechat.select && payMethod.alipay.select && !payMethod.bankCard.select && !payMethod.linePay.select) {
          let m = parseFloat(total) - parseFloat(payMethod.dealer.money)
          // let id = res.order_id || res.id
          wx.navigateTo({
            url: '/pages/offlinePay/index?payType=Alipay' + '&order_id=' + id + '&order_sn=' + res.order_sn + '&money=' + m + '&baltype=2',
          })
          that.unlockPayBtn()
          $Toast.hide()
          return
        }
        // 15 余额+提现+支付宝支付
        if (payMethod.balance.select && payMethod.dealer.select && !payMethod.wechat.select && payMethod.alipay.select && !payMethod.bankCard.select && !payMethod.linePay.select) {
          let m = parseFloat(total) - parseFloat(payMethod.balance.money) - parseFloat(payMethod.dealer.money)
          // let id = res.order_id || res.id
          wx.navigateTo({
            url: '/pages/offlinePay/index?payType=Alipay' + '&order_id=' + id + '&order_sn=' + res.order_sn + '&money=' + m + '&baltype=1,2',
          })
          that.unlockPayBtn()
          $Toast.hide()
          return
        }
        // 8 线下支付 (不用付款)
        // if (payMethod.linePay.select) {
        //   $Toast({
        //     content: '正在提交，请稍后...',
        //     duration: 0,
        //   });
        //   App.Util.request({
        //     url: App.Api.linePay,
        //     method: 'POST',
        //     data:{
        //       sn: res.order_id,
        //     },
        //     success(r) {
        //       $Message({
        //         content: '提交成功',
        //         type: 'default',
        //         callback() {
        //           wx.switchTab({
        //             url: '/pages/inventory/inventory',
        //             success(e) {

        //             }
        //           })
        //         }
        //       });
        //     },
        //     fail(r) {
        //       $Message({
        //         content: '提交失败！',
        //         type: 'default',
        //         callback() {
        //           // wx.switchTab({
        //           //   url: '/pages/inventory/inventory',
        //           //   success(e) {
        //           //   }
        //           // })
        //         }
        //       });
        //     },
        //     complete() {
        //       that.unlockPayBtn()
        //       $Toast.hide()
        //     }
        //   })
        //   return
        // }
      },() => {
        that.unlockPayBtn()
      })

    },
    // 支付成功
    paySuccess(res) {
      $Toast.hide()
      let that = this
      $Message({
        content: '支付成功！',
        type: 'default',
        callback() {
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
          // userId 该订单发起人的userId
          // opid 本地storage的userId
          let {userInfo,order_id} = that.data
          wx.redirectTo({
            url: "/pages/team/orderInformation?userId=" + userInfo.u_id + "&shopId=" + userInfo.shopId + "&orderId=" + order_id + '&orderType=stock&opid=' + userInfo.u_id
          })
        }
      });
    },
    // 微信支付失败
    wechatPayFail(res) {
      $Toast.hide()
      let that = this
      this.unlockPayBtn()
      if (res.errMsg === "requestPayment:fail cancel") {
        $Message({
          content: '支付已取消',
          type: 'default',
          callback() {
            console.log(res)
            // let { userInfo, order_id } = that.data
            // wx.redirectTo({
            //   url: "/pages/team/orderInformation?userId=" + userInfo.u_id + "&shopId=" + userInfo.shopId + "&orderId=" + order_id + '&orderType=stock&opid=' + userInfo.u_id
            // })
          }
        })
      } else {
        $Message({
          content: '支付失败！',
          type: 'error',
          // duration: 1.5,
          callback() {
            wx.switchTab({
              url: '/pages/home/home',
            })
            // let { userInfo, order_id } = that.data
            // wx.redirectTo({
            //   url: "/pages/team/orderInformation?userId=" + userInfo.u_id + "&shopId=" + userInfo.shopId + "&orderId=" + order_id + '&orderType=stock&opid=' + userInfo.u_id
            // })
          }
        });
      }
    },

  }
})