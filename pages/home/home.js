// pages/home/home.js
var App = getApp(),
  socketOpen = false;
var mta = require('../../utils/mta_analysis.js')
const {
  $Message,
  $Toast
} = require('../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    reminder:false,
    windowHeight: 675,
    tabBarH:50,
    searchTitle: "首页",
    carouselList: [], // 轮播图列表
    notice: [], // 消息
    WSOrderNotice: [ // 下单消息推送数据
      // {
      //   name: '吴安',
      //   img: '/images/home-6.svg'
      // },
      // {
      //   name: '张丽',
      //   img: '/images/home-6.svg'
      // }
    ],
    snums: 0,
    selData: {}, // socket传过来的数据
    homeData: {}, // 首页数据
    goodsData: {}, // 商品
    
  },
//测试
  ces(){
    wx.navigateTo({
      url: '/expandPage/storeProve/index',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    mta.Page.init()
    this.setData({
      windowHeight: wx.getSystemInfoSync().windowHeight,
      tabBarH: App.Util.checkPhoneType()
    })
   
    this.reminder() //收藏提示
  },
  reminder(){
    this.setData({
      reminder:true
    },()=>{
      setTimeout(()=>{
        this.setData({
          reminder: false
        })
      },15000)
    })
  },
  reminderHide(){
    this.setData({
      reminder: false
    })

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
   
  },
  btn(e,ck){
    wx.showModal({
      title: '1',
      content: '',
      success(){

      },
      fail(){
        wx.showModal({
          title: '2',
          content: '',
          success() {

          },
          fail() {

          }
        })
      }
    })
  },
  btn2(e){
    this.btn(e,()=>{
      this.btn()
    })
  },
  marketing() {
    App.Util.showToast('功能暂未开放！')
  },
  /**
   *refundSub 返利差额
    sellerSub 采购差额
    deliverSub 出货差额
    plainSub 零售差额
   */
  /**
   *sellerCount 采购订单
    deliverCount 出货订单
    plainCount 零售订单
    msgCount 消息
   */
  // 获取首页数据
  getHomeData() {
    var that = this
    var carouselList = []
    this._getIndexData = new Promise((resolve) => {
      App.Util.request({
        url: App.Api.indexUrl,
        success(res) {
          // console.log(res)
          if (res && res.data) {
            // 首页轮播图
            if (res.data.ad && res.data.ad.top && res.data.ad.top.length > 0) {
              res.data.ad.top.forEach((item) => {
                item.img = App.Api.homeImghost + item.img
              })
              App.globalData.carousel = res.data.ad.top
              let WSOrderNotice = res.data.neworder;
              WSOrderNotice = App.Util.changeImgUrl(WSOrderNotice, 'avater')
              that.setData({
                carouselList: res.data.ad.top,
                WSOrderNotice,
                notice: res.data.notice
              })
              // console.log('tup', that.data.WSOrderNotice)
            }
            // 本月收支
            // res.data.sellerSub.c_nums = that.dealWithNum(res.data.sellerSub.nums)
            // res.data.deliverSub.c_nums = that.dealWithNum(res.data.deliverSub.nums)
            // res.data.refundSub.c_nums = that.dealWithNum(res.data.refundSub.nums)
            // res.data.plainSub.c_nums = that.dealWithNum(res.data.plainSub.nums)
            
            
            // 待办事项
            let backlog = {
              sellerCount: {
                animation: '',
                index: 0,
                nums: []
              },
              deliverCount: {
                animation: '',
                index: 0,
                nums: []
              },
              plainCount: {
                animation: '',
                index: 0,
                nums: []
              },
              dotCount: {
                animation: '',
                index: 0,
                nums: []
              },

              sellerSub: {
                animation: '',
                index: 0,
                nums: [],
              },
              deliverSub: {
                animation: '',
                index: 0,
                nums: []
              },
              refundSub: {
                animation: '',
                index: 0,
                nums: []
              },
              plainSub: {
                animation: '',
                index: 0,
                nums: []
              }
            }
            backlog['sellerCount'].nums.push(res.data.sellerCount.nums)
            backlog['deliverCount'].nums.push(res.data.deliverCount.nums)
            backlog['plainCount'].nums.push(res.data.plainCount.nums)
            backlog['dotCount'].nums.push(res.data.msgCount.dot_count)

            backlog['sellerSub'].nums.push(parseFloat(res.data.sellerSub.nums).toFixed(2))
            backlog['deliverSub'].nums.push(parseFloat(res.data.deliverSub.nums).toFixed(2))
            backlog['refundSub'].nums.push(parseFloat(res.data.refundSub.nums).toFixed(2))
            backlog['plainSub'].nums.push(parseFloat(res.data.plainSub.nums).toFixed(2))

            // 首页数据
            that.setData({
              homeData: res.data,
              backlog
            }, () => {
              resolve()
            })
          }
        }
      })
    })
  },
  // 处理本月收支数据
  dealWithNum(num) {
    num = parseFloat(num)
    return Math.abs(num) == 0 ? '0.00' : Math.abs(num)
  },
  getHomeGoods() {
    var that = this
    App.Util.request({
      url: App.Api.indexGoods,
      success(res) {
        // console.log(res)
        if (res && res.data) {
          res.data.list = App.Util.changeImgUrl(res.data.list, 'img')
          that.setData({
            goodsData: res.data
          })
        }
      }
    })
  },
 
  WSOrderNotice(neworder) {
   
    neworder = App.Util.changeImgUrl(neworder, 'avater')
    this.setData({
      WSOrderNotice: neworder
    })
  },
  jumpPage({
    currentTarget: {
      dataset
    }
  }) {
    // 通知
    if (dataset.page == 'notice') {
      wx.navigateTo({
        url: '/expandPage/notice/stock?currentNavId=' + dataset.key,
        success: function(e) {
          // // switchTab时使用的方法
          // var page = getCurrentPages().pop();
          // console.log(page, getCurrentPages())
          // if (page == undefined || page == null) return;
          // page.setData({
          //   currentNavId: dataset.key,
          //   noticeList: [],
          //   isLoading: true,
          //   load_params: { // 加载更多参数
          //     loadmore: false,
          //     loadend: false,
          //     empty: false,
          //     start: 0,
          //     nums: 10
          //   }
          // }, () => {
          //   console.log('pageSetSuccess', dataset.key)
          // })

        }
      })
      return
    }
    // 库存
    if (dataset.page == 'inventory') {
      wx.switchTab({
        url: '/pages/inventory/orderGoods',
      })
      return
    }

  },
  orderGoods(){
    wx.switchTab({
      url: '/pages/inventory/orderGoods',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.getNoticeCount()
    // console.log('show backlog', this.data.backlog)
    this.getHomeData() 
    this.getHomeGoods()
    Promise.all([this._getNotice, this._getIndexData]).then(() => {
      $Toast.hide()
      this.onSocket()
    })
    this.checkNewVersion()
  },

  
    // 检查版本更新
    checkNewVersion() {
    // 获取小程序更新机制兼容
    if (wx.canIUse("getUpdateManager")) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: "更新提示",
              content: "新版本已经准备好，是否重启应用？",
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate();
                }
              }
            });
          });
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: "已经有新版本了哟~",
              content: "新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~"
            });
          });
        }
      });
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: "提示",
        content: "当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。"
      });
    }
  },
  onSocket: function() {
    let that = this
    let token = wx.getStorageSync('sessionid');
    if (token) {
      wx.connectSocket({
        url: App.Api.websocket,
        header: {
          'content-type': 'application/json'
        },
        protocols: ['protocol1'],
        method: "GET",
        success: function(res) {
          console.log(res)
          console.log("socket调用成功")
        }
      })

      wx.onSocketOpen(function(res) {
        console.log('WebSocket连接已打开！')
        socketOpen = true
        wx.sendSocketMessage({
          data: token
        })
      })
      wx.onSocketMessage(function(res) {
       
        let data = JSON.parse(res.data)
       // console.log("返回结果", data)
        data['sellerSub'] = parseFloat(data['sellerSub']).toFixed(2)
        data['deliverSub'] = parseFloat(data['deliverSub']).toFixed(2)
        data['refundSub'] = parseFloat(data['refundSub']).toFixed(2)
        data['plainSub'] = parseFloat(data['plainSub']).toFixed(2)
        if (data['neworder']){
          that.WSOrderNotice(data['neworder'])
        }

        that.backlogChange('sellerCount', data)
        that.backlogChange('deliverCount', data)
        that.backlogChange('plainCount', data)
        that.backlogChange('dotCount', data)

        that.backlogChange('sellerSub', data)
        that.backlogChange('deliverSub',data)
        that.backlogChange('refundSub', data)
        that.backlogChange('plainSub', data)

        wx.sendSocketMessage({
          data: "ok"
        })

      })
      wx.onSocketError(function(res) {
        console.log('WebSocket连接打开失败，请检查！')
      })


      wx.onSocketClose(function(res) {
        console.log("socket close")

      })

    }

  },
  //系统日记 更多
  moreClick(){
    wx.navigateTo({
      url: '/pages/noticeLog/index',
    })
  },
  noticeClick({ currentTarget: {dataset}}){
    if (dataset.type == "1"){
      wx.navigateTo({
        url: '../../expandPage/version/content',
      })
    }else{
      wx.switchTab({
        url: '/pages/notice/notice',
      })
    } 
  },
  // 数字变动
  backlogChange(type, data) {
    let backlog = this.data.backlog,
      that = this,
      len = backlog[type].nums.length,
      scrollTop = 20

    // 如果最后一个值不等于传过来的值，才添加，执行滚动动画
    if (backlog[type].nums[len - 1] != data[type]) {

      backlog[type].index = parseInt(backlog[type].index) + 1
      backlog[type].nums.push(data[type])
      // backlog[type].animation = wx.createAnimation()
      // backlog[type].animation.top(-backlog[type].index * scrollTop).step()
      // backlog[type].animation = backlog[type].animation.export()
      backlog[type].animation = 'animationTop'
      that.setData({
        // selData: ,
        backlog
      }, () => {
        setTimeout(() => {
          // if (len >= 2) {
          let temp = backlog[type].nums.pop()
          backlog[type].nums = []
          backlog[type].nums.push(temp)
          backlog[type].index = 0
          backlog[type].animation = ''
          // backlog[type].animation = wx.createAnimation()
          // backlog[type].animation.top(0).step()
          // backlog[type].animation = backlog[type].animation.export()
          // console.log('init', backlog)
          that.setData({
            backlog
          })
        // }
        },500)
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    if (socketOpen) {
      socketOpen = false
      wx.closeSocket()
    }
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
  onShareAppMessage: function (res) {
    // console.log(res)
    if (res.from === 'button') {
      // 来自页面内转发按钮
      // console.log(res.target)
    }
    // shop_id/u_id/share_id
    let path = App.Util.share({
      jumpUrl: 'pages/shopMerchants/index',
    })
    return {
      title: '邀请新成员',
      path,
      imageUrl: '/images/team-4.png',
      success: function (res) {
        // 转发成功
        if (res.errMsg == "shareAppMessage:ok") {
          $Message({
            content: '转发成功',
            type: 'default'
          });
          if (typeof call == "function") { call(res) }
        }
      },
      fail: function (res) {
        if (res.errMsg == "shareAppMessage:fail cancel") {
          $Message({
            content: '取消转发',
            type: 'default'
          });
          //  if (typeof fail == "function") { fail(res) }
        } else {
          // 转发失败
          $Message({
            content: '转发失败，请查看网络是否正常',
            type: 'default'
          });
        }

      }
    }

  }
  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function() {

  // }
})