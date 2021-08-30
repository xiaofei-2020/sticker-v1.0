<template>
  <div class="meme-card">
    <div class="img-box" @click="nextRoute(meme)">
      <img :src="meme.img" alt="" />

      <div class="tip" v-if="meme.resource_type === 'TEMPLATE'">
        点击进入表情制作
      </div>
      <!-- <div class="tip" v-else>点击查看表情图片详情</div> -->
    </div>
    <div class="meme-card-footer">
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
    </div>
  </div>
</template>

<script>
import { collectionApi } from "@/api";

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
      tempCollection: false,
    };
  },
  methods: {
    nextRoute(meme) {
      console.log(meme);

      if (meme.resource_type === "TEMPLATE") {
        if (meme.img.split(".").pop() === "gif") {
          this.$router.push("/gen-gif");
        } else {
          this.$router.push("/gen-img/" + meme.resource_id);
        }
      } else {
        // this.$router.push('/img-detail');
        return;
      }
    },
    async handleCollection(method, id) {
      let res = await collectionApi(method, { id });

      if (res.data.success) {
        if (method === "post") {
          this.$message({
            message: "收藏成功！",
            type: "success",
          });
          this.tempCollection = true;
        } else if (method === "delete") {
          this.$message({
            message: "取消收藏！",
            type: "warning",
          });
          this.tempCollection = false;
        }
      }
    },
  },
};
</script>

<style lang="less" scoped>
.meme-card {
  .img-box {
    position: relative;
    height: 110px;
    border: solid 1px #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
    text-align: center;
    cursor: pointer;
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
