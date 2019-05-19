var i = 0,id = '',shopid = '',type = '',down_array = [],resource = '';
let App = getApp(),
{
  $Toast, $Message
} = require('/../../../dist/base/index');

var mta = require('../../../utils/mta_analysis.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list_data:[],
    item: {},
    https: 'https://img2.xingou.net.cn/',
    httpsApi: 'https://api.hiro.net.cn/',
    view_type:'', //分享页面类型 
    list:[],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    mta.Page.init()
    wx.hideShareMenu()
    console.log('options', options)
    id = options.id
    // shopid = options.shopid
    shopid = wx.getStorageSync('globalData').userInfo.shopId
    type = options.type
    if (options != {}){
      this.setData({
        options,
        // 'options.shareId':2 // 测试
      })
    }
    this.go_onload()
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
  //图片加载loading
  imgOnLoad(ev) {
    let list = false;
    let src = ev.currentTarget.dataset.src,
      item = this.data.item,
      width = ev.detail.width,
      height = ev.detail.height;
      item.list = true
    this.setData({
      item
    })
  },
  imgloaderr(ev) {
    let item = this.data.item;
    item.Imagetext = '图片加载失败'
    item.ImagetextStart = true
    this.setData({
      item
    })

  },
  //访问 queryExtensShopInfo
  go_onload:function(){
    let that = this
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: that.data.httpsApi +'test/queryExtensShopInfo', // 第三个 店铺头像、名称、id,
      data: {
        // shopid:'1'
        shopid,
        // utoken: options.token
      },
      success: function (res) {
        console.log('succ',res)
        if (res && res.data) {
          res.data.shop_avatar = App.Util.buildImageUrl(res.data.shop_avatar)
        }
        that.setData({
          list_data: res.data || {},
          view_type: type
        })
        App.Util.request({
          url: that.data.httpsApi +'test/queryExtensionInfo', // 第三个 店铺头像、名称、id,
          data: {
            id: id
          },
          success: function (res) {
            console.log('详情数据', res)
            let item = res.data;
            item.Imagetext ="图片资源下载中"
            that.setData({
              item
            })
            $Toast.hide()
          },
          fail(res) {
            App.Util.showToast(res.data.msg || '获取数据失败');
          }
        })
      },
      fail(res) {
        App.Util.showToast(res.data.msg || '获取数据失败');
      }
    })
  },
  //复制文字
  copyTBL: function (e) {
    let that = this;
    wx.setClipboardData({
      data: e.currentTarget.dataset.text,
      success: function (res) {
        console.log('复制', res) // data
        wx.showToast({
          title: '复制成功',
        })
      }
    });
  },
  //预览、放大图片
  previewImage: function (e) {
    let that = this
    console.log('预览',e)
    let current = e.currentTarget.dataset.src
    if (e.currentTarget.dataset.array.length > 1 ){
      let img_array = []
      for (var j = 0; j < e.currentTarget.dataset.array.length; j++) {
        img_array.push(that.data.https + e.currentTarget.dataset.array[j])
      }
      wx.previewImage({
        current: current,
        urls: img_array
      })
    }else{
      // console.log('进来了')
      let img_array = current.split()
      // let img_array = current
      wx.previewImage({
        current: current,
        urls: img_array
      })
    }
    
    
  },
  getphoto: function (res) {
    let that = this
    if (type == '2') {
      console.log('图片路径', res)
      for (var k = 0; k < res.currentTarget.dataset.array.length; k++) {
        down_array.push(that.data.https + res.currentTarget.dataset.array[k])
      }
    } else{
      resource = res.currentTarget.dataset.array
    }
    //获取相册授权
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          console.log('初始时未弹窗询问过授权', res)
          // 开启弹窗
          //调用授权页面
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success(res) {
              console.log('弹窗授权成功', res)
              //用户授权后开始保存图片
              if (type == '1') {
                that.savevideo()
              } else if (type == '2') {
                that.saveimgs(i)
              } else if (type == '3') {
                that.saveimg()
              }
              // that.saveimgs(i)
            }, fail() {
              console.log('弹窗授权失败', res)
              that.setData({
                opentype_getphoto: 'openSetting'
              })
            }
          })
        } else {
          that.setData({
            opentype_getphoto: ''
          })
          console.log('用户允许')
          if (type == '1') {
            that.savevideo()
          } else if (type == '2') { 
            that.saveimgs(i)
          } else if (type == '3') {
            that.saveimg()
          }
        }
      }
    })
  },
  //保存图片到相册 -- type = 2
  saveimgs: function (i) {
    let that = this
    if (i == down_array.length) {
      wx.showToast({
        title: '图片已保存'
      })
      down_array = []
      return
    } else {
      wx.downloadFile({
        url: down_array[i],
        success: function (res) {
          let path = res.tempFilePath
          console.log('path', path)
          //用户授权后开始保存图片
          wx.saveImageToPhotosAlbum({
            filePath: path,
            success(res) {
              console.log(res)
              down_array = []
            },
            fail(res) {
              console.log(res)
              down_array = []
            },
            complete(res) {
              console.log(res)
            }
          })
        }, fail: function (res) {
          console.log('下载失败')
          wx.showModal({
            title: '错误',
            content: '下载失败请重试',
          })
          down_array = []
        }
      })
      i++
      this.saveimgs(i)
    }
  },
  //保存视频 type = 1
  savevideo: function (){
    let that = this
    wx.downloadFile({
      url: resource,
      success: function (res) {
        let path = res.tempFilePath
        console.log('视频缓存', path)
        //用户授权后开始保存图片
        wx.saveVideoToPhotosAlbum({
          filePath: path,
          success(res) {
            console.log(res)
            resource = ''
          },
          fail(res) {
            console.log(res)
            resource = ''
          },
          complete(res) {
            console.log(res)
          }
        })
      }, fail: function (res) {
        console.log('拒绝授权', res)
        wx.showModal({
          title: '错误',
          content: '下载失败请重试',
          showCancel: false
        })
        resource = ''
      }
    })
  },
  //保存单张图片
  saveimg:function(){
    let that = this
    wx.downloadFile({
      url: resource,
      success: function (res) {
        let path = res.tempFilePath
        console.log('path', path)
        //用户授权后开始保存图片
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success(res) {
            console.log(res)
            resource = ''
          },
          fail(res) {
            console.log(res)
            resource = ''
          },
          complete(res) {
            console.log(res)
          }
        })
      }, fail: function (res) {
        console.log('下载失败')
        wx.showModal({
          title: '错误',
          content: '下载失败请重试',
          showCancel: false
        })
        resource = ''
      }
    })
  },
  // 返回上一页
  clickBack() {
    wx.navigateTo({
      url: '../friend/friend',
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let that = this,
      { id, title, type, sharepic} = res.target.dataset,
      { https, item, view_type } = this.data
    //用户点击按钮分享
    if (res.from === 'button') {
      console.log('点击按钮分享')
      // return {
      //   title: '韩菲诗',
      //   //转发路径 - 用户点击进入详情页
      //   // path: '/pages/list/list?id=' + id + '&' + token
      //   path: '/pages/list/list?id=' + id + '&' + view_type
      // }
    }
    // return {
    //   title: '韩菲诗-系列',
    //   //转发路径 - 用户点击进入详情页
    //   // path: '/pages/list/list?id=' + id + '&' + token
    //   path: '/pages/list/list?id=' + id + '&' + view_type
    // }
    let path = App.Util.share()
    sharepic = sharepic.replace(/\\/g, '')
    console.log(https + sharepic, sharepic)
    return {
      title: '韩菲诗 ' + title,
      path: path + '&type=' + type + '&id=' + id,
      imageUrl: https + sharepic,
      success: function (res) {
        // 转发成功
        if (res.errMsg == "shareAppMessage:ok") {
          $Message({
            content: '转发成功',
            type: 'default'
          });
          if (typeof call == "function") {
            call(res)
          }
        }
      },
      fail: function (res) {
        if (res.errMsg == "shareAppMessage:fail cancel") {
          $Message({
            content: '取消转发',
            type: 'default'
          });
          //  if (typeof fail == "function") { fail(res) }
        } else {
          // 转发失败
          $Message({
            content: '转发失败，请查看网络是否正常',
            type: 'default'
          });
        }

      }
    }

  }
})