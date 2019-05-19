
 /**

   * @param  {Number} areaNumber  奖品数量
   * @param  {Number} speed       转动速度
   * @param  {Number} awardNumer  中奖索引从0开始
   * @param  {Number} mode     1是指针旋转，2为转盘旋转
   * @param  {Number} singleAngle // 每片扇形的角度
   */
Page({
    data: {
       integral: '2555',//用户积分
        deg:0,
        areaNumber:'',
        awardNumer:'',
        speed:16,
        mode:2,
        singleAngle:'',
        isStart:false,
        skewY:0,
      product: [
        { name: '0' ,images:'./../assets/1.png'},
        { name: '1' ,images:'./../assets/2.png'},
        { name: '', images:'./../assets/xie.png'}, 
        { name: '0' ,images:'./../assets/4.png'},
        { name: '1' ,images:'./../assets/3.png'}, 
        { name: '1', images: './../assets/4.png' },
        { name: '0', images: './../assets/xie.png' },
        { name: '1', images: './../assets/3.png' }
       ],
      list: [{
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
      let skewY = Math.abs(parseInt(90 - (360 / this.data.product.length)));
     this.setData({
       skewY
     })
    let list = this.data.list
      if (list != '' && list.length > 5) {
        list.map((i, v) => {
          list.push(i)
        })
        this.setData({ list })
        this.countdown = this.selectComponent('#myHeight');
        this.countdown.heightop(this.data.list);//走马灯
      }
    },

    onSwitchMode (event) {
        const mode = event.currentTarget.dataset.mode
        this.setData({ mode })
        this.switch(mode)
    },
  start() {
    this.setData({ awardNumer: 7, areaNumber: this.data.product.length}) //这边写请求来获取当前用户中奖  and 后台配置奖品数量
      let that=this,
          deg=this.data.deg,
          awardNumer = this.data.awardNumer,
          areaNumber = this.data.areaNumber,
          singleAngle = 360 / areaNumber,
          speed = this.data.speed, 
          isStart = this.data.isStart, 
          mode = this.data.mode;
    if (isStart) return
    this.setData({ isStart:true}) 
    const endAddAngle = (awardNumer - 1) * singleAngle + singleAngle / 2 + 360 // 中奖角度
    const rangeAngle = (Math.floor(Math.random() * 4) + 4) * 360 // 随机旋转几圈再停止
    let cAngle
    deg = 0
    this.timer = setInterval(() => {
      if (deg < rangeAngle) {
        deg += speed
      } else {
        cAngle = (endAddAngle + rangeAngle - deg) / speed
        cAngle = cAngle > speed ? speed : cAngle < 1 ? 1 : cAngle
        deg += cAngle

        if (deg >= (endAddAngle + rangeAngle)) {
          deg = endAddAngle + rangeAngle
     
          that.setData({ isStart: false })
          clearInterval(that.timer)
          //this.endCallBack()
          console.log('endCallBack')  //回调
        }
      }
      that.setData({
          singleAngle,
          deg,
          mode
        
      })
    }, 1000 / 60)
  },

  reset() { 
    let mode= this.data.mode
    this.data.deg = 0
    this.setData({
        singleAngle: this.data.singleAngle,
        deg: 0,
        mode
    })
  },

  switch(mode) {
    this.setData({mode})
  }
    



})
