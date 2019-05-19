// expandPage/component/order/goods.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShowRadio: Boolean, // 是否显示勾选按钮
    index:Number, // 第几件商品
    length: Number, // 商品总数量
    item: {
      type: Object,
      value: {},
      observer(n, o) { }
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
