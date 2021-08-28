<template>
  <div id="gen-gif">
    <!-- <img src="https://www.52doutu.cn/static/temp/pic/27ce6c1211f28cbdb8889b02030a84a0.gif" alt=""> -->
    <!-- <a href="https://www.52doutu.cn/static/temp/pic/27ce6c1211f28cbdb8889b02030a84a0.gif" download="">下载</a> -->
    <div class="gen-gif-content">
      <div>原图：</div>
      <div>
        <img :src="customMeme" alt="" />
        <!-- <canvas
          ref="drawBoard"
          :width="gifMetaData.width"
          :height="gifMetaData.height"
        >
        </canvas> -->
        <div>合成后：</div>
        <img :src="gif" alt="" />
      </div>

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
          <el-button type="text">{{
            customMeme ? "重新选择" : "选择本地图片"
          }}</el-button>
        </el-upload>
        <el-button
          v-show="customMeme"
          type="text"
          style="margin-left: 10px"
          @click="cancelSelect"
          >取消选择</el-button
        >
      </div>
    </div>
    <div>
      <el-button @click="generateGif">生成</el-button>
    </div>
    <!-- <ul class="frame-list">
      <li v-for="fItem in frameList" :key="fItem.id">
        <img :src="fItem.preview" alt="" />
      </li>
    </ul> -->
    <ul class="frame-list">
      <li v-for="fItem in test" :key="fItem">
        <img :src="fItem" alt="" />
      </li>
    </ul>
  </div>
</template>

<script>
import { parseGIF, decompressFrames } from "gifuct-js";
import { getBase64 } from "@/utils/common.js";
// import GIF from "../../public/gif.js";
import GIF from "@/assets/js/gif.js";
// const GIF = require(process.env.BASE_URL + 'gif.js');
export default {
  name: "GenGif",
  data() {
    return {
      gif: "",

      ctx: null,
      gifMetaData: {
        width: 300,
        height: 300,
        textList: [
          { start: 1, end: 10, x: 10, y: 200, color: "#fff", value: "好啊" },
          {
            start: 11,
            end: 20,
            x: 10,
            y: 200,
            color: "#fff",
            value: "像你这样的群主",
          },
          {
            start: 21,
            end: 30,
            x: 10,
            y: 200,
            color: "#fff",
            value: "就算再来十个",
          },
          {
            start: 31,
            end: 40,
            x: 10,
            y: 200,
            color: "#fff",
            value: "成千上万个",
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

      currentFrame: "", // 当前帧

      defaultGif: "",
      customMeme: "",
      frameList: [],
      timer: null,
      frameIndex: 0,

      test: [],
    };
  },
  methods: {
    getGifFrames(gif) {
      return gif
        .arrayBuffer()
        .then((buff) => parseGIF(buff))
        .then((gif) => decompressFrames(gif, true));
    },
    renderGif(ctx) {
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
      this.customMeme = await getBase64(file.raw); // 预览gif
      this.frameList = await this.getGifFrames(file.raw); // 解析gif数据

      this.gifMetaData.width = this.frameList[0].dims.width;
      this.gifMetaData.height = this.frameList[0].dims.height;

      this.frameList.forEach((fItem, fIndex) => {
        // 每一帧图展开预览
        fItem.id = fIndex;
        fItem.preview = this.fullFrameToDateURL(fIndex);
      });

      this.$refs.upload.clearFiles();
    },
    cancelSelect() {
      this.customMeme = "";
      this.frameList = [];
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
      //process.env.BASE_URL
      // const GIF = require('../../public/gif.js');

      let gif = new GIF({
        workers: 6,
        quality: 10,
      });

      // this.frameList.forEach((frame, frameIndex)=>{
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

        // 绘制文字
        let text = this.gifMetaData.textList.find(
          (item) => item.start <= frameIndex && frameIndex <= item.end
        );
        if (text) {
          tempCtx.font = "16px sans-serif";
          let textWidth = this.gifMetaData.width - 24;
          tempCtx.textAlign = "center";
          tempCtx.fillText(
            text.value,
            textWidth / 2,
            this.gifMetaData.height - 28,
            textWidth
          );
          // tempCtx.fillText(text.value, 10 , 10, textWidth)
        }

        gif.addFrame(tempCanvas, { copy: true, delay: frame.delay });
      }
      // });

      gif.on("finished", async (blob) => {
        // window.open(URL.createObjectURL(blob));

        this.gif = await this.blobToBase64(blob);
        let endTime = new Date().getTime();
        console.log(`合成完毕，耗时=${endTime - startTime}毫秒`);
      });

      gif.render();
    },
  },
  created() {},
};
</script>

<style lang="less" scoped>
#gen-gif {
  .gen-gif-content {
    width: 300px;
    margin: 0 auto;
    img {
      max-width: 100%;
    }
    .action {
      justify-content: flex-end;
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
