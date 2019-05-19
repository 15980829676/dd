// pages/mine/wallet/withdrawalState.js
const App = getApp(), { formatTime } = require('../../../../utils/util');
const { $Toast, $Message } = require('../../../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    grecord:{} // 详情
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      options
    })
    
    this.queryInfo()
  },
  queryInfo() {
    var that = this
    $Toast({
      duration: 0,
      content: '加载中',
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.financeGrecord,
      data: {
        id: this.data.options.id
      },
      success(res) {
        if (res && res.data) {
          // 申请时间
          let apply_time = parseInt(res.data.wo_addtime) * 1000
          let apply_date = new Date(apply_time)
          res.data.apply_time = formatTime(apply_date, {
            sym: '-',
            precise: 'min'
          })
          // 预计到账时间
          let expect_time = apply_time + (3 * 24 * 60 * 60 * 1000)
          let expect_date = new Date(expect_time)
          res.data.expect_time = formatTime(expect_date, {
            sym: '-',
            precise: 'min'
          })
          that.setData({
            grecord: res.data
          })
        }
      },
      fail(res) {
        let msg = (res.data && res.data.msg)?res.data.msg : '加载失败！'
        App.Util.showToast(msg)
      },
      complete() {
        $Toast.hide()
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