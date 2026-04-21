export type StudentPreferenceState = {
  favoriteModules: string[];
  favoriteLessons: string[];
};

const STORAGE_KEY = "cognispark.student.preferences.v1";

function uniqueIds(values: string[]): string[] {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

export function defaultStudentPreferenceState(): StudentPreferenceState {
  return {
    favoriteModules: [],
    favoriteLessons: [],
  };
}

export function normalizeStudentPreferenceState(payload: unknown): StudentPreferenceState {
  if (!payload || typeof payload !== "object") {
    return defaultStudentPreferenceState();
  }

  const record = payload as Record<string, unknown>;
  return {
    favoriteModules: Array.isArray(record.favoriteModules)
      ? uniqueIds(record.favoriteModules.filter((value): value is string => typeof value === "string"))
      : [],
    favoriteLessons: Array.isArray(record.favoriteLessons)
      ? uniqueIds(record.favoriteLessons.filter((value): value is string => typeof value === "string"))
      : [],
  };
}

export function readStudentPreferenceState(): StudentPreferenceState {
  if (typeof window === "undefined") {
    return defaultStudentPreferenceState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultStudentPreferenceState();
    }

    return normalizeStudentPreferenceState(JSON.parse(raw));
  } catch {
    return defaultStudentPreferenceState();
  }
}

export function writeStudentPreferenceState(nextState: StudentPreferenceState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeStudentPreferenceState(nextState)));
}

export function togglePreferenceId(currentIds: string[], id: string): string[] {
  const normalizedId = String(id || "").trim();
  if (!normalizedId) {
    return uniqueIds(currentIds);
  }

  const nextIds = uniqueIds(currentIds);
  return nextIds.includes(normalizedId)
    ? nextIds.filter((value) => value !== normalizedId)
    : [...nextIds, normalizedId];
}

export function moduleFavoriteKey(moduleId?: string | null): string {
  return `module:${String(moduleId || "").trim().toUpperCase()}`;
}

export function lessonFavoriteKey(moduleId?: string | null, lessonId?: string | null): string {
  return `lesson:${String(moduleId || "").trim().toUpperCase()}:${String(lessonId || "").trim().toUpperCase()}`;
}
