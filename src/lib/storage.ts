export interface WatchProgress {
  bookId: string;
  title: string;
  image: string | null;
  episodeId: string;
  episodeIndex: number;
  timestamp: number;
  duration: number;
  updatedAt: number;
}

const STORAGE_KEY = "mandarinflix_progress";

export function getWatchHistory(): WatchProgress[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveWatchProgress(progress: WatchProgress) {
  const history = getWatchHistory();
  const idx = history.findIndex((h) => h.bookId === progress.bookId);
  if (idx >= 0) {
    history[idx] = { ...progress, updatedAt: Date.now() };
  } else {
    history.unshift({ ...progress, updatedAt: Date.now() });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
}

export function getProgress(bookId: string): WatchProgress | undefined {
  return getWatchHistory().find((h) => h.bookId === bookId);
}
