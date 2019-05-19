// component/button/button.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    btnData: {
      type: Array,
      value: [
        {
          text: '取消',
          type: 'cancel',
          isLoading: false,
          color: '#fff',
          bkg: '#edf6ff',
        }
      ]
    },
    isShow: {
      type: Boolean,
      value: false
    },
    arrange: {
      type: String,
      value: 'row'
    },
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

  }
})
