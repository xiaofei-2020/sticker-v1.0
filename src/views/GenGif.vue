<template>
  <div id="gen-gif">
    <!-- <img src="https://www.52doutu.cn/static/temp/pic/27ce6c1211f28cbdb8889b02030a84a0.gif" alt=""> -->
    <!-- <a href="https://www.52doutu.cn/static/temp/pic/27ce6c1211f28cbdb8889b02030a84a0.gif" download="">下载</a> -->
    <div class="gen-gif-content">
      <div>效果图：</div>
      <div>
        <img :src="customMeme" alt="">
        <canvas ref="drawBoard" :width="gifMetaData.width" :height="gifMetaData.height">
          你的浏览器不支持 canvas，请升级你的浏览器。
        </canvas>
        <!-- <canvas ref="drawBoard2" :width="gifMetaData.width" :height="gifMetaData.height">
          你的浏览器不支持 canvas，请升级你的浏览器。
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
        <li v-for="(fItem) in frameList" :key="fItem.id">
          <img :src="fItem.preview" alt="">
        </li>
      </ul>
  </div>
</template>

<script>
import { parseGIF, decompressFrames } from 'gifuct-js';
import { getBase64 } from '@/utils/common.js';

export default {
  name: "GenGif",
  data(){
    return {
      gif: 'https://www.52doutu.cn/static/temp/pic/27ce6c1211f28cbdb8889b02030a84a0.gif',

      ctx: null,
      gifMetaData: {
        width: 300,
        height: 300,
      },

      currentFrame: '', // 当前帧

      defaultGif: '',
      customMeme: '',
      frameList: [],
      timer: null,
      frameIndex: 0,
    }
  },
  methods: {
    getGifFrames(gif){
      return gif.arrayBuffer()
       .then(buff => parseGIF(buff))
       .then(gif => decompressFrames(gif, true));
    },
    renderGif(ctx){
      this.timer = setInterval(()=>{
        // this.gifMetaData.width = this.frameList[0].dims.width;
        // this.gifMetaData.height = this.frameList[0].dims.height;
        this.drawPatch(
          ctx, 
          this.frameList[this.frameIndex]
        );
        if(this.frameIndex < this.frameList.length - 1) {
          this.frameIndex++;
        } else {
          this.frameIndex = 0;
        }
        }, this.frameList[0].delay);
    },

    // frame转base64
    frameToDateURL(frame){
      let dims = frame.dims;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.gifMetaData.width;
      tempCanvas.height = this.gifMetaData.height;
      const tempCtx = tempCanvas.getContext('2d');

      tempCtx.putImageData(new ImageData(frame.patch, dims.width, dims.height), dims.left, dims.top);
      // this.drawPatch(tempCtx, frame);
      
      return tempCanvas.toDataURL();
    },
    drawPatch(ctx, frame){
      let dims = frame.dims;
      // console.log(imageData);
      if(frame.disposalType === 1){
        
        // let img = new Image();

        // img.onload = () => {
        //   ctx.drawImage(img, frame.dims.top , frame.dims.left);
        // }

        // img.src = this.frameToDateURL(frame);
        // ----

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.gifMetaData.width;
        tempCanvas.height = this.gifMetaData.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(new ImageData(frame.patch, dims.width, dims.height), frame.dims.left, frame.dims.top);

        ctx.drawImage(tempCanvas, 0, 0);
      } else {
        ctx.clearRect(0, 0, this.gifMetaData.width, this.gifMetaData.height);
        ctx.putImageData(new ImageData(frame.patch, dims.width, dims.height), frame.dims.left, frame.dims.top);
      }
      
    },
    drawFullFrame(ctx, frame){
      let typeArr = new Uint8ClampedArray(0);
      frame.pixels.forEach(colorIndex=>{
        // if(frame.transparentIndex === colorIndex) {
        //   arr.push(0,0,0,0);
        // } else {
        //   arr.push(...frame.colorTable[colorIndex], 1);
        // }
        let tempTypeArr = new Uint8ClampedArray(4);
        tempTypeArr.set(frame.colorTable[colorIndex]);
        tempTypeArr.set([1],3);
        
        let newTypeArr = new Uint8ClampedArray(typeArr.length + tempTypeArr.length);
        newTypeArr.set(typeArr);
        newTypeArr.set(tempTypeArr, typeArr.length);
        typeArr = newTypeArr;
      });
      
      // let full = new Uint8ClampedArray(arr);
      console.log(typeArr);
      ctx.clearRect(0, 0, frame.dims.width, frame.dims.height);
      ctx.putImageData(new ImageData(typeArr, frame.dims.width, frame.dims.height), frame.dims.left, frame.dims.top);
    },
    // 选择图片
    async handleUploadChange(file) {
      console.log(this.$refs.drawBoard);
      
      this.customMeme = await getBase64(file.raw);
      this.frameList = await this.getGifFrames(file.raw);

      this.frameList.forEach((fItem, fIndex)=>{
        fItem.id = fIndex;
        fItem.preview = this.frameToDateURL(fItem);
      });

      let ctx = this.$refs.drawBoard.getContext("2d");
      this.gifMetaData.width = this.frameList[0].dims.width;
      this.gifMetaData.height = this.frameList[0].dims.height;
      console.log(this.frameList[1]);
      this.$nextTick(()=>{
        //  var imgData=ctx.createImageData(100,100);
        // for (var i=0;i<imgData.data.length;i+=4)
        //   {
        //   imgData.data[i+0]=255;
        //   imgData.data[i+1]=0;
        //   imgData.data[i+2]=0;
        //   imgData.data[i+3]=255;
        //   }
        // ctx.putImageData(imgData,10,10);
        
        // this.drawPatch(ctx, this.frameList[0]);
        // let ctx2 = this.$refs.drawBoard2.getContext("2d");
        // this.drawFullFrame(ctx2, this.frameList[0]);
        this.renderGif(ctx);
        
        // ctx.font = "48px serif";
        // ctx.fillText('试试啊', 50, 200);
      });
      
     
      // this.ctx.clearRect(0, 0, this.ctxWidth, this.ctxHeight);

      
      this.$refs.upload.clearFiles();
    },
    cancelSelect(){
      this.customMeme = '';
    }
  },
  async created(){
    // this.getGifFrames(this.gif)
    
    // let res = await getBase64(this.gif);
    // this.gifBase64 = res;
  }
}
</script>

<style lang="less" scoped>
#gen-gif {
  .gen-gif-content{
    width: 300px;
    margin: 0 auto;
    img{
      max-width: 100%;
    }
    .action {
      justify-content: flex-end;
    }
  }
  
  .frame-list{
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fill, 100px);
    img {
      width: 100%;
    }
  }
}
</style>