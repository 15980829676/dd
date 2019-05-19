// pages/shopMerchants/index.js
var App = getApp();
var shopCont = require("../../utils/shopinfo.js");
const {
  $Toast
} = require('../../dist/base/index');
Page({
  data: {
    isShow: false,
    title: '',
    cont: '',
    shopInfo: '',
    heigt: 0,
    id: 0,
    user: '',
    shopType: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('进入招商',options)
    let t = this
    App.Util.request({
      url: App.Api.getShopRightsUrl,
      success(res) {
        t.setData({
          shopType: res.data
        })
      },
      fail(res) {
        $Toast({
          content: res.msg
        });
      }
    })
    let info = options
    if (info && info.parentUId) {
      this.setData({
        id: info.parentUId
      })
    }
    this.setData({
      shopInfo: shopCont
    })

  },
  onShow: function() {
    let t = this
    let query = wx.createSelectorQuery()
    query.select('.vivi-text').boundingClientRect()
    query.exec(function(res) {
      let height = res[0].height * 2
      t.setData({
        heigt: height - 114
      })
    })
    this.ShareShop()
  },
  ShareShop() {
    let t = this
    let userinfo = wx.getStorageSync('globalData') && wx.getStorageSync('globalData').userInfo
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.getShare,
      data: {
        id: t.data.id
      },
      success(res) {

        if (res && res.data) {
          t.setData({
            user: res.data
          })

        }

        if (res.data.sr_status > 0) {

          wx.navigateTo({
            url: "./info?pid=" + res.data.p_id
            //'&status=' + res.data.sr_status + '&srinfo=' + JSON.stringify(res.data.sr_info)+ '&grade=' + res.data.grade  //上级店铺等级
          })
        }
        $Toast.hide()
      },
      fail(res) {
        console.log(res)
        if (res.data.msg == -1) {
          console.log(res, 222)
          // wx.removeStorage({
          //   key: 'sessionid',
          //   success(res) {
          //     wx.reLaunch({
          //       url: "/pages/index/index"
          //     })
          //   }
          // })
          wx.clearStorageSync()
          wx.reLaunch({
            url: "/pages/index/index"
          })
        } else if (res.data.msg == -2) {
          console.log('用户不存在', res.data.msg)
          $Toast({
            content: '用户不存在',
          });
        } else if (res.data.msg == -3) {
          $Toast({
            content: '您未绑定上级经销商',
          });
          setTimeout(() => {
            //未绑定上级
            wx.reLaunch({
              url: '/expandPage/bindingParentId/index',
            })
          }, 1000)
        } else if (res.data.msg == -5) {
          $Toast({
            content: '申请绑定供货商失效',
          });
          setTimeout(() => {
            //未绑定上级
            wx.reLaunch({
              url: '/expandPage/bindingParentId/index',
            })
          }, 1000)
        } else if (res.data.msg == -6) {
          // $Toast({
          //   content: '申请绑定上级审核中',
          // });
          wx.navigateTo({
            url: "./info?pid=" + t.data.id
          })
        }
      },
      complete() {
        
      }
    })
  },
  move() {},


  onshowtan: function(e) {
    let item = e.currentTarget.dataset.type
    let content = shopCont && shopCont.content
    let explain = this.data.shopType.explain
    let [tlt, tcount] = ["", ""]
    if (item == "bao") {
      tlt = explain.smtitle
      tcount = explain.mdes
    } else if (item == "dai") {
      tlt = explain.sftitle
      tcount = explain.fdes
    } else if (item == "shop") {
      tlt = explain.sstitle
      tcount = explain.sdes
    } else {
      tlt = explain.sititle
      tcount = explain.ides
    }
    this.setData({
      isShow: true,
      title: tlt,
      cont: tcount
    })




  },
  onhidetan: function() {
    this.setData({
      isShow: false
    })
  },

  onNextPage() {
    wx.navigateTo({
      url: "./info?pid=" + this.data.id
    })
  },
  bindscroll(event) {
    if (event.detail.scrollLeft < 10) {
      event.detail.scrollLeft = 0
    }

    this.setData({
      left: event.detail.scrollLeft
    })

  },
  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function() {


  // }



})