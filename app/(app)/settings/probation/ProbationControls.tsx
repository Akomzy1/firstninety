/**
 * Editorial-row probation controls.
 *
 * Three rows: Window length / Review date / Mode. Each row reads as a
 * sentence with one underlined token; clicking the token (or the
 * hover-revealed "Change" link on the right) swaps the row to an inline
 * edit affordance — a small input plus check / x icon buttons.
 *
 * Empty state (no review date on file) renders a chip-driven prompt
 * instead of the rows, per the Probation prototype State 3.
 */
"use client";

import { useState, useTransition } from "react";

import { Check, Plus, X } from "lucide-react";

import {
  activateProbationModeAction,
  deactivateProbationModeAction,
  setProbationReviewDateAction,
  setProbationWindowAction,
  type ProbationStatus,
} from "./actions";

type ProbationControlsProps = {
  status: ProbationStatus;
  /** Pre-formatted long review date (e.g. "Tuesday, 23 August"). */
  reviewDateLong: string | null;
};

export function ProbationControls({
  status,
  reviewDateLong,
}: ProbationControlsProps) {
  // Empty state — show a chip-driven prompt rather than rows.
  if (!status.review_date) {
    return <EmptyPrompt />;
  }

  return (
    <div className="flex flex-col mt-2 border-t border-paper-3">
      <WindowRow defaultValue={status.window_days} />
      <DateRow
        defaultValue={status.review_date}
        defaultLongLabel={reviewDateLong ?? status.review_date}
      />
      <ModeRow active={status.active} />
    </div>
  );
}

function EditorialRow({
  label,
  reading,
  editor,
  editing,
  setEditing,
  persistent = false,
}: {
  label: string;
  reading: React.ReactNode;
  editor: React.ReactNode;
  editing: boolean;
  setEditing: (next: boolean) => void;
  /** Show the Change link even when not hovered (e.g. for the Mode row). */
  persistent?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 items-baseline py-6 border-b border-paper-3 group">
      <div className="min-w-0 flex flex-col gap-2">
        <p className="text-eyebrow">{label}</p>
        {editing ? (
          <div className="mt-1">{editor}</div>
        ) : (
          <p
            className="text-ink"
            style={{ fontSize: "19px", lineHeight: 1.55 }}
          >
            {reading}
          </p>
        )}
      </div>
      {!editing ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`text-body-s font-medium text-mute hover:text-ink transition-opacity ${
            persistent
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
          }`}
        >
          Change
        </button>
      ) : null}
    </div>
  );
}

function InlineActions({
  onSave,
  onCancel,
  saving,
}: {
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="submit"
        onClick={onSave}
        disabled={saving}
        className="inline-flex size-8 items-center justify-center bg-ink text-paper hover:opacity-90 transition-opacity disabled:opacity-50"
        style={{ borderRadius: "4px" }}
        aria-label="Save"
      >
        <Check className="size-4" strokeWidth={1.75} aria-hidden />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex size-8 items-center justify-center border border-paper-3 text-mute hover:bg-paper-2 hover:text-ink transition-colors"
        style={{ borderRadius: "4px" }}
        aria-label="Cancel"
      >
        <X className="size-4" strokeWidth={1.75} aria-hidden />
      </button>
    </span>
  );
}

function WindowRow({ defaultValue }: { defaultValue: number }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [pending, startTransition] = useTransition();

  return (
    <EditorialRow
      label="Window length"
      editing={editing}
      setEditing={setEditing}
      reading={
        <>
          Probation Mode will activate{" "}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="font-medium text-ink border-b border-dashed border-mute-2 hover:border-ink transition-colors"
          >
            {defaultValue} days
          </button>{" "}
          before your review.
        </>
      }
      editor={
        <form
          action={(formData) => {
            startTransition(async () => {
              await setProbationWindowAction(null, formData);
              setEditing(false);
            });
          }}
          className="flex flex-wrap items-center gap-2"
        >
          <input
            type="number"
            name="window_days"
            min={7}
            max={90}
            step={1}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="h-9 w-24 bg-paper-2 border border-paper-3 px-3 text-body text-ink focus:outline-none focus:border-ink"
            style={{ borderRadius: "6px" }}
            aria-label="Days before review"
            autoFocus
          />
          <span className="text-body text-mute">days before review</span>
          <InlineActions
            onSave={() => undefined}
            onCancel={() => {
              setValue(defaultValue);
              setEditing(false);
            }}
            saving={pending}
          />
          <p className="basis-full mt-1 text-caption text-mute">
            Minimum 7, maximum 90. Adjust if your probation is shorter or
            longer than usual.
          </p>
        </form>
      }
    />
  );
}

function DateRow({
  defaultValue,
  defaultLongLabel,
}: {
  defaultValue: string;
  defaultLongLabel: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [pending, startTransition] = useTransition();

  return (
    <EditorialRow
      label="Review date"
      editing={editing}
      setEditing={setEditing}
      reading={
        <>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="font-medium text-ink border-b border-dashed border-mute-2 hover:border-ink transition-colors"
          >
            {defaultLongLabel}
          </button>
          . You can change this if it shifts.
        </>
      }
      editor={
        <form
          action={(formData) => {
            startTransition(async () => {
              await setProbationReviewDateAction(null, formData);
              setEditing(false);
            });
          }}
          className="flex flex-wrap items-center gap-2"
        >
          <input
            type="date"
            name="review_date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-9 bg-paper-2 border border-paper-3 px-3 text-body text-ink focus:outline-none focus:border-ink"
            style={{ borderRadius: "6px" }}
            autoFocus
          />
          <InlineActions
            onSave={() => undefined}
            onCancel={() => {
              setValue(defaultValue);
              setEditing(false);
            }}
            saving={pending}
          />
        </form>
      }
    />
  );
}

function ModeRow({ active }: { active: boolean }) {
  const [pending, startTransition] = useTransition();
  const onToggle = () => {
    startTransition(async () => {
      if (active) await deactivateProbationModeAction();
      else await activateProbationModeAction();
    });
  };

  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 items-baseline py-6 border-b border-paper-3">
      <div className="min-w-0 flex flex-col gap-2">
        <p className="text-eyebrow">Probation Mode</p>
        <p className="text-ink" style={{ fontSize: "19px", lineHeight: 1.55 }}>
          {active
            ? "Probation Mode is on. The Brief, the fourth Situation entry, and the prep-pack Playbook are all live."
            : "Probation Mode is off. It will activate automatically inside the window above — or switch it on now."}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        className={`text-body-s font-medium transition-colors ${
          active
            ? "text-danger hover:underline underline-offset-4"
            : "text-ink hover:underline underline-offset-4"
        } disabled:opacity-50`}
      >
        {active ? "Turn off" : "Switch on now"}
      </button>
    </div>
  );
}

function EmptyPrompt() {
  return (
    <section className="flex flex-col gap-5 max-w-prose">
      <p
        className="text-ink"
        style={{ fontSize: "20px", lineHeight: 1.55, maxWidth: "38ch" }}
      >
        <em className="font-display italic font-normal">
          Tell us when your probation review is
        </em>{" "}
        and we&rsquo;ll quietly switch on Probation Mode 21 days
        beforehand.
      </p>

      <DateChipRow />

      <p className="text-caption text-mute italic mt-2">
        You can change or clear this any time. We never share it.
      </p>
    </section>
  );
}

function DateChipRow() {
  const [pending, startTransition] = useTransition();
  const [showCustom, setShowCustom] = useState(false);
  const [custom, setCustom] = useState("");

  const submitDate = (iso: string) => {
    if (!iso) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("review_date", iso);
      await setProbationReviewDateAction(null, fd);
    });
  };

  const offsetIso = (weeksAhead: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + weeksAhead * 7);
    return d.toISOString().slice(0, 10);
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 mt-2">
      <Chip onClick={() => submitDate(offsetIso(2))} disabled={pending}>
        In two weeks
      </Chip>
      <Chip onClick={() => submitDate(offsetIso(3))} disabled={pending}>
        In three weeks
      </Chip>
      <Chip onClick={() => submitDate(offsetIso(6))} disabled={pending}>
        In six weeks
      </Chip>
      {showCustom ? (
        <form
          action={(formData) => {
            const iso = String(formData.get("review_date") ?? "");
            if (iso) submitDate(iso);
            setShowCustom(false);
          }}
          className="inline-flex items-center gap-2"
        >
          <input
            type="date"
            name="review_date"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="h-9 bg-paper-2 border border-paper-3 px-3 text-body-s text-ink focus:outline-none focus:border-ink"
            style={{ borderRadius: "999px" }}
            autoFocus
          />
          <button
            type="submit"
            className="inline-flex size-8 items-center justify-center bg-ink text-paper"
            style={{ borderRadius: "999px" }}
            aria-label="Save"
            disabled={pending}
          >
            <Check className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        </form>
      ) : (
        <Chip muted onClick={() => setShowCustom(true)} disabled={pending}>
          <Plus className="size-3.5" strokeWidth={1.5} aria-hidden />
          Pick a date
        </Chip>
      )}
    </div>
  );
}

function Chip({
  children,
  onClick,
  disabled,
  muted = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-body-s font-medium border bg-paper transition-colors hover:bg-paper-2 hover:border-mute-2 disabled:opacity-50 ${
        muted ? "text-mute border-paper-3" : "text-ink border-paper-3"
      }`}
      style={{ borderRadius: "999px" }}
    >
      {children}
    </button>
  );
}

