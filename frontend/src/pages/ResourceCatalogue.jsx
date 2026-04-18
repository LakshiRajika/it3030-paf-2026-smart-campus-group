import { useEffect, useMemo, useState } from "react";
import resourceService from "../services/resourceService";
import ResourceTable from "../components/ResourceTable";
import ResourceModal from "../components/ResourceModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import SearchFilter from "../components/SearchFilter";

export default function ResourceCatalogue() {
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
    setEditingResource(null);
    setShowModal(true);
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setShowModal(true);
  };

  const handleDeleteClick = (resource) => {
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Facilities & Assets</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage bookable resources like rooms, labs, and equipment.
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 transition"
          onClick={handleCreate}
        >
          + Add Resource
        </button>
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
          <ResourceTable resources={filtered} onEdit={handleEdit} onDelete={handleDeleteClick} />
        )}
      </div>

      {showModal && (
        <ResourceModal
          resource={editingResource}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          resourceName={deletingResource?.name}
          onConfirm={handleDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}

