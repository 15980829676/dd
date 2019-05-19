// pages/notice/notice.js
var mta = require('../../utils/mta_analysis.js')
const App = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    oder:0,
    seytem:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    mta.Page.init()
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
    this.loamore()
    App.Util.getNoticeCount();
  },
  loamore() {
    let that = this
    App.Util.request({
      url: App.Api.unreadcount,
      method: 'POST',
      success(res) {
        console.log(res)
        that.setData({
          oder: res.data.order,
          seytem: res.data.system
        })

        // that.setData({
        //   noticeListXIT: res.data
        // })
        // console.log('getNoticeList=',res)
        // if (res && res.data) {
        //   that.setData({
        //     startId: res.data[res.data.length - 1].id
        //   })
        // }
        //$Toast.hide();

      },
      fail(e) {

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
  onShareAppMessage: function () {

  }
})