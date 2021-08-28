import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./assets/css/base.less";
import "./assets/css/common.less";
import "./mock";

import { Message, Button, Upload, Input, Form, FormItem } from "element-ui";

// 导入axios包
import axios from "axios";
// 配置请求根路径
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
// 将axios包挂载到vue原型对象上
Vue.prototype.$http = axios;

Vue.use(Button);
Vue.use(Upload);
Vue.use(Input);
Vue.use(Form);
Vue.use(FormItem);
Vue.prototype.$message = Message;
Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
