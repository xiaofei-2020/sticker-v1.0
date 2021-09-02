import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./assets/css/base.less";
import "./assets/css/common.less";
import "./assets/css/main.less";

// import "./mock"; // 调用后端接口需要把这一行注释

import {
  Avatar,
  Button,
  Message,
  Input,
  InputNumber,
  Upload,
  Pagination,
  Form,
  FormItem,
  Select,
  Option,
  Tabs,
  TabPane,
  Switch,
  Slider,
  ColorPicker,
} from "element-ui";

// 导入axios包
import axios from "axios";
// 配置请求根路径
// axios.defaults.baseURL = process.env.VUE_APP_SERVER_STATIC_PATH;
// 将axios包挂载到vue原型对象上
Vue.prototype.$http = axios;

Vue.use(Avatar);
Vue.use(Button);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(Upload);

Vue.use(Pagination);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Select);
Vue.use(Option);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Switch);
Vue.use(Slider);
Vue.use(ColorPicker);
Vue.prototype.$message = Message;

Vue.config.productionTip = false;

new Vue({
  data() {
    return {
      userInfo: {},
    };
  },
  methods: {
    updateUserInfo(data) {
      this.userInfo = data;
    },
    initUserInfo() {
      this.userInfo.email = sessionStorage.getItem("email");
      this.userInfo.token = sessionStorage.getItem("token");
    },
  },
  created() {
    this.initUserInfo();
  },
  router,
  render: (h) => h(App),
}).$mount("#app");
