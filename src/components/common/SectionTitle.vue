<template>
  <div class="section-title flex jc-sb ai-e">
    <div class="flex ai-e">
      <h2>{{ title }}</h2>
      <span>{{ describe }}</span>
    </div>
    <!-- <div> -->
    <slot name="right"></slot>
    <!-- </div> -->
  </div>
</template>

<script>
export default {
  name: "section-title",
  props: {
    title: String,
    describe: String,
  },
};
</script>

<style lang="less" scoped>
.section-title {
  margin: 20px 0 12px 0;
  h2 {
    font-size: 18px;
    font-weight: normal;
  }
  span {
    color: #909399;
    margin-left: 8px;
  }
}
</style>
