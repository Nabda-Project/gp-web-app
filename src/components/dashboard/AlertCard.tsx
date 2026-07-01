import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function AlertCard({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <aside className="rounded-[14px] border border-error/30 bg-gradient-to-br from-error/10 to-error/5 p-4" role="alert">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-error/20 text-error">
          <Icon name="warning_rounded" size={24} />
        </span>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-error">Critical Alert</h3>
          <p className="text-xs font-medium text-error/80">{count} patient(s) need immediate attention</p>
        </div>
        <Button type="button" variant="danger" onClick={onClick}>
          View
        </Button>
      </div>
    </aside>
  );
}
