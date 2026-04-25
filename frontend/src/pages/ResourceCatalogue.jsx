import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import resourceService from "../services/resourceService";
import ResourceModal from "../components/ResourceModal";
import ConfirmModal from "../components/ConfirmModal";
import SearchFilter from "../components/SearchFilter";
import { useAuth } from "../context/AuthContext";

const TYPES = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const API_ROOT = (process.env.REACT_APP_API_URL || "http://localhost:8081/api").replace(/\/api\/?$/, "");

const humanize = (value) => String(value || "").replaceAll("_", " ");
const getLiveStatus = (status) =>
  status === "ACTIVE"
    ? { label: "Available", dot: "🟢", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" }
    : { label: "Out of Service", dot: "🔴", cls: "bg-rose-50 text-rose-700 border-rose-200" };
const resolveImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${API_ROOT}${url.startsWith("/") ? "" : "/"}${url}`;
};
const DAY_NAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const parseTimeToMinutes = (hhmm) => {
  if (!hhmm || !String(hhmm).includes(":")) return null;
  const [h, m] = String(hhmm).slice(0, 5).split(":");
  const hours = Number(h);
  const mins = Number(m);
  if (!Number.isFinite(hours) || !Number.isFinite(mins)) return null;
  return hours * 60 + mins;
};
const isTimeWindowInside = (from, to, slotFrom, slotTo) => {
  const a = parseTimeToMinutes(from);
  const b = parseTimeToMinutes(to);
  const c = parseTimeToMinutes(slotFrom);
  const d = parseTimeToMinutes(slotTo);
  if ([a, b, c, d].some((x) => x == null)) return true;
  return a >= c && b <= d;
};
const matchesAvailabilityForDate = (resource, dateIso, from, to) => {
  if (!dateIso) return true;
  const dt = new Date(`${dateIso}T00:00:00`);
  // invalid date → don't filter out
  if (Number.isNaN(dt.getTime())) return true;
  const dayName = DAY_NAMES[dt.getDay()];

  const slots = Array.isArray(resource?.weeklySlots) ? resource.weeklySlots : [];
  const daySlots = slots.filter((s) => String(s?.day || "").toUpperCase() === dayName);
  const requiresWindowMatch = Boolean(from && to);

  // If weekly slots are configured, date MUST match at least one slot day.
  if (slots.length > 0) {
    if (daySlots.length === 0) return false;
    if (!requiresWindowMatch) return true;
    return daySlots.some((s) => isTimeWindowInside(from, to, s?.from, s?.to));
  }

  // Fallback to daily window if no weekly slots
  if (!requiresWindowMatch) return true;
  const availFrom = resource?.availableFrom ? String(resource.availableFrom).slice(0, 5) : null;
  const availTo = resource?.availableTo ? String(resource.availableTo).slice(0, 5) : null;
  if (availFrom && parseTimeToMinutes(from) < parseTimeToMinutes(availFrom)) return false;
  if (availTo && parseTimeToMinutes(to) > parseTimeToMinutes(availTo)) return false;
  return true;
};

export default function ResourceCatalogue() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("ADMIN");
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [deletingResource, setDeletingResource] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");
  const [selectedIds, setSelectedIds] = useState([]);
  const [adminFilteredResources, setAdminFilteredResources] = useState(null);
  const [adminStatFilter, setAdminStatFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    minCapacity: "",
    location: "",
    date: "",
    from: "",
    to: "",
  });
  const userHasActiveFilters = useMemo(() => {
    if (isAdmin) return false;
    return Boolean(
      query.trim() ||
        filters.type ||
        filters.status ||
        filters.minCapacity ||
        filters.location.trim() ||
        filters.date ||
        filters.from ||
        filters.to
    );
  }, [filters, isAdmin, query]);

  const clearUserFilters = useCallback(() => {
    setQuery("");
    setFilters({
      type: "",
      status: "",
      minCapacity: "",
      location: "",
      date: "",
      from: "",
      to: "",
    });
  }, []);

  const fetchResources = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const resourceData = await resourceService.getAll();
      setResources(resourceData || []);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load resources.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources
      .filter((r) => {
        if (filters.type && r.type !== filters.type) return false;
        if (filters.status && r.status !== filters.status) return false;
        if (filters.minCapacity && (r.capacity || 0) < Number(filters.minCapacity)) return false;
        if (filters.location && !(r.location || "").toLowerCase().includes(filters.location.toLowerCase())) return false;
        if (filters.from && r.availableFrom && String(r.availableFrom).slice(0, 5) > filters.from) return false;
        if (filters.to && r.availableTo && String(r.availableTo).slice(0, 5) < filters.to) return false;
        if (!matchesAvailabilityForDate(r, filters.date, filters.from, filters.to)) return false;
        if (q) {
          const text = `${r.name || ""} ${r.location || ""} ${humanize(r.type)}`.toLowerCase();
          if (!text.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "capacity") return (b.capacity || 0) - (a.capacity || 0);
        if (sortBy === "status") return String(a.status || "").localeCompare(String(b.status || ""));
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
  }, [resources, filters, query, sortBy]);

  const adminVisibleResources = useMemo(() => {
    if (!isAdmin) return filtered;
    const source = adminFilteredResources ?? resources;
    const statFiltered = source.filter((resource) => {
      if (adminStatFilter === "ALL") return true;
      if (adminStatFilter === "ACTIVE") return resource.status === "ACTIVE";
      if (adminStatFilter === "OUT_OF_SERVICE") return resource.status !== "ACTIVE";
      return true;
    });
    return [...statFiltered].sort((a, b) => {
      if (sortBy === "capacity") return (b.capacity || 0) - (a.capacity || 0);
      if (sortBy === "status") return String(a.status || "").localeCompare(String(b.status || ""));
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  }, [isAdmin, adminFilteredResources, resources, sortBy, filtered, adminStatFilter]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return resources
      .filter((r) => `${r.name} ${r.location} ${humanize(r.type)}`.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, resources]);

  const stats = useMemo(() => {
    const total = resources.length;
    const active = resources.filter((r) => r.status === "ACTIVE").length;
    const out = total - active;
    return { total, active, out };
  }, [resources]);

  const upsertResourceInAdminState = useCallback((updatedResource, originalId = null) => {
    const matchId = originalId || updatedResource?.id;
    if (!matchId) return;

    setResources((prev) => prev.map((item) => (item.id === matchId ? updatedResource : item)));
    setAdminFilteredResources((prev) =>
      prev ? prev.map((item) => (item.id === matchId ? updatedResource : item)) : prev
    );
  }, []);

  const handleSave = async (formData) => {
    try {
      setError(null);
      const { imageFile, ...resourceData } = formData;
      if (imageFile) {
        const multipartData = new FormData();
        multipartData.append("resource", JSON.stringify(resourceData));
        multipartData.append("image", imageFile);
        const saved = editingResource
          ? await resourceService.update(editingResource.id, multipartData)
          : await resourceService.create(multipartData);
        if (editingResource) {
          upsertResourceInAdminState(saved, editingResource.id);
        } else {
          setResources((prev) => [saved, ...prev]);
          setAdminFilteredResources((prev) => (prev ? [saved, ...prev] : prev));
        }
      } else {
        const saved = editingResource
          ? await resourceService.update(editingResource.id, resourceData)
          : await resourceService.create(resourceData);
        if (editingResource) {
          upsertResourceInAdminState(saved, editingResource.id);
        } else {
          setResources((prev) => [saved, ...prev]);
          setAdminFilteredResources((prev) => (prev ? [saved, ...prev] : prev));
        }
      }
      setShowModal(false);
    } catch (e) {
      setError(e?.response?.data?.error || "Save failed.");
    }
  };

  const toggleStatus = async (r) => {
    const next = r.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";
    const updated = await resourceService.update(r.id, { ...r, status: next });
    upsertResourceInAdminState(updated, r.id);
  };

  const exportCsv = () => {
    const header = "name,type,capacity,location,availableFrom,availableTo,status\n";
    const rows = filtered
      .map((r) =>
        [r.name, r.type, r.capacity ?? "", r.location, r.availableFrom || "", r.availableTo || "", r.status].join(",")
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resources-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCsv = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean).slice(1);
    for (const line of lines) {
      const [name, type, capacity, location, availableFrom, availableTo, status] = line.split(",");
      if (!name || !type || !location || !status) continue;
      await resourceService.create({
        name: name.trim(),
        type: type.trim(),
        capacity: capacity ? Number(capacity) : null,
        location: location.trim(),
        availableFrom: availableFrom?.trim() || null,
        availableTo: availableTo?.trim() || null,
        status: status.trim(),
      });
    }
    await fetchResources();
  };

  const applyBulkStatus = async (status) => {
    const updatedItems = await Promise.all(
      resources
        .filter((r) => selectedIds.includes(r.id))
        .map((r) => resourceService.update(r.id, { ...r, status }))
    );
    updatedItems.forEach((updated) => upsertResourceInAdminState(updated));
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    const idsToDelete = [...selectedIds];
    if (idsToDelete.length === 0) return;
    await Promise.all(idsToDelete.map((id) => resourceService.delete(id)));
    setResources((prev) => prev.filter((item) => !idsToDelete.includes(item.id)));
    setAdminFilteredResources((prev) => (prev ? prev.filter((item) => !idsToDelete.includes(item.id)) : prev));
    setSelectedIds([]);
    setShowBulkDeleteModal(false);
  };

  const handleAdminSearch = async ({ search, type, status, minCapacity }) => {
    try {
      setError(null);
      if (!search && !type && !status && !minCapacity) {
        setAdminFilteredResources(null);
        setAdminStatFilter("ALL");
        return;
      }
      const data = await resourceService.search({
        type: type || undefined,
        location: search || undefined,
        status: status || undefined,
        minCapacity: minCapacity || undefined,
      });
      setAdminFilteredResources(data || []);
    } catch (e) {
      setError(e?.response?.data?.error || "Search failed.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isAdmin ? "Resource Management Dashboard" : "Resource Catalogue"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin ? "Manage and control all resource records." : "Browse and discover the right campus resource fast."}
          </p>
        </div>
        {isAdmin && (
          <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700" onClick={() => { setEditingResource(null); setShowModal(true); }}>
            + Add Resource
          </button>
        )}
      </div>

      {error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm font-semibold">{error}</div>}

      {!isAdmin && (
        <div className="mt-6 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <h2 className="font-bold text-slate-900 mb-3">Smart Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <select className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white" value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}>
                <option value="">All types</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{humanize(t)}</option>
                ))}
              </select>
              <select className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
                <option value="">All status</option>
                <option value="ACTIVE">Available</option>
                <option value="OUT_OF_SERVICE">Out of service</option>
              </select>
              <input type="number" min="1" className="w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="Min capacity" value={filters.minCapacity} onChange={(e) => setFilters((p) => ({ ...p, minCapacity: e.target.value }))} />
              <input className="w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="Building / location" value={filters.location} onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))} />
              <input type="date" className="w-full rounded-xl border border-slate-200 px-3 py-2" value={filters.date} onChange={(e) => setFilters((p) => ({ ...p, date: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2 md:col-span-1">
                <input type="time" className="rounded-xl border border-slate-200 px-3 py-2" value={filters.from} onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} />
                <input type="time" className="rounded-xl border border-slate-200 px-3 py-2" value={filters.to} onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} />
              </div>
            </div>
          </div>

          <section>
            <div className="mb-4 flex flex-wrap gap-2 items-start">
              <div className="relative flex-1 min-w-[260px]">
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  placeholder="Search by name, type, location..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-sm">
                    {suggestions.map((s) => (
                      <button key={s.id} className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setQuery(s.name)}>
                        {s.name} - {s.location}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="inline-flex rounded-xl border border-slate-200 overflow-hidden">
                <button className={`px-3 py-2 text-sm font-semibold ${viewMode === "grid" ? "bg-slate-900 text-white" : "bg-white text-slate-700"}`} onClick={() => setViewMode("grid")}>Grid</button>
                <button className={`px-3 py-2 text-sm font-semibold ${viewMode === "list" ? "bg-slate-900 text-white" : "bg-white text-slate-700"}`} onClick={() => setViewMode("list")}>List</button>
              </div>
              <button
                type="button"
                onClick={clearUserFilters}
                disabled={!userHasActiveFilters}
                className="px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear filters
              </button>
            </div>

            {loading ? (
              <p className="text-slate-500 font-semibold">Loading resources...</p>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">No matching resources.</div>
            ) : (
              <>
                {viewMode === "list" ? (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Resource</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Capacity</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Location</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Availability</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filtered.map((r) => {
                            const live = getLiveStatus(r.status);
                            const avail =
                              r.availableFrom && r.availableTo
                                ? `${String(r.availableFrom).slice(0, 5)}–${String(r.availableTo).slice(0, 5)}`
                                : Array.isArray(r.weeklySlots) && r.weeklySlots.length > 0
                                  ? "Weekly slots"
                                  : "—";
                            return (
                              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                                      {r.imageUrl ? (
                                        <img src={resolveImageUrl(r.imageUrl)} alt={r.name} className="h-full w-full object-cover" />
                                      ) : (
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">No Img</span>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                                      <p className="text-xs text-slate-400">{r.location}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-700 font-semibold">{humanize(r.type)}</td>
                                <td className="px-4 py-3 text-sm text-slate-600 text-center">{r.capacity ?? "—"}</td>
                                <td className="px-4 py-3 text-sm text-slate-600">{r.location}</td>
                                <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{avail}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-bold ${live.cls}`}>
                                    <span>{live.dot}</span> {live.label}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <Link
                                    to={`/facilities/${r.id}`}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors"
                                  >
                                    View
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <p className="text-xs text-slate-500">{filtered.length} resource{filtered.length !== 1 ? "s" : ""}</p>
                      <p className="text-xs text-slate-400">Use filters to narrow results</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((r) => {
                      const live = getLiveStatus(r.status);
                      const hasWeeklySlots = Array.isArray(r.weeklySlots) && r.weeklySlots.length > 0;
                      const availabilityLabel =
                        hasWeeklySlots
                          ? "Weekly slots"
                          : r.availableFrom && r.availableTo
                            ? `${String(r.availableFrom).slice(0, 5)}–${String(r.availableTo).slice(0, 5)}`
                            : "No window set";
                      return (
                        <Link
                          key={r.id}
                          to={`/facilities/${r.id}`}
                          className="group bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                          <div className="relative">
                            {r.imageUrl ? (
                              <img
                                src={resolveImageUrl(r.imageUrl)}
                                alt={r.name}
                                className="h-44 w-full object-cover rounded-2xl border border-slate-100"
                              />
                            ) : (
                              <div className="h-44 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-sm font-semibold">
                                No photo uploaded
                              </div>
                            )}
                            <div className="absolute top-3 right-3">
                              <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border font-bold backdrop-blur ${live.cls}`}>
                                <span>{live.dot}</span> {live.label}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <h3 className="font-black text-slate-900 text-lg tracking-tight truncate">{r.name}</h3>
                            <p className="text-sm text-slate-500 font-medium mt-1 truncate">
                              {humanize(r.type)} • {r.location}
                            </p>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Capacity</p>
                                <p className="text-sm font-black text-slate-900 mt-1">{r.capacity ?? "N/A"}</p>
                              </div>
                              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available</p>
                                <p className="text-sm font-black text-slate-900 mt-1 truncate">{availabilityLabel}</p>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-50">
                              <span className="text-indigo-600 text-sm font-bold group-hover:translate-x-1 transition-transform">
                                View details →
                              </span>
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{humanize(r.type)}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}

      {isAdmin && (
        <>
          <div className="mt-6">
            <span className="inline-flex px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 uppercase tracking-wider">
              Admin Portal
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatTile label="Total Resources" value={stats.total} tone="indigo" active={adminStatFilter === "ALL"} onClick={() => setAdminStatFilter("ALL")} />
            <StatTile label="Active" value={stats.active} tone="emerald" active={adminStatFilter === "ACTIVE"} onClick={() => setAdminStatFilter("ACTIVE")} />
            <StatTile label="Out-of-Service" value={stats.out} tone="amber" active={adminStatFilter === "OUT_OF_SERVICE"} onClick={() => setAdminStatFilter("OUT_OF_SERVICE")} />
          </div>

          <div className="mt-6">
            <SearchFilter onSearch={handleAdminSearch} />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <select className="rounded-xl border border-slate-200 px-3 py-2 bg-white text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Sort by Name</option>
              <option value="capacity">Sort by Capacity</option>
              <option value="status">Sort by Status</option>
            </select>
            <button className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => applyBulkStatus("ACTIVE")} disabled={selectedIds.length < 2}>Bulk Active</button>
            <button className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => applyBulkStatus("OUT_OF_SERVICE")} disabled={selectedIds.length < 2}>Bulk Out-of-Service</button>
            <button
              className="px-3 py-2 text-sm rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-100"
              onClick={() => setShowBulkDeleteModal(true)}
              disabled={selectedIds.length < 2}
            >
              Bulk Delete
            </button>
            <button className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white" onClick={exportCsv}>Export CSV</button>
            <label className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white cursor-pointer">
              Import CSV
              <input type="file" accept=".csv" className="hidden" onChange={importCsv} />
            </label>
          </div>
          <div className="mt-4 bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="w-10 px-2 py-3" />
                    <th className="text-left px-4 py-3 font-bold text-slate-700">Name</th>
                    <th className="text-left px-4 py-3 font-bold text-slate-700">Type</th>
                    <th className="text-left px-4 py-3 font-bold text-slate-700">Capacity</th>
                    <th className="text-left px-4 py-3 font-bold text-slate-700">Location</th>
                    <th className="w-40 text-left px-3 py-3 font-bold text-slate-700">Status</th>
                    <th className="w-40 text-right px-3 py-3 font-bold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminVisibleResources.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-2 py-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(r.id)}
                          onChange={(e) => setSelectedIds((prev) => (e.target.checked ? [...prev, r.id] : prev.filter((id) => id !== r.id)))}
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{r.name}</td>
                      <td className="px-4 py-3">{humanize(r.type)}</td>
                      <td className="px-4 py-3">{r.capacity ?? "N/A"}</td>
                      <td className="px-4 py-3">{r.location}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => toggleStatus(r)}
                          className="inline-flex items-center"
                          aria-label={`Set ${r.name} status to ${r.status === "ACTIVE" ? "Out of Service" : "Active"}`}
                        >
                          <span
                            className={`relative h-6 w-11 overflow-hidden rounded-full transition-colors ${
                              r.status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-400"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                r.status === "ACTIVE" ? "translate-x-[20px]" : "translate-x-0"
                              }`}
                            />
                          </span>
                        </button>
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap flex items-center justify-end">
                        <Link to={`/facilities/${r.id}`} className="px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold mr-1.5 inline-flex items-center">View</Link>
                        <button className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold mr-1.5" onClick={() => { setEditingResource(r); setShowModal(true); }}>Edit</button>
                        <button className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold" onClick={() => { setDeletingResource(r); setShowDeleteModal(true); }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {isAdmin && showModal && (
        <ResourceModal
          resource={editingResource}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}

      {isAdmin && showDeleteModal && (
        <ConfirmModal
          title="Delete Resource"
          message={`Are you sure you want to delete ${deletingResource?.name || "this resource"}? This action cannot be undone.`}
          confirmText="Delete Now"
          onConfirm={async () => {
            await resourceService.delete(deletingResource.id);
            setResources((prev) => prev.filter((item) => item.id !== deletingResource.id));
            setAdminFilteredResources((prev) => (prev ? prev.filter((item) => item.id !== deletingResource.id) : prev));
            setShowDeleteModal(false);
          }}
          onClose={() => setShowDeleteModal(false)}
          variant="danger"
        />
      )}

      {isAdmin && showBulkDeleteModal && (
        <ConfirmModal
          title="Bulk Delete Resources"
          message={`Are you sure you want to delete ${selectedIds.length} selected resources? This action cannot be undone.`}
          confirmText="Delete Selected"
          onConfirm={handleBulkDelete}
          onClose={() => setShowBulkDeleteModal(false)}
          variant="danger"
        />
      )}
    </div>
  );
}

function StatTile({ label, value, tone = "indigo", active, onClick }) {
  const tones = {
    indigo: {
      base: "bg-indigo-50 border-indigo-100 hover:border-indigo-300",
      active: "bg-indigo-600 border-indigo-600",
      value: "text-indigo-700",
      valueActive: "text-white",
      label: "text-indigo-700/80",
      labelActive: "text-white/80",
    },
    emerald: {
      base: "bg-emerald-50 border-emerald-100 hover:border-emerald-300",
      active: "bg-emerald-600 border-emerald-600",
      value: "text-emerald-700",
      valueActive: "text-white",
      label: "text-emerald-700/80",
      labelActive: "text-white/80",
    },
    amber: {
      base: "bg-amber-50 border-amber-100 hover:border-amber-300",
      active: "bg-amber-500 border-amber-500",
      value: "text-amber-700",
      valueActive: "text-white",
      label: "text-amber-700/80",
      labelActive: "text-white/80",
    },
  };
  const selected = tones[tone] || tones.indigo;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${active ? selected.active : selected.base}`}
    >
      <p className={`text-xs uppercase tracking-wide font-bold ${active ? selected.labelActive : selected.label}`}>{label}</p>
      <p className={`mt-1 text-2xl font-black ${active ? selected.valueActive : selected.value}`}>{value}</p>
    </button>
  );
}

