// component/order/cashBack/index.js
var App = getApp();
const {
  $Message,
  $Toast
} = require('../../../dist/base/index.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visiable: {
      type: Boolean,
      value: false,
      observer(n) {
        // console.log(n)
        // if (parseFloat(this.data.cartInfo.max_cashback) > 0) {
        //   this.setData({
        //     isNotUse: false
        //   })
        // }
      }
    },
    cartInfo: {
      type: Object,
      value: {},
      observer(n,o) {
      }
    },
    isNotUse: {// 是否不使用
      type: Boolean,
      value: true,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tabBarH: 50,
  },
  attached() {
    this.setData({
      tabBarH: App.Util.checkPhoneType()
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    move() {},
    closePopUp() {
      this.setData({
        visiable: false
      })
    },
    // 使用返利金额
    selectCashBack() {
      let isNotUse = this.data.isNotUse,
        cartInfo = this.data.cartInfo

      this.setData({
        isNotUse: !isNotUse
      })
    },
    input(e) {
      this.setData({
        'cartInfo.change_max_cashback': e.detail.value
      })
    },
    // 获取焦点
    focus() {
      this.setData({
        isNotUse: false
      })
    },
    // 全部使用
    allUse() {
      this.setData({
        'cartInfo.change_max_cashback': this.data.cartInfo.max_cashback,
        isNotUse: false
      })
    },
    // 确定
    confirm() {
      let change_max_cashback = parseFloat(this.data.cartInfo.change_max_cashback) // 输入的使用金额
      let max_cashback = parseFloat(this.data.cartInfo.max_cashback) // 最大可使用金额
      let isUse = false
      // 如果是不使用，清零
      if(this.data.isNotUse) {
        change_max_cashback = '0.00'
        this.setData({
          visiable: false
        })

      }else {
        isUse = true
        if (isNaN(change_max_cashback) || change_max_cashback.toFixed(2) < 0) {
          this.setData({
            'cartInfo.change_max_cashback': '0.00'
          })
        }
        if (parseFloat(change_max_cashback) > parseFloat(max_cashback)) {
          App.Util.showToast('用户输入的抵扣金额不能大于可使用金额')
          change_max_cashback = max_cashback
        }
      }
      
      this.triggerEvent('confirmUseCashBack',{
        use: isUse,
        cashback: parseFloat(change_max_cashback).toFixed(2)
      })
    }
  }
})
