<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <el-button type="primary">主要按钮</el-button>

    <el-form
      :model="loginForm"
      :rules="loginFormRules"
      label-width="0px"
      class="login_form"
      ref="loginFormRef"
    >
      <!-- 邮箱 -->
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          prefix-icon="el-icon-user"
        ></el-input>
      </el-form-item>
      <!-- 密码 -->
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          prefix-icon="el-icon-lock"
          type="password"
        ></el-input>
      </el-form-item>
      <!-- 按钮 -->
      <el-form-item class="btns">
        <el-button type="primary" @click="login">登录</el-button>
        <el-button type="info" @click="resetLoginForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data() {
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: "请输入邮箱",
        password: "请输入密码",
      },
      // 表单验证规则对象
      loginFormRules: {
        // 验证用户名
        username: [
          {
            required: true,
            message: "请输入用户名",
            trigger: "blur",
          },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符之间",
            trigger: "blur",
          },
        ],
        // 验证密码
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符之间",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return false;
        // 通过http发送axios请求，post(请求地址，请求对象)
        // 如果返回的是promise对象，可以使用async await简化操作,然后进行解构
        const { data: res } = await this.$http.post("login", this.loginForm);
        console.log(res);
        if (res.meta.status !== 200) {
          // 登陆失败
          return this.$message.error("登录失败");
        }
        this.$message.success("登录成功");
      });
    },
    // 重置
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
