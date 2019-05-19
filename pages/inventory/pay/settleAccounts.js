// pages/inventory/pay/settleAccounts.js
var App = getApp();
var Util = require('../../../utils/util.js');
const {
  $Message,
  $Toast
} = require('../../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    switch1: false, // false: 物流配送 true: 自提
    disabledSwitch1: false, // 是否组止切换（订单生产禁止切换）
    switchWay: 'logistics', //logistics:物流配送 selfExtract:自提
    cbase: '',
    weights: 0,
    state: 0, //是否是赠品
    addressInfo: {
      // sn: '3948586987234729384',
      // address:"厦门市思明区前埔西路"
    }, // 地址信息
    orderData: {}, //订单基本信息
    cartList: [],
    gifts: [], //活动列表
    giftgf: {}, //换赠商品参数
    cartBilling: {}, // 购物车金额信息
    shipee: 0, //运费
    markers: [{
      id: 0,
      // iconPath: '/images/order-9.svg',
      width: 15,
      height: 28,
      latitude: 39.9, // 纬度 -90~90
      longitude: 116.3,
      // label: {
      //   content: 'ss',
      //   color: '#4DA1FF',
      //   anchorX: 0,
      //   anchorY: 0,
      //   borderColor: "#4DA1FF",
      //   borderWidth: 1
      // },
    }],
    totalMoney: 0, // 实付总金额
    ids: [], // 商品id
    props: [], // 商品规格id
    popUp: [ // 支付方式弹框显示（0,1），时间选择器弹框（2）
      {
        isShow: false
      }, // outer
      {
        isShow: false
      }, // inner
      {
        isShow: false
      } // time
    ],
    visibleModal: false, // 是否显示暂无地址提示框
    gifttal: parseFloat(0).toFixed(2), //小计
    modalDataHint: '您还没有收件地址，请前往添加',
    addressCount: 0, // 地址剩余数量
    modalData: [{
      name: '前往添加地址',
      color: '#4da1ff',
      fontSize: '24rpx'
    }],
    // payMethod: { // 支付弹框数据
    //   balance: { // 余额
    //     money: 0,
    //     select: false, // 选中
    //     select1: false, // 禁用
    //   },
    //   dealer: { // 可提现金额
    //     money: 0,
    //     select: false,
    //     select1: false,
    //   },
    //   wechat: { // 微信
    //     selectType: false,
    //     select: false,
    //     select1: false,
    //   },
    //   alipay: { // 支付宝
    //     selectType: false,
    //     select: false,
    //     select1: false,
    //   },
    //   bankCard: { // 银联
    //     selectType: false,
    //     select: false,
    //     select1: false,
    //   }
    // },
    allTimeList: [ // 自提时间数据
      [],
      ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'],
    ],
    allTimeIndex: [0, 0], // 自提时间的索引（左右）
    // pageType: 'orderCreat', // orderCreat ：订单支付 || orderDetail : 订单详情
    userBaseInfo: {}, // 用户基础信息
    windowHeight: 667, // 页面高度
    userInfo: {},

    mailMethod: {}, // 邮寄信息
    visiable: false, // 是否显邮寄方式弹框
    cashBackPopUp: false, // 是否显示返利金额弹框
    screenWidth: 375,
    tabBarH: 50,
    isNotUseCashBack: true, // 是否不适用返利金额 如果最大可使用金额大于0，默认是false（可使用）
    oderComment: '',
    mark: '未填写',
    orderStart: false,
    animationPinl: {},
    copyOrder:{}, // 复制订单信息
  },
  //订单备注
  remarkClik() {
    // 如果存在订单，则禁止修改
    var orderData = this.data.orderData
    if (JSON.stringify(orderData) != '{}' && (orderData.sn || orderData.order_sn)) {
      return false
    }
    this.setData({
      orderStart: true
    })
  },
  orderCommentOut() {
    this.setData({
      orderStart: false
    })
  },
  remarkText(e) {
    this.setData({
      oderComment: e.detail.value
    })
  },
  orderComment() {
    this.setData({
      mark: this.data.oderComment
    }, () => {
      this.orderCommentOut()
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options.copyOrder)
    let copyOrder = {}
    if (options.copyOrder) {
      copyOrder = JSON.parse(options.copyOrder)
    }

    // console.log(wx.getSystemInfoSync().windowHeight-150)
    // console.log(wx.getSystemInfoSync().screenHeight * 2-300)
    this.setData({
      userInfo: wx.getStorageSync('globalData').userInfo,
      windowHeight: App.Util.getNodeHeight('window'),
      tabBarH: App.Util.checkPhoneType(),
      screenWidth: wx.getSystemInfoSync().screenWidth,
      copyOrder
    })
    var that = this
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    this.getCartInfo({
      success() {
        that.getCartBilling({
          success() {
            that.getAddress({
              success() {
                $Toast.hide()
              }
            })
          }
        })
      }
    })

    this.getCartCount()
    // this.getUserCenter()
  },
  /* 阻止遮罩层下的页面滚动 */
  move() {},
  // 物流配送/自提切换
  onChange(event) {
    const detail = event.detail;
    let orderData = this.data.orderData,
      mailMethod = this.data.mailMethod,
      addressInfo = this.data.addressInfo,
      cartBilling = this.data.cartBilling,
      that = this

    this.setData({
      'switch1': detail.value,
      switchWay: detail.value ? 'selfExtract' : 'logistics'
    }, () => {
      console.log('map', this.data.markers, this.data.switchWay, this.data.userInfo.seltype)
      if (parseFloat(cartBilling.weight) > 0) {
        if (this.data.switchWay == 'logistics') { // 物流配送，已有物流相关信息时重新计算

          let total = parseFloat(cartBilling.ototal)
          let t = addressInfo.serfee > 0 ? (total * addressInfo.serfee).toFixed(2) : 0
          // 重新计算总金额=商品总金额:total + 代发服务费:t + 运费（运费在选择邮寄方式后计算）
          let totalMoney = parseFloat(App.Util.accAdd(total, parseFloat(t)))
          totalMoney = mailMethod.ruleItem.type == 1 ? App.Util.accAdd(totalMoney, parseFloat(mailMethod.ruleItem.fee)) : totalMoney
          totalMoney = App.Util.Subtr(parseFloat(totalMoney), parseFloat(cartBilling.change_max_cashback)) // 返现金额

          this.setData({
            'orderData.shiptype': mailMethod.exItem.key, // 物流
            'orderData.shipdev': mailMethod.ruleItem.type, // 寄付/到付
            'cartBilling.serfee': t, // 代发服务费
            'cartBilling.freight': mailMethod.ruleItem.type == 1 ? mailMethod.ruleItem.fee : '', // 运费
            totalMoney: parseFloat(totalMoney).toFixed(2)
          })
        } else { // 自提清除运费

          this.setData({
            'orderData.shiptype': 4, //物流
            'orderData.shipdev': 0, // 寄付到付
            'cartBilling.serfee': '', // 代发服务费
            'cartBilling.freight': '', // 运费
            totalMoney: parseFloat(App.Util.Subtr(parseFloat(cartBilling.ototal), parseFloat(cartBilling.change_max_cashback))).toFixed(2)
          })
        }
      }

    })
  },
  // 获取时间信息
  getAllTimeData() {
    var timeDataLeft = this.getAllTimeDataLeft()
    var allTimeList = this.data.allTimeList
    allTimeList[0] = timeDataLeft
    this.setData({
      allTimeList
    })
  },
  getAllTimeDataLeft() {
    var timeData = []
    var currentTime = new Date()
    var timeStamp = currentTime.getTime()
    var oneDay = 24 * 60 * 60 * 1000
    for (var i = 1; i < 8; i++) {
      const temp = timeStamp + oneDay * i
      var tempTime = new Date(temp)
      var tempYear = tempTime.getFullYear()
      var tempMonth = tempTime.getMonth() + 1
      var tempDate = tempTime.getDate()
      var tempday = tempTime.getDay()
      timeData.push({
        time: i == 1 ? '明天' : tempMonth + '月' + tempDate + '日',
        week: this.switchWeek(tempday),
        stamp: tempYear + '-' + tempMonth + '-' + tempDate + ' '
      })
    }
    return timeData
  },
  switchWeek(num) {
    switch (num) {
      case 1:
        return '周一'
        break
      case 2:
        return '周二'
        break
      case 3:
        return '周三'
        break
      case 4:
        return '周四'
        break
      case 5:
        return '周五'
        break
      case 6:
        return '周六'
        break
      case 0:
        return '周日'
        break
    }
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
      data: sn + '',
      success(res) {
        wx.getClipboardData({
          success(res) {
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
  // 确认邮寄方式
  _confirmMail(e) {
    var that = this
    let detail = e.detail,
      exList = detail.exList,
      mailList = detail.mailList,
      selectIndex = detail.selectIndex,
      exListItem = exList[selectIndex[0]],
      mailItem = mailList[selectIndex[1]]
    /**
     * 如果是寄付
     * 1）要把寄付金额添加到运费当中
     * 2）总金额要加上寄付金额
     */
    this.setData({
      selectIndex,
      mailMethod: {
        exItem: exListItem,
        ruleItem: mailItem
      },
      visiable: false,
      'cartBilling.freight': '0.00',
    })
    // 调用一次地址，还原运费，和总金额
    this.getAddress({
      shiptype: exListItem.key,
      shipdev: mailItem.type,
      success() {
        // 每次点击寄付时，修改运费、总金额增加运费
        if (mailItem.type == 1) {
          console.log(that.data.mailMethod)
          let cartBilling = that.data.cartBilling,
            totalMoney = that.data.totalMoney // 
          that.setData({
            // 'cartBilling.freight': App.Util.accAdd(parseFloat(cartBilling.freight), parseFloat(mailItem.fee)).toFixed(2), //运费
            'cartBilling.freight': parseFloat(cartBilling.freight).toFixed(2), //运费
            'orderData.shiptype': exListItem.key, // 物流
            'orderData.shipdev': mailItem.type, // 寄付/到付
            totalMoney: parseFloat(totalMoney).toFixed(2)
          })
        }
      }
    })

  },
  loading() {
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
  },
  loadingEnd() {
    $Toast.hide()
  },
  // 获取地址及经纬度
  getAddress(options) {
    console.log(this.data.cartBilling.weight, 'shiptype', 'shipdev')
    let cartBilling = this.data.cartBilling,
      selectIndex = this.data.selectIndex

    options = options || {}
    let shiptype = options.shiptype || 0 // 寄付/ 到付
    let shipdev = options.shipdev || 0 // 物流 
    var that = this
    App.Util.request({
      url: App.Api.sellerGetaddandship,
      data: {
        weight: cartBilling.weight,
        shiptype,
        shipdev,
      },
      success(res) {
        console.log(res.data)
        if (res && res.data) {
          // 代发服务费（备案地址不收取代发服务费）
          var total = parseFloat(cartBilling.total)
          //代发服务费修改
          let ptotal = parseFloat(cartBilling.cancolfee) //商品金额
          var t = res.data.serfee > 0 ? Math.round(ptotal * res.data.serfee * 1000 / 10) / 100 : 0
          // 重新计算总金额=商品总金额:total + 代发服务费:t + 运费（运费在选择邮寄方式后计算）
          var totalMoney = parseFloat(App.Util.accAdd(total, parseFloat(t)))
          // 返现金额
          totalMoney = App.Util.Subtr(parseFloat(totalMoney), parseFloat(cartBilling.change_max_cashback))

          // 经纬度
          var markers = that.data.markers
          markers[0].latitude = res.data.lat
          markers[0].longitude = res.data.lng

          // 邮寄方式默认值 取第一个
          var mailMethod = that.data.mailMethod,
            isOk = false

          if (JSON.stringify(that.data.mailMethod) === '{}' && res.data.shiplist.length > 0) {
            res.data.shiplist.forEach((item) => {

              // 如果对应的key存在 且 不是自提
              if (!isOk && res.data.rulelist[item.key] && item.key != 4) {

                // 直属(至少会有一条物流信息和一个自提)
                if (parseInt(that.data.userInfo.seltype) > 0) {
                  let ruleItem = {}
                  if (item.key == 3) { // 到付
                    ruleItem = res.data.rulelist[item.key]
                  }else {
                    ruleItem = res.data.rulelist[item.key].devtypes[1] ? res.data.rulelist[item.key].devtypes[1] : res.data.rulelist[item.key].devtypes[0] // 如果到付存在，默认是到付，否则是寄付
                  }
                  mailMethod = {
                    exItem: item,
                    ruleItem
                  }
                }
                // 非直属 （创建订单时只有到付：type=3、自提：type=4） 
                else if (parseInt(that.data.userInfo.seltype) <= 0) {
                  // let ruleItem = res.data.rulelist[item.key].devtypes ? (res.data.rulelist[item.key].devtypes[1] ? res.data.rulelist[item.key].devtypes[1] : res.data.rulelist[item.key].devtypes[0]) : res.data.rulelist[item.key]
                  mailMethod = {
                    exItem: item,
                    ruleItem: res.data.rulelist[item.key], // 非直属没有运费
                  }
                }
                isOk = true

              }

            })
            that.setData({
              'orderData.shiptype': mailMethod.exItem.key, // 物流
              'orderData.shipdev': (mailMethod.ruleItem.type == 3 || mailMethod.ruleItem.type == 4) ? 0 : mailMethod.ruleItem.type, // 寄付/到付
            })
          } else if (Object.keys(that.data.mailMethod).length > 0 && res.data.shiplist.length > 0 && selectIndex) { // 存在物流信息 && 物流索引存在 防止换购切换时顶部物流信息不变
            let shipItem = res.data.shiplist[selectIndex[0]]
            let key = res.data.shiplist[selectIndex[0]].key
            if (key != 4) {
              if (parseInt(that.data.userInfo.seltype) > 0) { // 直属
                let ruleItem = {}
                if (key == 3) { // 到付
                  ruleItem = res.data.rulelist[key]
                }else {
                  ruleItem = res.data.rulelist[key].devtypes[selectIndex[1]] ? res.data.rulelist[key].devtypes[selectIndex[1]] : res.data.rulelist[key].devtypes[selectIndex[0]] // 如果到付存在，默认是到付，否则是寄付
                }
                mailMethod = {
                  exItem: shipItem,
                  ruleItem
                }
              } else if (parseInt(that.data.userInfo.seltype) <= 0) { // 非直属
                mailMethod = {
                  exItem: shipItem,
                  ruleItem: res.data.rulelist[key], // 非直属没有运费
                }
              }
              that.setData({
                'orderData.shiptype': mailMethod.exItem.key, // 物流
                'orderData.shipdev': (mailMethod.ruleItem.type == 3 || mailMethod.ruleItem.type == 4) ? 0 : mailMethod.ruleItem.type, // 寄付/到付
                'cartBilling.freight': mailMethod.ruleItem.type == 1 ? mailMethod.ruleItem.fee : 0
              })
            }

          }

          if (that.data.mailMethod.ruleItem) {
            let mailtype = that.data.mailMethod.ruleItem.type
            if (mailtype == 1) {
              totalMoney = parseFloat(totalMoney) + parseFloat(res.data.shipfee)
            }
          }


          that.setData({
            addressInfo: res.data,
            shipee: res.data.shipfee,
            cbase: res.data.cbase,
            mailMethod, // 邮寄方式默认值
            markers,
            'cartBilling.serfee': t, // 代发服务费
            totalMoney: parseFloat(totalMoney).toFixed(2)
          },()=>{
            $Toast.hide()
          })
          options.success && options.success()
        }else{
          $Toast.hide()
        }
        
      },
      fail(res) {
        $Toast.hide()
        console.log(res)
        // if(res.code == 200) {
        if (res && res.data && ((res.data.msg == "默认地址不存在") || (res.data.data && res.data.data.status && res.data.data.status == -1))) {
          let modalData = that.data.modalData,
            modalDataHint = res.data.msg
          if (res.data.data.count > 0) {
            modalDataHint = '未设置默认地址'
            modalData[0].name = '前往设置'
          }
          that.setData({
            modalDataHint,
            addressCount: res.data.data.count,
            modalData,
            visibleModal: true
          })
        }else {
          App.Util.showToast(res.data.data.msg || '获取数据失败！')
        }
        
        // }
      },
      complete() {
    
        options.complete && options.complete()
      }
    })
  },
  // 如果都没有地址，需前往添加地址
  handleModal() {
    let { addressCount} = this.data
    if (addressCount == 0) {
      wx.redirectTo({
        url: '/pages/editAddress/edit?type=add&addressInfo=null',
      })
    }else {
      wx.navigateTo({
        url: '/pages/editAddress/index',
      })
    }
    
  },
  // 选择邮寄方式
  selectMailMethod() {
    // 如果存在订单，则禁止修改
    var orderData = this.data.orderData
    if (JSON.stringify(orderData) != '{}' && (orderData.sn || orderData.order_sn)) {
      return false
    }
    this.setData({
      visiable: true
    })
  },
  // 使用返利金额
  useBackMoney() {
    // 如果存在订单，则禁止使用返利金额
    var orderData = this.data.orderData
    if (JSON.stringify(orderData) != '{}' && (orderData.sn || orderData.order_sn)) {
      return false
    }
    this.setData({
      cashBackPopUp: true
    })
  },
  // 修改地址等信息
  editInfo({
    currentTarget: {
      dataset: {
        type
      }
    }
  }) {
    // 如果存在订单，则禁止修改
    var orderData = this.data.orderData
    if (JSON.stringify(orderData) != '{}' && (orderData.sn || orderData.order_sn)) {
      return false
    }
   
    let page = getCurrentPages().pop()
    App.globalData.pageThis = page
    wx.navigateTo({
      url: '/pages/editAddress/index'
     
    })
  },
  // 购物车金额
  getCartBilling(options) {
    var that = this
    options = options || {}
    var parentId = wx.getStorageSync('globalData').userInfo.p_shop_id
    // 复制订单处理
    let params = {
      shopids: parentId,
      buytype: 1,
      carttype: 1,
      // type: 1,
      // buytype: 1,
      // shiptype: 1,
      // ids: JSON.stringify(this.data.ids),
      // props: JSON.stringify(this.data.props),
      // shopid: parentId
    }
    console.log()
    
    let d = this.data.copyOrder
    if (d && Object.keys(d).length > 0 ) {
      let { gids, attrIds, nums, subtype } = d
      params.gids = JSON.stringify(gids)
      params.attrIds = JSON.stringify(attrIds)
      params.nums = JSON.stringify(nums) 
      params.subtype = subtype
    }
    console.log(params)
    App.Util.request({
      url: App.Api.sellerCartOnShow, // sellerBillingUrl,
      data: params ,
      method: "POST",
      success(res) {
        if (res && res.data && res.data.orderPrices) {
          res.data.orderPrices.change_max_cashback = res.data.orderPrices.max_cashback // 另外保存初始显示的返利金额
          that.setData({
            cartBilling: res.data.orderPrices,
            gifts: res.data.orderPrices.gift,
            'orderData.weight': res.data.orderPrices.weight,
            isNotUseCashBack: res.data.orderPrices.max_cashback > 0 ? false : true
          }, () => {
            // that.getAddress()
            options.success && options.success()
          })
        }
        let giftarr = []
        that.data.giftgf['gIds'] = []
        that.data.giftgf['rIds'] = []

        let gifttal = 0
        if (that.data.gifts) {
          for (let i in that.data.gifts) {
            that.data.giftgf['gIds'].push(i)
            giftarr.push(that.data.gifts[i])

          }

          if (giftarr.length > 0) {
            for (let x = 0; x < giftarr.length; x++) {
              let s = [] //选中赠品
              if (giftarr[x].length > 0) {
                for (let y = 0; y < giftarr[x].length; y++) {
                  s[y] = []
                  let cs = []
                  giftarr[x][y].gifts = that.adaper(giftarr[x][y].gifts)
                  giftarr[x][y].gifts = App.Util.changeImgUrl(giftarr[x][y].gifts, 'pic')
                  if (giftarr[x][y].gifts.length > 0) {

                    for (let z = 0; z < giftarr[x][y].gifts.length; z++) {

                      if (giftarr[x][y].gifts[z].selected == 1) {
                        cs.push(giftarr[x][y].gifts[z].ruleid)
                      }

                      if (giftarr[x][y].gifts[z].type == 2 && giftarr[x][y].gifts[z].status != -1 && giftarr[x][y].gifts[z].selected == 1) {
                        gifttal = gifttal + parseFloat(giftarr[x][y].gifts[z].total)
                        giftarr[x][y].gifts[z].isfalse = false
                      } else {
                        giftarr[x][y].gifts[z].isfalse = true
                      }
                    }
                  }
                  s[y] = cs

                }
              }

              that.data.giftgf['rIds'].push(s)


            }
          }
          if (gifttal == 0) {
            gifttal = parseFloat(gifttal).toFixed(2)
          }
          console.log(that.data.giftgf, 222)
          that.setData({
            gifts: giftarr,
            gifttal: gifttal,
            giftgf: that.data.giftgf
          })
        }
      },
      fail(res) {
        App.Util.showToast(res.data.msg || '加载错误！')
      }
    })
  },
  //json转数组
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

  //换赠选择
  onSelect(e) {
    let index = e.currentTarget.dataset.index
    let choice = e.currentTarget.dataset.choice //多选
    let specis = e.currentTarget.dataset.specis //多选个数
    let type = e.currentTarget.dataset.type
    let key = e.currentTarget.dataset.key.split("_")
    let gifts = this.data.gifts
    let giftgf = this.data.giftgf
    let arr = []
    let cur = gifts[key[0]][key[1]].gifts[[key[2]]]
    let aweight = 0
    let gifttal = 0

    giftgf['rIds'] = this.data.giftgf['rIds']
    if (cur.selected == 1) {
      if (choice == 1 && type == 1) {
        return
      }
      cur.selected = 0
      cur.isfalse = true
      gifts[key[0]][key[1]].gifts[[key[2]]] = cur
      this.setData({
        gifts: gifts
      })
    } else {
      cur.selected = 1
      cur.isfalse = false
      gifts[key[0]][key[1]].gifts[[key[2]]] = cur
      this.setData({
        gifts: gifts
      })

      if (choice == 2) //1全选 2多选
      {
        for (let i = 0; i < gifts[key[0]][key[1]].gifts; i++) {
          if (gifts[key[0]][key[1]].gifts[i].selected == 1) {
            arr.push(gifts[key[0]][key[1]].gifts[i])
          }
        }
        if (arr.length > specis) {
          App.Util.showToast("该组赠品选择最多不能超过" + specis + "个")
          cur.selected = 0
          cur.isfalse = true
          gifts[key[0]][key[1]].gifts[[key[2]]] = cur
          this.setData({
            gifts: gifts
          })
          return
        }
      }
    }

    if (cur && cur.type == 2) { //减少的重量
      let cartBilling = this.data.cartBilling
      let gweigth = parseFloat(cur.weight)
      let weigt = parseFloat(gweigth * cur.num / 1000) //当前选中的重量
      let syweight = 0 //剩余总重量
      let sytotal = 0 //实付总金额
      let syprice = 0 //剩余商品总金额

      if (cur.selected == 1) {
        syweight = parseFloat(App.Util.accAdd(parseFloat(cartBilling.weight), weigt))
        sytotal = parseFloat(App.Util.accAdd(parseFloat(cartBilling.total), parseFloat(cur.total)))
        syprice = parseFloat(App.Util.accAdd(parseFloat(cartBilling.price), parseFloat(cur.total)))
        //giftgf['rIds'][0][0].push(cur.ruleid)
        giftgf['rIds'][key[0]][key[1]].push(cur.ruleid)

      } else {

        syweight = parseFloat(App.Util.Subtr(parseFloat(cartBilling.weight), weigt))
        sytotal = parseFloat(App.Util.Subtr(parseFloat(cartBilling.total), parseFloat(cur.total)))
        syprice = parseFloat(App.Util.Subtr(parseFloat(cartBilling.price), parseFloat(cur.total)))
        if (giftgf['rIds'][0][0].length > 0) {
          for (let i = 0; i < giftgf['rIds'][0][0].length; i++) {
            if (giftgf['rIds'][key[0]][key[1]][i] == cur.ruleid) {
              giftgf['rIds'][key[0]][key[1]].splice(i, 1)
            }
          }
        }

      }


      cartBilling.weight = syweight
      cartBilling.total = sytotal
      cartBilling.price = syprice
      this.setData({
        cartBilling: cartBilling
      })

    }
    if (gifts[key[0]][key[1]].gifts.length > 0) {
      let giftlists = gifts[key[0]][key[1]].gifts
      for (let i = 0; i < giftlists.length; i++) {
        if (giftlists[i].type == 2 && giftlists[i].status != -1 && giftlists[i].selected == 1) {
          gifttal = gifttal + parseFloat(giftlists[i].total)
        }
      }
    }
    if (gifttal == 0) {
      gifttal = parseFloat(gifttal).toFixed(2)
    }
    this.setData({
      gifttal: gifttal,
      //      mailMethod:{},
      giftgf: this.data.giftgf
    })
    let { exItem, ruleItem} = this.data.mailMethod
    this.getAddress({
      shiptype: exItem.key,
      shipdev: ruleItem.type,
    })


  },








  // 购物车信息(上级店铺、商品)
  getCartInfo(options) {
    var that = this
    var ids = this.data.ids
    var props = this.data.props
    options = options || {}
    // 复制订单处理
    let params = { }
    let d = this.data.copyOrder
    if (d && Object.keys(d).length > 0) {
      let { gids, attrIds, nums, subtype } = d
      params.gids = JSON.stringify(gids)
      params.attrIds = JSON.stringify(attrIds)
      params.nums = JSON.stringify(nums) 
      params.subtype = subtype
    }
    console.log(params)
    App.Util.request({
      url: App.Api.sellerCartUrl,
      data: params,
      success(res) {
        console.log(res)
        if (res && res.data && res.data.cart && res.data.cart.length > 0) {
          var cartList = res.data.cart[0].groups[0].goods
          cartList.forEach((item) => {
            ids.push(item.id)
            props.push(item.props)
          })
          that.setData({
            cartList: App.Util.changeImgUrl(cartList, 'pic'),
            ids,
            props,
          }, () => {
            // that.getCartBilling()
            options.success && options.success()
          })
        } else {
          App.Util.showToast('您还未添加商品', () => {
            wx.switchTab({
              url: '/pages/inventory/orderGoods',
            })
          })
        }
      },
      fail() {}
    })
  },
  // 统计购物车数量
  getCartCount() {
    // App.Util.request({
    //   url: App.Api.sellerCartCountUrl,
    //   success(res) {
    //     console.log(res)
    //   },
    //   fail() {}
    // })
  },
  // 设置自提时间索引
  setTakesTime({
    currentTarget: {
      dataset
    }
  }) {
    var allTimeIndex = this.data.allTimeIndex
    if (dataset.type == 'left') {
      allTimeIndex[0] = dataset.index
    } else {
      allTimeIndex[1] = dataset.index
    }
    this.setData({
      allTimeIndex
    })
    if (dataset.type == 'right') {
      this.hideTimePopup()
    }
  },
  // 显示自提时间
  showTimePopup() {
    // 如果存在订单，则禁止修改
    var orderData = this.data.orderData
    if (JSON.stringify(orderData) != '{}' && (orderData.sn || orderData.order_sn)) {
      return false
    }
    var popUp = this.data.popUp
    popUp[2].isShow = true
    this.setData({
      popUp
    })
  },
  // 隐藏自提时间
  hideTimePopup() {
    var popUp = this.data.popUp
    popUp[2].isShow = false
    this.setData({
      popUp
    })
  },
  // 打开支付弹框进行支付
  _openPopUp(e) {
    var btnPay = this.selectComponent('#btnPay');
    var that = this
    // 结算

    if (e.detail.type == 'pay') {

      let orderData = this.data.orderData
      orderData.ids = this.data.ids
      orderData.props = this.data.props
      orderData.addressId = this.data.addressInfo.id
      orderData.cash = this.data.cartBilling.change_max_cashback
      orderData.gift = this.data.giftgf
      orderData.mark = this.data.mark //this.data.mark  //订单备注
      let allTimeList = this.data.allTimeList,
        allTimeIndex = this.data.allTimeIndex
      let stamp = allTimeList[0][allTimeIndex[0]].stamp + allTimeList[1][allTimeIndex[1]] + ':00'
      // console.log('stamp', stamp, new Date(stamp).getTime())

      btnPay.pay({
        that: this,
        // switchWay: this.data.switchWay,// 当前选择物流配送或自提
        extractTime: this.data.switchWay && this.data.switchWay == 'selfExtract' ? new Date(stamp).getTime() / 1000 : '',
        /**自提时间戳 */
        orderInfoKey: 'orderData',
        orderInfo: orderData,
        copyOrder: this.data.copyOrder,
        complete() {

        }
      })
    }
  },
  // 关闭支付弹框
  _closePopUp(e) {

  },
  // 创建订单成功时
  _creatOrder({
    detail
  }) {
    // console.log('_creatOrder', detail)
    // 设置通知数量
    const tabBar = this.selectComponent('#tabBar')
    // console.log(tabBar, this.data.orderData)
    this.setData({
      disabledSwitch1: true,
      orderData: detail
    }, () => {
      // console.log(this.data.orderData)
    })
    tabBar.getNoticeCount()
  },
  // 使用返利金额
  _confirmUseCashBack({
    detail
  }) {
    console.log(detail, 1)
    let [addressInfo, cartBilling, mailMethod] = [this.data.addressInfo, this.data.cartBilling, this.data.mailMethod]
    // 重新计算总金额=商品总金额:total + 代发服务费:t + 运费（运费在选择邮寄方式后计算）

    let total = parseFloat(cartBilling.ototal) // 原始商品总金额
    let ptotal = parseFloat(cartBilling.cancolfee) // 代发服务费商品总金额


    let t = parseFloat(addressInfo.serfee) > 0 ? Math.round(ptotal * parseFloat(addressInfo.serfee) * 1000 / 10) / 100 : 0
    let totalMoney = parseFloat(App.Util.accAdd(total, parseFloat(t)))
    /*  totalMoney = (mailMethod != {} && mailMethod.ruleItem && mailMethod.ruleItem.type && mailMethod.ruleItem.type == 1) ? App.Util.accAdd(totalMoney, parseFloat(mailMethod.ruleItem.fee)) : totalMoney */

    totalMoney = parseFloat(totalMoney) + parseFloat(this.data.gifttal)
    totalMoney = App.Util.Subtr(parseFloat(totalMoney), parseFloat(detail.cashback)) // 加上返现金额

    if (this.data.mailMethod.ruleItem) {
      let mailtype = this.data.mailMethod.ruleItem.type
      if (mailtype == 1) {
        totalMoney = parseFloat(totalMoney) + parseFloat(this.data.addressInfo.shipfee)
      }
    }

    this.setData({
      cashBackPopUp: false,
      'cartBilling.change_max_cashback': detail.cashback,
      totalMoney: parseFloat(totalMoney).toFixed(2)
    })
  },
  // // 打开支付方式弹框 \ 支付
  // openPopUp() {
  //   var payMethod = this.data.payMethod
  //   var popUp = this.data.popUp
  //   var that = this
  //   // 如果弹框未弹起时弹起弹框
  //   // 如果已经弹起则提交订单
  //   if (!popUp[0].isShow) {
  //     popUp[0].isShow = true
  //     popUp[1].isShow = true
  //     this.setData({
  //       popUp
  //     })

  //     this.sellerBalance()
  //   } else {
  //     // ====================================
  //     // 不存在订单时 创建订单
  //     // console.log(JSON.stringify(this.data.orderData) === '{}')
  //     if (JSON.stringify(this.data.orderData) === '{}') {
  //       this._creatOrder = new Promise((resolve) => {
  //         this.creatOrder({
  //           buytype: 1,
  //           success(res) {
  //             resolve(res)
  //           }
  //         })
  //       })
  //     }

  //     // 1余额支付
  //     if (payMethod.balance.select && !payMethod.dealer.select && !payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select) {
  //       if (JSON.stringify(this.data.orderData) === '{}') {
  //         this._creatOrder.then((res) => {
  //           wx.navigateTo({
  //             url: '/pages/mine/set/mobile_check?phone=' + this.data.userBaseInfo.u_mobi + '&pageType=orderPay' + '&orderInfo=' + JSON.stringify(res) + '&payType=balance',
  //           })
  //         })
  //       } else {
  //         let orderInfo = this.data.orderData
  //         wx.navigateTo({
  //           url: '/pages/mine/set/mobile_check?phone=' + this.data.userBaseInfo.u_mobi + '&pageType=orderPay' + '&orderInfo=' + JSON.stringify(orderInfo) + '&payType=balance',
  //         })
  //       }

  //       return
  //     }
  //     // 2提现金额支付
  //     if (!payMethod.balance.select && payMethod.dealer.select && !payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select) {
  //       if (JSON.stringify(this.data.orderData) === '{}') {
  //         this._creatOrder.then((res) => {
  //           wx.navigateTo({
  //             url: '/pages/mine/set/mobile_check?phone=' + this.data.userBaseInfo.u_mobi + '&pageType=orderPay' + '&orderInfo=' + JSON.stringify(res) + '&payType=dealer',
  //           })
  //         })
  //       } else {
  //         let orderInfo = this.data.orderData
  //         wx.navigateTo({
  //           url: '/pages/mine/set/mobile_check?phone=' + this.data.userBaseInfo.u_mobi + '&pageType=orderPay' + '&orderInfo=' + JSON.stringify(orderInfo) + '&payType=dealer',
  //         })
  //       }
  //       return
  //     }
  //     // 3余额+提现金额支付
  //     if (payMethod.balance.select && payMethod.dealer.select && !payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select) {
  //       if (JSON.stringify(this.data.orderData) === '{}') {
  //         this._creatOrder.then((res) => {
  //           wx.navigateTo({
  //             url: '/pages/mine/set/mobile_check?phone=' + this.data.userBaseInfo.u_mobi + '&pageType=orderPay' + '&orderInfo=' + JSON.stringify(res) + '&payType=balanceAndDealer',
  //           })
  //         })
  //       } else {
  //         let orderInfo = this.data.orderData
  //         wx.navigateTo({
  //           url: '/pages/mine/set/mobile_check?phone=' + this.data.userBaseInfo.u_mobi + '&pageType=orderPay' + '&orderInfo=' + JSON.stringify(orderInfo) + '&payType=balanceAndDealer',
  //         })
  //       }
  //       return
  //     }
  //     // 4余额+微信支付
  //     if (payMethod.balance.select && !payMethod.dealer.select && payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select) {
  //       if (JSON.stringify(this.data.orderData) === '{}') {
  //         this._creatOrder.then((res) => {
  //           // 获取支付信息
  //           App.Util.orderPay({
  //             order_sn: res.order_sn,
  //             baltype: [1],
  //             type: 1, // 微信支付
  //             success(r) {
  //               that.wechatPay(r)
  //             }
  //           })
  //         })
  //       } else {
  //         App.Util.orderPay({
  //           order_sn: this.data.orderData.order_sn,
  //           baltype: [1],
  //           type: 1, // 微信支付
  //           success(r) {
  //             that.wechatPay(r)
  //           }
  //         })
  //       }
  //       return
  //     }
  //     // 5提现金额+微信支付
  //     if (!payMethod.balance.select && payMethod.dealer.select && payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select) {
  //       if (JSON.stringify(this.data.orderData) === '{}') {
  //         this._creatOrder.then((res) => {
  //           // 获取支付信息
  //           App.Util.orderPay({
  //             order_sn: res.order_sn,
  //             baltype: [2],
  //             type: 1, // 微信支付
  //             success(r) {
  //               that.wechatPay(r)
  //             }
  //           })
  //         })
  //       } else {
  //         App.Util.orderPay({
  //           order_sn: this.data.orderData.order_sn,
  //           baltype: [2],
  //           type: 1, // 微信支付
  //           success(r) {
  //             that.wechatPay(r)
  //           }
  //         })
  //       }
  //       return
  //     }

  //     // 6余额+提现金额+微信支付
  //     if (payMethod.balance.select && payMethod.dealer.select && payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select) {
  //       if (JSON.stringify(this.data.orderData) === '{}') {
  //         this._creatOrder.then((res) => {
  //           // 获取支付信息
  //           App.Util.orderPay({
  //             order_sn: res.order_sn,
  //             baltype: [1,2],
  //             type: 1, // 微信支付
  //             success(r) {
  //               that.wechatPay(r)
  //             }
  //           })
  //         })
  //       } else {
  //         App.Util.orderPay({
  //           order_sn: this.data.orderData.order_sn,
  //           baltype: [1,2],
  //           type: 1, // 微信支付
  //           success(r) {
  //             that.wechatPay(r)
  //           }
  //         })
  //       }
  //       return
  //     }

  //     // 7微信支付
  //     if (!payMethod.balance.select && !payMethod.dealer.select && payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select) {
  //       // 如果未存在订单信息
  //       if (JSON.stringify(this.data.orderData) === '{}') {
  //         this._creatOrder.then((res) => {
  //           // 获取支付信息
  //           App.Util.orderPay({
  //             order_sn: res.order_sn,
  //             type: 1, // 微信支付
  //             success(r) {
  //               that.wechatPay(r)
  //             }
  //           })
  //         })
  //       } else {
  //         App.Util.orderPay({
  //           order_sn: this.data.orderData.order_sn,
  //           type: 1, // 微信支付
  //           success(r) {
  //             that.wechatPay(r)
  //           }
  //         })
  //       }
  //       return
  //     }
  //   }
  // },
  // // 关闭支付方式弹框显示
  // closePopUp(e) {
  //   var dataset = e.currentTarget.dataset
  //   var popUp = this.data.popUp
  //   if (dataset.type == 'outer') {
  //     popUp[0].isShow = false
  //     popUp[1].isShow = false
  //     this.setData({
  //       popUp
  //     })
  //   } else if (dataset.type == 'inner') {
  //     popUp[1].isShow = false
  //     this.setData({
  //       popUp
  //     })
  //   }

  // },
  // //查询用户余额  
  // sellerBalance() {
  //   var that = this
  //   var payMethod = this.data.payMethod
  //   App.Util.request({
  //     url: App.Api.sellerBalance,
  //     success(res) {
  //       if (res && res.data) {
  //         var data = res.data
  //         payMethod.balance.money = data.balance
  //         payMethod.dealer.money = data.dealer // 可提现金额
  //         that.setData({
  //           payMethod
  //         }, () => {
  //           setTimeout(() => {
  //             that.setRadio()
  //           }, 500)
  //         })

  //       }
  //     },
  //     fail() {

  //     }
  //   })
  // },
  // // 设置按钮默认勾选
  // setRadio() {
  //   var payMethodData = this.data.payMethod
  //   var total = parseFloat(this.data.cartBilling.total)
  //   var balance = parseFloat(payMethodData.balance.money)
  //   var dealer = parseFloat(payMethodData.dealer.money)
  //   // console.log(total, balance, dealer)

  //   if (balance >= total && dealer == 0) { // 余额大于total，提现金额为 0 时，余额勾选，其他禁用
  //     payMethodData.balance.select = true
  //     payMethodData.balance.select1 = false

  //     payMethodData.dealer.select = false
  //     payMethodData.dealer.select1 = true

  //     payMethodData.wechat.select = false
  //     payMethodData.wechat.select1 = true

  //     payMethodData.alipay.select = false
  //     payMethodData.alipay.select1 = true

  //     payMethodData.bankCard.select = false
  //     payMethodData.bankCard.select1 = true
  //   } else if (balance >= total && (dealer > 0 && dealer < total)) { // 余额大于total，提现金额大于0且小于total，余额勾选，提现金额可选，其他禁用
  //     payMethodData.balance.select = true
  //     payMethodData.balance.select1 = false

  //     payMethodData.dealer.select = false
  //     payMethodData.dealer.select1 = false

  //     payMethodData.wechat.select = false
  //     payMethodData.wechat.select1 = true

  //     payMethodData.alipay.select = false
  //     payMethodData.alipay.select1 = true

  //     payMethodData.bankCard.select = false
  //     payMethodData.bankCard.select1 = true
  //   } else if (balance >= total && dealer >= total) { // 余额大于total，提现金额大于total时，余额勾选，提现金额可选，其他禁用
  //     payMethodData.balance.select = true
  //     payMethodData.balance.select1 = false

  //     payMethodData.dealer.select = false
  //     payMethodData.dealer.select1 = false

  //     payMethodData.wechat.select = false
  //     payMethodData.wechat.select1 = true

  //     payMethodData.alipay.select = false
  //     payMethodData.alipay.select1 = true

  //     payMethodData.bankCard.select = false
  //     payMethodData.bankCard.select1 = true

  //   }
  //   // 余额小于total 且大于0
  //   else if ((0 < balance && balance < total) && dealer == 0) { // 余额小于total 且大于0， 提现金额为 0 时，余额默认勾选，提现金额禁用，其他可选
  //     payMethodData.balance.select = true
  //     payMethodData.balance.select1 = false

  //     payMethodData.dealer.select = false
  //     payMethodData.dealer.select1 = true

  //     payMethodData.wechat.select = true
  //     payMethodData.wechat.select1 = false

  //     payMethodData.alipay.select = false
  //     payMethodData.alipay.select1 = false

  //     payMethodData.bankCard.select = false
  //     payMethodData.bankCard.select1 = false
  //   } else if ((0 < balance && balance < total) && (0 < dealer && dealer < total)) { // 余额和提现金额都在0~total范围内
  //     // 余额+提现金额大于total 勾选两个 其他不勾选
  //     if (App.Util.accAdd(balance, dealer) >= total) {
  //       payMethodData.balance.select = true
  //       payMethodData.balance.select1 = false

  //       payMethodData.dealer.select = true
  //       payMethodData.dealer.select1 = false

  //       payMethodData.wechat.select = false
  //       payMethodData.wechat.select1 = true

  //       payMethodData.alipay.select = false
  //       payMethodData.alipay.select1 = true

  //       payMethodData.bankCard.select = false
  //       payMethodData.bankCard.select1 = true
  //     } else { // 余额+提现金额小于total 勾选两个 其他可选
  //       payMethodData.balance.select = true
  //       payMethodData.balance.select1 = false

  //       payMethodData.dealer.select = true
  //       payMethodData.dealer.select1 = false

  //       payMethodData.wechat.select = true
  //       payMethodData.wechat.select1 = false

  //       payMethodData.alipay.select = false
  //       payMethodData.alipay.select1 = false

  //       payMethodData.bankCard.select = false
  //       payMethodData.bankCard.select1 = false
  //     }

  //   } else if ((0 < balance && balance < total) && (dealer >= total)) { // 余额小于total 且大于0，提现金额大于total ，余额和提现金额可选 ，提现金额默认选上，其他禁用
  //     payMethodData.balance.select = false
  //     payMethodData.balance.select1 = false

  //     payMethodData.dealer.select = true
  //     payMethodData.dealer.select1 = false

  //     payMethodData.wechat.select = false
  //     payMethodData.wechat.select1 = true

  //     payMethodData.alipay.select = false
  //     payMethodData.alipay.select1 = true

  //     payMethodData.bankCard.select = false
  //     payMethodData.bankCard.select1 = true
  //   } else if (balance == 0 && dealer == 0) { // 余额和提现金额禁用 ，其他可选
  //     payMethodData.balance.select = false
  //     payMethodData.balance.select1 = true

  //     payMethodData.dealer.select = false
  //     payMethodData.dealer.select1 = true

  //     payMethodData.wechat.select = true
  //     payMethodData.wechat.select1 = false

  //     payMethodData.alipay.select = false
  //     payMethodData.alipay.select1 = false

  //     payMethodData.bankCard.select = false
  //     payMethodData.bankCard.select1 = false

  //   } else if (balance == 0 && (0 < dealer && dealer < total)) { // 余额为 0 ，余额禁用 ，提现金额默认选上，其他可选
  //     payMethodData.balance.select = false
  //     payMethodData.balance.select1 = true

  //     payMethodData.dealer.select = true
  //     payMethodData.dealer.select1 = false

  //     payMethodData.wechat.select = true
  //     payMethodData.wechat.select1 = false

  //     payMethodData.alipay.select = false
  //     payMethodData.alipay.select1 = false

  //     payMethodData.bankCard.select = false
  //     payMethodData.bankCard.select1 = false

  //   } else if (balance == 0 && dealer >= total) { //余额为0，余额禁用，提现金额大于total，勾选提现金额，其他都不勾选
  //     payMethodData.balance.select = false
  //     payMethodData.balance.select1 = true

  //     payMethodData.dealer.select = true
  //     payMethodData.dealer.select1 = false

  //     payMethodData.wechat.select = false
  //     payMethodData.wechat.select1 = true

  //     payMethodData.alipay.select = false
  //     payMethodData.alipay.select1 = true

  //     payMethodData.bankCard.select = false
  //     payMethodData.bankCard.select1 = true
  //   }
  //   // else if (0 < balance && balance < total && 0 < dealer &&  dealer < total) { // 余额小于total，提现金额小于total
  //   //   // 余额+提现金额大于total 勾选两个 其他不勾选
  //   //   if (App.Util.accAdd(balance, dealer) >= total) {
  //   //     payMethodData.balance.select = true
  //   //     payMethodData.balance.select1 = false

  //   //     payMethodData.dealer.select = true
  //   //     payMethodData.dealer.select1 = false

  //   //     payMethodData.wechat.select = false
  //   //     payMethodData.wechat.select1 = true

  //   //     payMethodData.alipay.select = false
  //   //     payMethodData.alipay.select1 = true

  //   //     payMethodData.bankCard.select = false
  //   //     payMethodData.bankCard.select1 = true
  //   //   } else {// 余额+提现金额小于total 勾选两个 其他可选
  //   //     payMethodData.balance.select = true
  //   //     payMethodData.balance.select1 = false

  //   //     payMethodData.dealer.select = true
  //   //     payMethodData.dealer.select1 = false

  //   //     payMethodData.wechat.select = true
  //   //     payMethodData.wechat.select1 = false

  //   //     payMethodData.alipay.select = false
  //   //     payMethodData.alipay.select1 = false

  //   //     payMethodData.bankCard.select = false
  //   //     payMethodData.bankCard.select1 = false
  //   //   }
  //   // } else if (0 < balance && balance < total && dealer == 0) { // 如果余额等于0 且 提现金额小于total，余额禁用 提现金额勾选 其他可选
  //   //   payMethodData.balance.select = true
  //   //   payMethodData.balance.select1 = false

  //   //   payMethodData.dealer.select = false
  //   //   payMethodData.dealer.select1 = true

  //   //   payMethodData.wechat.select = true
  //   //   payMethodData.wechat.select1 = false

  //   //   payMethodData.alipay.select = false
  //   //   payMethodData.alipay.select1 = false

  //   //   payMethodData.bankCard.select = false
  //   //   payMethodData.bankCard.select1 = false
  //   // } else if (balance == 0 && dealer == 0) {// 如果余额和微信都等于0 其他可选
  //   //   payMethodData.balance.select = false
  //   //   payMethodData.balance.select1 = true

  //   //   payMethodData.dealer.select = false
  //   //   payMethodData.dealer.select1 = true

  //   //   payMethodData.wechat.select = true
  //   //   payMethodData.wechat.select1 = false

  //   //   payMethodData.alipay.select = false
  //   //   payMethodData.alipay.select1 = false

  //   //   payMethodData.bankCard.select = false
  //   //   payMethodData.bankCard.select1 = false
  //   // } else if (balance == 0 && 0 < dealer && dealer < total) { // 如果余额等于0 且 提现金额小于total，余额禁用 提现金额勾选 其他可选
  //   //   payMethodData.balance.select = false
  //   //   payMethodData.balance.select1 = true

  //   //   payMethodData.dealer.select = true
  //   //   payMethodData.dealer.select1 = false

  //   //   payMethodData.wechat.select = true
  //   //   payMethodData.wechat.select1 = false

  //   //   payMethodData.alipay.select = false
  //   //   payMethodData.alipay.select1 = false

  //   //   payMethodData.bankCard.select = false
  //   //   payMethodData.bankCard.select1 = false
  //   // }
  //   this.setData({
  //     payMethod: payMethodData
  //   })
  // },
  // // 选择支付方式
  // selectPayMethod({
  //   currentTarget: {
  //     dataset
  //   }
  // }) {

  //   var payMethod = this.data.payMethod
  //   var methodData = payMethod[dataset.type]
  //   var total = parseFloat(this.data.cartBilling.total)
  //   var balance = parseFloat(payMethod.balance.money)
  //   var dealer = parseFloat(payMethod.dealer.money)
  //   console.log(total, balance, dealer)
  //   // 该支付方式为禁止点击 || 已经是点击状态 ： methodData.select
  //   if (methodData.select1) {
  //     return false
  //   }
  //   if (dataset.type == 'balance' || dataset.type == 'dealer') {

  //     if (balance >= total && dealer >= total) {

  //       if (dataset.type == 'balance') {
  //         payMethod.balance.select = !payMethod.balance.select
  //         if (payMethod.balance.select) { // 选中
  //           payMethod.balance.select = true
  //           payMethod.balance.select1 = false

  //           payMethod.dealer.select = false
  //           payMethod.dealer.select1 = false

  //           payMethod.wechat.select = false
  //           payMethod.wechat.select1 = true

  //           payMethod.alipay.select = false
  //           payMethod.alipay.select1 = true

  //           payMethod.bankCard.select = false
  //           payMethod.bankCard.select1 = true
  //         } else { // 取消选中
  //           payMethod.balance.select = false
  //           payMethod.balance.select1 = false

  //           payMethod.dealer.select = false
  //           payMethod.dealer.select1 = false

  //           payMethod.wechat.select = true
  //           payMethod.wechat.select1 = false

  //           payMethod.alipay.select = false
  //           payMethod.alipay.select1 = false

  //           payMethod.bankCard.select = false
  //           payMethod.bankCard.select1 = false
  //         }
  //       } else if (dataset.type == 'dealer') {
  //         payMethod.dealer.select = !payMethod.dealer.select
  //         if (payMethod.dealer.select) { // 选中
  //           payMethod.balance.select = false
  //           payMethod.balance.select1 = false

  //           payMethod.dealer.select = true
  //           payMethod.dealer.select1 = false

  //           payMethod.wechat.select = false
  //           payMethod.wechat.select1 = true

  //           payMethod.alipay.select = false
  //           payMethod.alipay.select1 = true

  //           payMethod.bankCard.select = false
  //           payMethod.bankCard.select1 = true
  //         } else { // 取消选中
  //           payMethod.balance.select = false
  //           payMethod.balance.select1 = false

  //           payMethod.dealer.select = false
  //           payMethod.dealer.select1 = false

  //           payMethod.wechat.select = true
  //           payMethod.wechat.select1 = false

  //           payMethod.alipay.select = false
  //           payMethod.alipay.select1 = false

  //           payMethod.bankCard.select = false
  //           payMethod.bankCard.select1 = false
  //         }
  //       }

  //     } else if (balance >= total && (dealer > 0 && dealer < total)) { // 只能选中其中一个，其中选择dealer，需要默认选择其他一种方式

  //       if (dataset.type == 'balance') {
  //         payMethod.balance.select = !payMethod.balance.select
  //         // 勾选余额
  //         if (payMethod.balance.select) { // 选中
  //           payMethod.balance.select = true
  //           payMethod.balance.select1 = false

  //           payMethod.dealer.select = false
  //           payMethod.dealer.select1 = false

  //           payMethod.wechat.select = false
  //           payMethod.wechat.select1 = true

  //           payMethod.alipay.select = false
  //           payMethod.alipay.select1 = true

  //           payMethod.bankCard.select = false
  //           payMethod.bankCard.select1 = true
  //         } else { // 未选中
  //           payMethod.balance.select = false
  //           payMethod.balance.select1 = false

  //           payMethod.dealer.select = true
  //           payMethod.dealer.select1 = false

  //           payMethod.wechat.select = true
  //           payMethod.wechat.select1 = false

  //           payMethod.alipay.select = false
  //           payMethod.alipay.select1 = false

  //           payMethod.bankCard.select = false
  //           payMethod.bankCard.select1 = false
  //         }
  //       } else if (dataset.type == 'dealer') {
  //         payMethod.dealer.select = !payMethod.dealer.select
  //         if (payMethod.dealer.select) { // 选中
  //           payMethod.balance.select = false
  //           payMethod.balance.select1 = false

  //           payMethod.dealer.select = true
  //           payMethod.dealer.select1 = false

  //           if (!payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select) {
  //             payMethod.wechat.select = true
  //             payMethod.wechat.select1 = false

  //             payMethod.alipay.select = false
  //             payMethod.alipay.select1 = false

  //             payMethod.bankCard.select = false
  //             payMethod.bankCard.select1 = false
  //           }
  //         } else { // 取消选中
  //           payMethod.balance.select = false
  //         }
  //       }
  //     } else if (balance >= total && dealer == 0) {
  //       payMethod.balance.select = !payMethod.balance.select
  //       if (payMethod.balance.select) { // 选中
  //         payMethod.wechat.select = false
  //         payMethod.wechat.select1 = true

  //         payMethod.alipay.select = false
  //         payMethod.alipay.select1 = true

  //         payMethod.bankCard.select = false
  //         payMethod.bankCard.select1 = true
  //       } else {
  //         payMethod.wechat.select = true
  //         payMethod.wechat.select1 = false

  //         payMethod.alipay.select = false
  //         payMethod.alipay.select1 = false

  //         payMethod.bankCard.select = false
  //         payMethod.bankCard.select1 = false
  //       }
  //     } else if ((balance > 0 && balance < total) && (dealer > 0 && dealer < total)) {

  //       if (dataset.type == 'balance') {
  //         payMethod.balance.select = !payMethod.balance.select
  //         if (payMethod.balance.select) { // 余额选中
  //           payMethod.balance.select = true

  //           if (payMethod.dealer.select) { // 提现金额选中
  //             if (App.Util.accAdd(balance, dealer) >= total) {
  //               payMethod.wechat.select = false
  //               payMethod.wechat.select1 = true

  //               payMethod.alipay.select = false
  //               payMethod.alipay.select1 = true

  //               payMethod.bankCard.select = false
  //               payMethod.bankCard.select1 = true
  //             }
  //           }
  //         } else { // 取消选中
  //           payMethod.balance.select = false

  //           if (!payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select) {
  //             payMethod.wechat.select = true
  //             payMethod.wechat.select1 = false

  //             payMethod.alipay.select = false
  //             payMethod.alipay.select1 = false

  //             payMethod.bankCard.select = false
  //             payMethod.bankCard.select1 = false
  //           }
  //         }
  //         // if (payMethod.balance.select && payMethod.dealer.select) {// 余额和提现金额原本是点击状态，允许其中一方可以取消
  //         //   payMethod.balance.select = false

  //         //   payMethod.wechat.select = true
  //         //   payMethod.wechat.select1 = false

  //         //   payMethod.alipay.select = false
  //         //   payMethod.alipay.select1 = false

  //         //   payMethod.bankCard.select = false
  //         //   payMethod.bankCard.select1 = false
  //         // } else if (!payMethod.balance.select) {
  //         //   payMethod.balance.select = true

  //         //   if (App.Util.accAdd(balance, dealer) >= total) {
  //         //     payMethod.wechat.select = false
  //         //     payMethod.wechat.select1 = true

  //         //     payMethod.alipay.select = false
  //         //     payMethod.alipay.select1 = true

  //         //     payMethod.bankCard.select = false
  //         //     payMethod.bankCard.select1 = true
  //         //   }

  //         // }
  //       } else if (dataset.type == 'dealer') {
  //         payMethod.dealer.select = !payMethod.dealer.select
  //         if (payMethod.dealer.select) { // 余额选中
  //           payMethod.dealer.select = true

  //           if (payMethod.balance.select) { // 提现金额选中
  //             if (App.Util.accAdd(balance, dealer) >= total) {
  //               payMethod.wechat.select = false
  //               payMethod.wechat.select1 = true

  //               payMethod.alipay.select = false
  //               payMethod.alipay.select1 = true

  //               payMethod.bankCard.select = false
  //               payMethod.bankCard.select1 = true
  //             }
  //           }
  //         } else { // 取消选中
  //           payMethod.dealer.select = false

  //           if (!payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select) {
  //             payMethod.wechat.select = true
  //             payMethod.wechat.select1 = false

  //             payMethod.alipay.select = false
  //             payMethod.alipay.select1 = false

  //             payMethod.bankCard.select = false
  //             payMethod.bankCard.select1 = false
  //           }

  //         }
  //         // if (payMethod.balance.select && payMethod.dealer.select) {// 余额和提现金额原本是点击状态，允许其中一方可以取消
  //         //   payMethod.dealer.select = false

  //         //   payMethod.wechat.select = true
  //         //   payMethod.wechat.select1 = false

  //         //   payMethod.alipay.select = false
  //         //   payMethod.alipay.select1 = false

  //         //   payMethod.bankCard.select = false
  //         //   payMethod.bankCard.select1 = false
  //         // } else if (!payMethod.dealer.select) {
  //         //   payMethod.dealer.select = true
  //         //   if (App.Util.accAdd(balance, dealer) >= total) {
  //         //     payMethod.wechat.select = false
  //         //     payMethod.wechat.select1 = true

  //         //     payMethod.alipay.select = false
  //         //     payMethod.alipay.select1 = true

  //         //     payMethod.bankCard.select = false
  //         //     payMethod.bankCard.select1 = true
  //         //   }
  //         // }
  //       }

  //     } else if ((balance > 0 && balance < total) && dealer >= total) {
  //       if (dataset.type == 'balance') {
  //         payMethod.balance.select = !payMethod.balance.select
  //         if (payMethod.balance.select) { // 选中
  //           payMethod.balance.select = true
  //           payMethod.balance.select1 = false

  //           payMethod.dealer.select = false
  //           payMethod.dealer.select1 = false

  //           if (!payMethod.wechat.select && !payMethod.alipay.select && !payMethod.bankCard.select) {
  //             payMethod.wechat.select = true
  //             payMethod.wechat.select1 = false

  //             payMethod.alipay.select = false
  //             payMethod.alipay.select1 = false

  //             payMethod.bankCard.select = false
  //             payMethod.bankCard.select1 = false
  //           }
  //         } else { //取消选中
  //           payMethod.balance.select = false
  //         }
  //       } else if (dataset.type == 'dealer') {
  //         payMethod.dealer.select = !payMethod.dealer.select
  //         if (payMethod.dealer.select) { // 选中
  //           payMethod.balance.select = false
  //           payMethod.balance.select1 = false

  //           payMethod.dealer.select = true
  //           payMethod.dealer.select1 = false

  //           payMethod.wechat.select = false
  //           payMethod.wechat.select1 = true

  //           payMethod.alipay.select = false
  //           payMethod.alipay.select1 = true

  //           payMethod.bankCard.select = false
  //           payMethod.bankCard.select1 = true
  //         } else { //取消选中
  //           payMethod.balance.select = true
  //           payMethod.balance.select1 = false

  //           payMethod.dealer.select = false
  //           payMethod.dealer.select1 = false

  //           payMethod.wechat.select = true
  //           payMethod.wechat.select1 = false

  //           payMethod.alipay.select = false
  //           payMethod.alipay.select1 = false

  //           payMethod.bankCard.select = false
  //           payMethod.bankCard.select1 = false
  //         }
  //       }
  //     } else if ((balance > 0 && balance < total) && dealer == 0) {
  //       payMethod.balance.select = !payMethod.balance.select
  //     } else if (balance == 0 && (dealer > 0 && dealer < total)) {
  //       payMethod.dealer.select = !payMethod.dealer.select
  //     } else if (balance == 0 && dealer >= total) {
  //       payMethod.dealer.select = !payMethod.dealer.select
  //       if (payMethod.dealer.select) { // 选中
  //         payMethod.wechat.select = false
  //         payMethod.wechat.select1 = true

  //         payMethod.alipay.select = false
  //         payMethod.alipay.select1 = true

  //         payMethod.bankCard.select = false
  //         payMethod.bankCard.select1 = true
  //       } else {
  //         payMethod.wechat.select = true
  //         payMethod.wechat.select1 = false

  //         payMethod.alipay.select = false
  //         payMethod.alipay.select1 = false

  //         payMethod.bankCard.select = false
  //         payMethod.bankCard.select1 = false
  //       }
  //     }
  //   }

  //   // if (dataset.type == 'balance') {

  //   //   if (balance >= total) {

  //   //     if() {
  //   //       payMethod.balance.select = !payMethod.balance.select
  //   //       // 如果提现金额没被禁止
  //   //       if (!payMethod.dealer.select1) {
  //   //         payMethod.dealer.select = !payMethod.dealer.select
  //   //       }
  //   //     }

  //   //   } else if (balance > 0 && balance < total) {
  //   //     payMethod.balance.select = !payMethod.balance.select
  //   //   }
  //   //   payMethod.balance.select1 = false
  //   //   // 余额不足total
  //   //   if (balance > 0 && balance < total) {
  //   //     payMethod.wechat.select = true
  //   //     payMethod.wechat.select1 = false

  //   //     payMethod.alipay.select = false
  //   //     payMethod.alipay.select1 = false

  //   //     payMethod.bankCard.select = false
  //   //     payMethod.bankCard.select1 = false
  //   //   } else {// 余额大于total
  //   //     payMethod.wechat.select = false
  //   //     payMethod.wechat.select1 = true

  //   //     payMethod.alipay.select = false
  //   //     payMethod.alipay.select1 = true

  //   //     payMethod.bankCard.select = false
  //   //     payMethod.bankCard.select1 = true
  //   //   }
  //   // } else 
  //   // if (dataset.type == 'dealer') {
  //   //   if (dealer >= total) {
  //   //     // 如果余额没被禁止或者没勾选上
  //   //     if (!payMethod.balance.select1 || payMethod.balance.select) {
  //   //       payMethod.balance.select = false
  //   //     }
  //   //     payMethod.dealer.select = true


  //   //   } else if (dealer > 0 && dealer < total) {
  //   //     payMethod.dealer.select = !payMethod.dealer.select
  //   //   }
  //   //   payMethod.dealer.select1 = false
  //   //   // 余额不足total
  //   //   if (dealer > 0 && dealer < total) {
  //   //     payMethod.wechat.select = true
  //   //     payMethod.wechat.select1 = false

  //   //     payMethod.alipay.select = false
  //   //     payMethod.alipay.select1 = false

  //   //     payMethod.bankCard.select = false
  //   //     payMethod.bankCard.select1 = false
  //   //   }
  //   // } 
  //   else
  //   if (dataset.type == 'wechat' && !methodData.select) {
  //     payMethod.wechat.select = true
  //     payMethod.wechat.select1 = false

  //     payMethod.alipay.select = false
  //     payMethod.alipay.select1 = false

  //     payMethod.bankCard.select = false
  //     payMethod.bankCard.select1 = false
  //   } else if (dataset.type == 'alipay' && !methodData.select) {
  //     payMethod.wechat.select = false
  //     payMethod.wechat.select1 = false

  //     payMethod.alipay.select = true
  //     payMethod.alipay.select1 = false

  //     payMethod.bankCard.select = false
  //     payMethod.bankCard.select1 = false
  //   } else if (dataset.type == 'bankCard' && !methodData.select) {
  //     payMethod.wechat.select = false
  //     payMethod.wechat.select1 = false

  //     payMethod.alipay.select = false
  //     payMethod.alipay.select1 = false

  //     payMethod.bankCard.select = true
  //     payMethod.bankCard.select1 = false
  //   }
  //   this.setData({
  //     payMethod
  //   })
  // },
  // // 创建订单
  // creatOrder(options) {
  //   options = options || {}
  //   var addressInfo = this.data.addressInfo // 地址等信息
  //   var cartBilling = this.data.cartBilling // 购物车金额
  //   var parentid = wx.getStorageSync('globalData').userInfo.parentId
  //   var goods = this.data.cartList // 购物车商品
  //   var ids = this.data.ids
  //   var props = this.data.props
  //   var that = this
  //   App.Util.showToast('正在创建订单...')
  //   App.Util.request({
  //     url: App.Api.sellerCreateOrder,
  //     data: {
  //       shopid: parentid,
  //       ids: JSON.stringify(ids),
  //       props: JSON.stringify(props),
  //       buytype: options.buytype,
  //       address: addressInfo.id,
  //       shiptype: 3,
  //       cash: 0, // 
  //       devtype: 0,
  //       gift: [],
  //     },
  //     method: 'POST',
  //     success(res) {
  //       wx.hideToast()
  //       // 订单信息
  //       that.setData({
  //         orderData: res.data
  //       })
  //       options.success && options.success(res.data)
  //     },
  //     fail(res) {
  //       wx.hideToast()
  //       App.Util.showToast(res.data.msg || '创建订单失败！')
  //       options.fail && options.fail()
  //     },
  //     complete() {

  //     }
  //   })
  // },

  // // 微信支付
  // wechatPay(data) {
  //   console.log(data)
  //   wx.requestPayment({
  //     timeStamp: data.timeStamp,
  //     nonceStr: data.nonceStr,
  //     signType: data.signType || "MD5",
  //     package: data.package,
  //     paySign: data.paySign,
  //     success(res) {
  //       console.log("wechatPay", res)

  //       $Message({
  //         content: '支付成功！',
  //         type: 'default',
  //         callback() {
  //           wx.switchTab({
  //             url: '/pages/inventory/inventory',
  //             success(e) {
  //               // var page = getCurrentPages().pop();
  //               // console.log(e, page,1, page.onLoad, 2,page.getInventoryList)
  //               // if (page == undefined || page == null) return;
  //               // page.onLoad();
  //               // page.getInventoryList('refresh');
  //             }
  //           })
  //         }
  //       });
  //     },
  //     fail(res) {
  //       console.log(res, res.errMsg, res.errMsg === "requestPayment:fail cancel")
  //       if (res.errMsg === "requestPayment:fail cancel") {
  //         $Message({
  //           content: '取消支付',
  //           type: 'default',
  //         })
  //       }else {
  //         $Message({
  //           content: res.errMsg || '微信支付失败！',
  //           type: 'error',
  //           // duration: 1.5,
  //           callback() {
  //             wx.switchTab({
  //               url: '/pages/home/home',
  //             })
  //           }
  //         });
  //       }
  //     }
  //   })
  // },
  // // 获取用户基础信息（手机号）
  // getUserCenter() {
  //   var that = this
  //   App.Util.request({
  //     url: App.Api.getUserCenter,
  //     data: {},
  //     success(res) {
  //       // console.log('getUserCenter=', res)
  //       that.setData({
  //         userBaseInfo: res.data
  //       })
  //     },
  //     fail(res) {
  //       App.Util.showToast(res.data.msg || '获取用户基础信息失败！')

  //     }
  //   })
  // },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(options) {

    this.getAllTimeData()

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

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