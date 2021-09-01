<template>
  <div id="gen-gif" class="flex ai-c">
    <!-- <img src="https://www.52doutu.cn/static/temp/pic/27ce6c1211f28cbdb8889b02030a84a0.gif" alt=""> -->
    <!-- <a href="https://www.52doutu.cn/static/temp/pic/27ce6c1211f28cbdb8889b02030a84a0.gif" download="">下载</a> -->
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
            >取消选择</el-button
          >
        </div>
      </div>
      <div class="img-box" v-if="currentFramePreview">
        <h2>逐帧查看</h2>
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
        <div class="flex ai-c">
          <label for="blackRect" style="margin: 0 8px">添加黑边</label>
          <el-switch id="blackRect" v-model="gifMetaData.blackRect">
          </el-switch>
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
          <label for="strokeWidth">文字描边</label>
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
      <el-button @click="generateGif">生成</el-button>
      <el-button v-if="gif" @click="download(gif, 'file')">下载</el-button>
      <el-button>收藏</el-button>
    </div>
    <!-- <ul class="frame-list">
      <li v-for="fItem in frameList" :key="fItem.id">
        <img :src="fItem.preview" alt="" />
      </li>
    </ul> -->
    <!-- <ul class="frame-list">
      <li v-for="fItem in test" :key="fItem">
        <img :src="fItem" alt="" />
      </li>
    </ul> -->
  </div>
</template>

<script>
import { parseGIF, decompressFrames } from "gifuct-js";
import { getBase64 } from "@/utils/common.js";
import GIF from "../../public/gif.js";
// import GIF from "@/assets/js/gif.js";
import { getResouceById } from "@/api";

export default {
  name: "GenGif",
  data() {
    return {
      gif: "", // 作品
      defaultGif: require("@/assets/tempImg/1.gif"), //
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
            value: "每个月的生活费够用吗？",
          },
          {
            key: 2,
            start: 12,
            end: 17,
            x: 10,
            y: 200,
            color: "#fff",
            fontSize: 16,
            strokeWidth: 0.5, // 描边宽度
            value: "够用",
          },
          {
            key: 3,
            start: 19,
            end: 24,
            x: 10,
            y: 200,
            color: "#fff",
            fontSize: 16,
            strokeWidth: 0.5, // 描边宽度
            value: "真的吗？",
          },
        ],
      },

      // content: { // 动态图
      //   width: 300,
      //   height: 300,
      //   textList:[
      //     { start: 1, end: 10, x: 10, y: 200, color: '#fff', value: '好啊' },
      //     { start: 11, end: 20, x: 10, y: 200, color: '#fff',  value: '像你这样的群主' },
      //     { start: 21, end: 30, x: 10, y: 200, color: '#fff',  value: '就算再来十个' },
      //     { start: 31, end: 40, x: 10, y: 200, color: '#fff',  value: '成千上万个' },
      //   ]
      // },

      // content: { // 静态图
      //   width: 300,
      //   height: 300,
      //   textList:[
      //     { x: 10, y: 200, color: '#fff', value: '在吗' },
      //   ]
      // },

      currentFramePreview: "", // 当前帧
      currentFrameIndex: 0,
      frameList: [],
      timer: null,

      frameIndex: 0,
      // test: [],
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
    async getDefaultGif() {
      let res = await getResouceById(this.$route.params.resource_id);

      if (res.data.success) {
        this.defaultGif = res.data.data.img;
        this.gifMetaData = res.data.data.content;
      }
    },
    getGifFrames(gif) {
      return gif
        .arrayBuffer()
        .then((buff) => parseGIF(buff))
        .then((gif) => decompressFrames(gif, true));
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
  created() {},
};
</script>

<style lang="less" scoped>
#gen-gif {
  flex-direction: column;
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
      font-size: 16px;
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
      margin-right: 20px;
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
