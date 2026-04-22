import { useEffect, useMemo, useState } from "react";

const TYPES = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];
const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const API_ROOT = (process.env.REACT_APP_API_URL || "http://localhost:8081/api").replace(/\/api\/?$/, "");

function toTimeInputValue(t) {
  if (!t) return "";
  // backend might return "08:00:00" or "08:00"
  return String(t).slice(0, 5);
}

function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${API_ROOT}${url.startsWith("/") ? "" : "/"}${url}`;
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
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [amenities, setAmenities] = useState("");
  const [weeklySlots, setWeeklySlots] = useState([]);

  useEffect(() => {
    setName(resource?.name || "");
    setType(resource?.type || "LAB");
    setCapacity(resource?.capacity ?? "");
    setLocation(resource?.location || "");
    setAvailableFrom(toTimeInputValue(resource?.availableFrom));
    setAvailableTo(toTimeInputValue(resource?.availableTo));
    setStatus(resource?.status || "ACTIVE");
    setImageFile(null);
    setExistingImageUrl(resource?.imageUrl || "");
    setAmenities(Array.isArray(resource?.amenities) ? resource.amenities.join(", ") : "");
    setWeeklySlots(
      Array.isArray(resource?.weeklySlots) && resource.weeklySlots.length > 0
        ? resource.weeklySlots.map((slot) => ({
            day: slot.day || "MONDAY",
            from: slot.from || "08:00",
            to: slot.to || "17:00",
          }))
        : [{ day: "MONDAY", from: "08:00", to: "17:00" }]
    );
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
      imageUrl: existingImageUrl || null,
      amenities: amenities.split(",").map((x) => x.trim()).filter(Boolean),
      weeklySlots: weeklySlots
        .map((slot) => ({
          day: slot.day,
          from: slot.from,
          to: slot.to,
        }))
        .filter((slot) => slot.day && slot.from && slot.to && slot.from < slot.to),
    };
  }, [name, type, capacity, location, availableFrom, availableTo, status, existingImageUrl, amenities, weeklySlots]);

  const addWeeklySlot = () => {
    setWeeklySlots((prev) => [...prev, { day: "MONDAY", from: "08:00", to: "17:00" }]);
  };

  const removeWeeklySlot = (index) => {
    setWeeklySlots((prev) => prev.filter((_, i) => i !== index));
  };

  const updateWeeklySlot = (index, key, value) => {
    setWeeklySlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [key]: value } : slot))
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
  };

  const submit = (e) => {
    e.preventDefault();
    onSave?.({ ...payload, imageFile });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-lg font-black text-slate-900">
            {isEdit ? "Edit resource" : "Add resource"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">Provide the basic resource metadata.</p>
        </div>

        <form onSubmit={submit} className="flex-1 min-h-0 flex flex-col">
          <div className="p-5 overflow-y-auto">
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

              <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Image upload</label>
              <input
                type="file"
                accept="image/*"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
                onChange={handleImageUpload}
              />
              <p className="text-[11px] text-slate-500 mt-1">Upload a new image file for this resource.</p>
              {existingImageUrl && (
                <img src={resolveImageUrl(existingImageUrl)} alt="Current resource" className="mt-2 max-h-40 w-full rounded-lg object-cover border border-slate-200" />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Amenities (comma separated)</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                placeholder="Projector, Whiteboard, AC"
              />
            </div>

              <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-600">Recurring weekly slots</label>
                <button
                  type="button"
                  onClick={addWeeklySlot}
                  className="px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100"
                >
                  + Add slot
                </button>
              </div>
              <div className="space-y-2">
                {weeklySlots.map((slot, index) => (
                  <div key={`${slot.day}-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center rounded-xl border border-slate-200 p-2">
                    <select
                      className="rounded-lg border border-slate-200 px-2 py-2 bg-white text-sm"
                      value={slot.day}
                      onChange={(e) => updateWeeklySlot(index, "day", e.target.value)}
                    >
                      {DAYS.map((day) => (
                        <option key={day} value={day}>
                          {day.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                    <input
                      type="time"
                      className="rounded-lg border border-slate-200 px-2 py-2 text-sm"
                      value={slot.from}
                      onChange={(e) => updateWeeklySlot(index, "from", e.target.value)}
                    />
                    <input
                      type="time"
                      className="rounded-lg border border-slate-200 px-2 py-2 text-sm"
                      value={slot.to}
                      onChange={(e) => updateWeeklySlot(index, "to", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeWeeklySlot(index)}
                      disabled={weeklySlots.length === 1}
                      className="px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Tip: add one or more weekly windows. Slots with invalid time ranges are ignored.</p>
            </div>
          </div>
          </div>

          <div className="p-5 border-t border-slate-200 bg-white flex items-center justify-end gap-2">
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

