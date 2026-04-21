import { useEffect, useMemo, useState } from "react";
import resourceService from "../services/resourceService";
import ResourceTable from "../components/ResourceTable";
import ResourceModal from "../components/ResourceModal";
import ConfirmModal from "../components/ConfirmModal";
import SearchFilter from "../components/SearchFilter";
import { useAuth } from "../context/AuthContext";

export default function ResourceCatalogue() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("ADMIN");
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [deletingResource, setDeletingResource] = useState(null);

  const canDismissError = useMemo(() => Boolean(error), [error]);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await resourceService.getAll();
      setFiltered(data || []);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async ({ search, type, status, minCapacity }) => {
    try {
      setError(null);
      const data = await resourceService.search({
        type: type || undefined,
        location: search || undefined,
        status: status || undefined,
        minCapacity: minCapacity || undefined,
      });
      setFiltered(data || []);
    } catch (e) {
      setError(e?.response?.data?.error || "Search failed.");
    }
  };

  const handleCreate = () => {
    if (!isAdmin) return;
    setEditingResource(null);
    setShowModal(true);
  };

  const handleEdit = (resource) => {
    if (!isAdmin) return;
    setEditingResource(resource);
    setShowModal(true);
  };

  const handleDeleteClick = (resource) => {
    if (!isAdmin) return;
    setDeletingResource(resource);
    setShowDeleteModal(true);
  };

  const handleSave = async (formData) => {
    try {
      setError(null);
      if (editingResource) {
        await resourceService.update(editingResource.id, formData);
      } else {
        await resourceService.create(formData);
      }
      setShowModal(false);
      fetchResources();
    } catch (e) {
      const validation = e?.response?.data?.details;
      if (validation && typeof validation === "object") {
        const first = Object.values(validation)[0];
        setError(first || "Save failed.");
      } else {
        setError(e?.response?.data?.error || "Save failed.");
      }
    }
  };

  const handleDelete = async () => {
    try {
      setError(null);
      await resourceService.delete(deletingResource.id);
      setShowDeleteModal(false);
      fetchResources();
    } catch (e) {
      setError(e?.response?.data?.error || "Delete failed.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isAdmin ? "Manage Resources" : "Facilities & Assets"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin
              ? "Maintain bookable resources like rooms, labs, and equipment."
              : "Browse available campus resources, labs, and equipment."}
          </p>
        </div>
        {isAdmin && (
          <button
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 transition"
            onClick={handleCreate}
          >
            + Add Resource
          </button>
        )}
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 text-sm flex items-center justify-between gap-3">
          <span className="font-semibold">{error}</span>
          {canDismissError && (
            <button
              className="text-rose-700 hover:text-rose-900 font-bold"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      <div className="mt-6">
        <SearchFilter onSearch={handleSearch} />
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="text-slate-500 font-semibold">Loading resources...</p>
        ) : (
          <ResourceTable
            resources={filtered}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            showActions={isAdmin}
          />
        )}
      </div>

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
          onConfirm={handleDelete}
          onClose={() => setShowDeleteModal(false)}
          variant="danger"
        />
      )}
    </div>
  );
}

