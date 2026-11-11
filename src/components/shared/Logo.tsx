import Link from "next/link";

interface LogoProps {
  href?: string;
  compact?: boolean;
  /** "inverse" pour les surfaces sombres (panneau encre). */
  tone?: "default" | "inverse";
}

/**
 * Marque AUTOMATIC.
 * Signe : carré encre, losange ajouré, point cobalt. Wordmark en display.
 */
export function Logo({ href = "/", compact = false, tone = "default" }: LogoProps) {
  const inverse = tone === "inverse";

  return (
    <Link href={href} className="inline-flex items-center gap-2.5 group" aria-label="AUTOMATIC, accueil">
      <span
        className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-[9px] ${
          inverse ? "bg-background text-foreground" : "bg-primary text-background"
        }`}
      >
        <span
          className={`block h-3 w-3 rotate-45 rounded-[2px] border-[1.5px] ${
            inverse ? "border-foreground/90" : "border-background/90"
          }`}
        />
        <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      {!compact && (
        <span
          className={`font-heading text-[15px] font-semibold uppercase leading-none tracking-[0.14em] ${
            inverse ? "text-background" : "text-foreground"
          }`}
        >
          Automatic
        </span>
      )}
    </Link>
  );
}
