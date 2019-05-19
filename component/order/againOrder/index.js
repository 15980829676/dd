// component/order/againOrder/index.js
var App = getApp()
const {
  $Toast,
  $Message
} = require('../../../dist/base/index');
const {
  $wuxKeyBoard
} = require('../../../dist/wuxUi/index.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visiable: {
      type: Boolean,
      value: false
    },
    goodsList: {
      type: Array,
      value: [],
      observer(n, o) {
        if (n) {
          let userInfo = wx.getStorageSync("globalData").userInfo,
            isSel = userInfo.seltype == 1? true : false
          n.forEach((item, index) => {
            // if (!item.limit || !item.limit.min) {
            //   return
            // }
            // if (index == 0) {
            //   item.status = 1
            //   item.isbase = 1
            //   item.base = 12
            //   item.limit.min = 13
            //   item.limit.max =30
            //   item.sylimit = 50
            //   item.stock =40
            // }
            let num = item.num,
              isbase = item.isbase,
              base = (userInfo.seltype == 1 && isbase == 1)?item.base > 0 ? item.base : 1:1,
              min = item.limit.min,
              max = item.limit.max,
              sylimit = item.sylimit,
              stock = item.stock,
              minval = min,
              maxval = max,
              sylimitval = sylimit
             
            
            let editNum = item.editNum = num
            item.y_sylimit = sylimit
            // 商品未下架
            if (item.status == 1) {
              if (stock) {
                if (isSel) {
                 
                  if (isbase == 1) {
                    if (minval > 0) {
                      if (base > minval) {
                        minval = base
                      } else if (base <= minval) {
                        minval = Math.ceil(minval / base) * base
                      }
                    }
                    if (maxval > 0) {

                      if (maxval > stock) {
                        maxval = parseInt(stock / base) * base
                      }

                      if (maxval > sylimitval) {
                        if (sylimitval >= base) {
                          maxval = parseInt(sylimitval / base) * base
                        }else {
                          stock = 0
                        }
                      }

                      if (maxval % base > 0) { // 不是整数倍
                        if (maxval >= base) {
                          maxval = parseInt(maxval / base) * base
                        }else {
                          stock = 0
                        }
                      }

                    } else {
                      maxval = maxval > stock ? parseInt(stock / base) * base : parseInt(maxval / base) * base
                      
                      if (stock < base){
                        stock = 0
                        console.log('景来')
                      }
                    }
                   

                  } else {

                    if (minval > 0) {
                      if (base > minval) {
                        minval = base
                      } else if (base <= minval) {
                        minval = Math.ceil(minval / base) * base
                      }
                    }
                    if (maxval > 0) {
                      maxval = maxval > stock ? stock : maxval
                      if (maxval % base > 0) { // 不是整数倍
                        maxval = parseInt(maxval / base) * base
                      }
                    }

                  }

                  if (maxval > 0) {

                    if (isbase == 1) {
                      sylimitval = parseInt(sylimitval / base) * base
                      if (sylimitval > maxval) {
                        sylimitval = parseInt(maxval / base) * base
                      }
                    } else {
                      sylimitval = sylimitval > maxval ? parseInt(maxval / base) * base : parseInt(sylimitval / base) * base
                    }

                  } else {
                    sylimitval = stock
                  }
           
                 
                  editNum = item.editNum = minval
                  item.isLowStocks = false // 是否库存不足
                  item.select = true
                  
                  console.log('index=' + index, 'editNum=', item.editNum, 'minval=', minval, 'maxval =', maxval,'sylimitval=',sylimitval)
                  if (stock == 0) {
                    item.editNum = 0
                    item.isLowStocks = true
                    item.select = false
                  }
                  // sylimitval,stock,maxval,minval
                  if (sylimitval == 0 && maxval > 0) {
                    // App.Util.showToast('您分配购买数量已用完')
                    item.editNum = 0
                    // item.isLowStocks = true // 是否库存不足
                    item.select = false
                  }
                
                  if (minval > stock) {
                    // App.Util.showToast('库存不足')
                    item.editNum = 0
                    item.isLowStocks = true
                    item.select = false
                  }
                  if (minval > 0 && minval > sylimitval) {
                    item.editNum = 0
                    item.isLowStocks = true
                    item.select = false
                  }
                  
                  if (maxval > 0 && sylimitval <= 0) {
                    // App.Util.showToast("您分配购买数量已用完")
                    item.editNum = 0
                    // item.isLowStocks = true
                    item.select = false
                  }
                  
                  if (maxval > 0 && editNum > sylimitval) {
                    // App.Util.showToast("已超出剩余购买数量" + sylimitval)
                    item.editNum = 0
                    // item.isLowStocks = true
                    item.select = false
                  }
                  if (minval > 0 && editNum < minval) {
                    // App.Util.showToast("购买数量不能小于最小购买量" + minval)
                    item.editNum = 0
                    // item.isLowStocks = true
                    item.select = false
                  }
                  if (editNum < base) {
                    // App.Util.showToast("购买数量应按" + value + "的倍数购买")
                    item.editNum = 0
                    // item.isLowStocks = true
                    item.select = false
                  }
                  // item.sylimit = sylimitval

                } else { // 非直属
                  item.editNum = item.num
                  item.select = true
                }

              } else { // 库存不足
                item.editNum = 0
                item.isLowStocks = true // 是否库存不足
                item.select = false
              }
            } else { // 商品下架
              item.editNum = 0
              item.select = false
            }
            if (item.editNum <= 0) {
              item.select = false
            }
            item.sylimit = parseInt(item.sylimit) - item.editNum
            console.log('index=',index,item.sylimit)
          })
          console.log(n)
          let totalMoney = 0
          n.forEach((item, index) => {
            if (item.select) {
              totalMoney += parseInt(item.editNum) * parseFloat(item.price)
            }
          })
          console.log(totalMoney)
          this.setData({
            goodsList: n,
            goodsTotalMoney: totalMoney.toFixed(2)
          })
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tabBarh: 50,
    duplicateOrder: false, // 是否显示复制订单列表
    unpay: {}, // 未支付订单信息
    visibleModal2: false, // 未支付订单提示框
    modalData2: [ // 未支付订单提示框 
      {
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
    goodsTotalMoney: 0, // 商品总金额
  },
  attached() {
    this.setData({
      userInfo: wx.getStorageSync("globalData").userInfo,
      tabBarh: App.Util.checkPhoneType()
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    move() {},
    // 计算选中商品总金额
    sumTotalMoney() {
      let goodsList = this.data.goodsList
      let totalMoney = 0
      goodsList.forEach((item, index) => {
        if (item.select) {
          totalMoney += parseInt(item.editNum) * parseFloat(item.price)
        }
      })
      return totalMoney.toFixed(2)
    },
    // 复制订单
    clickDuplicateOrder(e) {
      let {
        type
      } = e.currentTarget.dataset
      if (type == 'open') {
        this.setData({
          visiable: true
        })
      } else if (type == 'cancel') {
        this.setData({
          visiable: false
        })
      } else if (type == 'confim') {
        this.aginToPay()
      }

    },
    // 增加或减少复制订单中的商品
    /**
     * isbase:1：按倍数加减 0：不需要
     * base: 倍数
     * status： 0:下架 1：能加减
     * stock：库存数量
     * sylimit: 剩余购买数量（每个经销商购买某件商品会有限制，如果没有限制，值为库存数量）
     * limit:max：最大购买量 min：最小购买量
     */
    changeGoods({
      currentTarget: {
        dataset
      }
    }) {
      let {
        type,
        index,
        id
      } = dataset,
      userInfo = this.data.userInfo
      const goodsList = this.data.goodsList
      let goods = goodsList

      let item = goods[index],
        min = parseInt(item.limit.min),
        max = parseInt(item.limit.max),
        sylimit = parseInt(item.sylimit),
        y_sylimit = parseInt(item.y_sylimit),
        editNum = parseInt(item.editNum),
        isbase = parseInt(item.isbase),
        base = parseInt(item.base) > 0 ? parseInt(item.base) : 1,
        stock = parseInt(item.stock),
        isSel = (userInfo.parentId == 0 && userInfo.seltype == 1) ? true : false, // 是否是直属
        value = (isSel && isbase == 1) ? base : 1,
        sylimitval = y_sylimit, // 剩余购买量
        minval = min, // 最小购买量
        maxval = max // 最大购买量
      
      if (stock <= 0) {
        App.Util.showToast('库存不足')
        return
      }
      // 如果数量是零，则不能再减
      if (editNum == 0 && type == 'reduce') return

      if (isSel) {
        if (isbase == 1) {
          if (min > 0) {
            if (value > min) {
              minval = value
            } else if (value <= min) {
              minval = Math.ceil(min / value) * value
            }
          }
          if (maxval > 0) {

            if (maxval > stock) {
              maxval = parseInt(stock / value) * value
            }

            if (maxval >= sylimit) {
              // if (sylimit >= value) {
                maxval = parseInt(sylimit / value) * value
              // }else {
              //   maxval
              // }
            }else {
              // if (sylimit>0&&maxval>=minval) {
              //   maxval = parseInt(maxval / value) * value
              // }
            }

            if (maxval % value > 0) { // 不是整数倍
              // if (maxval >= value) {
                maxval = parseInt(maxval / value) * value
              // } else {
              //   stock = 0
              // }
            }

          } else {
            maxval = maxval > stock ? parseInt(stock / value) * value : parseInt(maxval / value) * value
            
          }


        } else {

          if (minval > 0) {
            if (value > minval) {
              minval = value
            } else if (value <= minval) {
              minval = Math.ceil(minval / value) * value
            }
          }
          if (maxval > 0) {
             maxval = maxval > stock ? stock : maxval
            if (maxval % value > 0) { // 不是整数倍
              maxval = parseInt(maxval / value) * value
            }
          }

        }
      }

      if (isSel && maxval > 0) {

        if (isbase == 1) {
          sylimitval = parseInt(sylimitval / value) * value
          if (sylimitval > maxval) {
            sylimitval = parseInt(maxval / value) * value
          }
        } else {
           sylimitval = sylimitval > maxval ? parseInt(maxval / value) * value : parseInt(sylimitval / value) * value
          //sylimitval = sylimitval > maxval ? maxval : sylimitval
        }

      } else {
        if(max == 0) {
          sylimitval = stock
        }
      }

      console.log('minval=' + minval, 'maxval=' + maxval, 'sylimitval=' + sylimitval, 'sylimit=' + sylimit, 'value=' + value)
  
      // 勾选
      if (type == 'select') {
        if (isSel && sylimitval == 0 && maxval > 0) {
          App.Util.showToast('您分配购买数量已用完')
         
          return
        }
        if (isSel && minval > stock) {
          App.Util.showToast('库存不足')
          return
        }
        item.select = !item.select
      } else {

        if (type == 'reduce') { // 减
          editNum = editNum - value
          sylimitval = sylimitval + value
          console.log('减', editNum, sylimitval, minval)
          if (isSel) {
            if (isbase == 1 ) {
              if (minval > 0 && editNum < minval ) {
                App.Util.showToast('该商品不能小于最小购买量' + minval)
                return
              }
              if (editNum % value != 0) {
                App.Util.showToast('请按' + value + '的倍数购买')
                return
              }
            }else {
              if (minval > 0 && editNum <= minval) {
                App.Util.showToast('该商品不能小于最小购买量' + minval)
                return
              }
            }
          }

          

        } else if (type == 'add') { // 加
        //当总库存少于等于剩余库存时
       
              editNum = editNum + value
          
          
          console.log(sylimitval, editNum)
            if(isSel){
              if (editNum > stock){
                App.Util.showToast("已超出库存" + stock)
                return
              }
              if (editNum > sylimitval){
                App.Util.showToast("您分配购买数量已用完")
                return
              }
              
            }
            
          // if (isSel) {
            
          //   if (editNum >= stock) {
          //     App.Util.showToast("已超出库存" + stock)
          //     return
          //   }
          //   /*
          //   item.status = 1
          //     item.isbase = 1
          //     item.base = 12
          //     item.limit.min = 10
          //     item.limit.max =35
          //     item.sylimit = 35
          //     item.stock = 35
          //   */
       
          //   if (maxval > 0 && sylimitval <= 0 ) {
          //     App.Util.showToast("您分配购买数量已用完")
          //    console.log('333',sylimitval, maxval)
          //     return
          //   }
          //   if (max > 0 && editNum > max) {
          //     let num = parseInt(max / value) * value
          //     App.Util.showToast("已超出最大购买数量" + num)
          //     return
          //   }
          //   if (isbase == 1 && minval > 0 && minval > sylimitval) {
          //     // 库存不足
          //     let num = parseInt(y_sylimit/value)*value
          //     App.Util.showToast("已超出剩余购买数量" + num)
          //     return
          //   }
          //   if (isbase == 1 && maxval > 0 && editNum > sylimitval) {
          //     App.Util.showToast("已超出剩余购买数量" + y_sylimit)

          //     return
          //   }
          //   if (minval>0 && editNum < minval){
          //     App.Util.showToast("购买数量不能小于最小购买量" + minval)
          //     return
          //   }
            
            
          //   if (isbase == 1 && editNum < value) {
          //     App.Util.showToast("购买数量应按" + value + "的倍数购买")
          //     return
          //   }
         

          //   sylimitval = sylimitval - value
      

          // }

          // editNum = editNum + value
          // sylimit = sylimit - value

        } // add

        if (editNum <= 0) {
          editNum = 0
          item.select = false
        } else {
          item.select = true
        }

      } // select
      // item.limit.min = min
      // item.limit.max = max
      item.sylimit = sylimitval
      item.editNum = editNum
      // item.isbase = isbase
      // item.base = base
      // item.stock = stock
      goods[index] = item

      // console.log(item)
      let goodsTotalMoney = this.sumTotalMoney()
      this.setData({
        'goodsList': goods,
        goodsTotalMoney
      })
    },
    // 键盘输入
    keyboardInput({
      currentTarget: {
        dataset
      }
    }) {
      let {
        type,
        index
      } = dataset,
      goods = this.data.goodsList,
        userInfo = this.data.userInfo,
        that = this

      let item = goods[index],
        min = parseInt(item.limit.min),
        max = parseInt(item.limit.max),
        sylimit = parseInt(item.sylimit),
        y_sylimit = parseInt(item.y_sylimit),
        editNum = parseInt(item.editNum),
        isbase = parseInt(item.isbase),
        base = parseInt(item.base) > 0 ? parseInt(item.base) : 1,
        stock = parseInt(item.stock),
        isSel = (userInfo.parentId == 0 && userInfo.seltype == 1) ? true : false, // 是否是直属
        value = (isSel && isbase == 1) ? base : 1,
        sylimitval = y_sylimit, // 剩余购买量
        minval = min, // 最小购买量
        maxval = max // 最大购买量

      if (stock <= 0) {
        App.Util.showToast('库存不足')
        return
      }
      if (isSel) {
        if (y_sylimit <= 0 && max > 0) {
          App.Util.showToast('您分配购买数量已用完')
         // console.log(y_sylimit)
          return
        }
        if (min > stock) {
          App.Util.showToast('库存不足')
          return
        }
        
      }
      // 初始化数据minval,maxval
      if (isSel) {
        if (isbase == 1) {
          if (minval > 0) {
            if (value > minval) {
              minval = value
            } else if (value <= minval) {
              minval = Math.ceil(minval / value) * value
            }
          }
          if (maxval > 0) {

            if (maxval > stock) {
              maxval = parseInt(stock / value) * value
            }

            if (maxval > sylimitval) {
              maxval = parseInt(sylimitval / value) * value
            }

            if (maxval % value > 0) { // 不是整数倍
              maxval = parseInt(maxval / value) * value
            }

          } else {
            maxval = maxval > stock ? parseInt(stock / value) * value : parseInt(maxval / value) * value
          }


        } else {

          if (minval > 0) {
            if (value > minval) {
              minval = value
            } else if (value <= minval) {
              minval = Math.ceil(minval / value) * value
            }
          }
          if (maxval > 0) {
            maxval = maxval > stock ? stock : maxval
            if (maxval % value > 0) { // 不是整数倍
              maxval = parseInt(maxval / value) * value
            }
          }

        }
      }
      // 初始化数据sylimitval
      if (isSel && maxval > 0) {

        if (isbase == 1) {
          sylimitval = parseInt(sylimitval / value) * value
          if (sylimitval > maxval) {
            sylimitval = parseInt(maxval / value) * value
          }
        } else {
          sylimitval = sylimitval > maxval ? parseInt(maxval / value) * value : parseInt(sylimitval / value) * value
        }

      } else {
        if(max == 0) {
          sylimitval = stock
        }
      }

      if (isSel) {
        if (minval > 0 && minval > sylimitval) {
          App.Util.showToast("库存不足")
          return
        }
      }
      // 复制订单
      if (type == 'duplicate') {
        $wuxKeyBoard().show({
          cancelText: '完成',
          cancelTextBkgColor: '#4da1ff',
          cancelTextColor: '#fff',
          password: false,
          titleText: '',
          inputText: '请输入您要设定的数量',
          maxlength: -1,
          value: goods[index].editNum,
          // 键盘输入回调
          onChange(res) {
            // console.log('输入',res)
          },
          // 隐藏键盘回调
          onHide(res) {
            if (res.type == 'bkg') return
            let valu = isNaN(parseInt(res.data.value)) ? '0' : parseInt(res.data.value) + '';
            valu = parseInt(valu)

            // if (isSel && base > 0 && isbase == 1) {
            //   sylimit = item.y_sylimit

            //   if (valu > stock) {
            //     App.Util.showToast('库存不足')
            //     valu = parseInt(stock / value) * value
            //     if (sylimit <= stock) {
            //       valu = parseInt(sylimit / value) * value
            //     }
            //   }

            //   if (valu > sylimit && max > 0) {
            //     App.Util.showToast('购买数量超出可购买分配数量' + sylimit)
            //     valu = parseInt(sylimit / value) * value
            //     item.sylimit = item.y_sylimit - valu
            //     item.editNum = valu
            //     goods[index] = item
            //     that.setData({
            //       'goodsList': goods
            //     })
            //     return
            //   }
              
            //   if (valu % value != 0) {
            //     App.Util.showToast("该商品的购买基数为" + value + ",请按" + value + "的倍数购买")
            //     return
            //   }

            //   if (valu < value) {
            //     App.Util.showToast("购买数量小于最小基数" + value)
            //     valu = value
            //   }

            //   if (valu > sylimit && max > 0) {
            //     App.Util.showToast("购买数量超出可购买分配数量" + sylimit)
            //     return
            //   }

            // } else {
            //   if (valu > stock) {
            //     App.Util.showToast('购买数量超出库存')
            //     valu = stock
            //   }
            // }
            

            if (valu >= stock) {
              App.Util.showToast("已超出库存" + stock)
              if (isbase == 1) {
                valu = parseInt(stock / value) * value
              }else {
                valu = stock 
              }
            }
            if (maxval > 0 && valu > sylimitval) {
              App.Util.showToast("已超出剩余购买数量" + sylimitval)
              if (isbase == 1) {
                valu = parseInt(sylimitval / value) * value
              } else {
                valu = sylimitval
              }
            }

            if (minval > 0 && valu < minval) {
              App.Util.showToast("购买数量不能小于最小购买量" + minval)
              valu = minval
            }
            if (valu < value) {
              App.Util.showToast("购买数量应按" + value + "的倍数购买")
              valu = value
            }

              
            if (isbase == 1 && valu % value != 0) {
              App.Util.showToast('请按' + value + '的倍数购买')
              return
            }
      console.log('end=',item.y_sylimit,valu)
            item.sylimit = item.y_sylimit - valu
            item.editNum = valu
            item.select = valu == 0 ? false : true
            goods[index] = item

            let goodsTotalMoney = that.sumTotalMoney()

            that.setData({
              'goodsList': goods,
              goodsTotalMoney
            })
          }
        })
      }
    },
    // 复制订单结算
    aginToPay() {
      let goods = this.data.goodsList,
        ids = [],
        props = [],
        nums = [],
        shopids = [],
        // idx = 0, // 判断商品是否全部为空
        // selIdx = 0, // 商品勾选数量
        tempNull = [],
        that = this,
        parentId = wx.getStorageSync('globalData').userInfo.p_shop_id

      goods.forEach((item, index) => {
        if (item.select) {
          // selIdx++
          ids.push(item.id)
          props.push(item.propsId)
          nums.push(item.editNum + '')
          shopids.push(parentId)
          if (item.editNum == 0) {
            // idx++
            tempNull.push(item)
          }
        }
      })
      if (ids.length <= 0) {
        App.Util.showToast('请勾选商品！')
        return
      }
      if (tempNull.length > 0) {
        App.Util.showToast("《" + tempNull[0].title + "》数量有误")
        return
      }
      // if (idx == selIdx) {
      //   App.Util.showToast('当前还未选择商品')
      //   return
      // }
      $Toast({
        content: '正在提交',
        duration: 0,
        type: 'loading'
      });
      new Promise((resolve, reject) => {
        // 查询是否还有未支付订单
        App.Util.request({
          url: App.Api.sellerCartUrl,
          success(res) {
            console.log(res, res.data.unpay == false)
            if (res.data && res.data.unpay == false) {
              resolve(res)
            } else if (res.data && res.data.unpay != false) {
              that.setData({
                unpay: res.data.unpay,
                visiable: false,
                visibleModal2: true
              })
              $Toast.hide()
            }
          },
          fail(res) {
            $Toast.hide()
            App.Util.showToast(res.data.msg || '获取数据失败！')
          },
          complete() {

          }
        })
      }).then(() => {
        // 提交到购物车当中
        let params = {
          gids: ids, // 商品id
          attrIds: props, // 属性id
          nums: nums, // 商品数量 
          subtype: 'copy', // 复制订单类型
        }
        // wx.setStorageSync('copyOrder', params)
        that.setData({
          visiable: false,
        })
        params = JSON.stringify(params)
        wx.navigateTo({
          url: '/pages/inventory/pay/settleAccounts?copyOrder=' + params,
        })
        // App.Util.request({
        //   url: App.Api.sellerAddCartAll,
        //   data: {
        //     ids: JSON.stringify(ids),
        //     props: JSON.stringify(props),
        //     nums: JSON.stringify(nums),
        //     shopids: JSON.stringify(shopids),
        //     type: 1,
        //     carttype: 1,
        //     check: 0,
        //     buytype: 1
        //   },
        //   method: 'POST',
        //   success(res) {
        //     $Toast.hide()
        //     if (res && res.code == 200) {
        //       that.setData({
        //         visiable: false,
        //       })
        //       wx.navigateTo({
        //         url: '/pages/inventory/pay/settleAccounts',
        //       })

        //     } else {
        //       App.Util.showToast(res.msg || res.data.msg || '添加购物车失败！')
        //     }
        //   },
        //   fail(res) {
        //     $Toast.hide()
        //     App.Util.showToast(res.msg || res.data.msg || '添加购物车失败！')
        //   },
        //   complete() {}
        // })
      })

    },
    // 未付款订单处理
    handleClick2({
      detail
    }) {
      let userId = this.data.selfId || 0
      let {
        id,
        op_id,
        shop_id
      } = this.data.unpay,
        index = detail.index

      let orderType = shop_id == 0 || (op_id != userId) ? 'stock' : shop_id > 0 && (op_id == userId) ? 'wholesale' : ''
      if (index === 0) {
        wx.navigateTo({
          url: "/pages/team/orderInformation?userId=" + userId + "&shopId=" + shop_id + "&orderId=" + id + '&orderType=' + orderType + '&opid=' + op_id,
        })
      } else if (index === 1) {
        this.cancelOrder(id)
      }

      this.setData({
        visibleModal2: false
      });
    },
    // 提示弹框中的取消订单按钮
    cancelOrder(id) {
      $Toast({
        content: '正在取消订单',
        duration: 0,
        type: 'loading'
      });
      let that = this
      App.Util.request({
        url: App.Api.sellerCancelOrder,
        data: {
          id
        },
        method: 'POST',
        success(res) {
          App.Util.showToast('取消订单成功！')
          that.triggerEvent('cancelOrderEvent', {
            type: 'success'
          })
        },
        fail(res) {
          App.Util.showToast(res.data.msg || res.errMsg || '取消订单失败！')
          that.triggerEvent('cancelOrderEvent', {
            type: 'fail'
          })
        },
        complete() {
          $Toast.hide()
        }
      })
    },
  }
})