// component/order/returnOrderType/index.js
Component({
  externalClasses: ['order-class'],
  /**
   * 组件的属性列表
   */
  properties: {
    type: { // 订单状态
      type: Number,
      observer(n, o) {
        this.setData({
          type: n
        })
      }
    },
    opid: {
      type: Number,
      observer(n, o) {
        this.setData({
          opid: n
        })
      }
    },
    shopid: {
      type: Number,
      observer(n, o) {
        this.setData({
          shopid: n
        })
      }
    },
    sytype: {
      type: Number,
      observer(n, o) {
        this.setData({
          sytype: n
        })
      }
    },
    uid: {
      type: Number,
      observer(n, o) {
        this.setData({
          uid: n
        })
      }
    },
    orderType:Number, // 订单类型 零售订单：2
  },

  /**
   * 组件的初始数据
   */
  data: {
    orderStatus: { // 批发订单状态
      "1": "待付款",
      "2": "待发货",
      "3": "已完成",
      "4": "退款中",
      "5": "待评价",
      "6": "已完成",
      "7": "已关闭",
      "8": "转账单号审核中",
      //"9": "转账单号审核成功",
      "10": "转账单号审核失败",
      "11": "付款审核中"

    },
    syncStatus: {
      "1": "仓库未审核",
      "2": "仓库审核中",
      "3": "仓库备货中"

    },
    lingsOrderStatus: { // 零售订单状态
      "1": "待付款",
      "8": "待审核",
      "2": "待发货",
      "3": "待收货",
      "4": "退款中",
      "5": "待评价",
      "6": "已完成",
      "7": "已关闭",
      "9": "待成团",
      "10": "拼团失败，待退款",
      "11": "拼团成功，待发货"
    },
    opid: 0,
    shopid: 0,
    type: 0,
    sytype: 0,
    uid: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})