"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/admin/ui";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmDisabled?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Native <dialog>-based confirm: focus moves in on open and returns on close,
 * Escape closes, and the background is inert — all provided by the platform.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "بله، حذف کن",
  confirmDisabled,
  busy,
  onConfirm,
  onClose,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="m-auto w-[calc(100%-2.5rem)] max-w-sm rounded-2xl bg-surface p-6 text-ink shadow-[var(--shadow-card-lg)] backdrop:bg-espresso/40 backdrop:backdrop-blur-sm"
    >
      <h2 id={titleId} className="font-display text-lg font-bold">
        {title}
      </h2>
      <p className="mt-2 text-[0.88rem] leading-7 text-muted">{description}</p>
      <div className="mt-6 flex gap-3">
        <Button
          variant="danger"
          busy={busy}
          disabled={confirmDisabled}
          onClick={onConfirm}
          className="flex-1"
        >
          {confirmLabel}
        </Button>
        <Button variant="secondary" onClick={onClose} className="flex-1" autoFocus>
          انصراف
        </Button>
      </div>
    </dialog>
  );
}
