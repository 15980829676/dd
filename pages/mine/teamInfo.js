// pages/mine/teamInfo.js
var App = getApp();
const { $Toast } = require('../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logo:'',
    userInfo: {},
    parentInfo: {}
  },
  handleChange({ detail }) {
    this.setData({
      currentNavId: detail.key
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let logo = '/xcx/jhlogo.png'
    logo = App.Util.buildImageUrl(logo)
    let userInfo = wx.getStorageSync('globalData').userInfo
    this.setData({
      logo,
      userInfo,
      options
    })
    this._getParentInfo()
  },
  _getParentInfo() {
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    var that = this
    this._wallet = new Promise((resolve) => {
      App.Util.request({
        url: App.Api.teamSelfInfoUrl,
        data: {
          u_id: this.data.options.parentId,
        },
        success(res) {
          console.log(res)
          if(res && res.data && res.data != {}) {
            res.data.shop_avatar = App.Util.buildImageUrl(res.data.shop_avatar)
            that.setData({
              parentInfo: res.data
            })
          }
        },
        fail(res) {
          App.Util.showToast(res.data.msg||'')
        },
        complete() {
          $Toast.hide()
        }
      })
    })
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
  // onShareAppMessage: function() {

  // }
})