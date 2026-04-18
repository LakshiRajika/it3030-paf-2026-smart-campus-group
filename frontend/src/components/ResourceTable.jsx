const pill = (text, tone) => {
  const base = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold";
  const tones = {
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
    slate: "bg-slate-50 text-slate-700 border border-slate-200",
  };
  return <span className={`${base} ${tones[tone] || tones.slate}`}>{text}</span>;
};

export default function ResourceTable({ resources, onEdit, onDelete }) {
  if (!resources || resources.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-600">
        <p className="font-semibold">No resources found.</p>
        <p className="text-sm mt-1">Try changing your filters or add a new resource.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-black text-slate-700">Name</th>
              <th className="text-left px-4 py-3 font-black text-slate-700">Type</th>
              <th className="text-left px-4 py-3 font-black text-slate-700">Capacity</th>
              <th className="text-left px-4 py-3 font-black text-slate-700">Location</th>
              <th className="text-left px-4 py-3 font-black text-slate-700">Availability</th>
              <th className="text-left px-4 py-3 font-black text-slate-700">Status</th>
              <th className="text-right px-4 py-3 font-black text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => {
              const typeLabel = String(r.type || "").replaceAll("_", " ");
              const statusLabel = String(r.status || "").replaceAll("_", " ");
              const statusTone = r.status === "ACTIVE" ? "green" : "amber";
              const from = r.availableFrom || "";
              const to = r.availableTo || "";
              const availability = from && to ? `${from} - ${to}` : from || to ? `${from}${to ? ` - ${to}` : ""}` : "—";

              return (
                <tr key={r.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3 font-semibold text-slate-900">{r.name}</td>
                  <td className="px-4 py-3">{pill(typeLabel || "—", "slate")}</td>
                  <td className="px-4 py-3">{r.capacity ?? "—"}</td>
                  <td className="px-4 py-3">{r.location}</td>
                  <td className="px-4 py-3">{availability}</td>
                  <td className="px-4 py-3">{pill(statusLabel || "—", statusTone)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold"
                        onClick={() => onEdit?.(r)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold"
                        onClick={() => onDelete?.(r)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

