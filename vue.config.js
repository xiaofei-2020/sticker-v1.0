module.exports = {
  pages: {
    index: {
      // page 的入口
      entry: "src/main.js",
      // 模板来源
      template: "public/index.html",
      // 在 dist/index.html 的输出
      filename: "index.html",
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: "斗图",
      // 在这个页面中包含的块，默认情况下会包含
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ["chunk-vendors", "chunk-common", "index"],
    },
  },
  devServer: {
    hot: true, // 保存自动刷新网页
    open: true,
    port: 8080,
    host: "0.0.0.0",
    proxy: "http://127.0.0.1:3000/api",
    // proxy: {
    //   '/api':{
    //     target:'http://127.0.0.1:3000/api',// 本地代理
    //     changeOrigin: true,
    //     pathRewrite: {
    //       '^/api': ''
    //     }
    //   }

    // }
  },
  chainWebpack: (config) => {
    config.module
      .rule("worker")
      .test(/\.worker\.js$/)
      .use("worker")
      .loader("worker-loader")
      .options({
        inline: "fallback",
      });
    config.output.globalObject("this");
  },
  parallel: false,
};
