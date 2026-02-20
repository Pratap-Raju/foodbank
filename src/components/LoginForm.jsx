import { LockKeyhole, UserRound } from 'lucide-react';

export default function LoginForm({ credentials, setCredentials, onSubmit, error }) {
  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
      <h2 className="mb-2 text-2xl font-semibold text-slate-900">Admin Portal</h2>
      <p className="mb-6 text-sm text-slate-600">Sign in to manage inventory stock levels.</p>

      <label className="mb-4 block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Username</span>
        <div className="flex items-center rounded-xl border border-slate-200 px-3 focus-within:border-emerald-500">
          <UserRound className="h-4 w-4 text-slate-500" />
          <input
            className="w-full rounded-xl p-3 outline-none"
            value={credentials.username}
            onChange={(event) => setCredentials((prev) => ({ ...prev, username: event.target.value }))}
            placeholder="admin"
          />
        </div>
      </label>

      <label className="mb-4 block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
        <div className="flex items-center rounded-xl border border-slate-200 px-3 focus-within:border-emerald-500">
          <LockKeyhole className="h-4 w-4 text-slate-500" />
          <input
            type="password"
            className="w-full rounded-xl p-3 outline-none"
            value={credentials.password}
            onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="••••••••"
          />
        </div>
      </label>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
      >
        Login
      </button>
    </form>
  );
}
