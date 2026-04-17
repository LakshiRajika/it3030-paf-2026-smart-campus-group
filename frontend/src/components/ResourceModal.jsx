import { useEffect, useMemo, useState } from "react";

const TYPES = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];

function toTimeInputValue(t) {
  if (!t) return "";
  // backend might return "08:00:00" or "08:00"
  return String(t).slice(0, 5);
}

export default function ResourceModal({ resource, onSave, onClose }) {
  const isEdit = Boolean(resource?.id);

  const [name, setName] = useState("");
  const [type, setType] = useState("LAB");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  useEffect(() => {
    setName(resource?.name || "");
    setType(resource?.type || "LAB");
    setCapacity(resource?.capacity ?? "");
    setLocation(resource?.location || "");
    setAvailableFrom(toTimeInputValue(resource?.availableFrom));
    setAvailableTo(toTimeInputValue(resource?.availableTo));
    setStatus(resource?.status || "ACTIVE");
  }, [resource]);

  const payload = useMemo(() => {
    return {
      name: name.trim(),
      type,
      capacity: capacity === "" ? null : Number(capacity),
      location: location.trim(),
      availableFrom: availableFrom || null,
      availableTo: availableTo || null,
      status,
    };
  }, [name, type, capacity, location, availableFrom, availableTo, status]);

  const submit = (e) => {
    e.preventDefault();
    onSave?.(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-lg font-black text-slate-900">
            {isEdit ? "Edit resource" : "Add resource"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">Provide the basic resource metadata.</p>
        </div>

        <form onSubmit={submit} className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Name</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Lab A"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Type</label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
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
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Capacity (optional)</label>
              <input
                type="number"
                min="1"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g., 30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Location</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Block C"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Available from (optional)</label>
              <input
                type="time"
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Available to (optional)</label>
              <input
                type="time"
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                value={availableTo}
                onChange={(e) => setAvailableTo(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              {isEdit ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

