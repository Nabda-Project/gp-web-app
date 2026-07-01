import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { initials } from "@/utils/format";

export function Avatar({
  name,
  imageUrl,
  size = 44,
  fallbackIcon = "person"
}: {
  name?: string | null;
  imageUrl?: string | null;
  size?: number;
  fallbackIcon?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = imageUrl && imageUrl.trim() !== "" && !failed;
  return (
    <span
      className="relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 font-extrabold text-primary"
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.36) }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={name ?? "Avatar"} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : name ? (
        initials(name)
      ) : (
        <Icon name={fallbackIcon} size={size * 0.48} />
      )}
    </span>
  );
}
