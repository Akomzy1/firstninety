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
  isProbationPack?: boolean;
};

export function PlaybookCard({
  slug,
  role,
  title,
  variant,
  artefactType,
  description,
  annotationCount,
  isProbationPack = false,
}: PlaybookCardProps) {
  const eyebrow = isProbationPack
    ? "Probation prep"
    : `${ROLE_LABEL[role] ?? role.toUpperCase()}${variant ? ` — ${variant} variant` : ""}`;

  return (
    <Link
      href={`/playbook/${slug}`}
      className="group relative flex h-full flex-col gap-3 border border-paper-3 bg-paper p-5 md:p-6 transition-colors hover:border-mute focus-visible:border-ink"
      style={{ borderRadius: "10px" }}
    >
      {/* left "margin" rule — the doc-card signature stroke */}
      <span
        className="absolute left-4 top-5 bottom-12 w-px bg-paper-3"
        aria-hidden
      />

      {/* coral side stripe — annotation hint, top-right */}
      {annotationCount > 0 ? (
        <span
          className="absolute right-3 top-6 w-1 h-16 bg-accent/20"
          aria-label={`${annotationCount} margin annotation${annotationCount === 1 ? "" : "s"}`}
        />
      ) : null}

      <div className="pl-3">
        <p className="text-eyebrow">{eyebrow}</p>
        <h3 className="font-display text-h4 text-ink mt-2">{title}</h3>
        <p className="text-body-s text-mute mt-2 line-clamp-4">{description}</p>
      </div>

      <div className="mt-auto pl-3 flex items-center justify-between gap-3">
        <span className="text-caption text-mute">
          {artefactType.toUpperCase()}
        </span>
        <span className="text-caption text-mute group-hover:text-ink transition-colors">
          Read with worked example →
        </span>
      </div>
    </Link>
  );
}
