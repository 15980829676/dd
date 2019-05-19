// component/selectMailMethod/index.js
var App = getApp();
Component({
  externalClasses: ['Mask-class','list-class'],
  /**
   * 组件的属性列表
   */
  properties: {
    title:{
      type: String,
      value: '选择快递'
    },
    title2: {
      type: String,
      value: '选择邮寄方式'
    },
    visiable:{
      type: Boolean,
      value: false
    },
    exList:{ // 物流
      type: Array,
      value: [],
      observer(n,o) {
        // console.log('click')
        this.setData({
          // tempSelectIndex: [0, 1],
          tempSaveExList: n
        })
      }
    },
    rulelist: { // 到付、寄付全部数据
      type: Object,
      value: {},
      observer(n,o) {
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    selectIndex: [0, 1],// 选择索引[0]:物流 ，[1]:寄付/到付
    tempSelectIndex: [0, 1],// 临时保存索引
    isSelect: false, // 是否已经选择过快递
    // visiable2: false,// 是否显示寄付/到付
    mailWrapLeft: '100%', // 选择邮寄弹框与左侧距离
    mailList: [], // 到付、寄付
    tempSaveExList: [],// 临时保存物流列表
    tabBarH: 50,
  },
  observers: {
    'tempSaveExList, rulelist': function (tempSaveExList, rulelist) {
      // 防止先后触发，而读取不到值
      if (tempSaveExList.length <= 0 || !tempSaveExList ) {
        return
      }
      if (!rulelist) {
        return
      }
      var tempSaveExList = this.data.tempSaveExList, rulelist = this.data.rulelist
      // 在 tempSaveExList 或者 rulelist 被设置时，执行这个函数
      tempSaveExList.forEach((item,index) => {
        item.disable = false 
        if (!rulelist[item.key]) item.disable = true 
      })
      // 如果在数据监听器函数中使用 setData 设置本身监听的数据字段，可能会导致死循环
      this.setData({
        exList: tempSaveExList
      })
    }
  },
  attached() {
    this.setData({
      tabBarH: App.Util.checkPhoneType()
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    move() {},
    // 关闭全部弹框
    closePopUp() {
      this.setData({
        // selectIndex: [0, 1],
        tempSelectIndex: this.data.selectIndex,
        visiable: false,
        mailWrapLeft: '100%'
      })
      this.triggerEvent('_closeMailPopUp', this)
    },
    // 选择物流
    selectMail({currentTarget:{dataset}}) {
      let exList = this.data.exList
      let rulelist = this.data.rulelist
      let se = this.data.tempSelectIndex
      let tempSelectIndex = new Array(se[0], se[1])

      if (dataset.type =='express') {// 物流
        // 禁止点击
        if (exList[dataset.index].disable) {
          App.Util.showToast('收货地址不在配送范围内')
          return
        }
        tempSelectIndex[0] = dataset.index
        let ruleItem = rulelist[exList[dataset.index].key]
        this.setData({
          mailList: ruleItem.devtypes
        },()=>{
          let animation1 = wx.createAnimation()
          animation1.left(0).step()
          this.setData({
            animation1: animation1.export(),
            isSelect: true,
            tempSelectIndex
          })
        })
        
      }else {// 邮寄
        tempSelectIndex[1] = dataset.index
        this.setData({
          tempSelectIndex
        })
      }
    },
    // 返回上个弹框
    btnBack() {
      let animation1 = wx.createAnimation()
      animation1.left('100%').step()
      this.setData({
        animation1: animation1.export()
      })
    },
    // 确定修改
    btnConfirm() {
      let tempSelectIndex = this.data.tempSelectIndex
      let exList = this.data.exList
      let mailList = this.data.mailList
	  
      this.setData({
        selectIndex: tempSelectIndex
      },() => {
        let selectIndex = this.data.selectIndex
        // let text = exList[selectIndex[0]].name + ' ' + mailList[selectIndex[1]].name
        this.triggerEvent('_confirmMail', {
          exList,
          mailList,
          selectIndex
        })
      })
    }
  }
})
