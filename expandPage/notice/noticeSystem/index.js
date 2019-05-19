// expandPage/notice/noticeSystem/index.js
const App=getApp()
const {
  $Toast
} = require('../../../dist/base/index');
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
      let id = options.id || ''
      this.setData({
        id
      })
      this.loamore()
  },
  loamore(){
    let that = this
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.noticeRead,
      method:'POST',
      data: {
        id: that.data.id
      },
      method: 'POST',
      success(res) {
        console.log(res)

        that.setData({
          list:res.data
        })
        WxParse.wxParse('article_content', 'html', res.data.content, that, 5);
        
        // that.setData({
        //   noticeListXIT: res.data
        // })
        // console.log('getNoticeList=',res)
        // if (res && res.data) {
        //   that.setData({
        //     startId: res.data[res.data.length - 1].id
        //   })
        // }
        //$Toast.hide();

      },
      complete(){
        $Toast.hide()
      },
      fail(e) {

      }
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
  onShareAppMessage: function () {

  }
})