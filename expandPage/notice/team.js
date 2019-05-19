// expandPage/notice/team.js
var App = getApp();
var mta = require('../../utils/mta_analysis.js')

const {
  $Toast
} = require('../../dist/base/index');
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
    noticeListXIT:[]
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
  // 点击顶部导航
  clickNavItem(e) {
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    console.log(e.detail.currentTarget.dataset.key)
    this.data.startId = 0
    this.setData({
      currentNavId: e.detail.currentTarget.dataset.key,
      currentNavKey: 0,
      subNavId: 0,
      isLoading: true,
      noticeList: [],
      load_params: { // 加载更多参数
        loadmore: false,
        loadend: false,
        empty: false,
        start: 0,
        nums: 10
      },
    }, () => {
    
        this.getNoticeList('refresh');
    
      
      $Toast.hide();
    })

  },
  clickSendItem(e) {
    this.data.startId = 0
    let type = e.detail.currentTarget.dataset.type
    let key = e.detail.currentTarget.dataset.key
    switch (type) {
      case '待审核':
        key = 5
        break;
      case '已付款':
        key = 2
        break;

      case '已发货':
        key = 4
        break;
      case '已完成':
        key = 6
        break;
      case '已关闭':
        key = 7
        break;
      default:

    }

    this.setData({
      currentNavKey: key,
      // isLoading: true,
      noticeList: [],
      load_params: { // 加载更多参数
        loadmore: false,
        loadend: false,
        empty: false,
        start: 0,
        nums: 10
      },
    }, () => {
      this.getSubList('refresh')
    })
  },

  JinhItem(e) {
    let type = e.detail.currentTarget.dataset.type
    let key = e.detail.currentTarget.dataset.key
    this.data.startId = 0
    switch (type) {
      case '待审核':
        key = 5
        break;
      /* case '待发货':
        key=2
        break; */
      case '待收货':
        key = 4
        break;
      case '已完成':
        key = 6
        break;
      case '已关闭':
        key = 7
        break;
      default:

    }
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    this.setData({
      currentNavKey: key,
      // isLoading: true,
      noticeList: [],
      load_params: { // 加载更多参数
        loadmore: false,
        loadend: false,
        empty: false,
        start: 0,
        nums: 10
      },
    }, () => {
      this.getSubList('refresh')
    })
    console.log(this.data.currentNavKey, 2233)
  },
  lingsItem(e) {
    this.data.startId = 0
    let type = e.detail.currentTarget.dataset.type
    let key = e.detail.currentTarget.dataset.key
    switch (type) {
      case '已完成':
        key = 6
        break;
      case '退款中':
        key = 4
        break;
      default:

    }
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    this.setData({
      currentNavKey: key,
      //isLoading: true,
      noticeList: [],
      load_params: { // 加载更多参数
        loadmore: false,
        loadend: false,
        empty: false,
        start: 0,
        nums: 10
      },
    }, () => {
      this.getSubList('refresh')
    })
  },

  getNoticeList(type) {
    var that = this
    if (this.data.load_params.loadmore || this.data.load_params.loadend) return false
    // console.log('currentNavId=',this.data.currentNavId)
    if (this.data.currentNavId == 4){
    this._getList = new Promise((resolve) => {
      App.Util.request({
        url: App.Api.teamOrderListUrl,//teamOrderListUrl
        data: {
          u_id: this.data.userInfo.u_id,
          type: this.data.currentNavId,
          start: this.data.load_params.start,
          nums: this.data.load_params.nums,
        },
        method: 'POST',
        success(res) {
          // console.log('getNoticeList=',res)
          if (res && res.data) {
            that.setData({
              startId: res.data[res.data.length - 1].id
            })
          }
          $Toast.hide();
          resolve(res.data)
        },
        fail(e) {

        }
      })
    })
    App.Util.loadMore(this, {
      type,
      currentPageListName: 'noticeList'
    })
    }else{
      //系统
      App.Util.request({
        url: App.Api.noticeList,//teamOrderListUrl
        data: {
          // u_id: this.data.userInfo.u_id,
          // type: this.data.currentNavId,
          // start: this.data.load_params.start,
          // nums: this.data.load_params.nums,
          page:1
        },
        method: 'POST',
        success(res) {
          console.log(res)
          that.setData({
            noticeListXIT:res.data
          })
          // console.log('getNoticeList=',res)
          // if (res && res.data) {
          //   that.setData({
          //     startId: res.data[res.data.length - 1].id
          //   })
          // }
          $Toast.hide();
        
        },
        fail(e) {

        }
      })
    }
  },



  //二级
  getSubList(type) {
    let t = this
    let url = App.Api.jinhOrder
    if (parseInt(t.data.currentNavId) == 2) {
      url = App.Api.sendOrder
    }
    if (parseInt(t.data.currentNavId) == 3) {
      url = App.Api.lingsOrder
    }

    if (this.data.load_params.loadmore || this.data.load_params.loadend) return false
    this._getList = new Promise((resolve) => {
      App.Util.request({
        url: url,
        data: {
          type: t.data.currentNavKey,
          start: this.data.startId,
          nums: t.data.load_params.nums,
        },

        success(res) {
          if (res && res.data) {
            t.setData({
              startId: res.data[res.data.length - 1].id
            })
          }
          $Toast.hide();
          resolve(res.data)
        },
        fail(e) {

        }
      })
    })
    App.Util.loadMore(this, {
      type,
      currentPageListName: 'noticeList'
    })
  },
  //系统通知列表事件
  noticeListClick(e){

    wx.navigateTo({
      url: 'noticeSystem/index?id='+e.currentTarget.dataset.id,
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
      $Toast.hide();
    })
    setTimeout(() => {
      this.getNoticeList('refresh')
    }, 500)


    //noticeList
    App.Util.request({
      url: App.Api.noticeList,
      method:'POST',
      data: {
        page:10                   
      },
      success(res) {
        console.log(res)
      }
    })
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
    if (parseInt(this.data.currentNavId) <= 0) {
      this.getNoticeList('pull')
    } else {
      this.getSubList('pull')
    }

  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function() {

  // }
})