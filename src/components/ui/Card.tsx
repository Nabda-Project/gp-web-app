import clsx from "@/utils/clsx";

export function Card({
  children,
  className,
  style
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section className={clsx("rounded-2xl border border-transparent bg-white p-5 shadow-card transition-colors dark:border-lightGrey/60 dark:bg-surface", className)} style={style}>
      {children}
    </section>
  );
}
