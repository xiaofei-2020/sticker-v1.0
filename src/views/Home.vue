<template>
  <div class="home">
    <div style="width: 60%; margin: 40px auto" class="serach">
      <el-input
        placeholder="输入关键字搜索"
        v-model="keyword"
        @keyup.enter.native="handleSearch({ keyword, type })"
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
            @click="handleSearch({ keyword, type })"
          ></el-button>
        </template>
      </el-input>
    </div>
    <section>
      <SectionTitle title="表情制作" describe="创作属于你的表情图">
        <template #right>
          <router-link to="/maker"
            >更多 <i class="el-icon-d-arrow-right"></i
          ></router-link>
        </template>
      </SectionTitle>
      <div class="meme-list">
        <MemeCard v-for="item in templateList" :key="item._id" :meme="item" />
      </div>
    </section>
    <section>
      <SectionTitle title="表情图片" describe="发现你要的表情包">
        <template #right>
          <router-link to="/pic"
            >更多 <i class="el-icon-d-arrow-right"></i
          ></router-link>
        </template>
      </SectionTitle>
      <div class="meme-list">
        <MemeCard v-for="item in productList" :key="item._id" :meme="item" />
      </div>
    </section>
  </div>
</template>

<script>
import SectionTitle from "@/components/common/SectionTitle.vue";
import MemeCard from "@/components/business/MemeCard.vue";

import formValidator from "@/utils/formValidator.js";
import { tryCatch } from "@/utils/common.js";

import { resourcesApi } from "@/api";

export default {
  name: "Home",
  components: {
    SectionTitle,
    MemeCard,
  },
  data() {
    return {
      keyword: "",
      type: "",

      templateList: [],
      productList: [],
    };
  },
  methods: {
    // 获取表情模板
    async getMemeTemplate() {
      let res = await resourcesApi(
        "get",
        {},
        {
          type: "TEMPLATE",
          page: 1,
          pageSize: 10,
        }
      );

      if (res.data.success) {
        this.templateList = res.data.data.elements || [];
      }
    },
    // 获取表情图片
    async getMemeProduc() {
      let res = await resourcesApi(
        "get",
        {},
        {
          type: "MEME_IMG",
          page: 1,
          pageSize: 10,
        }
      );

      if (res.data.success) {
        this.productList = res.data.data.elements || [];
      }
    },
    // 跳转搜索页
    async handleSearch({ keyword, type }) {
      keyword = keyword.trim();
      let [keywordRes] = await tryCatch(formValidator("keywordRule", keyword));
      if (keywordRes === null) {
        return;
      }
      // if(typeof keyword === 'undefined' || keyword === ''){
      //   this.$message.closeAll();
      //   this.$message({
      //     showClose: true,
      //     message: '请输入关键字！',
      //     type: 'warning'
      //   });
      //   return
      // }

      this.$router.push({
        name: "search",
        query: { keyword, type: type || undefined },
      });
    },
  },
  created() {
    this.getMemeTemplate();
    this.getMemeProduc();
  },
};
</script>

<style lang="less" scoped>
.home {
  .serach {
    .el-input-group {
      border-top: 1px solid #42b983;
      border-bottom: 1px solid #42b983;
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
  }
  section {
    margin: 50px auto 5px;
    padding-bottom: 15px;
    .section-title {
      border-bottom: 2px solid #42b983;
      color: #40a375;
      padding-bottom: 10px;
      [class*=" el-icon-"],
      [class^="el-icon-"] {
        font-weight: 700;
        margin-right: 5px;
      }
    }
    .meme-list {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-gap: 16px 28px;
      margin: 30px auto;
    }
  }
}
</style>
