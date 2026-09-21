import React from 'react';
import { useHomeOs } from '../../context/HomeOsContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useHomeOs();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0 animate-fadeIn">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-white border border-[#E8DDD6] shadow-homeos-lg text-[#241D1A] transition-all transform translate-y-0"
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#4FA77B]" />}
              {isError && <AlertCircle className="w-5 h-5 text-[#D95C5C]" />}
              {isInfo && <Info className="w-5 h-5 text-[#668BC4]" />}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-[#241D1A] tracking-wide">{toast.title}</h5>
              <p className="text-xs text-[#716963] mt-0.5 line-clamp-2">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#9A908A] hover:text-[#241D1A] p-1 -mr-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
