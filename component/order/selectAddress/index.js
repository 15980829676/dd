// component/order/selectAddress/index.js
var cityData = require('../../../utils/city.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visiable:{
      type: Boolean,
      value: false,
      observer(n,o) {
        if(n) {
          this.anim(0)
        }
      }
    },
    citys:{
      type:Object,
      observer(n,o){
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    animation:{},
    value: [0,0,0] // 每列数据的索引
  },
  attached() {
    // 设置默认地址列表
    let citysArr = {}
    let pid = cityData.provinces[0].id,
      cid = cityData.citys[pid][0].id
    citysArr.provinces = cityData.provinces
    citysArr.citys = cityData.citys[pid]
    citysArr.areas = cityData.areas[cid]
    this.setData({
      citys: citysArr
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    move() {},
    clickBtn({ currentTarget: { dataset}}) {
      let { type } = dataset, value = this.data.value,citys = this.data.citys
      // 确认地址
      if (type == 'confirm') {
        let pro = citys.provinces[value[0]].name,
          cit = citys.citys[value[1]].name,
          ar = citys.areas[value[2]].name,
          region = []
        console.log(pro,cit,ar)
        region[0] = pro
        region[1] = cit
        region[2] = ar
        this.triggerEvent('cityChangeConfirm', {region})
      } else if (type == 'cancel'){// 取消
        this.triggerEvent('cityChangeCancel')
      }
      this.anim('-100%',() => {
        this.setData({
          visiable: false
        })
      })
    },
    anim(bottom, complete) {
      let animat = wx.createAnimation({
        duration: 400,
      })
      animat.bottom(bottom).step()
      this.setData({
        animation: animat.export()
      }, () => {
        setTimeout(() => {
          complete && complete()
        }, 400)
      })
    },
    // 滚动单列表
    cityChange(e) {
      
      let { value } = e.detail,
        citysArr = this.data.citys
      let proNum = value[0] // 省
      let citNum = value[1] // 市
      let areasNum = value[2] // 区

      if (this.data.value[0] != proNum) {
        let proid = citysArr.provinces[proNum].id
        let ctid = cityData.citys[proid][0].id
        citysArr.citys = cityData.citys[proid]
        citysArr.areas = cityData.areas[ctid]
        this.setData({
          citys: citysArr,
          value: [proNum, 0, 0]
        })
      } else if (this.data.value[1] != citNum) {
        let proid = citysArr.provinces[proNum].id
        let ctid = cityData.citys[proid][citNum].id
        citysArr.areas = cityData.areas[ctid]
        this.setData({
          citys: citysArr,
          value: [proNum,citNum,0]
        })
      } else if (this.data.value[2] != areasNum) {
        this.setData({
          value: [proNum, citNum, areasNum]
        })
      }
      this.triggerEvent('cityChange')
    }
  }
})
