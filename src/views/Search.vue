<template>
  <div class="search">
    <div style="width: 60%; margin: 0 auto">
      <el-input
        placeholder="输入关键字搜索"
        v-model="keyword"
        @keyup.enter.native="handleSearch({ keyword })"
      >
        <template #prepend>
          <el-select v-model="type" placeholder="搜索类型" style="width: 108px">
            <el-option label="全部" value=""></el-option>
            <el-option label="表情制作" value="TEMPLATE"></el-option>
            <el-option label="表情图片" value="MEME_IMG"></el-option>
          </el-select>
        </template>

        <template #append>
          <el-button
            icon="el-icon-search"
            @click="handleSearch({ keyword })"
          ></el-button>
        </template>
      </el-input>
    </div>

    <SectionTitle
      title="表情搜索"
      :describe="`找到${total}个与 &quot;${resultKeyword}&quot; 相关的表情包`"
    />
    <div class="meme-list">
      <MemeCard
        v-for="item in resultData"
        :key="item.resource_id"
        :meme="item"
      />
    </div>

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
  name: "search",
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
      total: 1000,

      resultData: [],
      resultKeyword: "", // 搜索结果相关的关键字
    };
  },
  methods: {
    async handleSearch({ keyword, page = 1 }) {
      keyword = keyword.trim();
      if (!this.type) {
        let [keywordRes] = await tryCatch(
          formValidator("keywordRule", keyword)
        );
        if (keywordRes === null) {
          return;
        }
      }

      let res = await resourcesApi("get", {
        keyword,
        type: this.type,
        page,
        pageSize: this.pageSize,
      });

      if (res.data.success) {
        this.resultData = res.data.data;
        this.resultKeyword = keyword;
        this.page = page;
      }
    },
    // 切换页
    handleCurrentChange(currentPage) {
      this.handleSearch({ keyword: this.resultKeyword, page: currentPage });
    },
  },
  created() {
    if (this.$route.query.keyword) {
      this.keyword = this.$route.query.keyword;
      this.type = this.$route.query.type || "";
      this.handleSearch({ keyword: this.keyword });
    }
  },
};
</script>

<style lang="less" scoped>
.search {
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
  .section-title[data-v-6a30d6d7] {
    border-bottom: 2px solid #42b983;
    color: #40a375;
    padding-bottom: 10px;
  }
}
</style>
