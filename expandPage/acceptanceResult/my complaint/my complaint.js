// pages/my complaint/my complaint.js
const App =getApp()
const {
  $Toast
} = require('../../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载  acceptanceList
   */
  onLoad: function (options) {

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
    this.lomore()
  },
  lomore(){
    let that = this
    $Toast({
      content: "加载中",
      duration: 0,
      type: 'loading'
    })
    App.Util.request({
      url: App.Api.acceptanceList,
      method: 'POST',
      success(res) {
        console.log(res)
        if(res && res.data){
          that.setData({
            list: res.data
          })
        }
      
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