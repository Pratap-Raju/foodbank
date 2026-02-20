const statusStyles = {
  Critical: 'bg-red-100 text-red-700 border-red-200',
  Low: 'bg-amber-100 text-amber-700 border-amber-200',
  Stable: 'bg-emerald-100 text-emerald-700 border-emerald-200'
};

export default function StatusPill({ status }) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      {status}
    </span>
  );
}
