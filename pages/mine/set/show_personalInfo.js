// pages/mine/set/show_personalInfo.js
var App = getApp();
const { $Message, $Toast } = require('../../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isEdit: false,
    region: [], // 省份
    btnActions: [
      { loading: false },
      { loading: false }
    ],
    info: {
      // name: '沈万三',
      // c_name: '沈万三', // 改变的数据
      // wechat: 'xedeisgn',
      // phone: '139 9988 7766',
      // idcard: '350888200101020030',
      // city: '福建省 厦门市 思明区 东浦路',
      // address: '云顶创谷 31号楼 3F'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 修改手机号页面传过来的手机号码
    // console.log(options,'options')
    // if(options.phone) {
    //   this.setData({
    //     'info.phone': options.phone,
    //     'info.c_phone': options.phone
    //   })
    // }
    
  },
  // 将原有的值另存为 方便还原
  handleInfoData(info) {
	 
    for (var i in info) {
      if(i.indexOf('c_') < 0) {
        info['c_' + i] = info[i]
        info['s_' + i] = false
      }
    }
 
    this.setData({
      info
    })
  },
  getSellerInfo() {
    console.log('seller')
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    var that = this
    App.Util.request({
      url: App.Api.sellerInfoUrl,
      success(res) {
        
        if (res.data) {
          var info = {}
          var data = res.data
		 
          info.name = data.base.sr_realname
          info.wechat = data.base.weixin_id
          info.phone = data.base.sr_mobi
          info.idcard = data.base.sr_idcard
          info.city = data.base.pro_name + ' ' + data.base.city_name + ' ' + data.base.dis_name
          info.address = data.base.sr_addr
          that.setData({
            region: [data.base.pro_name, data.base.city_name, data.base.dis_name]
          })
          that.handleInfoData(info)
        }
      }, fail(res) {
        console.log(res)
      },complete() {
        $Toast.hide()
      }
    })
  },
  // 跳转修改信息
  checkSelfPhone (e) {
    // 先取消中间校验
    // wx.navigateTo({
    //   url: './mobile_check?phone='+e.currentTarget.dataset.phone,
    // })
    // 直接修改
    wx.navigateTo({
      url: './set_mobile',
    })
  },
  // 获取焦点
  focus(e) {
    console.log("focus")
  },
  input(e) {
    var value = e.detail.value
    var type = e.currentTarget.dataset.type
    var info = this.data.info
    
    info["c_"+type] = value
    this.setData({
      info,
      isEdit: true
    })
  },
  // 失去焦点
  blur(e) {
    console.log("blur")
    var type = e.currentTarget.dataset.type
    var value = e.detail.value
    var info = this.data.info
    // 切换字体
    // info["s_" + type] = false
    // 如果失去焦点后是空，还原数据
    if (!value) {
      info["c_" + type] = info[type]
    }
    this.setData({
      info,
    })
  },
  // 切换字体
  clickShowInput(e) {
    // console.log('clickShowInput')
    // var type = e.currentTarget.dataset.type
    // var info = this.data.info
    // info["s_" + type] = true
    // this.setData({
    //   info,
    // })
  },
  // 选择省份
  bindRegionChange(e) {
    var value = e.detail.value;
    var type = e.currentTarget.dataset.type
    var info = this.data.info
    var city = value[0] + ' ' + value[1] + ' ' + value[2]
    info["c_" + type] = city
    this.setData({
      region: value,
      info,
      isEdit: true
    })
  },
  // 取消保存
  btnCancel() {
    var btnActions = this.data.btnActions
    var info = this.data.info
    btnActions[0].loading = true
    this.setData({
      btnActions
    })
    // 还原数据
    for(var i in info) {
      if(i.indexOf('c_') < 0) {
        info["c_"+i] = info[i]
      }
    }
    
    setTimeout(()=>{
      var btnActions = this.data.btnActions
      btnActions[0].loading = false
      btnActions[1].loading = false
      this.setData({
        info,
        isEdit: false,
        btnActions
      })
      $Message({
        content: '取消成功！',
        type: 'default'
      });
    },2000)
  },
  // 确定保存
  saveInfo() {
    var btnActions = this.data.btnActions
    var info = this.data.info
    var region = this.data.region
    var that = this
    btnActions[1].loading = true
    this.setData({
      btnActions
    })
    App.Util.request({
      url: App.Api.saveSellerInfoUrl,
      method: 'POST',
      data: {
        srname: info.c_name,
        sraddr: info.c_address,
        proname: region[0],
        idcard: info.c_idcard,
        cityname: region[1],
        disname: region[2],
        weixinid: info.c_wechat
      },
      success(res) {
        setTimeout(() => {
          var btnActions = that.data.btnActions
          btnActions[0].loading = false
          btnActions[1].loading = false
          that.setData({
            isEdit: false,
            btnActions
          })
          $Message({
            content: '保存成功！',
            type: 'default'
          });
        }, 2000)
      },
      fail(res) {
        $Message({
          content: '保存失败！',
          type: 'default'
        });
        console.log('保存失败',e)
      },
      complete() {
        
      }
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
    this.getSellerInfo()
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