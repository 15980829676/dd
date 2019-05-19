// component/order/logisticsInfo/index.js
var App = getApp();
Component({
  externalClasses: ['logistics-info-layer', 'logistics-info-wrap'],
  /**
   * 组件的属性列表
   */
  properties: {
    isContrary:{
      type: Boolean,
      value: false
    },
    visiable: {
      type: Boolean,
      value: false
    },
    list: {
      type: Array,
      value: [],
      observer(n,o) {
        // console.log(n)
        // let data = n
        // if (data && data.length > 0) {
        //   data.forEach((item,index) => {
        //     item.timeT = item.time.substr(5,5)
        //     item.timeB = item.time.substr(11,5)
        //     this.setState(item.context, index)
        //   })
        //   console.log(data)
        //   this.setData({
        //     list:data
        //   })
        // }
      }
    },
    status:{
      type: String,
      value: 'default', //default：默认 fixed:固定定位 
    },
    address:{
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    innerHeight: 0,
    tabBarH: 50
  },
  attached() {
    this.setData({
      innerHeight: App.Util.getNodeHeight('window'),
      tabBarH: App.Util.checkPhoneType()
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    move() {},
    closePopUp() {
      this.setData({
        visiable: false
      })
    },
    setState(context,index) {
      // let reg = /.+?(揽件|扫描)/g
      // let reg1 = /\揽件|\揽收|\揽/g,
      //   reg1 = /\揽件|\揽收|\揽/g,
      // if (reg1.test(context)) return { type: 3,text: '已揽件' }
      // console.log(context.match(reg), reg.test(context))
      if ((this._indexof(context, '揽件') || this._indexof(context, '揽收')) && (this._indexof(context,'已') || this._indexof(context,'进行'))) {
        console.log('aa', index)
        return { type: 3, text: '已揽件' }
      }
      if (this._indexof(context, '揽件')) {
        return { type: 3, text: '已揽件' }
      }
    },
    _indexof(context,str) {
      return context.indexOf(str) >= 0?true : false
    }
  }
})