import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 3000;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let reqPath = req.url.split('?')[0];

  // API endpoint to upload image directly to disk
  if (req.method === 'POST' && reqPath === '/api/upload-image') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (!data.base64) {
          throw new Error('No image base64 provided');
        }
        const matches = data.base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let ext = '.jpg';
        let buffer;
        if (matches && matches.length === 3) {
          const mime = matches[1].toLowerCase();
          if (mime.includes('png')) ext = '.png';
          else if (mime.includes('webp')) ext = '.webp';
          else if (mime.includes('svg')) ext = '.svg';
          buffer = Buffer.from(matches[2], 'base64');
        } else {
          buffer = Buffer.from(data.base64, 'base64');
        }

        const uploadsDir = path.join(process.cwd(), 'assets', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const rawName = (data.filename || 'photo').replace(/\.[^/.]+$/, '');
        const safeName = rawName.replace(/[^a-z0-9_-]/gi, '_').slice(0, 30) || 'image';
        const savedFileName = `${Date.now()}_${safeName}${ext}`;
        const targetPath = path.join(uploadsDir, savedFileName);

        await fs.promises.writeFile(targetPath, buffer);
        console.log(`[Upload] Saved image to: ${targetPath}`);

        const publicUrl = `assets/uploads/${savedFileName}`;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, url: publicUrl }));
      } catch (err) {
        console.error('[Upload] Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API endpoint to save edited page directly to disk
  if (req.method === 'POST' && reqPath === '/api/save-page') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        let targetFile = (data.page || 'index.html').replace(/^\//, '');
        if (!targetFile.endsWith('.html')) targetFile += '.html';

        // Security check against directory traversal
        const resolvedPath = path.resolve(process.cwd(), targetFile);
        if (!resolvedPath.startsWith(process.cwd())) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Access denied' }));
          return;
        }

        await fs.promises.writeFile(resolvedPath, data.html, 'utf8');
        console.log(`[Visual Editor] Successfully saved: ${targetFile}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, file: targetFile, timestamp: new Date().toISOString() }));
      } catch (err) {
        console.error('[Visual Editor] Save error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Static file serving
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(process.cwd(), reqPath.replace(/^\//, ''));

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`NOODY.AI preview server running at http://127.0.0.1:${PORT}`);
});
