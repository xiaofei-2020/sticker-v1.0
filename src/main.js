import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./assets/css/base.less";
import "./assets/css/common.less";
import "./mock";

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
  Switch,
  Slider,
} from "element-ui";

// 导入axios包
import axios from "axios";
// 配置请求根路径
axios.defaults.baseURL = process.env.VUE_APP_SERVER_STATIC_PATH;
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
Vue.use(Switch);
Vue.use(Slider);
Vue.prototype.$message = Message;

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
