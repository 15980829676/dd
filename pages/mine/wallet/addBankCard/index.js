// pages/mine/wallet/addBankCard/index.js
var App = getApp();
const { $Toast, $Message } = require('../../../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardInfo:{},
    imgSource: '',
    bankCardList: [] // 已添加的银行卡
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(App.Api.imgSource)
    this.setData({
      imgSource: App.Api.imgSource
    })
  },
  // 查询银行卡
  queryUserCard: function () {
    let that = this;
    App.Util.request({
      url: App.Api.bankCardQuery,
      success(res) {
        // if (res.data)
        that.setData({
          bankCardList: res.data || [],
        })
      },
      fail(res) {
        App.Util.showToast( res.msg || '获取银行卡列表失败！')
        console.log(res)
      },
      complete() {
        $Toast.hide()
      },
    })
  },

  jumpPage(e) {
    var dataset = e.currentTarget.dataset
    var url = ''
    if (dataset.type == 'info') {
      url = './bankCardInfo?bankcardinfo=' + JSON.stringify(dataset.bankcardinfo)
    } else if (dataset.type == 'add') {
      url = './fillInfo'
    } else if (dataset.type == 'apply') {
      // url = ''
    }
    wx.navigateTo({
      url
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
    $Toast({
      duration: 0,
      content: '加载中',
      type: 'loading'
    });
    this.queryUserCard();
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