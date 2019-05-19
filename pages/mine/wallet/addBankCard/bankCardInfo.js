// pages/mine/wallet/addBankCard/bankCardInfo.js
var App = getApp();
const $Message = require('../../../../dist/base/index.js').$Message;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgSource: '',// 图片资源
    bankcardinfo: {},
    isShowUnboundHint: false,// 是否显示解绑提示弹框
    isShowUnboundSuccess: false,// 是否显示解绑成功提示弹框
    spinShow: false,// loading
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      imgSource: App.Api.imgSource
    })
    if (options.bankcardinfo) {
      var bankcardinfo = JSON.parse(options.bankcardinfo)
      console.log(bankcardinfo)
      this.setData({
        bankcardinfo
      })
    }
  },
  // 解绑
  btnUnbound(e) {
    var dataset = e.currentTarget.dataset
    var that = this
    if (dataset.type == 'click') {
      this.setData({
        isShowUnboundHint: true
      })
    } else if (dataset.type == 'cancel') {
      this.setData({
        isShowUnboundHint: false
      })
    }else if (dataset.type == 'confirm') {
      this.setData({
        isShowUnboundHint: false,
        spinShow: true
      })
      App.Util.request({
        url: App.Api.bankCardDelete,
        method: 'POST',
        data: {
          id: this.data.bankcardinfo.id,
        },
        success(res) {
          that.setData({
            isShowUnboundSuccess: true,
          })
          setTimeout(() => {
            that.setData({
              isShowUnboundSuccess: false
            },() => {
              wx.navigateBack({
                delta: 1
              })
            })
          }, 1000)
        },
        fail(res) {
          console.log(res)
          $Message({
            content: res.data.msg || '解除绑定失败！',
            type: 'error'
          });
        },
        complete() {
          that.setData({
            isShowUnboundHint: false,
            spinShow: false
          })
        }
      })
    }

  },
  showMask() {
    this.setData({

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