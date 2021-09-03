<template>
  <div class="meme-card">
    <div class="img-box" @click="nextRoute(meme)">
      <img :src="meme.img" alt="" />

      <div class="tip" v-if="meme.type === 'TEMPLATE'">点击进入表情制作</div>
      <!-- <div class="tip" v-else>点击查看表情图片详情</div> -->
    </div>
    <div class="meme-card-footer">
      <i
        title="点击收藏"
        class="icon-star-off"
        v-if="!tempCollection"
        @click="handleCollection('post', meme._id)"
      ></i>
      <i
        title="已收藏"
        class="icon-star-on"
        v-if="tempCollection"
        @click="handleCollection('delete', meme._id)"
      ></i>
    </div>
  </div>
</template>

<script>
import { collectionApi, deleteCollection } from "@/api";
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
      tempCollection: false,
    };
  },
  computed: {
    // tempCollection() {
    //   if (this.$root.usrCollections) {
    //     return (
    //       this.$root.usrCollections.findIndex((c) => {
    //         return c.resource_id === this.meme._id;
    //       }) > -1
    //     );
    //   }
    //   return false;
    // },
  },
  watch: {
    "$root.usrCollections": {
      handler: function () {
        if (this.$root.usrCollections) {
          // 在resource对象中, resourceId对应的属性名是_id, 在collection对象中, resourceId对应的属性名是resource_id
          const memeId = this.meme.resource_id || this.meme._id;
          this.tempCollection =
            this.$root.usrCollections.findIndex((c) => {
              return c.resource_id === memeId;
            }) > -1;
        }
      },
      immediate: true,
    },
  },
  methods: {
    nextRoute(meme) {
      console.log(meme);

      if (meme.type === "TEMPLATE") {
        if (meme.img.split(".").pop() === "gif") {
          this.$router.push("/gen-gif/" + meme._id);
        } else {
          this.$router.push("/gen-img/" + meme._id);
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
          this.tempCollection = true;
        } else if (method === "delete") {
          this.$message({
            message: "取消收藏！",
            type: "warning",
          });
          this.tempCollection = false;
        }
      } else {
        this.$message({
          message: "操作失败，请稍后重试！",
          type: "error",
        });
      }
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
