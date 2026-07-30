const SCHEMA_VERSION = 1;

// Accepts both the old shape (array of plain id strings) and the new
// shape (array of {id, title, completedAt}) so nothing breaks for
// anyone who already has data saved under the old format.
export function normalizeCompleted(completed) {
  if (!Array.isArray(completed)) return [];
  return completed.map((entry) =>
    typeof entry === 'string'
      ? { id: entry, title: null, completedAt: null }
      : { id: entry.id, title: entry.title ?? null, completedAt: entry.completedAt ?? null }
  );
}

/**
 * Builds the exportable snapshot of a user's local progress.
 *
 * Deliberately excludes the GitHub token: this file is meant to move
 * between a person's own devices (or get pasted into a support channel
 * if something breaks), and a token should never leave the browser it
 * was typed into.
 */
export function buildExportPayload(progress) {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    githubUser: progress?.user
      ? { login: progress.user.login, avatarUrl: progress.user.avatar_url }
      : null,
    completedLessons: normalizeCompleted(progress?.completed),
  };
}

export function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function parseImportFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected.'));
      return;
    }

    const looksLikeJson = file.type.includes('json') || file.name.endsWith('.json');
    if (!looksLikeJson) {
      reject(new Error('Please select a .json file.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || !Array.isArray(parsed.completedLessons)) {
          throw new Error("this doesn't look like a Python Ledger export");
        }
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Could not read that file — ${err.message}.`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read the file.'));
    reader.readAsText(file);
  });
}

/**
 * Unions an imported lesson list into the current one, keyed by lesson id.
 * Import only ever fills gaps — a lesson already marked complete locally
 * is never overwritten or removed by an older/incomplete file.
 */
export function mergeCompleted(current, incoming) {
  const map = new Map(normalizeCompleted(current).map((entry) => [entry.id, entry]));
  for (const entry of normalizeCompleted(incoming)) {
    const existing = map.get(entry.id);
    if (!existing) {
      map.set(entry.id, entry);
    } else if (!existing.completedAt && entry.completedAt) {
      map.set(entry.id, entry);
    } else if (!existing.title && entry.title) {
      map.set(entry.id, { ...existing, title: entry.title });
    }
  }
  return Array.from(map.values());
}
