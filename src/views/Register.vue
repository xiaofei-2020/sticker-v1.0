<template>
  <div>
    <div class="page-register">
      <section>
        <el-form
          :model="RegisterForm"
          :rules="rules"
          ref="ruleForm"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="RegisterForm.email"></el-input>
            <el-button size="mini" @click="sendMsg">发送验证码</el-button>
            <span class="status">{{ statusMsg }}</span>
          </el-form-item>
          <el-form-item label="验证码" prop="code">
            <el-input v-model="RegisterForm.verify_code"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="psd">
            <el-input v-model="RegisterForm.psd" type="password"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="cpsd">
            <el-input v-model="RegisterForm.cpsd" type="password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="register"> 注册 </el-button>
            <div class="error">{{ error }}</div>
          </el-form-item>
          <el-form-item>
            <a class="f1" href="/" target="_blank">返回</a>
          </el-form-item>
        </el-form>
      </section>
    </div>
  </div>
</template>
<script>
import JSEncrypt from "jsencrypt";

export default {
  name: "Register",
  layout: "blank",
  data() {
    return {
      statusMsg: "",
      error: "",
      verify_Code: {
        type: "REGIST",
        account_email: "",
      },
      account: {
        email: "",
        psd: "",
      },
      RegisterForm: {
        verify_code: "",
        psd: "",
        cpsd: "",
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
        cpsd: [
          {
            required: true,
            message: "确认密码有误，请重新输入",
            trigger: "blur",
          },
          {
            validator: (rule, value, callback) => {
              if (value === "") {
                callback(new Error("请再次输入密码"));
              } else if (value !== this.RegisterForm.psd) {
                callback(new Error("两次输入密码不一致"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    sendMsg() {
      let that = this;
      this.$refs.ruleForm.validateField("email", async (/*valid*/) => {
        const { data: res } = await this.$http.post("/verify_code", {
          type: "REGIST",
          account_email: that.RegisterForm.email,
        });
        console.log("res是什么：", res);
        if (!res.success) {
          return this.$message.error("登录失败 帐号或密码错误!");
        }
        this.RegisterForm.verify_code = res.code;
        this.$message.success(res.msg);
      });
    },
    register() {
      let encrypt = new JSEncrypt();
      let that = this;
      this.$refs.ruleForm.validate(async (valid) => {
        if (valid) {
          encrypt.setPublicKey(
            "-----BEGIN PUBLIC KEY-----\nMFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALC6d1bI8gnTcsvBwAu7oVAPfWKM8fYQ\n+Q36jkJdcD8AR3BRf+ZwOMlU7rdm0otQRfgsqJjfg3RwHGfAObPxoXsCAwEAAQ==\n-----END PUBLIC KEY-----"
          );
          const encryptKey = encrypt.encrypt(that.RegisterForm.psd); //使用公钥加密，得到密文
          that.RegisterForm.psd = encryptKey; //encryptKey 格式为base64
          const { data: res } = await this.$http.post("/account", {
            psd: that.RegisterForm.psd,
            email: this.RegisterForm.email,
            verify_code: this.RegisterForm.verify_code,
          });
          if (!res.success) {
            this.loginLoading = false;
            return this.$message.error("注册失败 帐号或密码错误!");
          }
          this.$message.success(res.msg);
          
          this.$root.updateUserInfo({
            email: this.LoginForm.email,
            token: res.data
          });
          sessionStorage.setItem("email", this.RegisterForm.email);
          window.sessionStorage.setItem("token", res.data);
          this.$router.push("/");
        }
      });
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
