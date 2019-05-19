// component/loadMore/loadMore.js
Component({
  externalClasses: ['loadMore-class'],
  /**
   * 组件的属性列表
   */
  properties: {
    loadmore: {
      type: Boolean,
      value: false
    },
    loadend: {
      type: Boolean,
      value: false
    },
    empty: {
      type: Boolean,
      value: false
    },
    definedContent: {
      type: Boolean,
      value: false,
      observer(n,o) {
        // console.log(n,o)
      }
    },
    content: {
      type: String,
    }
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
