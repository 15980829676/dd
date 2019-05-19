// component/watermark/index.js
var App = getApp();
Component({
  externalClasses: ['fae-class'],
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    tabBarH: 136
  },
  attached() {
    this.setData({
      tabBarH: App.Util.checkPhoneType() * 2
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {

  }
})
