// component/topNav/topNav.js
Component({
  externalClasses: ['nav-class'],
  /**
   * 组件的属性列表
   */
  properties: {
    navTitleArr: {
      type: Array,
      value: [],
      observer(newVal, oldVal) {
        if (wx.nextTick) {
          wx.nextTick(() => {
            this.withdaleTime(newVal)
          })
        } else {
          setTimeout(() => {
            this.withdaleTime(newVal)
          }, 500)
        }
      }
    },
    currentNavId: {
      type: Number,
      value: 0
    },
    isFixed: Boolean,
	isHas:Boolean,
  },

  /**
   * 组件的初始数据
   */
  data: {
    scrollNavId: 0,
    currentNavId: 0,
    itemWidth: 0
  },
  attached() {

  },
  ready() {

  },
  /**
   * 组件的方法列表
   */
  methods: {
    scroll(e) {

    },
    withdaleTime(newVal) {
      var windowWidth = wx.getSystemInfoSync().windowWidth
      // console.log("windowWidth=", windowWidth)
      var navTitleArr = newVal

      var len = navTitleArr.length
      if (len < 5) {
        var itemWidth = parseInt(windowWidth / len)
        this.setData({
          itemWidth
        })
      } else {
        var itemWidth = windowWidth / 4.5
        this.setData({
          itemWidth
        })
      }
    },
    clickNavItem(e) {

      var currentNavId = e.currentTarget.dataset.key
      var navTitleArr = this.data.navTitleArr
      if (navTitleArr.length > 0) {
        navTitleArr.forEach((item, i) => {
          i = item.key?item.key:i // 如果传入的是值是数组对象 || 如果传入的值是数组
          if (currentNavId == i) {
            this.setData({
              scrollNavId: (i - 2 > 0 ? i - 2 : 0)
            })
          }
        })
      }
      this.setData({
        currentNavId
      })
      this.triggerEvent('clickNavItem',  e)
    }
  }
})