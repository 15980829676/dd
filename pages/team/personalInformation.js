// pages/personal information/personal information.js
var App = getApp();
var CountUp = require("../../dist/w-count-up/index.js"),
{ $Toast } = require('../../dist/base/index');;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: {},
    userInfo: {},
    orderList: [],
    money: 0,
    isLoadCompelte: false, // 当前页面是否加载完成
    load_params: { // 加载更多参数
      loadmore: false,
      loadend: false,
      empty: false,
      start: 0,
      nums: 5
    },
    progress: {
      percent: 20,
    },
	tabBarh:50
    // percent: 0,
    // status: 'normal',
    // current: 'tab1',
    // current: 'homepage'
  },
  // handleChange({
  //   detail
  // }) {
  //   this.setData({
  //     current: detail.key
  //   });
  // },
  // handleAdd() {
  //   if (this.data.percent === 100) return;
  //   this.setData({
  //     percent: this.data.percent + 10
  //   });
  //   if (this.data.percent === 100) {
  //     this.setData({
  //       status: 'success'
  //     });
  //   }
  // },
  // handleReduce() {
  //   if (this.data.percent === 0) return;
  //   this.setData({
  //     percent: this.data.percent - 10,
  //     status: 'normal'
  //   });
  // },
  upper(e) {
    console.log("upper",e)
  },
  lower(e) {
    console.log("lower",e)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options,
      windowHeight: wx.getSystemInfoSync().windowHeight * 2,
	   tabBarh: App.Util.checkPhoneType(),
    })
    this._init()
  },
  _init() {
    this.setData({
      progress: {
        percent: 20,
      },
      isLoadCompelte: false,
      load_params: { // 加载更多参数
        loadmore: false,
        loadend: false,
        empty: false,
        start: 0,
        nums: 10
      }
    })
    // new Promise((resolve) => {
      $Toast({
        content: '加载中',
        duration: 0,
        type: 'loading'
      });
      this.getInfo()
      this.getOrderList('refresh')
    //   resolve()
    // }).then(() => {
      // setTimeout(() => {
      //   this.setData({
      //     "progress.percent": 100,
      //     isLoadCompelte: true,
      //   })
      //   $Toast.hide()
      // }, 500)
    // })
    Promise.all([this._getUserInfo, this._getList]).then(() => {
      setTimeout(() => {
        this.setData({
          "progress.percent": 100,
          isLoadCompelte: true,
        })
        $Toast.hide()
      }, 500)
    })
  },
  // 进度条加载完成时
  progressActiveEnd() {
    this.setData({
      isLoadCompelte: true
    })
  },
  getInfo() {
    var that = this
    this._getUserInfo = new Promise((resolve, reject) => {
      App.Util.request({
        url: App.Api.teamSelfInfoUrl,
        data: {
          u_id: this.data.options.userId
        },
        success(res) {
          if (res.data) {
            res.data.shop_avatar = App.Util.buildImageUrl(res.data.shop_avatar)
            // 处理本月任务
            if (res.data.rule && res.data.rule.length > 0) {
              let total = parseFloat(res.data.total) / 10000,
                rule = res.data.rule,
                currData = {
                  ratio: 0, // 本月任务完成比例
                  cashBackRatio: 0, // 返利比例
                }
              for (var i in rule) {
                i = parseInt(i)
                if (parseFloat(rule[i].money) == total) {
                  currData.ratio = i * 100
                  currData.cashBackRatio = parseFloat(rule[i].percent)
                  break
                } else if (parseFloat(rule[i].money) > total) { // 如果在一个区间内，要加上之前的比例（key）
                  currData.ratio = ((i - 1) * 100 + parseFloat(total / rule[i].money) * 100).toFixed(2)
                  currData.cashBackRatio = parseFloat(rule[i - 1].percent)
                  break
                }
              }
              res.data.currData = currData
            }
            that.setData({
              userInfo: res.data,
            })
            // countUp开始值, 结束值, 小数点位数, 过渡时间, 回调
            // let startVal = 0, endVal = res.data.sumbal, decimals = 2, duration = 1, count = res.data.sumbal
            // new CountUp(startVal, endVal, decimals, duration, function (count) {
            //   that.setData({
            //     money: count
            //   })
            // }).start()
            App.Util.countUp({
              count: res.data.sumbal,
              callback(count) {
                that.setData({
                  money: count
                })
              }
            })
          } else {
            App.Util.showToast(res.msg || '获取个人信息失败')
          }
          resolve()
        },
        fail(res) {
          console.log(res)
          App.Util.showToast(res.data.msg || '获取个人信息失败')
        }
      })
    })
  },
  getOrderList(type) {
    var that = this
    if (this.data.load_params.loadmore || this.data.load_params.loadend) return false
    this._getList = new Promise((resolve, reject) => {
      App.Util.request({
        url: App.Api.teamOrderListUrl1,
        data: {
          u_id: this.data.options.userId,
          start: this.data.load_params.start,
          nums: this.data.load_params.nums,
          type: 0
        },
        method: 'POST',
        success(res) {
          console.log(res)
          if (res && res.data) {
            // that.setData({
            //   orderList: res.data
            // })
          }
          resolve(res.data)
        },
        fail(res) {
          App.Util.showToast(res.data.msg || '获取订单列表失败')
        }
      })
    })
    App.Util.loadMore(this,{
      type,
      currentPageListName: 'orderList'
    })
  },
  jumpOrderDetail({ currentTarget: { dataset}} ) {
    var listItem = this.data.orderList[dataset.index]
	let [shopid,op_id,userId] = [listItem.shop_id,listItem.op_id,this.data.options.userId]
    let userInfo = wx.getStorageSync('globalData').userInfo
    // 改变订单详情 订单状态名称
    // (零售订单retail)经销商可以在自己店铺购买或者在上级店铺购买
    // 进货订单stock
    // 出货订单wholesale
    var orderType = listItem.order_flag && listItem.order_flag == 1 ? 'retail' : shopid > 0 && (op_id != userId) ? 'wholesale' : shopid == 0 || (op_id == userId) ? 'stock' : ''
    wx.navigateTo({
      url: './orderInformation?orderId=' + dataset.orderid + '&userId=' + dataset.userid + '&shopId=' + this.data.userInfo.shop_id + '&orderType=' + orderType + '&opid=' + userInfo.u_id,
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
    this._init()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // this.getOrderList('pull')
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})