// pages/mine/wallet/index.js
var App = getApp();
const { $Toast } = require('../../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wallet: {} , // 钱包
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
          var total_sum = 0
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
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this._getWallet()
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