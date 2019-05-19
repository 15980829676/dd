/*import Shake from '../../../component/marketing/shake/shake.js'*/
const Auido = wx.createAudioContext('shakeAudio') 
Page({
    data: {
      shakeThreshold:100,
      lastX:0,
      lastY:0,
      lastZ:0,
      lastUpdate:0,
      isStart:true,
      anim:false
    },

    onLoad () {
        /*this.shake = new Shake(this, {
            shakeThreshold: 100, // 阈值
            callback: () => {
                wx.showModal({
                    title: '提示',
                    content: '恭喜您，中奖了',
                    showCancel: false,
                    success: res => {
                        if (res.confirm) {
                            this.shake.isStart = true
                            console.log('用户点击确定')
                        } else if (res.cancel) {
                            console.log('用户点击取消')
                            this.shake.isStart = true
                        }
                    }
                })
            }
        })*/
  
      this.start()
    },

    onReady () {
        console.log('onReady')
    },
  start() {
    let shakeThreshold = this.data.shakeThreshold,
        lastX = this.data.lastX,
        lastY = this.data.lastY, 
        lastZ = this.data.lastZ,
        lastUpdate = this.data.lastUpdate,
        isStart = this.data.isStart,
        that = this;
    wx.onAccelerometerChange(res => {
      const curTime = new Date().getTime()
      if ((curTime - lastUpdate) > 100) {
        const curX = res.x
        const curY = res.y
        const curZ = res.z
        const speed = Math.abs(curX + curY + curZ - lastX - lastY - lastZ) / (curTime - lastUpdate) * 10000
        
        if (speed > shakeThreshold && isStart) {
          Auido.play()
          this.update(()=>{
            wx.showModal({
              title: '提示',
              content: '恭喜您，中奖了',
              showCancel: false,
              success: res => {
                if (res.confirm) {
                  that.setData({ isStart : true})
                  console.log('用户点击确定')
                } else if (res.cancel) {
                  that.setData({ isStart: true })
                  
                }
              }
            })
          })
        }
        lastUpdate = curTime
        lastX = curX
        lastY = curY
        lastZ = curZ
      }
    })
  },
  update(endCallBack) {
    this.setData({
      anim: true,
      isStart:false
    })
    setTimeout(() => {
      this.setData({
        anim: false
      })
      endCallBack && endCallBack()
    }, 2000)
  },

    reset() {

  }

})
