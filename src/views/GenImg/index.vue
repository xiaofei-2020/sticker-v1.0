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
            <el-button type="primary" @click="handleGenImg">生成</el-button>
            <el-button type="primary" @click="download">下载</el-button>
            <el-button v-if="!hasCollect" type="primary" @click="collect"
              >收藏</el-button
            >
            <el-button v-else type="primary" @click="cancelCollect"
              >取消收藏</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getResouceById, resourcesApi, collectionApi } from "@/api";
export default {
  name: "GenImg",
  components: {},
  data() {
    return {
      ctx: null, // canvas的2d上下文
      ctxWidth: 300, // canvas当前宽度
      ctxHeight: 300, // canvas当前高度
      inputText: "", // 表情包的合成文字
      defaultImgBase64: "", // 用于保存默认模板图的base64
      currentImgBase64: "", // 当前图片的base64
      curImg: null, // 当前图片元素
      hasChosenImg: false, // 用户是否已经选择了本地图片
      textRowHeight: 50, // 一行文字的高度
      resource_id: "", //
      hasCollect: false,
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
      this.getUsrCollections();
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
      getResouceById(this.resource_id).then((res) => {
        if (res.data.success === true) {
          this.defaultImgBase64 = this.currentImgBase64 = res.data.data.img;
          this.drawImgFromBase64(this.currentImgBase64);
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
      if (this.defaultImgBase64 !== "") {
        this.ctx.clearRect(0, 0, this.ctxWidth, this.ctxHeight);
        this.drawImg(this.defaultImgBase64);
      } else {
        this.ctx.clearRect(0, 0, this.ctxWidth, this.ctxHeight);
      }
    },
    // 上传图片
    uploadImg(data) {
      return resourcesApi("post", data).then((res) => {
        if (res.success === true) {
          this.$message.success("上传图片成功");
          this.resource_id = res.resource_id;
        }
      });
    },
    // 上传本地图片后触发(只绘图)
    async handleUploadChange(file) {
      this.hasChosenImg = true;
      this.currentImgBase64 = await this.genBase64(file.raw);
      const uploadData = {
        type: "TEMPLATE",
        account_id: 123456781234567812345678,
        img: this.currentImgBase64,
        content: "",
      };
      // 上传模板图片
      this.uploadImg(uploadData);

      this.drawImgFromBase64(this.currentImgBase64);
    },
    // 根据base64绘图
    async drawImgFromBase64(base64) {
      if (!base64 || typeof base64 !== "string") {
        return;
      }

      this.curImg = await this.genImgEl(base64);
      // 根据图片大小更新canvas的大小
      const widthTemp = this.curImg.width;
      const heightTemp = this.curImg.height;
      const aspectRatio = widthTemp / heightTemp;
      this.ctxHeight = 300 / aspectRatio;
      this.updateCanvasSize(300, this.ctxHeight);

      // 绘制图片
      this.ctx.clearRect(0, 0, this.ctxWidth, this.ctxHeight);
      this.drawImg(this.curImg, this.ctxWidth, this.ctxHeight);

      // 清除一下文件, 否则下次再次选择文件时, 不会触发chage事件
      this.$refs.selImgUpload.clearFiles();
    },
    // 根据base64生成img元素
    genImgEl(base64) {
      return new Promise((resolve) => {
        const imgEl = new Image();
        imgEl.onload = () => {
          resolve(imgEl);
        };
        imgEl.src = base64;
      });
    },
    // 根据img元素在canvas上画出img
    drawImg(img, w, h) {
      this.ctx.drawImage(img, 0, 0, w, h);
    },
    // 根据textArr绘制文字
    drawText(textArr) {
      this.ctx.font = "48px serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "top";
      textArr.forEach((text, index) => {
        this.ctx.fillText(
          text,
          this.ctxWidth / 2,
          this.ctxHeight + index * this.textRowHeight
        );
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
    // 点击生成图片后触发(绘图+文字)
    async handleGenImg() {
      if (!this.curImg) {
        this.$message.error("请选择一张图片");
        return;
      }

      // 计算文字所需高度, 并相应地调整canvas大小
      const textInfo = this.genTextInfo(this.inputText, this.ctxWidth - 10);
      const totalTextRowHeight = textInfo.length * this.textRowHeight;
      this.updateCanvasSize(this.ctxWidth, this.ctxHeight + totalTextRowHeight);

      this.ctx.clearRect(0, 0, this.ctxWidth, this.ctxHeight);
      this.drawImg(this.curImg, this.ctxWidth, this.ctxHeight);
      this.drawText(textInfo);

      const uploadData = {
        type: "MEME_IMG",
        account_id: 123456781234567812345678,
        img: document.getElementById("gen-img-canvas").toDataURL(),
        content: this.inputText,
      };
      this.uploadImg(uploadData);
    },
    /**
     * 根据text和width, 将文字拆分成多行, 以数组形式表示
     * 如: '111111111111122222222222233333333' => ['111111111...', '22222222...', '3333...'],
     * 表示第一行显示'111...', 第二行显示'222...', 第三行显示'333...'
     */
    genTextInfo(text, width) {
      if ((text = text.trim()) === "") {
        return [];
      }
      let res = [];
      let tempStr = "";
      for (let char of text) {
        if (this.ctx.measureText(tempStr + char).width < width) {
          tempStr += char;
        } else {
          res.push(tempStr);
          tempStr = char;
        }
      }
      res.push(tempStr);
      return res;
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
          margin: 5px 30px;
          height: 80px;
          .el-button {
            background-color: #42b983;
            color: #fff;
            padding: 10px 20px;
            margin: 20px;
            border: 1px solid #42b983;
          }
          .el-button :hover {
            font-size: 16px;
          }
        }
      }
    }
  }
}
</style>
