// pages/inventory/inventoryLog.js
var App = getApp();
const { $Message, $Toast } = require('../../dist/base/index.js');
var mta = require('../../utils/mta_analysis.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    logList: [], // 数组格式
    load_params: { // 加载更多参数
      loadmore: false,
      loadend: false,
      empty: false,
      start: 0,
      nums: 10
    },
    tabBarH: 50,
    startT: true
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    mta.Page.init()
    this.getLogList('refresh')
    this.setData({
      tabBarH: App.Util.checkPhoneType()
    })
  },
  getLogList(type) {
    var that = this;
    if (this.data.load_params.loadmore || this.data.load_params.loadend) return false
    if (type == 'refresh') {
      $Toast({
        content: '加载中',
        duration: 0,
        type: 'loading'
      });
    }
    this._getList = new Promise((resolve) => {
      App.Util.request({
        url: App.Api.inventoryLogUrl,
        data: {
          start: this.data.load_params.start,
          nums: this.data.load_params.nums,
        },
        success(res) {
          console.log(res)
          if (res && res.data) {
            // that.setData({
            //   orderList: res.data
            // })
          }
          $Toast.hide()
          resolve(res.data)
        },
        fail(e) {

        }
      })
    })
    App.Util.loadMore(this, {
      type,
      currentPageListName: 'logList',
      dealWithData(list) {

        if (list.length>0) {
          list.forEach((groupItem) => {
            groupItem.operList = that.addTimeData(groupItem.operList, 'time')
          })
        }
        return list
        
      },
      callback(list) {
        $Toast.hide()
      }
    })
  },
  addTimeData(list, timeKey) {
    list.forEach((item, index) => {
      var time = item[timeKey]
      // new Date("2017-06-23 17:00:00")结果为 invalid date 或为 null。 解决ios
      // 错误原因：参数格式不规范，不能兼容所有浏览器；
      time = time.replace(/-/g, ':').replace(' ', ':');
      time = time.split(':');
      var date = new Date(time[0], (time[1] - 1), time[2], time[3], time[4], time[5]); // 日志日期
      // console.log(new Date('2019-01-26 24:00:00'))
      var currentTime = new Date().getTime() // 当前时间
      var onedayTime = 24 * 60 * 60 * 1000 // 一时间
      var c = currentTime - date.getTime() // 时间差
      if (date) {
        item.year = date.getFullYear()
        item.month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
        item.date = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
        item.hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
        item.min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
        item.sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
      }
      var day = ''
      if (c > 0) {
        if (c >= onedayTime) { // 一天以前
          day = item.month + '-' + item.date
        } else { // 今日
          day = '今天'
        }
      }
      item.day = day
    })
    return list
  },
  // 1: 进货 3: 出货  5: 手工增加  7: 手工减少
  jumpOrderDetail (e) {
    var dataset = e.currentTarget.dataset
    var orderId = dataset.orderid,
    userId = dataset.userid,
    parentId = dataset.parentid
    var type = dataset.type
    var userInfo = wx.getStorageSync('globalData').userInfo
    if (type == 1 || type == 3) {
      let orderType = type == 1 ? 'stock' : (type == 3 ? 'wholesale' : '')
      wx.navigateTo({
        url: '/pages/team/orderInformation?orderId=' + orderId + '&userId=' + userId + '&shopId=' + userInfo.shopId + '&orderType=' + orderType + '&opid=' + userInfo.u_id,
      })
    } 
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
    this.getLogList('pull')
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function() {

  // }
})