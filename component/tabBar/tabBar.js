// component/tabBar/tabBar.js
var App = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    current: {
      type: String
    },
    pointIndex: {
      type: Number,
      value: 3
    },
    tabbarList: {
      type: Array,
      value: [{
        "pagePath": "pages/home/home",
        "text": "首页",
        "key": "home",
        "iconPath": "/images/home.svg",
        "selectedIconPath": "/images/home-action.svg"
      }, {
        "pagePath": "pages/inventory/orderGoods",
        "text": "进货",
        "key": "inventory",
          "iconPath": "/images/inventory.svg",
          "selectedIconPath": "/images/inventory-action.svg"
      }, {
        "pagePath": "pages/team/team",
        "text": "团队",
        "key": "team",
          "iconPath": "/images/team.svg",
          "selectedIconPath": "/images/team-action.svg"
      }, {
        "pagePath": "pages/notice/notice",
        "text": "通知",
        "key": "notice",
          "iconPath": "/images/notice.svg",
          "selectedIconPath": "/images/notice-action.svg"
      }, {
        "pagePath": "pages/mine/mine",
        "text": "我的",
        "key": "mine",
          "iconPath": "/images/mine.svg",
          "selectedIconPath": "/images/mine-action.svg"
      }]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    pointCount: 0,
    tabBarHeight: 50
  },
  attached() {
    this.getNoticeCount()
    this.setData({
      tabBarHeight: App.Util.checkPhoneType()
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    move() {},
    handleChange({ detail: {  key  } }) {
      wx.switchTab({
        url: '/pages/' + key + '/' + key,
      })
    },
    handleChange1({ currentTarget: { dataset } }) {
      
      wx.switchTab({
        url: '/' + this.data.tabbarList[dataset.index].pagePath,
      })
    },
    // 通知数量
    getNoticeCount() {
      // console.log('通知数量')
      var that = this
      App.Util.getNoticeCount({
        success(res) {
          // console.log(res)
          that.setData({
            pointCount: res
          })
        }
      })
    }
  }
})