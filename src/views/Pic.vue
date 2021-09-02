<template>
  <div class="pic">
    <div style="width: 60%; margin: 40px auto">
      <el-input
        placeholder="输入关键字搜索"
        v-model="keyword"
        @keyup.enter.native="handleSearch({ keyword })"
      >
        <template #append>
          <el-button
            icon="el-icon-search"
            @click="handleSearch({ keyword })"
          ></el-button>
        </template>
      </el-input>
    </div>
    <SectionTitle title="表情图片" describe="发现你要的表情包" />
    <div class="meme-list">
      <MemeCard v-for="item in productList" :key="item._id" :meme="item" />
    </div>
    <!-- v-if="total > pageSize" -->
    <el-pagination
      style="text-align: right"
      background
      @current-change="handleCurrentChange"
      :current-page.sync="currentPage"
      :page-size="pageSize"
      layout="prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
  </div>
</template>

<script>
import SectionTitle from "@/components/common/SectionTitle.vue";
import MemeCard from "@/components/business/MemeCard.vue";

import formValidator from "@/utils/formValidator.js";
import { tryCatch } from "@/utils/common.js";

import { resourcesApi } from "@/api";

export default {
  name: "pic",
  components: {
    SectionTitle,
    MemeCard,
  },
  data() {
    return {
      keyword: "",
      type: "",
      currentPage: 1,
      pageSize: 20,
      total: 0,

      productList: [],
    };
  },
  methods: {
    // 获取表情图片
    async getMemeProduc() {
      let res = await resourcesApi(
        "get",
        {},
        {
          type: "MEME_IMG",
          page: this.currentPage,
          pageSize: this.pageSize,
        }
      );

      if (res.data.success) {
        this.productList = res.data.data.elements || [];
        this.total = res.data.data.totalElements;
      }
    },
    // 跳转搜索页
    async handleSearch({ keyword }) {
      keyword = keyword.trim();
      let [keywordRes] = await tryCatch(formValidator("keywordRule", keyword));
      if (keywordRes === null) {
        return;
      }

      this.$router.push({
        name: "search",
        query: { keyword, type: "MEME_IMG" },
      });
    },
    // 切换页
    handleCurrentChange() {
      this.getMemeProduc();
    },
  },
  created() {
    this.getMemeProduc();
  },
};
</script>

<style lang="less" scoped>
.pic {
  padding-bottom: 30px;
  .el-input-group {
    border: 1px solid #42b983;
    border-right: none;
    border-radius: 5px;
    .el-select {
      border: none;
      background-color: #42b983;
      color: white;
    }
    .el-input-group__append {
      .el-button {
        border: 1px solid #42b983;
        background-color: #42b983;
        color: white;
      }
    }
  }
  .meme-list {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 16px 28px;
    margin: 30px auto;
    padding-bottom: 20px;
  }
  .section-title {
    border-bottom: 2px solid #42b983;
    color: #40a375;
    padding-bottom: 10px;
  }
}
</style>
