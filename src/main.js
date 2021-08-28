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
  Upload,
  Select,
  Option,
  Pagination,
} from "element-ui";

Vue.use(Avatar);
Vue.use(Button);
Vue.use(Input);
Vue.use(Upload);
Vue.use(Select);
Vue.use(Option);
Vue.use(Pagination);
Vue.prototype.$message = Message;

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
