const default_data = {
    visible: false,
    content: '',
    icon: '',
    image: '',
    duration: 2,
    mask: true,
    type: 'default', // default || success || warning || error || loading
};
const App = getApp();
let timmer = null;

Component({
    externalClasses: ['i-class'],
      properties: {
        dd: {
          type: Boolean,
          value: true,
          observer:function(i,v){
              // console.log(i,v)
          }
        }
      },
    data: {
        ...default_data,
        tabBarHeight:50,
    },

    methods: {
        handleShow (options) {
            const { type = 'default', duration = 2 } = options;

            this.setData({
                ...options,
                type,
                duration,
                visible: true,
                tabBarHeight: App.Util.checkPhoneType()
            });

            const d = this.data.duration * 1000;

            if (timmer) clearTimeout(timmer);
            if (d !== 0) {
                timmer = setTimeout(() => {
                    this.handleHide();
                    timmer = null;
                }, d);
            }
        },

        handleHide () {
            this.setData({
                ...default_data
            });
        },
      move() {}
    }
});
