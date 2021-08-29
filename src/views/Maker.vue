<template>
  <div class="maker">
    <div style="width: 60%; margin: 0 auto">
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
    <SectionTitle title="表情制作" describe="创作属于你的表情图" />
    <div class="meme-list">
      <MemeCard
        v-for="item in templateList"
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
  name: "maker",
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

      templateList: [],
    };
  },
  methods: {
    // 获取表情模板
    async getMemeTemplate() {
      let res = await resourcesApi("get", {
        type: "TEMPLATE",
        page: this.currentPage,
        pageSize: this.pageSize,
      });

      if (res.data.success) {
        this.templateList = res.data.data;
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
        query: { keyword, type: "TEMPLATE" },
      });
    },
    // 切换页
    handleCurrentChange() {
      this.getMemeTemplate();
    },
  },
  created() {
    this.getMemeTemplate();
  },
};
</script>

<style lang="less" scoped>
.maker {
  .meme-list {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 16px 28px;
  }
}
</style>
