// async/await 捕获错误
export const tryCatch = (promise) => {
  return promise.then((res) => [res]).catch((error) => [null, error]);
};


// 转换为 base64 编码
export const getBase64 = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);

    reader.onerror = error => reject(error);
  });
};