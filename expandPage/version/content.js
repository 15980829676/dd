// expandPage/version/content.js
const App = getApp()
const {
  $Toast
} = require('../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    this.version()

    // App.Util.request({
    //   url: App.Api.version,
    //   success(res) {
    //   //version 版本号 descript 版本更新描述 数组形式，content 更新内容数组，time时间，position 描述显示位置，0-头部 1-底部
    //     if (res && res.data && res.data != {}) {
    //       let list = res.data
    //       list.map((item)=>{
    //         item.content= JSON.parse(item.content)
    //         item.descript = JSON.parse(item.descript)    
    //       })
    //       that.setData({
    //         list
    //       })
    //       console.log(list)
    //     }
    //   },
    //   complete() {
    //    // $Toast.hide()
    //   }
    // })
  },
  //版本日记接口
  version() {
    let that = this
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.version,
      success(res) {
        //version 版本号 descript 版本更新描述 数组形式，content 更新内容数组，time时间，position 描述显示位置，0-头部 1-底部
        if (res && res.data && res.data != {}) {
          let list = res.data
          list.map((item) => {
            item.content = JSON.parse(item.content)
            item.descript = JSON.parse(item.descript)
          })
          that.setData({
            list
          })
        }
      },
      complete() {
        $Toast.hide()
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