/**
 * Triggers exportUserDataAction and turns the returned JSON into an
 * immediate browser download. Anchor-with-Blob pattern keeps everything
 * client-side after the action returns.
 */
"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/Button";

import { exportUserDataAction } from "./actions";

export function ExportButton() {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const { filename, json } = await exportUserDataAction();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  return (
    <Button
      type="button"
      variant="primary"
      onClick={handleClick}
      loading={pending}
      loadingText="Bundling…"
      className="self-start"
    >
      Export my data
    </Button>
  );
}
