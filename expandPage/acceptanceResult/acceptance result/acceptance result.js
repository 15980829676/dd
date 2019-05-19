// pages/acceptance result/acceptance result.js
const App =getApp()
const {
  $Toast
} = require('../../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   * status 投诉状态  0-投诉处理中 1-投诉成立 2-投诉失败
      time  申请时间
      uptime  受理时间
      analyse  问题分析
      instruct 领导批示
      result   处理结果
      mark   备注
   */
  data: {
   list:{},
   id:''
  },

  /**
   * 生命周期函数--监听页面加载   
   */
  onLoad: function (options) {
    let id = options.id || ''
    this.setData({
      id
    },()=>{
      this.lomore()
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
  lomore() {
    let that = this
    $Toast({
      content: "加载中",
      duration: 0,
      type: 'loading'
    })
    App.Util.request({
      url: App.Api.acceptanceInfo,
      method: 'POST',
      data:{
        id:that.data.id
      },
      success(res) {
        console.log(res)
        that.setData({
          list: res.data
        })
      },
      fail(res) {

      },
      complete() {
        $Toast.hide()
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