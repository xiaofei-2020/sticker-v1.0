<template>
  <div class="meme-card">
    <div class="img-box" @click="nextRoute(meme)">
      <img :src="meme.img" alt="" />

      <div class="tip" v-if="meme.type === 'TEMPLATE'">点击进入表情制作</div>
      <!-- <div class="tip" v-else>点击查看表情图片详情</div> -->
    </div>
    <div class="meme-card-footer flex jc-sb">
      <i
        title="点击收藏"
        class="icon-star-off"
        v-if="!tempCollection"
        @click="handleCollection('post', meme.resource_id)"
      ></i>
      <i
        title="已收藏"
        class="icon-star-on"
        v-if="tempCollection"
        @click="handleCollection('delete', meme.resource_id)"
      ></i>
      <i
        title="点击下载"
        style="font-size: 20px"
        class="el-icon-download"
        @click="downloadDefaultImg(meme.img)"
      ></i>
    </div>
  </div>
</template>

<script>
import { collectionApi, deleteCollection, getFile } from "@/api";
import formValidator from "@/utils/formValidator.js";
import { tryCatch } from "@/utils/common.js";

export default {
  name: "meme-card",
  props: {
    meme: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      // tempCollection: false,
    };
  },
  computed: {
    tempCollection() {
      return (
        this.$root.userCollections.findIndex(
          (c) => c.resource_id === this.meme.resource_id
        ) > -1
      );
    },
  },
  watch: {
    // "$root.userCollections": {
    //   handler: function () {
    //     if (this.$root.userCollections) {
    //       // 在resource对象中, resourceId对应的属性名是_id, 在collection对象中, resourceId对应的属性名是resource_id
    //       const memeId = this.meme.resource_id || this.meme.resource_id;
    //       this.tempCollection =
    //         this.$root.userCollections.findIndex((c) => {
    //           return c.resource_id === memeId;
    //         }) > -1;
    //     }
    //   },
    //   immediate: true,
    // },
  },
  methods: {
    nextRoute(meme) {
      console.log(meme);

      if (meme.type === "TEMPLATE") {
        if (meme.img.split(".").pop() === "gif") {
          this.$router.push("/gen-gif/" + meme.resource_id);
        } else {
          this.$router.push("/gen-img/" + meme.resource_id);
        }
      } else {
        // this.$router.push('/img-detail');
        return;
      }
    },
    async handleCollection(method, id) {
      // 验证token是否存在
      let [onlineRes] = await tryCatch(
        formValidator("onlineRule", this.$root.userInfo.token)
      );
      if (onlineRes === null) {
        return;
      }

      let res;
      if (method === "post") {
        res = await collectionApi(method, { resource_id: id });
      } else {
        res = await deleteCollection(id);
      }

      if (res.data.success) {
        if (method === "post") {
          this.$message({
            message: "收藏成功！",
            type: "success",
          });
          this.$root.userCollections.push(this.meme);
        } else if (method === "delete") {
          this.$message({
            message: "取消收藏！",
            type: "warning",
          });
          let index = this.$root.userCollections.findIndex(
            (c) => c.resource_id === id
          );
          this.$root.userCollections.splice(index, 1);
        }
      } else {
        this.$message({
          message: "操作失败，请稍后重试！",
          type: "error",
        });
      }
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
  },
};
</script>

<style lang="less" scoped>
.meme-card {
  .img-box {
    position: relative;
    border: solid 1px #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
    text-align: center;
    cursor: pointer;
    box-shadow: 0 0 5px #dcdfe6;
    margin-bottom: 6px;
    height: 124px;
    img {
      max-width: 100%;
      height: 100%;
    }

    .tip {
      display: none;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.5);
      color: #fff;
      text-align: center;
      line-height: 110px;
    }
    &:hover .tip {
      display: block;
    }
  }
  .meme-card-footer {
    i {
      cursor: pointer;
    }
  }
}
</style>
