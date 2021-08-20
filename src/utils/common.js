// async/await 捕获错误
export const tryCatch = (promise) => {
  return promise.then((res) => [res]).catch((error) => [null, error]);
};
