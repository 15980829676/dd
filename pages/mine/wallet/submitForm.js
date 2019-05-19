// pages/mine/wallet/submitForm.js
const { $Message, $Toast } = require('../../../dist/base/index.js'),App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    money: 0,
    type: '',
    adsList: [],
    wallet: {}, // 钱包
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    this.setData({
      options
    })
    if (options.type == 'balance') {
      wx.setNavigationBarTitle({
        title: '余额',
      })
    } else if (options.type == 'withdrawal') {
      wx.setNavigationBarTitle({
        title: '提现',
      })
    }
  },
  // 进货
  replenishStock() {
    wx.switchTab({
      url: '/pages/inventory/orderGoods',
    })
  },
  // 提现
  withdrawal() {
 
    console.log(this.data.wallet.df_money)
    if (!this.data.wallet.df_money || parseFloat(this.data.wallet.df_money) <= 0) {
      $Message({
        content: '您的可提现金额不足',
        // type: 'warning'
      });
      return false
    }
    wx.redirectTo({
      url: './withdrawal/withdrawal',
    })
  },
  // 充值
  recharge() {
    wx.navigateTo({
      url: './recharge/recharge',
    })
  },
  // 余额明细
  balanceDetail() {
    let pageType = this.data.options.type
    let navId = pageType == 'balance' ? 1 : pageType == 'withdrawal' ? 2 : 0
    wx.navigateTo({
      url: './walletDetail?navId=' + navId,
    })
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
  // 获取活动
  getAdsList() {
    var that = this
    App.Util.request({
      url: App.Api.selactive,
      data: {},
      success(res) {
        if (res && res.data) {
          that.setData({
            adsList:res.data
          })
        }
      },
      complete() {
        
      }
    })
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
    this._getWallet()
    this.getAdsList()
  
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