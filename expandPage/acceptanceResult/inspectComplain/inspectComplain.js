// pages/inspect complaint/inspect complaint.js
const App = getApp()
const {
  $Message,
  $Toast
} = require('../../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: {
      type: 0,  //整形  投诉类型 
      typetxt: '', //字符形 手输的投诉类型  当type为5-其它时 需要传入该值 


      complaintype: 0, //整形  投诉类别
      name: '',  //字符 投诉的经销商姓名 当complaintype为1时
      mobile: '',  //字符 投诉的经销商手机号 当complaintype为1时
      complainttxt: '', //字符  请输入投诉人类别 当complaintype为2时  其他时


      content: '', //字符 事件内容

      proof: 0,  //整形 投诉凭据
      prooftxt: '',  //字符 当proof为3时 
      pics: [],  //json串 投诉凭据上传的图片内容

      claim: 0,  //投诉要求
      claimtxt: '',   //字符  当claim为2时 

      username: '',  //字符  投诉人姓名
      cmobile: '',  //字符  投诉人手机号
      weixin: '' //字符   投诉人微信号
    },
    inspectList: {
      inspectListType: [{
        name: '窜货',
        type: 0
      }, {
        name: '抢经销商',
        type: 1
      }, {
        name: '底价销售',
        type: 2
      }, {
        name: '售假',
        type: 3
      }, {
        name: '授权类',
        type: 4
      }, {
        name: '其他',
        type: 5
      }],
      complaintype: [{
        name: '消费者',
        type: 0
      }, {
        name: '公司经销商',
        type: 1
      }, {
        name: '其他',
        type: 2
      }],
      proof: [{
        name: '相关图片',
        type: 0
      }, {
        name: '相关样品',
        type: 1
      }, {
        name: '相关记录',
        type: 2
      }, {
        name: '其他',
        type: 3
      }],
      claim: [{
        name: '价格整改',
        type: 0
      }, {
        name: '产品下架',
        type: 1
      }, {
        name: '其他',
        type: 2
      }]

    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  inspectClickone({ currentTarget: { dataset } }) {
    let list = this.data.list
    list.type = dataset.type
    if (list.type != 5) {
      list.typetxt = ''
    }
    this.setData({
      list
    })
    //console.log(this.data.list)
  },
  inspectClickTwo({ currentTarget: { dataset } }) {
    let list = this.data.list
    list.complaintype = dataset.type
    if (list.complaintype != 2) {
      list.complainttxt = ''
    }
    if (list.complaintype != 1) {
      list.name = ''
      list.mobile = ''
    }
    this.setData({
      list
    })
    //console.log(this.data.list)
  },
  inspectClickthree({ currentTarget: { dataset } }) {
    let list = this.data.list
    list.proof = dataset.type

    if (list.proof != 3) {
      list.prooftxt = ''
    }
    this.setData({
      list
    })
    // console.log(this.data.list)
  },
  inspectClickfirst({ currentTarget: { dataset } }) {
    let list = this.data.list
    list.claim = dataset.type

    if (list.proof != 2) {
      list.claimtxt = ''
    }
    this.setData({
      list
    })
    //console.log(this.data.list)
  },
  typetxt(e) {
    let list = this.data.list
    let open = e.currentTarget.dataset.open
    switch (open) {
      case 'typetxt':
        list.typetxt = e.detail.value
        break
      case 'name':
        list.name = e.detail.value
        break
      case 'mobile':
        list.mobile = e.detail.value
        break
      case 'complainttxt':
        list.complainttxt = e.detail.value
        break
      case 'content':
        list.content = e.detail.value
        break
      case 'prooftxt':
        list.prooftxt = e.detail.value
        break
      case 'claimtxt':
        list.claimtxt = e.detail.value
        break
      case 'username':
        list.username = e.detail.detail.value
        break
      case 'cmobile':
        list.cmobile = e.detail.detail.value
        break
      case 'weixin':
        list.weixin = e.detail.detail.value
        break
    }
    this.setData({
      list
    })
    console.log(this.data.list)
  },
  //上传图片
  _handlePicture(e) {
    //console.log(e)
    let list = this.data.list
    list.pics = e.detail
    this.setData({
      list
    })
  },
  inspectClick() {
    //acceptance
    // wx.navigateTo({
    //   url: '../suggest complaint/suggest complaint',
    //   success: function(res) {},
    //   fail: function(res) {},
    //   complete: function(res) {},
    // })
    // 获取上传后的全部图片路径，再执行表单提交

    let that = this
    let list = this.data.list
    if (list.type == 5 && list.typetxt == '') {
      $Message({
        content: "请输入投诉类型",
        type: 'default'
      })
      return
    }

    if (list.complaintype == 1 && list.name == '') {
      $Message({
        content: "投诉类别:(经销商姓名不能为空)",
        type: 'default'
      })
      return
    }
    if (list.complaintype == 1 && !/^[1][3,4,5,7,8][0-9]{9}$/.test(list.mobile)) {
      $Message({
        content: "投诉类别:(经销商手机号格式不正确)",
        type: 'default'
      })
      return
    }
    if (list.complaintype == 2 && list.complainttxt == '') {
      $Message({
        content: "请输入投诉类别",
        type: 'default'
      })
      return
    }
    if (list.content == '') {
      $Message({
        content: "请输入事件内容",
        type: 'default'
      })
      return
    }
    if (list.proof == 3 && list.prooftxt == '') {
      $Message({
        content: "请输入投诉凭据",
        type: 'default'
      })
      return
    }
    if (list.proof != 3 && list.pics.length == 0) {
      $Message({
        content: "请上传投诉凭据图片",
        type: 'default'
      })
      return
    }
    if (list.claim == 2 && list.claimtxt == '') {
      $Message({
        content: "请输入投诉要求",
        type: 'default'
      })
      return
    }
    if (list.username == '') {
      $Message({
        content: "请输入投诉人姓名",
        type: 'default'
      })
      return
    }
    if (!/^[1][3,4,5,7,8][0-9]{9}$/.test(list.cmobile)) {
      $Message({
        content: "投诉人手机号码格式不正确",
        type: 'default'
      })
      return
    }
    if (list.weixin == '') {
      $Message({
        content: "请输入投诉人微信号",
        type: 'default'
      })
      return
    }
    let addPicture = this.selectComponent("#addPicture");
    $Toast({
      content: "正在提交...",
      duration: 0,
      type: 'loading'
    })
    if (list.proof != 3) {
      addPicture.uploadPicture({
        success(res) {
          //  console.log('getPicArr', res)
          that.loadmore(res)
        }
      })
    } else {
      this.loadmore()
    }

  },
  loadmore(res) {
    let that = this
    let list = this.data.list
    if (list.proof != 3) {
      let resList = res || []
      list.pics = [...res]
    }

    this.setData({
      list
    }, () => {
      App.Util.request({
        url: App.Api.acceptance,
        data: that.data.list,
        method: 'POST',
        success(res) {
          //console.log(res)
          $Message({
            content: "提交成功",
            type: 'default'
          })
          wx.navigateTo({
            url: '../suggest complaint/suggest complaint',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          })
        },
        fail(res) {
          $Message({
            content: res.data.msg || "提交失败",
            type: 'default'
          })
        },
        complete() { $Toast.hide() }
      })
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
  onShareAppMessage: function () {

  }
})