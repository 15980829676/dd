// pages/Receiving log/Receiving log.js
var App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
	isShow:false,
	order:[],
	isDoing:false,
	curId:0,
	curIndex:0
  },

  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	  if(options.orderMsg && JSON.parse(options.orderMsg)){
		this.setData({
			order:JSON.parse(options.orderMsg)
		})
	  }
  },

  //确认收货弹窗显示
  toShowtap(e){
	let id = e.currentTarget.dataset.id
	let curIndex = e.currentTarget.dataset.index
	this.setData({
		isShow:true,
		curIndex:curIndex,
		curId:id
	})	
  },
  //确认收货
  toSuretap(e){
		let t=this
		let index = t.data.curIndex
		App.Util.showToast("正在处理"),
		App.Util.request({
			url: App.Api.confirmDeilverOrder,
			data: {
			  id: t.data.curId
			},
			method: 'POST',
			success(res) {
				App.Util.hideToast()
				t.data.order[index].status=3
				that.setData({
					order:t.data.order
				})
			},
			fail(res) {
			  console.log(res)
			  App.Util.showToast(res.data.msg || res.errMsg || '处理失败！')
			}
		})
  },
  //取消收货
  toCanceltap(){
	this.setData({
		isShow:false
	})	
  },
  //详情按钮
  xingInfo(e){
	let id = e.currentTarget.dataset.id
	let type = e.currentTarget.dataset.type
		App.Util.showToast("正在处理"),
		App.Util.request({
			url: App.Api.goodInfox,
			data: {
			  id: id,
			  type:type
			},
			method: 'POST',
			success(res) {
				App.Util.hideToast()
				wx.navigateTo({
					url:"/pages/logistics/logistics?orderMsg="+JSON.stringify(res.data)
				})
			},
			fail(res) {
			  console.log(res)
			  App.Util.showToast(res.data.msg || res.errMsg || '处理失败！')
			}
		})
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