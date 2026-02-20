import cors from 'cors';
import express from 'express';

const app = express();
const PORT = 4000;
const ADMIN_TOKEN = 'foodbank-admin-token';

app.use(cors());
app.use(express.json());

const inventory = [
  { id: 1, name: 'Canned Beans', quantity: 26, urgent: false },
  { id: 2, name: 'Infant Formula', quantity: 7, urgent: true },
  { id: 3, name: 'Brown Rice', quantity: 15, urgent: false },
  { id: 4, name: 'Shelf-Stable Milk', quantity: 4, urgent: true },
  { id: 5, name: 'Peanut Butter', quantity: 21, urgent: false }
];

function getStatus(item) {
  if (item.urgent || item.quantity <= 5) return 'Critical';
  if (item.quantity <= 12) return 'Low';
  return 'Stable';
}

function withStatus(items) {
  return items.map((item) => ({ ...item, status: getStatus(item) }));
}

function ensureAdmin(request, response, next) {
  const header = request.headers.authorization;
  if (header !== `Bearer ${ADMIN_TOKEN}`) {
    return response.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

app.get('/api/items', (_request, response) => {
  response.json({ items: withStatus(inventory) });
});

app.post('/api/login', (request, response) => {
  const { username, password } = request.body;

  if (username === 'admin' && password === 'foodbank123') {
    return response.json({ token: ADMIN_TOKEN });
  }

  response.status(401).json({ message: 'Invalid credentials' });
});

app.patch('/api/items/:id/stock', ensureAdmin, (request, response) => {
  const itemId = Number(request.params.id);
  const { amount } = request.body;

  const item = inventory.find((entry) => entry.id === itemId);
  if (!item) {
    return response.status(404).json({ message: 'Item not found' });
  }

  item.quantity = Math.max(0, item.quantity + Number(amount || 0));
  response.json({ item: { ...item, status: getStatus(item) } });
});

app.patch('/api/items/:id/urgent', ensureAdmin, (request, response) => {
  const itemId = Number(request.params.id);
  const item = inventory.find((entry) => entry.id === itemId);

  if (!item) {
    return response.status(404).json({ message: 'Item not found' });
  }

  item.urgent = !item.urgent;
  response.json({ item: { ...item, status: getStatus(item) } });
});

app.listen(PORT, () => {
  console.log(`Food Bank API running on http://localhost:${PORT}`);
});
