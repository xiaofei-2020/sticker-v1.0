import axios from "axios";

// 默认请求配置
axios.defaults.baseURL = process.env.VUE_APP_SERVER_STATIC_PATH;

// 添加请求拦截器
axios.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
axios.interceptors.response.use(
  function (response) {
    // 对响应数据做点什么
    return response;
  },
  function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

// 获取用户信息
export const getUserInfo = (data, params) => {
  return axios({
    url: "/userInfo",
    data,
    params,
  });
};

// 下载
export const getFile = (data, params) => {
  return axios({
    url: "/file",
    data,
    params,
  });
};
