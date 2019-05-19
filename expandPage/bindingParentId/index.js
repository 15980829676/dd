// expandPage/bindingParentId/index.js
const App = getApp()
const {
  $Message,
  $Toast
} = require('../../dist/base/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recommend_text:'没有供货商手机号？让系统推荐一个吧',
    tel:'',
    tel2:'',
    xitoStart:false,
    list:[],
    listStart:false,
    animation1: {},
    actionIndex:0,   //系统推荐索引
    lat:'',
    recommendText:{
      parId:'',
      name:''
    },
    pageIndex:1,
    nums:20,  //离我最近
    numsContain: 20,  //综合排序
    pageIndexContain:1,
    list2:[],
    listStart2:false,
    tabStart: false,
    tabStart2:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let lat = wx.getStorageSync('globalData').userInfo.lat
    this.setData({
      lat
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
  telOne(e){
    //console.log(e)
    this.setData({
      tel:e.detail.value,
      recommendText: {
        parId: '',
        name: ''
      }
    })
  },
  telTwo(e) {
    //console.log(e)
    this.setData({
      tel2: e.detail.value,
      recommendText: {
        parId: '',
        name: ''
      }
    })
  },
  recommend(){
      //选择系统推荐
    let that = this  
    let animation1 = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    });
    animation1.translateX(0).step({
      duration: 300
    });
    this.setData({
      animation1: animation1.export()
    },()=>{
      if (that.data.tabStart) { return }
      that.setData({ tabStart: true })
      that.getNerarBy(that.data.pageIndex,0)
    });

  },
  //取消系统选择
  outQx(){
    let animation1 = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    });
    animation1.translateX(100 + '%').step({
      duration: 300
    });
    this.setData({
      animation1: animation1.export()
    });
  },
  recommendTab(e){
    let recommendText = this.data.recommendText
        recommendText.parId = e.currentTarget.dataset.parentid
        recommendText.name = e.currentTarget.dataset.name
       
    let animation1 = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    });
    animation1.translateX(100+'%').step({
      duration: 300
    });
    this.setData({
      tel:'',
      tel2:'',
      animation1: animation1.export(),
      recommendText
     
    });
  },
  systemTab(e){
    let key = e.currentTarget.dataset.id || 0;
    let that = this
    this.setData({
      actionIndex: key
 
    })
    
    if (this.data.actionIndex == 1){
      //getNerarBy  lat 经纬度 page 1 nums 分页 sort 0 leave
      if (this.data.tabStart2) { return }
      this.setData({ tabStart2: true })
      that.getNerarBy(that.data.pageIndexContain, 1)
    }
  },
  getNerarBy(nums, sort){
    let lat =this.data.lat,
        list= this.data.list,
        that=this,
        NumsNume = nums || 20;
    $Toast({
      content: '数据获取中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.getNerarBy,
      method: 'POST',
      data: {
        lat: lat,
        page: NumsNume,
        nums: 20,
        sort: sort
      },
      success(res) {
          console.log(res)
          
        if (sort == 0){
          let list = that.data.list
          let rs=res.data || []
          if (rs.length == 0) { 
            that.setData({ listStart:true}) 
             return
          }
          res.data.pic = App.Util.changeImgUrl(res.data, 'pic')
          res.data.map((item)=>{
            list.push(item)
          })
          that.setData({
            list
          })
        }else{
          let list2 = that.data.list2
          let re = res.data || []
          if(re.length == 0){
            that.setData({ listStart2: true })
            return
          }
          res.data.pic = App.Util.changeImgUrl(res.data, 'pic')
          res.data.map((item) => {
            list2.push(item)
          })
          that.setData({
            list2
          })
        }
      },
      complete(res) {
        $Toast.hide()
        

      },
      fail(res) {
        $Message({
          content: res.data.msg || '数据获取失败',
          type: 'default'
        });
      }
    })
  },
  btnParentld(){
    let that = this
    if (this.data.tel && this.data.tel2){
      if (this.data.tel != this.data.tel2) {
        $Message({
          content: '供货商手机号码不一致',
          type: 'default'
        });
        return
      }
      $Toast({
        content: '提交中',
        duration: 0,
        type: 'loading'
      });
      App.Util.request({
        url: App.Api.getShopInfoByPhone,
        method:'POST',
        data:{
          phone: that.data.tel
        },
        success(res) {
            /* wx.redirectTo({
               url: '/pages/shopMerchants/index',
             })*/
          //https://api.hafeisi.cn/distributor/bindRel?
          if(res.data){
            var parentId=res.data.u_id
            wx.showModal({
              title: '提示',
              content: '是否确认将[' + res.data.shop_name + ']设置为我的供货商',
              showCancel: true,
              success(res) {
                if (res.cancel) {
                  //点击取消,默认隐藏弹框

                } else {
                  //点击确定
                  $Toast({
                    content: '提交中',
                    duration: 0,
                    type: 'loading'
                  });
                  App.Util.request({
                    url: App.Api.bindRel,
                    method: 'POST',
                    data: {
                      parentId: parentId
                    },
                    success(res) {
                      setTimeout(() => {
                        wx.redirectTo({
                          url: '/pages/shopMerchants/index',
                        })
                      }, 1000)

                      console.log(res.data)
                    },
                    complete(res) {
                      $Toast.hide()
                      $Message({
                        content: res.data.data || '数据提交失败',
                        type: 'default'
                      });

                    },
                    fail(res) {
                      $Message({
                        content: res.data.msg || '数据提交失败',
                        type: 'default'
                      });
                    }
                  })
                }
              }
            })
          }
         
        },
        complete(res){
          $Toast.hide()
          // $Message({
          //   content: res.data.msg || '数据提交失败',
          //   type: 'default'
          // });
          
        },
        fail(res){
          $Message({
            content: res.data.msg || '数据提交失败',
            type: 'default'
          });
        }
      })
    } else if (this.data.recommendText.parId != ''  && this.data.recommendText.name != ''){
      console.log(this.data.recommendText.parId, this.data.recommendText.name)
      wx.showModal({
        title: '提示',
        content: '是否确认将[' + that.data.recommendText.name + ']设置为我的供货商',
        showCancel: true,
        success(res){
          if(res.cancel) {
            //点击取消,默认隐藏弹框

          }else{
            //点击确定
            $Toast({
              content: '提交中',
              duration: 0,
              type: 'loading'
            });
            App.Util.request({
              url: App.Api.bindRel,
              method: 'POST',
              data: {
                parentId: that.data.recommendText.parId
              },
              success(res) {
                setTimeout(()=>{
                  wx.redirectTo({
                    url: '/pages/shopMerchants/index',
                  })
                },1000)
                
                console.log(res.data)
              },
              complete(res) {
                $Toast.hide()
                $Message({
                  content: res.data.data || '数据提交失败',
                  type: 'default'
                });

              },
              fail(res) {
                $Message({
                  content: res.data.msg || '数据提交失败',
                  type: 'default'
                });
              }
            })
          }

        }
      })
     
      // $Message({
      //   content: '选择系统提交',
      //   type: 'default'
      // });
    }else{
      $Message({
        content: '请输入供货商手机号码，或者选择系统推荐',
        type: 'default'
      });
    }
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
  scrollHander(){
    if (this.data.actionIndex == 0) {
      if (this.data.listStart) { return }
      let pageIndex = this.data.pageIndex;
      pageIndex += 1
      this.setData({
        pageIndex
      })
      this.getNerarBy(this.data.pageIndex, 0)
      console.log(this.data.pageIndex)
    } else {
      if (this.data.listStart2){return}
      let pageIndexContain = this.data.pageIndexContain;
      pageIndexContain += 1
      this.setData({
        pageIndexContain
      })
      this.getNerarBy(this.data.pageIndexContain, 1)
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})