const qiniu = require('qiniu');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const CONFIG_PATH = path.resolve(__dirname, 'config.json');
const DIST_DIR = path.resolve(__dirname, '../../dist');
const CACHE_PATH = path.resolve(__dirname, '.upload-cache.json');

if (!fs.existsSync(CONFIG_PATH)) {
  console.error('错误：未找到 config.json，请先在 tools/qiniu-upload/config.json 中填入 AK/SK');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const { ACCESS_KEY, SECRET_KEY, BUCKET, DOMAIN } = config;

if (!ACCESS_KEY || !SECRET_KEY || !BUCKET || ACCESS_KEY.includes('你的')) {
  console.error('错误：请先在 tools/qiniu-upload/config.json 中填入准确的 ACCESS_KEY / SECRET_KEY / BUCKET');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.mjs': 'application/javascript', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject', '.map': 'application/json',
  '.txt': 'text/plain', '.xml': 'application/xml', '.pdf': 'application/pdf',
};

function mimeOf(p) { return MIME[path.extname(p).toLowerCase()] || 'application/octet-stream'; }

function walk(dir) {
  let out = [];
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) out = out.concat(walk(fp));
    else out.push(fp);
  }
  return out;
}

function fileHash(filePath) {
  const stat = fs.statSync(filePath);
  return `${stat.size}-${Math.floor(stat.mtimeMs)}`;
}

function loadCache() {
  try { return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')); }
  catch { return {}; }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

// 查询存储空间区域
function queryZone(mac, bucket) {
  return new Promise((resolve, reject) => {
    const reqPath = `/v2/buckets?tbl=${encodeURIComponent(bucket)}`;
    const token = qiniu.util.generateAccessToken(mac, reqPath, null);
    const req = https.get({
      hostname: 'uc.qiniuapi.com',
      path: reqPath,
      headers: { Authorization: token },
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error));
          const info = json[bucket] || Object.values(json)[0];
          resolve(info && info.region ? info.region : 'z0');
        } catch (e) { reject(new Error('解析区域失败: ' + data.slice(0, 200))); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('查询区域超时')); });
  });
}

const ZONE_MAP = {
  z0: qiniu.zone.Zone_z0, z1: qiniu.zone.Zone_z1, z2: qiniu.zone.Zone_z2,
  na0: qiniu.zone.Zone_na0, as0: qiniu.zone.Zone_as0,
};

function uploadOne(formUploader, token, localFile, key) {
  const extra = new qiniu.form_up.PutExtra();
  extra.mimeType = mimeOf(localFile);
  return new Promise((resolve, reject) => {
    formUploader.putFile(token, key, localFile, extra, (err, body, info) => {
      if (err) reject(err);
      else if (info && info.statusCode >= 400) reject(new Error(`HTTP ${info.statusCode}: ${JSON.stringify(body)}`));
      else resolve({ key, size: fs.statSync(localFile).size });
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const skipBuild = args.includes('--no-build');
  const forceUpload = args.includes('--force');

  // 1. 构建
  if (!skipBuild) {
    console.log('[1/4] 构建项目...');
    try {
      execSync('npx vite build', { cwd: path.resolve(__dirname, '../..'), stdio: 'inherit' });
    } catch (e) {
      console.error('构建失败:', e.message);
      process.exit(1);
    }
  } else {
    console.log('[1/4] 跳过构建（--no-build）');
  }

  // 2. 初始化七牛
  console.log('[2/4] 连接七牛云...');
  const mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY);

  let region;
  try {
    region = await queryZone(mac, BUCKET);
    console.log(`       存储空间区域: ${region}`);
  } catch (e) {
    console.log(`       自动检测区域失败（${e.message}），使用默认华东 z0`);
    region = 'z0';
  }

  const zone = ZONE_MAP[region] || qiniu.zone.Zone_z0;
  const putPolicy = new qiniu.rs.PutPolicy({ scope: BUCKET, expires: 7200 });
  const uploadToken = putPolicy.uploadToken(mac);
  const configObj = new qiniu.conf.Config();
  configObj.zone = zone;
  const formUploader = new qiniu.form_up.FormUploader(configObj);

  // 3. 扫描文件，增量上传
  console.log('[3/4] 扫描文件...');
  const files = walk(DIST_DIR);
  const cache = loadCache();
  const toUpload = [];

  for (const f of files) {
    const key = path.relative(DIST_DIR, f).replace(/\\/g, '/');
    const hash = fileHash(f);
    if (forceUpload || cache[key] !== hash) {
      toUpload.push({ file: f, key, hash });
    }
  }

  const totalSize = toUpload.reduce((s, f) => s + fs.statSync(f.file).size, 0);
  console.log(`       总文件 ${files.length} 个，需上传 ${toUpload.length} 个（${(totalSize / 1024 / 1024).toFixed(1)} MB）`);

  if (toUpload.length === 0) {
    console.log('\n没有文件变更，无需上传。');
    return;
  }

  // 4. 并发上传
  console.log('[4/4] 上传中...');
  const CONCURRENCY = 4;
  let idx = 0, ok = 0, fail = 0;
  const failures = [];

  async function worker() {
    while (idx < toUpload.length) {
      const i = idx++;
      const { file, key, hash } = toUpload[i];
      try {
        await uploadOne(formUploader, uploadToken, file, key);
        cache[key] = hash;
        ok++;
        if (ok % 10 === 0 || ok === toUpload.length) {
          console.log(`       ${ok}/${toUpload.length}（${(ok / toUpload.length * 100).toFixed(0)}%）`);
        }
      } catch (e) {
        fail++;
        failures.push({ key, error: e.message });
        console.error(`       [失败] ${key}: ${e.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  saveCache(cache);

  // 5. 额外上传无扩展名的 index 文件（七牛云对 .html 扩展名返回 403，无扩展名可正常访问）
  console.log('[5/5] 上传无扩展名首页入口...');
  const indexFile = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexFile)) {
    const indexExtra = new qiniu.form_up.PutExtra();
    indexExtra.mimeType = 'text/html; charset=utf-8';
    try {
      await new Promise((resolve, reject) => {
        formUploader.putFile(uploadToken, 'index', indexFile, indexExtra, (err, body, info) => {
          if (err) reject(err);
          else if (info && info.statusCode >= 400) reject(new Error(`HTTP ${info.statusCode}`));
          else resolve(body);
        });
      });
      console.log('       index（无扩展名）上传成功');
    } catch (e) {
      console.error('       index 上传失败:', e.message);
    }
  }

  console.log('\n========== 部署完成 ==========');
  console.log(`成功: ${ok}，失败: ${fail}，总计: ${toUpload.length}`);

  if (failures.length > 0) {
    console.log('\n失败文件:');
    failures.forEach((f) => console.log(`  - ${f.key}: ${f.error}`));
  }

  if (DOMAIN) {
    console.log(`\n访问地址: http://${DOMAIN}/index`);
    console.log(`（根路径 / 需配置静态网站托管后可用，当前请用 /index 访问）`);
  } else {
    console.log('\n提示：请在七牛云控制台 -> 域名管理中查看测试域名。');
    console.log('       访问地址格式：http://测试域名/index');
    console.log('       （七牛云对 .html 扩展名返回 403，已自动上传无扩展名 index 作为入口）');
  }
}

main().catch((e) => { console.error('致命错误:', e); process.exit(1); });
