// component/addPicture/index.js
const { $Message, $Toast } = require('../../dist/base/index.js'),App = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    limitUploadImg: {// 限制上传图片个数
      type: Number,
      value: 6
    }, 
  },

  /**
   * 组件的初始数据
   */
  data: {
    tempFilePaths: [], // 选择图片的临时路径
    canvasToTempFilePath: [], // canvas生成的图片
  },
  attached() {
    
  },
  /**
   * 组件的方法列表
   */
  methods: {
    canvasIdErrorCallback(res) {
      console.log('canvasIdErrorCallback',res)
    },
    // 添加图片
    /**
     * 获取图片
     * 转换图片为canvas
     * 上传
     */
    addPicture(e) {
      let that = this,
        tempFilePaths = this.data.tempFilePaths,
        tempFilePathsLen = this.data.tempFilePaths.length,
        limitNum = this.data.limitUploadImg
      wx.chooseImage({
        sizeType: ['original'], // 原图
        count: limitNum,
        success(res) {
          console.log(res)
          let tempFile = res.tempFilePaths,
            tempFileLen = res.tempFilePaths.length
          // 限制上传数量
          if (tempFilePathsLen + tempFileLen <= limitNum) {
            tempFilePaths = tempFilePaths.concat(tempFile)

            // that.handlePicToCanvas(tempFilePaths)
            
            that.setData({
              tempFilePaths
            })
            that.triggerEvent('handlePicture', {
              type: 'choose',
              tempFilePaths
            })
          } else {
            $Message({
              content: '最多上传' + limitNum + '张图片',
              type: 'default'
            })
          }
        },
        fail(res) {
          console.log(res)
          let content = '选择图片失败'
          if (res.errMsg == "chooseImage:fail cancel") {
            content = '取消选择图片'
          }
          $Message({
            content,
            type: 'default'
          })
        }
      })
    },
    // 将每张图片转为canvas
    handlePicToCanvas(fileArr) {
      let canvasToTempFilePath = []
      fileArr.forEach((item,index) => {
        // 获取图片信息
        this.getImageInfo(item).then((res) => {
          res.canvasId = 'canvas' + index
          // 绘制canvas
          this.drawCanvas(res).then((res1) => {
            // 将canvas转为图片
            this.canvasToTempFilePath(res).then((res2) => {

              canvasToTempFilePath.push(res2.tempFilePath)
              this.setData({
                canvasToTempFilePath
              },() => {
                console.log('end',this.data.canvasToTempFilePath)
              })

            })

          },() => {
            console.log('drawCanvas失败！')
          })
        })
      })
      return fileArr
    },
    // 获取图片信息
    getImageInfo(imgSrc) {
      let that = this
      return new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: imgSrc,
          success(res) {
            console.log('获取临时图片信息', res)
            resolve(res)
          },
          fail() {
            reject()
          }
        })
      })
    },
    // 绘制画布
    drawCanvas(options){
      options = options || {}
      let canvasId = options.canvasId || ''
      let path = options.path || ''
      let x = options.x || 0
      let y = options.y || 0
      let width = options.width || 0
      let height = options.height || 0
      let isRes = options.isRes || false
      return new Promise((resolve, reject) => {
        const ctx = wx.createCanvasContext(canvasId,this)
        
        ctx.drawImage(path, x, y, width, height);
        ctx.draw(isRes, () => {
          console.log('绘制画布信息',options)
          // drawCallBack && drawCallBack(options)
        })
        setTimeout(() => {
          resolve(options)
        },2000)
      })
    },
    // 将canvas转为图片
    canvasToTempFilePath(options) {
      let canvasId = options.canvasId || ''
      let x = options.x || 0
      let y = options.y || 0
      let width = options.width || 0
      let height = options.height || 0
      return new Promise((resolve, reject) => {
        wx.canvasToTempFilePath({
          x,
          y,
          width: width,
          height: height,
          // fileType: 'png',
          destWidth: width,
          destHeight: height,
          canvasId,
          success(res) {
            console.log('canvasToTempFilePath=',res.tempFilePath)
            
            resolve(res)
          },
          fail(res) {
            reject(res)
            console.log('fail',res)
          }
        },this)
      })
    },
    // 上传图片
    uploadPicture(options) {
      options = options || {}
      let that = this,
        // canvasToTempFilePath = this.data.canvasToTempFilePath,
        tempFilePaths = this.data.tempFilePaths,
        sucFilePath = [], // 上传成功后的图片
        promiseAll = []
        
      tempFilePaths.forEach((item,index) => {

        promiseAll[index] = new Promise((resolve, reject) => {

          wx.uploadFile({
            url: App.Api.uploadImg + '?token=' + wx.getStorageSync('sessionid') || '',
            filePath: item,
            name: 'file',
            header: {
              "Content-Type": "multipart/form-data"
            },
            formData: {
              // user: 'test'
            },
            success(res) {
              console.log('上传图片成功', res, JSON.parse(res.data))

              res = JSON.parse(res.data)
              if (res.code == 200) {
                // sucFilePath.push(res.data.src)
                resolve(res.data.src)
                // 保证图片全部上传完了，才能执行表单提交
                // if (setFilePathArr.length == 0) {
                //   resolve(sucFilePath)
                // } else {

                // }
              } else {
                $Message({
                  content: '上传图片失败!',
                });
                $Toast.hide()
                reject()
              }

            },
            complete(res) { },
            fail(res) {
              console.log('上传图片失败', res)
              $Message({
                content: '上传图片失败!',
              });
              $Toast.hide()
              reject()
            }
          })

        })
      })
      Promise.all(promiseAll).then((result) => {
        console.log('promiseAll=',promiseAll,result)
        options.success && options.success(result)
      },(res) => {
        console.log(res)
      })
    },
    setFilePath(object) {
      let setFilePath = new WeakSet([{1:'122'},{2:555}])
      // setFilePathArr = [...setFilePath]
      return setFilePath
    },
    // 删除图片
    deletePicture(e) {
      let { index } = e.currentTarget.dataset,
        tempFilePaths = this.data.tempFilePaths,
        that = this
      tempFilePaths.splice(index,1)
      // 重新渲染图片
      this.handlePicToCanvas(tempFilePaths)
      this.setData({
        tempFilePaths
      })
      that.triggerEvent('handlePicture', {
        type: 'delete',
        tempFilePaths
      })
    },
    // 预览当前图片
    previewImage(e) {
      let { url } = e.currentTarget.dataset,
        urls = []
      urls.push(url)
      wx.previewImage({
        urls,
        current: url
      })
    }
  }
})
