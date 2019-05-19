// pages/editAddress/edit.js
var App = getApp();
const { $Message, $Toast} = require('../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageType: 'modify', // modify: 修改 add: 新增
    region: [],
    isDefaultAddress: false, // 是否选为默认地址
    btnActions: [
      { loading: false},
      { loading: false},
    ],
    isShowLayer: false,// 遮罩层
    tabBarH: 50,
    options: {},
    citysArr: [],
    visiableAddress: false ,// 是否显示地址
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options,
      tabBarH: App.Util.checkPhoneType()
    })
    if(options!={}) {
      // 修改地址
      if (options.type == 'modify') {
        wx.setNavigationBarTitle({
          title: '编辑地址',
        })
        // 拆分地址
        var info = JSON.parse(options.info)
        var region = []
        // 默认地址勾选
        var isDefaultAddress = this.data.isDefaultAddress
        info.default == 3 ? isDefaultAddress = true : isDefaultAddress = false
        region[0] = info.province
        region[1] = info.city
        region[2] = info.dis
        this.setData({
          info ,
          region,
          isDefaultAddress,
          pageType: options.type
        })
      }else {
        wx.setNavigationBarTitle({
          title: '新增地址',
        })
        this.setData({
          pageType: options.type
        })
      }
    }
    
  },
  // 点击显示地址选择框
  clickVisiableAddress() {
    this.setData({
      visiableAddress: true
    })
  },
  // 确认所选地址
  _cityChangeConfirm(e) {
    let { region } = e.detail
    this.setData({
      region
    })
  },
  // 输入
  input(e) {
    // console.log(e)
  },
  // 默认地址勾选
  handleFruitChange(e) {
    console.log(e)
    var isDefaultAddress = this.data.isDefaultAddress
    this.setData({
      isDefaultAddress: !isDefaultAddress
    })
  },
  // 保存新增或修改的地址
  formSubmit(e) {
    var value = e.detail.value
    // console.log(value)
    value.city = this.data.region
    if (!value.name) {
      $Message({
        content: '请填写姓名',
        type: 'warning'
      });
      return
    }
    if (!value.phone) {
      $Message({
        content: '请填写手机号',
        type: 'warning'
      });
      return
    }
    if (!App.Util.checkPhone(value.phone)) {
      $Message({
        content: '请填写正确的手机号',
        type: 'warning'
      });
      return
    }
    if (!value.city[0]) {
      $Message({
        content: '请选择地址',
        type: 'warning'
      });
      return
    }
    if (!value.address) {
      $Message({
        content: '请填写详细地址',
        type: 'warning'
      });
      return
    }
    $Toast({
      content: '正在保存',
      duration: 0,
      type: 'loading'
    });
    var that = this
    var id = this.data.info && this.data.info.id ? this.data.info.id : ''
    that.setActionBtn(1, true) // 保存按钮状态
    App.Util.request({
      url: App.Api.sellerAddressAdd,
      data: {
        province: value.city[0], 
        city: value.city[1], 
        dis: value.city[2], 
        address: value.address, 
        name: value.name, 
        mobi: value.phone, 
        id
      },
      method: 'POST',
      success(res) {
        console.log(res)

        // 是否设置默认地址
        if (that.data.isDefaultAddress) {
          App.Util.request({
            url: App.Api.sellerAddressSetdefault,
            data: {
              addr_id: id
            },
            method: 'POST',
            success(res) {
              var page = getCurrentPages();
              if (page == undefined || page == null) return;
              console.log(page)
              if (that.data.options && that.data.options.page && that.data.options.page == 'mine') {
                that._success('保存成功！', 'default')
                return
              }
            
              for(let i=0;i<page.length;i++) {
                if (page[i].route == 'pages/inventory/pay/settleAccounts') {
                  page[i].setData({
                    mailMethod: {}, // 邮寄方式
                    visibleModal: false, // 隐藏默认地址不存在弹框
                    visiable: false, // 是否显邮寄方式
                    'cartBilling.freight': '0.00' // 运费
                  })
                  page[i].getAddress()
                  break
                }
              }
            
              that._success('保存成功！','default')
            },
            fail(res) {
              that._fail(res.data.msg || '勾选默认地址失败！', 'error')
            }
          })
        }else {
          that._success('保存成功！', 'default')
        }
        
      },
      fail(res) {
        that._fail(res.data.msg || '保存地址失败！', 'error')
      },
      complete() {
        $Toast.hide()
      }
    })
  },
  // 删除地址
  deteleAddress(e) {
    this.setActionBtn(0, true)
    this.setData({
      isShowLayer: true
    })
    var that = this
    App.Util.request({
      url: App.Api.sellerAddressDel,
      data: {
        addr_id: this.data.info.id
      },
      method: 'POST',
      success(res) {
        // 返回地址数量
        // if (res.data.count == 0) {
          var page = getCurrentPages();
          if (page == undefined || page == null) return;
          for (let i = 0; i < page.length; i++) {
            if (page[i].route == 'pages/inventory/pay/settleAccounts') {
              page[i].setData({
                mailMethod: {}, // 邮寄方式
                addressInfo: {},
                visibleModal: false, // 隐藏默认地址不存在弹框
                visiable: false, // 是否显邮寄方式
                'cartBilling.freight': '0.00' // 运费
              })
              page[i].getAddress()
              break
            }
          }
        // }
        that._success('删除地址成功！', 'default')
      },
      fail(res) {
        that._fail(res.data.msg || '删除地址失败！', 'error')
      }
    })
  },
  // 设置按钮状态
  setActionBtn(btnNum, isLoad) {
    var btnActions = this.data.btnActions
    if (btnNum == 'all') {
      btnActions[0].loading = isLoad
      btnActions[1].loading = isLoad
    }else {
      btnActions[btnNum].loading = isLoad
    }
    this.setData({
      btnActions,
    })
  },
  _success(content, type, callback){
    this.setActionBtn('all', false)
    var that = this
    $Message({
      content,
      type,
      duration: 1.5,
      callback() {
        callback && callback()
        that.setData({
          isShowLayer: false
        })
        // 如果用户未设置默认地址，返回时，重新刷新结算页面
        let options = that.data.options
        if (options.addressInfo && options.addressInfo == 'null') {
          wx.redirectTo({
            url: '/pages/inventory/pay/settleAccounts',
          })
          return
        }else {
          wx.navigateBack({
            delta: 1
          })
        }
        
      }
    });
  },
  _fail(content, type, callback) {
    this.setActionBtn('all', false)
    var that = this
    $Message({
      content,
      type,
      duration: 1.5,
      callback() {
        callback && callback()
        that.setData({
          isShowLayer: false
        })
      }
    });
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