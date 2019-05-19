// marketing/ranking/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title:{
      type:String,
      value:'中奖名单'
    },
    list:{
      type:Object,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    heightTop:0
  },
  /**
   * 组件的方法列表
   */
  methods: {
    heightop(e){
      let heightTop=this.data.heightTop;
      let that=this;
      console.log(e.length)
      let time = setInterval(()=>{
        heightTop--
        if (Math.abs(heightTop) >= (e.length)*88/2){
           heightTop=0
        }
        that.setData({ heightTop})
       
      },1000/60)
      /*this.triggerEvent('heightop', list)*/
    }
  }
})
