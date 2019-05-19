Component({
  externalClasses: ['i-class'],
  properties: {
    name: {
      type: String,
      value: ''
    }
  },
  relations: {
    '../index/index': {
      type: 'parent'
    }
  },
  data: {
    top: 0,
    height: 0,
    isFixed: false,
    currentName: ''
  },
  methods: {
    updateDataChange() {
      const className = '.i-index-item';
      const query = wx.createSelectorQuery().in(this);
      query.select(className).boundingClientRect((res) => {
        // 修改 2019/1/11
        if (res) {
          this.setData({
            top: res.top,
            height: res.height,
            currentName: this.data.name
          })
        }
      }).exec()
    },
    updateScrollTopChange(options) {
      var scrollTop = options.scrollTop, top = options.top, height = options.height
      var str = options.str || ''
      var isFixed = false
      if (str && str === 'init') {
        isFixed = false
      }else {
        isFixed = (scrollTop >= top - 90 && scrollTop < top + height - 90 && scrollTop > 1) ? true : false
      }
      this.setData({
        isFixed,
        // top,
        // height
      })
    },
  }
})