import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction
}: {
  icon: string;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <section className="flex min-h-64 flex-col items-center justify-center px-8 py-10 text-center" role="status" aria-live="polite">
      <div className="rounded-full bg-primary/5 p-7 dark:bg-primary/10">
        <div className="rounded-full bg-primary/10 p-6 text-primary/60">
          <Icon name={icon} size={64} />
        </div>
      </div>
      <h3 className="mt-5 text-xl font-bold text-darkBlue">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-[15px] leading-relaxed text-grey">{description}</p> : null}
      {actionText && onAction ? (
        <Button type="button" variant="outline" className="mt-5" icon="refresh_rounded" onClick={onAction}>
          {actionText}
        </Button>
      ) : null}
    </section>
  );
}
