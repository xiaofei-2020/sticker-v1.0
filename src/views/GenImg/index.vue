<template>
  <div class="gen-img">
    <div class="gen-img-content">
      <h2><i class="el-icon-edit-outline"></i> 表情制作</h2>
      <canvas id="gen-img-canvas"></canvas>
      <div class="tool-box">
        <div class="sel-img-box">
          <el-upload
            ref="selImgUpload"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            accept=".png,.jpg,.webp"
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
          <span style="margin-bottom: 4px">表情文本内容：</span>
          <el-input
            v-model="inputText"
            placeholder="请输入要添加的文字"
            style="margin-bottom: 20px"
          ></el-input>
          <div style="text-align: center">
            <span class="mr-8">字体颜色：</span>
            <el-color-picker
              class="mr-16"
              v-model="fontStyleForm.color"
              size="mini"
            ></el-color-picker>
            <span class="mr-8">字体大小：</span>
            <el-input-number
              class="mr-16"
              v-model="fontStyleForm.fontSize"
              :min="10"
              :max="60"
              label="描述文字"
              size="mini"
            ></el-input-number>
          </div>
          <div class="btn">
            <el-button type="primary" @click="handleGenImg">生成</el-button>
            <el-button type="primary" @click="download">下载</el-button>
            <!-- <el-button v-if="!hasCollect" type="primary" @click="collect"
              >收藏</el-button
            >
            <el-button v-else type="primary" @click="cancelCollect"
              >取消收藏</el-button
            > -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getResouceById, collectionApi } from "@/api";
export default {
  name: "GenImg",
  components: {},
  data() {
    return {
      ctx: null, // canvas的2d上下文
      ctxWidth: 300, // canvas当前宽度
      ctxHeight: 300, // canvas当前高度
      inputText: "", // 表情包的合成文字
      defaultImgSrc: "", // 用于保存默认模板图的src
      currentImgSrc: "", // 当前图片的src
      curImg: null, // 当前图片元素
      hasChosenImg: false, // 用户是否已经选择了本地图片
      textRowHeight: 50, // 一行文字的高度
      resource_id: "", //
      hasCollect: false,
      fontStyleForm: {
        fontSize: 48,
        color: "#fff",
      },
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    // 初始化
    init() {
      this.initCanvas();
      this.initDefImg();
      // this.getUsrCollections();
    },
    // 获得用户的collections列表, 判断当前图片是否在该列表中
    getUsrCollections() {
      const params = {
        page: 1,
        pageSize: 1000,
      };
      collectionApi("get", null, params).then((res) => {
        if (res.success === true) {
          const index = res.data.elements.findIndex((item) => {
            return item.resource_id === this.resource_id;
          });
          this.hasCollect = index > -1;
        }
      });
    },
    // 更新canvas元素的宽高
    updateCanvasSize(w = 300, h = 300) {
      const canvas = document.getElementById("gen-img-canvas");
      canvas.setAttribute("width", w);
      canvas.setAttribute("height", h);
    },
    // 初始化默认模板图片
    initDefImg() {
      this.resource_id = this.$route.params.resource_id;
      getResouceById(this.resource_id).then(async (res) => {
        if (res.data.success === true) {
          this.defaultImgSrc = this.currentImgSrc = res.data.data.img;
          this.drawImgFromSrc(this.currentImgSrc);
        }
      });
    },
    // 初始化canvas, 获取canvas的2d上下文
    initCanvas() {
      const canvas = document.getElementById("gen-img-canvas");
      this.updateCanvasSize();
      this.ctx = canvas.getContext("2d");
    },
    // 取消选择本地图片, 那就展示默认模板图片
    cancelSel() {
      this.hasChosenImg = false;
      this.ctx.clearRect(0, 0, this.ctxWidth, this.ctxHeight);
      if (this.defaultImgSrc) {
        this.drawImgFromSrc(this.defaultImgSrc);
      }
    },
    // 上传本地图片后触发(只绘图)
    async handleUploadChange(file) {
      this.hasChosenImg = true;
      this.currentImgSrc = await this.genBase64(file.raw);
      this.drawImgFromSrc(this.currentImgSrc);
    },
    // 根据base64绘图, 固定片高度, 默认为300, 根据待绘制图片长宽比计算出图片宽度
    async drawImgFromSrc(src, fixedHeight = 300) {
      if (!src || typeof src !== "string") {
        return;
      }

      this.curImg = await this.genImgEl(src);
      // 根据图片大小更新canvas的大小
      const widthTemp = this.curImg.width;
      const heightTemp = this.curImg.height;
      const aspectRatio = widthTemp / heightTemp;
      this.ctxWidth = fixedHeight * aspectRatio;
      this.updateCanvasSize(this.ctxWidth, this.ctxHeight);

      // 绘制图片
      this.ctx.clearRect(0, 0, this.ctxWidth, this.ctxHeight);
      this.drawImg(this.curImg, this.ctxWidth, this.ctxHeight);

      // 清除一下文件, 否则下次再次选择文件时, 不会触发chage事件
      this.$refs.selImgUpload.clearFiles();
    },
    // 根据src生成img元素
    genImgEl(src) {
      return new Promise((resolve) => {
        const imgEl = new Image();
        imgEl.onload = () => {
          resolve(imgEl);
        };
        imgEl.src = src;
      });
    },
    // 根据img元素在canvas上画出img
    drawImg(img, w, h) {
      this.ctx.drawImage(img, 0, 0, w, h);
    },
    // 根据textArr绘制文字
    drawText(text, options = {}) {
      const { fontSize = 30, color = "#000" } = options;
      this.ctx.font = `${fontSize}px serif`;
      this.ctx.fillStyle = color;
      this.ctx.strokeStyle = "#000";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "bottom";
      this.ctx.lineWidth = "0.5";
      this.ctx.fillText(
        text,
        this.ctxWidth / 2,
        this.ctxHeight - 8,
        this.ctxWidth
      );
      this.ctx.strokeText(
        text,
        this.ctxWidth / 2, // 水平居中
        this.ctxHeight - 8,
        this.ctxWidth
      );
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
    // 点击生成图片后触发(绘图+文字)
    async handleGenImg() {
      if (!this.curImg) {
        this.$message.error("请选择一张图片");
        return;
      }

      this.ctx.clearRect(0, 0, this.ctxWidth, this.ctxHeight);
      this.drawImg(this.curImg, this.ctxWidth, this.ctxHeight);
      this.drawText(this.inputText, this.fontStyleForm);
    },

    // 下载
    download() {
      const link = document.createElement("a");
      link.href = document.getElementById("gen-img-canvas").toDataURL();
      link.download = "test";
      link.click();
    },
    // 收藏
    collect() {
      collectionApi("post", {
        resource_id: this.resource_id,
      }).then((res) => {
        if (res.success === true) {
          this.$message.success("收藏成功");
          this.hasCollect = true;
        }
      });
    },
    // 取消收藏
    cancelCollect() {
      collectionApi("delete", {
        resource_id: this.resource_id,
      }).then((res) => {
        if (res.success === true) {
          this.$message.success("取消收藏成功");
          this.hasCollect = false;
        }
      });
    },
  },
};
</script>
<style scoped lang="less">
.gen-img {
  .gen-img-content {
    margin: 0 auto;
    width: 50%;
    text-align: center;
    #gen-img-canvas {
      box-shadow: 0 0 5px #ccc;
    }
    .tool-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      .sel-img-box {
        width: 300px;
        text-align: right;
      }
      .tool-box-detail {
        width: 400px;
        text-align: left;
        margin-top: 15px;
        .el-input {
          height: 32px;
          box-shadow: 0 0 2px #92c2aa;
          margin-top: 5px;
        }
        .btn {
          display: flex;
          justify-content: space-around;
          margin: 5px 30px;
          .el-button {
            background-color: #42b983;
            color: #fff;
            padding: 10px 20px;
            border: 1px solid #42b983;
          }
          .el-button:hover {
            font-size: 16px;
          }
        }
      }
    }
  }
}
</style>
