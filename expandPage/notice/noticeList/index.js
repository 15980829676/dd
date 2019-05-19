// expandPage/notice/team.js
var App = getApp();
var mta = require('../../../utils/mta_analysis.js')

const {
  $Toast
} = require('../../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noticeList: [],
    currentNavId: 4, // 当前顶部导航id
    currentNavKey: '0', // 二级导航id
    load_params: { // 加载更多参数
      loadmore: false,
      loadend: false,
      empty: false,
      start: 0,
      nums: 10
    },
    userInfo: {},
    navTitleArr: [{ title: '团队通知', key: 4 }, { title: '系统通知', key: 5 }],
    navTitlejin: ['全部', '待付款', '待审核', '已发货', '已完成', '已关闭'],
    navTitlechu: ['全部', '待付款', '待审核', '已付款', '已发货', '已完成', '已关闭'],
    navTitleling: ['全部', '待付款', '待发货', '已发货', '已完成', '退款中'],
    isLoading: true,
    startId: 0,
    subNavId: '0', // 二级导航id
    tabBarH: 50,
    noticeListXIT: []
  },
  // 切换导航
  handleChange({
    detail
  }) {
    this.setData({
      currentNavId: detail.key
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    mta.Page.init()
    var userInfo = wx.getStorageSync('globalData') && wx.getStorageSync('globalData').userInfo
    this.setData({
      userInfo,
      tabBarH: App.Util.checkPhoneType()
    })
  },


  getNoticeList(type) {
    var that = this
    if (this.data.load_params.loadmore || this.data.load_params.loadend) return false
    // console.log('currentNavId=',this.data.currentNavId)
    App.Util.request({
      url: App.Api.noticeList,//teamOrderListUrl
      data: {
        page: 1
      },
      method: 'POST',
      success(res) {
        console.log(res)
        that.setData({
          noticeListXIT: res.data
        })
        // console.log('getNoticeList=',res)
        // if (res && res.data) {
        //   that.setData({
        //     startId: res.data[res.data.length - 1].id
        //   })
        // }
       

      },
      complete(){
        $Toast.hide();
      },
      fail(e) {

      }
    })
  },



  //系统通知列表事件
  noticeListClick(e) {

    wx.navigateTo({
      url: 'noticeSystem/index?id=' + e.currentTarget.dataset.id,
    })

  },



  jumpOrderDetail({
    currentTarget: {
      dataset
    }
  }) {

    // 查看自己的订单传0，下级用户的订单传1
    var noticeList = this.data.noticeList
    var userInfo = this.data.userInfo
    var logtype = dataset.otype
    var that = this
    var type = userInfo.u_id == dataset.userid ? 0 : 1
    $Toast({
      content: '正在处理中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.noticeReadDot,
      data: {
        id: dataset.orderid,
        type,
        logtype: logtype //日志类型 1-订单日志类型 2-出货订单日志类型
      },
      success(res) {
        console.log(res)
        $Toast.hide()
        if (res.code == 200) {
          // 本地更新已读小圆点
          // noticeItem.op_id == userInfo.u_id (如果是自己查看消息)，dot_flag == '0'(自己查看过)
          // noticeItem.op_id != userInfo.u_id (如果是上级查看消息)p_dot_flag == '0'(上级查看过)
          var noticeItem = noticeList[dataset.index]
          noticeItem.op_id == userInfo.u_id ? noticeItem.dot_flag = 0 : noticeItem.p_dot_flag = 0
          noticeList[dataset.index] = noticeItem
          that.setData({
            noticeList
          })
          // 改变订单详情 订单状态名称
          // noticeItem.order_flag == 1 (零售订单retail)经销商可以在自己店铺购买或者在上级店铺购买
          // noticeItem.op_id == userInfo.u_id（进货订单stock）
          // noticeItem.op_id != userInfo.u_id（出货订单wholesale）

          let [shopid, op_id, userId] = [noticeItem.shop_id, noticeItem.op_id, userInfo.u_id]
          var orderType = noticeItem.order_flag && noticeItem.order_flag == 1 ? 'retail' : (shopid > 0 && (op_id != userId)) ? 'wholesale' : (shopid == 0 || (op_id == userId)) ? 'stock' : ''

          App.Util.getNoticeCount()
          setTimeout(() => {
            console.log(logtype)
            // userId 该订单发起人的userId
            // opid 本地storage的userId

            let redirect = logtype == 2 ? "/pages/logistics/logistics?id=" + dataset.orderid + "&type=" + (dataset.userid == userInfo.u_id ? 2 : 1) : "/pages/team/orderInformation?userId=" + dataset.userid + "&shopId=" + dataset.shopid + "&orderId=" + dataset.orderid + '&orderType=' + orderType + '&opid=' + userId
            wx.navigateTo({
              url: redirect,
            })
          }, 500)
        }
      },
      fail() {

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
    console.log('通知show')
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.getNoticeCount(() => {
     
    })
    setTimeout(() => {
      this.getNoticeList('refresh')
    }, 500)

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      currentNavId: 0,
      noticeList: [],
      //isLoading: true,
      load_params: { // 加载更多参数
        loadmore: false,
        loadend: false,
        empty: false,
        start: 0,
        nums: 10
      }
    })
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
   
      this.getNoticeList('pull')
   

  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function() {

  // }
})