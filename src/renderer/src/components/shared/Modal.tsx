import type { MouseEvent, ReactNode } from "react";
import { createContext, useContext, useEffect } from "react";

/**
 * Compound Modal component, same pattern as Input.tsx:
 *   <Modal.Root open={open} onClose={onClose}>
 *     <Modal.Panel>
 *       <Modal.Header title="..." eyebrow="..." />
 *       <Modal.Body>...</Modal.Body>
 *       <Modal.Footer>...</Modal.Footer>
 *     </Modal.Panel>
 *   </Modal.Root>
 *
 * Root owns the shared behavior (backdrop click-to-close, Escape-to-close)
 * and exposes `onClose` via context so any subcomponent (or a custom one
 * you add later) can trigger it without prop-drilling. New modal flavors
 * (confirm dialogs, wizards, etc.) are built by composing these pieces,
 * not by copy-pasting the overlay/backdrop/dialog markup again.
 */

type ModalContextValue = {
  onClose: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error(
      "Modal.* compound components must be rendered inside <Modal.Root>",
    );
  }
  return context;
}

type ModalRootProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Close when clicking the dimmed backdrop. Default: true. */
  closeOnBackdrop?: boolean;
  /** Close on Escape key while open. Default: true. */
  closeOnEscape?: boolean;
};

function ModalRoot({
  open,
  onClose,
  children,
  closeOnBackdrop = true,
  closeOnEscape = true,
}: ModalRootProps) {
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, closeOnEscape, onClose]);

  if (!open) return null;

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalContext.Provider value={{ onClose }}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm"
        role="presentation"
        onMouseDown={handleBackdropMouseDown}
      >
        {children}
      </div>
    </ModalContext.Provider>
  );
}

type ModalPanelProps = {
  children: ReactNode;
  className?: string;
};

/** The white dialog surface. Override `className` to widen it per use case. */
function ModalPanel({ children, className = "" }: ModalPanelProps) {
  return (
    <div
      className={`w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ${className}`}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
}

type ModalHeaderProps = {
  title: string;
  eyebrow?: string;
  showCloseButton?: boolean;
};

function ModalHeader({
  title,
  eyebrow,
  showCloseButton = true,
}: ModalHeaderProps) {
  const { onClose } = useModalContext();

  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-sm font-semibold text-accent">{eyebrow}</p>
        )}
        <h2 className="mt-1 text-2xl font-bold">{title}</h2>
      </div>
      {showCloseButton && (
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-500"
        >
          ×
        </button>
      )}
    </div>
  );
}

function ModalBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

function ModalFooter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mt-6 ${className}`}>{children}</div>;
}

type ModalSegmentedProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  className?: string;
};

/**
 * Reusable segmented toggle (used for the photo/paper switch today).
 * Generic so any modal can reuse it for its own two-or-more-way switch
 * without re-implementing the pill styling.
 */
function ModalSegmented<T extends string>({
  value,
  onChange,
  options,
  className = "",
}: ModalSegmentedProps<T>) {
  return (
    <div
      className={`mb-4 grid gap-2 rounded-xl bg-slate-100 p-1 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-lg py-2 text-sm font-bold transition ${
            value === option.value
              ? "bg-white text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export const Modal = Object.assign(ModalRoot, {
  Root: ModalRoot,
  Panel: ModalPanel,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
  Segmented: ModalSegmented,
  useModalContext,
});
