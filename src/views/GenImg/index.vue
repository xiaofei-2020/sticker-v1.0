<template>
  <div class="gen-img">
    <div class="gen-img-content">
      <h2><i class="el-icon-edit-outline"></i> 表情制作</h2>
      <canvas id="draw-board"></canvas>
      <div class="tool-box">
        <div class="sel-img-box">
          <el-upload
            ref="selImgUpload"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            accept=".png,.jpg"
            :on-change="handleUploadChange"
            :limit="1"
          >
            <el-button type="text"
              ><i class="el-icon-circle-plus-outline"></i
              >{{ hasChosenImg ? "重新选择" : "选择本地图片" }}</el-button
            >
          </el-upload>
          <el-button
            v-show="hasChosenImg"
            type="text"
            style="margin-left: 10px"
            @click="cancelSel"
            >取消选择</el-button
          >
        </div>
        <div class="tool-box-detail">
          <p style="margin-bottom: 4px">表情文本内容：</p>
          <el-input
            v-model="inputText"
            placeholder="请输入要添加的文字"
            style="margin-bottom: 20px"
          ></el-input>
          <div class="btn">
            <el-button type="primary" @click="genImg">生成</el-button>
            <el-button type="primary" @click="download">下载</el-button>
            <el-button type="primary" @click="collect">收藏</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import getDefDase64 from "./js/getDefDase64";
export default {
  name: "GenImg",
  components: {},
  data() {
    return {
      ctx: null, // canvas的2d上下文
      ctxWidth: 300,
      ctxHeight: 300,
      inputText: "", // 表情包的合成文字
      defaultImgBase64: "", // 用于保存默认模板图的base64
      currentImgBase64: "", // 当前图片的base64
      hasChosenImg: false, // 用户是否已经选择了本地图片
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    // 初始化
    init() {
      this.initCanvas();
      this.setDefImgBase64();
      this.initDefImg();
    },
    // 初始化默认模板图片
    initDefImg() {
      if (this.defaultImgBase64 !== "") {
        this.drawImg(this.defaultImgBase64);
      }
    },
    // 设置默认模板图片的base64
    setDefImgBase64() {
      this.defaultImgBase64 = getDefDase64();
    },
    // 初始化canvas, 获取canvas的2d上下文
    initCanvas() {
      const canvas = document.getElementById("draw-board");
      canvas.setAttribute("width", this.ctxWidth);
      canvas.setAttribute("height", this.ctxHeight);
      this.ctx = canvas.getContext("2d");
    },
    // 取消选择本地图片, 那就展示默认模板图片
    cancelSel() {
      this.hasChosenImg = false;
      if (this.defaultImgBase64 !== "") {
        this.ctx.clearRect(0, 0, this.ctxWidth, this.ctxHeight);
        this.drawImg(this.defaultImgBase64);
      } else {
        this.ctx.clearRect(0, 0, this.ctxWidth, this.ctxHeight);
      }
    },
    // 上传本地图片后触发
    async handleUploadChange(file) {
      this.hasChosenImg = true;
      this.currentImgBase64 = await this.genBase64(file.raw);
      this.ctx.clearRect(0, 0, this.ctxWidth, this.ctxHeight);
      this.drawImg(this.currentImgBase64);
      // 清除一下文件, 否则下次再次选择文件时, 不会触发chage事件
      this.$refs.selImgUpload.clearFiles();
    },
    // 根据base64画出img
    drawImg(base64) {
      return new Promise((res) => {
        this.currentImgBase64 = base64;
        var imgUpload = new Image();
        imgUpload.onload = () => {
          const widthTemp = imgUpload.width;
          const heightTemp = imgUpload.height;
          const aspectRatio = widthTemp / heightTemp;
          if (widthTemp > heightTemp) {
            this.ctx.drawImage(
              imgUpload,
              0,
              0,
              this.ctxWidth,
              this.ctxWidth / aspectRatio
            );
          } else {
            this.ctx.drawImage(
              imgUpload,
              0,
              0,
              this.ctxHeight * aspectRatio,
              this.ctxHeight
            );
          }
          res();
        };
        imgUpload.src = base64;
      });
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
    // 生成图片
    async genImg() {
      this.ctx.clearRect(0, 0, this.ctxWidth, this.ctxHeight);
      await this.drawImg(this.currentImgBase64);
      this.ctx.font = "48px serif";
      this.ctx.fillText(this.inputText, 10, 50);
    },
    // 下载
    download() {
      const link = document.createElement("a");
      link.href = document.getElementById("draw-board").toDataURL();
      link.download = "test";
      link.click();
    },
    // 收藏
    collect() {},
  },
};
</script>
<style scoped lang="less">
.gen-img {
  // position: relative;
  .gen-img-content {
    // position: absolute;
    // left: 50%;
    // transform: translateX(-50%);
    width: 50%;
    // border-left: 1px dashed #000;
    // border-right: 1px dashed #000;
    // text-align: center;
    margin: 20px auto;
    text-align: center;
    h2 {
      margin: 20px auto 30px;
      text-align: center;
      color: #40a375;
    }
    #draw-board {
      box-shadow: 0 0 5px #ccc;
    }
    .tool-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      .sel-img-box {
        // display: flex;
        // justify-content: flex-end;
        width: 300px;
        // margin-top: -10px;
        text-align: right;
      }
      .tool-box-detail {
        width: 400px;
        text-align: left;
        margin-top: 15px;
        .el-input{
          height: 32px;
          box-shadow: 0 0 2px #92c2aa;
          margin-top: 5px;
        }
        .btn {
          margin: 5px 30px;
          height: 80px;
          .el-button {
            background-color: #42b983;
            color: #fff;
            padding: 10px 20px;
            margin: 20px;
            border: 1px solid #42b983;
          }
          .el-button :hover{
            font-size: 16px;
          }
        }
      }
    }
  }
}
</style>
