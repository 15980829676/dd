// pages/inventory/inventory.js
var App = getApp();
const {
  $Message,
  $Toast
} = require('../../dist/base/index.js');
var mta = require('../../utils/mta_analysis.js')

const {
  imgSource
} = require('../../utils/imgSource.js');
const {
  $wuxKeyBoard
} = require('../../dist/wuxUi/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    numHeight:50,
    text:'',
    seachStart:false,
    page:0,
    animationSeach:{},
    currentNavId: 1, // 导航id
    isUnfold: false, // 右侧边栏展开开关
    isEdit: false, // 是否编辑过数量
    isPullDown: false, // 是否触发上拉加载
    load_params: { // 加载更多参数
      loadmore: false,
      loadend: false,
      empty: false,
      start: 0,
      type: 1,
      nums: 1
    },
    oldtype: -1,
    animat: '', // 动画
    navTitleArr: ["全部", "有库存", "无库存"],
    buttons: [], // 侧边栏按钮
    imgSource: '',
    inventoryList: [],
    hasInventory: [], // 有库存
    noInventory: [], // 无库存
    switchArr: [], // 当前显示的数据
    saveNavScrollTop: [0, 0, 0],
    scrollTop: 0,
    btnActions: [{
      loading: false
    }, {
      loading: false
    }],
    keyboardConfig: {
      cancelText: "完成",
      password: false
    },
    isLoading: true, // 第一次加载
    noceIndex: 0,
    tabBarH: 50,
    animation1: {},
    total: 0 ,//库存总金额
    searchTitle:"库存"
  },
  // 切换导航
  handleChange(e) {
    var dataset = e.currentTarget.dataset // 自定义
    // var dataset = e.detail.currentTarget.dataset // 组件
    let key = dataset.key
    if (key == this.data.oldtype) {
      return
    }

    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    var switchArr = this.switchArr(key) // 获取当前导航对应的数据
    this.data.load_params = {
      loadmore: false,
      loadend: false,
      empty: false,
      start: 0,
      type: key,
      nums: 1
    }
    this.setData({
      currentNavId: key,
      oldtype: key,
      switchArr,
      isEdit: false,
      scrollTop: this.data.saveNavScrollTop[key],
      load_params: this.data.load_params,
      seachStart:false
    }, () => {
      this.getInventoryList('refresh')
    });
 
  },

  // 保存每个导航对应的scrollTop
  pageScroll(e) {
    var scrollTop = e.detail.scrollTop
    var saveNavScrollTop = this.data.saveNavScrollTop
    saveNavScrollTop[this.data.currentNavId] = scrollTop
    this.setData({
      saveNavScrollTop
    })
  },
  // 返回当前导航对应的数据
  // 同步修改所有数组
  switchArr(key) {

    key = Number(key)
    var switchArr = []
    switch (key) {
      case 0:
        return this.data.inventoryList
        break
      case 1:
        return this.data.hasInventory
        break
      case 2:
        return this.data.noInventory
        break
    }
    // return switchArr
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    mta.Page.init()
    var that = this

    //  this.getInventoryList('refresh')
    var windowHeight = wx.getSystemInfoSync().windowHeight

    var buttons = [{
        className: 'btn',
        icon: imgSource.page_inventory_aside3,
        label: '日志'
      },
      {
        className: 'btn',
        icon: imgSource.page_inventory_aside2,
        label: '进货'
      },

    ]
    this.setData({
      windowHeight,
      buttons,
      tabBarH: App.Util.checkPhoneType(),
    })
    // console.log()
  },
  // 获取库存列表
  getInventoryList(type) {
    var that = this
    let ftype = this.data.load_params.type

    that.data.oldtype = ftype
    if (this.data.load_params.loadmore || this.data.load_params.loadend) return false
    this._getList = new Promise((resolve) => {
      if(that.data.seachStart){
        App.Util.request({
          url: App.Api.inventoryListUrl,
          data: {
            type: ftype,
            page: this.data.load_params.start,
            keyword: that.data.text
          },
          method: 'POST',
          success(res) {
            let rs = res.data.list || []
            // console.log('result',rs)
            console.log('返回数据',res )
            if (res.data.list.length == 0){
              $Message({
                content: '未找到'+that.data.text+ '相关商品',
                type: 'default'
              });
              return
            }
            if (that.data.load_params.type == 1) {
             
              that.setData({
                total: res.data.total
              })
            }

            resolve(rs)
          },
          fail(e) {
            that.data.oldtype = -1
          },
          complete() {
            that.setData({
              isLoading: false
            })
            $Toast.hide()
          }
        })
      }else{
        App.Util.request({
          url: App.Api.inventoryListUrl,
          data: {
            type: ftype,
            start: this.data.load_params.start
          },
          method: 'POST',
          success(res) {
            let rs = res.data.list || []
            // console.log('result',rs)
            console.log('返回数据', res)
            if (that.data.load_params.type == 1) {
              if(res.data.list.length > 0){
                that.setData({
                  total: res.data.total
                })
              }
            }

            resolve(rs)
          },
          fail(e) {
            that.data.oldtype = -1
          },
          complete() {
            that.setData({
              isLoading: false
            })
            $Toast.hide()
          }
        })
      }
    })

    App.Util.loadMore(this, {
      type,
      currentPageListName: 'inventoryList',
      dealWithData(res) { // 处理刚刚加载出来的数据
        console.log('shuju',res)
        var list = App.Util.changeImgUrl(res, 'img')
        // 列表
          list.forEach((group, groupIndex) => {
            group.self_total = that.getFloatStr(group.total)
            group.self_showBtn = false
            group.self_num = group.num

          })
     
        return list
      },
      callback(list) {
        that.dispenseInventoryData(list)
      }
    })
  },
  // 分发库存数据
  dispenseInventoryData(list) {

    var that = this
    var temp_hasInventory = [] // 有库存
    var temp_noInventory = [] // 无库存
    if (list.length > 0) {
      list.forEach((item) => {
        if (Number(item.num) > 0) {
          temp_hasInventory.push(item)
        } else {
          temp_noInventory.push(item)
        }
      })
      that.setData({
        hasInventory: temp_hasInventory,
        noInventory: temp_noInventory,
      })
      var switchArr = that.switchArr(that.data.currentNavId)
      that.setData({
        switchArr,
        isPullDown: false
      })
      // console.log(list)
      // console.log(switchArr)
    }
  },
  // 选择商品显示按钮
  chooseGoods(e) {

    var that = this
    var data = e.currentTarget.dataset
    var switchArr = that.switchArr(that.data.currentNavId)
    // var inventoryList = this.data.inventoryList
    //宫格
    // inventoryList.forEach((group,groupIndex)=>{
    //   group.forEach((item, itemIndex) => {
    //     // 不等于自身时
    //     if (groupIndex == data.group && itemIndex == data.index) {
    //       item.self_showBtn = !item.self_showBtn
    //     }else {
    //       item.self_showBtn = false
    //     }
    //   })
    // })
    // 列表
    switchArr.forEach((group, groupIndex) => {
      if (data.index == groupIndex) { // 自身
        if (data.type == 'stop') { // 阻止该层点击时隐藏按钮
          group.self_showBtn = true
        } else {
          group.self_showBtn = !group.self_showBtn
        }
      } else { // 其他
        group.self_showBtn = false
      }
    })
    this.setData({
      switchArr
    })
  },
  // 编辑商品数量
  editGoodsNum(e) {
    var that = this
    var data = e.currentTarget.dataset
    var switchArr = that.switchArr(that.data.currentNavId)
    // var inventoryList = this.data.inventoryList
    // 宫格
    // if (data.type == "add") { // 添加数量
    //   inventoryList[data.group][data.index].goods_num = parseInt(inventoryList[data.group][data.index].goods_num) + 1
    // }else { // 减少数量
    //   if (inventoryList[data.group][data.index].goods_num<=0) return false
    //   inventoryList[data.group][data.index].goods_num = parseInt(inventoryList[data.group][data.index].goods_num) - 1
    // }
    // 列表
    let total = parseFloat(that.data.total);
    switchArr[data.index].isEdit = true
    if (data.type == "add") { // 添加数量
      switchArr[data.index].self_num = parseInt(switchArr[data.index].self_num) + 1

    } else { // 减少数量
      if (switchArr[data.index].self_num <= 0) return false
      switchArr[data.index].self_num = parseInt(switchArr[data.index].self_num) - 1
      //switchArr[data.index].self_total = parseFloat(switchArr[data.index].avg * switchArr[data.index].self_num)  

    }

    if (that.data.load_params.type == 2) {
      switchArr[data.index].self_total = that.getFloatStr(parseFloat(switchArr[data.index].price * switchArr[data.index].self_num))
    } else {
      switchArr[data.index].self_total = that.getFloatStr(parseFloat(switchArr[data.index].avg * switchArr[data.index].self_num))
      let avg = isNaN(parseFloat(switchArr[data.index].avg)) ? '0' : parseFloat(switchArr[data.index].avg)
      if (data.type == "add") {
        total += parseFloat(avg)
      } else {
        total -= parseFloat(avg)
      }
      total = that.getFloatStr(total)
      that.setData({
        total
      })

      // switchArr.map((item)=>{
      //   console.log(parseFloat(item.self_total))
      //   total += parseFloat(item.self_total)
      // })

      that.setData({
        total
      })

    }
    this.setData({
      switchArr,
      isEdit: true,
      animat: 'animatUp'
    },() => {
      this.animationAction()
    })
  },
  animationAction () {
    let tabBarH = this.data.tabBarH,
    animat = this.data.animat
    let num = animat == 'animatUp' ? 1 : -1
    let animation1 = wx.createAnimation({
      duration: 500,
      timingFunction:'linear',
      delay: 10
    });
    animation1.bottom(num*tabBarH).step({
      duration: 500
    });
    this.setData({
      animation1: animation1.export()
    });
  },
  getFloatStr(num) {
    num += '';
    num = num.replace(/[^0-9|\.]/g, ''); //清除字符串中的非数字非.字符  

    if (/^0+/) //清除字符串开头的0  
      num = num.replace(/^0+/, '');
    if (!/\./.test(num)) //为整数字符串在末尾添加.00  
      num += '.00';
    if (/^\./.test(num)) //字符以.开头时,在开头添加0  
      num = '0' + num;
    num += '00'; //在字符串末尾补零  
    num = num.match(/\d+\.\d{2}/)[0];
    return num
  },
  // 显示输入框
  focus(e) {
    // console.log(e)
    var that = this
    var index = e.currentTarget.dataset.index
    var switchArr = that.switchArr(that.data.currentNavId)

    this.setData({
      noceIndex: index
    })
    $wuxKeyBoard().show({
      cancelText: '完成',
      cancelTextBkgColor: '#4da1ff',
      cancelTextColor: '#fff',
      password: false,
      titleText: '',
      inputText: '请输入您要设定的数量',
      maxlength: -1,
      value: switchArr[index].self_num,
      // 键盘输入回调
      onChange(res) {
        // console.log("onChange=",res)
        var data = {
          value: res,
          index
        }
        // 输入
        that.input(data)
      },
      // 隐藏键盘回调
      onHide(e) {
        //console.log(parseInt(e.data.value))
        let valu = isNaN(parseInt(e.data.value)) ? '0' : parseInt(e.data.value) + '';
        var data = {
          value: valu,
          index
        }
        // console.log("onHide=",e);
        that.blur(data)
      },
    })

    // console.log("isEdi=", this.data.isEdit)
  },
  // 赋值输入的值
  input(e) {

    var that = this
    // var value = e.detail.value
    // var index = e.currentTarget.dataset.index
    var value = e.value,
      index = e.index
    var switchArr = that.switchArr(that.data.currentNavId)
    switchArr[index].self_num = value
    switchArr[index].isEdit = true

    if (that.data.load_params.type == 2) {

      switchArr[index].self_total = that.getFloatStr(parseFloat(switchArr[index].price * switchArr[index].self_num))
    } else {
      switchArr[index].self_total = that.getFloatStr(parseFloat(switchArr[index].avg * switchArr[index].self_num))

    }


    this.setData({
      switchArr,
      isEdit: true,
      animat: 'animatUp'
    },() => {
      this.animationAction()
    })

  },
  // 失去焦点（完成）时重新确认输入的数量
  blur(e) {
    var that = this
    // var value = e.detail.value
    // var index = e.currentTarget.dataset.index
    var value = e.value,
      index = e.index
    var switchArr = that.switchArr(that.data.currentNavId)
    // console.log(switchArr[index].goods_num)

    switchArr[index].self_num = (value == "") ? switchArr[index].goods_num : value


    this.setData({
      switchArr,
      keyboardAnimation: false
    })
  },
  sys() {

  },
  // 取消修改
  btnCancel() {
    var that = this
    if (!this.btnWarning()) return false

    var switchArr = this.switchArr(this.data.currentNavId)

    let total = 0
    switchArr.forEach((item) => {
      item.self_total = item.total
      item.self_num = item.num // 还原价格
      item.self_showBtn = false // 还原按钮显示
      if (item.isEdit) {
        item.isEdit = false
      }
      if (that.data.load_params.type == 1) {
        total += parseFloat(item.self_total)
        
        that.setData({
          total: that.getFloatStr(total)
        })
      }
    })
    this.handleCancelAndConfirmBtn(this, {
      msg: '取消成功！',
      num: 0,
      type: 'default',
      callback() {
        that.setData({
          switchArr, // 还原数据
          animat: 'animatDown'
        },() => {
          that.animationAction()
        })
        setTimeout(() => {
          that.setData({
            isEdit: false, // 取消编辑状态
          })
        }, 500)
      },
    })

  },
  // 确认并提交修改过数量的商品 重新刷新数据
  btnConfirm() {
    var that = this
    if (!this.btnWarning()) return false
    // 获取编辑过的商品
    var inventoryList = this.data.inventoryList
    var btnActions = this.data.btnActions
    btnActions[1].loading = true
    this.setData({
      btnActions
    })
    //console.log(btnActions)
    var tempSaveData = [],
      proArray = []
    // 提取修改的数据

    inventoryList.forEach((item) => {

      if (item.isEdit) {
        tempSaveData.push(item)
      }
    })
    // 添加传入的数据
    tempSaveData.forEach((item) => {
      proArray.push({
        goods_id: item.id,
        ord_attr_ids: item.propsId,
        nums: item.num,
        c_nums: item.self_num
      })
    })

    var resssss = JSON.stringify(proArray)
    App.Util.request({
      url: App.Api.inventoryEditSaveUrl,
      data: {
        proArray: resssss
      },
      method: 'POST',
      success(res) {

        $Message({
          content: '保存成功！',
          type: 'default'
        });
        let totalList = 0;
        that.data.switchArr.map((it) => {
          totalList += parseFloat(it.self_total)
        })
        that.setData({
          total: that.getFloatStr(totalList)
        })
        inventoryList.forEach((group) => {
          group.self_showBtn = false // 取消商品选中状态
          tempSaveData.forEach((item) => { // 将修改成功后的数量赋值到原先存放数量的字段上
            //console.log('222', group.goods_id, item.id)
            if (group.goods_id == item.id && group.ord_attr_ids == item.propsId) {

              group.goods_num = item.self_num
              group.isEdit = false // 取消编辑状态
            }

          })
        })
        // var switchArr = that.switchArr(that.data.currentNavId)
        // // 取消商品选中状态
        // switchArr = that._initBtn(switchArr)
        // // 赋值goods_num为修改成功后的值
        // switchArr.forEach((group, groupIndex) => {
        //   tempSaveData.forEach((item, index) => {
        //     if (group.goods_id == item.goods_id && group.ord_attr_ids == item.ord_attr_ids) {
        //       group.goods_num = item.self_num
        //       group.isEdit = false
        //     }
        //   })
        // })
        // that.setData({
        //   switchArr
        // })
        that.dispenseInventoryData(inventoryList)
      },
      fail(e) {
        $Message({
          content: '保存失败！',
          type: 'error'
        });
      },
      complete() {
        var btnActions = that.data.btnActions
        btnActions[1].loading = false
        that.setData({
          btnActions,
          animat: 'animatDown'
        },() => {
          that.animationAction()
        })
        setTimeout(() => {
          that.setData({
            isEdit: false, // 取消编辑状态
          })
        }, 500)
      }
    })

  },
  btnWarning() {
    var btnActions = this.data.btnActions
    if (btnActions[0].loading) {
      $Message({
        content: '正在取消设置！',
        type: 'warning'
      });
      return false
    }
    if (btnActions[1].loading) {
      $Message({
        content: '正在保存设置！',
        type: 'warning'
      });
      return false
    }
    return true
  },
  // 按钮操作提醒
  handleCancelAndConfirmBtn(that, options) {
    var num = options.num || 0
    var msg = options.msg || ''
    var type = options.type || 'default' // default || success || warning || error
    var callback = options.callback || ''

    const btnActions = [...that.data.btnActions];
    btnActions[num].loading = true;

    this.setData({
      btnActions
    });

    setTimeout(() => {
      btnActions[num].loading = false;
      this.setData({
        btnActions
      });
      callback && callback()
      $Message({
        content: msg,
        type: type
      });
    }, 2000);
  },
  // 切换右侧边栏按钮
  switchAsideBtn(e) {
    // 已换成组件
    var type = e.currentTarget.dataset.type
    var isUnfold = false
    if (type == 'narrow') { // 隐藏
      isUnfold = false
    } else if (type == 'unfold') { // 展开
      isUnfold = true
    }
    this.setData({
      isUnfold
    })
  },
  // 右侧边栏点击进入
  asideBtnJump(e) {
    // console.log(e)
    if (e.detail.index == 0) {
      wx.navigateTo({
        url: './inventoryLog',
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {},
      })
    } else if (e.detail.index == 1) {
      wx.switchTab({
        url: './orderGoods',
      })
      // wx.navigateTo({
      //   url: './orderGoods',
      //   success: function(res) {},
      //   fail: function(res) {},
      //   complete: function(res) {},
      // })
    }
    // var type = e.currentTarget.dataset.type
    // if (type == "log") {
    //   wx.navigateTo({
    //     url: './inventoryLog',
    //     success: function(res) {},
    //     fail: function(res) {},
    //     complete: function(res) {},
    //   })
    // } else if (type == "shop") {// 进入订货商城
    //   // wx.navigateTo({
    //   //   url: './orderGoods',
    //   //   success: function(res) {},
    //   //   fail: function(res) {},
    //   //   complete: function(res) {},
    //   // })
    // }
  },
  // 初始化按钮
  _initBtn(list) {
    list.forEach((group, groupIndex) => {
      group.self_showBtn = false
    })
    return list
  },
  scrolltoupper(e) {
    // console.log(e)
  },
  touchMove(e) {
    // console.log(e)
    // if() {
    //   if (e.type == "touchstart") {

    //   } else if (e.type == "touchmove") {

    //   }
    // }
  },
  touchEnd() {

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    $Toast({
      content: '加载中',
      duration: 0,
      type: 'loading'
    });
    this.setData({
      currentNavId: 1, // 导航id
      isUnfold: false, // 右侧边栏展开开关
      isEdit: false, // 是否编辑过数量
      isPullDown: false, // 是否触发上拉加载
      load_params: { // 加载更多参数
        loadmore: false,
        loadend: false,
        empty: false,
        start: 0,
        type: 1,
        nums: 1
      },
      animat: '', // 动画
      inventoryList: [],
      hasInventory: [], // 有库存
      noInventory: [], // 无库存
      switchArr: [], // 当前显示的数据
      saveNavScrollTop: [0, 0, 0],
      scrollTop: 0,
    })
    this.getInventoryList('refresh')
    App.Util.getNoticeCount(() => {
      $Toast.hide()
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  // 滚动到底部时触发
  scrolltolower(e) {
    if (this.data.seachStart){

      this.getInventoryList('pull')
    }else{
      if (e.detail.direction == "bottom" && !this.data.isPullDown) {
        this.setData({
          isPullDown: true
        })
        this.getInventoryList('pull')
      }
    }
    
  },
  btnClick(){
    let animationSeach = wx.createAnimation({
   
        timingFunction: "linear"
      });
    animationSeach.translateY(0).step({
        duration: 500
      });
      this.setData({
        animationSeach: animationSeach.export()
      });
  },
  searchText(e){
    this.setData({
      text:e.detail.value
    })
  },
  out(){
    var that = this
    var load_params = { // 加载更多参数
      loadmore: false,
      loadend: false,
      empty: false,
      start: 0,
      type: this.data.currentNavId,
      nums: 1
    }
    this.setData({
      text:'',
      seachStart:false,
      load_params
    },()=>{
      that.getInventoryList('refresh')
    })
  },
  searchClick(){
    var load_params= { // 加载更多参数
      loadmore: false,
        loadend: false,
          empty: false,
            start: 0,
            type: this.data.currentNavId,
             nums: 1
    }
    this.setData({
      seachStart:true,
      load_params
    })
    this.getInventoryList('refresh')
  },
  orderIndex(){
    var load_params = { // 加载更多参数
      loadmore: false,
      loadend: false,
      empty: false,
      start: 0,
      type: this.data.currentNavId,
      nums: 1
    }
    let animationSeach = wx.createAnimation({
      duration: 500,
      timingFunction: "linear"
    });
    animationSeach.translateY('-'+100+'%').step({
      duration: 500
    });
    this.setData({
      seachStart:false,
      text:'',
      page:0,
      load_params,
      animationSeach: animationSeach.export(),
    },()=>{
      this.getInventoryList('refresh')
    });
  },
  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function() {

  // }
})