// pages/mine/wallet/withdrawal.js
var App = getApp();
const {
  $Toast,
  $Message
} = require('../../../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSwitchBankCard: false, // 是否显示银行卡选择框（背景）
    animat: '', // 银行卡选择框 动画
    currentBankCard: -1, // 当前选中的银行卡
    money: "0.00", // 输入提现金额
    wallet: {}, // 钱包
    cardInfo: {}, // 选中的银行卡信息
    bankCard: [], // 用户已经绑定的银行卡列表
    imgSource: '', // 图片路径
    adsList: [],
    modalData: [ // 持卡人提示弹框信息
      {
        name: '取消',
        color: '#8B8B8B',
        fontSize: '24rpx'
      },
      {
        name: '提交',
        color: '#4DA1FF',
        fontSize: '24rpx'
      }
    ],
    visibleModal: false,
    params: {}, // 提交参数
    tabBarh:50,
    isShowPayType: false, // 是否显示支付类型弹框
    currentPayTypeIndex:-1, // 当前支付类型索引
    currentPayType:{}, // 当前支付类型数据
    payType: [ // 支付类型列表
      { type: 1, name: '银行卡', icon:'/images/method-6.svg'},
      { type: 3, name: '支付宝', icon:'/images/method-5.svg'}
    ]
  },

  // 银行卡
  queryUserCard: function() {
    let that = this;
    App.Util.request({
      url: App.Api.bankCardQuery,
      success(res) {
        if (res && res.data)
          that.setData({
            // cardInfo: res.data[0] || {},
            bankCard: res.data
          })
      },
      fail(res) {
        console.log(res)

      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      imgSource: App.Api.imgSource,
      tabBarh: App.Util.checkPhoneType()
    })
   
  },
  // 显示或隐藏银行卡框
  switchBankCard(e) {
    let systemInfo = wx.getSystemInfoSync()
    var ani = '' // 兼容iphone X
    if (systemInfo.model.indexOf("iPhone X") != -1) {
      ani = '-x'
    }
    var dataset = e.currentTarget.dataset
    if (dataset.type == 'show') {
      this.setData({
        isSwitchBankCard: true,
        animat: 'animatUp' + ani
      })
    } else {
      this.setData({
        animat: 'animatDown' + ani
      })
      setTimeout(() => {
        this.setData({
          isSwitchBankCard: false
        })
      }, 500)
    }

  },
  // 选择银行卡
  changeBankCard({
    currentTarget: {
      dataset
    }
  }) {
    // 添加银行卡
    if (dataset.type && dataset.type == 'add') {
      wx.navigateTo({
        url: '/pages/mine/wallet/addBankCard/fillInfo',
      })
      return 
    }
    // 选择银行卡
    let systemInfo = wx.getSystemInfoSync()
    var ani = '' // 兼容iphone X
    if (systemInfo.model.indexOf("iPhone X") != -1) {
      ani = '-x'
    }
    this.setData({
      currentBankCard: dataset.index,
      cardInfo: dataset.item,
      animat: 'animatDown' + ani
    })
    setTimeout(() => {
      this.setData({
        isSwitchBankCard: false
      })
    }, 500)
  },
  focus(e) {
    let { type} = e.currentTarget.dataset,
      value = e.detail.value
    if (type == 'money') {

      this.setData({
        money: parseFloat(value) ? parseFloat(value).toFixed(2):'',
      })

    }
  },
  blur(e) {
    let type = e.currentTarget.dataset.type,
      value = e.detail.value

    if (type == 'money') {

      this.setData({
        money: value ? parseFloat(value).toFixed(2) : '0.00'
      })

    }
  },
  // 提现
  btnWithdraw(e) {
    // // var money = this.data.money
    // var bankCardData = this.data.bankCard[this.data.currentBankCard]// 银行(暂时不用)
    // console.log(bankCardData, money)

    let detail = e.detail.value,
      withdrawal = parseFloat(this.data.wallet.df_money),// 提现金额
      currentPayTypeIndex = this.data.currentPayTypeIndex,// 当前支付类型索引
      currentPayType = this.data.currentPayType,// 选中的支付类型信息
      cardInfo = this.data.cardInfo,// 选中的银行卡信息
      currentBankCard = this.data.currentBankCard // 选中银行卡索引

    detail.money = parseFloat(detail.money)
    
    if (currentPayTypeIndex < 0) {
      $Message({
        content: '请选择支付类型！',
        type: 'default'
      });
      return
    }
    // 银行卡
    if (currentPayTypeIndex == 0) {
      if (Object.keys(cardInfo).length <= 0) {
        $Message({
          content: '请选择银行卡！',
          type: 'default'
        });
        return
      }
    }
    if (!detail.name) {
      $Message({
        content: '请输入姓名！',
        type: 'default'
      });
      return
    }
    // 支付宝
    if (currentPayTypeIndex == 1) {
      if (!detail.alipay) {
        $Message({
          content: '请输入支付宝账号！',
          type: 'default'
        });
        return
      }
    }
    if (detail.money > withdrawal) {
      $Message({
        content: '提现金额不能大于余额！',
        type: 'default'
      });
      return
    }
    if (detail.money < 50) {
      $Message({
        content: '提现金额不能小于50元！',
        type: 'default'
      });
      return
    }
    let type = currentPayType.type
    let params = {
      type, // 支付宝3 银行卡1
      name: detail.name, // 姓名
      cart: type == 1 ? '' : detail.alipay, // 卡号/账号
      bankId: type == 1 ? cardInfo.id : '', // 银行卡id
      money: detail.money, // 提现金额
    }
    this.setData({
      visibleModal: true,
      params
    })


  },
  // 查看历史记录
  cLog() {
    // console.log('log')
    wx.navigateTo({
      url: './withdrawalRecord',
    })
  },
  // 提示框按钮
  handleModal(e) {
    console.log(e.detail.index)
    let index = e.detail.index
    this.setData({
      visibleModal: false
    })
    if (index == 1) { // 提交
      // console.log(this.data.params)
      $Toast({
        duration: 0,
        content: '正在提交',
        type: 'loading'
      });

      App.Util.request({
        url: App.Api.financeWithDrew,
        data: this.data.params,
        method: 'POST',
        success(res) {
          wx.redirectTo({
            url: './withdrawalState?id=' + res.data,
          })
        },
        fail(res) {
          let msg = res && res.data && res.data.msg ? res.data.msg : '提现失败！'
          $Message({
            content: msg,
            type: 'default'
          });
        },
        complete() {
          $Toast.hide()
        }
      })
    }

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  // 获取活动
  getAdsList() {
    var that = this
    App.Util.request({
      url: App.Api.selactive,
      data: {},
      success(res) {
        if (res && res.data) {
          that.setData({
            adsList: res.data
          })
        }
      },
      complete() {

      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.queryUserCard();// 查询银行卡
    this.getAdsList()
    this._getWallet()
  },
  _getWallet() {
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    var that = this
    // this._wallet = new Promise((resolve) => {
    App.Util.request({
      url: App.Api.wallet,
      data: {},
      success(res) {
        if (res && res.data && res.data != {}) {
          that.setData({
            wallet: res.data
          })
        }
      },
      complete() {
        $Toast.hide()
      }
    })
    // })
  },
  // 弹出支付类型弹框
  switchPayType(e) {
    let { type } = e.currentTarget.dataset
    let systemInfo = wx.getSystemInfoSync()
    var ani = '' // 兼容iphone X
    if (systemInfo.model.indexOf("iPhone X") != -1) {
      ani = '-x'
    }
    var dataset = e.currentTarget.dataset
    if (dataset.type == 'show') {
      this.setData({
        isShowPayType: true,
        animat: 'animatUp' + ani
      })
    } else {
      this.setData({
        animat: 'animatDown' + ani
      })
      setTimeout(() => {
        this.setData({
          isShowPayType: false
        })
      }, 500)
    }
  },
  // 选择支付类型
  changePayType(e) {
    let { index ,item } = e.currentTarget.dataset
    let systemInfo = wx.getSystemInfoSync()
    var ani = '' // 兼容iphone X
    if (systemInfo.model.indexOf("iPhone X") != -1) {
      ani = '-x'
    }
    var dataset = e.currentTarget.dataset
      this.setData({
        currentPayTypeIndex: index,
        currentPayType: item,
        animat: 'animatDown' + ani
      })
      setTimeout(() => {
        this.setData({
          isShowPayType: false
        })
      }, 500)
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

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
  // onShareAppMessage: function () {

  // }
})