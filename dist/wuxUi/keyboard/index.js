import baseBehavior from '../helpers/baseBehavior'
import mergeOptionsToData from '../helpers/mergeOptionsToData'

const defaults = {
    className: '',
    titleText: '安全键盘',
    cancelText: '取消',
    cancelTextBkgColor: '',
    cancelTextColor: '',
    inputText: '输入数字密码',
    showCancel: true,
    disorder: false,
    password: true,
    maxlength: 6,
    onHide(value) {},
    onChange(value) {},
    callback(value) {},
    // onClose(value) {},
}

/**
 * 给指一位数组随机生成二维数组
 * 
 * @param {boolean} [isRandom=false] 是否随机
 * @param {array} [arr=[1, 2, 3, 4, 5, 6, 7, 8, 9, 0]] 默认数组
 * @returns 
 */
const upsetNums = (isRandom = false, arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]) => {
    if (isRandom) {
        const floor = Math.floor
        const random = Math.random
        const len = arr.length
        let i, j, temp, n = floor(len / 2) + 1
        while (n--) {
            i = floor(random() * len)
            j = floor(random() * len)
            if (i !== j) {
                temp = arr[i]
                arr[i] = arr[j]
                arr[j] = temp
            }
        }
    }

    let nums = []

    for (let i = 0; i < 4; i++) {
        nums.push(arr.slice(i * 3, (i + 1) * 3))
    }

    return nums
}

Component({
    behaviors: [baseBehavior],
  externalClasses: ['wux-class'],
    properties: {
      isStopWuxKeyBoardHide:{
        type: false,
        observer(n,o) {
          // console.log(n,o)
        }
      }
    },
    data: mergeOptionsToData(defaults),
    methods: {
        /**
         * 隐藏
         */
        hide(e) {
          // console.log(e,this.data.isStopWuxKeyBoardHide)
          var type = {type:''}
          if (e) {
            type = { type: e.currentTarget.dataset.type }
            // 防止点击背景时键盘隐藏被阻止
            if (e.currentTarget.dataset.type == 'bkg') {
              this.setData({
                isStopWuxKeyBoardHide: false
              })
            }
          }
          if (this.data.isStopWuxKeyBoardHide) {
            this.fns.onHide.call(this, Object.assign(this, type))
            return
          }
          this.$$setData({ in: false })
          this.fns.onHide.call(this, Object.assign(this, type))
        },
        /**
         * 上拉键盘组件
         * @param {Object} opts 配置项
         * @param {String} opts.className 自定义类名
         * @param {String} opts.titleText 标题
         * @param {String} opts.cancelText 取消按钮的文字
         * @param {String} opts.inputText 提示文本
         * @param {Boolean} opts.showCancel 是否显示取消按钮
         * @param {Boolean} opts.disorder 是否打乱键盘
         * @param {Boolean} opts.password 是否密码类型
         * @param {Number} opts.maxlength 最大输入长度，设置为 -1 的时候不限制最大长度
         * @param {Function} opts.onChange change 事件触发的回调函数
         * @param {Function} opts.callback 输入完成后的回调函数
         * @param {Function} opts.onClose 输入完成后的回调函数，优先级高于 callback
         */
        show(opts = {}) {
            const nums = upsetNums(opts.disorder)
            const maxlength = opts.maxlength <= 0 ? -1 : opts.maxlength
            const keys = maxlength !== -1 ? [...new Array(maxlength || defaults.maxlength)].map(() => 1) : []
            const options = this.$$mergeOptionsAndBindMethods(Object.assign({ nums, keys, value: '' }, defaults, opts))
            const isshow = true
            this.$$setData({ in: isshow, ...options })
            return this.hide.bind(this)
        },
        /**
         * 增加
         */
        increase(e) {
            const dataset = e.currentTarget.dataset
            const nextValue = String(dataset.value)
            const { value, maxlength } = this.data
            if (value.length >= maxlength && maxlength !== -1) return

            this.updateValue(value + nextValue)
        },
        /**
         * 减少
         */
        decrease(e) {
            let { value } = this.data
            if (value.length === 0) return
          value = value + ''
            this.updateValue(value.substr(0, value.length - 1))
        },
        /**
         * 更新
         */
        updateValue(value = '') {
          let that=this;
          this.$$setData({ value })

            // onChange
            if (typeof this.fns.onChange === 'function') {
              
              this.fns.onChange.call(this, value)
            }

            // onClose
         
            if (value.length === this.data.maxlength) {
                const preCloseCallback = this.fns.onClose || this.fns.callback
                const performCloseDialog = () => this.hide()

                if (preCloseCallback && typeof preCloseCallback === 'function') {
                    const preCloseCallbackResult = preCloseCallback.call(this, value)
                    if (typeof preCloseCallbackResult === 'object') {
                        if (preCloseCallbackResult.closePromise) {
                            preCloseCallbackResult.closePromise.then(performCloseDialog, performCloseDialog)
                        } else {
                            preCloseCallbackResult.then(performCloseDialog, performCloseDialog)
                        }
                    } else if (preCloseCallbackResult !== false) {
                        performCloseDialog()
                    }
                } else {
                    performCloseDialog()
                }
            }
        },
    },
})