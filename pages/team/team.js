// pages/team/team.js
const App = getApp();
const { $Message, $Toast } = require('../../dist/base/index'),{ getCurrTime } = require('../../utils/countdown');
var mta = require('../../utils/mta_analysis.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    progress:{// 滚动条参数
      percent: 20,
    },
    scrollId: '', // 当前首字母(id)
    isShowScrollIndex: false, // 是否显示当前首字母
    currentKey: '', // 当前首字母
    nodesData: {}, // 所有节点数据
    scroll: false, // 是否开启顶部导航左右滚动
    shopLevel: ['心级', '钻级', '金冠', '皇冠', '全部'], // 店铺等级  全部：0  心级:1  钻级:2 金冠:3 皇冠:4  type:key
    myTeamList: [], // 团队列表 
    isFirstRefresh: 0, // 是否是第一次刷新且有数据 0：不是 1：是
    currentTab: 0, // 当前顶部导航
    currentUserId: -1, // 当前用户id 默认是自己
    isLoadCompelte: false, // 当前页面是否加载完成
    isHasData: false, // 加载后是否存在数据
    userInfo: {},
    windowHeight: 600, // 当前页面的高度
	  tabBarh:50,
    currMonDay: 30, // 默认这个月的总天数
  },
  // 切换店铺等级
  handleChange(e) {
    // console.log(e)
    // e.detail.key
    let currentTab = e.detail.currentTarget.dataset.key
    switch (currentTab){
        case 0:
        currentTab = 0
        break;
        case 1:
        currentTab = 4
        break;
        case 2:
        currentTab = 3
        break;
        case 3:
        currentTab = 2
        break;
        case 4:
        currentTab = 1
        break;
    }
    this.setData({
      currentTab
    });
    //console.log(this.data.currentTab)
    this.queryList();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    mta.Page.init()
    let shopLevel = this.data.shopLevel.reverse();

    this.setData({
      scroll: this.data.shopLevel.length > 6? true : false,
	    tabBarh: App.Util.checkPhoneType(),
      shopLevel
    })

    wx.hideShareMenu()
  },
  // 初始化
  _init () {
    var userInfo = wx.getStorageSync('globalData').userInfo
    var windowHeight = wx.getSystemInfoSync().windowHeight
    this.setData({
      scrollId: '', // 当前首字母(id)
      isShowScrollIndex: false, // 是否显示当前首字母
      currentKey: '', // 当前首字母
      nodesData: {}, // 所有节点数据
      currentTab: 0,
      currentUserId:((userInfo && userInfo.u_id) ? userInfo.u_id : -1),//1 || 
      isFirstRefresh: 0,
      isLoadCompelte: false,
      userInfo: App.globalData.userInfo || userInfo,
      windowHeight
    })
    this.queryList();
  },
  // 是否有数据
  isHasData(data) {

    var isHasData = false
    if (typeof data == "object" || typeof data == "Object") {
      // Object.keys(data)返回对象中属性名组成的数组
      if (Object.keys(data).length >0 || data.length > 0) {
        isHasData = true
      }
    } else if (typeof data == "array" || typeof data == "Array") {
      if (data.length > 0) {
        isHasData = true
      }
    }
    return isHasData
  },
  queryList: function () {
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    var that = this;
    // 清空 防止i-index组件右侧索引缓存
    this.setData({
      myTeamList: []
    })
    this._getList = new Promise((resolve)=>{
      App.Util.request({
        url: App.Api.teamListUrl,
        data: {
          u_id: that.data.currentUserId,
          type: that.data.currentTab,
        },
        success(res) {
          var list = []

          if (res.data) {
            if (res && res.data && (res.data != {} || res.data.length > 0)) {
              for (var i in res.data) {
                res.data[i] = App.Util.changeImgUrl(res.data[i], 'shop_avatar')
              }
              list = res.data
            }
            resolve()
          }
          
          that.setData({
            myTeamList: list,
            isFirstRefresh: 1
          })
        },
        fail(res) {
          resolve()
          // console.log(res)
          // App.Util.showToast(res.msg)
        }
      })
    }).then(() => {
      wx.stopPullDownRefresh()
      var isHasData = this.isHasData(this.data.myTeamList)
      this.setData({
        isHasData,
        isLoadCompelte: true,
        "progress.percent": 100,
      })
      this.selectorQuery()
      $Toast.hide()
    })
  },
  // 进度条加载完成时
  progressActiveEnd() {
    this.setData({
      isLoadCompelte: true
    })
    this.selectorQuery()
  },
  selectorQuery() {
    // 获取节点的高度和距离顶部的高度
    var query = wx.createSelectorQuery().in(this)
    var nodesData = {}
    query.selectAll('.scroll-item').boundingClientRect((rects) => {
      if (rects.length > 0) {
        rects.forEach((res, index) => {
          nodesData[res.dataset.name] = {
            top: res.top - 50,
            height: res.height,
            index
          }
        })
        this.setData({
          nodesData
        })
      }
    }).exec()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //页面滚动执行方式 添加定位属性
  pageScroll(event) {
    var nodesData = this.data.nodesData
    var scrollTop = event.detail.scrollTop
    for (var i in nodesData) {
      nodesData[i].isFixed = scrollTop > nodesData[i].top && scrollTop < nodesData[i].top + nodesData[i].height && scrollTop > 5 ? true : false
    }
    this.setData({
      nodesData
    })
  },
  // 点击索引
  handlerTouchMove(event) {
    
    var name = ''
    var nodesData = this.data.nodesData
    var nodesDataLen = Object.keys(nodesData).length
    var itemTop = 0,itemHeight = 18
    var query = wx.createSelectorQuery()

    query.select('.scroll-index').boundingClientRect((rects) => {
      itemTop = rects.top
      itemHeight = rects.height / nodesDataLen
    }).exec(() => {
      const touches = event.touches[0] || {};
      const pageY = touches.pageY;
      const rest = pageY - itemTop;
      let index = Math.ceil(rest / itemHeight) - 1;
      index = index >= nodesDataLen ? nodesDataLen - 1 : index <= 0 ? 0 : index;
      for (var i in nodesData) {
        if (nodesData[i].index == index) {
          name = i
        }
      }
      // 不等于当前name/index(索引)震动
      if (this.data.currentKey !== name) {
        wx.vibrateShort();
      }
      this.setData({
        scrollId: name,
        currentKey: name,
        isShowScrollIndex: true
      })
    })

  },
  handlerTouchEnd() {
    setTimeout(()=>{
      this.setData({
        isShowScrollIndex: false
      })
      console.log("handlerTouchEnd", this.data.isShowScrollIndex)
    },500)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    App.Util.getNoticeCount()
    let currMonDay = getCurrTime.getMonthDay()
    this.setData({
      currMonDay
    })
    this._init()
  },
  // 点击显示当前成员的团队
  todetail(e) {
    var detail = e.currentTarget.dataset
    // 如果点击的是自己，则退出
    if (this.data.currentUserId == detail.currentuserid) return false
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    // 判断该成员是否有子成员
    App.Util.request({
      url: App.Api.teamListUrl,
      data: {
        u_id: detail.currentuserid,
        type: 0,
      },
      success(res) {
        // console.log(res, res.data != {}, res.code == 200 && res.data != {})
        if (res.code == 200 && res.data != {}){
          wx.navigateTo({
            url: './teamMember?uid=' + detail.currentuserid,
          })
        }
      },
      fail(res) {
        console.log("fail",res)
        if (res.data.msg == "未查到数据") {
          App.Util.showToast("TA暂无团队成员")
        } 
      },
      complete() {
        $Toast.hide()
      }
    })
    
    
  },
  // 查看某个成员的个人中心
  jumpPersonalCenter({ currentTarget:{dataset}}) {
    wx.navigateTo({
      url: './personalInformation?userId=' + dataset.currentuserid,
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // this.setData({
    //   isFirstRefresh: 0
    // })
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
    this._init()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // this.queryList('pull')
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
        }else {
          // 转发失败
          $Message({
            content: '转发失败，请查看网络是否正常',
            type: 'default'
          });
        }
        
      }
    }
    
  }
})