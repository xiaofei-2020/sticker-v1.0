<template>
  <div id="app">
    <nav class="flex jc-sb ai-c">
      <div class="logo">LOGO</div>
      <ul class="link flex">
        <router-link to="/" tag="li" class="flex ai-c">主页</router-link>
        <router-link to="/maker" tag="li" class="flex ai-c"
          >表情制作</router-link
        >
        <router-link to="/pic" tag="li" class="flex ai-c">表情图片</router-link>
      </ul>
      <div class="user">
        <el-avatar :size="50" :src="'https://ccc'">
          <img
            src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
          />
        </el-avatar>
      </div>
    </nav>
    <main>
      <router-view />
    </main>
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
  // text-align: center;
  color: #303133;
  nav {
    padding: 0 16px;
    height: 80px;
    min-width: 980px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    .link {
      height: 100%;
      li {
        // font-weight: bold;
        color: #303133;
        height: 100%;
        padding: 0 24px;
        cursor: pointer;
        &:hover {
          background-color: #f4f4f5;
        }
        &.router-link-exact-active {
          // color: #42b983;
          // background-color: #409EFF;
          // color: #fff;
          background-color: #e9e9eb;
        }
      }
    }
  }

  main {
    width: 948px;
    padding: 16px;
    margin: 0 auto;
  }
}
</style>
