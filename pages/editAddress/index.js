// pages/editAddress/index.js
var App = getApp();
const { $Message,$Toast } = require('../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList : [],
    load_params: { // 加载更多参数
      loadmore: false,
      loadend: false,
      empty: false,
      start: 0,
      nums: 10
    },
    tabBarH: 50,
    options:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    this.setData({
      options,
      tabBarH: App.Util.checkPhoneType()
    })
    
  },
  // 获取地址列表
  getAddressList (type) {
   
    if (this.data.load_params.loadmore || this.data.load_params.loadend) return false
    this._getList = new Promise((resolve) => {
      App.Util.request({
        url: App.Api.sellerAddressList,
        data: {
          start: this.data.load_params.start,
          nums: this.data.load_params.nums,
        },
        method: 'GET',
        success(res) {
          // var list = []
          // for(var i = 0;i<10;i++){
          //   list.push(res.data[i])
          // }
          resolve(res.data)
        },
        fail(res) {
          App.Util.showToast(res.data.msg || '获取地址列表失败！')
        },
        complete() {
          setTimeout(() => {
            $Toast.hide()
          },500)
        },
      })
    })

    App.Util.loadMore(this, {
      type,
      currentPageListName: 'addressList',
      dealWithData(list) { // 处理刚刚加载出来的数据
        
        return list
      },
      callback(list) {
        
      }
    })
  },
  // 选择地址
  selectAddress({currentTarget:{dataset:{item}}}) {
    let that = this
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.sellerAddressSetdefault,
      data: {
        addr_id: item.id
      },
      method: 'POST',
      success(res) {

        if (that.data.options && that.data.options.page && that.data.options.page == 'mine' ){
         that.setData({
            addressList: [],
            load_params: { // 加载更多参数
              loadmore: false,
              loadend: false,
              empty: false,
              start: 0,
              nums: 10
            },
          })
          that.getAddressList('refresh')
          return
        }
        
    
            let page = App.globalData.pageThis
            console.log(page)
            wx.navigateBack({
              delta: 1,
              success() {
                if (page.route == 'pages/inventory/pay/settleAccounts') {
                  page.loading()
                  // var page = getCurrentPages().pop();
                  // if (page == undefined || page == null) {
                  //   return
                  // };
                  // 结算页面地址改变时，邮寄方式清除
                  page.setData({
                    mailMethod: {}, // 邮寄方式
                    visibleModal: false, // 隐藏默认地址不存在弹框
                    visiable: false, // 是否显邮寄方式
                    'cartBilling.freight': '0.00' // 运费
                  })
                  page.getAddress({
                    complete() {
                      page.loadingEnd()
                      App.globalData.pageThis = {}
                      console.log(App.globalData.pageThis)
                    }
                  })
                }
              }
            })

      },
      fail(res) {
        that._fail(res.data.msg || '勾选默认地址失败！', 'error')
      },
      complete() {
        $Toast.hide()
      }
    })
    // wx.redirectTo({
    //   url: '/pages/inventory/pay/settleAccounts?changeAddress=' + JSON.stringify(item),
    // })
  },
  _fail(content, type, callback) {
    this.setActionBtn('all', false)
    var that = this
    $Message({
      content,
      type,
      duration: 1.5,
      callback() {
        callback && callback()
        that.setData({
          isShowLayer: false
        })
      }
    });
  },
  // 编辑地址
  editAddress({ currentTarget:{ dataset}}) {
    var str = JSON.stringify(dataset.item)
    console.log('dataset.item', dataset.item)
    if (dataset.item && dataset.item.type=='2'){
      App.Util.showToast('备案地址不可更改')
    }else{
      var url = ''
      
      if (dataset.type == 'modify') {
        url = './edit?type=' + dataset.type + '&info=' + str +'&page='+ this.data.options
      } else {
        url = './edit?type=' + dataset.type + '&page=' + this.data.options
      }
      wx.navigateTo({
        url
      })
    }
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
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    this.setData({
      addressList: [],
      load_params: { // 加载更多参数
        loadmore: false,
        loadend: false,
        empty: false,
        start: 0,
        nums: 10
      },
    })
    this.getAddressList('refresh')
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
    this.getAddressList('pull')
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})