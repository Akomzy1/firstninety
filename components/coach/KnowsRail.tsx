/**
 * Right rail for /coach surfaces: "What the Coach knows here" — a small
 * Fraunces-italic list of context items pulled from user_responsibilities,
 * the user's role, current week, and any probation state. Per the AI
 * Coach prototype this is the "private to you" affordance that makes
 * the Coach feel rooted rather than generic.
 */
import Link from "next/link";

export type KnowsItem = {
  id: string;
  text: string;
  /** Optional accent — used for probation-coloured items. */
  emphasis?: "probation";
};

type KnowsRailProps = {
  items: ReadonlyArray<KnowsItem>;
};

export function KnowsRail({ items }: KnowsRailProps) {
  return (
    <aside
      aria-label="What the Coach knows in this thread"
      className="hidden lg:flex flex-col border-l border-paper-3 px-6 py-7 gap-4 min-h-[calc(100vh-4rem)]"
    >
      <p className="text-eyebrow">What the Coach knows here</p>

      <ul className="flex flex-col gap-3.5 list-none p-0 m-0">
        {items.length === 0 ? (
          <li
            className="font-display italic text-body-s text-mute pl-3 border-l border-paper-3"
            style={{ letterSpacing: "-0.005em" }}
          >
            Nothing on file yet. Tell me anything that should shape my
            coaching.
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className={`font-display italic pl-3 border-l ${
                item.emphasis === "probation"
                  ? "text-accent border-accent-soft"
                  : "text-ink border-paper-3"
              }`}
              style={{ fontSize: "15px", lineHeight: 1.45, letterSpacing: "-0.005em" }}
            >
              {item.text}
            </li>
          ))
        )}
      </ul>

      <p className="text-caption text-mute mt-3">
        This context is private to you. Edit it in{" "}
        <Link
          href="/settings/memory"
          className="text-ink underline-offset-4 hover:underline"
        >
          Settings
        </Link>
        .
      </p>
    </aside>
  );
}
