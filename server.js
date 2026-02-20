import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
const PORT = process.env.PORT || 3000;
const AUTH_TOKEN = 'admin-session-token';

const items = [
  { id: 1, name: 'Rice (10kg bags)', stock: 16, unit: 'bags', urgent: false },
  { id: 2, name: 'Canned Beans', stock: 8, unit: 'cases', urgent: false },
  { id: 3, name: 'Infant Formula', stock: 4, unit: 'boxes', urgent: true },
  { id: 4, name: 'Fresh Produce Packs', stock: 24, unit: 'packs', urgent: false },
  { id: 5, name: 'Cooking Oil', stock: 11, unit: 'bottles', urgent: false }
];

function getStatus(item) {
  if (item.urgent || item.stock <= 5) return 'Critical';
  if (item.stock <= 12) return 'Low';
  return 'Stable';
}

function serializeItems() {
  return items.map((item) => ({ ...item, status: getStatus(item) }));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        req.connection.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

function isAuthorized(req) {
  const authHeader = req.headers.authorization || '';
  return authHeader === `Bearer ${AUTH_TOKEN}`;
}

function serveStatic(req, res) {
  const requested = req.url === '/' ? '/index.html' : req.url;
  const safePath = path.normalize(requested).replace(/^\.+/, '');
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json'
    };

    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.url === '/api/items' && req.method === 'GET') {
    sendJson(res, 200, { items: serializeItems() });
    return;
  }

  if (req.url === '/api/login' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      if (body.username === 'admin' && body.password === 'foodbank123') {
        sendJson(res, 200, { token: AUTH_TOKEN, name: 'Operations Admin' });
      } else {
        sendJson(res, 401, { error: 'Invalid credentials' });
      }
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.url.startsWith('/api/items/') && req.method === 'PUT') {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const parts = req.url.split('/').filter(Boolean);
    const itemId = Number(parts[2]);
    const action = parts[3];
    const item = items.find((entry) => entry.id === itemId);

    if (!item) {
      sendJson(res, 404, { error: 'Item not found' });
      return;
    }

    try {
      const body = await parseBody(req);
      if (action === 'stock') {
        const delta = Number(body.delta);
        if (!Number.isFinite(delta)) {
          sendJson(res, 400, { error: 'Delta must be numeric' });
          return;
        }
        item.stock = Math.max(0, item.stock + delta);
      } else if (action === 'urgent') {
        item.urgent = Boolean(body.urgent);
      } else {
        sendJson(res, 404, { error: 'Invalid action' });
        return;
      }

      sendJson(res, 200, { item: { ...item, status: getStatus(item) } });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Food Bank app running at http://localhost:${PORT}`);
});
