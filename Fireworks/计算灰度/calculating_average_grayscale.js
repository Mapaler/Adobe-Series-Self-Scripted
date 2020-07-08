var getPixels = require("get-pixels");

getPixels(process.argv[2], function(err, pixels) {
  if(err) {
    console.log("Bad image path")
    return
  }
  var result = [];
  var data = pixels.data; //原始数据
  var chunk = 4; //每4个分一组
  for (var i = 0, j = data.length; i < j; i += chunk) {
      result.push(data.slice(i, i + chunk));
  }
  var grayScale = result.filter(pt=> pt[3]>0) //去除所有全透明部分
                  .map(pt => (pt[0] + pt[1] + pt[2]) / 3 * (pt[3] / 255) );
  var average = grayScale.reduce((pre,value)=>pre + value) / grayScale.length;

  console.log("该区域平均灰度值：\x1b[93m %f \x1b[39m\n反色值（255-灰度）：\x1b[96m %f \x1b[39m", average, 255 - average);
})