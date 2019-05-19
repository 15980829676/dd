// component/order/goods/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShowRadio: Boolean, // 是否显示勾选按钮
    list: {
      type: Array,
      value: [],
      observer(n, o) {
        if(n) {
          let arr = []
          console.log(n)
          n.forEach((item,index) => {
            if (item.ord_goods_type != 3) {
              arr.push(item)
            }
          })
          this.setData({
            list1: arr
          })
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    list1:[]
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
