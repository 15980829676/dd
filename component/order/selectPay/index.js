// component/order/selectPay/index.js
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
    visiable:{
      type: Boolean,
      value: false,
      observer(n,o) {
        if(n) {
          // this.anim(this.data.tabBarH)
          this.getUserBaseInfo()
        }
      }
    },
    money: { // 当前用户输入的充值金额
      type: Number,
      value: '0.00',
    },
    wallet: { // 当前用户资产
      type: Object,
      value: '0.00',
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tabBarH: 50,
    animation: {},
    userBaseInfo: {}, // 用户基本信息
    payType: 'wechat',
    payMethod:{ // 支付方式
      wechat: {
        name: '微信支付',
        icon:'/images/method-4.svg',
        select: true,
        index: 0,
        type: 1, //支付类型
      },
      alipay: {
        name: '支付宝',
        icon: '/images/method-5.svg',
        select: false,
        index: 1
      },
      linePay: {
        name: '线下支付',
        icon: '/images/icon-linePay.svg',
        select: false,
        index: 2
      },
      dealer: {
        name: '可提现余额支付',
        icon: '/images/method-3.svg',
        select: false,
        index: 3
      }
    },
    modalData: [ // 手机号未绑定提示弹框信息
      {
        name: '取消',
        color: '#8B8B8B',
        fontSize: '24rpx'
      },
      {
        name: '确定',
        color: '#4DA1FF',
        fontSize: '24rpx'
      }
    ],
    visibleModal: false, // 是否显示手机号弹框
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
      // this.anim('-100%', () => {
      //   this.setData({
      //     visiable: false
      //   })
      // })
    },
    anim(bottom,complete) {
      let animat = wx.createAnimation({
        duration: 400,
      })
      animat.bottom(bottom).step()
      this.setData({
        animation: animat.export()
      },() => {
        setTimeout(() => {
          complete && complete()
        },400)
      })
    },
    // 选择支付方式
    selectPayMethod(e) {
      let {type,index} = e.currentTarget.dataset
      let { payMethod, wallet,userBaseInfo} = this.data
      // 如果类型是提现金额 且 提现金额小于0
      if (type == 'dealer' && wallet.df_money <= 0) {
        return 
      }
      // 点击提现金额时，判断手机号为空或者为0时，前往绑定手机号
      if (type == 'dealer' && !userBaseInfo.u_mobi || userBaseInfo.u_mobi == 0) {
        this.setData({
          visibleModal: true
        })
        return
      }
      for (var i in payMethod){
        // if (index != payMethod[i].index) {// 改变除点击的支付方式外的其他支付方式按钮状态
          payMethod[i].select = false
        // }
      }
      payMethod[type].select = !payMethod[type].select
      this.setData({
        payType: type,
        payMethod
      },() => {
        this.triggerEvent('selectPayMethod', payMethod)
      })
    },
    // 确定
    submit() {
      let payMethod = this.data.payMethod,
        payType = this.data.payType,
        mobil = this.data.userBaseInfo.u_mobi

      let payData= payMethod[payType]
      if (!payData.select) {
        $Message({
          content: '请选择支付方式！',
          type: 'default'
        });
        return
      }
      this.triggerEvent('submit', { payMethod, payType,mobil})
    },
    // 获取用户基础信息（手机号）
    getUserBaseInfo(options) {
      options = options || {}
      var that = this
      App.Util.getUserCenter({
        success(res) {
          console.log('获取用户基础信息（手机号）', res)
          that.setData({
            userBaseInfo: res.data
          })
          options.success && options.success()
        }, fail() {
          options.fail && options.fail()
        }, complete() {
          options.complete && options.complete()
        }
      })
    },
    // 前往绑定手机号
    handleModal({
      detail: {
        index
      }
    }) {
      if (index == 1) {
        wx.navigateTo({
          url: '/pages/mine/set/set_mobile',
        })
      }
      this.setData({
        visibleModal: false
      })
    },
  }
})
