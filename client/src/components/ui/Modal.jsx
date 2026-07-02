import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, size = "md" }) {
  const overlay = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const handler = (e) => { if (e.key === "Escape") onClose?.(); };
      window.addEventListener("keydown", handler);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handler);
      };
    }
    return () => (document.body.style.overflow = "");
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full mx-4",
  }[size];

  return (
    <div
      ref={overlay}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={(e) => e.target === overlay.current && onClose?.()}
    >
      <div className="absolute inset-0 bg-carbon-950/85 backdrop-blur-sm" />

      <div
        className={`
          relative w-full ${sizeClass} bg-carbon-800 border border-white/[0.08]
          rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden
          animate-slide-up
        `}
      >
        {title && (
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/[0.05]">
            <h2 className="text-base sm:text-lg font-display font-semibold text-gray-100">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="btn-icon text-gray-600 hover:text-gray-200 hover:bg-white/[0.05]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="px-5 sm:px-6 py-5 max-h-[80vh] sm:max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
