<template>
  <div class="gen-img">
    <canvas id="draw-board" width="300" height="300"></canvas>
    <div class="toolBox">
      <el-upload
        action=""
        :auto-upload="false"
        :show-file-list="false"
        accept=".png,.jpg"
        :on-change="handleUploadChange"
        :limit="1"
      >
        <el-button type="primary">上传图片</el-button>
      </el-upload>
      <el-input
        v-model="inputText"
        style="width: 50%"
        placeholder="请输入要添加的文字"
      ></el-input>
      <el-button type="primary" @click="drawText">添加文字</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "GenImg",
  components: {},
  data() {
    return {
      ctx: null, // canvas的2d上下文
      inputText: "", // 表情包的合成文字
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    // 初始化
    init() {
      this.initCanvas();
    },
    // 初始化canvas, 获取canvas的2d上下文
    initCanvas() {
      const canvas = document.getElementById("draw-board");
      this.ctx = canvas.getContext("2d");
    },
    // 图片上传后触发
    async handleUploadChange(file) {
      const base64 = await this.genBase64(file.raw);
      this.drawImg(base64);
    },
    // 根据base64画出img
    drawImg(base64) {
      var imgUpload = new Image();
      imgUpload.onload = () => {
        // 绘制
        this.ctx.drawImage(imgUpload, 0, 0, 180, 180);
      };
      imgUpload.src = base64;
    },
    // 根据txt画出文字
    drawText() {
      this.ctx.font = "48px serif";
      this.ctx.fillText(this.inputText, 10, 50);
    },
    // 生成file的base64值
    genBase64(file) {
      return new Promise((res) => {
        var reader = new FileReader();
        reader.onload = function (e) {
          const base64 = e.target.result;
          res(base64);
        };
        reader.readAsDataURL(file);
      });
    },
  },
};
</script>
<style scoped>
#draw-board {
  box-shadow: 0 0 5px #ccc;
}
</style>
