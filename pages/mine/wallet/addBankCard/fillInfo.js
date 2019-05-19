// pages/mine/wallet/addBankCard/fillInfo.js
var App = getApp();
// var bankCardCheck = require("../../../../utils/bankCardCheck.js");
var { countdown } = require('../../../../utils/countdown.js');
const { $Toast, $Message } = require('../../../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    MinTimer: '', // 计时器id
    visibleModal: false, // 是否显示 持卡人提示弹框
    modalData: [ // 持卡人提示弹框信息
      {
        name: '知道了',
        color: '#4DA1FF',
        fontSize: '24rpx'
      }
    ],
    info: {},// 输入的信息
    disable: true,
    clickNum:false
  },
  // 持卡人提示 显示弹框
  showHint() {
    this.setData({
      visibleModal: true
    })
  },
  // 持卡人提示 隐藏弹框
  handleClose(e) {
    this.setData({
      visibleModal: false
    })
  },
  input(e) {
    var type = e.currentTarget.dataset.type
    var value = e.detail.value
    var info = this.data.info
    info[type] = value
    this.setData({
      info
    })
    if (!info.name || !info.idcard || !info.bankcardnum || !info.phone || !info.code) {
      this.setData({
        disable: true
      })
      return
    }
    // 检测银行卡号
    // if (type == 'bankcardnum') {
    //   console.log(value)
    //   var temp = bankCardCheck.bankCardAttribution(value)
    //   console.log(temp)
    //   if (temp == Error) {
    //     temp.bankName = '';
    //     temp.cardTypeName = '';
    //     return
    //   }
    //   else {
    //     this.setData({
    //       cardType: temp.bankName + temp.cardTypeName,
    //     })
    //   }
    // }
    this.setData({
      disable: false
    })
  },
  // 确定
  submit:function(e){
    console.log(e)
    let that = this;
    var info = e.detail.value
    if (!App.Util.checkPhone(info.phone)) {
      $Message({
        content: '请输入正确手机号码！',
        type: 'warning'
      });
      return
    }
    $Toast({
      duration: 0,
      content: '加载中',
      type: 'loading'
    });
        // captcha: info.code,
    // data: {
    //   cardNo: info.bankcardnum || '6217714901905564',// 6214838627515515
    //     idNo: info.idcard || '350402198601035016',
    //       name: info.name || '贾搏', //
    //         phoneNo: info.phone || '13950075912' // 18750916005
    // },
            App.Util.request({
              url: App.Api.bankCardAdd,
              data:{
                cardNo: info.bankcardnum||'', // 卡号
                idNo: info.idcard ||'',// 身份证
                name: info.name ||'', 
                phoneNo: info.phone ||'', 
                smscode: info.code
              },
              method:'POST',
              // showLoading: true,
              success(res) {
                console.log('res',res)
                $Toast.hide();
                $Message({
                  content: '添加银行卡成功！',
                  type: 'default',
                  callback() {
                    wx.navigateBack({
                      delta: 1
                    })
                    // wx.navigateTo({
                    //   url: './index',
                    // })
                  }
                });
              },
              fail(res) {
                if (res.data ) {
                  wx.showModal({
                    title: '提示',
                    content: res.data.msg || '数据填写错误',
                    showCancel: false
                  })
                }
              },
              complete() {
                $Toast.hide();
              }
            })
 

  }, 
  // 发送验证码  smscode
  sendCode() {
    // MinTimer
    // console.log(this.data.info.phone)
    let that = this,
        phone = this.data.info.phone;
    if (!App.Util.checkPhone(phone)) {
      $Message({
        content: '请输入正确手机号码！',
        type: 'warning'
      });
      return
    }
    if (this.data.clickNum) {
      $Message({
        content: "验证码已发送,请勿重复点击",
        type: 'default'
      });
      return
    }
    this.setData({
      clickNum: true
    })
    $Toast({
      duration: 0,
      content: '加载中',
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.mobileCaptchaUrl,
      data: {
        mobi: phone,
        type: 1
      },
      method: 'POST',
      success(res) {
        $Toast.hide();
        countdown.MIN(that, 60, (time) => {
          setTimeout(() => {
            that.setData({
              'countdownData.MIN': 0,
              clickNum: false
            })
          }, 1000)
        })
      },
      fail(res) {
        $Toast({
          content: res.data.msg || '验证码获取失败!'
        });
        that.setData({
          clickNum: false
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    clearInterval(this.MinTimer)
    this.setData({
      'countdownData.MIN': 0
    })
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