<template>
  <div>
    <div class="page-register">
      <h2><i class="el-icon-edit"></i> 密码登陆</h2>
      <section>
        <el-form
          key="login"
          :model="LoginForm"
          :rules="rules"
          ref="ruleForm"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="LoginForm.email"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="psd">
            <el-input v-model="LoginForm.psd" type="password"></el-input>
          </el-form-item>

          <el-form-item class="btns">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="goToRegiter">注册</el-button>
          </el-form-item>
        </el-form>
      </section>
    </div>
  </div>
</template>
<script>
import JSEncrypt from "jsencrypt";

export default {
  name: "Login",
  data() {
    return {
      LoginForm: {
        psd: "",
        email: "",
      },
      rules: {
        email: [
          {
            required: true,
            type: "email",
            message: "请输入邮箱",
            trigger: "blur",
          },
        ],
        psd: [
          {
            required: true,
            message: "请输入密码",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    login() {
      let encrypt = new JSEncrypt();
      let that = this;
      this.$refs.ruleForm.validate(async (valid) => {
        if (valid) {
          encrypt.setPublicKey(
            "-----BEGIN PUBLIC KEY-----\nMFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALC6d1bI8gnTcsvBwAu7oVAPfWKM8fYQ\n+Q36jkJdcD8AR3BRf+ZwOMlU7rdm0otQRfgsqJjfg3RwHGfAObPxoXsCAwEAAQ==\n-----END PUBLIC KEY-----"
          );
          const encryptKey = encrypt.encrypt(that.LoginForm.psd); //使用公钥加密，得到密文
          that.LoginForm.psd = encryptKey; //encryptKey 格式为base64
          const { data: res } = await this.$http.post("/token", that.LoginForm);

          if (!res.success) {
            this.loginLoading = false;
            return this.$message.error("登录失败 帐号或密码错误!");
          }

          this.$message.success(res.msg);

          this.$root.updateUserInfo({
            email: this.LoginForm.email,
            token: res.data,
          });

          sessionStorage.setItem("email", this.LoginForm.email);
          window.sessionStorage.setItem("token", res.data);
          this.$router.push("/");

          console.log("register_res是什么：", res);
        }
      });
    },
    goToRegiter() {
      this.$router.push("/register");
    },
  },
};
</script>

<style lang="less" scoped>
.page-register {
  .header {
    border-bottom: 2px solid #2bb8aa;
    min-width: 980px;
    color: #666;

    header {
      margin: 0 auto;
      padding: 10px 0;
      width: 980px;
    }
  }

  h2 {
    margin: 40px auto 20px;
    text-align: center;
    color: #40a375;
  }

  > section {
    margin: 0 auto 30px;
    padding-top: 30px;
    width: 980px;
    padding-left: 180px;
    min-height: 300px;
    padding-right: 200px;
    box-sizing: border-box;

    .status {
      font-size: 12px;
      margin-left: 20px;
      color: #e6a23c;
    }

    .error {
      color: red;
    }
  }
}
</style>
