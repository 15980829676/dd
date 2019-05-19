// pages/noticeLog/noticeLogList/index.js
const App = getApp()
var WxParse = require('../../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    list:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     let id = options.noticeId || ''
     this.setData({
       id
     })
   
    
  },
  htmlDecode(input) {
    var e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
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
   
    let that = this
    App.Util.request({
      url: App.Api.noticeLogList,
      data: {
        id:that.data.id
      },
      success(res) {
        console.log(res)
        //  console.log('rizhi',res)
        //   let content =res.data[0].content.replace(/src=\/images/g, 'src=http://img.xingou.net.cn/')
        //   console.log(content)
        that.setData({
          list: res.data
        })

        WxParse.wxParse('article_content', 'html', res.data.content, that, 5);
      }, fail() {
        App.Api.showToast(res.data.msg || "系统日志加载失败")
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