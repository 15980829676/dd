// component/searchTitle/index.js
const App = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title:{
      type:String,
      value:''
    },
    tabBarH:{
      type:String,
      value:'50'
    },
    back:{
      type:Boolean,
      value:false
    },
    url:{
      type:String,
      value:''
    },
    url2:{
      type:String,
      value:''
    },
    start:{
      type:Boolean,
      value:false
    },
    home:{
      type:Boolean,
      value:true
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
    btnClick(){
      this.triggerEvent('btnClick')
    }
  }
})
