"use client";

import { Icon } from "@/components/ui/Icon";

export function Modal({
  title,
  open,
  onClose,
  children
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-darkBlue/30 p-4 backdrop-blur-sm dark:bg-black/50">
      <section className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-3xl bg-background shadow-[0_20px_60px_rgba(3,4,94,0.20)] dark:border dark:border-lightGrey/60 dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-lightGrey/60 bg-background px-6 py-4">
          <h2 className="text-xl font-bold text-darkBlue">{title}</h2>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-lightGrey/50 text-grey transition hover:text-darkBlue" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="p-6">{children}</div>
      </section>
    </div>
  );
}
