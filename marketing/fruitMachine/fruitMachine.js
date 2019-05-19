/*import FruitMachine from '../../../component/marketing/fruitMachine/fruitMachine.js'*/
const Promise = require('./promise.min.js')
  /**

   * @param  {Number} len  宫格个数
   * @param  {Number} ret  抽奖结果对应值1～9
   * @param  {Number} speed  速度值

   */
Page({
    data: {
      len:8,
      ret:0,
      speed:100,
      isStart:false,
      idx:''

    },

    onLoad () {
     
    },

    onReady () {
        console.log('onReady')
    },
  start() {
    this.setData({ret:7})//中奖索引位置  1~8
    let that= this;
    let  idx = this.data.idx,
         ret = this.data.ret, 
          len = this.data.len,
         speed = this.data.speed, 
         isStart = this.data.isStart;
    if (isStart) return
    this.setData({isStart:true})
    let range = Math.floor(Math.random() * 2 + 2)
    let count = 0
    let spd2 = speed * 2
    !(function interval(self) {
      setTimeout(() => {
        count++
        if (count > range * len) {
          speed = spd2
        }
        if (count != (range + 1) * len + ret) {
          interval(self)
        } else {
          self.setData({isStart:false})
          //self.endCallBack && self.endCallBack()
           console.log('endCallBack')
          that.runAsync(400).then(()=>{
            console.log('1')
            wx.showModal({
              title: '提示',
              content: '恭喜您，中奖了',
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
         
        }

        self.setData({
            idx: count % 8 == 0 ? 8 : count % 8
        })

      }, speed)
    })(this)
  },

  reset() {
    console.log(this.data.idx)
    this.setData({
        idx: ''
    })
  },
  runAsync(time) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        resolve()
        clearTimeout(timer)
      }, time)
    })
  }

})
