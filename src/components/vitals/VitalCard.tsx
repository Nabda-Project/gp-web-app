import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

function HeartbeatPainter({ color }: { color: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 60"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
    >
      <path
        d="M0 30 L40 30 L50 22 L60 40 L70 12 L80 46 L92 30 L200 30"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 400,
          strokeDashoffset: 0,
          animation: "vitalEcg 2.4s linear infinite"
        }}
      />
      <style>{`@keyframes vitalEcg { from { stroke-dashoffset: 400 } to { stroke-dashoffset: 0 } }`}</style>
    </svg>
  );
}

export function VitalCard({
  label,
  value,
  unit,
  icon,
  color
}: {
  label: string;
  value: string;
  unit?: string;
  icon: string;
  color: string;
}) {
  const isHeart = icon === "favorite" || icon === "favorite_rounded";
  return (
    <Card
      className="relative overflow-hidden border p-4 text-center"
      style={{ borderColor: `${color}26` } as React.CSSProperties}
    >
      {isHeart ? <HeartbeatPainter color={color} /> : null}
      <div className="relative">
        <div
          className="mx-auto grid h-9 w-9 place-items-center rounded-full"
          style={{ background: `${color}1F`, color }}
        >
          <Icon name={icon} size={18} />
        </div>
        <p className="mt-3 text-lg font-extrabold text-darkBlue">
          {value} <span className="text-xs font-semibold text-grey">{unit}</span>
        </p>
        <p className="mt-1 text-xs font-semibold text-darkBlue">{label}</p>
      </div>
    </Card>
  );
}
