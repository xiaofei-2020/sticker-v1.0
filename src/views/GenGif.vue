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

    <ul class="frame-list">
      <li v-for="fItem in frameList" :key="fItem.id">
        <img :src="fItem.preview" alt="" />
      </li>
    </ul>
  </div>
</template>

<script>
import { parseGIF, decompressFrames } from "gifuct-js";
import { getBase64 } from "@/utils/common.js";

export default {
  name: "GenGif",
  data() {
    return {
      gif: "https://www.52doutu.cn/static/temp/pic/27ce6c1211f28cbdb8889b02030a84a0.gif",

      ctx: null,
      gifMetaData: {
        width: 300,
        height: 300,
      },

      currentFrame: "", // 当前帧

      defaultGif: "",
      customMeme: "",
      frameList: [],
      timer: null,
      frameIndex: 0,
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
