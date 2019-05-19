// pages/mine/wallet/balanceDetail.js
const { $Toast, $Message } = require('../../../dist/base/index.js'), 
App = getApp(), 
{ formatTime } = require('../../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentNavId: '0', // 当前顶部导航id
    load_params: { // 加载更多参数
      loadmore: false,
      loadend: false,
      empty: false,
      start: 0, // page
      nums: 1
    },
    navTitleArr: ['全部', '余额', '提现', '返利'],
    walDetList: [], // 钱包明细列表
    tabBarH: 50
  },
  // 切换导航
  clickNavItem({ detail }) {
    // console.log(detail)
    this.setData({
      currentNavId: detail.currentTarget.dataset.key,
      load_params: { // 加载更多参数
        loadmore: false,
        loadend: false,
        empty: false,
        start: 0, // page
        nums: 1
      },
      walDetList: [] // 钱包明细列表
    });
    this.queryList('refresh')
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.navId) {
      this.setData({
        currentNavId: options.navId
      })
    }
    this.setData({
      tabBarH: App.Util.checkPhoneType()
    })
    this.queryList('refresh')
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
    // console.log(this.data.walDetList.money)
  },
  // 提现记录
  queryList(type) {

    var that = this
    if (this.data.load_params.loadmore || this.data.load_params.loadend) return false

    if (type == 'refresh') {
      $Toast({
        duration: 0,
        content: '加载中',
        type: 'loading'
      });
    }
    this._getList = new Promise((resolve) => {
      App.Util.request({
        url: App.Api.walletDetail,
        data: {
          type: this.data.currentNavId,
          start: this.data.load_params.start,
        },
        method: 'POST',
        success(res) {
          resolve(res.data)
        },
        fail(res) {
          let msg = res && res.data && res.data.msg ? res.data.msg : '获取失败！'
          App.Util.showToast(msg)
        },
        complete() {
          $Toast.hide()
        }
      })
    })

    App.Util.loadMore(this, {
      type,
      currentPageListName: 'walDetList',
      dealWithData(res) {
        res.forEach((item,index) => {
          if (item.money.indexOf('+') != -1) {
            item.moneyState = 1
          } else { // -
            item.moneyState = 0
          }
        })
        // let apply_time = parseInt(res.data.addtime) * 1000
        // let apply_date = new Date(apply_time)
        // res.data.apply_time = formatTime(apply_date, {
        //   sym: '-',
        //   precise: 'min'
        // })
        return res
      }
    })
  },
  // 跳转到订单详情
  jumpPage({currentTarget:{dataset:{item}}}) {
    
    if (item.otype == 0 || !item.ord_id) {
      return false
    }
    // otype为0不跳转 otype 为1时跳转到进货订单详情stock 为2时 零售订单retail
    if (item.otype == 2 || item.otype == 1) {
      let orderType = item.otype == 1 ? 'stock' : item.otype == 2 ? 'retail' : ''
      let userInfo = wx.getStorageSync('globalData').userInfo
      wx.navigateTo({
        url: '/pages/team/orderInformation?userId=' + item.u_id + '&opid=' + userInfo.u_id + '&shopId=' + item.shop_id + '&orderType=' + orderType + '&orderId=' + item.ord_id,
      })
    }
	if(item.otype==3){
		let id=item.ord_id
	    wx.navigateTo({
        url: '/pages/mine/wallet/withdrawal/withdrawalState?id='+item.ord_id
        })
	}
    
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
    this.queryList('pull')
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})