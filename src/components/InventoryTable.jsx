import { AlertTriangle, Minus, Plus } from 'lucide-react';
import StatusPill from './StatusPill';

export default function InventoryTable({ items, isAdmin, onAdjust, onToggleUrgent }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Item</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Quantity</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
            {isAdmin ? (
              <>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Urgent</th>
              </>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
              <td className="px-6 py-4 text-sm text-slate-700">{item.quantity} units</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <StatusPill status={item.status} />
                  {item.urgent ? <AlertTriangle className="h-4 w-4 text-red-500" /> : null}
                </div>
              </td>
              {isAdmin ? (
                <>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 p-1 text-slate-700 hover:bg-slate-100"
                        onClick={() => onAdjust(item.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 p-1 text-slate-700 hover:bg-slate-100"
                        onClick={() => onAdjust(item.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => onToggleUrgent(item.id)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.urgent ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.urgent ? 'Marked Urgent' : 'Mark as Urgent'}
                    </button>
                  </td>
                </>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
