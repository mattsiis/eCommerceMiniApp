function createRandomString(len) {
  // 每10位一组，剩下的追加
  // 获取组数
  var group = Math.floor(len / 10);
  // 余数
  var remainder = len % 10;
  // 定义结果
  var result = '';
  // 遍历组
  for (var i = 0; i < group; i++) {
    // 添加随机数字符串
    result += String(Math.random()).slice(2, 12)
  }
  // 添加剩余的
  return result += String(Math.random()).slice(2, remainder + 2)
}

module.exports = {createRandomString}