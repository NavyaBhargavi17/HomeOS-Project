import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#241D1A]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Box */}
      <div className="relative bg-white rounded-2xl border border-[#E8DDD6] shadow-homeos-lg w-full max-w-md z-10 overflow-hidden text-[#241D1A] p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger
                ? 'bg-[#FBE6E6] text-[#D95C5C] border border-[#D95C5C]/30'
                : 'bg-[#FFF1D8] text-[#E7A84B] border border-[#E7A84B]/30'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className="text-base font-bold text-[#241D1A] tracking-tight font-display">
              {title}
            </h3>
            <p className="text-xs text-[#716963] leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#716963] hover:text-[#241D1A] hover:bg-[#F4D8CC]/40 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8DDD6]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
