import { useState } from "react";

const TYPES = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];

export default function SearchFilter({ onSearch }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [minCapacity, setMinCapacity] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onSearch?.({
      search,
      type: type || null,
      status: status || null,
      minCapacity: minCapacity ? Number(minCapacity) : null,
    });
  };

  const clear = () => {
    setSearch("");
    setType("");
    setStatus("");
    setMinCapacity("");
    onSearch?.({ search: "", type: null, status: null, minCapacity: null });
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-600 mb-1">Location / keyword</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="e.g., Block C"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Type</label>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Status</label>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Min capacity</label>
          <input
            type="number"
            min="1"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="e.g., 20"
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
        >
          Search
        </button>
        <button
          type="button"
          onClick={clear}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition"
        >
          Clear
        </button>
      </div>
    </form>
  );
}

