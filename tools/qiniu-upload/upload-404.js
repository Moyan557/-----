const qiniu = require('qiniu');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.resolve(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const { ACCESS_KEY, SECRET_KEY, BUCKET } = config;

const mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY);
const putPolicy = new qiniu.rs.PutPolicy({ scope: BUCKET, expires: 7200 });
const uploadToken = putPolicy.uploadToken(mac);

const configObj = new qiniu.conf.Config();
configObj.zone = qiniu.zone.Zone_z0;
const formUploader = new qiniu.form_up.FormUploader(configObj);

const indexFile = path.resolve(__dirname, '../../dist/index.html');
const extra = new qiniu.form_up.PutExtra();
extra.mimeType = 'text/html';

console.log('正在上传 index.html 作为自定义 404 页面（errno-404）...');

formUploader.putFile(uploadToken, 'errno-404', indexFile, extra, (err, body, info) => {
  if (err) {
    console.error('上传失败:', err);
    process.exit(1);
  }
  if (info && info.statusCode >= 400) {
    console.error(`上传失败 HTTP ${info.statusCode}:`, body);
    process.exit(1);
  }
  console.log('上传成功！文件 key:', body.key);
  console.log('');
  console.log('现在请回到七牛云控制台的"设置静态页面"弹窗：');
  console.log('1. 404 页面已选择"自定义"');
  console.log('2. 效果预览区域应该已经显示出网站内容（因为 errno-404 已上传）');
  console.log('3. 点击底部"确定"按钮保存设置');
  console.log('');
  console.log('保存后，用测试域名访问网站即可。');
});
