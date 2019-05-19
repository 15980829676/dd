
var mta = require('../../../utils/mta_analysis.js')

var i = 0;
// var start = 1;
var nums = 10;
var down_array = '';
var video_url = '';
var down_arrayPhoto = [];
const App = getApp()
const {
  $Toast, $Message
} = require('/../../../dist/base/index');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imageWidth:0,
    imageHeight:0,
    https: 'https://img2.xingou.net.cn/', //'https://api.hafeisi.cn/',
    httpsApi: 'https://api.hiro.net.cn/',
    opentype_getphoto: '',
    opentype_getVideo: '',
    share_id: '',
    pageInt: 0,
    pageEnd: 10,
    friendList: 0, // 当前显示索引
    navTitleArr: ['朋友圈', '短视频', '文章'],
    friend_data: [
      // {
      //   'id':'123',
      //   'title':'新品上市',
      //   'content':'完整透亮 补水能力 韩菲诗水润多效保湿面膜 持续滋养密集焕亮。',
      //   'src':[
      //     'images/goods/0a/1a/0a1a37561ca2e9b2.png',
      //     'images/goods/0a/1a/0a1a37561ca2e9b2.png',
      //     'images/goods/0a/1a/0a1a37561ca2e9b2.png',
      //     'images/goods/0a/1a/0a1a37561ca2e9b2.png',
      //     'images/goods/0a/1a/0a1a37561ca2e9b2.png',
      //     'images/goods/0a/1a/0a1a37561ca2e9b2.png',
      //     'images/goods/0a/1a/0a1a37561ca2e9b2.png',
      //     'images/goods/0a/1a/0a1a37561ca2e9b2.png',
      //     'images/goods/0a/1a/0a1a37561ca2e9b2.png'
      //   ],
      //   'imgSrc':[
      //     'extension/46/6c/466ce4a0e88216ee.jpeg'
      //   ],
      //   'author_img':'../../images/user_img.png',
      //   'author':'韩菲诗',
      //   'time':'2018.08.30'
      // }
    ],
    video_data: [],
    article_data: [],
    isBackground: true,
    load_params: { // 加载更多参数
      loadmore: false, // 
      loadend: false,
      empty: false
    },
    tabBarH: 50,
    videoStart: '',
    videoImages: '',
    userInfo: {}, // 当前用户信息
    originList:{},
    list:[],
    searchInput:'',
    srcImag:'./../imgEorr.svg',
    srcStart:true
  },
  // load(e){
  //   let originalWidth = e.detail.width;
  //   let originalHeight = e.detail.height; 
    
  //   let friend_data = this.data.friend_data;
  //   friend_data[e.currentTarget.dataset.id].width = originalWidth
  //   friend_data[e.currentTarget.dataset.id].height = originalHeight
  //   this.setData({
  //     friend_data
  //   })
  //   console.log(this.data.friend_data)
  //  // friend_data
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    mta.Page.init()
    this.setData({
      userInfo: wx.getStorageSync('globalData').userInfo,
      tabBarH: App.Util.checkPhoneType()
    })
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    this.load_data(this.data.pageEnd)
    wx.hideShareMenu() // 隐藏分享按钮
  },
  searchInput(e){
    this.setData({
      searchInput: e.detail.value
    })
  },
  searchBtn(){
    if (this.data.friendList == 0) {
      if (this.data.searchInput == ''){
        wx.showToast({
          title: '搜索内容不能为空',
          icon:'none'
        })
      }else{
        wx.navigateTo({
          url: '/discovery/pages/friend/friendList/index?tagId=' + this.data.searchInput+'&type=0',
        })
      }
    } else if (this.data.friendList == 1) {
      if (this.data.searchInput == '') {
        wx.showToast({
          title: '搜索内容不能为空',
          icon: 'none'
        })
      } else {
        wx.navigateTo({
          url: '/discovery/pages/friend/friendList/index?tagId=' + this.data.searchInput + '&type=1',
        })
      }
      
    } else if (this.data.friendList == 2) {
      if (this.data.searchInput == '') {
        wx.showToast({
          title: '搜索内容不能为空',
          icon: 'none'
        })
      } else {
        wx.navigateTo({
          url: '/discovery/pages/friend/friendList/index?tagId=' + this.data.searchInput + '&type=2',
        })
      }
    }
    
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  //图片加载loading
  imgOnLoad(ev) {
    let list = false;
    let src = ev.currentTarget.dataset.src,
      friend_data = this.data.friend_data,
      key = ev.currentTarget.dataset.id,
      width = ev.detail.width,
      height = ev.detail.height;
      friend_data[key].list=true
  
      this.setData({
        friend_data
      })
  },
  imgloaderr(ev) {
      let src = ev.currentTarget.dataset.src,
          friend_data = this.data.friend_data,  
          key = ev.currentTarget.dataset.id;
          friend_data[key].Imagetext = '图片加载失败'
          friend_data[key].ImagetextStart = true
    this.setData({  
      friend_data
    })   
   
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

 
  },
  clickNavItem(e) {
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    let key = e.detail.currentTarget.dataset.key
    let that = this
    this.setData({
      friendList: key,
      searchInput:''
    })

    if (this.data.friendList == 0) {
      wx.setNavigationBarTitle({
        title: '朋友圈'
      })
      
      that.load_data(that.data.pageEnd)
    } else if (this.data.friendList == 1) {
      that.setData({
        nums:0
      })
      wx.setNavigationBarTitle({
        title: '短视频'
      })
      that.load_dataVideo(that.data.pageEnd)
    } else if (this.data.friendList == 2) {
      wx.setNavigationBarTitle({
        title: '文章'
      })
      that.load_dataText(that.data.pageEnd)

    }
  },
  //加载数据
  load_data: function (nums, seaValue) {
    let that = this
    let seaValueText = seaValue || '';
    // App.Util.request({})
    wx.request({
      url: App.Api.host + '/test/queryExtension', //9 所有类型 1/2/3 视频/图片/文章  第一个
      // url: 'https://api.hafeisi.cn/test/queryExtensionInfo', //第二个 详情
      // url: 'https://api.hafeisi.cn/test/queryExtensShopInfo', // 第三个 店铺头像、名称、id
      method: 'get',
      data: {
        //第一个
        type: '2', //9 所有类型 1/2/3 视频/图片/文章
        start: that.data.pageInt,
        nums: nums,
        seaValue: seaValueText
        //第二个
        // id:'36' //视频  type判断跳转哪个页面 后期还会构造一下
        //第三个
        // shopid: '6', //返回 店铺头像图片 shopid 店铺名字
        // utoken: "b01c3306fdcd1fa90ae5898a55d81764" //token
      },
      success: function(res) {
        // 处理图片路径
        // console.log('api返回值', res)
        if (!res.data.data && res.data.data != '') {
          // console.log('进来')
          that.setData({
            load_params: {
              empty: true
            }
          })
          return
        }else {

        }
        var image = [],
          src = [],
          list = res.data.data
        // for (var i = 0; i < res.data.data.length;i++){
        //   res.data.data[i].imgSrc[0] = 'extension/46/6c/466ce4a0e88216ee.jpeg';
        //   res.data.data[i].imgSrc[1] = 'extension\/74\/1a\/741ac920dc86b4ab.jpeg';
        // }
        let friend_data = that.data.friend_data
        list.forEach((item, index) => {
          item.image = JSON.parse(item.image)
          item.Imagetext = '图片资源下载中'
          item.src.forEach((srcItem, i) => {
            if (srcItem.indexOf('\\') >= 0) {
              list[index].src[i] = srcItem.replace(/\\/g, '')
            }
            
          })
          friend_data.push(item)
          //end
          // item.yuan_src.forEach((k,j)=>{
          //   if (k.length >= 1){
          //     console.log(k)
          //   }else{
          //     wx.getImageInfo({
          //       src: that.data.https + list[index].yuan_src,
          //       success: function (res) {

          //         console.log(res)
          //       },
          //       complete(res) {

          //         //console.log(res.width, res.height)
          //       }
          //     })
          //   }
          // })
          if (item.yuan_imgSrc != '') {
            item.yuan_imgSrc = item.yuan_imgSrc.split(',')
          }
        })
       
      
        that.setData({
          friend_data,
          load_params: { // 加载更多参数
            loadmore: false, // 
            loadend: true,
            empty: false
          }
        })
        if (res.data.msg == 1) {
          wx.showToast({
            title: '搜索数据不存在',
            icon: 'none',
            duration: 1000
          })
        }
      },
      complete: function() {
        $Toast.hide()
      }
    })
  },

  //复制文字
  copyTBL: function(e) {
    let that = this;
    let listid=e.currentTarget.dataset.id;
    let keyIndex = e.currentTarget.dataset.key;
    let friend_data = this.data.friend_data
    wx.setClipboardData({
      data: e.currentTarget.dataset.text,
      success: function(res) {
        console.log('复制', res) // data
        wx.showToast({
          title: '内容已复制',
        })
       /* App.Util.request({
            url: App.Api.queryLikeExtension,
            method: 'POST',
            data: {
              type: 4,
              id: listid
            },
            success() {
              friend_data[keyIndex].copy_nums = parseInt(friend_data[keyIndex].copy_nums) + 1
              that.setData({
                friend_data
              })
            }
          })*/
      
      }
    });
  },
  // //预览、放大图片
  previewImage: function(e) {
    let shopid = wx.getStorageSync('shopid')
    let that = this
    let current = e.currentTarget.dataset.src
    if (this.data.friendList == 0) {
      /*if (!shopid || shopid == -1) {
        wx.showModal({
          title: '温馨提示',
          content: '本系统仅供关注“诚享信购”公众号的经销商用户使用，请关注公众号并且申请成为经销商吧',
        })
        return
      }*/

      let img_array = []
      for (var j = 0; j < e.currentTarget.dataset.array.length; j++) {
        img_array.push(that.data.https + e.currentTarget.dataset.array[j])
      }
      //预览图片
      wx.previewImage({
        current: current,
        urls: img_array
      })
    } else if (this.data.friendList == 1) {
      let imgs = current.split()
      //预览图片
      wx.previewImage({
        current: current,
        urls: imgs
      })
    }
  },
  //预览、放大图片
  // previewImage: function (e) {
  //   let shopid = wx.getStorageSync('shopid')
  //   // if (!shopid || shopid == -1) {
  //   //   wx.showModal({
  //   //     title: '温馨提示',
  //   //     content: '本系统仅供关注“诚享信购”公众号的经销商用户使用，请关注公众号并且申请成为经销商吧',
  //   //   })
  //   //   return
  //   // }
  //   let that = this
  //   let current = e.currentTarget.dataset.src
  //   let img_array = []
  //   for (var j = 0; j < e.currentTarget.dataset.array.length; j++) {
  //     img_array.push(that.data.https + e.currentTarget.dataset.array[j])
  //   }
  //   //预览图片
  //   wx.previewImage({
  //     current: current,
  //     urls: img_array
  //   })
  // },
  getphoto: function(res) {
    let that = this
    let listid = res.currentTarget.dataset.id
    let keyIndex = res.currentTarget.dataset.key
    for (var k = 0; k < res.currentTarget.dataset.array.length; k++) {
      down_arrayPhoto.push(that.data.https + res.currentTarget.dataset.array[k])
    }
    //获取相册授权
    console.log(down_arrayPhoto,'qweqweqwe')
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
              that.saveimgs(i, keyIndex, listid);
              //queryLikeExtension: `${host}/test/queryLikeExtension`,//素材库  朋友圈 点赞 type 1：点赞  2：取消点赞。3下载   4复制。
             
             

            },
            fail() {
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
          that.saveimgs(i, keyIndex, listid)
        }
      }
    })

   
  },

  //保存图片到相册
  saveimgs: function (i, keyIndex, listid) {

    console.log(9)
    let that = this
    let friend_data = this.data.friend_data
    if (i == down_arrayPhoto.length) {
      // wx.showToast({
      //   title: '图片已保存'
      // })
      down_arrayPhoto = []
      return
    } else {
      wx.showLoading({
        title: '图片下载中',
        mask: true
      });
      wx.downloadFile({
        url: down_arrayPhoto[i],
        success: function(res) {
          console.log('服务器响应', res)
          let path = res.tempFilePath
          console.log('path', path)
          //用户授权后开始保存图片
          wx.saveImageToPhotosAlbum({
            filePath: path,
            success(res) {
              console.log(res)
              wx.hideLoading();
              down_arrayPhoto = []
              wx.showModal({
                title: '提示',
                content: '保存图片成功',
                showCancel: false
              })
              if (listid == '' && keyIndex ==''){
                return
              }
             /* App.Util.request({
                url: App.Api.queryLikeExtension,
                method: 'POST',
                data: {
                  type: 3,
                  id: listid
                },
                success() {
                  friend_data[keyIndex].down_nums = parseInt(friend_data[keyIndex].down_nums )+1
                  that.setData({
                    friend_data
                  })
                }
              })*/
            },
            fail(res) {
              console.log(res)
              wx.hideLoading();
              down_arrayPhoto = []
              wx.showModal({
                title: '提示',
                content: '保存图片失败',
                showCancel: false
              })
            },
            complete(res) {
              console.log(res)
              wx.hideLoading();
            }
          })
        },
        fail: function(res) {
          console.log('下载失败')
          wx.hideLoading();
          wx.showModal({
            title: '错误',
            content: '下载失败请重试',
            showCancel: false
          })
          down_arrayPhoto = []
        }
      })
      i++
      this.saveimgs(i)
    }
  },

  /**
   * 去详情页
   */
  go_list: function(res) {
    let id = res.target.dataset.id,
      { shopId } = this.data.userInfo
    /*if (!shopid || shopid==-1){
      wx.showModal({
        title: '温馨提示',
        content: '本系统仅供关注“诚享信购”公众号的经销商用户使用，请关注公众号并且申请成为经销商吧',
      })
    }else{
    }*/
    console.log('点击了', res)
    //id是文章id
    wx.navigateTo({
      url: '../list/list?id=' + id + '&shopid=' + shopId + '&type=2',
    })

  },
  //视频加载
  load_dataVideo: function (nums, seaValue) {
    let that = this
    let seaValueText = seaValue || '';
    wx.request({
      url: that.data.httpsApi + 'test/queryExtension', //9 所有类型 1/2/3 视频/图片/文章  第一个
      method: 'get',
      data: {
        //第一个
        type: '1', //9 所有类型 1/2/3 视频/图片/文章
        start: that.data.pageInt,
        nums: nums,
        seaValue:seaValueText
      },
      success: function(res) {
        //console.log('api返回值', res)
        if (res.data.code == '200') {
          if (!res.data.data && res.data.data != '') {
            // console.log('进来')
            that.setData({
              load_params: {
                empty: true
              }
            })
            return
          }
          that.setData({
            video_data: res.data.data,
            load_params: { // 加载更多参数
              loadmore: false, // 
              loadend: true,
              empty: false
            }
          })
          if (res.data.msg == 1) {
            wx.showToast({
              title: '搜索数据不存在',
              icon: 'none',
              duration: 1000
            })
          }
        } else {
          wx.showModal({
            title: '错误',
            content: '数据加载失败，请重试',
          })
        }
      },
      complete: function() {
        $Toast.hide()
      }
    })
  },
  //授权保存到相册位置
  getvideo: function(res) {
    let that = this
    video_url = res.currentTarget.dataset.video
    console.log('视频', res)
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
              that.savevideo()
            },
            fail() {
              console.log('弹窗授权失败', res)
              that.setData({
                opentype_getVideo: 'openSetting'
              })
            }
          })
        } else {
          that.setData({
            opentype_getVideo: ''
          })
          console.log('用户允许')
          that.savevideo()
        }
      }
    })
  },
  //保存视频
  savevideo: function() {
    let that = this
    wx.showLoading({
      title: '视频下载中',
      mask: true
    });
    wx.downloadFile({
      url: video_url,
      success: function(res) {
        let path = res.tempFilePath
        console.log('视频缓存', path)
        //用户授权后开始保存图片
        wx.saveVideoToPhotosAlbum({
          filePath: path,
          success(res) {
            wx.hideLoading()
            console.log(res)
            video_url = ''
          },
          fail(res) {
            wx.hideLoading()
            console.log(res)
            video_url = ''
          },
          complete(res) {
            wx.hideLoading()
            console.log(res)
          }
        })
      },
      fail: function(res) {
        console.log('拒绝授权', res)
        wx.hideLoading()
        wx.showModal({
          title: '错误',
          content: '下载失败请重试',
          showCancel: false
        })
        video_url = ''
      }
    })

  },
  /**文章**/
  input: function() {
    this.setData({
      isBackground: false
    })
  },
  //文章加载数据
  load_dataText: function (nums, seaValue) {
    let that = this
    let seaValueText = seaValue || '';
    wx.request({
      url: that.data.httpsApi + 'test/queryExtension', //9 所有类型 1/2/3 视频/图片/文章  第一个
      method: 'get',
      data: {
        //第一个
        type: '3', //9 所有类型 1/2/3 视频/图片/文章
        start: '1',
        nums: nums,
        seaValue: seaValueText
      },
      success: function(res) {
        // console.log('api返回值3', res)
        if (!res.data.data && res.data.data != '') {
          // console.log('进来')
          that.setData({
            load_params: {
              empty: true
            }
          })
          
          return
        }
        that.setData({
          article_data: res.data.data,
          load_params: {
            loadmore: false, // 
            loadend: true,
            empty: false
          }
        })
        if (res.data.msg == 1) {
          wx.showToast({
            title: '搜索数据不存在',
            icon: 'none',
            duration: 1000
          })
        }
      },
      complete: function() {
        $Toast.hide()
      }
    })
  },
  getText: function(res) {
    let that = this
    down_array = res.currentTarget.dataset.array
    console.log('down_array', down_array)
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
              that.saveimgsText(i)
            },
            fail() {
              console.log('弹窗授权失败', res)
              that.setData({
                opentype_getText: 'openSetting'
              })
            }
          })
        } else {
          that.setData({
            opentype_getText: ''
          })
          console.log('用户允许')
          that.saveimgsText()
        }
      }
    })

  },
  //保存图片到相册
  saveimgsText: function() {
    let that = this
    wx.downloadFile({
      url: down_array,
      success: function(res) {
        let path = res.tempFilePath
        console.log('path', path)
        //用户授权后开始保存图片
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success(res) {
            console.log(res)
            down_array = ''
          },
          fail(res) {
            console.log(res)
          },
          complete(res) {
            console.log(res)
          }
        })
      },
      fail: function(res) {
        console.log('下载失败')
        wx.showModal({
          title: '错误',
          content: '下载失败请重试',
          showCancel: false
        })
        down_array = ''
      }
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // var that = this;

    // if (this.data.friendList == 0) {
    //   console.log('图片')
    //   that.setData({
    //     pageInt: 0,
    //     pageEnd: 10,
    //     friend_data: []
    //   })
    //   that.load_data(that.data.pageEnd)
    // } else if (this.data.friendList == 1) {

    //   that.setData({
    //     pageInt: 0,
    //     pageEnd: 10,
    //     video_data: []
    //   })
    //   that.load_dataVideo(that.data.pageEnd)
    // } else if (this.data.friendList == 2) {
    //   that.setData({
    //     pageInt: 0,
    //     pageEnd: 10,
    //     article_data: []
    //   })
    //   that.load_dataText(that.data.pageEnd)

    // }
    // setTimeout(() => {
    //   // 数据成功后，停止下拉刷新
    //   wx.stopPullDownRefresh();
    // }, 1000);
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

    let that = this;

    console.log(this.data.pageEnd)
    if (this.data.friendList == 0) {
      if (that.data.load_params.empty) {
        return
      }
      var pageEnd = this.data.pageEnd + 10;
      that.setData({
        pageEnd,
        load_params: { // 加载更多参数
          loadmore: true, // 
          loadend: false
        }
      });
      that.load_data(that.data.pageEnd)
    } else if (this.data.friendList == 1) {
      if (that.data.load_params.empty) {
        return
      }
      var pageEnd = this.data.pageEnd + 10;
      that.setData({
        pageEnd,
        load_params: { // 加载更多参数
          loadmore: true, // 
          loadend: false
        }
      });
      that.load_dataVideo(that.data.pageEnd)
    } else if (this.data.friendList == 2) {
      if (that.data.load_params.empty) {
        return
      }
      var pageEnd = this.data.pageEnd + 10;
      that.setData({
        pageEnd,
        load_params: { // 加载更多参数
          loadmore: true, // 
          loadend: false
        }
      });
      that.load_dataText(that.data.pageEnd)
    }
  },
  // btn_share(res) {
  //   let id = res.target.dataset.id
  //   let shopid = wx.getStorageSync('shopid')
  //   if (!shopid || shopid == -1) {
  //     wx.showModal({
  //       title: '温馨提示',
  //       content: '本系统仅供关注“诚享信购”公众号的经销商用户使用，请关注公众号并且申请成为经销商吧',
  //     })
  //     return false
  //   }

  //   //用户点击按钮分享
  //   if (res.from === 'button') {
  //     console.log('点击按钮分享')
  //     return {
  //       title: '韩菲诗',
  //       //转发路径 - 用户点击进入详情页
  //       path: '/pages/list/list?id=' + id + '&shopid=' + shopid + '&type=2'
  //     }
  //   }
  //   return {
  //     title: '韩菲诗-官方',
  //     //转发路径 - 用户点击进入详情页
  //     path: '/pages/list/list?id=' + id + '&shopid=' + shopid + '&type=2'
  //   }
  // },
  share_id() {

  },
  //视频加载
  videoWstart(e) {
    let videoStart = e.currentTarget.dataset.video;
    console.log(videoStart)
    this.setData({
      videoStart
    })
   

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    // 如果是朋友圈
    if (this.data.friendList == 0) {

      //用户点击按钮分享
      if (res.from === 'button') {
        // console.log('点击按钮分享')
        
      }
      let path = App.Util.share({
        jumpUrl: 'discovery/pages/list/list'
      })
      let { shareimg, sharetitle, id} = res.target.dataset,
      https = this.data.https
      // console.log(this.data.https + shareimg,res.target.dataset)
      console.log(path + '&type=2&id=' + id, https + shareimg)
      return {
        title: '韩菲诗 ' + sharetitle,
        path: path + '&type=2&id=' + id,
        imageUrl: https + shareimg,
        success: function(res) {
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
        fail: function(res) {
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
  }
})