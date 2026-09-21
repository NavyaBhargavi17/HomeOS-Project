import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  showClose = true
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#241D1A]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className={`relative bg-white rounded-2xl border border-[#E8DDD6] shadow-homeos-lg w-full ${maxWidth} z-10 overflow-hidden transform transition-all my-8 text-[#241D1A]`}>
        {/* Header */}
        <div className="px-6 py-5 bg-[#FFF9F6] border-b border-[#E8DDD6] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#241D1A] font-display tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[#716963] mt-0.5">{subtitle}</p>}
          </div>
          {showClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#716963] hover:text-[#241D1A] hover:bg-[#F4D8CC]/40 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto text-sm text-[#716963]">
          {children}
        </div>
      </div>
    </div>
  );
}
