"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmModal({ title, description, confirmLabel = "Confirmar", onConfirm, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 touch-none" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <h3 className="text-[15px] font-semibold text-zinc-50">{title}</h3>
          <p className="text-[12px] text-zinc-500 mt-1">{description}</p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-zinc-800 bg-zinc-900 text-[13px] font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 h-10 rounded-lg bg-red-600 text-[13px] font-medium text-white hover:bg-red-500 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
