import Mock from "mockjs";

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
      file: require("../../public/1.gif"),
    },
  };
}

// 拦截 Ajax 请求
Mock.mock(baseURL + "/userInfo", "get", getUserInfo);
Mock.mock(baseURL + "/file", "get", getFile);
