// storeProve/index.js
const App=getApp()
const {
  $Toast,
  $Message
} = require('../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imagSrc:'',
    canvasTemImg:'',
    opentype_getphoto:'',
    text:'图片加载中',
    start:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.prove,
      success(res) {
        if (res.data.img) {
          let imagSrc = App.Util.buildImageUrl(res.data.img)
          that.setData({
            imagSrc
          })
        }
      },
      complete() {

      },
      fail(res) {
        $Message({
          content: res.data.msg || '获取失败',
          type: 'default'
        });
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

  //图片加载loading
  imgOnLoad(ev) {
    $Toast.hide()
    this.setData({
      start:false
    })
  },
  imgloaderr(ev) {
    $Toast.hide()
    let text = '图片加载失败'
    this.setData({
      text
    })

  },
  downloadFile(){
    let that = this
    $Toast({
      content: '图片保存中',
      duration: 0,
      type: 'loading'
    });
    if (!that.data.imagSrc) {
      $Message({
        content: '图片丢失',
        type: 'default'
      });
      return
    }
    wx.downloadFile({
      url: that.data.imagSrc,
      success: function (res) {
        console.log(res);
        //图片保存到本地
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (data) {
            $Message({
              content:'保存成功',
              type: 'default'
            });
          },
          fail(res) {
            console.log(res)
            
            $Message({
              content: '保存失败',
              type: 'default'
            });
          },
          complete(res) {
            console.log(res);
            $Toast.hide()
          }
        })
      }
    })
  },
  saveImg(){
    let that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          // 开启弹窗
          //调用授权页面
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success(res) {
              $Message({
                content: '弹窗授权成功',
                type: 'default'
              });
              //用户授权后开始保存图片
              that.downloadFile()
            },
            fail() {
              $Message({
                content: '弹窗授权失败',
                type: 'default'
              });
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
          that.downloadFile()
        }
      }
    })
 
  },
  //图片点击事件
  imgPreview: function (event) {
    var src = event.currentTarget.dataset.src;
    //图片预览
    let imgs = src.split()
    wx.previewImage({
      current: src, 
      urls: imgs
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