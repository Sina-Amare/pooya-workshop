"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { CheckIcon, CloseIcon, WarningIcon } from "@/components/icons";

interface ToastItem {
  id: number;
  message: string;
  kind: "success" | "error";
}

const ToastContext = createContext<{
  toast: (message: string, kind?: "success" | "error") => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx.toast;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const toast = useCallback(
    (message: string, kind: "success" | "error" = "success") => {
      const id = ++counter.current;
      setItems((prev) => [...prev, { id, message, kind }]);
      // Errors stay until dismissed so the owner has time to read them (WCAG 2.2.1).
      if (kind === "success") {
        setTimeout(() => {
          setItems((prev) => prev.filter((t) => t.id !== id));
        }, 4200);
      }
    },
    [],
  );

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Top placement so messages never cover the action buttons at the bottom of forms */}
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4"
        aria-live="polite"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role={item.kind === "error" ? "alert" : undefined}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-3 text-[0.92rem] font-medium text-white shadow-[var(--shadow-card-lg)] ${
              item.kind === "success" ? "bg-espresso" : "bg-[#8c2f23]"
            }`}
          >
            {item.kind === "success" ? (
              <CheckIcon size={17} className="text-[#8fce9b]" />
            ) : (
              <WarningIcon size={17} className="text-[#f3b8ae]" />
            )}
            {item.message}
            {item.kind === "error" && (
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="بستن پیام"
                className="ms-1 grid size-6 place-items-center rounded-md bg-white/15 transition-colors hover:bg-white/30"
              >
                <CloseIcon size={13} />
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
