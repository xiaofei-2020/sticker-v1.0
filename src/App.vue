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
        <router-link to="/collection" tag="li" class="flex ai-c"
          >我的收藏</router-link
        >
      </ul>
      <div class="user flex">
        <el-avatar
          :size="50"
          :src="'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
        >
          <!-- 加载失败备用图 -->
          <img
            src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
          />
        </el-avatar>
        <div class="ml-8 flex jc-sb" style="flex-direction: column">
          <div class="nick-name text-nowrap" :title="userInfo.eMail">
            {{ userInfo.eMail }}
          </div>
          <div class="action"><span class="logout">退出登录</span></div>
        </div>
      </div>
    </nav>
    <div class="blank"></div>
    <main class="main">
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
      userInfo: {
        online: false,
      },
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
  nav {
    padding: 0 16px;
    height: 68px;
    min-width: 980px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    font-size: 16px;
    background-color: #42b983;
    color: white;
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
    .user {
      font-size: 14px;
      .nick-name {
        width: 130px;
      }
      .action {
        text-align: right;
        .logout {
          cursor: pointer;
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
