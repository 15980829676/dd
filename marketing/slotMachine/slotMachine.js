/*import SlotMachine from '../../../component/marketing/slotMachine/slotMachine.js'*/

Page({
    data: {
      integral:'2555',//用户积分
      isStart: false,
      height: 120, // 单个数字高度 / 2
      len:10,
      transY1: 0,
      num1:'',
      transY2: 0,
      num2: '',
      transY3: 0,
      num3:'',
      transY4: 0,
      num4:'',
      speed: 24,
      nuam1:[{
        one:1,
        two:1,
        san:1,
        si:1
      },
      {
        one:1,
        two:2,
        san:2,
        si:1
      },
      {
        one:1,
        two:3,
        san:3,
        si:2
      }],
      list:[{
        name:'Gra******arshall',
        prize:'获得韩菲诗玻尿酸熬夜面膜×1'
      },
      {
          name: 'Gra******arshall',
          prize: '获得韩菲诗玻尿酸熬夜面膜×1'
      },
      {
          name: 'Gra******arshall',
          prize: '获得韩菲诗玻尿酸熬夜面膜×1'
        },
        {
          name: 'Gra******arshall',
          prize: '获得韩菲诗玻尿酸熬夜面膜×1'
        },
        {
          name: 'Gra******arshall',
          prize: '获得韩菲诗玻尿酸熬夜面膜×1'
        },
        {
          name: 'Gra******arshall',
          prize: '获得韩菲诗玻尿酸熬夜面膜×1'
        }]
      },

    onLoad () {
      
    },

    onReady () {
        console.log('onReady')
    },
    onShow(){
      let list=this.data.list
      if (list !='' && list.length > 5){
        list.map((i,v)=>{
          list.push(i)
        })
        this.setData({list})
        this.countdown = this.selectComponent('#myHeight');
        this.countdown.heightop(this.data.list);//走马灯
      }
    },
    
  
    onStart () {
		let that=this;
		let stat=0;
    this.start()
    },
    start(){
      if (this.data.isStart) return
      this.setData({ isStart: true }) //控制次数
      let coot = 0
      let that = this 
      let height=this.data.height;
      let speed = this.data.speed
      this.setData({
        num1:1,
        num2:1,
        num3:3,
        num4:4
      }) //中奖接口
      let num1 = this.data.num1
      let num2 = this.data.num2
      let num3 = this.data.num3
      let num4 = this.data.num4
      let transY1 = this.data.transY1
      let transY2 = this.data.transY2
      let transY3 = this.data.transY3
      let transY4 = this.data.transY4
      let len = this.data.len
    
      const totalHeight = height * len
      const sRange = Math.floor(Math.random() * 2 + 2)
      const halfSpeed = speed / 2
      const endDis1 = num1 == 0 ? 10 * height : num1 * height
      const endDis2 = num2 == 0 ? 10 * height : num2 * height
      const endDis3 = num3 == 0 ? 10 * height : num3 * height
      const endDis4 = num4 == 0 ? 10 * height : num4 * height
      let i1 = 1; let i2 = 1; let i3 = 1; let i4 = 1

      this.timer = setInterval(() => {
        if (i1 <= sRange) {
          transY1 -= speed
          if (Math.abs(transY1) > totalHeight) {
            transY1 += totalHeight
            i1++
          }
        } else if (i1 > sRange && i1 < sRange + 2) {
          transY1 -= halfSpeed
          if (Math.abs(transY1) > totalHeight) {
            transY1 += totalHeight
            i1++
          }
        } else {
          if (transY1 == endDis1) return
          let dropSpeed = (endDis1 + transY1) / halfSpeed
          dropSpeed = dropSpeed > halfSpeed ? halfSpeed : dropSpeed < 1 ? 1 : dropSpeed
          transY1 -= dropSpeed
          transY1 = Math.abs(transY1) > endDis1 ? transY1 = -endDis1 : transY1
        }

        this.timer1 = setTimeout(() => {
          if (i2 <= sRange) {
            transY2 -= speed
            if (Math.abs(transY2) > totalHeight) {
              transY2 += totalHeight
              i2++
            }
          } else if (i2 > sRange && i2 < sRange + 2) {
            transY2 -= halfSpeed
            if (Math.abs(transY2) > totalHeight) {
              transY2 += totalHeight
              i2++
            }
          } else {
            if (transY2 == endDis2) return
            let dropSpeed = (endDis2 + transY2) / halfSpeed
            dropSpeed = dropSpeed > halfSpeed ? halfSpeed : dropSpeed < 1 ? 1 : dropSpeed
            transY2 -= dropSpeed
            transY2 = Math.abs(transY2) > endDis2 ? transY2 = -endDis2 : transY2
          }
        }, 200)

        this.timer2 = setTimeout(() => {
          if (i3 <= sRange) {
            transY3 -= speed
            if (Math.abs(transY3) > totalHeight) {
              transY3 += totalHeight
              i3++
            }
          } else if (i3 > sRange && i3 < sRange + 2) {
            transY3 -= halfSpeed
            if (Math.abs(transY3) > totalHeight) {
              transY3 += totalHeight
              i3++
            }
          } else {
            if (transY3 == endDis3) return
            let dropSpeed = (endDis3 + transY3) / halfSpeed
            dropSpeed = dropSpeed > halfSpeed ? halfSpeed : dropSpeed < 1 ? 1 : dropSpeed
            transY3 -= dropSpeed
            transY3 = Math.abs(transY3) > endDis3 ? transY3 = -endDis3 : transY3
          }
        }, 400)
        this.timer3 = setTimeout(() => {
          if (i4 <= sRange) {
            transY4 -= speed
            if (Math.abs(transY4) > totalHeight) {
              transY4 += totalHeight
              i4++
            }
          } else if (i4 > sRange && i4 < sRange + 2) {
            transY4 -= halfSpeed
            if (Math.abs(transY4) > totalHeight) {
              transY4 += totalHeight
              i4++
            }
          } else {
            let dropSpeed = (endDis4 + transY4) / halfSpeed
            if (num4 < 3) {
              dropSpeed = dropSpeed > halfSpeed ? halfSpeed : dropSpeed < .1 ? .1 : dropSpeed
            } else if (num4 < 5 && num4 >= 3) {
              dropSpeed = dropSpeed > halfSpeed ? halfSpeed : dropSpeed < .3 ? .3 : dropSpeed
            } else {
              dropSpeed = dropSpeed > halfSpeed ? halfSpeed : dropSpeed < .3 ? .3 : dropSpeed
            }

            transY4 -= dropSpeed
            transY4 = Math.abs(transY4) > endDis4 ? transY4 = -endDis4 : transY4
            if (Math.abs(transY4) >= endDis4) {
              clearInterval(this.timer)
              clearTimeout(this.timer1)
              clearTimeout(this.timer2)
              clearTimeout(this.timer3)
              //this.isStart = false
              
              coot++
              if (coot <= 1) {
                 //endCallBack && endCallBack()
                 console.log('endCallBack')
                  wx.showModal({
                    title: '提示',
                    content: `您中奖了`,
                    showCancel: false,
                    success: res => {
                      if (res.confirm) {
                        that.setData({ isStart: false })
                        console.log('用户点击确定')
                      } else if (res.cancel) {
                        console.log('用户点击取消')
                      }
                    }
                  })/**end**/
              }
            }
          }
        }, 600)


        this.setData({
            transY1,
            transY2,
            transY3,
            transY4
        })
      }, 1000 / 60)
    }

})
