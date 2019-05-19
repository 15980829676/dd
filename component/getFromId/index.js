// component/formData/index.js
var App = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    messFormSubmit: function (e) {
      var formId = e.detail.formId;
      console.log(e)
      // App.Util.request({
      // url: App.Api,
      //   data: {

      //   },
      //   success() {},
      //   fail() {},
      //   complete() {}
      // })
    }
  }
})
