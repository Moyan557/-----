const qiniu = require('qiniu');
const fs = require('fs');
const path = require('path');
const https = require('https');

const ACCESS_KEY = 'oH4k5ciTRbeG75LfPSyMqldHFIzVFFGvIeP9BpM';
const SECRET_KEY = '0m2clBuogjs7uUnbWJZJBJ8ygmVzm5E0-2n627b_j';
const BUCKET = 'lwf-portfolio';
const DIST_DIR = path.resolve(__dirname, '../../dist');

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.mjs': 'application/javascript', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject', '.map': 'application/json',
  '.txt': 'text/plain', '.xml': 'application/xml', '.pdf': 'application/pdf',
  '.nojekyll': 'text/plain',
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

// Query bucket zone via UC API
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
          // json structure: { "<bucket>": { "region": "z0", ... } }
          const info = json[bucket] || Object.values(json)[0];
          resolve(info && info.region ? info.region : 'z0');
        } catch (e) { reject(new Error('parse zone failed: ' + data.slice(0, 200))); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('zone query timeout')); });
  });
}

const ZONE_MAP = {
  z0: qiniu.zone.Zone_z0, // 华东-浙江
  z1: qiniu.zone.Zone_z1, // 华北-河北
  z2: qiniu.zone.Zone_z2, // 华南-广东
  na0: qiniu.zone.Zone_na0, // 北美
  as0: qiniu.zone.Zone_as0, // 东南亚
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
  const mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY);

  // 1. Detect zone
  let region;
  try {
    region = await queryZone(mac, BUCKET);
    console.log(`[zone] bucket region = ${region}`);
  } catch (e) {
    console.log(`[zone] auto-detect failed (${e.message}), fallback to z0`);
    region = 'z0';
  }
  const zone = ZONE_MAP[region] || qiniu.zone.Zone_z0;

  // 2. Build upload token (valid 2 hours)
  const putPolicy = new qiniu.rs.PutPolicy({ scope: BUCKET, expires: 7200 });
  const uploadToken = putPolicy.uploadToken(mac);

  const config = new qiniu.conf.Config();
  config.zone = zone;
  const formUploader = new qiniu.form_up.FormUploader(config);

  // 3. Collect files
  const files = walk(DIST_DIR);
  const total = files.length;
  const totalSize = files.reduce((s, f) => s + fs.statSync(f).size, 0);
  console.log(`[scan] ${total} files, ${(totalSize / 1024 / 1024).toFixed(1)} MB`);

  // 4. Upload with concurrency
  const CONCURRENCY = 4;
  let idx = 0, ok = 0, fail = 0;
  const failures = [];

  async function worker() {
    while (idx < total) {
      const i = idx++;
      const f = files[i];
      const key = path.relative(DIST_DIR, f).replace(/\\/g, '/');
      try {
        await uploadOne(formUploader, uploadToken, f, key);
        ok++;
        if (ok % 10 === 0 || ok === total) {
          console.log(`[upload] ${ok}/${total} done (${(ok / total * 100).toFixed(0)}%)`);
        }
      } catch (e) {
        fail++;
        failures.push({ key, error: e.message });
        console.error(`[FAIL] ${key}: ${e.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log('\n========== RESULT ==========');
  console.log(`Success: ${ok}, Failed: ${fail}, Total: ${total}`);
  if (failures.length > 0) {
    console.log('\nFailed files:');
    failures.forEach((f) => console.log(`  - ${f.key}: ${f.error}`));
  }
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
