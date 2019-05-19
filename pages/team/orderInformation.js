// pages/order information/order information.js
var App = getApp();
const {
  $Toast, $Message
} = require('../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    anitmationBottom:false,
    pintext: [{ name: '非常不满意，各方面都很差' }, { name: '不满意，比较差' }, { name: '一般，还需改善' }, { name: '比较满意，仍可改善' }, { name: '非常满意，无可挑剔' }],
    star: {
      index: 0,
      text: '',
      textarea:''
    },//评价
    title: '进货订单', // 订单类型标题
    selfId: '',
    options: {},
    gifts: {},
    orderInfo: {}, // 订单信息
    userInfo: {}, // 用户信息
    seltype: 0, // 是否直属
    isLoadCompelte: false, // 当前页面是否加载完成
    progress: {
      percent: 20,
    },
    isOrderClose: false, // 该订单是否关闭
    visibleModal: false, // 是否显示取消订单弹框 
    visibleModal1: false, // 是否显示关闭订单弹框 
    expressVisiable: false, // 是否显示物流信息
    modalData: [ // 提示弹框信息
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
    visibleModalStart:false,
    modalData3:[
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
    visibleModalRefund: false,//显示零售同意退款弹窗
    modalDataRefund: [
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
    tabBarh: 50,
    kefuHeight: 0,
    contacts_start: false,
    kefuList: {},
    showTextarea: false, // 是否显示备注弹框
    textValue: '',
    textNum: -1,
    duplicateOrder: false, // 是否显示复制订单列表
    // isStopWuxKeyBoardHide: false,
    // unpay: {}, // 未支付订单信息
    // visibleModal2: false, // 未支付订单提示框
    // modalData2: [ // 未支付订单提示框 
    //   {
    //     name: '去付款',
    //     color: '#4DA1FF',
    //   },
    //   {
    //     name: '取消订单',
    //     color: '#666'
    //   },
    //   {
    //     name: '取消',
    //     color: '#999'
    //   }
    // ]


    complimentary:[], //赠品
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    this.setData({
      options,
      tabBarh: App.Util.checkPhoneType()
    })

    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });

    if (options.orderType) {
      var title = '进货订单'
      if (options.orderType == 'retail') {
        title = '零售订单'
      } else if (options.orderType == 'stock') {
        title = '进货订单'
      } else if (options.orderType == 'wholesale') {
        title = '出货订单'
      }
      this.setData({
        title
      })
      wx.setNavigationBarTitle({
        title,
      })
    } else {
      wx.setNavigationBarTitle({
        title: '进货订单',
      })
    }
    this.setData({

      selfId: wx.getStorageSync('globalData')?wx.getStorageSync('globalData').userInfo.u_id:'',
      seltype: wx.getStorageSync('globalData')?wx.getStorageSync('globalData').userInfo.seltype:''
    })
    //this.getUserInfo()


  },
  // 进度条加载完成时
  progressActiveEnd() {
    this.setData({
      isLoadCompelte: true
    })
  },

  //收货日志
  goodsTap(e) {
    let type = e.currentTarget.dataset.type
    let orderId = this.data.options.orderId
    App.Util.request({
      url: App.Api.shouhuo,
      data: {
        id: orderId,
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
        console.log(res)
        App.Util.showToast(res.data.msg || res.errMsg || '查看日志失败！')
      }
    })

  },

  goodStart({
    detail: {
      index
    }}){
    let that =this
    console.log(index)
    if (index == 0) {
      that.setData({
        visibleModalStart:false
      })
    }else{
      let orderInfo = this.data.orderInfo
      let [ordersn, shopId] = [orderInfo.sn, this.data.options.shopId]
      wx.navigateTo({
        url: "/pages/shipment/shipment?ordersn=" + ordersn + "&shopId=" + shopId
      })
    }
  },

  // 取消或关闭订单按钮
  btnCancelOrder({ currentTarget: { dataset}}) {
    let type = dataset.type
    if (type == 'cancel') {
      this.setData({
        visibleModal: true
      })
    } else if (type == 'close') {
      this.setData({
        visibleModal1: true
      })
    }
  },
  lingsOrder({ currentTarget: { dataset } }) {
    let { type } = dataset
    if (type == 'refund') {// 退款
      wx.navigateTo({
        url: '/expandPage/order/refund?id=' + this.data.options.orderId+ '&type=' + type,
      })
    } else if (type == 'agreeRefund') { // 上级同意退款
      this.setData({
        visibleModalRefund: true
      })
    } else if (type == 'cancele') { // 取消订单
      this.setData({
        visibleModalClose2: true
      })
    } else if (type == 'delivery') { // 上级发货
      wx.navigateTo({
        url: '/expandPage/order/delivery?id=' + this.data.options.orderId,
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
      visibleModalClose2: false
    })
    if (index == 1) {
      this.userCancelOrder()
    }
  },
  // 零售-取消订单
  userCancelOrder() {
    let that = this
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.lingsOrderCancel,
      method: "POST",
      data: {
        id: this.data.options.orderId
      },
      success(res) {
        $Toast.hide()
        
        $Message({
          content: '订单取消成功！',
          callback() {
            that.getUserOrderInfo()
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
  //是否同意退款 - 零售
  // 同意退款
  handleClose3({
    detail: {
      index
    }
  }) {
    this.setData({
      visibleModalRefund: false
    })
    if (index == 1) {
      this.userAgreeRefund()
    }
  },
  // 零售上级同意退款
  userAgreeRefund() {
    let that = this
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.lingsOrderAgreerefund,
      method: "POST",
      data: {
        id: this.data.options.orderId,// 订单ID
      },
      success(res) {
        $Toast.hide()
        $Message({
          content: '退款成功！',
          callback() {
            that.getUserOrderInfo()
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
 
  // 是否取消订单
  handleClose({
    detail: {
      index
    }
  }) {
    this.setData({
      visibleModal: false
    })
    if (index == 1) {
      $Toast({
        content: '正在取消',
        duration: 0,
        type: 'loading'
      });
      App.Util.request({
        url: App.Api.sellerCancelOrder,
        data: {
          id: this.data.options.orderId
        },
        method: 'POST',
        success(res) {
          $Toast.hide()
          console.log(res)
          App.Util.showToast('订单取消成功！', () => {
            wx.switchTab({
              url: '/pages/notice/notice',
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
  
    if (index == 1) {
      $Toast({
        content: '正在关闭',
        duration: 0,
        type: 'loading'
      });
      App.Util.request({
        url: App.Api.sellerCloseOrder,
        data: {
          id: this.data.options.orderId
        },
        method: 'POST',
        success(res) {
          $Toast.hide()
          console.log(res)
          App.Util.showToast('订单关闭成功！', () => {
            wx.switchTab({
              url: '/pages/notice/notice',
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
  // 获取物流信息
  getExpressInfo(e) {
    var that = this
    let id = e.currentTarget.dataset.id

    App.Util.request({
      url: App.Api.getExpress,
      data: {
        id: id
      },
      method: 'POST',
      success(res) {
        console.log(res)
        if (res && res.data && res.data.length > 0) {
          that.setData({
            expressInfo: res.data,
            expressVisiable: true
          })
        } else {
          App.Util.showToast('暂无相关数据！')
        }
      },
      fail(res) {
        App.Util.showToast(res.data.msg || res.msg || '获取物流信息失败！')
      },
      complete() {
        $Toast.hide()
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
    this.getUserOrderInfo()
    Promise.all([this.p_getuserInfo, this.p_getUserOrderInfo]).then(() => {
      $Toast.hide()
      setTimeout(() => {
        this.setData({
          "progress.percent": 100,
          isLoadCompelte: true
        })
      }, 500)
    })
  },
  getUserInfo() {
    var that = this

    this.p_getuserInfo = new Promise((resolve) => {
      App.Util.request({
        url: App.Api.teamSelfInfoUrl,
        data: {
          u_id: this.data.options.userId
        },
        success(res) {
          // console.log(res)
          if (res.data) {
            res.data.shop_avatar = App.Util.buildImageUrl(res.data.shop_avatar)
            that.setData({
              userInfo: res.data
            })

            resolve()
          } else {
            App.Util.showToast(res.msg || '获取个人信息失败')
          }
        },
        fail(res) {
          console.log(res)
          App.Util.showToast(res.data.msg || '获取个人信息失败')
        }
      })
    })
  },
  // 获取该订单所有信息
  getUserOrderInfo() {

    var that = this
    var options = this.data.options

    let otype = 0
    if (options.orderType == 'retail') {
      otype = 2 //零售订单
    } else if (options.orderType == 'stock') {
      otype = 0 //进货订单
    } else if (options.orderType == 'wholesale') {
      otype = 1 //出货订单
    }
  
    this.p_getUserOrderInfo = new Promise((resolve) => {
     
      if (options.orderType == 'retail') {
      //  console.log('来劲',options.orderType)
        App.Util.request({
          url: App.Api.odsOrderInfo,
          data: {
            u_id: options.userId,
            shopid: options.shopId,
            id: options.orderId,
            type: otype
          },
          method: 'POST',
          success(res) {
            if (res.data) {
              // 处理图片
              res.data.brief = App.Util.changeImgUrl(res.data.brief, 'img')
              let kefuList = that.data.kefuList

              if (res.data.kefu) {
                kefuList = res.data.kefu
                // kefuList.erwema = App.Util.buildImageUrl(kefuList.erwema) 
                that.setData({
                  kefuList
                })
              }
              //赠送过滤
              res.data.u_id = that.data.options.userId
              let complimentary = res.data.brief.filter(item=>{
                return item.ord_goods_type == 3
              })
              //不是赠送的商品
              let goodsList = res.data.brief.filter(item => {
                return item.ord_goods_type == 1
              })
              // if (res.data.brief && res.data.brief.length > 0) {
              //   res.data.brief.forEach((item, i) => {
              //     item.forEach((x, y) => {
              //       if (x) {
              //         let adaper = that.adaper(x)
              //         console.log(adaper, 22)
              //         if (adaper && adaper.length > 0) {
              //           x = adaper
              //           x = App.Util.changeImgUrl(x, 'img')
              //         }
              //       }

              //     })
              //   })
              //   that.setData({
              //     gifts: res.data.brief
              //   })
              // }
              // 处理 ids propsId
              // var ids = [],props = []
              // res.data.brief.gInfos.forEach((item) => {
              //   ids.push(item.id)
              //   props.push(item.propsId)
              // })
              // res.data.ids = ids
              // res.data.props = props
              // 处理商品金额
              // let paied = parseFloat(res.data.paied), // 商品金额
              //   fee = parseFloat(res.data.shipping_fee), // 运费
              //   serverFee = res.data.collection.fee ? res.data.collection.fee : 0 // 代发服务费
              // let c = App.Util.Subtr(paied, fee)
              // res.data.total_m = parseFloat(App.Util.Subtr(parseFloat(c), serverFee)).toFixed(2) // 总金额
              // 自提时间
              if (res.data.shiptype == 4 && res.data.extracttime && parseFloat(res.data.extracttime) && parseFloat(res.data.extracttime) > 0) {
                let date = new Date(parseInt(res.data.extracttime) * 1000)
                let hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
                let min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
                let sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
                res.data.extracttime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + hours + ':' + min + ':' + sec
                console.log(res.data.extracttime)
              } else {
                res.data.extracttime = 0
              }
              if (res.data.uinfo && res.data.uinfo.avater) {
                res.data.uinfo.avater = App.Util.buildImageUrl(res.data.uinfo.avater)
              }
              let star = that.data.star
              if (res.data.kefu && res.data.kefu.commit) {
                //
                res.data.kefu.erwema = App.Util.buildImageUrl(res.data.kefu.erwema)
                star.text = that.switchStar(parseInt(res.data.kefu.commit.grade))
                star.index = res.data.kefu.commit.grade

              }
              // if (res.data.brief && res.data.brief.gInfos.length > 0) {
              //   res.data.brief.gInfos.forEach((item,index) => {
              //     item.editNum = item.num // 编辑复制订单中的商品数量
              //     item.select = true // 勾选复制订单中的商品
              //   })
             // textValue: res.data.mark,// 备注
               // textNum: res.data.mark.length,// 备注字数
              // }
              that.setData({
                orderInfo: res.data,
                goodsList,
                star,
                complimentary
              }, () => {
                that.isOrderClose()
              })
              resolve()
            }
          },
          fail(res) {
            console.log(res)
            App.Util.showToast(res.data.msg || '获取订单信息失败', () => {
              wx.navigateBack({
                delta: 1
              })
            })
          }
        })//dd
      }else{
       // console.log('来劲2', options.orderType)
        App.Util.request({
          url: App.Api.teamOrderInfoUrl,
          data: {
            u_id: options.userId,
            shopid: options.shopId,
            id: options.orderId,
            type: otype
          },
          method: 'POST',
          success(res) {
            if (res.data) {
              // 处理图片
              res.data.brief.gInfos = App.Util.changeImgUrl(res.data.brief.gInfos, 'img')
              let kefuList = that.data.kefuList

              if (res.data.kefu) {
                kefuList = res.data.kefu
                // kefuList.erwema = App.Util.buildImageUrl(kefuList.erwema) 
                that.setData({
                  kefuList
                })
              }

              if (res.data.brief.gifts && res.data.brief.gifts.length > 0) {
                res.data.brief.gifts.forEach((item, i) => {
                  item.forEach((x, y) => {
                    if (x.gifts) {
                      let adaper = that.adaper(x.gifts)
                      console.log(adaper, 22)
                      if (adaper && adaper.length > 0) {
                        x.gifts = adaper
                        x.gifts = App.Util.changeImgUrl(x.gifts, 'img')
                      }
                    }

                  })
                })
                that.setData({
                  gifts: res.data.brief.gifts
                })
              }
              // 处理 ids propsId
              // var ids = [],props = []
              // res.data.brief.gInfos.forEach((item) => {
              //   ids.push(item.id)
              //   props.push(item.propsId)
              // })
              // res.data.ids = ids
              // res.data.props = props
              // 处理商品金额
              // let paied = parseFloat(res.data.paied), // 商品金额
              //   fee = parseFloat(res.data.shipping_fee), // 运费
              //   serverFee = res.data.collection.fee ? res.data.collection.fee : 0 // 代发服务费
              // let c = App.Util.Subtr(paied, fee)
              // res.data.total_m = parseFloat(App.Util.Subtr(parseFloat(c), serverFee)).toFixed(2) // 总金额
              // 自提时间
              if (res.data.shiptype == 4 && res.data.extracttime && parseFloat(res.data.extracttime) && parseFloat(res.data.extracttime) > 0) {
                let date = new Date(parseInt(res.data.extracttime) * 1000)
                let hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
                let min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
                let sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
                res.data.extracttime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + hours + ':' + min + ':' + sec
                console.log(res.data.extracttime)
              } else {
                res.data.extracttime = 0
              }
              
              if (res.data.uinfo && res.data.uinfo.avater) {
                res.data.uinfo.avater = App.Util.buildImageUrl(res.data.uinfo.avater)
              }
              let star = that.data.star
              if (res.data.kefu.commit) {
                //
                res.data.kefu.erwema = App.Util.buildImageUrl(res.data.kefu.erwema)
                star.text = that.switchStar(parseInt(res.data.kefu.commit.grade))
                star.index = res.data.kefu.commit.grade

              }
              // if (res.data.brief && res.data.brief.gInfos.length > 0) {
              //   res.data.brief.gInfos.forEach((item,index) => {
              //     item.editNum = item.num // 编辑复制订单中的商品数量
              //     item.select = true // 勾选复制订单中的商品
              //   })
              // }
              that.setData({
                orderInfo: res.data,
                goodsList: res.data.brief,
                star,
                textValue: res.data.mark,// 备注
                textNum: res.data.mark.length,// 备注字数
              }, () => {
                that.isOrderClose()
              })
              resolve()
            }
          },
          fail(res) {
            console.log(res)
            App.Util.showToast(res.data.msg || '获取订单信息失败', () => {
              wx.navigateBack({
                delta: 1
              })
            })
          }
        })//dd
      }
   
    })
  },

  adaper(json) {
    let newArr = []
    let arr = []
    for (let i in json) {
      newArr[i] = json[i]
    }
    if (newArr.length > 0) {
      for (let i = 0; i < newArr.length; i++) {
        if (newArr[i] != undefined) {
          arr.push(newArr[i])
        }
      }
    }
    return arr
  },

  isOrderClose() {
    var orderInfo = this.data.orderInfo
    var temp = parseInt(orderInfo.create_time_stame + '000')
    var twMin = 20 * 60 * 1000
    let isOrderClose = false
    // 交易已关闭
    if (Number(orderInfo.type) == 7 || Number(orderInfo.type) == 0) {
      this.setData({
        isOrderClose: true
      })
      return
    }
    // this.closeOrderId = setInterval(() => {
    //   var newDate = new Date().getTime()
    //   var c = newDate - temp
    //   // 如果当前时间大于大于20分钟，则该订单已关闭
    //   if (c >= twMin) {
    //     isOrderClose = true
    //     clearInterval(this.closeOrderId)
    //   }
    //   this.setData({
    //     isOrderClose
    //   })
    // }, 1000)

  },

  // 复制
  copy({
    currentTarget: {
      dataset: {
        sn
      }
    }
  }) {
    wx.setClipboardData({
      data: sn,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res)
            wx.showToast({
              title: "复制成功",
              icon: "success",
              mask: true,
              duration: 1500,
              success() {
                // console.log("复制成功");
              },
              fail() {
                // console.log("复制失败");
              }
            })
          }
        })
      }
    })
  },
  // 联系代理商
  phoneCall: function(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone + '',
    });
  },
  //发货-手入

  sendgoodTap() {
    let orderInfo = this.data.orderInfo
    if (orderInfo.shiplist.length == 0 && orderInfo.pay_type == 17){
      this.setData({
        visibleModalStart: true
      })
    }else{
      let [ordersn, shopId] = [orderInfo.sn, this.data.options.shopId]
      wx.navigateTo({
        url: "/pages/shipment/shipment?ordersn=" + ordersn + "&shopId=" + shopId
      })
    }
    
  
   
  },
  //零售发货
  shipmentsTab() {
    let orderInfo = this.data.orderInfo
      let [ordersn, shopId] = [orderInfo.sn, this.data.options.shopId]
      wx.navigateTo({
        url: "/pages/shipment/shipment?ordersn=" + ordersn + "&shopId=" + shopId
      })
  },
  //详情按钮
  xingInfo(e) {
    let id = e.currentTarget.dataset.id
    let type = e.currentTarget.dataset.type
    let shipt = e.currentTarget.dataset.shipt
    wx.navigateTo({
      url: "/pages/logistics/logistics?id=" + id + "&type=" + type
    })
  },

  // 发货-扫码
  delivery({
    currentTarget: {
      dataset
    }
  }) {
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['barCode', 'datamatrix', 'pdf417'], // 'qrCode'(二维码) 扫二维码path才有返回值
      success(res) {
        console.log("scanCode success", res)
      }
    })

  },
  // 查看物流信息
  checkLogistics(e) {
    console.log('checkLogistics')
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    this.getExpressInfo(e)
  },
  // 结算
  // btnPay() {
  //   var that= this
  //   if (!this.data.isShowPayPopUp) {
  //     this.sellerBalance()
  //     this.setData({
  //       isShowPayPopUp: true
  //     })
  //   }else {
  //     // var completeBtnPay = com
  //   }
  // },
  // 打开支付弹框
  _openPopUp(e) {
    var btnPay = this.selectComponent('#btnPay');
    // 结算
    if (e.detail.type == 'pay') {
      let orderInfo = this.data.orderInfo
      btnPay.pay({
        that: this,
        orderInfo: orderInfo
      })
    }
  },
  // 关闭支付弹框
  _closePopUp(e) {

  },
  //联系工作人员
  contacts() {
    let kefuHeight = App.Util.getNodeHeight('window') - App.Util.checkPhoneType()

    this.setData({
      kefuHeight,
      contacts_start: true
    })
  },
  contactsOut() {
    this.setData({
      contacts_start: false
    })
  },
  //
  makePhone(e) {
    let mobile = e.currentTarget.dataset.mobile
    wx.makePhoneCall({
      phoneNumber: mobile //仅为示例，并非真实的电话号码
    })
  },
  // 显示备注弹框
  editmark() {
    this.setData({
      showTextarea: true
    })
  },
  // 输入备注
  textInput(e) {
    let {
      value,
      cursor
    } = e.detail
    this.setData({
      textValue: value,
      textNum: cursor
    })
  },
  // 备注弹框按钮
  btnClickText({
    currentTarget: {
      dataset
    }
  }) {
    let type = dataset.type,
      textValue = this.data.textValue,
      orderInfo = this.data.orderInfo,
      that = this
    if (type == "cancel") { // 取消
      this.setData({
        showTextarea: false
      })
    } else { // 确定
      if (!textValue || textValue.length == 0) {
        App.Util.showToast('请输入备注!')
        return
      }
      $Toast({
        content: '正在提交',
        duration: 0,
        type: 'loading'
      });
      App.Util.request({
        url: App.Api.remark,
        data: {
          id: orderInfo.sn,
          mark: textValue,
        },
        method: "POST",
        success(res) {
          console.log(res)
          if (res.code == 200) {
            App.Util.showToast('提交成功！')
            that.setData({
              showTextarea: false,
              'orderInfo.mark': textValue
            })
          } else {
            App.Util.showToast('数据错误！')
          }
        },
        fail(res) {
          console.log(res)
          App.Util.showToast(res.data.msg || '提交失败！')
        },
        complete() {
          $Toast.hide()
        }
      })
    }
  },
  // move() {},
  // 复制订单
  clickDuplicateOrder(e) {
    let {type} = e.currentTarget.dataset
    if (type == 'open') {
      this.setData({
        duplicateOrder: true
      })
    } else if ( type == 'cancel'){
      this.setData({
        duplicateOrder: false
      })
    }
    
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    // this.setData({
    //   isLoadCompelte: false
    // })
  },
////评价
  hideBottom(){
      this.setData({
        anitmationBottom:true
      })

  },
  outHideBottom() {
    let star={
      index: 0,
      text: '',
      textarea: ''
    }
    this.setData({
      anitmationBottom: false,
      star
    })
  },
  onChange1(e) {
    const index = e.detail.index;
    let text = this.switchStar(index)
    let star = this.data.star
    star.index = index
    star.text = text
    this.setData({
      star
    })
    
  },
  switchStar(index) {
    switch (index) {
      case 1:
        return '非常不满意，各方面都很差'
        break
      case 2:
        return '不满意，比较差'
        break
      case 3:
        return '一般，还需改善'
        break
      case 4:
        return '比较满意，仍可改善'
        break
      case 5:
        return '非常满意，无可挑剔'
        break
    }
  },

  WrapClick(e){
    let star = this.data.star;
    star.textarea = e.detail.value
    this.setData({
      star
    })
    //console.log(this.data.textarea)
  },
  warpClick(){
    //提交订单评价 //参数订单sn,grade评分,context内容
    let that = this
    let star = this.data.star
    let orderInfo = this.data.orderInfo
    if (star.index == 0) { 
      App.Util.showToast('请对本次服务评价') 
      return
    }
    $Toast({
      content: '提交中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.grade,
      data: {
        sn: orderInfo.sn,
        grade: star.index,
        context: star.textarea,
      },
      method: 'POST', 
      success(res) {
      
        App.Util.showToast(res.data.msg || '服务评价提交成功！')
        
      },
      fail(res) {
        App.Util.showToast(res.data.msg || res.errMsg || '服务评价提交失败！')
      },
      complete() {
        that.outHideBottom()
        $Toast.hide()
      }
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

  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function() {

  // }
})