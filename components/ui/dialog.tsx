import { ReactNode } from "react";

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (v: boolean) => void; children: ReactNode }) {
  return open ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-neutral-900 p-6 rounded-lg shadow-lg w-[400px]">
        {children}
        <button className="mt-4 text-red-500" onClick={() => onOpenChange(false)}>Закрыть</button>
      </div>
    </div>
  ) : null;
}

export function DialogContent({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="text-lg font-bold mb-2">{children}</div>;
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-semibold text-neutral-50">{children}</h2>;
}
