import { useState } from "react";
import { cn } from "@/lib/utils";

interface CharacterAvatarProps {
  name: string;
  avatar?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-7 w-7 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
};

export function CharacterAvatar({ name, avatar, size = "md", className }: CharacterAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const fallbackUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(name.replace(/\s+/g, ""))}`;
  const src = avatar || fallbackUrl;

  return (
    <div
      className={cn(
        "rounded-full border-2 border-lavender overflow-hidden shrink-0 bg-lavender-light flex items-center justify-center font-serif font-bold text-primary",
        sizeMap[size],
        className
      )}
    >
      {imgError ? (
        <span>{name.charAt(0)}</span>
      ) : (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      )}
    </div>
  );
}
