// expandPage/notice/stock.js
var App = getApp();
const {
  $Toast,
  $Message
} = require('../../dist/base/index');
var mta = require('../../utils/mta_analysis.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noticeList: [],
    currentNavId: '0', // 当前顶部导航id
    currentNavKey: '0', // 二级导航id
    load_params: { // 加载更多参数
      loadmore: false,
      loadend: false,
      empty: false,
      start: 0,
      nums: 10
    },
    userInfo: {},
    navTitleArr: ['全部通知', '进货订单', '出货订单', '零售订单'],
    navTitlejin: ['全部', '待付款', '待审核', '已发货', '已完成', '已关闭'],
    navTitlechu: ['全部', '待付款', '待审核', '已付款', '已发货', '已完成', '已关闭'],
    navTitleling: ['全部', '待付款', '待发货', '已发货', '已完成', '退款中'],
    isLoading: true,
    startId: 0,
    subNavId: '0', // 二级导航id
    tabBarH: 50,
    payPopUp: {}, // 支付弹框数据
    againOrder: [], // 再来一单商品数据
    duplicateOrder: false, // 显示再来一单弹框
    isStopWuxKeyBoardHide: false,
    visibleModal: false, // 是否显示取消订单弹框
    visibleModal1: false, // 是否显示关闭订单弹框
    visibleModal2: false, // 是否显示取消订单弹框（零售订单）
    visibleModal3: false, // 是否显示同意退款提示弹框（零售订单）
    cancelOrderInfo: {}, // 取消订单信息
    modalData: [ // 取消订单提示弹框信息
      {
        name: '取消',
        color: '#333',
        fontSize: '24rpx'
      },
      {
        name: '确定',
        color: '#4da1ff',
        fontSize: '24rpx'
      }
    ],
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
  onLoad: function(options) {
    mta.Page.init()
    // console.log(options)
    var userInfo = wx.getStorageSync('globalData') && wx.getStorageSync('globalData').userInfo
    this.setData({
      userInfo,
      currentNavId: options.currentNavId ? options.currentNavId : 0, // 首页进入,更改导航
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
    this._getList = new Promise((resolve) => {
      App.Util.request({
        url: App.Api.teamOrderListUrl,
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
        fail(res) {
          $Toast.hide();
          let msg = (res && res.data) ? res.data.msg : '获取一级列表失败！'
          App.Util.showToast(msg)
        }
      })
    })
    App.Util.loadMore(this, {
      type,
      currentPageListName: 'noticeList',
      dealWithData(res) {
        res.forEach((item,index) => {
          if (item.avater) {
            item.avater = App.Util.buildImageUrl(item.avater)
          }
        })
        return res
      }
    })
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
        fail(res) {
          $Toast.hide();
          let msg = (res && res.data) ? res.data.msg : '获取二级列表失败！'
          App.Util.showToast(msg)
        }
      })
    })
    App.Util.loadMore(this, {
      type,
      currentPageListName: 'noticeList',
      dealWithData(res) {
        res.forEach((item, index) => {
          if (item.avater) {
            item.avater = App.Util.buildImageUrl(item.avater)
          }
        })
        return res
      },
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
        // console.log(res)
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
            // console.log(logtype)
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
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // console.log('通知show',this.data.currentNavId)
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.getNoticeCount(() => {
      $Toast.hide();
    })
    let currNavId = parseInt(this.data.currentNavId)
    setTimeout(() => {
      if (currNavId == 0) {
        this.getNoticeList('refresh')
      }else {
        this.getSubList('refresh')
      }
      
    }, 500)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {


    this.setData({
      // currentNavId: 0,
      noticeList: [],
      startId: 0,
      //isLoading: true,
      load_params: { // 加载更多参数
        loadmore: false,
        loadend: false,
        empty: false,
        start: 0,
        nums: 10
      },
      "payPopUp.visiable": false
    })

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
    if (parseInt(this.data.currentNavId) <= 0) {
      this.getNoticeList('pull')
    } else {
      this.getSubList('pull')
    }

  },
  //收货日志
  goodsTap(e) {
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    let {
      type,
      id
    } = e.currentTarget.dataset
    App.Util.request({
      url: App.Api.shouhuo,
      data: {
        id: id,
        type: type
      },
      method: 'POST',
      success(res) {
        if (res && res.data) {
          wx.navigateTo({
            url: "/pages/Receiving/Receiving?orderMsg=" + JSON.stringify(res.data)
          })
        } else {
          App.Util.showToast('暂无相关数据！')
        }
      },
      fail(res) {
        // console.log(res)
        App.Util.showToast(res.data.msg || res.errMsg || '查看日志失败！')
      },
      complete() {
        $Toast.hide()
      }
    })

  },
  // 去结算按钮
  goToPay({
    currentTarget: {
      dataset
    }
  }) {
    let {
      money,
      item
    } = dataset;
    this.setData({
      payPopUp: {
        visiable: true,
        total: money,
        orderInfo: item, // 单个订单信息
      }
    }, () => {
      let btnPayEle = this.selectComponent('#btnPay')
      btnPayEle.openPopUp()
      this.setData({
        'payPopUp.btnPayEle': btnPayEle
      })
    })
  },
  _openPopUp(e) { // 结算
    let payPopUp = this.data.payPopUp
    // 结算
    if (e.detail.type == 'pay') {
      payPopUp.btnPayEle.pay({
        that: this,
        orderInfo: payPopUp.orderInfo
      })
    }
  },
  // 关闭结算按钮
  _closePopUp() {
    // let payPopUp = this.data.payPopUp
    // payPopUp.btnPayEle.closePopUp()
    this.setData({
      "payPopUp.visiable": false
    })
  },
  // 取消或关闭订单
  cancelOrder(e) {
    let {
      item, ordertype
    } = e.currentTarget.dataset
    if (ordertype == 'cancel') {
      this.setData({
        cancelOrderInfo: item,
        visibleModal: true
      })
    } else if (ordertype == 'close'){
      this.setData({
        cancelOrderInfo: item,
        visibleModal1: true
      })
    }
  },
  // 是否取消订单
  handleClose({
    detail: {
      index
    }
  }) {
    this.setData({
      visibleModal: false
    })
    let that = this
    if (index == 1) {
      $Toast({
        content: '正在取消',
        duration: 0,
        type: 'loading'
      });
      App.Util.request({
        url: App.Api.sellerCancelOrder,
        data: {
          id: this.data.cancelOrderInfo.id
        },
        method: 'POST',
        success(res) {
          $Toast.hide()
          // console.log(res)
          App.Util.showToast('订单取消成功！', () => {

            // wx.switchTab({
            //   url: '/pages/notice/notice',
            // })
            $Toast({
              content: '加载中',
              duration: 0,
              type: 'loading'
            });
            that.setData({
              currentNavId: 0,
              currentNavKey: 0,
              startId: 0,
              subNavId: '0',
              noticeList: [],
              load_params: { // 加载更多参数
                loadmore: false,
                loadend: false,
                empty: false,
                start: 0,
                nums: 10
              },
            }, () => {
              that.getNoticeList('refresh')
            })
          })

        },
        fail(res) {
          $Toast.hide()
          console.log(res)
          App.Util.showToast(res.data.msg || res.errMsg || '订单取消失败！')
        }
      })
    }


  },
  // 是否关闭订单
  handleClose1({
    detail: {
      index
    }
  }) {
    
    this.setData({
      visibleModal1: false
    })
    let that = this
    if (index == 1) {
      $Toast({
        content: '正在关闭',
        duration: 0,
        type: 'loading'
      });
      App.Util.request({
        url: App.Api.sellerCloseOrder,
        data: {
          id: that.data.cancelOrderInfo.id
        },
        method: 'POST',
        success(res) {
          $Toast.hide()
          // console.log(res)
          App.Util.showToast('订单关闭成功！', () => {

            // wx.switchTab({
            //   url: '/pages/notice/notice',
            // })
            $Toast({
              content: '加载中',
              duration: 0,
              type: 'loading'
            });
            that.setData({
              currentNavId: 0,
              currentNavKey: 0,
              startId: 0,
              subNavId: '0',
              noticeList: [],
              load_params: { // 加载更多参数
                loadmore: false,
                loadend: false,
                empty: false,
                start: 0,
                nums: 10
              },
            }, () => {
              that.getNoticeList('refresh')
            })
          })

        },
        fail(res) {
          $Toast.hide()
          console.log(res)
          App.Util.showToast(res.data.msg || res.errMsg || '订单关闭失败！')
        }
      })
    }


  },
  // 复制订单时，如果有订单未付款，取消订单后的结果
  _cancelOrderEvent(e) {
    console.log(e)
    let {
      type
    } = e.detail,
      that = this
    if (type == 'success') {
      $Toast({
        content: '加载中',
        duration: 0,
        type: 'loading'
      });
      that.setData({
        currentNavId: 0,
        currentNavKey: 0,
        startId: 0,
        subNavId: '0',
        noticeList: [],
        load_params: { // 加载更多参数
          loadmore: false,
          loadend: false,
          empty: false,
          start: 0,
          nums: 10
        },
      }, () => {
        that.getNoticeList('refresh')
      })
    }
  },
  // 再来一单
  clickAgainOrder({currentTarget:{dataset}}){
    let id = dataset.id
    App.globalData.goodid = id
    wx.switchTab({
      url: '/pages/inventory/orderGoods',
      success() {
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function() {

  // },
  // 零售订单按钮
  lingsOrder({currentTarget:{dataset}}) {
    let { type, item } = dataset
    if (type == 'refund') {// 退款
      wx.navigateTo({
        url: '../order/refund?id=' + item.id + '&type=' + type,
      })
    } else if (type == 'agreeRefund') { // 上级同意退款
      this.setData({
        cancelOrderInfo: item,
        visibleModal3: true
      })
    } else if (type == 'cancel') { // 取消订单
      this.setData({
        cancelOrderInfo: item,
        visibleModal2: true
      })
    } else if (type == 'delivery') { // 上级发货
      wx.navigateTo({
        url: '../order/delivery?id=' + item.id,
      })
    }
  },
  // 零售订单取消
  handleClose2({
    detail: {
      index
    }
  }) {
    this.setData({
      visibleModal2: false
    })
    if(index == 1) {
      this.userCancelOrder()
    }
  },
  // 同意退款
  handleClose3({
    detail: {
      index
    }
  }) {
    this.setData({
      visibleModal3: false
    })
    if (index == 1) {
      this.userAgreeRefund()
    }
  },
  // 上级同意退款
  userAgreeRefund() {
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    let that = this
    App.Util.request({
      url: App.Api.lingsOrderAgreerefund,
      method: "POST",
      data: {
        id: this.data.cancelOrderInfo.id,// 订单ID
      },
      success(res) {
        $Toast.hide()
        $Message({
          content: '退款成功！',
          callback() {
            that.setData({
              currentNavId: 3,
              currentNavKey: 0,
              startId: 0,
              subNavId: '0',
              noticeList: [],
              load_params: { // 加载更多参数
                loadmore: false,
                loadend: false,
                empty: false,
                start: 0,
                nums: 10
              },
            }, () => {
              $Toast({
                content: '加载中',
                duration: 0,
                type: 'loading'
              });
              that.getNoticeList('refresh')
            })
          }
        });
      },
      fail(res) {
        $Toast.hide()
        let msg = (res && res.data) ? res.data.msg : '退款失败！'
        $Message({
          content: msg,
          callback() { }
        });
      }
    })
  },
  // 取消订单
  userCancelOrder() {
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    let that = this
    App.Util.request({
      url: App.Api.lingsOrderCancel,
      method: "POST",
      data: {
        id: this.data.cancelOrderInfo.id
      },
      success(res) {
        $Toast.hide()
        $Message({
          content: '订单取消成功！',
          callback() {
            that.setData({
              currentNavId: 3,
              currentNavKey: 0,
              startId: 0,
              subNavId: '0',
              noticeList: [],
              load_params: { // 加载更多参数
                loadmore: false,
                loadend: false,
                empty: false,
                start: 0,
                nums: 10
              },
            }, () => {
              $Toast({
                content: '加载中',
                duration: 0,
                type: 'loading'
              });
              that.getNoticeList('refresh')
            })
          }
        });
      },
      fail(res) {
        $Toast.hide()
        let msg = (res && res.data) ? res.data.msg : '订单取消失败！'
        $Message({
          content: msg,
          callback() {

          }
        });
      }
    })
  },
  
  
})