// component/order/goods/group.js
const App = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShowRadio: Boolean, // 是否显示勾选按钮
    index: Number, // 第几件商品
    length: Number, // 商品总数量
    item:{
      type: Object,
      value: {},
      observer(n,o) {
        if(n) {
          n.isShowSuitInfo = false
          if (n.suitInfo && n.suitInfo.length > 0) {
            n.suitInfo.forEach((item,index) => {
              if (item.pic) {
                item.pic = App.Util.buildImageUrl(item.pic)
              }
              if (item.img) {
                item.img = App.Util.buildImageUrl(item.img)
              }
            })
          }
          this.setData({
            item: n
          })
        }
      }
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
    clickShowSuitInfo() {
      let item = this.data.item
      item.isShowSuitInfo = !item.isShowSuitInfo
      this.setData({
        item
      })
    }
  }
})
