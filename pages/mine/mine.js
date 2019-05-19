// pages/mine/mine.js
var App = getApp();
const { $Toast } = require('../../dist/base/index.js');
var mta = require('../../utils/mta_analysis.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataStatistics:true, //数据报表 默认false
    globalData : {},
    userInfo: {}, // 个人信息
    parentInfo: {}, // 上级信息
    isLoadCompelte: false, // 页面数据是否全部加载完成
    total_sum: 0, // 钱包
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    mta.Page.init()
    var globalData = wx.getStorageSync('globalData')
    this.setData({
      globalData,
      isLoadCompelte: false
    })
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    
    this._getTeamParent()
    Promise.all([this._userInfo, this._getWallet, this._teamParent]).then(() => {
      this.setData({
        isLoadCompelte: true
      })
      $Toast.hide()
    })

  },

  marketing(){
    App.Util.showToast('功能暂未开放！')
  },
 

  team() {
    wx.navigateTo({
      url: './teamInfo?parentId=' + (this.data.parentInfo.parent_id || this.data.userInfo.u_id),
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
    let that= this
    this._getWallet()
    this._getUserInfo()
    App.Util.getNoticeCount()
    // 以后每次进入时都会执行动画
    // var that = this
    // var total_sum = this.data.total_sum 
    // if (total_sum && this.data.isLoadCompelte) {
    //   total_sum += ''
    //   var reg = new RegExp(",", "g");
    //   total_sum = total_sum.replace(reg, "");
    //   App.Util.countUp({
    //     count: total_sum,
    //     callback(count) {
    //       that.setData({
    //         total_sum: count
    //       })
    //     }
    //   })
    // }

  },
  _getUserInfo() {
    var that = this
    this._userInfo = new Promise((resolve)=>{
      App.Util.request({
        url: App.Api.teamSelfInfoUrl,
        data: {
          u_id: this.data.globalData && this.data.globalData.userInfo?this.data.globalData.userInfo.u_id : '',
        },
        success(res) {
          if (res.data) {
           // 老板们才可以看的到的风景 返回的report为1时，显示报表按钮
          let dataStatistics=res.data.report == 1 ? true : false; // 数据报表
            res.data.shop_avatar = App.Util.buildImageUrl(res.data.shop_avatar)
            App.globalData.version=res.data.version
            that.setData({
              userInfo: res.data,
              dataStatistics
            })
          } else {
            App.Util.showToast(res.msg || '获取个人信息失败')
          }
          resolve()
        },
        fail(res) {
          App.Util.showToast(res.data.msg || '获取个人信息失败')
        }
      })
    })
  },
  // 获取钱包
  _getWallet() {
    var that = this
    this._wallet = new Promise((resolve) => {
      App.Util.request({
        url: App.Api.wallet,
        data: {},
        success(res) {
          var total_sum = 0
          if (res && res.data && res.data.total_sum) {
            total_sum = res.data.total_sum
          }
          App.Util.countUp({
            count:total_sum,
            callback(count) {
              that.setData({
                total_sum: count
              })
            }
          })
          resolve()
        }
      })
    })
  },
  _getTeamParent() {
    var that = this
    this._teamParent = new Promise((resolve) => {
      App.Util.request({
        url: App.Api.teamParent,
        data: {},
        success(res) {
         // console.log(res)
          if (res && res.data && res.data != {}) {
            that.setData({
              parentInfo: res.data
            })
          }
          resolve()
        }
      })
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