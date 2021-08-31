<template>
  <div id="app" class="app">
    <nav class="flex jc-sb ai-c">
      <i class="el-icon-s-opportunity logo"> 斗图</i>
      <ul class="link flex">
        <router-link to="/" tag="li" class="flex ai-c" exact>主页</router-link>
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
    <div class="blank"></div>
    <main class="main">
      <router-view />
    </main>
    <div class="backtop">
      <a href="javascript:window.scrollTo(0,0)">
        <i class="el-icon-caret-top"></i>
      </a>
    </div>
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
  font-family: "Source Sans Pro", "Helvetica Neue", Arial, sans-serif;
  .backtop {
    font-size: 36px;
    text-align: center;
    position: fixed;
    bottom: 50px;
    right: 100px;
    z-index: 998;
    border-radius: 50%;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.383);
    width: 50px;
    height: 50px;
    line-height: 50px;
    a {
      color: #40a375;
    }
  }
  .backtop:hover{
    background-color: rgb(248, 246, 246);
  }
  nav {
    position: fixed;
    top: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 0 16px;
    height: 68px;
    min-width: 980px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    font-size: 16px;
    background-color: #42b983;
    color: white;
    z-index: 999;
    .logo {
      font-size: 22px;
      margin-left: 80px;
    }
    .link {
      height: 100%;
      li {
        // font-weight: bold;
        // color: #303133;
        color: white;
        height: 100%;
        padding: 0 34px;
        cursor: pointer;
        &:hover {
          background-color: #40a375;
          font-size: 18px;
        }
        &.router-link-exact-active {
          // color: #42b983;
          // background-color: #409EFF;
          // color: #fff;
          background-color: #40a375;
          font-size: 18px;
        }
      }
    }
  }

  main {
    width: 1200px;
    padding: 12px 26px;
    margin: 14px auto;
    // border: solid 1px #42b983;
    box-shadow: 0 0 12px #92c2aa;
  }
}
</style>
