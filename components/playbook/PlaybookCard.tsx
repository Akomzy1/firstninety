/**
 * Playbook library card.
 *
 * Matches the Playbook Library prototype: rounded 10px outline card,
 * left-vertical rule (the "margin"), title + 4-line description excerpt,
 * coral side-stripe on the right (the visible hint that this document
 * carries annotations), and a metadata line at the bottom.
 */
import Link from "next/link";

const ROLE_LABEL: Record<string, string> = {
  ba: "BA",
  pm: "PM",
  sm: "Scrum Master",
  po: "PO",
  da: "Data Analyst",
  aie: "AI Engineer",
};

type PlaybookCardProps = {
  slug: string;
  role: string;
  title: string;
  variant: string | null;
  artefactType: string;
  description: string;
  annotationCount: number;
  workedExampleCount?: number;
  estimatedMinutes?: number;
  isProbationPack?: boolean;
};

export function PlaybookCard({
  slug,
  role,
  title,
  variant,
  artefactType: _artefactType,
  description,
  annotationCount,
  workedExampleCount = 1,
  estimatedMinutes,
  isProbationPack = false,
}: PlaybookCardProps) {
  const eyebrow = isProbationPack
    ? "Probation prep"
    : `${ROLE_LABEL[role] ?? role.toUpperCase()}${variant ? ` — ${variant} variant` : ""}`;

  // Prototype metadata format: "2 worked examples · 8 min".
  // Reading time falls back to ~2 min per annotation if not provided.
  const minutes =
    estimatedMinutes ??
    Math.max(5, Math.round(annotationCount * 2));
  const exampleLabel = `${workedExampleCount} worked example${workedExampleCount === 1 ? "" : "s"}`;

  return (
    <Link
      href={`/playbook/${slug}`}
      className="group relative flex h-full flex-col gap-3 border border-paper-3 bg-paper p-5 md:p-6 transition-colors hover:border-ink focus-visible:border-ink"
      style={{ borderRadius: "10px" }}
    >
      {/* left "margin" rule — the doc-card signature stroke */}
      <span
        className="absolute left-4 top-5 bottom-12 w-px bg-paper-3"
        aria-hidden
      />

      {/* coral eyebrow bar — annotation hint, top-right.
          Featured (probation pack) gets a wider accent bar per prototype. */}
      {annotationCount > 0 ? (
        <span
          className={`absolute right-3 top-6 h-16 ${
            isProbationPack ? "w-[18px] bg-accent/30" : "w-[14px] bg-accent/15"
          }`}
          aria-label={`${annotationCount} margin annotation${annotationCount === 1 ? "" : "s"}`}
        />
      ) : null}

      <div className="pl-3 pr-8">
        <p className="text-eyebrow">{eyebrow}</p>
        <h3
          className="font-display font-normal text-balance text-ink mt-2"
          style={{ fontSize: "22px", lineHeight: 1.25, letterSpacing: "-0.005em" }}
        >
          {title}
        </h3>
        <p className="text-body-s text-mute mt-2 line-clamp-4">{description}</p>
      </div>

      <div className="mt-auto pl-3 flex items-center gap-3">
        <span className="text-caption text-mute">
          {exampleLabel} &middot; {minutes} min
        </span>
      </div>
    </Link>
  );
}
