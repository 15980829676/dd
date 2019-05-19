// pages/team/teamMember.js
const App = getApp();
const {
  $Toast
} = require('../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    progress: {
      percent: 0,
    },
    scrollId: '', // 当前首字母(id)
    isShowScrollIndex: false, // 是否显示当前首字母
    currentKey: '', // 当前首字母
    nodesData: {}, // 所有节点数据
    options: {},
    scroll: false, // 是否开启顶部导航左右滚动
    shopLevel: ['全部', '心级', '钻级', '金冠', '皇冠'], // 店铺等级
    myTeamList: [], // 团队列表 

    isFirstRefresh: 0, // 是否是第一次刷新且有数据 0：不是 1：是
    currentTab: 0, // 当前顶部导航

    currentUserId: -1, // 当前成员

    isLoadCompelte: false, // 当前页面是否加载完成
    isHasData: false, // 加载后是否存在数据
    windowHeight: 600, // 当前页面的高度
    tabBarh: 50,

  },
  // 切换店铺等级
  handleChange(e) {
    this.setData({
      currentTab: e.detail.currentTarget.dataset.key,
    });
    this.queryList();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    this.setData({
      options,
      windowHeight: wx.getSystemInfoSync().windowHeight,
      scroll: this.data.shopLevel.length > 6 ? true : false,
      tabBarh: App.Util.checkPhoneType()
    })
    this._init()
    wx.hideShareMenu()
  },
  // 初始化
  _init() {
    var windowHeight = wx.getSystemInfoSync().windowHeight

    this.setData({
      currentTab: 0,
      currentUserId: this.data.options.uid,
      isFirstRefresh: 0,
      isLoadCompelte: false,
      windowHeight
    })
    this.queryList();
  },
  // 是否有数据
  isHasData(data) {

    var isHasData = false
    if (typeof data == "object" || typeof data == "Object") {
      // Object.keys(data)返回对象中属性名组成的数组
      if (Object.keys(data).length > 0 || data.length > 0) {
        isHasData = true
      }
    } else if (typeof data == "array" || typeof data == "Array") {
      if (data.length > 0) {
        isHasData = true
      }
    }
    return isHasData
  },
  queryList: function() {
    var that = this;
    // 清空 防止i-index组件右侧索引缓存
    this.setData({
      myTeamList: []
    })
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    this._getList = new Promise((resolve) => {
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
  onReady: function() {

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
    var itemTop = 0,
      itemHeight = 18
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
      // 不等于当前name震动
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
    setTimeout(() => {
      this.setData({
        isShowScrollIndex: false
      })
      console.log("handlerTouchEnd", this.data.isShowScrollIndex)
    }, 500)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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
    App.Util.request({
      url: App.Api.teamListUrl,
      data: {
        u_id: detail.currentuserid,
        type: 0,
      },
      success(res) {
        console.log(res, res.data != {}, res.code == 200 && res.data != {})
        if (res.code == 200 && res.data != {}) {
          wx.navigateTo({
            url: './teamMember?uid=' + detail.currentuserid,
          })
        }
      },
      fail(res) {
        console.log("fail", res)
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
  jumpPersonalCenter({
    currentTarget: {
      dataset
    }
  }) {
    wx.navigateTo({
      url: './personalInformation?userId=' + dataset.currentuserid,
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    // this.setData({
    //   isFirstRefresh: 0
    // })
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
    this._init()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
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
})