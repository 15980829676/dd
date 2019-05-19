/*import Card from '../../../component/marketing/card/card.js'*/
const Promise = require('./promise.min.js')

Page({
    data: {

       isFlip:false,
       initCard:[],
       count:true,
        card: [
          { inlineStyle: '', isBack: false, isMove: false, award: '一等奖', images: './../assets/gridcard/1.png' },
          { inlineStyle: '', isBack: false, isMove: false, award: '二等奖', images: './../assets/gridcard/2.png' },
          { inlineStyle: '', isBack: false, isMove: false, award: '三等奖', images: './../assets/gridcard/3.png' },
          { inlineStyle: '', isBack: false, isMove: false, award: '四等奖', images: './../assets/gridcard/4.png' },
          { inlineStyle: '', isBack: false, isMove: false, award: '五等奖', images: './../assets/gridcard/5.png' },
          { inlineStyle: '', isBack: false, isMove: false, award: '六等奖', images: './../assets/gridcard/6.png' },
          { inlineStyle: '', isBack: false, isMove: false, award: '七等奖', images: './../assets/gridcard/7.png' },
          { inlineStyle: '', isBack: false, isMove: false, award: '八等奖', images: './../assets/gridcard/8.png' },
          { inlineStyle: '', isBack: false, isMove: false, award: '九等奖', images: './../assets/gridcard/9.png' }
        ]
    },

    onLoad () {
      
    },
    onShow(){
     // console.log(new Promise(),'2222')
      /*for (let i = 0; i < 9; i++) {
        this.data.card[i] = { isBack: false, isMove: false, award: card[i].award, images: card[i].images }
      }
       this.setData({ card })*/

    },
    onReady () {
        console.log('onReady')
    },

    onStart (item) {
      let count = 0
      
      if(count = 0){
        this.start()
        count+=1
      }else{
        this.reset()
      }
     


    },
  start() {
    let that = this;
    let list=[...this.data.card];
    
    this.runAsync(100).then(() => {
      for (let i = 0; i < 3; i++) {
        list[i].isBack = true
      }
    
      that.setData({ card:list })
    
      return that.runAsync(200)
    }).then(() => {
      let list = [...this.data.card];
      for (let i = 3; i < 6; i++) {
        list[i].isBack = true
      }
      that.setData({ card: list })
      return that.runAsync(200)
    }).then(() => {
      let list = [...this.data.card];
      for (let i = 6; i <= 8; i++) {
        list[i].isBack = true
      }
      that.setData({ card:list })
      return that.runAsync(800)
    }).then(() => {
      let list = [...this.data.card];
      for (let i = 0; i < 9; i++) {
        list[i].isBack = false
      }
      that.setData({ card: list })
      return that.runAsync(400)
    }).then(() => {
      let list = [...this.data.card];
      for (let i = 0; i < 9; i++) {
        list[i].isMove = true
      }
      that.setData({ card:list })
      return that.runAsync(500)
    }).then(() => {
      let list = [...this.data.card];
      for (let i = 0; i < 9; i++) {
        list[i].isMove = false
      }
     
      if (this.data.count){
        that.setData({ card: list, isFlip: true, initCard: list, count:false})
      }else{
        that.setData({ card: this.data.initCard, isFlip: true })
        //console.log(this.data.initCard,'2222')
      }
    
    })
  },
  reset() {
    this.setData({ isFlip: false })
    let list = [...this.data.card];
    for (let i = 0; i < 9; i++) {
      list[i] = { isBack: false, isMove: false, award: list[i].award, images: list[i].images }
    }
  
    this.setData({ card:list })

    this.runAsync(800).then(() => {
      this.start()
    
    })
  },

    onClick(event) {

      let startT = 0  //这边写请求 中到的奖
      let arr2 = []
      let arr3 = []
      let arr4 = []
      let that=this;
      if (!this.data.isFlip) return
      const idx = event.currentTarget.dataset.idx
      arr2 = [...this.data.card]
     // console.log(arr2)
      const award = arr2[startT].award
      arr3.push(arr2[startT])
      arr2.splice(startT, 1)
      this.randomSort(arr2).map((i, v) => {
        arr4.push(i)
      })
      arr4.splice(idx, 0, arr3[0])
      arr4[idx].isBack = !arr4[idx].isBack
      this.setData({ card: arr4, isFlip:false })
      this.runAsync(600).then(() => {
        console.log(idx, award)  // idx 索引   award 中第几奖
        wx.showModal({
          title: '提示',
          content: '您点击了第' + (idx + 1) + '个方块，中' + award +'',
          showCancel: false,
          success: res => {
            if (res.confirm) {
              that.reset()
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      })
  },
  randomSort(a) {
    let arr = a || [],
      random = [],
      len = arr.length;
    for (let i = 0; i < len; i++) {
      let index = Math.floor(Math.random() * (len - i));
      random.push(a[index]);
      arr.splice(index, 1);
    }
    return random;
  },
 runAsync(time) {
    return new Promise( (resolve, reject)=> {
      const timer = setTimeout( ()=> {
        resolve()
        clearTimeout(timer)
      }, time)
    })
  }
})
  
