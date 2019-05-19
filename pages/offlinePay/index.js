// pages/offline payment/offline payment.js
const { $Message, $Toast } = require('../../dist/base/index.js'), App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    payInfo: {}, // 支付信息
    visiable1: false, // 是否显示支付弹框
    animation1: '' , // 支付方式动画
    payMethod: [], // 支付方式
    tempFilePaths: [], // 图片临时文件路径
    visibleModal1: false,
    modalData1: [ // 
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /**
     * options:{Object}
     * payType:支付类型 线下支付/支付宝支付
     * order_id:订单id
     * order_sn:订单号
     * money:订单金额
     * baltype：1,2 余额或提现
     */
    // options = {
    // payType = linePay & order_sn=1904091745353316 & money=38.5 & baltype=1 & order_id=111
    // }
    if (options != {}) {
      
      let navBarTitle = ''
      if (options.payType == 'linePay') {
        navBarTitle = '线下支付'
      } else if (options.payType == 'Alipay') {
        navBarTitle = '支付宝线下转账'
      }
      wx.setNavigationBarTitle({
        title: navBarTitle,
      })
      let userInfo = wx.getStorageSync('globalData').userInfo
      this.setData({
        userInfo,
        'payInfo.payType': options.payType,
        'payInfo.orderSn': options.order_sn,
        'payInfo.orderId': options.order_id,
        'payInfo.orderMoney': options.money,
        'payInfo.baltype': options.baltype,
        'payInfo.pageType': options.pageType || '', // 页面类型：充值 recharge
      })
    }
    this.getPayMent()
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
  // 获取支付方式
  getPayMent() {
    let that = this
    this._getPayMent = new Promise((resolve, reject)=>{
      App.Util.request({
        url: App.Api.linePayMent,
        success(res) {
          let payMethod = JSON.parse(res.data)
          payMethod.forEach((item, index) => {
            item.select = false
            item.icon = App.Util.buildImageUrl(item.icon)
          })
          that.setData({
            payMethod
          })
          resolve()
        },
        fail() {},
        complete() {}
      })
      console.log()
    })
    // let payMethod = [
    //   { id: "1", payname: "微信", icon: "paywayicon/07/f2/07f2aaf94a927339.png", status: "1", },
    //   { id: "2", payname: "余额", icon: "paywayicon/15/ce/15cecad4858fad8a.png", status: "1", },
    //   { id: "3", payname: "支付宝", icon: "paywayicon/9c/8f/9c8f9972ad7654b7.png", status: "1", },
    //   { id: "4", payname: "银联", icon: "paywayicon/98/33/98333452fd547c70.png", status: "1", }
    // ]
    
  },
  // 拉起支付方式
  openPayMent() {
    this.setData({
      visiable1: true,
    },() => {
      // let animation1 = wx.createAnimation({
      //   duration: 500,
      //   timingFunction: "linear",
      // });
      // animation1.bottom(0).step();
      // this.setData({
      //   animation1: animation1.export()
      // });
    })
    
  },
  closePayMent(){
    // let animation1 = wx.createAnimation({
    //   duration: 500,
    //   timingFunction: "linear",
    // });
    // animation1.bottom('-100%').step();
    // this.setData({
    //   animation1: animation1.export()
    // }, () => {
      this.setData({
        visiable1: false,
      })
    // });
  },
  // 选择支付方式
  selectPayMethod(e) {
    let { id } = e.currentTarget.dataset,
      payMethod = this.data.payMethod,
      payInfo = this.data.payInfo
    payMethod.forEach((item,index) => {
      if(item.Id == id) {
        item.select = true
        payInfo.bank = item.payname // 名称
        payInfo.account_sn = item.account_sn // 账号
        payInfo.bankid = item.Id 
      }else {
        item.select = false
      }
    })
    this.closePayMent()
    this.setData({
      payMethod,
      payInfo
    })
  },
  // 输入转账单号和金额
  input(e) {
    // console.log(e)
    let name = e.currentTarget.dataset.name,
      value = e.detail.value,
      payInfo = this.data.payInfo
    payInfo[name] = value
    this.setData({
      payInfo
    })
  },
  blur(e) {
    let name = e.currentTarget.dataset.name,
      value = e.detail.value,
      payInfo = this.data.payInfo
    // 转账金额
    if (name == "transferMoney" && value) {
      payInfo[name] = parseFloat(value).toFixed(2)
    }
    this.setData({
      payInfo
    })
  },
  move() {},
  // 获取临时图片
  _handlePicture(e) {
    console.log(e)
    let { tempFilePaths } = e.detail
    this.setData({
      tempFilePaths
    })
  },
  handleModal1(e) {
    let index = e.detail.index,
      payInfo = this.data.payInfo,
      that = this

    this.setData({
      visibleModal1: false
    })
    if (index == 1) { // 支付
      $Toast({
        content: "正在提交...",
        duration: 0,
        type: 'loading'
      })

      // 获取上传后的全部图片路径，再执行表单提交
      let addPicture = this.selectComponent("#addPicture");
      addPicture.uploadPicture({
        success(res) {
          console.log('getPicArr', res)
          that.linePay(res)
        }
      })
    }
  },
  // 提交
  submitPayInfo() {
    let { payInfo, payMethod,tempFilePaths} = this.data
      , payMentId = payInfo.bankid||'',
      that = this

    // 如果是线下支付s
    if (payInfo.payType == 'linePay' && !payMentId) {
      $Message({
        content: "请选择支付方式",
        type: 'default'
      })
      return
    }
    // 线下支付的单号是选填的
    if (payInfo.payType == 'Alipay') {
      if (!payInfo.transferOrderSn) {
        $Message({
          content: "请输入转账单号",
          type: 'default'
        })
        return
      }
      if (payInfo.transferOrderSn.length != 32) {
        $Message({
          content: "请输入正确的转账单号",
          type: 'default'
        })
        return
      }
    }

    if (!payInfo.transferMoney) {
      $Message({
        content: "请输入转账金额",
        type: 'default'
      })
      return
    }
    
    if (tempFilePaths.length <= 0) {
      $Message({
        content: "请上传凭据照片",
        type: 'default'
      })
      return
    }
    // 如果订单金额和转账金额不对，要提示
    if (parseFloat(payInfo.transferMoney) != parseFloat(payInfo.orderMoney)) {
      this.setData({
        visibleModal1: true
      })
      return
    }
    $Toast({
      content: "正在提交...",
      duration: 0,
      type: 'loading'
    })

    // 获取上传后的全部图片路径，再执行表单提交
    let addPicture = this.selectComponent("#addPicture");
    addPicture.uploadPicture({
      success(res) {
        console.log('getPicArr', res)
        that.linePay(res)
      }
    })
    
  },
  // 线下支付
  linePay(data) {
    // 11111111111111111111111111111111
    let payInfo = this.data.payInfo
    let params = {
      baltype: payInfo.baltype, // 余额提现类型 1 || 2 || 1,2 || undefinde
      sn: payInfo.orderId, // 订单id
      danhao: payInfo.transferOrderSn, // 输入的单号
      money: payInfo.transferMoney, // 转账金额
      imgurl: JSON.stringify(data), // 图片字符串（base64）
    }
    if (payInfo.payType == 'Alipay') {
      // 充值状态9
      params.type = payInfo.pageType == 'recharge'? 9 : 1
      params.bank = '支付宝线下转账' // 选择支付方式的文字
    } else if (payInfo.payType == 'linePay') {
      params.type = 9
      params.bankid = payInfo.bankid // 选择支付方式的id
      params.bank = payInfo.bank // 选择支付方式的文字
    }
    // 充值
    if (payInfo.pageType && payInfo.pageType == 'recharge') {
      this.sub(App.Api.linepayRecharge, params,() => {
        wx.redirectTo({
          url: '/pages/mine/wallet/recharge/rechargeResult?money=' + payInfo.transferMoney + '&result=success',
        })
      },() => {
        wx.navigateTo({
          url: '/pages/mine/wallet/recharge/rechargeResult?money=' + payInfo.transferMoney + '&result=fail',
        })
      })
    }else { // 购买
      let { userInfo,payInfo } = this.data
      this.sub(App.Api.sellerLinePay, params, () => {
        // wx.switchTab({
        //   url: '/pages/home/home',
        // })
        wx.reLaunch({
          url: "/pages/team/orderInformation?userId=" + userInfo.u_id + "&shopId=" + userInfo.shopId + "&orderId=" + payInfo.orderId + '&orderType=stock&opid=' + userInfo.u_id
        })
      },(res) => {
        $Message({
          content: res.data.msg || "提交失败",
          type: 'default',
          callback() {
            // wx.reLaunch({
            //   url: "/pages/team/orderInformation?userId=" + userInfo.u_id + "&shopId=" + userInfo.shopId + "&orderId=" + payInfo.orderId + '&orderType=stock&opid=' + userInfo.u_id
            // })
          }
        })
      })
    }
    
  },
  sub(url, params,success,fail) {
    App.Util.request({
      url: url,
      data: params,
      method: "POST",
      success(res) {
        $Message({
          content: "提交成功",
          type: 'default',
          callback() {
            success && success()
          }
        })
        $Toast.hide()
      },
      fail(res) {
        $Toast.hide()
        if (fail) {
          fail && fail(res)
          return
        }
        $Message({
          content: res.data.msg || "提交失败",
          type: 'default',
        })
       
      }
    })
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

  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})