// pages/noticeLog/index.js
var App = getApp();
const { $Toast } = require('../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    load_params: { // 加载更多参数
      loadmore: false,
      loadend: false,
      empty: false,
      start: 1,
      nums: 1
    },
    tabBarH:50
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      tabBarH: App.Util.checkPhoneType()
    })
    this.getRiZhiList('refresh')
  },
  getRiZhiList(type) {
    var that = this;
    if (this.data.load_params.loadmore || this.data.load_params.loadend) return false
    this._getList = new Promise((resolve)=>{
      App.Util.request({
        url: App.Api.more,
        method:'POST',
        data:{
          page: that.data.load_params.start // 按page加载 从1开始，每页15条信息

        },
        success(res) {
          // console.log('rizhi',res)
          resolve(res.data)
        
        }, fail() {
          App.Api.showToast(res.data.msg || "系统日志加载失败")
        }
      })
    })
    App.Util.loadMore(this, {
      type,
      currentPageListName: 'list',
      dealWithData(res) { // 处理刚刚加载出来的数据
        // var list = []
        // for (var i = 0; i < 13;i++) {
        //   list.push(res[i])
        // }
        // console.log(list)
        // res = App.Util.switchImg(res, 'content')
        return res
      },
      callback(list) {
        
      }
    })
  },
  listTap(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var list = that.data.list;
    list[index].select == undefined ? list[index].select = false : '';
    list[index].select = !list[index].select
    that.setData({
      list
    })

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  noticeLogListClick({currentTarget:{dataset}}){
    if (dataset.type == "1") {
      wx.navigateTo({
        url: '../../expandPage/version/content',
      })
    } else {
      wx.switchTab({
        url: '/pages/notice/notice',
      })
    } 

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
    this.getRiZhiList('pull')
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})