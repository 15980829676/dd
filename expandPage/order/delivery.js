// expandPage/order/delivery.js
const App = getApp();
const {
  $Toast,
  $Message
} = require('../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: {},
    exptype: [{ name: '普通快递', id: 1 }, { name: '无需快递', id: 3 }],
    expressList: [{ name: '优速快递', id: 9}, { name: '顺丰快递', id: 1}, { name: '圆通快递', id: 2}, { name: '申通快递', id: 3}, { name: '百世快递', id: 4}, { name: '天天快递', id: 5}, { name: '中通快递', id: 6}, { name: 'EMS', id: 7}, { name: '其他',id: 8}],
    isShowDeliveryPopup: false , // 是否显示发货快递弹框
    formData: {}, // 表单信息
    tabBarH: 50,
    animation1:{},
    visible1: false,// 出货提示框
    visible2: false,// 扫描提示框
    modalData:[
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
    ]
  },
  move(){},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options
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
  // 快递切换
  handleExpressChange(e) {
    let {id} = e.currentTarget.dataset
    this.setData({
      // current: value
      "formData.exptype": id
    })
   },
  // 打开发货快递弹框
  openDeliveryPopup() {
    
    this.setData({
      isShowDeliveryPopup: true
    },() => {
      let animation1 = wx.createAnimation({
        duration: 500,
        timingFunction: "ease",
        delay: 0
      });
      animation1.translateY(0).step()
      this.setData({
        animation1: animation1.export(),
      })
    })
  },
  // 关闭发货快递弹框
  closeDeliveryPopup({currentTarget:{dataset}}) {
    let { type, id ,name } = dataset,
      formData = this.data.formData
    if (type && type == 'select') {
      formData.expid = id
      formData.expname = name
    }
    let animation1 = wx.createAnimation({
      duration: 500,
      timingFunction: "ease",
      delay: 0
    });
    animation1.translateY('100%').step()
      
    this.setData({
      formData,
      animation1: animation1.export(),
      isShowDeliveryPopup: false
    })
    
  },
  // 输入快递单号
  inputExpSn(e) {
    this.setData({
      'formData.expsn': e.detail.value
    })
  },
  // 扫码按钮
  delivery() {
    this.setData({
      visible2: true
    })

  },
  handleClose2({ detail: { index } }) {
    this.setData({
      visible2: false
    })
    if (index == 1) {
      this.scanCode()
    }
  },
  // 发货-扫码
  scanCode() {
    let that = this
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['barCode', 'pdf417'], // 'datamatrix','qrCode'(二维码) 扫二维码path才有返回值
      success(res) {
        console.log("scanCode success", res)
        if (that.stopQrCode(res.scanType)) {
          $Message({
            content: '请扫描条形码',
            type: 'default'
          });
          return
        }
        that.setData({
          'formData.expsn': res.result
        })
      }
    })
  },
  stopQrCode(code) {
    switch (code) {
      case "QR_CODE": return true
      case "DATA_MATRIX": return true
      case "PDF_417": return true
      case "WX_CODE": return true
    }
  },
  // 出货按钮
  handleOpen(){
    let { exptype, expid, expname, expsn } = this.data.formData
    if (!exptype) {
      $Message({
        content: '请选择类型',
        type: 'default'
      });
      return
    }
    if (exptype == 1) {
      
      if (!expid) {
        $Message({
          content: '请填写快递名称',
          type: 'default'
        });
        return
      }
      if (!expsn) {
        $Message({
          content: '请填写快递单号',
          type: 'default'
        });
        return
      }
    }
    this.setData({
      visible1: true
    })
  },
  handleClose1({detail: {index}}) {
    this.setData({
      visible1: false
    })
    if (index == 1) {
      
      this.userDelivery()
    }
  },
  // 出货订单
  userDelivery() {
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    let { options, formData: { exptype, expid, expname, expsn}} = this.data
    let params = {}
    if (exptype == 1) {
      params.expid = expid || '' //快递类型
      params.expname = expname || '' //快递名称
      params.expsn = expsn || '' //物流单号
    }
    params.id = options.id || ''  //订单编号
    params.exptype = exptype || '' //发货方式
    

    App.Util.request({
      url: App.Api.lingsOrderDelivery,
      method: "POST",
      data: params,
      success(res) {
        $Toast.hide()
        $Message({
          content: '订单出货成功！',
          callback() {
            wx.navigateBack({
              delta: 1
            })
          }
        });
      },
      fail(res) {
        $Toast.hide()
        let msg = (res && res.data) ? res.data.msg : '订单出货失败！'
        $Message({
          content: msg,
          callback() {
            
          }
        });
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
  onShareAppMessage: function () {

  }
})