// pages/logistics information/logistics information.js
var App = getApp();
const { $Toast } = require('../../dist/base/index');
var mta = require('../../utils/mta_analysis.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 2,
    verticalCurrent: 2,
	orderMsg:{},
    userInfo:[],
	orderDetail:[],
  surplurs:[],
	info:[],
	shipt:0,
    subcount:0,
	options:'',
  contacts_start: false,
   kefuList: {}
  },
  handleClick() {
    const addCurrent = this.data.current + 1;
    const current = addCurrent > 2 ? 0 : addCurrent;
    this.setData({
      'current': current
    })
  },
  //联系工作人员
  contacts() {
    let kefuHeight = App.Util.getNodeHeight('window') - App.Util.checkPhoneType()
    this.setData({
      kefuHeight,
      contacts_start: true
    })
  },
  contactsOut() {
    this.setData({
      contacts_start: false
    })
  },
  //
  makePhone(e) {
    let mobile = e.currentTarget.dataset.mobile
    wx.makePhoneCall({
      phoneNumber: mobile   //仅为示例，并非真实的电话号码
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    mta.Page.init()
    var userInfo = wx.getStorageSync('globalData') && wx.getStorageSync('globalData').userInfo
    this.setData({
      userInfo
    })
	this.setData({
		options:options
	})
  },

  //获取快递
 /*  getExpress(){
    let that = this
	let id = this.data.orderMsg.id && this.data.orderMsg.id
	$Toast({
      content: '快递信息加载中',
      duration: 0,
      type: 'loading'
    })
	
	App.Util.request({
        url: App.Api.getExpress,
        data: {
          id: id
        },
        method: 'POST',
        success(res) {
         if (res && res.data && res.data.length>0) {
          that.setData({
            info: res.data
          })
		}else{
		  App.Util.showToast('暂无相关物流信息！')
		}
        },fail(res) {
			App.Util.showToast(res.data.msg || res.msg || '获取物流信息失败！')
		  },
		  complete() {
			$Toast.hide()
		  }
      })
	
	
	
  
  }, */
  
  
  
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

	this.xingInfo()
  },
 //详情
  xingInfo(){
		let t = this
		let options = t.data.options
    let surplus=[]
		App.Util.showToast("正在处理"),
		App.Util.request({
			url: App.Api.goodInfox,
			data: {
			  id: options.id,
			  type:options.type
			},
      method: 'POST',
			success(res) {
        res.data.details = App.Util.changeImgUrl(res.data.details, 'img')
        res.data.surplus = App.Util.changeImgUrl(res.data.surplus, 'img')
        res.data.surplus.map((x,y)=>{
              if(x.nums>0){
                surplus.push(x)
              }
         
         })
        let kefuList = t.data.kefuList
        if (res.data.kefu) {
          kefuList = res.data.kefu
          // kefuList.erwema = App.Util.buildImageUrl(kefuList.erwema) 
          t.setData({
            kefuList
          })
        }
        console.log(1111, surplus)
				t.setData({
				 orderDetail:res.data.details,
         surplurs: surplus || [],
   
          orderMsg:res.data
				})
				
			},
			fail(res) {
			  App.Util.showToast(res.data.msg || res.errMsg || '处理失败！')
			},complete(){
			App.Util.hideToast()
			}
		})
  },
  lookOrder:function(e){
    let dataset = e.currentTarget.dataset
    let redirect=''
    redirect = "../team/orderInformation?userId=" + this.data.orderMsg.opid + "&shopId=" + this.data.orderMsg.shop_id + "&orderId=" + dataset.orderid + '&orderType=wholesale' + '&opid=' + this.data.userInfo.u_id
 
    wx.navigateTo({
      url: redirect,
    })
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})