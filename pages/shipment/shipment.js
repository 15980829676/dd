// pages/shipment/shipment.js
const {
  $Toast,
  $Message
} = require('../../dist/base/index');
var App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: 0,
    shopId: 0,
    ordermsg: {},
    set: 1,
    array: ['优速快递','韵达快递', '顺丰快递', '圆通快递', '申通快递', '百世快递', '天天快递', '中通快递', '安能物流', 'EMS', '其他'],
    detail: '',
    key: 0,
    isShow: false,
    name: '',
    animation1: {}, //动画
    other: false,
    expsn: '',
    expname: '',
    visible2: false,
    visible3: false, // 发货扫描提示
    tabBarH: 50
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options) {
      this.setData({
        orderId: options.ordersn,
        shopId: options.shopId
      })
    }
    this.setData({
      tabBarH: App.Util.checkPhoneType()
    })
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    let t = this
    App.Util.request({
      url: App.Api.sendInfoxs,
      data: {
        id: options.ordersn
      },
      method: 'POST',
      success(res) {
        App.Util.hideToast()
        if (res && res.data) {
          let gInfos = res.data.list
          gInfos = App.Util.changeImgUrl(gInfos, 'img')
          gInfos.forEach(item => {
            item.eidtNum = item.nums
          })
          res.data.list = gInfos
          t.setData({
            ordermsg: res.data
          })
        }
      },
      fail(res) {
        console.log(res)
        App.Util.showToast(res.data.msg || res.errMsg || '出货失败！')
      },
      complete() {
        $Toast.hide()
      }
    })
  },
  expresstap(e) {
    let set = e.currentTarget.dataset.set
    this.setData({
      set: set
    })
  },

  inputWacth(e) {
    let type = e.currentTarget.dataset.type;
    if (type == 1) {
      this.setData({
        expsn: e.detail.value
      });
    } else {
      this.setData({
        expname: e.detail.value
      });
    }
  },

  selectTap(e) {
    let dataset = e.currentTarget.dataset
    let [key, name] = [dataset.key, dataset.name]
    if (name == '其他') {
      this.setData({
        other: true
      })
    } else {
      this.setData({
        other: false
      })

    }
    this.setData({
      key: key,
      name: name
    }, () => {
      this.onHideTap()
    })

  },

  handleOpen2() {
    this.setData({
      visible2: true
    });
  },

  handleClose2(e) {
    if (e.type == 'ok') {
      this.onsendTap()
    }
    this.setData({
      visible2: false
    });
  },
  // 发货提示框
  handleClose3(e) {
      console.log(3,e)
    if (e.type == 'ok') {
      this.scanCode()
    }
    this.setData({
      visible3: false
    });
  },
  // 发货按钮
  delivery() {
    this.setData({
      visible3: true
    })

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
          expsn: res.result
        })
      }
    })
  },
  stopQrCode(code) {
    switch(code) {
      case "QR_CODE": return true
      case "DATA_MATRIX": return true
      case "PDF_417": return true
      case "WX_CODE": return true
    }
  },
  //减
  minTap(e) {
    let [goods, index] = [this.data.ordermsg.list, e.currentTarget.dataset.index]
    goods[index].eidtNum = parseInt(goods[index].eidtNum) - 1
    if (goods[index].eidtNum <= 0) {
      goods[index].eidtNum = 0

    }
    this.data.ordermsg.list = goods
    this.setData({
      ordermsg: this.data.ordermsg
    })
    
  },
  //加
  addTap(e) {
    let [goods, index] = [this.data.ordermsg.list, e.currentTarget.dataset.index]

    if (goods[index].eidtNum >= goods[index].nums) {
      App.Util.showToast("商品数量不能大于购买量!")
      return
    }
    goods[index].eidtNum = parseInt(goods[index].eidtNum) + 1
    this.data.ordermsg.list = goods
    this.setData({
      ordermsg: this.data.ordermsg
    })
  },
  onsendTap() {
    let [t, proArray, order, expname, expsn, name, info, isnulls] = [this, [], this.data.ordermsg.list, this.data.expname, this.data.expsn, this.data.name, this.data.ordermsg.info, []]

 

    for (let i in order) {
      if (typeof order[i].num == "undefined") {
        order[i].num = order[i].eidtNum
      }
      if (order[i].eidtNum) {
        order[i].num = order[i].eidtNum
      } else {
        isnulls.push(1)
      }
      if (isnulls.length == order.length) {
        App.Util.showToast("当前没有设置出货的商品!")
        return
      }

      
      proArray[i] = {
        "goods_id": order[i].id,
        "ord_attr_ids": order[i].propId,
        "ord_goods_num": order[i].num,
        "goods_name": order[i].title,
        "goods_sn": "",
        "attrs_info": "",
        "attrs_barcode": "",
        "attrs_img": order[i].img,
        "ord_goods_type": "",
        "ord_goods_mark": "",
        "ord_goods_back": ""
      }
    }
    if (t.data.set == 1) {
      if (t.data.other) {
        if (expname == '') {
          App.Util.showToast("请输入快递公司名称!")
          return
        }
        name = expname
      }
      if (name == '') {
        App.Util.showToast("请选择快递公司!")
        return
      }
      if (expsn == '') {
        App.Util.showToast("请输入快递单号!")
        return
      }
    }
  
    App.Util.showToast("正在提交数据!")
    App.Util.request({
      url: App.Api.delivermemo,
      data: {
        proArray: JSON.stringify(proArray),
        suid: info.u_id,
        sshipname: t.data.name,
        orderid: info.order_id,
        ordersn: info.sn,
        sshipsn: t.data.expsn,
        stype: t.data.set
      },
      method: 'POST',
      success(res) {
        App.Util.showToast("发货完成!")
        setTimeout(() => {
          wx.navigateTo({
            url: "../index/index"
          })
        }, 500)
      },
      fail(res) {
        App.Util.showToast("发货失败!")

      }

    })
  },
  onShowTap() {
    this.setData({
      isShow: true
    }, () => {
      let animation1 = wx.createAnimation({
        duration: 500,
        timingFunction: "ease",
        delay: 10
      });
      animation1.translateY(0).step({
        duration: 500
      });
      this.setData({
        animation1: animation1.export()
      });
    })
  },
  onHideTap() {
    this.setData({
      isShow: false
    })
  },
  move() {},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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