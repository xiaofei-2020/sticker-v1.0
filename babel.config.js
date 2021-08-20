module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],

  // 按需引入 element-ui 的组件
  plugins: [
    [
      "component",
      {
        libraryName: "element-ui",
        styleLibraryName: "theme-chalk",
      },
    ],
  ],
};
