/**
 * Graceful loading state while `generateDebrief()` runs — typically
 * 6-12 seconds for an Opus call. Voice rules apply: no exclamation,
 * no faux-warmth, just a quiet line.
 */
export default function DebriefLoading() {
  return (
    <main className="mx-auto w-full max-w-[720px] px-6 md:px-8 py-20 flex flex-col gap-6">
      <p className="text-eyebrow text-mute-2">Debrief</p>
      <h1
        className="font-display font-normal text-balance text-ink"
        style={{
          fontSize: "clamp(2rem, 4vw, 2.75rem)",
          lineHeight: 1.1,
          letterSpacing: "-0.015em",
        }}
      >
        Reading the room.
      </h1>
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-4 py-2"
      >
        <span aria-hidden className="inline-flex items-center gap-2">
          <span
            className="block size-1.5 rounded-full bg-mute opacity-60 animate-pulse"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="block size-1.5 rounded-full bg-mute opacity-60 animate-pulse"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="block size-1.5 rounded-full bg-mute opacity-60 animate-pulse"
            style={{ animationDelay: "300ms" }}
          />
        </span>
        <span className="text-body-s text-mute italic">
          Walking back through what just happened&hellip;
        </span>
      </div>
    </main>
  );
}
