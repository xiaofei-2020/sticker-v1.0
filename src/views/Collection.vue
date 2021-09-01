<template>
  <div class="collection">
    <SectionTitle title="我的收藏" describe="" />
    <el-tabs v-model="activeName" type="card" @tab-click="handleClickTab">
      <el-tab-pane label="全部" name="all">
        <div class="meme-list">
          <MemeCard
            v-for="item in typeMap[activeName].imgList"
            :key="item.resource_id"
            :meme="item"
          />
        </div>

        <el-pagination
          style="text-align: right"
          background
          @current-change="handleCurrentChange"
          :current-page.sync="typeMap[activeName].currentPage"
          :page-size="typeMap[activeName].pageSize"
          layout="prev, pager, next, jumper"
          :total="typeMap[activeName].total"
        >
        </el-pagination>
      </el-tab-pane>
      <el-tab-pane label="表情制作" name="TEMPLATE">
        <div class="meme-list">
          <MemeCard
            v-for="item in typeMap[activeName].imgList"
            :key="item.resource_id"
            :meme="item"
          />
        </div>

        <el-pagination
          style="text-align: right"
          background
          @current-change="handleCurrentChange"
          :current-page.sync="typeMap[activeName].currentPage"
          :page-size="typeMap[activeName].pageSize"
          layout="prev, pager, next, jumper"
          :total="typeMap[activeName].total"
        >
        </el-pagination>
      </el-tab-pane>
      <el-tab-pane label="表情图片" name="MEME_IMG">
        <div class="meme-list">
          <MemeCard
            v-for="item in typeMap[activeName].imgList"
            :key="item.resource_id"
            :meme="item"
          />
        </div>

        <el-pagination
          style="text-align: right"
          background
          @current-change="handleCurrentChange"
          :current-page.sync="typeMap[activeName].currentPage"
          :page-size="typeMap[activeName].pageSize"
          layout="prev, pager, next, jumper"
          :total="typeMap[activeName].total"
        >
        </el-pagination>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import SectionTitle from "@/components/common/SectionTitle.vue";
import MemeCard from "@/components/business/MemeCard.vue";

import { collectionApi } from "@/api";

export default {
  name: "collection",
  components: {
    SectionTitle,
    MemeCard,
  },
  data() {
    return {
      typeMap: {
        all: {
          imgList: [],

          currentPage: 1,
          pageSize: 20,
          total: 100,
        },
        TEMPLATE: {
          imgList: [],

          currentPage: 1,
          pageSize: 20,
          total: 70,
        },
        MEME_IMG: {
          imgList: [],

          currentPage: 1,
          pageSize: 20,
          total: 30,
        },
      },
      activeName: "all",

      // currentPage: 1,
      // pageSize: 20,
      // total: 1000,

      // templateList: [],
    };
  },
  methods: {
    // 获取收藏
    async getCollection() {
      let res = await collectionApi("get", {
        type: this.activeName,
        page: this.typeMap[this.activeName].currentPage,
        pageSize: this.typeMap[this.activeName].pageSize,
      });

      if (res.data.success) {
        this.typeMap[this.activeName].imgList = res.data.data;
      }
    },
    handleClickTab(tab) {
      console.log(tab);
      this.getCollection();
    },
    // 切换页
    handleCurrentChange() {
      this.getCollection();
    },
  },
  created() {
    this.getCollection();
  },
};
</script>

<style lang="less" scoped>
.collection {
  padding-bottom: 30px;
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
