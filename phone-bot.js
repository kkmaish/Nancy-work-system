const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const ROOT = 'C:\\Users\\NANCY\\Downloads\\nancy work system';
const PORT = 8080;

function waitForServer(tries = 30) {
  return new Promise((resolve, reject) => {
    let n = 0;
    (function probe() {
      n++;
      http.get('http://localhost:' + PORT + '/nancy.html', r => {
        r.resume();
        if (r.statusCode === 200) return resolve();
        if (n >= tries) return reject(new Error('server never came up'));
        setTimeout(probe, 1000);
      }).on('error', () => {
        if (n >= tries) return reject(new Error('server never came up'));
        setTimeout(probe, 1000);
      });
    })();
  });
}

function get(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { 'User-Agent': 'NancySystem/1.0' } }, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) { get(r.headers.location).then(res, rej); return; }
      if (r.statusCode !== 200) { rej(new Error('status ' + r.statusCode)); return; }
      const chunks = [];
      r.on('data', c => chunks.push(c));
      r.on('end', () => res(Buffer.concat(chunks)));
    }).on('error', rej);
  });
}

(async () => {
  console.log('BOT: starting Nancy server...');
  const srv = spawn('node', [path.join(ROOT, 'server.js')], { cwd: ROOT, stdio: 'ignore', detached: false });
  srv.on('error', e => { console.log('BOT: server failed: ' + e.message); process.exit(1); });
  try { await waitForServer(); } catch (e) { console.log('BOT: ' + e.message); process.exit(1); }
  console.log('BOT: server up at http://localhost:' + PORT);

  console.log('BOT: opening phone tunnel...');
  const lt = spawn('npx.cmd', ['-y', 'localtunnel', '--port', String(PORT)], { cwd: ROOT, shell: true });
  const url = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('tunnel timed out')), 120000);
    lt.stdout.on('data', d => {
      const m = String(d).match(/https:\/\/[a-z0-9-]+\.loca\.lt/);
      if (m) { clearTimeout(timer); resolve(m[0]); }
    });
    lt.stderr.on('data', () => {});
    lt.on('error', e => { clearTimeout(timer); reject(e); });
    lt.on('exit', code => { clearTimeout(timer); reject(new Error('tunnel exited ' + code)); });
  });
  console.log('BOT: phone link: ' + url);

  const txt = 'NANCY WORK SYSTEM — MOBILE DOWNLOAD LINK\n==========================================\nOpen this link on your mobile phone:\n\n  ' + url + '\n\nOr scan mobile-link-qr.png with your phone camera.\n\nThen in Chrome tap menu (⋮) > "Install app" (or "Add to Home screen").\nThe app installs with the Nancy logo and works offline afterwards.\n\nIMPORTANT: keep this PC on with internet while installing —\nthe link is served live from this computer.\n';
  fs.writeFileSync(path.join(ROOT, 'MOBILE-LINK.txt'), txt);
  fs.writeFileSync('C:/Users/NANCY/Documents/Default Project/MOBILE-LINK.txt', txt);
  try {
    const qr = await get('https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=' + encodeURIComponent(url));
    fs.writeFileSync(path.join(ROOT, 'mobile-link-qr.png'), qr);
    fs.writeFileSync('C:/Users/NANCY/Documents/Default Project/mobile-link-qr.png', qr);
    console.log('BOT: QR code updated.');
  } catch (e) { console.log('BOT: QR skipped (' + e.message + ') — link above still works.'); }

  console.log('BOT: running. Open the link on your phone. Press Ctrl+C here to stop.');
  const keep = setInterval(() => {}, 60000);
  process.on('SIGINT', () => { clearInterval(keep); try { srv.kill(); } catch {} try { lt.kill(); } catch {} process.exit(0); });
})().catch(e => { console.log('BOT FAILED: ' + e.message); process.exit(1); });
