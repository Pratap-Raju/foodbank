import React, { useEffect, useMemo, useState } from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';
import htm from 'https://esm.sh/htm@3.1.1';
import { AlertTriangle, HeartPulse, LogIn, Minus, Plus, ShieldCheck } from 'https://esm.sh/lucide-react@0.469.0';

const html = htm.bind(React.createElement);
const API = '/api';

const statusStyles = {
  Critical: 'bg-red-100 text-red-700 border-red-200',
  Low: 'bg-amber-100 text-amber-700 border-amber-200',
  Stable: 'bg-green-100 text-green-700 border-green-200'
};

function StatusBadge({ status }) {
  return html`<span className=${`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status] || ''}`}>
    ${status}
  </span>`;
}

function App() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('donor');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('foodbank_token') || '');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    const response = await fetch(`${API}/items`);
    const data = await response.json();
    setItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const stats = useMemo(() => {
    return {
      Critical: items.filter((item) => item.status === 'Critical').length,
      Low: items.filter((item) => item.status === 'Low').length,
      Stable: items.filter((item) => item.status === 'Stable').length
    };
  }, [items]);

  const submitLogin = async (event) => {
    event.preventDefault();
    setLoginError('');

    const response = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    });

    if (!response.ok) {
      setLoginError('Login failed. Try admin / foodbank123.');
      return;
    }

    const data = await response.json();
    setToken(data.token);
    localStorage.setItem('foodbank_token', data.token);
    setLoginForm({ username: '', password: '' });
  };

  const updateStock = async (itemId, delta) => {
    await fetch(`${API}/items/${itemId}/stock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ delta })
    });
    await fetchItems();
  };

  const toggleUrgent = async (itemId, urgent) => {
    await fetch(`${API}/items/${itemId}/urgent`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ urgent: !urgent })
    });
    await fetchItems();
  };

  return html`
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <header className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Food Bank Operations Hub</h1>
            <p className="mt-2 text-sm text-slate-600">Modern inventory visibility for donors and staff.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick=${() => setTab('donor')} className=${`rounded-full px-4 py-2 text-sm font-medium ${tab === 'donor' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
              <${HeartPulse} size=${16} className="mr-2 inline" /> Donor Dashboard
            </button>
            <button onClick=${() => setTab('admin')} className=${`rounded-full px-4 py-2 text-sm font-medium ${tab === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
              <${ShieldCheck} size=${16} className="mr-2 inline" /> Admin Portal
            </button>
          </div>
        </div>
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        ${Object.entries(stats).map(
          ([key, value]) => html`
            <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm text-slate-500">${key} Items</p>
              <p className="mt-1 text-2xl font-semibold">${value}</p>
            </article>
          `
        )}
      </section>

      ${loading
        ? html`<p className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">Loading inventory...</p>`
        : tab === 'donor'
          ? html`
              <section className="space-y-4">
                ${items.map(
                  (item) => html`
                    <article className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                      <div>
                        <h2 className="text-lg font-semibold">${item.name}</h2>
                        <p className="text-sm text-slate-500">${item.stock} ${item.unit} available</p>
                      </div>
                      <div className="flex items-center gap-3">
                        ${item.urgent ? html`<span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"><${AlertTriangle} size=${14} />Urgent</span>` : null}
                        <${StatusBadge} status=${item.status} />
                      </div>
                    </article>
                  `
                )}
              </section>
            `
          : token
            ? html`
                <section className="space-y-4">
                  <div className="mb-4 flex justify-end">
                    <button
                      onClick=${() => {
                        setToken('');
                        localStorage.removeItem('foodbank_token');
                      }}
                      className="text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                      Log out
                    </button>
                  </div>
                  ${items.map(
                    (item) => html`
                      <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h2 className="text-lg font-semibold">${item.name}</h2>
                            <p className="text-sm text-slate-500">${item.stock} ${item.unit} available</p>
                          </div>
                          <${StatusBadge} status=${item.status} />
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <button onClick=${() => updateStock(item.id, -1)} className="rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"><${Minus} size=${16} /></button>
                          <button onClick=${() => updateStock(item.id, 1)} className="rounded-lg bg-slate-900 p-2 text-white hover:bg-slate-700"><${Plus} size=${16} /></button>
                          <button
                            onClick=${() => toggleUrgent(item.id, item.urgent)}
                            className=${`rounded-full px-4 py-2 text-xs font-semibold ${item.urgent ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}
                          >
                            Mark as Urgent: ${item.urgent ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      </article>
                    `
                  )}
                </section>
              `
            : html`
                <section className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h2 className="text-xl font-semibold">Admin Login</h2>
                  <p className="mt-1 text-sm text-slate-500">Use credentials: <strong>admin</strong> / <strong>foodbank123</strong></p>
                  <form onSubmit=${submitLogin} className="mt-4 space-y-3">
                    <input
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Username"
                      value=${loginForm.username}
                      onChange=${(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    />
                    <input
                      type="password"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Password"
                      value=${loginForm.password}
                      onChange=${(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                    ${loginError ? html`<p className="text-sm text-red-600">${loginError}</p>` : null}
                    <button className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                      <${LogIn} size=${16} className="mr-2" /> Sign In
                    </button>
                  </form>
                </section>
              `}
    </main>
  `;
}

createRoot(document.getElementById('root')).render(html`<${App} />`);
