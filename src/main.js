import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./assets/css/base.less";
import "./mock";

import { Button, Upload, Input } from "element-ui";

Vue.use(Button);
Vue.use(Upload);
Vue.use(Input);

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
