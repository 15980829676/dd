/**
 *type: YEAR/MONTH/DATE/HOURS/MIN/SEC
 *
 * 
 * 
 */
var countdown = {
  MIN: function (that, time, callback) {
    
    that.MinTimer = setInterval(()=>{
      time = parseInt(time)
      time-=1
      if(time <= 0) {
        clearInterval(that.MinTimer)
        setTimeout(()=>{
          callback && callback(time)
        },1000)
      }
      that.setData({
        'countdownData.MIN': time < 10 ? time <= 0 ? '0' : '0' + time : time
      })
    },1000)
  }
}
var getCurrTime = {
  // 获取当月的天数
  getMonthDay: function() {
    let data = new Date()
    let year = data.getFullYear()
    let month = data.getMonth() + 1
    switch (month) {
      case 1: return 31
        break
      case 2: return (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0))?29:28 // 闰年29天
        break
      case 3: return 31
        break
      case 4: return 30
        break
      case 5: return 31
        break
      case 6: return 30
        break
      case 7: return 31
        break
      case 8: return 31
        break
      case 9: return 30
        break
      case 10: return 31
        break
      case 11: return 30
        break
      case 12: return 31
        break
    }
  },
}
module.exports = {
  countdown,
  getCurrTime
}