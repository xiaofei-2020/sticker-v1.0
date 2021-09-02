import { Message } from "element-ui";

// 是否为空
const isEmpty = (value) => {
  return (
    typeof value === "undefined" ||
    value === null ||
    String(value).trim() === ""
  );
};

const validatorMap = {
  keywordRule: (value) => {
    if (isEmpty(value)) {
      Message.closeAll();
      Message({
        showClose: true,
        message: "请输入关键字！",
        type: "warning",
      });
      return Promise.reject("请输入关键字！");
    } else {
      return Promise.resolve();
    }
  },
  onlineRule: (token) => {
    if (isEmpty(token)) {
      Message.closeAll();
      Message({
        showClose: true,
        message: "请先登录再继续此操作！",
        type: "warning",
      });
      return Promise.reject("请先登录再继续此操作！");
    } else {
      return Promise.resolve();
    }
  },
};

const formValidator = (rule, value) => {
  return validatorMap[rule](value);
};

export default formValidator;
