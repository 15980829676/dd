// expandPage/dataStatistics/index.js
const App = getApp()

const {
  $Toast,
  $Message,
} = require('../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    backlog:{
      animation:''
    },
    tabBarH: 50,
    today:{
      orderList: 0,
      money: 0
    },
    yestarday:{
      orderList:0,
      money:0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      tabBarH: App.Util.checkPhoneType()
    })
    console.log(this.data.tabBarH)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadmore()
  },
  loadmore(){
    let that = this
    let backlog = this.data.backlog,
        today = this.data.today,
      yestarday = this.data.yestarday;
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.dayLogs,
      success(res){
        console.log(res)
        backlog.animation = 'animationTop2';
        let orderTotal = parseFloat(res.data.orderTotal) ;
        let ptSellerTotal = parseFloat(res.data.ptSellerTotal);
        let zsSellerTotal = parseFloat(res.data.zsSellerTotal) ;
        let yesorderTotal = parseFloat(res.data.yestarday.orderTotal) ;
        let yesptSellerTotal = parseFloat(res.data.yestarday.ptSellerTotal) ;
        let yeszsSellerTotal = parseFloat(res.data.yestarday.zsSellerTotal);

        today.orderList = orderTotal + ptSellerTotal + zsSellerTotal ;
        today.money = res.data.total;
        

        yestarday.orderList = yesorderTotal + yesptSellerTotal + yeszsSellerTotal;
        yestarday.money = res.data.yestarday.total;
        res.data.shop.reverse();
        $Toast.hide()
        that.setData({
          list:res.data,
          backlog,
          today,
          yestarday
        })
      },
      complete(){
       
      },
      fail(res){
        $Toast.hide()
        $Message({
          content:'数据加载失败',
          type: 'default'
        });
      }
    })
  },
accAdd(arg1, arg2,arg3){
    var r1, r2, m;
    try{ r1=arg1.toString().split(".")[1].length }catch(e) { r1 = 0 }   
    try{ r2=arg2.toString().split(".")[1].length }catch(e) { r2 = 0 }   
   try { r3 = arg3.toString().split(".")[1].length } catch (e) { r3 = 0 }
    m = Math.pow(10, Math.max(r1, r2, r3))   
    return(arg1*m+ arg2 * m + arg3 *m) / m   
 },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadmore()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})