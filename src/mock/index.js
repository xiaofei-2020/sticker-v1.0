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
        });
      } else {
        data.push({
          resource_id: i,
          resource_type: "TEMPLATE",
          img: require("../assets/tempImg/2.jpg"),
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
Mock.mock(baseURL + "/collection", "post", collection);
Mock.mock(baseURL + "/collection", "delete", collection);
