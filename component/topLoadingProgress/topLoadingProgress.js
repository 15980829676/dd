// component/topLoadingProgress/topLoadingProgress.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    percent:{ // 进度
      type: String,
      value: '0'
    },
    strokeWidth: { // 进度条线的宽度
      type: String,
      value: "2"
    },
    activeColor:{
      type: String,
      value: "#09BB07"
    },
    backgroundColor:{
      type: String,
      value: "#FFFFFF"
    },
    
  },

  /**
   * 组件的初始数据
   */
  data: {
    windowHeight: 1000
  },
  attached() {
    var windowHeight = wx.getSystemInfoSync().windowHeight * 2
    this.setData({
      windowHeight
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    bindactiveend(){
      this.triggerEvent('activeend')
    }
  }
})
