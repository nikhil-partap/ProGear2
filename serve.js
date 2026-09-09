/* Simple static server for the ProGear Mats website.
   Run from this folder:  node serve.js        (port defaults to 8377)
   Custom port:           node serve.js 5000
   Serves on all network interfaces so phones/other devices on the same
   Wi-Fi can open it via this computer's address. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const port = Number(process.argv[2]) || 8377;
const mime = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp'
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join('.', p);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {
      'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(data);
  });
}).listen(port, '0.0.0.0', () => {
  console.log('ProGear Mats website is live:');
  console.log('  On this PC:   http://localhost:' + port);
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log('  On your network: http://' + net.address + ':' + port + '   (same Wi-Fi, from "' + name + '")');
      }
    }
  }
  console.log('Stop the server with Ctrl+C.');
});
