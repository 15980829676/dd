// pages/mine/wallet/recharge/rechargeResult.js
var App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    adsList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options
    })
  },
  btnCompelte({ currentTarget: { dataset}}) {
    let { type } = dataset
    if (type == 'confirm' ) { // 充值成功时，完成按钮
      wx.switchTab({
        url: '/pages/mine/mine',
      })
    } else if (type == 'back' ) { // 充值失败时，返回按钮
      wx.redirectTo({
        url: '/pages/mine/wallet/recharge/recharge',
      })
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
    this.getAdsList()
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