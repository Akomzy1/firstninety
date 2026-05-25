/**
 * Situation Room intake — placeholder for the daily home until Prompt
 * 3.7 wires real submission. Renders the three soft labels above a
 * full-width textarea, exactly the lockup the Situation Room prototype
 * uses (it's the "single, large input field" signature surface from
 * Design Brief §10).
 *
 * The textarea is purposefully a link to /situation-room — clicking
 * anywhere in the card forwards to the real surface (once it exists).
 */
import Link from "next/link";

type SituationEntry = "prep" | "is_this_normal" | "debrief";

const LABELS: ReadonlyArray<{ value: SituationEntry; label: string }> = [
  { value: "prep", label: "I need help with this" },
  { value: "is_this_normal", label: "Is this normal?" },
  { value: "debrief", label: "I just did something" },
];

export function SituationRoomInput() {
  return (
    <Link
      href="/situation-room"
      className="block border border-paper-3 bg-paper p-5 md:p-6 hover:border-mute transition-colors"
      style={{ borderRadius: "10px" }}
      aria-label="Open the Situation Room"
    >
      <p className="text-eyebrow">Situation Room</p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-body-s text-mute">
        {LABELS.map((item, idx) => (
          <span key={item.value} className="inline-flex items-center gap-2">
            {idx === 0 ? null : <span aria-hidden>·</span>}
            <span>{item.label}</span>
          </span>
        ))}
      </div>
      <div
        className="mt-3 min-h-[88px] bg-paper-2 border border-paper-3 p-3 text-body text-mute"
        style={{ borderRadius: "8px" }}
      >
        Type a situation, a question, or what just happened.
      </div>
    </Link>
  );
}
