<template>
  <div id="app">
    <nav>
      <router-link to="/">主页</router-link> |
      <router-link to="/about">表情模板</router-link> |
      <router-link to="/generate">表情制作</router-link>
    </nav>

    <router-view />
  </div>
</template>

<script>
import { getUserInfo } from "@/api";

export default {
  name: "App",
  data() {
    return {
      userInfo: {},
    };
  },
  methods: {
    async initUserInfo() {
      let res = await getUserInfo({});

      if (res.data.success) {
        console.log(res);
        this.userInfo = res.data.data;
      }
    },
  },
  created() {
    this.initUserInfo();
  },
};
</script>

<style lang="less">
#app {
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
