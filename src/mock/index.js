import Mock from "mockjs";

import getDefBase64 from "@/utils/getDefBase64";

let baseURL = process.env.VUE_APP_SERVER_STATIC_PATH;

// 生成响应数据
function getUserInfo(options) {
  console.log(options);
  return {
    code: 0,
    msg: "ok",
    success: true,

    data: {
      eMail: "123456@163.com",
    },
  };
}

function getFile(options) {
  console.log(options);
  return {
    code: 0,
    msg: "ok",
    success: true,

    data: {
      file: require("../assets/tempImg/1.gif"),
    },
  };
}

function getResources(options) {
  console.log(options);
  let body = JSON.parse(options.body);

  let data = [];
  if (body.type === "TEMPLATE") {
    for (let i = 1; i <= body.pageSize; i++) {
      if (i % 2 !== 0) {
        data.push({
          resource_id: i,
          resource_type: "TEMPLATE",
          img: require("../assets/tempImg/1.gif"),
          content:
            "{width: 300, height: 300, textList:[{start: 1, end: 10, x: 10, y: 200, color: '#fff', value: '好啊'}]}",
        });
      } else {
        data.push({
          resource_id: i,
          resource_type: "TEMPLATE",
          img: require("../assets/tempImg/2.jpg"),
          content: "{textList: [{value: '静态图-test'}]}",
        });
      }
    }
  } else {
    for (let i = 1; i <= body.pageSize; i++) {
      data.push({
        resource_id: i,
        resource_type: "MEME_IMG",
        img: require("../assets/tempImg/2.jpg"),
      });
    }
  }

  return {
    code: 0,
    msg: "ok",
    success: true,

    data: data,
  };
}

function getResourceById() {
  return {
    code: 0,
    msg: "ok",
    success: true,
    data: {
      resource_id: 2,
      resource_type: "TEMPLATE",
      img: getDefBase64(),
      content: "静态图-test",
    },
  };
}

function collection(options) {
  console.log(options);

  return {
    code: 0,
    msg: "ok",
    success: true,
  };
}

// 拦截 Ajax 请求
Mock.mock(baseURL + "/userInfo", "get", getUserInfo);
Mock.mock(baseURL + "/file", "get", getFile);
Mock.mock(baseURL + "/resources", "get", getResources);
Mock.mock(baseURL + "/resources/2", "get", getResourceById);
Mock.mock(baseURL + "/collection", "post", collection);
Mock.mock(baseURL + "/collection", "delete", collection);
