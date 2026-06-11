import Image from "next/image";
import { cn } from "@/lib/utils";
import { getFlagUrl } from "../../matches/utils/flag-url";

type TeamFlagProps = {
  name: string;
  flagCode: string | null;
  flagEmoji: string | null;
  className?: string;
};

export function TeamFlag({
  name,
  flagCode,
  flagEmoji,
  className,
}: TeamFlagProps) {
  const flagUrl = getFlagUrl(flagCode);

  return (
    <span
      className={cn(
        "flex items-center justify-center overflow-hidden bg-transparent ",
        className,
      )}
    >
      {flagUrl ? (
        <Image
          src={flagUrl}
          alt={`Flaga: ${name}`}
          width={96}
          height={72}
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <span className="text-2xl">{flagEmoji || "🏳️"}</span>
      )}
    </span>
  );
}
