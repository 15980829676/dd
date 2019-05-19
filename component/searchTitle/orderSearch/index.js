// component/searchTitle/orderSearch/index.js
const App = getApp()
const {
  $Message,
  $Toast
} = require('../../../dist/base/index');
const {
  $wuxKeyBoard
} = require('../../../dist/wuxUi/index.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    text:'',  //搜索文字
    antistopList:[],   //热门搜索
    shoppStart:false,
    Index:0,
    count:0,
    countStart:true,
    adsListText: '',//满1000减19,满500减10,满200减5
    blanCenList: 0,
    windowHeight: 667,
    antim: false,
    currentNavId: 0, // 导航id
    currentMenuIndex: 0, // 当前分类索引
    currentMenuId: 0, // 当前分类id
    menu: [], // 左侧分类列表
    goods: [], // 右侧分类对应的商品列表
    scrollTop: 0,
    menuListL: 0,  // 
    tarIn: true,
    isShowCartList: false, // 点击底部结算是否显示添加的商品列表
    cartList: [], // 购物车（添加的商品）列表
    animation1: {}, //动画
    animation2: {}, //动画
    load_params: { // 加载更多参数
      loadmore: false,
      loadend: false,
      empty: false,
      sort: 0,
      start: 1, // 相当于page
      nums: 1
    },
    nums:1,
    sortold: -1, //保存旧值
    batchstate: true,
    adsList: [],
    totalPrice: "0.00",
    total: 0,
    isShow: true,
    caregList: [],
    curstore: 0,
    cgood: '', //多属性商品,
    currentPro: {}, //当前属性对应的产品,
    currentId: 0, //当前属性对应的产品id,
    isStopWuxKeyBoardHide: true,
    id: 0, //产品id,
    usertype: 0,
    isAddcart: true,
    chaList: [], //初始购物车列表
    shopid: 0,
    cartShow: true,
    isclear: false, //清除购物车锁
    isdele: false, //删除购物车锁
    visible: false,
    actions: [{
      name: '取消'
    },
    {
      name: '删除',
      color: '#4DA1FF',
      loading: false
    }
    ],
    idkey: [],
    cartloading: false,
    catList: [],
    tabBarH: 50,
    unpay: '',
    actions3: [{
      name: '去付款',
      color: '#4DA1FF',
    },
    {
      name: '取消订单',
      color: '#666'
    },
    {
      name: '取消',
      color: '#999'
    }
    ],
    actions4: [
      {
        name: '取消',
        color: '#999'
      },
      {
        name: '保存',
        color: '#4DA1FF',
      }
    ],
    visible3: false,
    visible4: false,
    userInfo: '',
    hornGoodsData: {}, // 点击喇叭时的商品数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.remenSearch()
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
  searchText(e){
    this.setData({
      text:e.detail.value
    })
  },
  //searchKeyword: `${host}/search/searchKeyword`,// 搜索商品 更多按钮 keyword:文字  type:1 searchtype:1 page:1
  gendouClick(){
    let nums = this.data.nums
    var that = this
    nums++
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.searchKeyword,
      data: {
        keyword: that.data.text,
        type: 1,
        searchtype: 1,
        page: nums
      },
      success(res) {
        if (res && res.data) {
           let goods = that.data.goods
          res.data.list.list = App.Util.changeImgUrl(res.data.list.list, 'img')
          res.data.list.list.forEach((item) => {
            // item.isEdit = false
            item.addstate = true
            item.editNum = 0
            goods.push(item)
          })
        
          that.setData({
            goods,
            count: res.data.list.count,
            countStart:false,
            nums
          })
        }
      },
      fail() { },
      complete() {
        $Toast.hide()
      }
    })
  },
  out(){
    this.setData({
      text: ''
    })
  },
  orderIndex(){
    wx.switchTab({
      url: '/pages/inventory/orderGoods',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  //搜索 keyword: `${host}/search/keyword`, // 搜索商品 keyword:文字  type:0 searchtype:1
  searchClick(){
    this.searchType(this.data.text)
  },
  searchType(keyword){
    var that = this
    var keywordText = keyword || ''
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.searchKeyword,
      data:{
        keyword: keywordText,
        type:1,
        searchtype:1,
        page:1
      },
      success(res) {
        console.log(res)
        if (res && res.data) {
          let shoppStart = res.data.list.count == 0 ? true:false
          res.data.list.list = App.Util.changeImgUrl(res.data.list.list,'img')
          res.data.list.list.forEach((item) => {
            // item.isEdit = false
            item.addstate = true
            item.editNum = 0
            
          })
          that.setData({
            goods: res.data.list.list,
            count: res.data.list.count,
            countStart:true,
            shoppStart,
            nums:1
          })
          console.log(that.data.goods)
        }
      },
      fail() { },
      complete() {
        $Toast.hide()
      }
    })
  },
  //searchList
  remenSearch(){
    var that = this
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.searchList,
      data: {},
      success(res) {
        console.log(res)
        if(res && res.data) {
          that.setData({
            antistopList: res.data.good
          })
        }
      },
      fail() { },
      complete() {
        $Toast.hide()
      }
    })
  },
  //点击热门搜索事件
  antistopClick({currentTarget:{dataset}}){
    this.setData({
      text: dataset.item
    })
    this.searchType(dataset.item)
  },
  //换一批
  antistopHy(){
    let Index = this.data.Index ;
    Index++
    Index = Index > this.data.antistopList.length-1 ? 0 : Index;
    this.setData({
      Index
    }) 
  },
  //查询购物车 shopids,buytype 1,carttype 1 POST  总价
  cartOnShow() {
    let parentId = wx.getStorageSync('globalData').userInfo.p_shop_id
    var that = this
    var shopids = []
    that.data.seltype = wx.getStorageSync('globalData').userInfo.seltype
    shopids.push(parentId)
    App.Util.request({
      url: App.Api.sellerCartOnShow,
      data: {
        shopids: JSON.stringify(shopids),
        buytype: 1,
        carttype: 1
      },
      method: "POST",
      success(res) {
        let tot = res.data
        that.setData({
          totalPrice: tot.orderPrices.price,
          total: tot.total_count

          // adsList: res.data.orderPrices.active
        })

      },
      fail(e) {
        console.log(e.data.msg)
      }
    })

  },
  //初始查询购物车列表信息
  CartListTap() {
    let that = this
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    let time
    clearTimeout(time)
    time = setTimeout(() => {
      $Toast.hide()
    }, 500)


    App.Util.request({
      url: App.Api.sellerCartUrl,
      success(res) {
        if (res.data.cart) {
          let mcart = res.data.cart[0]
          if (mcart.groups[0].goods && mcart.groups[0].goods.length > 0) {
            that.sumMenu(mcart.groups[0].goods)
            var chaList = mcart.groups[0].goods
            var goods = that.data.goods
            goods.forEach((y) => {
              y.editNum = 0
            })
            chaList.forEach((x) => {
              goods.forEach((y) => {
                if (y.id == x.id) {
                  y.editNum = y.editNum + parseInt(x.nums)
                }
              })
            })
            that.setData({
              goods,
              catList: mcart.groups[0].goods,
              shopid: mcart.id
            })

          }

        }
        if (res.data.unpay) {
          that.setData({
            unpay: res.data.unpay
          })

        }



      },
      complete() {
        $Toast.hide();

      },
      fail(e) {
        console.log(e.data.msg || "获取失败！")
      }
    })

  },

  //菜单栏数字累加
  sumMenu(list) {
    let menu = this.data.menu

    menu.forEach(y => {
      y.num = 0
    })
    list.forEach(v => {
      menu.forEach(y => {
        if (v.key_id.includes(y.id)) {
          y.num += parseInt(v.nums)

        }
      })
    })
    this.setData({
      menu: menu

    })

  },

  //多属性减号提示
  shuMinusTip() {
    App.Util.showToast("多规格以及带属性商品只能去购物车删除哦！")
  },
  // 按钮-加

  add: function (e) {

    let gnum = 1
    let goods = []
    let type = e.currentTarget.dataset.type
    if (!this.data.isAddcart) {
      return
    }
    if (type == 1) {
      goods = this.data.goods
    } else {
      goods = this.data.cartList
    }
    let index = e.currentTarget.dataset.index
    let set = e.currentTarget.dataset.set

    let now = goods[index]

    let pid = now.id
    let idsList = now.key_id
    let propid = ''
    let limit = 0
    let sylimit = 0
    let store = 0
    let mit = 0
    let base = 0
    let isbase = 0
    let curstore = 0
    if (type == 1) {

      propid = now.details[0].propsId
      limit = parseInt(now.details[0].limit.min)
      sylimit = parseInt(now.details[0].sylimit)
      store = parseInt(now.details[0].store)
      mit = parseInt(now.details[0].limit.max)
      base = parseInt(now.details[0].base)
      isbase = parseInt(now.details[0].isbase)
      curstore = parseInt(this.data.curstore) || sylimit
    } else {
      propid = now.props
      limit = parseInt(now.min)
      sylimit = parseInt(now.sylimit)
      store = parseInt(now.store)
      mit = parseInt(now.max)
      base = parseInt(now.base)
      isbase = parseInt(now.isbase)
      curstore = parseInt(this.data.curstore) || sylimit
    }

    let parentId = wx.getStorageSync('globalData').userInfo.p_shop_id
    let seltype = wx.getStorageSync('globalData').userInfo.seltype


    let cartnum = 0
    let synums = 0

    if (store <= 0) {
      that.data.isAddcart = false
      App.Util.showToast("库存不足！")
      return
    }
    let that = this


    if (seltype == 1) {
      if (set != 1) {
        if (seltype == 1) {
          if (isbase == 1 && base > 0 && mit > 0) {
            sylimit += base
          } else {
            sylimit += 1
          }
        }
      }

      if (mit > 0) {
        if (sylimit == 0) {
          App.Util.showToast("您分配购买数量已用完！")
          that.data.isAddcart = true
          return
        }
      }

      if (limit > 0) {
        if (mit > 0 && sylimit < limit) {
          if (isbase == 1 && base > 0) {
            if (sylimit >= base) {
              if (store < base) {
                App.Util.showToast("剩余库存小于最小基数" + base)
                return
              }
              gnum = base
            } else {
              App.Util.showToast("剩余分配的最小购买数量小于基数" + base)
              return
            }
          }
        } else {
          let editNum = 0
          if (type == 1) {
            editNum = goods[index].editNum
          } else {
            editNum = goods[index].nums
          }
          if (editNum < limit) {
            
            App.Util.showToast("最小购买数为" + limit)
            gnum = limit
          } else if (base && base > 0 && isbase == 1) {
            gnum = base
          } else {
            gnum = 1
          }
        }
      } else {
        gnum = 1
      }



    } else {
      gnum = 1
    }


    let ids = [],
      props = [],
      nums = [],
      shopids = []
    ids.push(pid)
    props.push(propid)
    shopids.push(parentId)
    let menu = that.data.menu

    if (set == 1) {
      //购物车动画
      this.setData({
        antim: true
      }, () => {
        setTimeout(() => {
          this.setData({ antim: false })
        }, 1000)
      })
      if (mit && mit > 0 && seltype > 0) {
        if (gnum > sylimit) {
          App.Util.showToast("您已超出最大购买量！")
          that.data.isAddcart = true
          return
        }
      }
      if (type == 1) {
        goods[index].addstate = false
        that.setData({
          goods
        })
      }
      console.log(gnum,22)
      that.data.isAddcart = false
      nums.push(gnum)

      that.setData({
        cartList: goods
      })
      App.Util.request({
        url: App.Api.sellerAddCartAll,
        data: {
          ids: JSON.stringify(ids),
          props: JSON.stringify(props),
          nums: JSON.stringify(nums),
          shopids: JSON.stringify(shopids),
          type: 1,
          carttype: 1,
          check: 0,
          buytype: 1
        },
        method: 'POST',
        success(res) {
          that.data.isAddcart = true
          let resData = res.data.orderPrices
          if (type == 1) {
            goods[index].editNum = goods[index].editNum + gnum

          } else {
            cartnum = parseInt(goods[index].nums) + gnum
            goods[index].nums = cartnum
            that.setData({
              cartList: goods

            })
          }





          if (seltype == 1 && mit > 0 && sylimit > 0) {
            synums = sylimit - gnum
            synums = synums > 0 ? synums : 0
            if (type == 1) {
              goods[index]['details'][0].sylimit = synums
            } else {
              goods[index].sylimit = synums
            }

          }

          that.setData({
            totalPrice: resData.price,
            total: res.data.total_count
          })
          that.CartCount(menu, idsList, gnum)
          if (type == 1) {
            that.data.curstore = parseInt(goods[index].editNum)
          } else {
            that.data.curstore = parseInt(goods[index].nums)
          }


        },
        fail(res) {

          App.Util.showToast(res.data.msg)
          that.data.isAddcart = true
        },
        complete() {
          if (type == 1) {
            goods[index].addstate = true
            that.setData({
              goods
            })
          }
        }
      })

    } else {

      if (type == 1) {
        if (parseInt(goods[index].editNum) <= 0) {
          return
        }
        goods[index].addstate = false
        that.setData({
          goods
        })
      } else {

        if (parseInt(goods[index].nums) <= 0) {
          return
        }

      }
      that.setData({
        cartList: goods
      })
      nums.push(-gnum)
      that.data.isAddcart = false
      App.Util.request({
        url: App.Api.sellerAddCartAll,
        data: {
          ids: JSON.stringify(ids),
          props: JSON.stringify(props),
          nums: JSON.stringify(nums),
          shopids: JSON.stringify(shopids),
          type: 1,
          carttype: 1,
          check: 0,
          buytype: 1
        },
        method: 'POST',
        success(res) {
          that.data.isAddcart = true
          var resData = res.data.orderPrices
          cartnum = parseInt(goods[index].editNum) - gnum
          if (type == 2) {
            cartnum = parseInt(goods[index].nums) - gnum
            goods[index].nums = cartnum
            let goodsp = []
            goods.forEach(v => {
              if (v.nums > 0) {
                goodsp.push(v)
              }
            })


            if (goodsp.length == 0) {
              /* that.setData({
                isShowCartList: false,
              }) */
              that.clickHideCartList()
            }

            that.setData({
              cartList: goodsp

            })

          }
          if (seltype == 1 && mit > 0 && sylimit >= 0) {
            synums = sylimit > 0 ? sylimit : 0
            if (type == 1) {
              goods[index]['details'][0].sylimit = synums
            } else {
              goods[index].sylimit = synums
            }
          }
          if (type == 1) {
            goods[index].editNum = cartnum
          }

          if (type == 1) {
            that.setData({
              goods
            })
          }

          that.setData({
            totalPrice: resData.price,
            total: res.data.total_count
          })

          that.CartCount(menu, idsList, -gnum)
          if (type == 1) {
            that.data.curstore = parseInt(goods[index].editNum)
          }
         

        },
        fail(res) {
          console.log(res.data.msg || "加入购物车失败！")

          App.Util.showToast(res.data.msg)
          that.data.isAddcart = true
        },
        complete() {

          if (type == 1) {
            goods[index].addstate = true
            that.setData({
              goods
            })
          }
        }
      })
    }

  },
  // add: function (e) {

  //   let gnum = 1
  //   let goods = []
  //   let type = e.currentTarget.dataset.type
  //   if (!this.data.isAddcart) {
  //     return
  //   }
  //   if (type == 1) {
  //     goods = this.data.goods
  //   } else {
  //     goods = this.data.cartList
  //   }
  //   let index = e.currentTarget.dataset.index
  //   let set = e.currentTarget.dataset.set

  //   let now = goods[index]

  //   let pid = now.id
  //   let idsList = now.key_id
  //   let propid = ''
  //   let limit = 0
  //   let sylimit = 0
  //   let store = 0
  //   let mit = 0
  //   let base = 0
  //   let isbase = 0
  //   let curstore = 0
  //   if (type == 1) {

  //     propid = now.details[0].propsId
  //     limit = parseInt(now.details[0].limit.min)
  //     sylimit = parseInt(now.details[0].sylimit)
  //     store = parseInt(now.details[0].store)
  //     mit = parseInt(now.details[0].limit.max)
  //     base = parseInt(now.details[0].base)
  //     isbase = parseInt(now.details[0].isbase)
  //     curstore = parseInt(this.data.curstore) || sylimit
  //   } else {
  //     propid = now.props
  //     limit = parseInt(now.min)
  //     sylimit = parseInt(now.sylimit)
  //     store = parseInt(now.store)
  //     mit = parseInt(now.max)
  //     base = parseInt(now.base)
  //     isbase = parseInt(now.isbase)
  //     curstore = parseInt(this.data.curstore) || sylimit
  //   }

  //   let parentId = wx.getStorageSync('globalData').userInfo.p_shop_id
  //   let seltype = wx.getStorageSync('globalData').userInfo.seltype


  //   let cartnum = 0
  //   let synums = 0

  //   if (store <= 0) {
  //     that.data.isAddcart = false
  //     App.Util.showToast("库存不足！")
  //     return
  //   }
  //   let that = this


  //   if (seltype == 1) {
  //     if (set != 1) {
  //       if (seltype == 1) {
  //         if (isbase == 1 && base > 0 && mit > 0) {
  //           sylimit += base
  //         } else {
  //           sylimit += 1
  //         }
  //       }
  //     }

  //     if (mit > 0) {
  //       if (sylimit == 0) {
  //         App.Util.showToast("您分配购买数量已用完！")
  //         that.data.isAddcart = true
  //         return
  //       }
  //     }

  //     if (limit > 0) {
  //       if (mit > 0 && sylimit < limit) {
  //         if (isbase == 1 && base > 0) {
  //           if (sylimit >= base) {
  //             if (store < base) {
  //               App.Util.showToast("剩余库存小于最小基数" + base)
  //               return
  //             }
  //             gnum = base
  //           } else {
  //             App.Util.showToast("剩余分配的最小购买数量小于基数" + base)
  //             return
  //           }
  //         }
  //       } else {
  //         let editNum = 0
  //         if (type == 1) {
  //           editNum = goods[index].editNum
  //         } else {
  //           editNum = goods[index].nums
  //         }
  //         if (editNum < limit) {
  //           App.Util.showToast("最小购买数为" + limit)
  //           gnum = limit
  //         } else if (base && base > 0 && isbase == 1) {
  //           gnum = base
  //         } else {
  //           gnum = 1
  //         }
  //       }
  //     } else {
  //       gnum = 1
  //     }



  //   } else {
  //     gnum = 1
  //   }


  //   let ids = [],
  //     props = [],
  //     nums = [],
  //     shopids = []
  //   ids.push(pid)
  //   props.push(propid)
  //   shopids.push(parentId)
  //   let menu = that.data.menu

  //   if (set == 1) {
  //     //购物车动画
  //     this.setData({
  //       antim: true
  //     }, () => {
  //       setTimeout(() => {
  //         this.setData({ antim: false })
  //       }, 1000)
  //     })
  //     if (mit && mit > 0 && seltype > 0) {
  //       if (gnum > sylimit) {
  //         App.Util.showToast("您已超出最大购买量！")
  //         that.data.isAddcart = true
  //         return
  //       }
  //     }
  //     if (type == 1) {
  //       goods[index].addstate = false
  //       that.setData({
  //         goods
  //       })
  //     }
  //     that.data.isAddcart = false
  //     nums.push(gnum)

  //     that.setData({
  //       cartList: goods
  //     })
  //     App.Util.request({
  //       url: App.Api.sellerAddCartAll,
  //       data: {
  //         ids: JSON.stringify(ids),
  //         props: JSON.stringify(props),
  //         nums: JSON.stringify(nums),
  //         shopids: JSON.stringify(shopids),
  //         type: 1,
  //         carttype: 1,
  //         check: 0,
  //         buytype: 1
  //       },
  //       method: 'POST',
  //       success(res) {
  //         that.data.isAddcart = true
  //         let resData = res.data.orderPrices
  //         if (type == 1) {
  //           goods[index].editNum = goods[index].editNum + gnum

  //         } else {
  //           cartnum = parseInt(goods[index].nums) + gnum
  //           goods[index].nums = cartnum
  //           that.setData({
  //             cartList: goods

  //           })
  //         }





  //         if (seltype == 1 && mit > 0 && sylimit > 0) {
  //           synums = sylimit - gnum
  //           synums = synums > 0 ? synums : 0
  //           if (type == 1) {
  //             goods[index]['details'][0].sylimit = synums
  //           } else {
  //             goods[index].sylimit = synums
  //           }

  //         }

  //         that.setData({
  //           totalPrice: resData.price,
  //           total: res.data.total_count
  //         })
  //       //  that.CartCount(menu, idsList, gnum)
  //         if (type == 1) {
  //           that.data.curstore = parseInt(goods[index].editNum)
  //         } else {
  //           that.data.curstore = parseInt(goods[index].nums)
  //         }


  //       },
  //       fail(res) {

  //         App.Util.showToast(res.data.msg)
  //         that.data.isAddcart = true
  //       },
  //       complete() {
  //         if (type == 1) {
  //           goods[index].addstate = true
  //           that.setData({
  //             goods
  //           })
  //         }
  //       }
  //     })

  //   } else {

  //     if (type == 1) {
  //       if (parseInt(goods[index].editNum) <= 0) {
  //         return
  //       }
  //       goods[index].addstate = false
  //       that.setData({
  //         goods
  //       })
  //     } else {

  //       if (parseInt(goods[index].nums) <= 0) {
  //         return
  //       }

  //     }
  //     that.setData({
  //       cartList: goods
  //     })
  //     nums.push(-gnum)
  //     that.data.isAddcart = false
  //     App.Util.request({
  //       url: App.Api.sellerAddCartAll,
  //       data: {
  //         ids: JSON.stringify(ids),
  //         props: JSON.stringify(props),
  //         nums: JSON.stringify(nums),
  //         shopids: JSON.stringify(shopids),
  //         type: 1,
  //         carttype: 1,
  //         check: 0,
  //         buytype: 1
  //       },
  //       method: 'POST',
  //       success(res) {
  //         that.data.isAddcart = true
  //         var resData = res.data.orderPrices
  //         cartnum = parseInt(goods[index].editNum) - gnum
  //         if (type == 2) {
  //           cartnum = parseInt(goods[index].nums) - gnum
  //           goods[index].nums = cartnum
  //           let goodsp = []
  //           goods.forEach(v => {
  //             if (v.nums > 0) {
  //               goodsp.push(v)
  //             }
  //           })


  //           if (goodsp.length == 0) {
  //             /* that.setData({
  //               isShowCartList: false,
  //             }) */
  //             that.clickHideCartList()
  //           }

  //           that.setData({
  //             cartList: goodsp

  //           })

  //         }
  //         if (seltype == 1 && mit > 0 && sylimit >= 0) {
  //           synums = sylimit > 0 ? sylimit : 0
  //           if (type == 1) {
  //             goods[index]['details'][0].sylimit = synums
  //           } else {
  //             goods[index].sylimit = synums
  //           }
  //         }
  //         if (type == 1) {
  //           goods[index].editNum = cartnum
  //         }

  //         if (type == 1) {
  //           that.setData({
  //             goods
  //           })
  //         }

  //         that.setData({
  //           totalPrice: resData.price,
  //           total: res.data.total_count
  //         })

  //       //  that.CartCount(menu, idsList, -gnum)
  //         if (type == 1) {
  //           that.data.curstore = parseInt(goods[index].editNum)
  //         }
  //         console.log(that.data.isShowCartList, 2223)

  //       },
  //       fail(res) {
  //         console.log(res.data.msg || "加入购物车失败！")

  //         App.Util.showToast(res.data.msg)
  //         that.data.isAddcart = true
  //       },
  //       complete() {

  //         if (type == 1) {
  //           goods[index].addstate = true
  //           that.setData({
  //             goods
  //           })
  //         }
  //       }
  //     })
  //   }

  // },


  //查询分类导航购买数量
  CartCount(menu, ids, num) {
    let [menuList, idList, numb] = [menu, ids, num]


    menuList.forEach(v => {
      if (idList.includes(v.id)) {
        if (v.num) {
          v.num = parseInt(v.num) + parseInt(numb)

        } else {
          v.num = numb

        }
      }

    })
    this.setData({
      menu: menuList
    })
    //菜单+++


  },


  // 按钮-多属性弹窗显示
  shuBtn(e) {
    let cur = e.currentTarget.dataset
    let goods = this.data.goods
    let that = this
    let [index, props, alen, goodId, title, off] = [cur.index, cur.props, cur.active, cur.id, cur.title, cur.off]
    if (off == 2) {
      App.Util.showToast("商品已售完!")
      return
    }
    that.setData({
      id: goodId
    })
    App.Util.showToast("正在请求...")
    App.Util.request({
      url: App.Api.getGood,
      data: {
        id: goodId,
        type: 1,
      },

      success(res) {
        App.Util.hideToast()
        if (res.error) {
          App.Util.showToast(res.error.msg)
          return
        }
        res.data.id = goodId
        res.data.title = title
        //获取当前的属性产品信息
        let good = []
        let currentIds = []
        res.data.details = App.Util.changeImgUrl(res.data.details, 'pic'),
          good = res.data


        let children = good.props.items[0].children



        children.forEach((child, i) => {
          let sid = child.id
          let detail = res.data.details[sid]
          if (detail.store > 0) {
            currentIds.push(sid)
          }
        })

        let curGood = good.details[currentIds[0]]
        if (curGood && curGood.store > 0) {

          if (that.data.usertype > 0) {
            if (curGood.min > 0) {
              if (curGood.store < curGood.min) {
                curGood.editNum = curGood.store
              } else {
                curGood.editNum = curGood.min
              }
            } else {
              curGood.editNum = curGood.buy
            }

          } else if (curGood.base > 0 && curGood.isbase > 0 && that.data.usertype > 0) {
            curGood.editNum = curGood.base
          } else {
            curGood.editNum = curGood.buy
          }
        }

        that.setData({
          cgood: good,
          currentPro: curGood,
          currentId: currentIds[0],
          isShow: false
        }, () => {
          let animation1 = wx.createAnimation({
            duration: 500,
            timingFunction: "ease",
            delay: 10
          });
          animation1.translateY(0).step({
            duration: 500
          });
          that.setData({
            animation1: animation1.export()
          });
        })
      },
      fail(res) {
        console.log(res.data.msg)
      }
    })
  },

  // 按钮-多属性弹窗显示改
  shugaiBtn(e) {
    let cur = e.currentTarget.dataset
    let [index, props, alen, goodId, title, off] = [cur.index, cur.props, cur.active, cur.id, cur.title, cur.off]
    let goods = this.data.goods
    goods = App.Util.changeImgUrl(goods, 'pic')
    //let idkey = goods[index].key_id
    console.log(off, goods)
    if (off == 2) {
      App.Util.showToast("商品已售完!")
      
      return
    }
    goods.forEach((x) => {
      x.editNum = 0
    })
    goods[index].details.forEach((v) => {
      v.editNum = 0
    })

    let animation1 = wx.createAnimation({
      duration: 500,
      timingFunction: "ease",
      delay: 10
    });
    animation1.translateY(0).step({
      duration: 500
    });
    this.setData({
      cgood: goods[index],
      goods: goods,
      // idkey: idkey,
      isShow: false
    }, () => {
      this.setData({
        animation1: animation1.export(),
      })
    });
  },
  selectShu(e) {
    let id = e.currentTarget.dataset.id
    let detail = this.data.cgood.details[id]
    if (detail.store <= 0) {
      App.Util.showToast("库存不足")
      return
    }
    if (detail && detail.store > 0) {
      if (this.data.usertype > 0) {
        if (detail.min > 0) {
          if (detail.store < detail.min) {
            detail.editNum = detail.store
          } else {
            detail.editNum = detail.min
          }
        } else {
          detail.editNum = detail.buy
        }

      } else if (detail.base > 0 && detail.isbase > 0 && this.data.usertype > 0) {
        detail.editNum = detail.base
      } else {
        detail.editNum = detail.buy
      }
    }
    this.setData({
      currentId: id,
      currentPro: detail
    })
  },

  //多属性加

  shuAdd(e) {
    let index = e.currentTarget.dataset.index
    let detail = this.data.cgood.details[index]
    let [base, isbase, max, limit, store, editNum] = [parseInt(detail.base), parseInt(detail.isbase), parseInt(detail.limit.max), parseInt(detail.sylimit), detail.store, parseInt(detail.editNum)]
    if (store <= 0) {
      App.Util.showToast("库存不足")
      return
    }
    // 判断库存和限购
    if (this.data.usertype > 0) {
      if (max > 0 && limit <= 0) {
        App.Util.showToast("您分配的购买数量已用完")
        return
      }
      if (base > 0 && isbase > 0) {
        detail.editNum = editNum + base
        this.setData({
          cgood: this.data.cgood
        })
        if (detail.editNum > store) {
          detail.editNum = parseInt(store / base) * base
          App.Util.showToast("您选择的商品库存不足")
        }

        if (detail.editNum > limit && limit > 0) {
          App.Util.showToast("您购买的数量已经大于分配的数量", 3000)
          return
        }

      } else {
        detail.editNum = editNum + 1
        this.setData({
          cgood: this.data.cgood
        })
        if (detail.editNum > store) {
          detail.editNum = store
          App.Util.showToast("您选择的商品库存不足")
        }

        if (detail.editNum > limit && limit > 0) {
          App.Util.showToast("您购买的数量已经大于分配的数量")
          return
        }
      }
    } else {
      detail.editNum = editNum + 1
      this.setData({
        cgood: this.data.cgood
      })
      if (detail.editNum > store) {
        detail.editNum = store
        App.Util.showToast("您选择的商品库存不足")
      }
    }
    this.setData({
      cgood: this.data.cgood
    })
  },
  //多属性减
  shuMinus(e) {
    let index = e.currentTarget.dataset.index
    let detail = this.data.cgood.details[index]
    let [base, isbase, store, max, editNum, limit] = [parseInt(detail.base), parseInt(detail.isbase), parseInt(detail.store), parseInt(detail.limit.max), parseInt(detail.editNum), -1]
    if (detail.sylimit) {
      limit = parseInt(detail.sylimit)
    }
    if (store <= 0) {
      App.Util.showToast("库存不足")
      return
    }
    if (base > 0 && isbase > 0 && this.data.usertype > 0) {

      if (limit <= 0 && max > 0) {
        App.Util.showToast("您分配的购买数量已用完")
        return
      }
      detail.editNum = parseInt(detail.editNum) - base
      if (detail.editNum < base) {
        App.Util.showToast("该商品的购买基数为" + base)
        detail.editNum = base
        this.setData({
          cgood: this.data.cgood
        })
      }
    } else {
      detail.editNum = parseInt(detail.editNum) - 1
      if (detail.editNum < 1) {
        detail.editNum = 1
      }
      this.setData({
        cgood: this.data.cgood
      })
    }
    this.setData({
      cgood: this.data.cgood
    })

  },

  //多属性输入框
  shuKeyboard(e) {
    let index = e.currentTarget.dataset.index
    let good = this.data.cgood.details[index]
    var that = this
    $wuxKeyBoard().show({
      cancelText: '完成',
      cancelTextBkgColor: '#4da1ff',
      cancelTextColor: '#fff',
      password: false,
      titleText: '',
      inputText: '请输入您要设定的数量',
      maxlength: -1,
      value: good.editNum,
      // 键盘输入回调
      onChange(res) {

      },
      // 隐藏键盘回调
      onHide(res) {
        that.setData({
          isStopWuxKeyBoardHide: true
        })
        if (res.type == 'btn') {
          let base = parseInt(good.base)
          let isbase = parseInt(good.isbase)
          let store = good.store
          let min = parseInt(good.limit.min)
          let max = parseInt(good.limit.max)
          let value = parseInt(res.data.value)
          let seltype = wx.getStorageSync('globalData').userInfo.seltype

          if (isNaN(value) || value <= 0) {
            value = 1
          }
          if (store <= 0) {
            App.Util.showToast("库存不足")
            return
          }

          let limit = -1
          if (seltype > 0 && good.sylimit) { // use active limit as max
            limit = parseInt(good.sylimit)
          }
          if (seltype > 0) {
            if (value > max) {
              if (base > 0 && isbase > 0) {
                value = parseInt(max / base) * base
              } else {
                value = max
              }
              good.editNum = value
              that.setData({
                cgood: that.data.cgood
              })
              App.Util.showToast("已超过该商品的最大购买量")
            }


            if (value % base != 0 && base > 0 && isbase > 0) {
              App.Util.showToast("该商品的购买基数为" + base + ",请按该基数的倍数购买")
              return
            }

            if (value > limit && max > 0) {
              if (base > 0 && isbase > 0) {
                value = parseInt(limit / base) * base
              } else {
                value = limit
              }
              good.editNum = value
              that.setData({
                cgood: that.data.cgood
              })
              App.Util.showToast("购买量已超过剩余购买量")
            }
            if (value > store) {
              if (base > 0 && isbase > 0) {
                value = parseInt(store / base) * base
              } else {
                value = store
              }
              good.editNum = value
              that.setData({
                cgood: that.data.cgood
              })
              App.Util.showToast("您选择的商品库存不足")
            }

          } else {
            if (value > store) {
              value = store
              good.editNum = value
              that.setData({
                cgood: that.data.cgood
              })
              App.Util.showToast("您选择的商品库存不足")
            }
          }
          that.setData({
            isStopWuxKeyBoardHide: false
          }, () => {
            $wuxKeyBoard().hide()
          })
          good.editNum = parseInt(res.data.value)
          that.setData({
            cgood: that.data.cgood
          })
        }
      },
    })

  },

  //数组求和 
  sum(arr) {
    let s = 0;
    for (let i = arr.length - 1; i >= 0; i--) {
      s += arr[i];
    }
    return s;
  },

  //多属性确定加入购物车

  shuAddCart() {
    let t = this
    if (!t.data.batchstate) {
      return
    }
    let parentId = wx.getStorageSync('globalData').userInfo.p_shop_id
    let cgood = t.data.cgood
    let [good, pid, propid, tstate, menu] = [cgood.details, t.data.cgood.id, t.data.currentId, null, t.data.menu]
    let [ids, props, nums, shopids] = [
      [],
      [],
      [],
      []
    ]

    good.forEach(v => {
      if (v.editNum) {
        props.push(v.propsId)
        nums.push(v.editNum)
        ids.push(pid)
      }
    })
    let gnum = t.sum(nums)
    console.log(gnum, 22)
    if (nums.length == 0) {
      $Message({
        content: '请设置要购买的数量！',
        type: 'default'
      });
      return
    }
    shopids.push(parentId)
    t.data.batchstate = false
    $Toast({
      content: '提交中',
      duration: 0
    });
    App.Util.request({
      url: App.Api.sellerAddCartAll,
      data: {
        ids: JSON.stringify(ids),
        props: JSON.stringify(props),
        nums: JSON.stringify(nums),
        shopids: JSON.stringify(shopids),
        type: 1,
        carttype: 1,
        check: 0,
        buytype: 1
      },
      method: 'POST',
      success(res) {
        var resData = res.data.orderPrices
        //console.log(resData)
        let cartList = t.data.cartList
        cartList.push(resData)
        t.setData({
          totalPrice: resData.price,
          total: res.data.total_count,
          cartList
        })
        console.log('123',t.data.cartList)
        tstate && clearTimeout(tstate)
        tstate = setTimeout(() => {
          $Message({
            content: "添加成功",
            type: 'default'
          });
          t.backBtn()
        }, 50)
      //  t.CartCount(menu, t.data.idkey, gnum)
      },
      fail(res) {
        $Message({
          content: res.data.msg || "加入购物车失败！",
          type: 'error'
        });

      },
      complete() {
        $Toast.hide();
        t.data.batchstate = true
      }
    })
  },

  // 按钮-多属性弹窗隐藏
  backBtn(e) {
    this.setData({
      isShow: true
    }, () => {
      let animation1 = wx.createAnimation({
        translateY: "100%",
        duration: 300,
        timingFunction: "linear",
        delay: 0
      });
      animation1.step({
        duration: 300
      });
      this.setData({
        animation1: animation1.export()
      });
    })


  },

  // 点击顶部结算显示添加的商品列表
  clickShowCartList() {

    let that = this
    let goods = this.data.goods
    let animation2 = ""
    if (that.data.cartloading) {
      return
    }
    that.setData({
      cartloading: true
    })
    App.Util.request({
      url: App.Api.sellerCartUrl,
      success(res) {

        if (res.data && res.data.cart[0].groups[0].goods && res.data.cart[0].groups[0].goods.length > 0) {
          goods.forEach(v => {
            v.editNum = 0
          })

          that.setData({
            cartList: App.Util.changeImgUrl(res.data.cart[0].groups[0].goods, 'pic'),
            isShowCartList: !that.data.isShowCartList,
            goods: goods,
            shopid: res.data.cart[0].id,
            cartShow: false
          })
          animation2 = wx.createAnimation({
            duration: 500,
            timingFunction: "ease",
            delay: 30
          });
          animation2.translateY(0).step({
            duration: 500
          });
          that.setData({
            animation2: animation2.export()
          });


        }
      },
      fail(e) {
        $Message({
          content: res.data.msg || "获取失败！",
          type: 'error'
        });

      },
      complete() {
        that.setData({
          cartloading: false
        })
      }
    })

  },
  // 点击顶部结算隐藏添加的商品列表  
  clickHideCartList(e) {

    let animation2 = wx.createAnimation({
      translateY: "100%",
      timingFunction: "ease"
    });
    animation2.step({
      duration: 500
    });
    this.setData({
      animation2: animation2.export(),
      tarIn: true
    });
    let params = {
      isShowCartList: !this.data.isShowCartList,
      cartShow: true
    }
    if (typeof e == "undefined") {
      params = Object.assign(params, {
        "totalPrice": "0.00",
        "cartList": []
      })
    }

    this.setData(params)
  },

  move() { },
  // 点击显示键盘
  showKeyboard(e) {
    var goods = []
    let type = e.currentTarget.dataset.type
    if (type == 1) {
      goods = this.data.goods
    } else {
      goods = this.data.cartList
    }
    var index = e.currentTarget.dataset.index
    if (type == 2) {
      goods[index].editNum = goods[index].nums
    }
    var that = this
    $wuxKeyBoard().show({
      cancelText: '完成',
      cancelTextBkgColor: '#4da1ff',
      cancelTextColor: '#fff',
      password: false,
      titleText: '',
      inputText: '请输入您要设定的数量',
      maxlength: -1,
      value: goods[index].editNum || goods[index].nums,
      // 键盘输入回调
      onChange(res) {

      },
      // 隐藏键盘回调
      onHide(res) {
        that.setData({
          isStopWuxKeyBoardHide: true
        })

        let now = goods[index]
        let pid = now.id
        let prop = ''
        let max = 0
        let base = 0
        let isbase = 0
        let sylimit = 0
        let store = 0

        if (res.type == 'btn') {
          let detail = type == 1 ? now.details[0] : now.props
          if (type == 1) {
            prop = now.details[0].propsId
            max = parseInt(now.details[0].limit.max)
            base = parseInt(now.details[0].base)
            isbase = parseInt(now.details[0].isbase)
            sylimit = parseInt(now.details[0].sylimit)
            store = parseInt(now.details[0].store)
          } else {
            prop = now.props
            max = parseInt(now.max)
            base = parseInt(now.base)
            isbase = parseInt(now.isbase)
            sylimit = parseInt(now.sylimit)
            store = parseInt(now.store)
          }
          let value = parseInt(res.data.value)
          let parentId = wx.getStorageSync('globalData').userInfo.p_shop_id
          let seltype = wx.getStorageSync('globalData').userInfo.seltype
          let idsList = now.key_id
          if (sylimit <= 0 && seltype == 1 && max > 0) {

            App.Util.showToast("购买分配数量已用完")
            // goods[index].editNum = 0
            return

          }

          if (!value || value <= 0) {
            App.Util.showToast("您不能输入无效值")
            // goods[index].editNum = 0
            return
          }

          if (store <= 0) {
            App.Util.showToast("库存不足")
            return
          }

          if (parseInt(value) > store) {

            goods[index].editNum = this.data.curstore
            App.Util.showToast("购买数量超出库存")
            return
          }

          if (seltype == 1 && base > 0 && isbase == 1) {
            if (value % base != 0) {
              App.Util.showToast("该商品的购买基数为" + base + ",请按" + base + "的倍数购买")
              return
            }
            if (sylimit > 0 && sylimit < base && max > 0) {
              App.Util.showToast("分配数量小于最小基数" + base)
              return
            }

            if (value < base) {
              App.Util.showToast("购买数量小于最小基数" + base)
              value = base
            }

            if (value > sylimit && max > 0) {
              App.Util.showToast("购买数量超出可购买分配数量" + sylimit)
              return
            }
            if (value > store) {
              App.Util.showToast("购买数量超出库存")
              goods[index].editNum = this.data.curstore
              return
            }

            let count = parseInt(value / base)
            value = count * base

          }
          if (type == 2) {
            let num = parseInt(value) - parseInt(goods[index].nums)
            if (seltype == 1 && base > 0 && isbase == 1) {
              if (num % base != 0) {
                App.Util.showToast("该商品的购买基数为" + base + ",请按" + base + "的倍数购买")
                return
              }
            }

            value = num
          }



          that.setData({
            isStopWuxKeyBoardHide: false
          }, () => {
            $wuxKeyBoard().hide()
          })

          goods[index].editNum = parseInt(res.data.value)
          sylimit = parseInt(sylimit) - parseInt(value)
          goods[index].editNum = value
          let menu = that.data.menu
          var ids = [],
            props = [],
            nums = [],
            shopids = []
          ids.push(pid)
          props.push(prop)

          nums.push(value)
          shopids.push(parentId)

          App.Util.showToast("正在提交...")
          App.Util.request({
            url: App.Api.sellerAddCartAll,
            data: {
              ids: JSON.stringify(ids),
              props: JSON.stringify(props),
              nums: JSON.stringify(nums),
              shopids: JSON.stringify(shopids),
              type: 1,
              carttype: 1,
              check: 0,
              buytype: 1
            },
            method: 'POST',
            success(res) {
              App.Util.hideToast()
              var resData = res.data.orderPrices
              if (type == 1) {
                goods[index]['details'][0].sylimit = sylimit
              } else {
                goods[index].sylimit = sylimit
                goods[index].nums = parseInt(goods[index].nums) + parseInt(value)
                that.setData({
                  cartList: goods
                })

              }
              App.Util.showToast("添加成功")
              if (type == 1) {
                that.setData({
                  goods
                })
              }
              that.setData({
                totalPrice: resData.price,
                total: res.data.total_count
              })
            //  that.CartCount(menu, idsList, value)
            },
            fail(res) {
              $Message({
                content: res.data.msg || "加入购物车失败！",
                type: 'error'
              });

            }
          })
        }
      },
    })

  },

  sureClear() {
    this.setData({
      visible: true
    });
  },
  handleClick({
    detail
  }) {
    if (detail.index === 0) {
      this.setData({
        visible: false
      });
    } else {
      const action = [...this.data.actions];
      action[1].loading = true;

      this.setData({
        actions: action
      });

      this.clearCart()
      setTimeout(() => {
        action[1].loading = false;
        this.setData({
          visible: false,
          actions: action
        });
        this.clickHideCartList()
        $Message({
          content: '删除成功！',
          type: 'default'
        });
      }, 2000);
    }
  },
  //清除购物车
  clearCart() {
    let cartList = this.data.cartList
    let shopid = this.data.shopid
    let menu = this.data.menu
    var ids = [],
      props = [],
      shopids = []
    cartList.forEach(v => {
      ids.push(v.id)
      props.push(v.props)
      shopids.push(shopid)
    })
    let that = this
    if (this.data.isclear) {
      return
    }
    this.data.isclear = true

    App.Util.request({
      url: App.Api.clearCart,
      data: {
        ids: JSON.stringify(ids),
        props: JSON.stringify(props),
        shopids: JSON.stringify(shopids),
      },
      method: 'POST',

      success(res) {
        menu.forEach(v => {
          v.num = 0
        })
        that.setData({
          isclear: false,
          menu: menu
        })
      },
      fail(res) {
        $Message({
          content: res.data.msg || "清除购物车失败！",
          type: 'default'
        });

      }

    })
  },


  //删除单独商品
  deleteCart(e) {
    let cartList = this.data.cartList
    let parentId = this.data.shopid
    let index = e.currentTarget.dataset.index
    let curid = e.currentTarget.dataset.id
    let [good, pid, propid, tstate, menu] = [cartList[index], cartList[index].id, cartList[index].props, null, this.data.menu]
    let [ids, props, nums, shopids] = [
      [],
      [],
      [],
      []
    ]
    let idsList = good.key_id
    props.push(propid)
    nums.push(-good.nums)
    ids.push(pid)
    shopids.push(parentId)

    $Toast({
      content: '删除商品中',
      duration: 0
    });
    let that = this
    App.Util.request({
      url: App.Api.sellerAddCartAll,
      data: {
        ids: JSON.stringify(ids),
        props: JSON.stringify(props),
        nums: JSON.stringify(nums),
        shopids: JSON.stringify(shopids),
        type: 1,
        carttype: 1,
        check: 0,
        buytype: 1
      },
      method: 'POST',
      success(res) {
        that.data.isAddcart = true
        var resData = res.data.orderPrices

        cartList.forEach((v, i) => {

          if (v.props == propid) {
            cartList.splice(i, 1)
          }

        })


        if (cartList.length == 0) {
          that.clickHideCartList()
        }

        that.setData({
          totalPrice: resData.price,
          total: res.data.total_count,
          cartList: cartList
        })
       // that.CartCount(menu, idsList, -good.nums)

      },
      fail(res) {
        console.log(res.data.msg || "加入购物车失败！")
        App.Util.showToast(res.data.msg)
        that.data.isAddcart = true
      },
      complete() {
        $Toast.hide()
      }
    })
  },






  //取消订单
  toCancel(id) {
    let t = this
    App.Util.showToast("正在处理")
    App.Util.request({
      url: App.Api.cancelUserOrder,
      data: {
        id: id
      },
      method: 'POST',
      success(res) {
        App.Util.hideToast()
        t.setData({
          unpay: false
        })

      },
      fail(res) {
        $Message({
          content: res.data.msg || "处理失败！",
          type: 'default'
        });
      }
    })

  },
  handleOpen3() {
    this.setData({
      visible3: true
    });
  },

  handleClick3({
    detail
  }) {
    let userId = 0
    if (this.data.userInfo) {
      userId = this.data.userInfo.u_id
    }
    let [index, id, op_id, shopid] = [detail.index, this.data.unpay.id, this.data.unpay.op_id, this.data.unpay.shop_id]
    let orderType = shopid == 0 || (op_id != userId) ? 'stock' : shopid > 0 && (op_id == userId) ? 'wholesale' : ''
    if (index === 0) {
      wx.navigateTo({
        url: "../team/orderInformation?userId=" + userId + "&shopId=" + shopid + "&orderId=" + id + '&orderType=' + orderType + '&opid=' + op_id,
      })
    } else if (index === 1) {
      this.toCancel(id)
    }

    this.setData({
      visible3: false
    });
  },

  // 去结算
  toSettleAccounts() {
    if (parseInt(this.data.totalPrice) <= 0) return
    if (this.data.unpay != false) {
      this.handleOpen3()
      return
    }

    wx.navigateTo({
      url: '/pages/inventory/pay/settleAccounts',
    })
  },
  // 点击喇叭发送无库存消息
  clickHornSendMsg({ currentTarget: { dataset } }) {
    if (dataset.smsstatus == 1) {
      App.Util.showToast('您已对该商品设置库存到货通知')
      return
    }
    this.setData({
      hornGoodsData: dataset,
      visible4: true
    })
  },
  handleClick4(e) {
    let index = e.detail.index
    if (index == 1) {
      this.setSkuMsg()
    }
    this.setData({
      visible4: false
    })
  },
  setSkuMsg() {
    let { gid, index, smsstatus } = this.data.hornGoodsData,
      goods = this.data.goods,
      that = this
    $Toast({
      content: '正在保存',
      duration: 0,
      type: 'loading'
    });
    App.Util.request({
      url: App.Api.hornSendMsg,
      method: 'POST',
      data: {
        gid,// 商品id
      },
      success(res) {
        $Toast.hide()
        if (res.data.status == 1) {
          goods[index].smsstatus = 1
          that.setData({
            goods
          })
          App.Util.showToast(res.data.msg || '保存成功！')
        } else {
          App.Util.showToast(res.data.msg || '保存失败！')
        }

      },
      fail(res) {
        $Toast.hide()
        App.Util.showToast(res.data.msg || '保存失败！')
      },
      complete() { }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

    if (this.data.cartShow == false) {
      this.clickHideCartList()
    }
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