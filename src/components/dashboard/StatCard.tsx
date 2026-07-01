import { Icon } from "@/components/ui/Icon";
import clsx from "@/utils/clsx";

export function StatCard({
  icon,
  value,
  label,
  color,
  onClick,
  wide = false
}: {
  icon: string;
  value: string | number;
  label: string;
  color: string;
  onClick?: () => void;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "relative overflow-hidden rounded-[14px] border border-transparent bg-white px-4 py-3 text-left shadow-[0_4px_10px_rgba(64,123,255,0.10)] transition hover:-translate-y-0.5 hover:shadow-lg dark:border-lightGrey/60 dark:bg-surface dark:shadow-[0_8px_24px_rgba(0,0,0,0.22)]",
        wide ? "md:col-span-2 xl:col-span-4" : ""
      )}
    >
      <Icon name={icon} size={70} className="absolute -bottom-3 -right-3 opacity-[0.04] dark:opacity-[0.08]" />
      <div className="relative flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-[10px]" style={{ background: `${color}1A`, color }}>
          <Icon name={icon} size={22} />
        </span>
        <span>
          <span className="block text-[26px] font-extrabold leading-none" style={{ color }}>
            {value}
          </span>
          <span className="mt-1 block text-xs font-bold text-grey">{label}</span>
        </span>
      </div>
    </button>
  );
}
