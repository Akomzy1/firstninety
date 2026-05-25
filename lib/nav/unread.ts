/**
 * Unread indicators for the app chrome.
 *
 * Phase 1 stub — the production query (when situation-room is wired up in
 * Prompt 3.7) will look at situation_sessions for unread follow-ups. For
 * now it always returns zero so the dot stays hidden.
 */
import "server-only";

export type UnreadCounts = {
  situation_room: number;
};

export async function getUnreadCounts(_userId: string): Promise<UnreadCounts> {
  // TODO(phase 3.7): query situation_sessions for follow-up flags.
  return { situation_room: 0 };
}
