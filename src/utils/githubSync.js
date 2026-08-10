// Background cloud-sync layer for `authMode: 'github'` sessions.
//
// localStorage stays the source of truth (see TrackerContext) — this
// just mirrors that data into a private Gist owned by the user, so it
// isn't stranded in a single browser. Sync is push-only: it keeps the
// gist up to date with whatever's stored locally. Restoring onto a new
// device is handled by the existing JSON export/import flow, not by
// this module.
//
// Note: GitHub's fine-grained PATs don't support the Gists API yet —
// only classic PATs with the `gist` scope can create/update gists. The
// PAT UI links to a pre-scoped classic-token page for this reason.

const GIST_FILENAME = 'python-ledger-progress.json';
const GIST_DESCRIPTION = 'The Python Ledger — progress backup (auto-synced, safe to leave alone)';

/**
 * Creates or updates the gist backing up a user's progress.
 *
 * Pass the previously-known gistId to update it in place; pass null/
 * undefined to create a new one. Always returns the gist's id — the
 * caller should persist it so the *next* sync updates this same gist
 * instead of creating a new one every time.
 */
export async function pushProgressToGist(pat, payload, gistId) {
  const url = gistId ? `https://api.github.com/gists/${gistId}` : 'https://api.github.com/gists';
  const method = gistId ? 'PATCH' : 'POST';

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `token ${pat}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: GIST_DESCRIPTION,
      public: false,
      files: { [GIST_FILENAME]: { content: JSON.stringify(payload, null, 2) } },
    }),
  });

  if (!response.ok) {
    if (gistId && (response.status === 404 || response.status === 410)) {
      // The gist this session remembers is gone (deleted on GitHub's
      // side, or the id was stale) — start a fresh one instead of
      // failing forever on every future sync.
      return pushProgressToGist(pat, payload, null);
    }
    if (response.status === 403 || response.status === 404) {
      throw new Error(
        "GitHub rejected the sync — this token can't access Gists. Fine-grained tokens don't support " +
          "Gists yet; use a classic token with the 'gist' scope instead."
      );
    }
    throw new Error(`GitHub sync failed (HTTP ${response.status}).`);
  }

  const gist = await response.json();
  return gist.id;
}
