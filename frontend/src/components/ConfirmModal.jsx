import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({ 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  onConfirm, 
  onClose,
  variant = "danger" // "danger" | "warning" | "info"
}) {
  const iconColor = variant === "danger" ? "text-rose-600 bg-rose-50" : variant === "warning" ? "text-amber-600 bg-amber-50" : "text-indigo-600 bg-indigo-50";
  const btnColor = variant === "danger" ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200" : variant === "warning" ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200";

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="relative p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${iconColor} transition-transform hover:scale-110 duration-300`}>
              {variant === "danger" ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
            </div>
            
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-100 transition-all active:scale-95"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className={`flex-1 px-4 py-3 rounded-2xl text-white font-bold transition-all shadow-lg active:scale-95 ${btnColor}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
