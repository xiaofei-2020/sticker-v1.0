<template>
  <div
    id="gen-gif"
    class="flex ai-c"
    v-loading="loading"
    element-loading-text="正在生成..."
    element-loading-spinner="el-icon-loading"
    element-loading-customClass="loading"
  >
    <div class="gen-gif-preview flex">
      <div class="img-box flex">
        <h2><i class="el-icon-edit-outline"></i> 表情制作</h2>
        <img :src="gif || gifMap[mode].url" alt="" />
        <div class="action flex">
          <el-upload
            ref="upload"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            accept=".gif"
            :on-change="handleUploadChange"
            :limit="1"
          >
            <el-button type="text"
              ><i class="el-icon-circle-plus-outline"></i
              >{{ mode === "custom" ? "重新选择" : "选择本地图片" }}</el-button
            >
          </el-upload>
          <el-button
            v-show="mode === 'custom'"
            type="text"
            style="margin-left: 10px"
            @click="cancelSelect"
            ><i class="el-icon-circle-close"></i>取消选择</el-button
          >
        </div>
      </div>
      <div class="img-box flex">
        <h2><i class="el-icon-s-operation"></i> 逐帧查看</h2>
        <img :src="gifMap[mode].currentFramePreview" alt="" />
        <p class="flex jc-c ai-c" v-show="!gifMap[mode].currentFramePreview">
          加载中...
        </p>
        <!-- <img 
          v-for="(imgItem,imgIndex) in frameList" 
          :key="imgIndex" 
          v-show="currentFrameIndex === imgIndex" 
          :src="imgItem.preview" alt="" /> -->
        <div class="action flex ai-c">
          <div style="margin-right: 20px">当前帧</div>
          <el-slider
            style="flex: 1"
            v-model="gifMap[mode].currentFrameIndex"
            :max="
              gifMap[mode].frameList.length - 1 > 0
                ? gifMap[mode].frameList.length - 1
                : 1
            "
            :format-tooltip="(value) => ++value"
            @input="changeFrame"
          ></el-slider>
          <div style="margin-left: 20px">
            {{
              `${gifMap[mode].currentFrameIndex + 1} / ${
                gifMap[mode].frameList.length
              }`
            }}
          </div>
        </div>
      </div>
    </div>

    <div class="gen-gif-content">
      <h3>内容编辑</h3>
      <div
        class="text-item"
        v-for="(item, index) in gifMap[mode].metaData.textList"
        :key="item.key"
      >
        <label :for="'text' + index">请输入第 {{ index + 1 }} 句内容</label>
        <div class="flex ai-c" style="line-height: 14px">
          <el-input
            :id="'text' + index"
            class="el-text"
            v-model="item.value"
            :maxlength="15"
          ></el-input>
          <template>
            <el-input
              class="el-frame-index"
              v-model="item.start"
              type="number"
              @blur="
                item.start = formatNumber(
                  item.start,
                  1,
                  gifMap[mode].frameList.length || 1
                )
              "
            ></el-input>
            &nbsp;~&nbsp;
            <el-input
              class="el-frame-index"
              v-model="item.end"
              type="number"
              @blur="
                item.end = formatNumber(
                  item.end,
                  1,
                  gifMap[mode].frameList.length || 1
                )
              "
            ></el-input>
            &nbsp;帧
            <el-button
              class="el-del-text-btn"
              icon="el-icon-delete"
              circle
              @click="handleDeleteText(index)"
            ></el-button>
          </template>
        </div>
      </div>
      <div class="add-btn">
        <div class="flex ai-c" style="margin: 4px 0 16px 0">
          <el-button
            class="el-add-text-btn"
            type="primary"
            icon="el-icon-plus"
            plain
            @click="handleAddText"
            >添加内容</el-button
          >
          <div class="flex ai-c h50">
            <label for="blackRect" style="margin: 0 8px">添加黑边</label>
            <el-switch id="blackRect" v-model="gifMap[mode].metaData.blackRect">
            </el-switch>
          </div>
        </div>
      </div>

      <template>
        <h3>文本设置</h3>
        <div class="text-set-wrap">
          <!-- <div class="mr-12"> -->
          <label for="fontSize">字号</label>
          <el-input-number
            class="mr-16"
            id="fontSize"
            size="mini"
            :value="
              gifMap[mode].metaData.textList[0]
                ? gifMap[mode].metaData.textList[0].fontSize
                : 1
            "
            :min="1"
            @change="(value) => handleChangeTextItem('fontSize', value)"
          ></el-input-number>
          <!-- </div>
        <div> -->
          <label for="strokeWidth" class="text-r20">文字描边</label>
          <el-input-number
            id="strokeWidth"
            size="mini"
            :value="
              gifMap[mode].metaData.textList[0]
                ? gifMap[mode].metaData.textList[0].strokeWidth
                : 0.1
            "
            :step="0.1"
            :min="0"
            @change="(value) => handleChangeTextItem('strokeWidth', value)"
          ></el-input-number>
          <!-- </div> -->
        </div>
      </template>
    </div>

    <section class="gen-gif-font"></section>

    <div class="btn">
      <el-button v-if="gifMap[mode].frameList.length" @click="generateGif"
        >生成</el-button
      >
      <el-button v-if="gif" @click="download(gif, 'gif')">下载</el-button>
      <el-button v-else @click="downloadDefaultImg(gifMap[mode].url)"
        >下载</el-button
      >
      <!-- <el-button>收藏</el-button> -->
    </div>
  </div>
</template>

<script>
import { parseGIF, decompressFrames } from "gifuct-js";
import { getBase64 } from "@/utils/common.js";
// import GIF from "../../public/gif.js";
import { getFile } from "@/api";
import GIF from "@/assets/js/gif.js";
import { getResouceById } from "@/api";

export default {
  name: "GenGif",
  data() {
    return {
      gif: "", // 作品

      mode: "default",
      gifMap: {
        default: {
          url: "",
          metaData: {
            blackRect: true, // 黑边
            textList: [
              {
                key: 1, // 临时key
                start: 2,
                end: 10,
                x: 10,
                y: 200,
                color: "#fff",
                fontSize: 16,
                strokeWidth: 0.5, // 描边宽度
                value: "",
              },
            ],
          },
          frameList: [],
          currentFramePreview: "", // 当前帧
          currentFrameIndex: 0,
        },
        custom: {
          url: "",
          metaData: {
            blackRect: true, // 黑边
            textList: [
              {
                key: 1, // 临时key
                start: 2,
                end: 10,
                x: 10,
                y: 200,
                color: "#fff",
                fontSize: 16,
                strokeWidth: 0.5, // 描边宽度
                value: "",
              },
            ],
          },
          frameList: [],
          currentFramePreview: "", // 当前帧
          currentFrameIndex: 0,
        },
      },

      loading: false,
    };
  },
  methods: {
    formatNumber(value, min, max) {
      value = parseInt(value);
      if (isNaN(value)) {
        value = min;
      }
      if (value < min) {
        value = min;
      } else if (value > max) {
        value = max;
      }
      return value;
    },
    // 下载
    async downloadDefaultImg(url) {
      let res = await getFile({}, { src: url });
      // 拿到二进制字符串 res.data.data
      // 再利用 Buffer 转为对象
      const buf = Buffer.from(res.data.data, "binary");
      let blob = new Blob([buf]);
      // let blob = new Blob([res.data], {type: 'application/octet-stream'});
      let downloadElement = document.createElement("a");
      // 创建下载的链接
      let href = window.URL.createObjectURL(blob);
      downloadElement.href = href;
      // 下载后文件名
      downloadElement.download = url.split("/").pop();
      // 点击下载
      downloadElement.click();
      // 释放掉blob对象
    },
    // 解析gif
    getGifFrames(gif) {
      return gif
        .arrayBuffer()
        .then((buff) => parseGIF(buff))
        .then((gif) => decompressFrames(gif, true));
    },
    async getDefaultGif() {
      let res = await getResouceById(this.$route.params.resource_id);

      if (res.data.success) {
        this.gifMap[this.mode].url = res.data.data.img;
        this.gifMap[this.mode].metaData = JSON.parse(res.data.data.content);
        this.gifMap[this.mode].frameList = await this.urlToBlob(
          res.data.data.img
        );

        this.pushPreview(this.gifMap[this.mode].frameList);

        this.gifMap[this.mode].currentFramePreview =
          this.gifMap[this.mode].frameList[0].preview;
        this.gifMap[this.mode].currentFrameIndex = 0;
      }
    },
    // 获取blob格式
    async urlToBlob(url) {
      let res = await getFile({}, { src: url });
      const buf = Buffer.from(res.data.data, "binary");
      let blob = new Blob([buf]);

      if (res.data.success) {
        return this.getGifFrames(blob); // 解析gif数据
      } else {
        this.$message({
          message: "获取数据失败，请稍后重试！",
          type: "error",
        });
      }
    },
    // 选择图片
    async handleUploadChange(file) {
      if (file.raw.type !== "image/gif") {
        this.$message.warning("请选择 gif 格式的图片！");
        this.$refs.upload.clearFiles();
        return;
      }

      this.mode = "custom";
      this.gif = "";

      this.gifMap[this.mode].url = await getBase64(file.raw); // 预览gif
      this.gifMap[this.mode].frameList = await this.getGifFrames(file.raw); // 解析gif数据

      this.pushPreview(this.gifMap[this.mode].frameList);

      this.gifMap[this.mode].currentFramePreview =
        this.gifMap[this.mode].frameList[0].preview;
      this.gifMap[this.mode].currentFrameIndex = 0;

      this.$refs.upload.clearFiles();
    },

    cancelSelect() {
      this.gif = "";
      this.gifMap[this.mode].url = "";
      this.gifMap[this.mode].currentFramePreview = "";
      this.gifMap[this.mode].currentFrameIndex = 0;
      this.gifMap[this.mode].frameList = [];

      this.mode = "default";
    },

    // 绘制补丁帧
    drawPatch(ctx, frame) {
      let dims = frame.dims;
      // console.log(imageData);
      if (frame.disposalType === 1) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = this.gifMap[this.mode].frameList[0].dims.width;
        tempCanvas.height = this.gifMap[this.mode].frameList[0].dims.height;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.putImageData(
          new ImageData(frame.patch, dims.width, dims.height),
          frame.dims.left,
          frame.dims.top
        );

        ctx.drawImage(tempCanvas, 0, 0);
      } else {
        ctx.clearRect(
          0,
          0,
          this.gifMap[this.mode].frameList[0].dims.width,
          this.gifMap[this.mode].frameList[0].dims.height
        );
        ctx.putImageData(
          new ImageData(frame.patch, dims.width, dims.height),
          frame.dims.left,
          frame.dims.top
        );
      }
    },
    // 每一帧绘制预览图
    pushPreview(frameList) {
      let startTime = new Date().getTime();
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = frameList[0].dims.width;
      tempCanvas.height = frameList[0].dims.height;
      const tempCtx = tempCanvas.getContext("2d");

      for (let i = 0; i < frameList.length; i++) {
        this.drawPatch(tempCtx, frameList[i]);
        frameList[i].id = i;
        frameList[i].preview = tempCanvas.toDataURL();
      }

      let endTime = new Date().getTime();
      console.log(`生成预览图耗时=${endTime - startTime}毫秒`);

      return frameList
    },
    changeFrame(newValue) {
      // console.log(newValue);
      this.gifMap[this.mode].currentFramePreview =
        this.gifMap[this.mode].frameList[newValue]?.preview || "";
      // console.log(this.currentFrameIndex);
    },
    handleAddText() {
      if (!this.gifMap[this.mode].metaData.textList[0]) {
        let text = {
          key: new Date().getTime(),
          start: 1,
          end: 2,
          x: undefined,
          y: undefined,
          color: "#fff",
          fontSize: 18,
          strokeWidth: 0.5, // 描边宽度
          value: "",
        };

        this.gifMap[this.mode].metaData.textList.push(text);
        return;
      }
      // ================================
      let text = JSON.parse(
        JSON.stringify(this.gifMap[this.mode].metaData.textList[0])
      );

      Object.assign(text, {
        key: new Date().getTime(),
        value: "",
      });

      this.gifMap[this.mode].metaData.textList.push(text);
    },

    handleDeleteText(textIndex) {
      this.gifMap[this.mode].metaData.textList.splice(textIndex, 1);
    },
    handleChangeTextItem(key, value) {
      this.gifMap[this.mode].metaData.textList.forEach((item) => {
        item[key] = value;
      });
    },
    blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          resolve(e.target.result);
        };
        // readAsDataURL
        fileReader.readAsDataURL(blob);
        fileReader.onerror = () => {
          reject(new Error("blobToBase64 error"));
        };
      });
    },
    async generateGif() {
      console.log("开始生成");
      this.loading = true;
      let startTime = new Date().getTime();

      let gifWidth = this.gifMap[this.mode].frameList[0].dims.width;
      let gifHeight = this.gifMap[this.mode].frameList[0].dims.height;

      let gif = new GIF({
        workers: 6,
        quality: 10,
      });

      for (let frameIndex in this.gifMap[this.mode].frameList) {
        let frame = this.gifMap[this.mode].frameList[frameIndex];

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = gifWidth;
        tempCanvas.height = gifHeight;
        const tempCtx = tempCanvas.getContext("2d");

        // 绘制图片
        const loadImg = (base64) => {
          return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => {
              resolve(img);
            };

            img.onerror = () => {
              reject(new Error("loadImg error"));
            };

            img.src = base64;
          });
        };

        let imgEl = await loadImg(frame.preview);

        tempCtx.drawImage(imgEl, 0, 0);

        // 添加黑边================
        if (this.gifMap[this.mode].metaData.blackRect) {
          tempCtx.fillRect(
            0,
            gifHeight -
              (this.gifMap[this.mode].metaData.textList[0].fontSize + 10),
            gifWidth,
            this.gifMap[this.mode].metaData.textList[0].fontSize + 10
          );
        }

        // =======================

        // 绘制文字================
        let text = this.gifMap[this.mode].metaData.textList.find(
          (item) => +item.start <= frameIndex && frameIndex <= +item.end
        );
        if (text) {
          tempCtx.font = `bold ${text.fontSize}px sans-serif`;

          let textWidth = gifWidth;

          tempCtx.textAlign = "center"; // 水平居中
          tempCtx.fillStyle = text.color; // 文字颜色
          tempCtx.fillText(
            text.value,
            textWidth / 2, // 水平居中
            gifHeight - 8,
            textWidth
          );

          if (text.strokeWidth > 0) {
            tempCtx.lineWidth = text.strokeWidth;
            tempCtx.strokeStyle = "#000"; // 轮廓颜色
            tempCtx.strokeText(
              text.value,
              textWidth / 2, // 水平居中
              gifHeight - 8,
              textWidth
            );
          }
        }

        gif.addFrame(tempCanvas, { copy: true, delay: frame.delay });
      }
      //==========================

      gif.on("finished", async (blob) => {
        // window.open(URL.createObjectURL(blob));

        this.gif = await this.blobToBase64(blob);
        let endTime = new Date().getTime();
        console.log(`合成完毕，耗时=${endTime - startTime}毫秒`);
        this.loading = false;
      });

      gif.render();
    },
    download(base64, fileName) {
      const link = document.createElement("a");
      link.href = base64;
      link.download = fileName;
      link.click();
    },
  },
  created() {
    this.getDefaultGif();
  },
};
</script>

<style lang="less" scoped>
#gen-gif {
  flex-direction: column;

  .text-r20 {
    margin-left: 20px;
  }
  .add-btn {
    height: 50px;
    margin: 30px auto 16px;
    .h50 {
      height: 50px;
      margin-left: 10px;
    }
  }
  .btn {
    height: 80px;
    .el-button {
      background-color: #42b983;
      color: #fff;
      padding: 10px 20px;
      margin: 20px;
      border: 1px solid #42b983;
    }
    .el-button :hover {
      font-weight: 700;
    }
  }
  .gen-gif-preview {
    // width: 300px;
    // margin: 0 auto;
    h2 {
      margin: 20px auto 30px;
      text-align: center;
      color: #40a375;
    }
    .img-box {
      max-width: 300px;
      min-width: 200px;
      text-align: center;
      margin-right: 30px;
      flex-direction: column;
      p {
        flex: 1;
      }
      &:last-child {
        margin-right: 0;
      }
    }
    img {
      max-width: 100%;
      box-shadow: 0 0 5px #dcdfe6;
      margin: 10px;
    }
    .action {
      justify-content: flex-end;
      padding: 0 8px;
    }
  }
  /deep/ .gen-gif-content {
    margin-bottom: 16px;
    h3 {
      margin-bottom: 16px;
    }
    .text-item {
      margin-bottom: 16px;
      label {
        color: #909399;
      }
      .ai-c {
        margin: 5px auto;
      }
      .el-text {
        width: 350px;
        margin-right: 8px;
        .el-input__inner {
          height: 32px;
          box-shadow: 0 0 2px #92c2aa;
        }
      }
      .el-frame-index {
        width: 56px;
        .el-input__inner {
          height: 32px;
        }
        /* 普通IE浏览器 样式清除 */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none !important;
        }
        /* 火狐浏览器样式清除 */
        input[type="number"] {
          -moz-appearance: textfield;
        }
      }
      .el-del-text-btn {
        margin-left: 8px;
        border: 0;
      }
    }
    .el-add-text-btn {
      width: 350px;
      color: #369c6e;
      background: #eaf8f2;
      border: 2px solid #42b983;
    }
    .el-add-text-btn:hover {
      color: #fff;
      background: #42b983;
      border: 1px solid #42b983;
    }

    .text-set-wrap {
      label {
        margin-right: 8px;
      }
    }
  }
  .frame-list {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fill, 100px);
    img {
      width: 100%;
    }
  }
}
</style>
