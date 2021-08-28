<template>
  <div class="pic">
    <div style="width: 60%; margin: 0 auto">
      <el-input
        placeholder="输入关键字搜索"
        v-model="keyword"
        @keyup.enter.native="handleSearch({ keyword, page: currentPage - 1 })"
      >
        <template #append>
          <el-button
            icon="el-icon-search"
            @click="handleSearch({ keyword, page: currentPage - 1 })"
          ></el-button>
        </template>
      </el-input>
    </div>
    <SectionTitle title="表情图片" describe="发现你要的表情包" />
    <div class="meme-list">
      <MemeCard
        v-for="item in productList"
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
      total: 1000,

      productList: [],
    };
  },
  methods: {
    // 获取表情图片
    async getMemeProduc() {
      let res = await resourcesApi("get", {
        type: "MEME_IMG",
        page: this.currentPage,
        pageSize: this.pageSize,
      });

      if (res.data.success) {
        this.productList = res.data.data;
      }
    },
    // 搜索
    async handleSearch({ keyword, page }) {
      keyword = keyword.trim();
      let [keywordRes] = await tryCatch(formValidator("keywordRule", keyword));
      if (keywordRes === null) {
        return;
      }

      let res = await resourcesApi("get", {
        type: "MEME_IMG",
        keyword,
        page: page,
        pageSize: this.pageSize,
      });

      if (res.data.success) {
        this.productList = res.data.data;
      }
    },
    // 切换页
    handleCurrentChange(currentPage) {
      this.handleSearch({ keyword: this.keyword, page: currentPage - 1 });
    },
  },
  created() {
    this.getMemeProduc();
  },
};
</script>

<style lang="less" scoped>
.pic {
  .meme-list {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 16px 28px;
  }
}
</style>
