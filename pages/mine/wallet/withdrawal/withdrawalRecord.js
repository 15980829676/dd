// pages/mine/wallet/withdrawal/withdrawalRecord.js
const { $Toast, $Message } = require('../../../../dist/base/index.js'), App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    load_params: { // 加载更多参数
      loadmore: false,
      loadend: false,
      empty: false,
      start: 0,
      nums: 15
    },
    finLoglist: [], // 提现记录列表
    tabBarH: 50,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.queryList('refresh')
    this.setData({
      tabBarH: App.Util.checkPhoneType()
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
  jumpPage({
    currentTarget: {
      dataset
    }
  }) {
    // let url = ''
    // let data = JSON.stringify(dataset)
    // if (dataset.status == 3) { // 已到账
    //   url = '/pages/withdrawalDetail/withdrawalDetail?params=' + data
    // } else if (dataset.status == 1) { // 审核中
    //   url = './withdrawalState?params=' + data
    // }
    wx.navigateTo({
      url: './withdrawalState?id=' + dataset.id,
    })
  },
  // 提现记录
  queryList(type) {

    var that = this
    if (this.data.load_params.loadmore || this.data.load_params.loadend) return false

    if (type == 'refresh'){
      $Toast({
        duration: 0,
        content: '加载中',
        type: 'loading'
      });
    }
    this._getList = new Promise((resolve) => {
      App.Util.request({
        url: App.Api.financeLoglist,
        data: {
          start: this.data.load_params.start,
          nums: this.data.load_params.nums,
        },
        method: 'POST',
        success(res) {
          resolve(res.data)
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
    })

    App.Util.loadMore(this, {
      type,
      currentPageListName: 'finLoglist'
    })
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
    this.queryList('pull')
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function() {

  // }
})