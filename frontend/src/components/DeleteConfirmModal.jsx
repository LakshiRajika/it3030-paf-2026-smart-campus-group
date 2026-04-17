export default function DeleteConfirmModal({ resourceName, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-5">
          <h2 className="text-lg font-black text-slate-900">Delete resource</h2>
          <p className="text-sm text-slate-600 mt-2">
            Are you sure you want to delete <span className="font-bold">{resourceName || "this resource"}</span>?
            This action cannot be undone.
          </p>
        </div>
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

