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
      <div class="img-box">
        <h2><i class="el-icon-edit-outline"></i> 表情制作</h2>
        <img :src="gif || customGif || defaultGif" alt="" />
        <div class="action flex">
          <el-upload
            ref="upload"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            accept=".png,.jpg,.gif"
            :on-change="handleUploadChange"
            :limit="1"
          >
            <el-button type="text"
              ><i class="el-icon-circle-plus-outline"></i
              >{{ customGif ? "重新选择" : "选择本地图片" }}</el-button
            >
          </el-upload>
          <el-button
            v-show="customGif"
            type="text"
            style="margin-left: 10px"
            @click="cancelSelect"
            ><i class="el-icon-circle-close"></i>取消选择</el-button
          >
        </div>
      </div>
      <div class="img-box" v-if="currentFramePreview">
        <h2><i class="el-icon-s-operation"></i> 逐帧查看</h2>
        <img :src="currentFramePreview" alt="" />
        <!-- <img 
          v-for="(imgItem,imgIndex) in frameList" 
          :key="imgIndex" 
          v-show="currentFrameIndex === imgIndex" 
          :src="imgItem.preview" alt="" /> -->
        <div class="action flex ai-c">
          <div style="margin-right: 20px">当前帧</div>
          <el-slider
            style="flex: 1"
            v-model="currentFrameIndex"
            :max="frameList.length - 1 > 0 ? frameList.length - 1 : 1"
            :format-tooltip="(value) => ++value"
            @input="changeFrame"
          ></el-slider>
          <div style="margin-left: 20px">
            {{ `${currentFrameIndex + 1} / ${frameList.length}` }}
          </div>
        </div>
      </div>
    </div>

    <div class="gen-gif-content">
      <h3>内容编辑</h3>
      <div
        class="text-item"
        v-for="(item, index) in gifMetaData.textList"
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
          <template v-if="currentFramePreview">
            <el-input
              class="el-frame-index"
              v-model="item.start"
              type="number"
              @blur="
                item.start = formatNumber(item.start, 1, frameList.length || 1)
              "
            ></el-input>
            &nbsp;~&nbsp;
            <el-input
              class="el-frame-index"
              v-model="item.end"
              type="number"
              @blur="
                item.end = formatNumber(item.end, 1, frameList.length || 1)
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
        <div
          v-if="currentFramePreview"
          class="flex ai-c"
          style="margin: 4px 0 16px 0"
        >
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
            <el-switch id="blackRect" v-model="gifMetaData.blackRect">
            </el-switch>
          </div>
        </div>
      </div>

      <template v-if="currentFramePreview">
        <h3>文本设置</h3>
        <div class="text-set-wrap">
          <!-- <div class="mr-12"> -->
          <label for="fontSize">字号</label>
          <el-input-number
            class="mr-16"
            id="fontSize"
            size="mini"
            :value="
              gifMetaData.textList[0] ? gifMetaData.textList[0].fontSize : 1
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
              gifMetaData.textList[0]
                ? gifMetaData.textList[0].strokeWidth
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
      <el-button v-if="frameList.length" @click="generateGif">生成</el-button>
      <el-button v-if="gif" @click="download(gif, 'file')">下载</el-button>
      <el-button>收藏</el-button>
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
      defaultGif:"",
      //defaultGif: require("@/assets/tempImg/1.gif"), //
      customGif: "", // 自定义gif

      ctx: null,
      gifMetaData: {
        width: 300,
        height: 300,
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
      // gifMetaData: {
      //   width: 300,
      //   height: 300,
      //   blackRect: true, // 黑边
      //   textList: [
      //     {
      //       key: 1, // 临时key
      //       start: 2,
      //       end: 10,
      //       x: 10,
      //       y: 200,
      //       color: "#fff",
      //       fontSize: 16,
      //       strokeWidth: 0.5, // 描边宽度
      //       value: "每个月的生活费够用吗？",
      //     },
      //     {
      //       key: 2,
      //       start: 12,
      //       end: 17,
      //       x: 10,
      //       y: 200,
      //       color: "#fff",
      //       fontSize: 16,
      //       strokeWidth: 0.5, // 描边宽度
      //       value: "够用",
      //     },
      //     {
      //       key: 3,
      //       start: 19,
      //       end: 24,
      //       x: 10,
      //       y: 200,
      //       color: "#fff",
      //       fontSize: 16,
      //       strokeWidth: 0.5, // 描边宽度
      //       value: "真的吗？",
      //     },
      //   ],
      // },

      currentFramePreview: "", // 当前帧
      currentFrameIndex: 0,
      frameList: [],
      timer: null,

      frameIndex: 0,
      // test: [],
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
    // 下载测试
    async getFile1(url) {
      // url = 'https://img2.baidu.com/it/u=4095081550,1465270391&fm=15&fmt=auto&gp=0.jpg';
      url =
        "https://sf1-ttcdn-tos.pstatp.com/obj/larkcloud-file-storage/baas/qcjdye/60023af9a3e3d6d4_1630421743105.png";
      let res = await getFile({}, { src: url });
      console.log(res.data.data);
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
    getGifFrames(gif) {
      return gif
        .arrayBuffer()
        .then((buff) => parseGIF(buff))
        .then((gif) => decompressFrames(gif, true));
    },
    async getDefaultGif() {
      let res = await getResouceById(this.$route.params.resource_id);

      if (res.data.success) {
        this.defaultGif = res.data.data.img;
        this.gifMetaData = JSON.parse(res.data.data.content);
        this.frameList = await this.urlToBlob(res.data.data.img);
        this.frameList.forEach((fItem, fIndex) => {
          // 获得每一帧图以供编辑
          fItem.id = fIndex;
          fItem.preview = this.fullFrameToDateURL(fIndex);
        });
      }
    },
    // 获取二进制格式
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
      this.cancelSelect();

      this.customGif = await getBase64(file.raw); // 预览gif
      this.frameList = await this.getGifFrames(file.raw); // 解析gif数据

      this.gifMetaData.width = this.frameList[0].dims.width;
      this.gifMetaData.height = this.frameList[0].dims.height;

      this.frameList.forEach((fItem, fIndex) => {
        // 每一帧图展开预览
        fItem.id = fIndex;
        fItem.preview = this.fullFrameToDateURL(fIndex);
      });

      this.currentFramePreview = this.frameList[0].preview;
      this.currentFrameIndex = 0;

      this.$refs.upload.clearFiles();
    },
    cancelSelect() {
      this.customGif = "";
      this.gif = "";
      this.currentFramePreview = "";
      this.currentFrameIndex = 0;
      this.frameList = [];
    },

    renderGif(ctx) {
      // canvas 中播放gif
      this.timer = setInterval(() => {
        this.drawPatch(ctx, this.frameList[this.frameIndex]);
        if (this.frameIndex < this.frameList.length - 1) {
          this.frameIndex++;
        } else {
          this.frameIndex = 0;
        }
      }, this.frameList[0].delay);
    },

    // frame转base64
    frameToDateURL(frame) {
      let dims = frame.dims;

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = this.gifMetaData.width;
      tempCanvas.height = this.gifMetaData.height;
      const tempCtx = tempCanvas.getContext("2d");

      tempCtx.putImageData(
        new ImageData(frame.patch, dims.width, dims.height),
        dims.left,
        dims.top
      );
      // this.drawPatch(tempCtx, frame);

      return tempCanvas.toDataURL();
    },
    fullFrameToDateURL(frameIndex) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = this.gifMetaData.width;
      tempCanvas.height = this.gifMetaData.height;
      const tempCtx = tempCanvas.getContext("2d");

      this.drawFullFrame(tempCtx, frameIndex);

      return tempCanvas.toDataURL();
    },
    // 绘制补丁帧
    drawPatch(ctx, frame) {
      let dims = frame.dims;
      // console.log(imageData);
      if (frame.disposalType === 1) {
        // let img = new Image();

        // img.onload = () => {
        //   ctx.drawImage(img, frame.dims.top , frame.dims.left);
        // }

        // img.src = this.frameToDateURL(frame);
        // ----

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = this.gifMetaData.width;
        tempCanvas.height = this.gifMetaData.height;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.putImageData(
          new ImageData(frame.patch, dims.width, dims.height),
          frame.dims.left,
          frame.dims.top
        );

        ctx.drawImage(tempCanvas, 0, 0);
      } else {
        ctx.clearRect(0, 0, this.gifMetaData.width, this.gifMetaData.height);
        ctx.putImageData(
          new ImageData(frame.patch, dims.width, dims.height),
          frame.dims.left,
          frame.dims.top
        );
      }
    },
    generateFrame(frame) {
      const totalPixels = frame.pixels.length;
      const frameData = new Uint8ClampedArray(totalPixels * 4);
      for (var i = 0; i < totalPixels; i++) {
        const pos = i * 4;
        const colorIndex = frame.pixels[i];
        const color = frame.colorTable[colorIndex] || [0, 0, 0];
        frameData[pos] = color[0];
        frameData[pos + 1] = color[1];
        frameData[pos + 2] = color[2];
        frameData[pos + 3] = frame.colorTable[colorIndex] ? 255 : 0;
      }

      return frameData;
    },
    // 绘制完整画面
    drawFullFrame(ctx, frameIndex) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = this.gifMetaData.width;
      tempCanvas.height = this.gifMetaData.height;
      const tempCtx = tempCanvas.getContext("2d");

      for (let i = 0; i <= frameIndex; i++) {
        // 覆盖到目标帧为止
        this.drawPatch(tempCtx, this.frameList[i]);
      }

      ctx.drawImage(tempCanvas, 0, 0);
    },

    changeFrame(newValue) {
      // console.log(newValue);
      this.currentFramePreview = this.frameList[newValue]?.preview || "";
      // console.log(this.currentFrameIndex);
    },
    handleAddText() {
      if (!this.gifMetaData.textList[0]) {
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

        this.gifMetaData.textList.push(text);
        return;
      }
      // ================================
      let text = JSON.parse(JSON.stringify(this.gifMetaData.textList[0]));

      Object.assign(text, {
        key: new Date().getTime(),
        value: "",
      });

      this.gifMetaData.textList.push(text);
    },

    handleDeleteText(textIndex) {
      this.gifMetaData.textList.splice(textIndex, 1);
    },
    handleChangeTextItem(key, value) {
      this.gifMetaData.textList.forEach((item) => {
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

      let gif = new GIF({
        workers: 6,
        quality: 10,
      });

      for (let frameIndex in this.frameList) {
        let frame = this.frameList[frameIndex];

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = this.gifMetaData.width;
        tempCanvas.height = this.gifMetaData.height;
        const tempCtx = tempCanvas.getContext("2d");

        // this.test.push(tempCanvas.toDataURL());
        // this.test.push(frame.preview)

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
        if (this.gifMetaData.blackRect) {
          tempCtx.fillRect(
            0,
            this.gifMetaData.height -
              (this.gifMetaData.textList[0].fontSize + 10),
            this.gifMetaData.width,
            this.gifMetaData.textList[0].fontSize + 10
          );
        }

        // =======================

        // 绘制文字================
        let text = this.gifMetaData.textList.find(
          (item) => +item.start <= frameIndex && frameIndex <= +item.end
        );
        if (text) {
          tempCtx.font = `bold ${text.fontSize}px sans-serif`;

          let textWidth = this.gifMetaData.width;

          tempCtx.textAlign = "center"; // 水平居中
          tempCtx.fillStyle = text.color; // 文字颜色
          tempCtx.fillText(
            text.value,
            textWidth / 2, // 水平居中
            this.gifMetaData.height - 8,
            textWidth
          );

          if (text.strokeWidth > 0) {
            tempCtx.lineWidth = text.strokeWidth;
            tempCtx.strokeStyle = "#000"; // 轮廓颜色
            tempCtx.strokeText(
              text.value,
              textWidth / 2, // 水平居中
              this.gifMetaData.height - 8,
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
      margin-right: 30px;
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
