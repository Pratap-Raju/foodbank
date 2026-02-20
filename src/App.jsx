import { useEffect, useMemo, useState } from 'react';
import { HeartHandshake, LayoutDashboard, ShieldCheck } from 'lucide-react';
import InventoryTable from './components/InventoryTable';
import LoginForm from './components/LoginForm';

const API_BASE = 'http://localhost:4000/api';

export default function App() {
  const [items, setItems] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('foodbank-token'));
  const [activeView, setActiveView] = useState('donor');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  async function loadItems() {
    const response = await fetch(`${API_BASE}/items`);
    const data = await response.json();
    setItems(data.items);
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setError('');

    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      setError('Invalid username or password. Use admin / foodbank123');
      return;
    }

    const data = await response.json();
    localStorage.setItem('foodbank-token', data.token);
    setToken(data.token);
    setActiveView('admin');
    setCredentials({ username: '', password: '' });
  }

  async function adjustStock(itemId, amount) {
    await fetch(`${API_BASE}/items/${itemId}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ amount })
    });

    loadItems();
  }

  async function toggleUrgent(itemId) {
    await fetch(`${API_BASE}/items/${itemId}/urgent`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    loadItems();
  }

  function logout() {
    localStorage.removeItem('foodbank-token');
    setToken(null);
    setActiveView('donor');
  }

  const heading = useMemo(
    () =>
      activeView === 'donor'
        ? 'Donor Dashboard: Current Pantry Status'
        : 'Admin Portal: Inventory Controls',
    [activeView]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-7 w-7 text-emerald-600" />
            <div>
              <h1 className="text-lg font-bold text-slate-900">NourishNet Food Bank</h1>
              <p className="text-xs text-slate-500">Modern inventory visibility for donors and operators</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('donor')}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm ${
                activeView === 'donor' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Donor Dashboard
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm ${
                activeView === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="h-4 w-4" /> Admin Portal
            </button>
            {token ? (
              <button onClick={logout} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700">
                Logout
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="mb-6 text-3xl font-bold text-slate-900">{heading}</h2>

        {activeView === 'admin' && !token ? (
          <LoginForm
            credentials={credentials}
            setCredentials={setCredentials}
            onSubmit={handleLogin}
            error={error}
          />
        ) : (
          <InventoryTable
            items={items}
            isAdmin={activeView === 'admin'}
            onAdjust={adjustStock}
            onToggleUrgent={toggleUrgent}
          />
        )}
      </main>
    </div>
  );
}
